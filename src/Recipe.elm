module Recipe exposing (..)

import Json.Decode as D exposing (field, float, int, list, maybe, string)
import NutritionItem exposing (NutritionItem)


type alias Recipe =
    { id : Int
    , name : String
    , total_servings : Float
    , items : List RecipeItem
    }


type alias RecipeItem =
    { servings : Maybe Float, nutrition_item : NutritionItem }


decoder : D.Decoder Recipe
decoder =
    D.map4 Recipe
        (field "id" int)
        (field "name" string)
        (field "total_servings" float)
        (field "recipe_items" (list recipeItemDecoder))


recipeItemDecoder : D.Decoder RecipeItem
recipeItemDecoder =
    D.map2 RecipeItem
        (field "servings" (maybe float))
        (field "nutrition_item" NutritionItem.decoder)


proteinGrams : Recipe -> Float
proteinGrams recipe =
    List.map (\item -> item.nutrition_item.protein_grams) recipe.items
        |> List.foldl (+) 0
        |> (*) recipe.total_servings


addedSugar : Recipe -> Float
addedSugar recipe =
    List.map (\item -> item.nutrition_item.added_sugars_grams) recipe.items
        |> List.foldl (+) 0
        |> (*) recipe.total_servings


totalFat : Recipe -> Float
totalFat recipe =
    List.map (\item -> item.nutrition_item.total_fat_grams) recipe.items
        |> List.foldl (+) 0
        |> (*) recipe.total_servings
