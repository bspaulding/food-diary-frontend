module NutritionItem exposing (..)

import Json.Decode as D exposing (field, float, int, list, maybe, string)
import Json.Decode.Pipeline exposing (hardcoded, optional, required)


type alias NutritionItem =
    { id : Int
    , description : String
    , calories : Float
    , total_fat_grams : Float
    , saturated_fat_grams : Float
    , trans_fat_grams : Float
    , polyunsaturated_fat_grams : Float
    , monounsaturated_fat_grams : Float
    , cholesterol_milligrams : Float
    , sodium_milligrams : Float
    , total_carbohydrate_grams : Float
    , dietary_fiber_grams : Float
    , total_sugars_grams : Float
    , added_sugars_grams : Float
    , protein_grams : Float
    }


decoder : D.Decoder NutritionItem
decoder =
    D.succeed NutritionItem
        |> required "id" int
        |> required "description" string
        |> required "calories" float
        |> required "total_fat_grams" float
        |> required "saturated_fat_grams" float
        |> required "trans_fat_grams" float
        |> required "polyunsaturated_fat_grams" float
        |> required "monounsaturated_fat_grams" float
        |> required "cholesterol_milligrams" float
        |> required "sodium_milligrams" float
        |> required "total_carbohydrate_grams" float
        |> required "dietary_fiber_grams" float
        |> required "total_sugars_grams" float
        |> required "added_sugars_grams" float
        |> required "protein_grams" float
