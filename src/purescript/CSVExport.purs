module CSVExport where

import Prelude

import Data.Array (concatMap)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Nullable (Nullable, toMaybe)
import Data.String (joinWith, trim)
import Data.Traversable (traverse)
import Effect (Effect)
import Effect.Uncurried (EffectFn1, EffectFn2, runEffectFn1, runEffectFn2)

-- Types for export entries
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

type RecipeItem =
  { servings :: Number
  , nutrition_item :: NutritionItemAttrs
  }

type Recipe =
  { name :: String
  , recipe_items :: Array RecipeItem
  }

type ExportEntry =
  { servings :: Number
  , consumed_at :: String
  , nutrition_item :: Maybe NutritionItemAttrs
  , recipe :: Maybe Recipe
  }

-- Header definition
header :: Array String
header =
  [ "Date"
  , "Time"
  , "Consumed At"
  , "Description"
  , "Servings"
  , "Calories"
  , "Total Fat (g)"
  , "Saturated Fat (g)"
  , "Trans Fat (g)"
  , "Polyunsaturated Fat (g)"
  , "Monounsaturated Fat (g)"
  , "Cholesterol (mg)"
  , "Sodium (mg)"
  , "Total Carbohydrate (g)"
  , "Dietary Fiber (g)"
  , "Total Sugars (g)"
  , "Added Sugars (g)"
  , "Protein (g)"
  ]

-- Header key map for path lookup
headerKeyMap :: String -> Array String
headerKeyMap key = case key of
  "Consumed At" -> ["consumed_at"]
  "Description" -> ["nutrition_item", "description"]
  "Servings" -> ["servings"]
  "Calories" -> ["nutrition_item", "calories"]
  "Total Fat (g)" -> ["nutrition_item", "total_fat_grams"]
  "Saturated Fat (g)" -> ["nutrition_item", "saturated_fat_grams"]
  "Trans Fat (g)" -> ["nutrition_item", "trans_fat_grams"]
  "Polyunsaturated Fat (g)" -> ["nutrition_item", "polyunsaturated_fat_grams"]
  "Monounsaturated Fat (g)" -> ["nutrition_item", "monounsaturated_fat_grams"]
  "Cholesterol (mg)" -> ["nutrition_item", "cholesterol_milligrams"]
  "Sodium (mg)" -> ["nutrition_item", "sodium_milligrams"]
  "Total Carbohydrate (g)" -> ["nutrition_item", "total_carbohydrate_grams"]
  "Dietary Fiber (g)" -> ["nutrition_item", "dietary_fiber_grams"]
  "Total Sugars (g)" -> ["nutrition_item", "total_sugars_grams"]
  "Added Sugars (g)" -> ["nutrition_item", "added_sugars_grams"]
  "Protein (g)" -> ["nutrition_item", "protein_grams"]
  _ -> []

-- FFI for date formatting
foreign import parseISOImpl :: EffectFn1 String (Nullable Number)
foreign import formatDateImpl :: EffectFn2 String Number String
foreign import formatTimeImpl :: EffectFn1 Number String
foreign import formatISOImpl :: EffectFn1 Number String

parseISO :: String -> Effect (Maybe Number)
parseISO dateStr = do
  nullableNumber <- runEffectFn1 parseISOImpl dateStr
  pure $ toMaybe nullableNumber

formatDate :: Number -> Effect String
formatDate timestamp = runEffectFn2 formatDateImpl "yyyy-MM-dd" timestamp

formatTime :: Number -> Effect String
formatTime timestamp = runEffectFn1 formatTimeImpl timestamp

formatISO :: Number -> Effect String
formatISO timestamp = runEffectFn1 formatISOImpl timestamp

-- Helper to get nested value from nutrition item
getPathFromNutritionItem :: Array String -> NutritionItemAttrs -> Maybe String
getPathFromNutritionItem path item = case path of
  ["nutrition_item", "description"] -> Just item.description
  ["nutrition_item", "calories"] -> Just $ show item.calories
  ["nutrition_item", "total_fat_grams"] -> Just $ show item.totalFatGrams
  ["nutrition_item", "saturated_fat_grams"] -> Just $ show item.saturatedFatGrams
  ["nutrition_item", "trans_fat_grams"] -> Just $ show item.transFatGrams
  ["nutrition_item", "polyunsaturated_fat_grams"] -> Just $ show item.polyunsaturatedFatGrams
  ["nutrition_item", "monounsaturated_fat_grams"] -> Just $ show item.monounsaturatedFatGrams
  ["nutrition_item", "cholesterol_milligrams"] -> Just $ show item.cholesterolMilligrams
  ["nutrition_item", "sodium_milligrams"] -> Just $ show item.sodiumMilligrams
  ["nutrition_item", "total_carbohydrate_grams"] -> Just $ show item.totalCarbohydrateGrams
  ["nutrition_item", "dietary_fiber_grams"] -> Just $ show item.dietaryFiberGrams
  ["nutrition_item", "total_sugars_grams"] -> Just $ show item.totalSugarsGrams
  ["nutrition_item", "added_sugars_grams"] -> Just $ show item.addedSugarsGrams
  ["nutrition_item", "protein_grams"] -> Just $ show item.proteinGrams
  _ -> Nothing

