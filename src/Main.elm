module Main exposing (..)

import Browser exposing (Document)
import DiaryEntry exposing (DiaryEntry)
import Dict
import GraphQLRequest exposing (GraphQLRequest)
import Html exposing (..)
import Html.Attributes exposing (class, href, src)
import Http
import Json.Decode as D
import Json.Encode as E
import Month
import Task
import Time


type alias Model =
    { zone : Time.Zone
    , entries : List DiaryEntry
    }


type Msg
    = EntriesReceived (Result Http.Error String)
    | NewTimeZone Time.Zone


getNewTimeZone : Cmd Msg
getNewTimeZone =
    Task.perform NewTimeZone Time.here


fetchEntriesQuery : GraphQLRequest
fetchEntriesQuery =
    { query = """
query FetchDiaryEntries {
  food_diary_diary_entry(order_by: { consumed_at: desc }, limit: 50) {
    id
    servings
    calories
    consumed_at
    nutrition_item {
      id
      added_sugars_grams
      calories
      cholesterol_milligrams
      description
      dietary_fiber_grams
      monounsaturated_fat_grams
      polyunsaturated_fat_grams
      protein_grams
      saturated_fat_grams
      sodium_milligrams
      total_carbohydrate_grams
      trans_fat_grams
      total_sugars_grams
      total_fat_grams
    }
    recipe {
      id
      calories
      name
      total_servings
      recipe_items {
        nutrition_item {
          added_sugars_grams
          calories
          cholesterol_milligrams
          description
          dietary_fiber_grams
          id
          monounsaturated_fat_grams
          polyunsaturated_fat_grams
          protein_grams
          saturated_fat_grams
          sodium_milligrams
          total_carbohydrate_grams
          total_fat_grams
          total_sugars_grams
          trans_fat_grams
        }
        servings
      }
    }
  }
}

"""
    , variables = E.object []
    }


fetchEntries : Cmd Msg
fetchEntries =
    GraphQLRequest.make fetchEntriesQuery (Http.expectString EntriesReceived)


main =
    Browser.document { init = init, view = view, update = update, subscriptions = subscriptions }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { zone = Time.utc, entries = [] }, Cmd.batch [ getNewTimeZone, fetchEntries ] )


subscriptions : Model -> Sub msg
subscriptions _ =
    Sub.none


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
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
        , ul [ class "mt-4" ] (List.map (diaryDay model.zone) (orderDays (Dict.toList (DiaryEntry.groupByDay model.zone model.entries))))
        ]
    ]


btn href label =
    button [ class "bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md" ] [ text label ]


globalNavigation =
    div [ class "flex space-x-4 mb-4" ]
        [ btn "/diary_entry/new" "Add New Entry"
        , btn "/nutrition_item/new" "Add Item"
        , btn "/recipe/new" "Add Recipe"
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
