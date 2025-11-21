module Api where

import Prelude

import Data.Argonaut (Json, toObject)
import Data.Argonaut.Decode (decodeJson, printJsonDecodeError)
import Data.Argonaut.Encode (class EncodeJson, encodeJson)
import Data.Bifunctor (lmap)
import Data.Either (Either(..))
import Data.Int (fromString) as Int
import Data.Maybe (Maybe(..))
import Data.Traversable (traverse)
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Aff (Aff, makeAff, nonCanceler)
import Effect.Exception (error)
import Effect.Uncurried (EffectFn1, EffectFn3, runEffectFn1, runEffectFn3)
import Foreign.Object (Object)
import Foreign.Object as Object

-- FFI imports
foreign import fetchQueryImpl :: EffectFn3 String String (Object Json) (Effect { success :: Boolean, data :: Maybe Json, error :: Maybe String })
foreign import camelToSnakeCaseImpl :: EffectFn1 String String
foreign import objectToSnakeCaseKeysImpl :: EffectFn1 (Object Json) (Object Json)

-- GraphQL Query Strings
getEntriesQuery :: String
getEntriesQuery = """
fragment Macros on food_diary_nutrition_item {
	total_fat_grams
  added_sugars_grams
	protein_grams
}

query GetEntries {
    food_diary_diary_entry(order_by: { day: desc, consumed_at: asc }) {
        id
        consumed_at
        calories
        servings
        nutrition_item { id, description, calories, ...Macros }
        recipe { id, name, calories, recipe_items { servings, nutrition_item { ...Macros } } }
    }
}
"""

searchItemsAndRecipesQuery :: String
searchItemsAndRecipesQuery = """
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

searchItemsOnlyQuery :: String
searchItemsOnlyQuery = """
query SearchItems($search: String!) {
  food_diary_search_nutrition_items(args: { search: $search }) {
    id,
    description
  }
}
"""

createNutritionItemMutation :: String
createNutritionItemMutation = """
mutation CreateNutritionItem($nutritionItem: food_diary_nutrition_item_insert_input!) {
	insert_food_diary_nutrition_item_one(object: $nutritionItem) {
    id
  }
}
"""

updateNutritionItemMutation :: String
updateNutritionItemMutation = """
mutation UpdateItem($id: Int!, $attrs: food_diary_nutrition_item_set_input!) {
  update_food_diary_nutrition_item_by_pk(pk_columns: {id: $id }, _set: $attrs) {
    id
  }
}
"""

getNutritionItemQuery :: String
getNutritionItemQuery = """
query GetNutritionItem($id: Int!) {
  food_diary_nutrition_item_by_pk(id: $id) {
    id,
    description
    calories
    totalFatGrams: total_fat_grams,
    saturatedFatGrams: saturated_fat_grams,
    transFatGrams: trans_fat_grams,
    polyunsaturatedFatGrams: polyunsaturated_fat_grams
    monounsaturatedFatGrams: monounsaturated_fat_grams
    cholesterolMilligrams: cholesterol_milligrams
    sodiumMilligrams: sodium_milligrams,
    totalCarbohydrateGrams: total_carbohydrate_grams
    dietaryFiberGrams: dietary_fiber_grams
    totalSugarsGrams: total_sugars_grams
    addedSugarsGrams: added_sugars_grams
    proteinGrams: protein_grams
  }
}
"""

getRecentEntriesQuery :: String
getRecentEntriesQuery = """
query GetRecentEntryItems {
  food_diary_diary_entry_recent(order_by: {consumed_at:desc}, limit: 10) {
    consumed_at
  	nutrition_item { id, description }
    recipe { id, name }
  }
}
"""

createDiaryEntryQuery :: String
createDiaryEntryQuery = """
mutation CreateDiaryEntry($entry: food_diary_diary_entry_insert_input!) {
  insert_food_diary_diary_entry_one(object: $entry) {
    id
  }
}
"""

deleteDiaryEntryQuery :: String
deleteDiaryEntryQuery = """
mutation DeleteEntry($id: Int!) {
  delete_food_diary_diary_entry_by_pk(id: $id) {
    id
  }
}
"""

createRecipeMutation :: String
createRecipeMutation = """
mutation CreateRecipe($input: food_diary_recipe_insert_input!) {
  insert_food_diary_recipe_one(object: $input) {
    id
  }
}
"""

updateRecipeMutation :: String
updateRecipeMutation = """
mutation UpdateRecipe($id: Int!, $attrs: food_diary_recipe_set_input!, $items: [food_diary_recipe_item_insert_input!]!) {
  update_food_diary_recipe_by_pk(pk_columns: {id: $id }, _set: $attrs) {
    id
  }
  delete_food_diary_recipe_item(where: { recipe_id: { _eq: $id } }) {
    affected_rows
  }
  insert_food_diary_recipe_item(objects: $items) {
    affected_rows
  }
}
"""

fetchRecipeQuery :: String
fetchRecipeQuery = """
query GetRecipe($id: Int!) {
  food_diary_recipe_by_pk(id: $id) {
    id,
    name,
    total_servings,
    recipe_items {
      servings
      nutrition_item {
        id,
        description
      }
    }
  }
}
"""

insertDiaryEntriesWithItemsMutation :: String
insertDiaryEntriesWithItemsMutation = """
mutation InsertDiaryEntriesWithNewItems($entries: [food_diary_diary_entry_insert_input!]!){
  insert_food_diary_diary_entry(objects: $entries) {
    affected_rows
  }
}
"""

exportEntriesQuery :: String
exportEntriesQuery = """
fragment nutritionItem on food_diary_nutrition_item {
  description
  calories
  total_fat_grams
  saturated_fat_grams
  trans_fat_grams
  polyunsaturated_fat_grams
  monounsaturated_fat_grams
  cholesterol_milligrams
  sodium_milligrams
  total_carbohydrate_grams
  dietary_fiber_grams
  total_sugars_grams
  added_sugars_grams
  protein_grams
}

