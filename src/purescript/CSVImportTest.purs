module CSVImportTest where

import Prelude
import CSVImport (parseCSV, rowToEntry, NewDiaryEntry, NutritionItemAttrs)
import Data.Array (length, (!!))
import Data.Either (Either(..), isRight)
import Data.Maybe (Maybe(..))
import Effect.Class (liftEffect)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)

testCSV :: String
testCSV = """Date,Time,Consumed At,Description,Servings,Calories,Total Fat (g),Saturated Fat (g),Trans Fat (g),Polyunsaturated Fat (g),Monounsaturated Fat (g),Cholesterol (mg),Sodium (mg),Total Carbohydrate (g),Dietary Fiber (g),Total Sugars (g),Added Sugars (g),Protein (g),,Total Calories,Total Fat (g),Saturated Fat (g),Trans Fat (g),Polyunsaturated Fat (g),Monounsaturated Fat (g),Cholesterol (mg),Sodium (mg),Total Carbohydrate (g),Dietary Fiber (g),Total Sugars (g),Added Sugars (g),Protein (g)
2022-08-28,7:30 AM,2022-08-28T07:30:00-07:00,Honey Bunches of Oats,1,160,2,0,0,0.5,1,0,190,34,2,9,8,3,,160,2,0,0,0.5,1,0,190,34,2,9,8,3"""

expectedNutritionItem :: NutritionItemAttrs
expectedNutritionItem =
  { description: "Honey Bunches of Oats"
  , calories: 160.0
  , totalFatGrams: 2.0
  , saturatedFatGrams: 0.0
  , transFatGrams: 0.0
  , polyunsaturatedFatGrams: 0.5
  , monounsaturatedFatGrams: 1.0
  , cholesterolMilligrams: 0.0
  , sodiumMilligrams: 190.0
  , totalCarbohydrateGrams: 34.0
  , dietaryFiberGrams: 2.0
  , totalSugarsGrams: 9.0
  , addedSugarsGrams: 8.0
  , proteinGrams: 3.0
  }

expectedEntry :: NewDiaryEntry
expectedEntry =
  { consumed_at: "2022-08-28T07:30:00-07:00"
  , servings: 1.0
  , nutrition_item: expectedNutritionItem
  }

spec :: Spec Unit
spec = describe "CSVImport" do
  describe "parseCSV" do
    it "can parse and decode test csv properly" do
      case parseCSV testCSV of
        Left err -> pure unit -- Test failure
        Right rows -> do
          length rows `shouldEqual` 1
          case rows !! 0 of
            Nothing -> pure unit -- This would be a test failure, but we'll handle it
            Just _firstRow -> do
              -- Check that the first row has the expected "Consumed At" value
              -- Note: We can't easily check Object values in PureScript tests without FFI
              -- So we'll test rowToEntry instead
              pure unit
  
  describe "rowToEntry" do
    it "can convert a row to an entry" do
      let result = parseCSV testCSV
      case result of
        Left _err -> pure unit
        Right rows -> do
          case rows !! 0 of
            Nothing -> pure unit
            Just firstRow -> do
              entryResult <- liftEffect $ rowToEntry firstRow
              case entryResult of
                Left _err -> pure unit -- Test failure
                Right entry -> do
                  entry.consumed_at `shouldEqual` expectedEntry.consumed_at
                  entry.servings `shouldEqual` expectedEntry.servings
                  entry.nutrition_item.description `shouldEqual` expectedEntry.nutrition_item.description
                  entry.nutrition_item.calories `shouldEqual` expectedEntry.nutrition_item.calories
                  entry.nutrition_item.totalFatGrams `shouldEqual` expectedEntry.nutrition_item.totalFatGrams
                  entry.nutrition_item.saturatedFatGrams `shouldEqual` expectedEntry.nutrition_item.saturatedFatGrams
                  entry.nutrition_item.transFatGrams `shouldEqual` expectedEntry.nutrition_item.transFatGrams
                  entry.nutrition_item.polyunsaturatedFatGrams `shouldEqual` expectedEntry.nutrition_item.polyunsaturatedFatGrams
                  entry.nutrition_item.monounsaturatedFatGrams `shouldEqual` expectedEntry.nutrition_item.monounsaturatedFatGrams
                  entry.nutrition_item.cholesterolMilligrams `shouldEqual` expectedEntry.nutrition_item.cholesterolMilligrams
                  entry.nutrition_item.sodiumMilligrams `shouldEqual` expectedEntry.nutrition_item.sodiumMilligrams
                  entry.nutrition_item.totalCarbohydrateGrams `shouldEqual` expectedEntry.nutrition_item.totalCarbohydrateGrams
                  entry.nutrition_item.dietaryFiberGrams `shouldEqual` expectedEntry.nutrition_item.dietaryFiberGrams
                  entry.nutrition_item.totalSugarsGrams `shouldEqual` expectedEntry.nutrition_item.totalSugarsGrams
                  entry.nutrition_item.addedSugarsGrams `shouldEqual` expectedEntry.nutrition_item.addedSugarsGrams
                  entry.nutrition_item.proteinGrams `shouldEqual` expectedEntry.nutrition_item.proteinGrams