getPathFromRecipeItem :: Array String -> RecipeItem -> Maybe String
getPathFromRecipeItem path item = case path of
  ["nutrition_item", "description"] -> Just item.nutrition_item.description
  ["nutrition_item", "calories"] -> Just $ show item.nutrition_item.calories
  ["nutrition_item", "total_fat_grams"] -> Just $ show item.nutrition_item.totalFatGrams
  ["nutrition_item", "saturated_fat_grams"] -> Just $ show item.nutrition_item.saturatedFatGrams
  ["nutrition_item", "trans_fat_grams"] -> Just $ show item.nutrition_item.transFatGrams
  ["nutrition_item", "polyunsaturated_fat_grams"] -> Just $ show item.nutrition_item.polyunsaturatedFatGrams
  ["nutrition_item", "monounsaturated_fat_grams"] -> Just $ show item.nutrition_item.monounsaturatedFatGrams
  ["nutrition_item", "cholesterol_milligrams"] -> Just $ show item.nutrition_item.cholesterolMilligrams
  ["nutrition_item", "sodium_milligrams"] -> Just $ show item.nutrition_item.sodiumMilligrams
  ["nutrition_item", "total_carbohydrate_grams"] -> Just $ show item.nutrition_item.totalCarbohydrateGrams
  ["nutrition_item", "dietary_fiber_grams"] -> Just $ show item.nutrition_item.dietaryFiberGrams
  ["nutrition_item", "total_sugars_grams"] -> Just $ show item.nutrition_item.totalSugarsGrams
  ["nutrition_item", "added_sugars_grams"] -> Just $ show item.nutrition_item.addedSugarsGrams
  ["nutrition_item", "protein_grams"] -> Just $ show item.nutrition_item.proteinGrams
  _ -> Nothing

-- Convert rows to CSV string
stringsToCsv :: Array (Array String) -> String
stringsToCsv rows =
  trim $ joinWith "\n" $ map (\row -> joinWith "," $ map (\cell -> cell) row) rows

-- Main export function
entriesToCsv :: Array ExportEntry -> Effect String
entriesToCsv entries = do
  rows <- traverse processEntry entries
  pure $ stringsToCsv $ [header] <> (concatMap identity rows)
  where
    processEntry :: ExportEntry -> Effect (Array (Array String))
    processEntry entry = do
      consumedAtParsed <- parseISO entry.consumed_at
      case consumedAtParsed of
         Nothing -> pure []
         Just timestamp ->
          case entry.nutrition_item of
            Just nutritionItem -> do
              row <- buildRow timestamp entry.servings nutritionItem
              pure [row]
            Nothing -> case entry.recipe of
              Just recipe -> do
                rows <- traverse (buildRecipeRow entry timestamp recipe) recipe.recipe_items
                pure rows
              Nothing -> pure []

    buildRow :: Number -> Number -> NutritionItemAttrs -> Effect (Array String)
    buildRow timestamp servings nutritionItem = do
      dateStr <- formatDate timestamp
      timeStr <- formatTime timestamp
      isoStr <- formatISO timestamp
      pure $ map (\key -> case key of
        "Date" -> dateStr
        "Time" -> timeStr
        "Consumed At" -> isoStr
        "Servings" -> show servings
        _ -> fromMaybe "" $ getPathFromNutritionItem (headerKeyMap key) nutritionItem
      ) header

    buildRecipeRow :: ExportEntry -> Number -> Recipe -> RecipeItem -> Effect (Array String)
    buildRecipeRow entry timestamp recipe recipeItem = do
      dateStr <- formatDate timestamp
      timeStr <- formatTime timestamp
      isoStr <- formatISO timestamp
      let servings = entry.servings * recipeItem.servings
      let description = case getPathFromRecipeItem (headerKeyMap "Description") recipeItem of
            Just itemName -> recipe.name <> " - " <> itemName
            Nothing -> recipe.name
      pure $ map (\key -> case key of
        "Date" -> dateStr
        "Time" -> timeStr
        "Consumed At" -> isoStr
        "Servings" -> show servings
        "Description" -> description
        _ -> fromMaybe "" $ getPathFromRecipeItem (headerKeyMap key) recipeItem
      ) header