query ExportEntries {
  food_diary_diary_entry {
    servings
    consumed_at
    nutrition_item {
      ...nutritionItem
    }
    recipe {
      name
      recipe_items {
				servings
        nutrition_item {
          ...nutritionItem
        }
      }
    }
  }
}
"""

getDiaryEntryQuery :: String
getDiaryEntryQuery = """
  fragment Macros on food_diary_nutrition_item {
    total_fat_grams
    added_sugars_grams
    protein_grams
  }

  query GetDiaryEntry($id: Int!) {
    food_diary_diary_entry_by_pk(id: $id) {
      id
      consumed_at
      calories
      servings
      nutrition_item { id, description, calories, ...Macros }
      recipe { id, name, calories, recipe_items { servings, nutrition_item { ...Macros } } }
    }
  }
"""

updateDiaryEntryMutation :: String
updateDiaryEntryMutation = """
mutation UpdateDiaryEntry($id: Int!, $attrs: food_diary_diary_entry_set_input!) {
  update_food_diary_diary_entry_by_pk(pk_columns: {id: $id }, _set: $attrs) {
    id
  }
}
"""

-- Type Definitions
type NutritionItemAttrs =
  { description :: String
  , calories :: Number
  , totalFatGrams :: Number
  , saturatedFatGrams :: Number
  , transFatGrams :: Number
  , polyunsaturatedFatGrams :: Number
  , monounsaturatedFatGrams :: Number
  , cholesterolMilligrams :: Number
  , sodiumMilligrams :: Number
  , totalCarbohydrateGrams :: Number
  , dietaryFiberGrams :: Number
  , totalSugarsGrams :: Number
  , addedSugarsGrams :: Number
  , proteinGrams :: Number
  }

type NutritionItem =
  { description :: String
  , calories :: Number
  , totalFatGrams :: Number
  , saturatedFatGrams :: Number
  , transFatGrams :: Number
  , polyunsaturatedFatGrams :: Number
  , monounsaturatedFatGrams :: Number
  , cholesterolMilligrams :: Number
  , sodiumMilligrams :: Number
  , totalCarbohydrateGrams :: Number
  , dietaryFiberGrams :: Number
  , totalSugarsGrams :: Number
  , addedSugarsGrams :: Number
  , proteinGrams :: Number
  , id :: Int
  }

type DiaryEntry =
  { id :: Int
  , day :: String
  , consumed_at :: String
  , servings :: Number
  , nutrition_item :: Maybe { id :: Int, description :: String, calories :: Number }
  , recipe :: Maybe { id :: Int, name :: String, calories :: Number }
  }

type GetEntriesQueryResponse =
  { data :: { food_diary_diary_entry :: Array DiaryEntry } }

type SearchItemsAndRecipesQueryResponse =
  { data ::
      { food_diary_search_nutrition_items :: Array { id :: Int, description :: String }
      , food_diary_search_recipes :: Array { id :: Int, name :: String }
      }
  }

type CreateDiaryEntryItemInput =
  { servings :: Number
  , nutrition_item_id :: Int
  }

type CreateDiaryEntryRecipeInput =
  { servings :: Number
  , recipe_id :: Int
  }

type RecipeAttrs =
  { name :: String
  , total_servings :: Number
  , recipe_items :: Array InsertRecipeItemInput
  }

type Recipe =
  { name :: String
  , total_servings :: Number
  , recipe_items :: Array InsertRecipeItemInput
  , id :: Int
  }

type InsertRecipeItemExistingItem =
  { servings :: Number
  , nutrition_item :: { id :: Int, description :: String }
  }

type InsertRecipeItemInput = InsertRecipeItemExistingItem

type NewDiaryEntry =
  { consumed_at :: String
  , servings :: Number
  , nutrition_item :: NutritionItemAttrs
  }

-- Helper Functions
camelToSnakeCase :: String -> Effect String
camelToSnakeCase = runEffectFn1 camelToSnakeCaseImpl

objectToSnakeCaseKeys :: Object Json -> Effect (Object Json)
objectToSnakeCaseKeys = runEffectFn1 objectToSnakeCaseKeysImpl

-- Convert a PureScript record to Object Json for GraphQL variables
recordToJsonObject :: forall a. EncodeJson a => a -> Object Json
recordToJsonObject record = 
  case toObject (encodeJson record) of
    Just obj -> obj
    Nothing -> Object.empty

-- Main fetch function
fetchQuery :: String -> String -> Object Json -> Aff Json
fetchQuery accessToken query variables = makeAff \callback -> do
  resultEffect <- runEffectFn3 fetchQueryImpl accessToken query variables
  result <- resultEffect
  case result.success, result.data of
    true, Just jsonData -> do
      callback (Right jsonData)
      pure nonCanceler
    true, Nothing -> do
      callback (Left (error "No data returned"))
      pure nonCanceler
    false, _ -> do
      let errorMsg = case result.error of
            Just err -> err
            Nothing -> "Unknown error"
      callback (Left (error errorMsg))
      pure nonCanceler

-- API Functions
fetchEntries :: String -> Aff GetEntriesQueryResponse
fetchEntries accessToken = do
  json <- fetchQuery accessToken getEntriesQuery Object.empty
  case lmap printJsonDecodeError (decodeJson json) of
    Right response -> pure response
    Left err -> makeAff \callback -> do
      callback (Left (error ("Failed to decode response: " <> err)))
      pure nonCanceler

searchItemsAndRecipes :: String -> String -> Aff SearchItemsAndRecipesQueryResponse
searchItemsAndRecipes accessToken search = do
  let variables = Object.singleton "search" (encodeJson search)
  json <- fetchQuery accessToken searchItemsAndRecipesQuery variables
  case lmap printJsonDecodeError (decodeJson json) of
    Right response -> pure response
    Left err -> makeAff \callback -> do
      callback (Left (error ("Failed to decode response: " <> err)))
      pure nonCanceler

searchItemsOnly :: String -> String -> Aff { data :: { food_diary_search_nutrition_items :: Array { id :: Int, description :: String } } }
searchItemsOnly accessToken search = do
  let variables = Object.singleton "search" (encodeJson search)
  json <- fetchQuery accessToken searchItemsOnlyQuery variables
  case lmap printJsonDecodeError (decodeJson json) of
    Right response -> pure response
    Left err -> makeAff \callback -> do
      callback (Left (error ("Failed to decode response: " <> err)))
      pure nonCanceler

createNutritionItem :: String -> NutritionItem -> Aff Json
createNutritionItem accessToken item = do
  -- Convert item to snake_case keys
  itemObj <- makeAff \callback -> do
    let itemJsonObj = recordToJsonObject item
    result <- objectToSnakeCaseKeys itemJsonObj
    callback (Right result)
    pure nonCanceler
  let variables = Object.singleton "nutritionItem" (encodeJson itemObj)
  fetchQuery accessToken createNutritionItemMutation variables

updateNutritionItem :: String -> NutritionItem -> Aff Json
updateNutritionItem accessToken item = do
  -- Convert item to snake_case keys (excluding id)
  itemAttrsJson <- makeAff \callback -> do
    let attrs = { description: item.description
                , calories: item.calories
                , totalFatGrams: item.totalFatGrams
                , saturatedFatGrams: item.saturatedFatGrams
                , transFatGrams: item.transFatGrams
                , polyunsaturatedFatGrams: item.polyunsaturatedFatGrams
                , monounsaturatedFatGrams: item.monounsaturatedFatGrams
                , cholesterolMilligrams: item.cholesterolMilligrams
                , sodiumMilligrams: item.sodiumMilligrams
                , totalCarbohydrateGrams: item.totalCarbohydrateGrams
                , dietaryFiberGrams: item.dietaryFiberGrams
                , totalSugarsGrams: item.totalSugarsGrams
                , addedSugarsGrams: item.addedSugarsGrams
                , proteinGrams: item.proteinGrams
                }
    attrsObj <- recordToJsonObject attrs # objectToSnakeCaseKeys
    callback (Right attrsObj)
    pure nonCanceler
  let variables = Object.insert "id" (encodeJson item.id) 
        $ Object.singleton "attrs" (encodeJson itemAttrsJson)
  fetchQuery accessToken updateNutritionItemMutation variables

fetchNutritionItem :: String -> Int -> Aff Json
fetchNutritionItem accessToken id = do
  let variables = Object.singleton "id" (encodeJson id)
  fetchQuery accessToken getNutritionItemQuery variables

fetchRecentEntries :: String -> Aff Json
fetchRecentEntries accessToken = 
  fetchQuery accessToken getRecentEntriesQuery Object.empty

createDiaryEntry :: String -> Either CreateDiaryEntryItemInput CreateDiaryEntryRecipeInput -> Aff Json
createDiaryEntry accessToken entry = do
  let entryInput = case entry of
        Left itemInput -> encodeJson itemInput
        Right recipeInput -> encodeJson recipeInput
  let variables = Object.singleton "entry" entryInput
  fetchQuery accessToken createDiaryEntryQuery variables

deleteDiaryEntry :: String -> Int -> Aff Json
deleteDiaryEntry accessToken id = do
  let variables = Object.singleton "id" (encodeJson id)
  fetchQuery accessToken deleteDiaryEntryQuery variables

transformRecipeInput :: RecipeAttrs -> Object Json
transformRecipeInput formInput = 
  let recipeItems = map (\item -> 
        Object.fromFoldable
          [ Tuple "servings" (encodeJson item.servings)
          , Tuple "nutrition_item_id" (encodeJson item.nutrition_item.id)
          ]
      ) formInput.recipe_items
  in Object.fromFoldable
      [ Tuple "name" (encodeJson formInput.name)
      , Tuple "total_servings" (encodeJson formInput.total_servings)
      , Tuple "recipe_items" (encodeJson { data: recipeItems })
      ]

createRecipe :: String -> RecipeAttrs -> Aff Json
createRecipe accessToken formInput = do
  let input = transformRecipeInput formInput
  let variables = Object.singleton "input" (encodeJson input)
  fetchQuery accessToken createRecipeMutation variables

updateRecipe :: String -> Recipe -> Aff Json
updateRecipe accessToken recipe = do
  let attrs = { name: recipe.name
              , total_servings: recipe.total_servings
              , recipe_items: recipe.recipe_items
              }
  let transformed = transformRecipeInput attrs
  let recipeAttrs = case Object.lookup "recipe_items" transformed of
        Just _ -> Object.delete "recipe_items" transformed
        Nothing -> transformed
  let recipeItems = case Object.lookup "recipe_items" transformed of
        Just items -> case lmap printJsonDecodeError (decodeJson items) of
          Right json -> case lmap printJsonDecodeError (decodeJson json :: Either _ { data :: Array (Object Json) }) of
            Right { data: itemsArray } -> itemsArray
            Left _ -> []
          Left _ -> []
        Nothing -> []
  let recipeItemsInput = map (\item -> 
        Object.insert "recipe_id" (encodeJson recipe.id) item
      ) recipeItems
  let variables = Object.fromFoldable
        [ Tuple "id" (encodeJson recipe.id)
        , Tuple "attrs" (encodeJson recipeAttrs)
        , Tuple "items" (encodeJson recipeItemsInput)
        ]
  fetchQuery accessToken updateRecipeMutation variables

fetchRecipe :: String -> Int -> Aff Json
fetchRecipe accessToken id = do
  let variables = Object.singleton "id" (encodeJson id)
  fetchQuery accessToken fetchRecipeQuery variables

insertDiaryEntries :: String -> Array NewDiaryEntry -> Aff Json
insertDiaryEntries accessToken entries = do
  -- Convert entries, transforming nutrition_item to snake_case
  entriesArray <- traverse (\entry -> do
      nutritionItemJson <- pure $ recordToJsonObject entry.nutrition_item
      nutritionItemSnake <- makeAff \callback -> do
        result <- objectToSnakeCaseKeys nutritionItemJson
        callback (Right result)
        pure nonCanceler
      pure $ Object.fromFoldable
        [ Tuple "consumed_at" (encodeJson entry.consumed_at)
        , Tuple "servings" (encodeJson entry.servings)
        , Tuple "nutrition_item" (encodeJson { data: nutritionItemSnake })
        ]
    ) entries
  let entriesJson = encodeJson entriesArray
  let variables = Object.singleton "entries" entriesJson
  fetchQuery accessToken insertDiaryEntriesWithItemsMutation variables

fetchExportEntries :: String -> Aff Json
fetchExportEntries accessToken = 
  fetchQuery accessToken exportEntriesQuery Object.empty

getDiaryEntry :: String -> Either Int String -> Aff Json
getDiaryEntry accessToken id = do
  let idValue = case id of
        Left intId -> intId
        Right strId -> case Int.fromString strId of
          Just intId -> intId
          Nothing -> 0
  let variables = Object.singleton "id" (encodeJson idValue)
  fetchQuery accessToken getDiaryEntryQuery variables

updateDiaryEntry :: String -> { id :: Int, servings :: Number, consumedAt :: String } -> Aff Json
updateDiaryEntry accessToken entry = do
  entryAttrsJson <- makeAff \callback -> do
    let attrs = { servings: entry.servings, consumed_at: entry.consumedAt }
    attrsObj <- recordToJsonObject attrs # objectToSnakeCaseKeys
    callback (Right attrsObj)
    pure nonCanceler
  let variables = Object.fromFoldable
        [ Tuple "id" (encodeJson entry.id)
        , Tuple "attrs" (encodeJson entryAttrsJson)
        ]
  fetchQuery accessToken updateDiaryEntryMutation variables

