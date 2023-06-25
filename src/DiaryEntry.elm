module DiaryEntry exposing (..)

import Dict exposing (Dict)
import GraphQLRequest exposing (GraphQLRequest)
import Iso8601
import Json.Decode as D exposing (at, field, float, int, maybe, oneOf, string)
import Json.Encode as E
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


type RecentEntry
    = RecentEntryItem Int String Time.Posix
    | RecentEntryRecipe Int String Time.Posix


decodeRecentEntries : String -> Result D.Error (List RecentEntry)
decodeRecentEntries res =
    D.decodeString (at [ "data", "food_diary_diary_entry_recent" ] (D.list recentEntryDecoder)) res


recentItemDecoder : D.Decoder RecentEntry
recentItemDecoder =
    D.map3 RecentEntryItem
        (at [ "nutrition_item", "id" ] int)
        (at [ "nutrition_item", "description" ] string)
        (field "consumed_at" Iso8601.decoder)


recentRecipeDecoder =
    D.map3 RecentEntryRecipe
        (at [ "recipe", "id" ] int)
        (at [ "recipe", "name" ] string)
        (field "consumed_at" Iso8601.decoder)


recentEntryDecoder : D.Decoder RecentEntry
recentEntryDecoder =
    oneOf [ recentItemDecoder, recentRecipeDecoder ]


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



-- graphql queries


itemPropsFragment : String
itemPropsFragment =
    """
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
"""


recentlyLoggedItemsQuery : GraphQLRequest
recentlyLoggedItemsQuery =
    { query = itemPropsFragment ++ """
query GetRecentEntryItems {
  food_diary_diary_entry_recent(order_by: {consumed_at:desc}, limit: 10) {
    consumed_at
    nutrition_item {id, description}
    recipe { id, name }
  }
}
""", variables = E.object [] }


fetchEntriesQuery : GraphQLRequest
fetchEntriesQuery =
    { query = itemPropsFragment ++ """
query FetchDiaryEntries {
  food_diary_diary_entry(order_by: { consumed_at: desc }, limit: 50) {
    id
    servings
    calories
    consumed_at
    nutrition_item {
      ...ItemProps
    }
    recipe {
      id
      calories
      name
      total_servings
      recipe_items {
        nutrition_item {
          ...ItemProps
        }
        servings
      }
    }
  }
}

"""
    , variables = E.object []
    }


type CreateDiaryEntryInput
    = CreateDiaryEntryRecipeInput Int Float
    | CreateDiaryEntryItemInput Int Float


createDiaryEntryMutation : CreateDiaryEntryInput -> GraphQLRequest
createDiaryEntryMutation input =
    { query =
        """
mutation CreateDiaryEntry($entry: food_diary_diary_entry_insert_input!) {
  insert_food_diary_diary_entry_one(object: $entry) {
    id
  }
}
"""
    , variables =
        E.object
            [ ( "entry"
              , case input of
                    CreateDiaryEntryRecipeInput id servings ->
                        E.object [ ( "servings", E.float servings ), ( "recipe_id", E.int id ) ]

                    CreateDiaryEntryItemInput id servings ->
                        E.object [ ( "servings", E.float servings ), ( "nutrition_item_id", E.int id ) ]
              )
            ]
    }


decodeEntryCreatedResponse : String -> Result D.Error Int
decodeEntryCreatedResponse =
    D.decodeString (at [ "data", "insert_food_diary_diary_entry_one", "id" ] int)


deleteDiaryEntryMutation : DiaryEntry -> GraphQLRequest
deleteDiaryEntryMutation entry =
    { query = """
mutation DeleteEntry($id: Int!) {
  delete_food_diary_diary_entry_by_pk(id: $id) {
    id
  }
}
    """
    , variables = E.object [ ( "id", E.int entry.id ) ]
    }


decodeEntryDeletedResponse : String -> Result D.Error Int
decodeEntryDeletedResponse =
    D.decodeString (at [ "data", "delete_food_diary_diary_entry_by_pk", "id" ] int)



-- Returns a url to either the nutrition_item or the recipe that was logged


itemUrl : DiaryEntry -> String
itemUrl entry =
    case ( entry.nutrition_item, entry.recipe ) of
        ( Just item, _ ) ->
            "/nutrition_item/" ++ String.fromInt item.id

        ( _, Just recipe ) ->
            "/recipe/" ++ String.fromInt recipe.id

        _ ->
            ""
