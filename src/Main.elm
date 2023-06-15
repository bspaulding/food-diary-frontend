module Main exposing (..)

import Browser exposing (Document)
import Browser.Navigation
import DiaryEntry exposing (DiaryEntry)
import Dict
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Html.Attributes exposing (class, href, src)
import Http
import Json.Decode as D
import Json.Encode as E
import Month
import Route exposing (Route)
import Task
import Time
import Url


type alias Model =
    { navigationKey : Browser.Navigation.Key
    , url : Url.Url
    , route : Route
    , zone : Time.Zone
    , entries : List DiaryEntry
    }


type Msg
    = EntriesReceived (Result Http.Error String)
    | NewTimeZone Time.Zone
    | LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url


getNewTimeZone : Cmd Msg
getNewTimeZone =
    Task.perform NewTimeZone Time.here


fetchEntries : Cmd Msg
fetchEntries =
    GraphQLRequest.make DiaryEntry.fetchEntriesQuery (Http.expectString EntriesReceived)


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
    ( { navigationKey = key, url = url, route = Route.parse url, zone = Time.utc, entries = [] }, Cmd.batch [ getNewTimeZone, fetchEntries ] )


subscriptions : Model -> Sub msg
subscriptions _ =
    Sub.none


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
            ( { model | url = url, route = Route.parse url }, Cmd.none )

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


globalNavigation =
    div [ class "flex space-x-4 mb-4" ]
        [ linkBtn "/diary_entry/new" "Add Entry"
        , linkBtn "/nutrition_item/new" "Add Item"
        , linkBtn "/recipe/new" "Add Recipe"
        ]


globalHeader =
    header [ class "fixed top-0 left-0 right-0 h-16 flex px-4 justify-start items-center bg-slate-50" ]
        [ h1 [ class "text-2xl font-bold" ] [ text "Food Diary" ]
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
         , p [ class "flex justify-between text-sm" ] [ text (String.fromFloat entry.servings ++ " " ++ pluralize entry.servings "serving" "servings" ++ " at " ++ DiaryEntry.timeOfDay zone entry), button [] [ text "Delete" ] ]
         ]
            ++ recipeTag
        )


pluralize : number -> String -> String -> String
pluralize x singular plural =
    if x == 1 then
        singular

    else
        plural
