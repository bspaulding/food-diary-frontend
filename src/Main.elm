port module Main exposing (..)

import Browser exposing (Document)
import Browser.Navigation
import DiaryEntry exposing (CreateDiaryEntryInput(..), DiaryEntry, RecentEntry(..))
import Dict exposing (Dict)
import Form
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Html.Attributes exposing (class, for, href, name, placeholder, property, src, step, style, type_, value)
import Html.Events exposing (onClick, onInput)
import Http
import HttpExtra as Http
import Json.Decode as D exposing (at, field, int, list, oneOf, string)
import Json.Encode as E
import LoggableItem exposing (LoggableItem(..), loggableItemSearch, loggableList)
import Month
import Msg exposing (Msg(..))
import NutritionItem exposing (NutritionItem)
import NutritionItemForm exposing (NutritionItemForm, nutritionItemForm)
import OAuth exposing (ResponseType(..))
import OAuth.AuthorizationCode.PKCE as OAuth
import OAuthConfiguration exposing (Configuration, UserInfo, cCODE_VERIFIER_SIZE, cSTATE_SIZE, convertBytes)
import Process
import Recipe exposing (Recipe, RecipeItem)
import RecipeForm exposing (RecipeForm, RecipeFormRecipeItem, recipeForm)
import Route exposing (DiaryEntryCreateTab(..), Route)
import Set exposing (Set)
import StringExtra exposing (pluralize)
import Task
import Time
import Url exposing (Url)
import Url.Parser as P exposing ((</>), (<?>))
import Url.Parser.Query as Q
import ViewHelpers exposing (btn)


port genRandomBytes : Int -> Cmd msg


type alias StoredCredentialsRequest =
    { expiresIn : Maybe Int, token : String, userInfo : UserInfo }


type alias StoredCredentials =
    { token : String, userInfo : UserInfo }


port storeUserCredentials : StoredCredentialsRequest -> Cmd msg


port randomBytes : (List Int -> msg) -> Sub msg


type AppError
    = HttpError Http.Error
    | DecodeError D.Error


type alias Model =
    { navigationKey : Browser.Navigation.Key
    , url : Url.Url
    , route : Route
    , zone : Time.Zone
    , error : Maybe AppError
    , entries : List DiaryEntry
    , recentEntries : List RecentEntry
    , activeLoggableItemIds : Set Int
    , activeLoggableServingsById : Dict Int Float
    , redirectUri : Url.Url
    , authFlow : OAuthFlow
    , accessToken : Maybe OAuth.Token
    , expiresIn : Maybe Int
    , entrySearchDebouncer : Debouncer String String
    , searchResults : List LoggableItem
    , loggableSearchQuery : String
    , form : Form.Model
    , nutritionItemCreateFormSubmitting : Bool
    , nutritionItemsById : Dict Int NutritionItem
    , recipeCreateFormSubmitting : Bool
    , newRecipeItems : List RecipeFormRecipeItem
    , recipesById : Dict Int Recipe
    }


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


type alias Debouncer a b =
    { function : a -> b
    , parameter : a
    , timeout : Float
    , tag : Int
    }


call : a -> Debouncer a b -> ( Debouncer a b, Cmd Msg )
call parameter debouncer =
    ( { debouncer | parameter = parameter, tag = debouncer.tag + 1 }
    , Process.sleep debouncer.timeout
        |> Task.perform (\_ -> DebouncerTimeout (debouncer.tag + 1))
    )


getNewTimeZone : Cmd Msg
getNewTimeZone =
    Task.perform NewTimeZone Time.here


fetchEntries : OAuth.Token -> Cmd Msg
fetchEntries token =
    GraphQLRequest.make DiaryEntry.fetchEntriesQuery token (Http.expectString EntriesReceived)


fetchRecentItems : OAuth.Token -> Cmd Msg
fetchRecentItems token =
    GraphQLRequest.make DiaryEntry.recentlyLoggedItemsQuery token (Http.expectString RecentItemsReceived)


createDiaryEntry : OAuth.Token -> DiaryEntry.CreateDiaryEntryInput -> LoggableItem -> Cmd Msg
createDiaryEntry token input loggable =
    GraphQLRequest.make (DiaryEntry.createDiaryEntryMutation input) token (Http.expectString (CreateDiaryEntryResponse loggable))


