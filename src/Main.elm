port module Main exposing (..)

import Browser exposing (Document)
import Browser.Navigation
import DiaryEntry exposing (CreateDiaryEntryInput(..), DiaryEntry, RecentEntry(..))
import Dict exposing (Dict)
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Html.Attributes exposing (class, href, property, src, step, style, type_, value)
import Html.Events exposing (onClick, onInput)
import Http
import HttpExtra as Http
import Json.Decode as D
import Json.Encode as E
import LoggableItem exposing (LoggableItem(..))
import Month
import NutritionItem exposing (NutritionItem)
import OAuth exposing (ResponseType(..))
import OAuth.AuthorizationCode.PKCE as OAuth
import OAuthConfiguration exposing (Configuration, UserInfo, cCODE_VERIFIER_SIZE, cSTATE_SIZE, convertBytes)
import Recipe exposing (Recipe)
import Route exposing (DiaryEntryCreateTab(..), Route)
import Set exposing (Set)
import Task
import Time
import Url exposing (Url)


port genRandomBytes : Int -> Cmd msg


port randomBytes : (List Int -> msg) -> Sub msg


type alias Model =
    { navigationKey : Browser.Navigation.Key
    , url : Url.Url
    , route : Route
    , zone : Time.Zone
    , entries : List DiaryEntry
    , recentEntries : List RecentEntry
    , activeLoggableItemIds : Set Int
    , activeLoggableServingsById : Dict Int Float
    , redirectUri : Url.Url
    , authFlow : OAuthFlow
    , accessToken : Maybe OAuth.Token
    }


type Msg
    = EntriesReceived (Result Http.Error String)
    | RecentItemsReceived (Result Http.Error String)
    | CreateDiaryEntryResponse (Result Http.Error String)
    | BeginLoggingItem LoggableItem
    | SubmitLoggingItem LoggableItem
    | CancelLoggingItem LoggableItem
    | UpdateLoggableServings LoggableItem String
    | NewTimeZone Time.Zone
    | LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | SignInRequested
    | GotRandomBytes (List Int)
    | GotAccessToken (Result Http.Error OAuth.AuthenticationSuccess)
    | UserInfoRequested
    | GotUserInfo (Result Http.Error UserInfo)
    | DeleteDiaryEntryRequested DiaryEntry
    | DeleteDiaryEntryResponse (Result Http.Error String)


type OAuthFlow
    = Idle
    | Authorized OAuth.AuthorizationCode OAuth.CodeVerifier
    | Authenticated OAuth.Token
    | Done UserInfo
    | Errored OAuthError


type OAuthError
    = ErrStateMismatch
    | ErrFailedToConvertBytes
    | ErrAuthorization OAuth.AuthorizationError
    | ErrAuthentication OAuth.AuthenticationError
    | ErrHTTPGetAccessToken
    | ErrHTTPGetUserInfo


getNewTimeZone : Cmd Msg
getNewTimeZone =
    Task.perform NewTimeZone Time.here


fetchEntries : OAuth.Token -> Cmd Msg
fetchEntries token =
    GraphQLRequest.make DiaryEntry.fetchEntriesQuery token (Http.expectString EntriesReceived)


fetchRecentItems : OAuth.Token -> Cmd Msg
fetchRecentItems token =
    GraphQLRequest.make DiaryEntry.recentlyLoggedItemsQuery token (Http.expectString RecentItemsReceived)


createDiaryEntry : OAuth.Token -> DiaryEntry.CreateDiaryEntryInput -> Cmd Msg
createDiaryEntry token input =
    GraphQLRequest.make (DiaryEntry.createDiaryEntryMutation input) token (Http.expectString CreateDiaryEntryResponse)


deleteDiaryEntry : OAuth.Token -> DiaryEntry -> Cmd Msg
deleteDiaryEntry token entry =
    GraphQLRequest.make (DiaryEntry.deleteDiaryEntryMutation entry) token (Http.expectString DeleteDiaryEntryResponse)


