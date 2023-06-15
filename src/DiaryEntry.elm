module DiaryEntry exposing (..)

import Dict exposing (Dict)
import Iso8601
import Json.Decode as D exposing (at, field, float, int, maybe)
import Month
import NutritionItem exposing (NutritionItem)
import Recipe exposing (Recipe)
import Time


type alias DiaryEntry =
    { id : Int
    , servings : Float
    , calories : Float
    , nutrition_item : Maybe NutritionItem
    , recipe : Maybe Recipe
    , consumed_at : Time.Posix
    }


title : DiaryEntry -> String
title entry =
    case entry.nutrition_item of
        Just item ->
            item.description

        Nothing ->
            case entry.recipe of
                Just recipe ->
                    recipe.name

                Nothing ->
                    "Untitled Item"


diaryEntryDecoder : D.Decoder DiaryEntry
diaryEntryDecoder =
    D.map6 DiaryEntry
        (field "id" int)
        (field "servings" float)
        (field "calories" float)
        (field "nutrition_item" (maybe NutritionItem.decoder))
        (field "recipe" (maybe Recipe.decoder))
        (field "consumed_at" Iso8601.decoder)


decodeEntriesResponse : String -> Result D.Error (List DiaryEntry)
decodeEntriesResponse res =
    D.decodeString (at [ "data", "food_diary_diary_entry" ] (D.list diaryEntryDecoder)) res


type alias DayOfYear =
    -- day, month, year
    ( Int, Int, Int )


dayOfYear : Time.Zone -> DiaryEntry -> DayOfYear
dayOfYear zone entry =
    ( Time.toYear zone entry.consumed_at, Month.toInt (Time.toMonth zone entry.consumed_at), Time.toDay zone entry.consumed_at )


groupByDay : Time.Zone -> List DiaryEntry -> Dict DayOfYear (List DiaryEntry)
groupByDay zone entries =
    let
        insertEntry : DiaryEntry -> Maybe (List DiaryEntry) -> Maybe (List DiaryEntry)
        insertEntry entry maybeL =
            case maybeL of
                Nothing ->
                    Just [ entry ]

                Just es ->
                    Just (es ++ [ entry ])

        reduce : DiaryEntry -> Dict DayOfYear (List DiaryEntry) -> Dict DayOfYear (List DiaryEntry)
        reduce entry b =
            Dict.update (dayOfYear zone entry) (insertEntry entry) b
    in
    List.foldl reduce Dict.empty entries


timeOfDay : Time.Zone -> DiaryEntry -> String
timeOfDay zone entry =
    let
        hr23 =
            Time.toHour zone entry.consumed_at

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
        ++ pad "0" 2 (String.fromInt (Time.toMinute zone entry.consumed_at))
        ++ meridian


pad : String -> Int -> String -> String
pad p l cs =
    List.foldl (\_ s -> p ++ s) cs (List.range 1 (l - String.length cs))


totalCalories : List DiaryEntry -> Int
totalCalories entries =
    List.map .calories entries
        |> List.foldl (+) 0
        |> floor


proteinGrams : DiaryEntry -> Float
proteinGrams entry =
    entry.servings
        * (case entry.nutrition_item of
            Just item ->
                item.protein_grams

            Nothing ->
                case entry.recipe of
                    Just recipe ->
                        Recipe.proteinGrams recipe

                    Nothing ->
                        -1
          )


addedSugar : DiaryEntry -> Float
addedSugar entry =
    entry.servings
        * (case entry.nutrition_item of
            Just item ->
                item.added_sugars_grams

            Nothing ->
                case entry.recipe of
                    Just recipe ->
                        Recipe.addedSugar recipe

                    Nothing ->
                        -1
          )


totalFat : DiaryEntry -> Float
totalFat entry =
    entry.servings
        * (case entry.nutrition_item of
            Just item ->
                item.total_fat_grams

            Nothing ->
                case entry.recipe of
                    Just recipe ->
                        Recipe.totalFat recipe

                    Nothing ->
                        -1
          )


totalProtein : List DiaryEntry -> Int
totalProtein entries =
    List.map proteinGrams entries
        |> List.foldl (+) 0
        |> floor


totalAddedSugar : List DiaryEntry -> Int
totalAddedSugar entries =
    List.map addedSugar entries
        |> List.foldl (+) 0
        |> floor


totalTotalFat : List DiaryEntry -> Int
totalTotalFat entries =
    List.map totalFat entries
        |> List.foldl (+) 0
        |> floor