deleteDiaryEntry : OAuth.Token -> DiaryEntry -> Cmd Msg
deleteDiaryEntry token entry =
    GraphQLRequest.make (DiaryEntry.deleteDiaryEntryMutation entry) token (Http.expectString DeleteDiaryEntryResponse)


searchItemsAndRecipesQuery : String -> GraphQLRequest
searchItemsAndRecipesQuery search =
    { query =
        """
query SearchItemsAndRecipes($search: String!) {
  food_diary_search_nutrition_items(args: { search: $search }) {
    id,
    description
  }

  food_diary_search_recipes(args: { search: $search }) {
    id,
    name
  }
}
        """
    , variables = E.object [ ( "search", E.string search ) ]
    }


searchResultDecoder : (Int -> String -> LoggableItem) -> D.Decoder LoggableItem
searchResultDecoder constructor =
    D.map2 constructor
        (field "id" int)
        (oneOf [ field "name" string, field "description" string ])


decodeSearchItemsAndRecipesResponseDecoder : D.Decoder (List LoggableItem)
decodeSearchItemsAndRecipesResponseDecoder =
    D.map2 (++)
        (at [ "data", "food_diary_search_nutrition_items" ] (list (searchResultDecoder (\id title -> LoggableItem { id = id, title = title }))))
        (at [ "data", "food_diary_search_recipes" ] (list (searchResultDecoder (\id title -> LoggableRecipe { id = id, title = title }))))


decodeSearchItemsAndRecipesResponse : String -> Result D.Error (List LoggableItem)
decodeSearchItemsAndRecipesResponse s =
    D.decodeString decodeSearchItemsAndRecipesResponseDecoder s


searchItemsAndRecipes : OAuth.Token -> String -> Cmd Msg
searchItemsAndRecipes token query =
    GraphQLRequest.make (searchItemsAndRecipesQuery query) token (Http.expectString SearchItemsAndRecipesResponse)


createNutritionItem : OAuth.Token -> NutritionItemForm -> Cmd Msg
createNutritionItem token form =
    GraphQLRequest.make (NutritionItemForm.createNutritionItemQuery form) token (Http.expectString NutritionItemCreateResponse)


createRecipe : OAuth.Token -> RecipeForm -> Cmd Msg
createRecipe token form =
    GraphQLRequest.make (RecipeForm.createRecipeQuery form) token (Http.expectString RecipeCreateResponse)


fetchNutritionItem : OAuth.Token -> Int -> Cmd Msg
fetchNutritionItem token id =
    GraphQLRequest.make (NutritionItem.fetchNutritionItemQuery id) token (Http.expectString NutritionItemResponse)


fetchRecipe : OAuth.Token -> Int -> Cmd Msg
fetchRecipe token id =
    GraphQLRequest.make (Recipe.fetchRecipeQuery id) token (Http.expectString RecipeResponse)


