module CSVImport where

import Prelude
import Data.Array (index, mapWithIndex, null, reverse, snoc, uncons, cons)
import Data.Either (Either(..))
import Data.Int (fromString, toNumber) as Int
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Number (fromString) as Number
import Data.String.CodeUnits (fromCharArray, toCharArray)
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Exception (try, throw)
import Effect.Uncurried (EffectFn1, runEffectFn1)
import Foreign.Object (Object)
import Foreign.Object as Object
import Data.Array (fromFoldable) as Array

-- Types
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

type NewDiaryEntry =
  { consumed_at :: String
  , servings :: Number
  , nutrition_item :: NutritionItemAttrs
  }

-- Custom CSV parser (no dependencies)
-- Handles quoted fields, escaped quotes, and standard CSV format
parseCSV :: String -> Either String (Array (Object String))
parseCSV csv = do
  case uncons $ parseCSVRows csv of
    Nothing -> Right []
    Just { head: header, tail: rows } ->
      Right $ map (rowToObject header) rows

-- Parse CSV string into rows (Array of Array of String)
parseCSVRows :: String -> Array (Array String)
parseCSVRows input = reverse $ go (toCharArray input) [] [] [] false
  where
    go :: Array Char -> Array (Array String) -> Array String -> Array Char -> Boolean -> Array (Array String)
    go [] rows currentRow currentField inQuotes =
      let
        field = fromCharArray $ reverse currentField
        row = reverse $ snoc currentRow field
      in
        if field == "" && null currentRow && null rows then
          []
        else
          reverse $ snoc rows row
    
    go chars rows currentRow currentField inQuotes =
      case uncons chars of
        Nothing -> go [] rows currentRow currentField inQuotes
        Just { head: c, tail: rest } ->
          case unit of
            _ | c == '"' && not inQuotes ->
                -- Start of quoted field
                go rest rows currentRow currentField true
            _ | c == '"' && inQuotes ->
                case uncons rest of
                  -- Check if next char is also a quote (escaped quote)
                  Just { head: '"', tail: rest' } -> 
                    go rest' rows currentRow (cons '"' currentField) true
                  -- Check if next char is comma or newline (end of quoted field)
                  Just { head: ',', tail: rest' } -> 
                    go rest' rows currentRow [] false
                  Just { head: '\n', tail: rest' } -> 
                    go rest' rows currentRow [] false
                  Just { head: '\r', tail: rest' } -> 
                    go rest' rows currentRow [] false
                  -- End of string
                  Nothing -> go [] rows currentRow [] false
                  -- Otherwise, treat as literal quote (RFC 4180 allows this)
                  _ -> go rest rows currentRow (cons '"' currentField) true
            _ | c == ',' && not inQuotes ->
                -- End of field
                let
                  field = fromCharArray $ reverse currentField
                in
                  go rest rows (snoc currentRow field) [] false
            _ | c == '\n' && not inQuotes ->
                -- End of row (Unix line ending)
                let
                  field = fromCharArray $ reverse currentField
                  row = reverse $ snoc currentRow field
                in
                  go rest (snoc rows row) [] [] false
            _ | c == '\r' && not inQuotes ->
                -- End of row (Windows or Mac line ending)
                let
                  field = fromCharArray $ reverse currentField
                  row = reverse $ snoc currentRow field
                  -- Skip \n if present (Windows line ending)
                  rest' = case uncons rest of
                    Just { head: '\n', tail: rest'' } -> rest''
                    _ -> rest
                in
                  go rest' (snoc rows row) [] [] false
            _ ->
                -- Regular character
                go rest rows currentRow (cons c currentField) inQuotes

rowToObject :: Array String -> Array String -> Object String
rowToObject header row =
  Object.fromFoldable $ mapWithIndex (\i cell -> Tuple (fromMaybe "" (index header i)) cell) row

-- FFI for date parsing
foreign import parseISOImpl :: EffectFn1 String (Maybe Number)

foreign import formatISOImpl :: EffectFn1 Number String

parseISO :: String -> Effect (Maybe Number)
parseISO dateStr = runEffectFn1 parseISOImpl dateStr

formatISO :: Number -> Effect String
formatISO timestamp = runEffectFn1 formatISOImpl timestamp

-- Number parsing helpers
parseInt :: String -> Number
parseInt value =
  fromMaybe 0.0 $ map Int.toNumber $ Int.fromString value

parseFloat :: String -> Number
parseFloat value =
  fromMaybe 0.0 $ Number.fromString value

-- Main conversion function
rowToEntry :: Object String -> Effect (Either String NewDiaryEntry)
rowToEntry row = do
  result <- try do
    consumedAtRaw <- case Object.lookup "Consumed At" row of
      Nothing -> throw "Missing 'Consumed At' field"
      Just val -> pure val
    
    consumedAtParsed <- parseISO consumedAtRaw
    consumedAtFormatted <- case consumedAtParsed of
      Nothing -> throw "Invalid Consumed At Date"
      Just timestamp -> formatISO timestamp
    
    let servings = parseFloat $ fromMaybe "0" $ Object.lookup "Servings" row
        description = fromMaybe "" $ Object.lookup "Description" row
        calories = parseInt $ fromMaybe "0" $ Object.lookup "Calories" row
        totalFatGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Total Fat (g)" row
        saturatedFatGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Saturated Fat (g)" row
        transFatGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Trans Fat (g)" row
        polyunsaturatedFatGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Polyunsaturated Fat (g)" row
        monounsaturatedFatGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Monounsaturated Fat (g)" row
        cholesterolMilligrams = parseFloat $ fromMaybe "0" $ Object.lookup "Cholesterol (mg)" row
        sodiumMilligrams = parseFloat $ fromMaybe "0" $ Object.lookup "Sodium (mg)" row
        totalCarbohydrateGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Total Carbohydrate (g)" row
        dietaryFiberGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Dietary Fiber (g)" row
        totalSugarsGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Total Sugars (g)" row
        addedSugarsGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Added Sugars (g)" row
        proteinGrams = parseFloat $ fromMaybe "0" $ Object.lookup "Protein (g)" row
    
    pure
      { consumed_at: consumedAtFormatted
      , servings: servings
      , nutrition_item:
          { description: description
          , calories: calories
          , totalFatGrams: totalFatGrams
          , saturatedFatGrams: saturatedFatGrams
          , transFatGrams: transFatGrams
          , polyunsaturatedFatGrams: polyunsaturatedFatGrams
          , monounsaturatedFatGrams: monounsaturatedFatGrams
          , cholesterolMilligrams: cholesterolMilligrams
          , sodiumMilligrams: sodiumMilligrams
          , totalCarbohydrateGrams: totalCarbohydrateGrams
          , dietaryFiberGrams: dietaryFiberGrams
          , totalSugarsGrams: totalSugarsGrams
          , addedSugarsGrams: addedSugarsGrams
          , proteinGrams: proteinGrams
          }
      }
  
  pure $ case result of
    Left err -> Left $ "Error: " <> show err
    Right entry -> Right entry