main : Program (Maybe (List Int)) Model Msg
main =
    Browser.application
        { init = Maybe.andThen convertBytes >> init
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


init : Maybe { state : String, codeVerifier : OAuth.CodeVerifier } -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init mflags origin navigationKey =
    let
        route =
            Route.parse origin

        redirectUri =
            { origin | path = "/auth/callback", query = Nothing, fragment = Nothing }

        clearUrl =
            Browser.Navigation.replaceUrl navigationKey (Url.toString redirectUri)

        emptyModel =
            { navigationKey = navigationKey
            , url = origin
            , route = route
            , zone = Time.utc
            , entries = []
            , recentEntries = []
            , activeLoggableItemIds = Set.empty
            , activeLoggableServingsById = Dict.empty
            , redirectUri = redirectUri
            , authFlow = Idle
            , accessToken = Nothing
            }
    in
    case OAuth.parseCode origin of
        OAuth.Empty ->
            ( emptyModel, Cmd.none )

        OAuth.Success { code, state } ->
            case mflags of
                Nothing ->
                    ( { emptyModel | authFlow = Errored ErrStateMismatch }, clearUrl )

                Just flags ->
                    if state /= Just flags.state then
                        ( { emptyModel | authFlow = Errored ErrStateMismatch }, clearUrl )

                    else
                        ( { emptyModel | authFlow = Authorized code flags.codeVerifier }, Cmd.batch [ getAccessToken OAuthConfiguration.configuration redirectUri code flags.codeVerifier, clearUrl ] )

        OAuth.Error error ->
            ( { emptyModel | authFlow = Errored <| ErrAuthorization error, redirectUri = redirectUri }
            , clearUrl
            )


getAccessToken : Configuration -> Url -> OAuth.AuthorizationCode -> OAuth.CodeVerifier -> Cmd Msg
getAccessToken { clientId, tokenEndpoint } redirectUri code codeVerifier =
    Http.request <|
        OAuth.makeTokenRequestWith OAuth.AuthorizationCode
            OAuth.defaultAuthenticationSuccessDecoder
            (Dict.fromList [ ( "audience", GraphQLRequest.audience ) ])
            GotAccessToken
            { credentials =
                { clientId = clientId
                , secret = Nothing
                }
            , code = code
            , codeVerifier = codeVerifier
            , url = tokenEndpoint
            , redirectUri = redirectUri
            }


subscriptions : Model -> Sub Msg
subscriptions =
    always <| randomBytes GotRandomBytes


cmdForRoute : Model -> Route -> Cmd Msg
cmdForRoute model route =
    case ( model.accessToken, route ) of
        ( Just token, Route.DiaryEntryList ) ->
            Cmd.batch [ getNewTimeZone, fetchEntries token ]

        ( Just token, Route.DiaryEntryCreate Suggestions ) ->
            Cmd.batch [ getNewTimeZone, fetchRecentItems token ]

        _ ->
            Cmd.none


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LinkClicked req ->
            case req of
                Browser.Internal url ->
                    ( model, Browser.Navigation.pushUrl model.navigationKey (Url.toString url) )

                Browser.External href ->
                    ( model, Browser.Navigation.load href )

        UrlChanged url ->
            let
                route =
                    Route.parse url
            in
            ( { model | url = url, route = route }, cmdForRoute model route )

        NewTimeZone zone ->
            ( { model | zone = zone }, Cmd.none )

        EntriesReceived (Err e) ->
            ( model, Cmd.none )

        EntriesReceived (Ok res) ->
            case DiaryEntry.decodeEntriesResponse res of
                Err err ->
                    Debug.log (D.errorToString err) ( model, Cmd.none )

                Ok entries ->
                    ( { model | entries = entries }, Cmd.none )

        RecentItemsReceived (Err e) ->
            ( model, Cmd.none )

        RecentItemsReceived (Ok res) ->
            case DiaryEntry.decodeRecentEntries res of
                Err err ->
                    Debug.log (D.errorToString err) ( model, Cmd.none )

                Ok entries ->
                    ( { model | recentEntries = entries }, Cmd.none )

        BeginLoggingItem loggable ->
            ( { model
                | activeLoggableItemIds = Set.insert (LoggableItem.id loggable) model.activeLoggableItemIds
                , activeLoggableServingsById = Dict.insert (LoggableItem.id loggable) 1 model.activeLoggableServingsById
              }
            , Cmd.none
            )

        SubmitLoggingItem loggable ->
            case model.accessToken of
                Just token ->
                    case Dict.get (LoggableItem.id loggable) model.activeLoggableServingsById of
                        Just servings ->
                            let
                                input =
                                    case loggable of
                                        LoggableItem item ->
                                            CreateDiaryEntryItemInput item.id servings

                                        LoggableRecipe recipe ->
                                            CreateDiaryEntryRecipeInput recipe.id servings
                            in
                            ( model, createDiaryEntry token input )

                        Nothing ->
                            ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        CancelLoggingItem loggable ->
            ( { model
                | activeLoggableItemIds = Set.remove (LoggableItem.id loggable) model.activeLoggableItemIds
                , activeLoggableServingsById = Dict.remove (LoggableItem.id loggable) model.activeLoggableServingsById
              }
            , Cmd.none
            )

        UpdateLoggableServings loggable servStr ->
            case String.toFloat servStr of
                Just servings ->
                    ( { model | activeLoggableServingsById = Dict.insert (LoggableItem.id loggable) servings model.activeLoggableServingsById }, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        CreateDiaryEntryResponse (Err err) ->
            Debug.log (Http.errorToString err) ( model, Cmd.none )

        CreateDiaryEntryResponse (Ok res) ->
            case DiaryEntry.decodeEntryCreatedResponse res of
                Err err ->
                    Debug.log (D.errorToString err) ( model, Cmd.none )

                Ok id ->
                    ( model, Cmd.none )

        DeleteDiaryEntryRequested entry ->
            case model.accessToken of
                Just token ->
                    ( model, deleteDiaryEntry token entry )

                _ ->
                    ( model, Cmd.none )

        DeleteDiaryEntryResponse (Err err) ->
            Debug.log (Http.errorToString err) ( model, Cmd.none )

        DeleteDiaryEntryResponse (Ok res) ->
            case DiaryEntry.decodeEntryDeletedResponse res of
                Err err ->
                    Debug.log (D.errorToString err) ( model, Cmd.none )

                Ok id ->
                    ( { model | entries = List.filter (\e -> e.id /= id) model.entries }, Cmd.none )

        SignInRequested ->
            signInRequested model

        GotRandomBytes bytes ->
            case model.authFlow of
                Idle ->
                    gotRandomBytes model bytes

                _ ->
                    ( model, Cmd.none )

        GotAccessToken res ->
            case model.authFlow of
                Authorized _ _ ->
                    gotAccessToken model res

                _ ->
                    ( model, Cmd.none )

        UserInfoRequested ->
            case model.authFlow of
                Authenticated token ->
                    userInfoRequested model token

                _ ->
                    ( model, Cmd.none )

        GotUserInfo res ->
            case model.authFlow of
                Authenticated _ ->
                    gotUserInfo model res

                _ ->
                    ( model, Cmd.none )


signInRequested : Model -> ( Model, Cmd Msg )
signInRequested model =
    ( { model | authFlow = Idle }
      -- We generate random bytes for both the state and the code verifier. First bytes are
      -- for the 'state', and remaining ones are used for the code verifier.
    , genRandomBytes (cSTATE_SIZE + cCODE_VERIFIER_SIZE)
    )


gotRandomBytes : Model -> List Int -> ( Model, Cmd Msg )
gotRandomBytes model bytes =
    case convertBytes bytes of
        Nothing ->
            ( { model | authFlow = Errored ErrFailedToConvertBytes }
            , Cmd.none
            )

        Just { state, codeVerifier } ->
            let
                authorization =
                    { clientId = OAuthConfiguration.configuration.clientId
                    , redirectUri = model.redirectUri
                    , scope = OAuthConfiguration.configuration.scope
                    , state = Just state
                    , codeChallenge = OAuth.mkCodeChallenge codeVerifier
                    , url = OAuthConfiguration.configuration.authorizationEndpoint
                    }
            in
            ( { model | authFlow = Idle }
            , authorization
                |> OAuth.makeAuthorizationUrlWith Code (Dict.fromList [ ( "audience", GraphQLRequest.audience ) ])
                |> Url.toString
                |> Browser.Navigation.load
            )


gotUserInfo : Model -> Result Http.Error UserInfo -> ( Model, Cmd Msg )
gotUserInfo model userInfoResponse =
    case userInfoResponse of
        Err _ ->
            ( { model | authFlow = Errored ErrHTTPGetUserInfo }
            , Cmd.none
            )

        Ok userInfo ->
            ( { model | authFlow = Done userInfo }
            , Browser.Navigation.pushUrl model.navigationKey "/"
            )


userInfoRequested : Model -> OAuth.Token -> ( Model, Cmd Msg )
userInfoRequested model token =
    ( { model | authFlow = Authenticated token }
    , getUserInfo OAuthConfiguration.configuration token
    )


getUserInfo : Configuration -> OAuth.Token -> Cmd Msg
getUserInfo { userInfoDecoder, userInfoEndpoint } token =
    Http.request
        { method = "GET"
        , body = Http.emptyBody
        , headers = OAuth.useToken token []
        , url = Url.toString userInfoEndpoint
        , expect = Http.expectJson GotUserInfo userInfoDecoder
        , timeout = Nothing
        , tracker = Nothing
        }


gotAccessToken : Model -> Result Http.Error OAuth.AuthenticationSuccess -> ( Model, Cmd Msg )
gotAccessToken model authenticationResponse =
    case authenticationResponse of
        Err (Http.BadBody body) ->
            case D.decodeString OAuth.defaultAuthenticationErrorDecoder body of
                Ok error ->
                    ( { model | authFlow = Errored <| ErrAuthentication error }
                    , Cmd.none
                    )

                _ ->
                    ( { model | authFlow = Errored ErrHTTPGetAccessToken }
                    , Cmd.none
                    )

        Err _ ->
            ( { model | authFlow = Errored ErrHTTPGetAccessToken }
            , Cmd.none
            )

        Ok { token } ->
            ( { model | authFlow = Authenticated token, accessToken = Just token }
            , Task.perform (always UserInfoRequested) (Task.succeed 0)
            )


view : Model -> Document Msg
view model =
    { title = "Food Diary", body = bodyView model }


flippedComparison a b =
    case compare a b of
        LT ->
            GT

        EQ ->
            EQ

        GT ->
            LT


sortByWith : (a -> comparable) -> (comparable -> comparable -> Order) -> List a -> List a
sortByWith f cmp =
    List.sortWith (\x y -> cmp (f x) (f y))


orderDays =
    sortByWith Tuple.first flippedComparison


layoutView : List (Html Msg) -> List (Html Msg)
layoutView children =
    [ div [ class "font-sans text-slate-800 flex flex-col bg-slate-50 relative px-4 pt-20" ]
        ([ globalHeader ] ++ children)
    ]


bodyView : Model -> List (Html Msg)
bodyView model =
    let
        routeView =
            case model.route of
                Route.DiaryEntryList ->
                    diaryEntries model

                Route.DiaryEntryCreate tab ->
                    diaryEntryCreate model tab

                Route.NotFound ->
                    div [] [ text "Oops! Something went wrong." ]

                _ ->
                    div [] [ text "TODO" ]
    in
    case model.authFlow of
        Done _ ->
            layoutView [ globalNavigation, routeView ]

        Authenticated _ ->
            layoutView [ globalNavigation, routeView ]

        _ ->
            layoutView [ btn SignInRequested "Log In" ]


diaryEntries model =
    ul [ class "mt-4" ] (List.map (diaryDay model.zone) (orderDays (Dict.toList (DiaryEntry.groupByDay model.zone model.entries))))


linkBtn url label =
    a [ href url, class "bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md" ] [ text label ]


btn f label =
    button [ onClick f, class "ml-2 bg-indigo-600 text-slate-50 py-1 px-3 text-lg rounded-md" ] [ text label ]


globalNavigation =
    div [ class "flex space-x-4 mb-4" ]
        [ linkBtn "/diary_entry/new" "Add Entry"
        , linkBtn "/nutrition_item/new" "Add Item"
        , linkBtn "/recipe/new" "Add Recipe"
        ]


globalHeader =
    header [ class "fixed top-0 left-0 right-0 h-16 flex px-4 justify-start items-center bg-slate-50" ]
        [ a [ href "/" ] [ h1 [ class "text-2xl font-bold" ] [ text "Food Diary" ] ]
        , div [ class "absolute right-2 w-12 h-12 " ]
            [ a [ href "/profile" ]
                [ img [ class "border border-slate-800 rounded-full", src "https://s.gravatar.com/avatar/49572474dbacea8cd772100342004113?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fbr.png" ] [] ]
            ]
        ]


diaryDay : Time.Zone -> ( DiaryEntry.DayOfYear, List DiaryEntry ) -> Html Msg
diaryDay zone ( ( y, m, d ), entries ) =
    li [ class "grid grid-cols-6 -ml-4 mb-6" ]
        [ div []
            [ div
                [ class "col-span-1 text-center text-xl font-semibold" ]
                [ p [ class "text-4xl" ] [ text (String.fromInt d) ]
                , p [ class "uppercase" ] [ text (Month.intToString m) ]
                ]
            , div
                [ class "text-center text-xl mt-4" ]
                [ p [] [ text (String.fromInt (DiaryEntry.totalCalories entries)) ]
                , p [ class "text-sm uppercase" ] [ text "kcal" ]
                ]
            ]
        , ul [ class "col-span-5 mb-6" ] (daySummaryRow entries :: List.map (entryItem zone) (List.sortBy (\e -> Time.posixToMillis e.consumed_at) entries))
        ]


summaryItem : String -> String -> Html Msg
summaryItem label value =
    div [ class "text-center text-xl mt-4" ]
        [ p [] [ text value ]
        , p [ class "text-sm uppercase" ] [ text label ]
        ]


daySummaryRow : List DiaryEntry -> Html Msg
daySummaryRow entries =
    li [ class "mb-4" ]
        [ div [ class "flex flex-row justify-around" ]
            [ summaryItem "Added Sugar" (String.fromInt (DiaryEntry.totalAddedSugar entries) ++ "g")
            , summaryItem "Protein" (String.fromInt (DiaryEntry.totalProtein entries) ++ "g")
            , summaryItem "Total Fat" (String.fromInt (DiaryEntry.totalTotalFat entries) ++ "g")
            ]
        ]


entryItem : Time.Zone -> DiaryEntry -> Html Msg
entryItem zone entry =
    let
        recipeTag =
            if entry.recipe /= Nothing then
                [ p [] [ span [ class "bg-slate-400 text-slate-50 px-2 py-1 rounded text-xs" ] [ text "RECIPE" ] ] ]

            else
                []
    in
    li [ class "mb-4" ]
        ([ p [ class "font-semibold" ] [ text (String.fromFloat entry.calories ++ " kcal, " ++ String.fromFloat (DiaryEntry.proteinGrams entry) ++ "g protein") ]
         , p [] [ a [ href ("/nutrition_item/" ++ String.fromInt entry.id) ] [ text (DiaryEntry.title entry) ] ]
         , p [ class "flex justify-between text-sm" ] [ text (String.fromFloat entry.servings ++ " " ++ pluralize entry.servings "serving" "servings" ++ " at " ++ timeOfDay zone entry.consumed_at), button [ onClick (DeleteDiaryEntryRequested entry) ] [ text "Delete" ] ]
         ]
            ++ recipeTag
        )


pluralize : number -> String -> String -> String
pluralize x singular plural =
    if x == 1 then
        singular

    else
        plural


diaryEntryCreate : Model -> DiaryEntryCreateTab -> Html Msg
diaryEntryCreate model tab =
    let
        activeClass =
            "bg-slate-500 text-slate-50 shadow-inner cursor-default"

        inactiveClass =
            "cursor-pointer"
    in
    div []
        [ ul [ class "flex flex-row justify-center mb-2" ]
            [ li
                [ class
                    ("px-3 py-1 bg-slate-200 border border-slate-500 rounded-l-full "
                        ++ (if tab == Suggestions then
                                activeClass

                            else
                                inactiveClass
                           )
                    )
                ]
                [ a [ href "/diary_entry/new/suggestions" ] [ text "Suggestions" ] ]
            , li
                [ class
                    ("px-3 py-1 bg-slate-200 border border-slate-500 rounded-r-full "
                        ++ (if tab == Search then
                                activeClass

                            else
                                inactiveClass
                           )
                    )
                ]
                [ a [ href "/diary_entry/new/search" ] [ text "Search" ] ]
            ]
        , div []
            (case tab of
                Suggestions ->
                    diaryEntryCreateSuggestions model

                Search ->
                    diaryEntryCreateSearch model
            )
        ]


diaryEntryCreateSuggestions : Model -> List (Html Msg)
diaryEntryCreateSuggestions model =
    let
        makeLoggable : RecentEntry -> ( List (Html Msg), LoggableItem )
        makeLoggable entry =
            ( [ loggedAtView model.zone entry ], LoggableItem.fromRecentEntry entry )

        loggables =
            List.map makeLoggable model.recentEntries
    in
    [ h2 [ class "text-lg font-semibold" ] [ text "Suggested Items" ]
    , ul [] (List.map (\( c, i ) -> loggableItem c i (Set.member (LoggableItem.id i) model.activeLoggableItemIds) (Maybe.withDefault 1 (Dict.get (LoggableItem.id i) model.activeLoggableServingsById))) loggables)
    ]


diaryEntryCreateSearch : Model -> List (Html Msg)
diaryEntryCreateSearch model =
    [ text "TODO Search" ]


timeOfDay : Time.Zone -> Time.Posix -> String
timeOfDay zone t =
    let
        pad : String -> Int -> String -> String
        pad p l cs =
            List.foldl (\_ s -> p ++ s) cs (List.range 1 (l - String.length cs))

        hr23 =
            Time.toHour zone t

        meridian =
            if hr23 >= 12 then
                "pm"

            else
                "am"

        hr12 =
            if hr23 > 12 then
                hr23 - 12

            else
                hr23
    in
    String.fromInt hr12
        ++ ":"
        ++ pad "0" 2 (String.fromInt (Time.toMinute zone t))
        ++ meridian


longDate : Time.Zone -> Time.Posix -> String
longDate zone t =
    Month.longName (Time.toMonth zone t)
        ++ " "
        ++ String.fromInt (Time.toDay zone t)
        ++ ", "
        ++ String.fromInt (Time.toYear zone t)


loggedAtView : Time.Zone -> RecentEntry -> Html Msg
loggedAtView zone entry =
    let
        consumed_at =
            case entry of
                RecentEntryItem _ _ t ->
                    t

                RecentEntryRecipe _ _ t ->
                    t
    in
    p [ class "text-xs ml-8 mb-2" ] [ text ("Logged at " ++ timeOfDay zone consumed_at ++ " on " ++ longDate zone consumed_at) ]


loggableItem : List (Html Msg) -> LoggableItem -> Bool -> Float -> Html Msg
loggableItem children loggable isActive servings =
    li []
        ([ div [ class "ml-7" ]
            ([ div [ class "flex items-center -ml-7" ]
                [ button
                    [ class "mr-1 text-3xl text-indigo-600 transition-transform"
                    , if isActive then
                        class "rotate-45"

                      else
                        class ""
                    , onClick
                        (if isActive then
                            CancelLoggingItem loggable

                         else
                            BeginLoggingItem loggable
                        )
                    ]
                    [ text "⊕" ]
                , p [] [ text (LoggableItem.title loggable) ]
                ]
             ]
                ++ (if isActive then
                        [ loggableInput loggable servings ]

                    else
                        []
                   )
            )
         ]
            ++ children
        )


loggableInput : LoggableItem -> Float -> Html Msg
loggableInput loggable servings =
    div [ class "ml-2 flex" ]
        [ input [ type_ "number", property "inputmode" (E.string "decimal"), step "0.1", style "min-width" "50px", value (String.fromFloat servings), onInput (UpdateLoggableServings loggable) ] []
        , btn (SubmitLoggingItem loggable) "Save"
        ]
