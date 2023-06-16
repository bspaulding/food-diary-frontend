module Main exposing (..)

import Browser exposing (Document)
import Browser.Navigation
import DiaryEntry exposing (CreateDiaryEntryInput(..), DiaryEntry, RecentEntry(..))
import Dict exposing (Dict)
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Html.Attributes exposing (class, href, property, src, step, style, type_, value)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import LoggableItem exposing (LoggableItem(..))
import Month
import NutritionItem exposing (NutritionItem)
import Recipe exposing (Recipe)
import Route exposing (Route)
import Set exposing (Set)
import Task
import Time
import Url


type alias Model =
    { navigationKey : Browser.Navigation.Key
    , url : Url.Url
    , route : Route
    , zone : Time.Zone
    , entries : List DiaryEntry
    , recentEntries : List RecentEntry
    , activeLoggableItemIds : Set Int
    , activeLoggableServingsById : Dict Int Float
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


getNewTimeZone : Cmd Msg
getNewTimeZone =
    Task.perform NewTimeZone Time.here


fetchEntries : Cmd Msg
fetchEntries =
    GraphQLRequest.make DiaryEntry.fetchEntriesQuery (Http.expectString EntriesReceived)


fetchRecentItems : Cmd Msg
fetchRecentItems =
    GraphQLRequest.make DiaryEntry.recentlyLoggedItemsQuery (Http.expectString RecentItemsReceived)


createDiaryEntry : DiaryEntry.CreateDiaryEntryInput -> Cmd Msg
createDiaryEntry input =
    GraphQLRequest.make (DiaryEntry.createDiaryEntryMutation input) (Http.expectString CreateDiaryEntryResponse)


main =
    Browser.application
        { init = init
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


init : () -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init flags url key =
    let
        route =
            Route.parse url
    in
    ( { navigationKey = key
      , url = url
      , route = route
      , zone = Time.utc
      , entries = []
      , recentEntries = []
      , activeLoggableItemIds = Set.empty
      , activeLoggableServingsById = Dict.empty
      }
    , Cmd.batch [ getNewTimeZone, cmdForRoute route ]
    )


subscriptions : Model -> Sub msg
subscriptions _ =
    Sub.none


cmdForRoute : Route -> Cmd Msg
cmdForRoute route =
    case route of
        Route.DiaryEntryList ->
            fetchEntries

        Route.DiaryEntryCreate ->
            fetchRecentItems

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
            ( { model | url = url, route = route }, cmdForRoute route )

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
                    ( model, createDiaryEntry input )

                Nothing ->
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

        CreateDiaryEntryResponse (Err res) ->
            ( model, Cmd.none )

        CreateDiaryEntryResponse (Ok res) ->
            case DiaryEntry.decodeEntryCreatedResponse res of
                Err err ->
                    Debug.log (D.errorToString err) ( model, Cmd.none )

                Ok id ->
                    ( model, Cmd.none )


view : Model -> Document Msg
view model =
    { title = "Food Diary", body = body model }


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


body : Model -> List (Html Msg)
body model =
    [ div [ class "font-sans text-slate-800 flex flex-col bg-slate-50 relative px-4 pt-20" ]
        [ globalHeader
        , globalNavigation
        , case model.route of
            Route.DiaryEntryList ->
                diaryEntries model

            Route.DiaryEntryCreate ->
                diaryEntryCreate model

            Route.NotFound ->
                div [] [ text "Oops! Something went wrong." ]

            _ ->
                div [] [ text "TODO" ]
        ]
    ]


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
         , p [ class "flex justify-between text-sm" ] [ text (String.fromFloat entry.servings ++ " " ++ pluralize entry.servings "serving" "servings" ++ " at " ++ timeOfDay zone entry.consumed_at), button [] [ text "Delete" ] ]
         ]
            ++ recipeTag
        )


pluralize : number -> String -> String -> String
pluralize x singular plural =
    if x == 1 then
        singular

    else
        plural


diaryEntryCreate : Model -> Html Msg
diaryEntryCreate model =
    let
        makeLoggable : RecentEntry -> ( List (Html Msg), LoggableItem )
        makeLoggable entry =
            ( [ loggedAtView model.zone entry ], LoggableItem.fromRecentEntry entry )

        loggables =
            List.map makeLoggable model.recentEntries
    in
    div []
        [ ul [ class "flex flex-row justify-center mb-2" ]
            [ li [ class "px-3 py-1 bg-slate-200 border border-slate-500 rounded-l-full false bg-slate-500 text-slate-50 shadow-inner cursor-default false" ] [ text "Suggestions" ]
            , li [ class "px-3 py-1 bg-slate-200 border border-slate-500 false rounded-r-full false cursor-pointer" ] [ text "Search" ]
            ]
        , div []
            [ h2 [ class "text-lg font-semibold" ] [ text "Suggested Items" ]
            , ul [] (List.map (\( c, i ) -> loggableItem c i (Set.member (LoggableItem.id i) model.activeLoggableItemIds) (Maybe.withDefault 1 (Dict.get (LoggableItem.id i) model.activeLoggableServingsById))) loggables)
            ]
        ]


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