main : Program { credentials : Maybe StoredCredentials, bytes : Maybe (List Int) } Model Msg
main =
    Browser.application
        { init = convertFlags >> init
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


convertFlags { credentials, bytes } =
    { credentials = credentials, stateAndVerifier = Maybe.andThen convertBytes bytes }


init : { credentials : Maybe StoredCredentials, stateAndVerifier : Maybe { state : String, codeVerifier : OAuth.CodeVerifier } } -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init flags origin navigationKey =
    let
        route =
            Route.parse origin

        redirectUri =
            { origin | path = "/auth/callback?path=" ++ origin.path, query = Nothing, fragment = Nothing }

        restorePath =
            P.parse (P.s "auth" </> P.s "callback" <?> Q.string "path") origin

        clearUrl =
            case restorePath of
                Just (Just path) ->
                    Browser.Navigation.replaceUrl navigationKey path

                _ ->
                    Browser.Navigation.replaceUrl navigationKey (Url.toString redirectUri)

        emptyModel =
            { navigationKey = navigationKey
            , url = origin
            , route = route
            , zone = Time.utc
            , error = Nothing
            , entries = []
            , recentEntries = []
            , activeLoggableItemIds = Set.empty
            , activeLoggableServingsById = Dict.empty
            , redirectUri = redirectUri
            , authFlow = Idle
            , accessToken = Nothing
            , expiresIn = Nothing
            , entrySearchDebouncer = { function = identity, parameter = "", timeout = 300.0, tag = 0 }
            , searchResults = []
            , loggableSearchQuery = ""
            , form = Form.init
            , nutritionItemCreateFormSubmitting = False
            , nutritionItemsById = Dict.empty
            , recipeCreateFormSubmitting = False
            , newRecipeItems = []
            , recipesById = Dict.empty
            }
    in
    case OAuth.parseCode origin of
        OAuth.Empty ->
            case flags.credentials of
                Nothing ->
                    ( emptyModel, Cmd.none )

                Just { token, userInfo } ->
                    let
                        newModel =
                            { emptyModel | accessToken = OAuth.tokenFromString token, authFlow = Done userInfo }
                    in
                    ( newModel, cmdForRoute newModel route )

        OAuth.Success { code, state } ->
            case flags.stateAndVerifier of
                Nothing ->
                    ( { emptyModel | authFlow = Errored ErrStateMismatch }, clearUrl )

                Just stateAndVerifier ->
                    if state /= Just stateAndVerifier.state then
                        ( { emptyModel | authFlow = Errored ErrStateMismatch }, clearUrl )

                    else
                        ( { emptyModel | authFlow = Authorized code stateAndVerifier.codeVerifier }, Cmd.batch [ getAccessToken OAuthConfiguration.configuration redirectUri code stateAndVerifier.codeVerifier, clearUrl ] )

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

        ( Just token, Route.NutritionItem id ) ->
            fetchNutritionItem token id

        ( Just token, Route.Recipe id ) ->
            fetchRecipe token id

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
                    ( { model | error = Just <| DecodeError err }, Cmd.none )

                Ok entries ->
                    ( { model | entries = entries }, Cmd.none )

        RecentItemsReceived (Err e) ->
            ( model, Cmd.none )

        RecentItemsReceived (Ok res) ->
            case DiaryEntry.decodeRecentEntries res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

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
                            ( model, createDiaryEntry token input loggable )

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

        CreateDiaryEntryResponse _ (Err err) ->
            ( { model | error = Just (HttpError err) }, Cmd.none )

        CreateDiaryEntryResponse loggable (Ok res) ->
            case DiaryEntry.decodeEntryCreatedResponse res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

                Ok id ->
                    ( { model
                        | activeLoggableItemIds = Set.remove (LoggableItem.id loggable) model.activeLoggableItemIds
                        , activeLoggableServingsById = Dict.remove (LoggableItem.id loggable) model.activeLoggableServingsById
                      }
                    , Cmd.none
                    )

        DeleteDiaryEntryRequested entry ->
            case model.accessToken of
                Just token ->
                    ( model, deleteDiaryEntry token entry )

                _ ->
                    ( model, Cmd.none )

        DeleteDiaryEntryResponse (Err err) ->
            ( { model | error = Just (HttpError err) }, Cmd.none )

        DeleteDiaryEntryResponse (Ok res) ->
            case DiaryEntry.decodeEntryDeletedResponse res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

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

        DebouncerTimeout tag ->
            case ( model.accessToken, tag == model.entrySearchDebouncer.tag ) of
                ( Just token, True ) ->
                    ( model, searchItemsAndRecipes token model.loggableSearchQuery )

                _ ->
                    ( model, Cmd.none )

        SearchItemsAndRecipesResponse (Err err) ->
            ( { model | error = Just (HttpError err) }, Cmd.none )

        SearchItemsAndRecipesResponse (Ok res) ->
            case decodeSearchItemsAndRecipesResponse res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

                Ok results ->
                    ( { model | searchResults = results }, Cmd.none )

        ItemAndRecipeSearchUpdated str ->
            let
                ( debouncer, cmd ) =
                    call str model.entrySearchDebouncer
            in
            ( { model
                | loggableSearchQuery = str
                , entrySearchDebouncer = debouncer
                , searchResults =
                    if String.length str == 0 then
                        []

                    else
                        model.searchResults
              }
            , if String.length str == 0 then
                Cmd.none

              else
                cmd
            )

        FormMsg formMsg ->
            let
                ( updatedFormModel, cmd ) =
                    Form.update formMsg model.form
            in
            ( { model | form = updatedFormModel }, cmd )

        OnSubmitNutritionItemCreateForm (Form.Invalid _ _) ->
            ( model, Cmd.none )

        OnSubmitNutritionItemCreateForm (Form.Valid data) ->
            case model.accessToken of
                Nothing ->
                    ( model, Cmd.none )

                Just token ->
                    ( { model | nutritionItemCreateFormSubmitting = True }, createNutritionItem token data )

        NutritionItemCreateResponse (Err err) ->
            ( { model | error = Just (HttpError err) }, Cmd.none )

        NutritionItemCreateResponse (Ok res) ->
            case NutritionItemForm.decodeNutritionItemCreateResponse res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

                Ok id ->
                    ( model, Browser.Navigation.pushUrl model.navigationKey ("/nutrition_item/" ++ String.fromInt id) )

        NutritionItemResponse (Err err) ->
            ( { model | error = Just (HttpError err) }, Cmd.none )

        NutritionItemResponse (Ok res) ->
            case NutritionItem.decodeNutritionItemResponse res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

                Ok nutritionItem ->
                    ( { model | nutritionItemsById = Dict.insert nutritionItem.id nutritionItem model.nutritionItemsById }, Cmd.none )

        OnSubmitRecipeCreateForm (Form.Invalid _ _) ->
            ( model, Cmd.none )

        OnSubmitRecipeCreateForm (Form.Valid data) ->
            case model.accessToken of
                Nothing ->
                    ( model, Cmd.none )

                Just token ->
                    ( { model | recipeCreateFormSubmitting = True }, createRecipe token data )

        RecipeCreateResponse (Err err) ->
            ( { model | error = Just (HttpError err) }, Cmd.none )

        RecipeCreateResponse (Ok res) ->
            case RecipeForm.decodeRecipeCreateResponse res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

                Ok id ->
                    ( model, Browser.Navigation.pushUrl model.navigationKey ("/recipe/" ++ String.fromInt id) )

        AddItemToRecipe loggable ->
            ( { model | newRecipeItems = model.newRecipeItems ++ [ { servings = 1.0, item = loggable } ] }, Cmd.none )

        RecipeResponse (Err err) ->
            ( { model | error = Just (HttpError err) }, Cmd.none )

        RecipeResponse (Ok res) ->
            case Recipe.decodeRecipeResponse res of
                Err err ->
                    ( { model | error = Just (DecodeError err) }, Cmd.none )

                Ok recipe ->
                    ( { model | recipesById = Dict.insert recipe.id recipe model.recipesById }, Cmd.none )


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
            , case model.accessToken of
                Nothing ->
                    Cmd.none

                Just token ->
                    storeUserCredentials { token = OAuth.tokenToString token, expiresIn = model.expiresIn, userInfo = userInfo }
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

        Ok { token, expiresIn } ->
            let
                newModel =
                    { model | authFlow = Authenticated token, accessToken = Just token, expiresIn = expiresIn }
            in
            ( newModel
            , Cmd.batch [ Task.perform (always UserInfoRequested) (Task.succeed 0), cmdForRoute newModel newModel.route ]
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


layoutView : ( Maybe UserInfo, Maybe AppError ) -> List (Html Msg) -> List (Html Msg)
layoutView ( muserInfo, mapperror ) children =
    [ div [ class "font-sans text-slate-800 flex flex-col bg-slate-50 relative px-4 pt-20" ]
        ([ globalHeader muserInfo ] ++ errorView mapperror ++ children)
    ]


errorView : Maybe AppError -> List (Html Msg)
errorView mapperror =
    case mapperror of
        Nothing ->
            []

        Just err ->
            [ div [ style "border" "1px solid red" ]
                [ case err of
                    DecodeError decodeError ->
                        text (D.errorToString decodeError)

                    HttpError httpError ->
                        text (Http.errorToString httpError)
                ]
            ]


bodyView : Model -> List (Html Msg)
bodyView model =
    let
        routeView =
            case ( model.authFlow, model.route ) of
                ( Done _, Route.DiaryEntryList ) ->
                    diaryEntries model

                ( Done _, Route.DiaryEntryCreate tab ) ->
                    diaryEntryCreate model tab

                ( Done userInfo, Route.Profile ) ->
                    profileView userInfo

                ( Done _, Route.NutritionItemCreate ) ->
                    nutritionItemForm
                        |> Form.renderHtml
                            { submitting = model.nutritionItemCreateFormSubmitting
                            , state = model.form
                            , toMsg = FormMsg
                            }
                            (Form.options "nutritionItemCreateForm"
                                |> Form.withOnSubmit (\{ parsed } -> OnSubmitNutritionItemCreateForm parsed)
                            )
                            []

                ( Done _, Route.NutritionItem id ) ->
                    nutritionItemShow model id

                ( Done _, Route.Recipe id ) ->
                    recipeShow model id

                ( Done _, Route.RecipeCreate ) ->
                    recipeForm (loggableModel model) loggableMsgsRecipeForm model.newRecipeItems
                        |> Form.renderHtml
                            { submitting = model.recipeCreateFormSubmitting
                            , state = model.form
                            , toMsg = FormMsg
                            }
                            (Form.options "recipeCreateForm"
                                |> Form.withOnSubmit (\{ parsed } -> OnSubmitRecipeCreateForm parsed)
                            )
                            []

                ( _, Route.NotFound ) ->
                    div [] [ text "Oops! Something went wrong." ]

                _ ->
                    div [] [ text "TODO" ]
    in
    case model.authFlow of
        Done userInfo ->
            layoutView ( Just userInfo, model.error ) [ globalNavigation, routeView ]

        Authenticated _ ->
            layoutView ( Nothing, model.error ) [ globalNavigation, routeView ]

        _ ->
            layoutView ( Nothing, model.error ) [ btn SignInRequested "Log In" ]


recipeShow : Model -> Int -> Html Msg
recipeShow model id =
    case Dict.get id model.recipesById of
        Nothing ->
            div [] [ text "Loading..." ]

        Just recipe ->
            recipeView model recipe


recipeView : Model -> Recipe -> Html Msg
recipeView model recipe =
    div []
        [ h1 [ class "my-1 text-lg font-semibold" ] [ text recipe.name ]
        , a [ href ("/recipe/" ++ String.fromInt recipe.id ++ "/edit") ] [ text "Edit Recipe" ]
        , p [] [ text (String.fromFloat recipe.total_servings ++ " Total Servings") ]
        , ul []
            (List.map
                (\recipeItem ->
                    li [ class "list-none my-1" ]
                        [ a [ href ("/nutrition_item/" ++ String.fromInt recipeItem.nutrition_item.id) ] [ text recipeItem.nutrition_item.description ]
                        , p [ class "text-sm" ] [ text (String.fromFloat (Maybe.withDefault 1.0 recipeItem.servings) ++ " servings") ]
                        ]
                )
                recipe.items
            )
        ]


nutritionItemShow : Model -> Int -> Html Msg
nutritionItemShow model id =
    case Dict.get id model.nutritionItemsById of
        Nothing ->
            div [] [ text "Loading..." ]

        Just item ->
            nutritionItemView model item


loggableModel model =
    { activeLoggableItemIds = model.activeLoggableItemIds
    , activeLoggableServingsById = model.activeLoggableServingsById
    , loggableSearchQuery = model.loggableSearchQuery
    , searchResults = model.searchResults
    }


loggableMsgs =
    { begin = BeginLoggingItem
    , cancel = CancelLoggingItem
    , submit = SubmitLoggingItem
    , updateServings = UpdateLoggableServings
    , queryChanged = ItemAndRecipeSearchUpdated
    }


loggableMsgsRecipeForm =
    { begin = AddItemToRecipe
    , cancel = CancelLoggingItem
    , submit = SubmitLoggingItem
    , updateServings = UpdateLoggableServings
    , queryChanged = ItemAndRecipeSearchUpdated
    }


nutritionItemView : Model -> NutritionItem -> Html Msg
nutritionItemView model item =
    div []
        [ h1 [ class "font-semibold text-2xl" ] [ text item.description ]
        , loggableList
            (loggableModel model)
            loggableMsgs
            [ ( [], LoggableItem { id = item.id, title = "Log It" } ) ]
        , div [ class "text-lg" ]
            [ p [ class "flex justify-between" ]
                [ span [ class "font-semibold" ] [ text "Calories" ]
                , span [] [ text (String.fromFloat item.calories) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "font-semibold" ] [ text "Total Fat (g)" ]
                , span [] [ text (String.fromFloat item.total_fat_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "ml-4" ] [ text "Saturated Fat (g)" ]
                , span [] [ text (String.fromFloat item.saturated_fat_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "ml-4" ] [ text "Trans Fat (g)" ]
                , span [] [ text (String.fromFloat item.trans_fat_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "ml-4" ] [ text "Polyunsaturated Fat (g)" ]
                , span [] [ text (String.fromFloat item.polyunsaturated_fat_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "ml-4" ] [ text "Monounsaturated Fat (g)" ]
                , span [] [ text (String.fromFloat item.monounsaturated_fat_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "font-semibold" ] [ text "Cholesterol (mg)" ]
                , span [] [ text (String.fromFloat item.cholesterol_milligrams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "font-semibold" ] [ text "Sodium (mg)" ]
                , span [] [ text (String.fromFloat item.sodium_milligrams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "font-semibold" ] [ text "Total Carbohydrate (g)" ]
                , span [] [ text (String.fromFloat item.total_carbohydrate_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "ml-4" ] [ text "Dietary Fiber (g)" ]
                , span [] [ text (String.fromFloat item.dietary_fiber_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "ml-4" ] [ text "Total Sugars (g)" ]
                , span [] [ text (String.fromFloat item.total_sugars_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "ml-4" ] [ text "Added Sugars (g)" ]
                , span [] [ text (String.fromFloat item.added_sugars_grams) ]
                ]
            , p [ class "flex justify-between" ]
                [ span [ class "font-semibold" ] [ text "Protein (g)" ]
                , span [] [ text (String.fromFloat item.protein_grams) ]
                ]
            ]
        ]


profileView : UserInfo -> Html Msg
profileView userInfo =
    div [ class "flex flex-col items-center" ]
        (div [ class "mb-4 max-w-xs" ] [ avatarView userInfo ]
            :: (case userInfo.nickname of
                    Nothing ->
                        []

                    Just nickname ->
                        [ p [ class "font-semibold text-lg" ] [ text nickname ] ]
               )
            ++ [ p [ class "text-lg" ] [ text userInfo.email ]
               , div [ class "mt-4 flex flex-col items-center" ]
                    [ a [ class "ml-3", href "/diary_entry/import" ] [ text "Import Entries" ]
                    , button [] [ text "Export Entries As CSV" ]
                    ]
               , button [ class "text-red-600 mt-4" ] [ text "Logout" ]
               ]
        )


diaryEntries model =
    ul [ class "mt-4" ] (List.map (diaryDay model.zone) (orderDays (Dict.toList (DiaryEntry.groupByDay model.zone model.entries))))


linkBtn url label =
    a [ href url, class "bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md" ] [ text label ]


globalNavigation =
    div [ class "flex space-x-4 mb-4" ]
        [ linkBtn "/diary_entry/new" "Add Entry"
        , linkBtn "/nutrition_item/new" "Add Item"
        , linkBtn "/recipe/new" "Add Recipe"
        ]


avatarView : UserInfo -> Html Msg
avatarView userInfo =
    img [ class "border border-slate-800 rounded-full", src userInfo.picture ] []


globalHeader : Maybe UserInfo -> Html Msg
globalHeader muserInfo =
    header [ class "fixed top-0 left-0 right-0 h-16 flex px-4 justify-start items-center bg-slate-50" ]
        [ a [ href "/" ] [ h1 [ class "text-2xl font-bold" ] [ text "Food Diary" ] ]
        , div [ class "absolute right-2 w-12 h-12 " ]
            (case muserInfo of
                Nothing ->
                    []

                Just userInfo ->
                    [ a [ href "/profile" ] [ avatarView userInfo ] ]
            )
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
         , p [] [ a [ href (DiaryEntry.itemUrl entry) ] [ text (DiaryEntry.title entry) ] ]
         , p [ class "flex justify-between text-sm" ] [ text (String.fromFloat entry.servings ++ " " ++ pluralize entry.servings "serving" "servings" ++ " at " ++ timeOfDay zone entry.consumed_at), button [ onClick (DeleteDiaryEntryRequested entry) ] [ text "Delete" ] ]
         ]
            ++ recipeTag
        )


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
    , loggableList (loggableModel model) loggableMsgs loggables
    ]


diaryEntryCreateSearch : Model -> List (Html Msg)
diaryEntryCreateSearch model =
    loggableItemSearch (loggableModel model) loggableMsgs


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
