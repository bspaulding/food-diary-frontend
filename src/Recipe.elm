module Recipe exposing (..)

import GraphQLRequest exposing (GraphQLRequest)
import Json.Decode as D exposing (field, float, int, list, maybe, string)
import Json.Encode as E
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


fetchRecipeQuery : Int -> GraphQLRequest
fetchRecipeQuery id =
    { query = """
fragment ItemProps on food_diary_nutrition_item {
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

query GetRecipe($id: Int!) {
  food_diary_recipe_by_pk(id: $id) {
    id
    name
    total_servings
    recipe_items {
      servings
      nutrition_item {
        ...ItemProps
      }
    }
  }
}
    """
    , variables = E.object [ ( "id", E.int id ) ]
    }


decodeRecipeResponse : String -> Result D.Error Recipe
decodeRecipeResponse =
    D.decodeString (D.at [ "data", "food_diary_recipe_by_pk" ] decoder)
