module CSVExportTest where

import Prelude

import CSVExport (entriesToCsv, ExportEntry)
import Data.Maybe (Maybe(..))
import Effect.Class (liftEffect)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)

-- Test data matching the TypeScript test
testEntries :: Array ExportEntry
testEntries =
  [ { servings: 1.0
    , consumed_at: "2022-08-28T14:30:00+00:00"
    , nutrition_item: Just
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
    , recipe: Nothing
    }
  , { servings: 1.0
    , consumed_at: "2022-08-28T14:30:00+00:00"
    , nutrition_item: Just
        { description: "Almondmilk"
        , calories: 60.0
        , totalFatGrams: 2.5
        , saturatedFatGrams: 0.0
        , transFatGrams: 0.0
        , polyunsaturatedFatGrams: 0.5
        , monounsaturatedFatGrams: 1.5
        , cholesterolMilligrams: 0.0
        , sodiumMilligrams: 150.0
        , totalCarbohydrateGrams: 8.0
        , dietaryFiberGrams: 0.0
        , totalSugarsGrams: 7.0
        , addedSugarsGrams: 7.0
        , proteinGrams: 1.0
        }
    , recipe: Nothing
    }
  , { servings: 2.0
    , consumed_at: "2022-08-29T14:30:00+00:00"
    , nutrition_item: Nothing
    , recipe: Just
        { name: "Test Recipe"
        , recipe_items:
            [ { servings: 2.0
              , nutrition_item:
                  { description: "Almondmilk"
                  , calories: 60.0
                  , totalFatGrams: 2.5
                  , saturatedFatGrams: 0.0
                  , transFatGrams: 0.0
                  , polyunsaturatedFatGrams: 0.5
                  , monounsaturatedFatGrams: 1.5
                  , cholesterolMilligrams: 0.0
                  , sodiumMilligrams: 150.0
                  , totalCarbohydrateGrams: 8.0
                  , dietaryFiberGrams: 0.0
                  , totalSugarsGrams: 7.0
                  , addedSugarsGrams: 7.0
                  , proteinGrams: 1.0
                  }
              }
            , { servings: 1.0
              , nutrition_item:
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
              }
            ]
        }
    }
  ]

expectedCsv :: String
expectedCsv = """Date,Time,Consumed At,Description,Servings,Calories,Total Fat (g),Saturated Fat (g),Trans Fat (g),Polyunsaturated Fat (g),Monounsaturated Fat (g),Cholesterol (mg),Sodium (mg),Total Carbohydrate (g),Dietary Fiber (g),Total Sugars (g),Added Sugars (g),Protein (g)
2022-08-28,7:30 AM,2022-08-28T07:30:00-07:00,Honey Bunches of Oats,1.0,160.0,2.0,0.0,0.0,0.5,1.0,0.0,190.0,34.0,2.0,9.0,8.0,3.0
2022-08-28,7:30 AM,2022-08-28T07:30:00-07:00,Almondmilk,1.0,60.0,2.5,0.0,0.0,0.5,1.5,0.0,150.0,8.0,0.0,7.0,7.0,1.0
2022-08-29,7:30 AM,2022-08-29T07:30:00-07:00,Test Recipe - Almondmilk,4.0,60.0,2.5,0.0,0.0,0.5,1.5,0.0,150.0,8.0,0.0,7.0,7.0,1.0
2022-08-29,7:30 AM,2022-08-29T07:30:00-07:00,Test Recipe - Honey Bunches of Oats,2.0,160.0,2.0,0.0,0.0,0.5,1.0,0.0,190.0,34.0,2.0,9.0,8.0,3.0"""

spec :: Spec Unit
spec = describe "CSVExport" do
  describe "entriesToCsv" do
    it "converts a list of entries to a csv log" do
      result <- liftEffect $ entriesToCsv testEntries
      result `shouldEqual` expectedCsv
