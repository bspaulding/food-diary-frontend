module DiaryEntry exposing (..)

import Iso8601
import Json.Decode as D exposing (at, field, float, int, maybe)
import NutritionItem exposing (NutritionItem)
import Recipe exposing (Recipe)
import Time


type alias DiaryEntry =
    { id : Int
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
    D.map5 DiaryEntry
        (field "id" int)
        (field "calories" float)
        (field "nutrition_item" (maybe NutritionItem.decoder))
        (field "recipe" (maybe Recipe.decoder))
        (field "consumed_at" Iso8601.decoder)


decodeEntriesResponse : String -> Result D.Error (List DiaryEntry)
decodeEntriesResponse res =
    D.decodeString (at [ "data", "food_diary_diary_entry" ] (D.list diaryEntryDecoder)) res
