import { describe, it, expect } from "vitest";
import { entriesToCsv } from "./CSVExport";

const responseData = {
  data: {
    food_diary_diary_entry: [
      {
        servings: 1,
        consumed_at: "2022-08-28T14:30:00+00:00",
        nutrition_item: {
          description: "Honey Bunches of Oats",
          calories: 160,
          total_fat_grams: 2,
          saturated_fat_grams: 0,
          trans_fat_grams: 0,
          polyunsaturated_fat_grams: 0.5,
          monounsaturated_fat_grams: 1,
          cholesterol_milligrams: 0,
          sodium_milligrams: 190,
          total_carbohydrate_grams: 34,
          dietary_fiber_grams: 2,
          total_sugars_grams: 9,
          added_sugars_grams: 8,
          protein_grams: 3,
        },
        recipe: null,
      },
      {
        servings: 1,
        consumed_at: "2022-08-28T14:30:00+00:00",
        nutrition_item: {
          description: "Almondmilk",
          calories: 60,
          total_fat_grams: 2.5,
          saturated_fat_grams: 0,
          trans_fat_grams: 0,
          polyunsaturated_fat_grams: 0.5,
          monounsaturated_fat_grams: 1.5,
          cholesterol_milligrams: 0,
          sodium_milligrams: 150,
          total_carbohydrate_grams: 8,
          dietary_fiber_grams: 0,
          total_sugars_grams: 7,
          added_sugars_grams: 7,
          protein_grams: 1,
        },
        recipe: null,
      },
      {
        servings: 2,
        consumed_at: "2022-08-29T14:30:00+00:00",
        nutrition_item: null,
        recipe: {
          name: "Test Recipe",
          recipe_items: [
            {
              servings: 2,
              nutrition_item: {
                description: "Almondmilk",
                calories: 60,
                total_fat_grams: 2.5,
                saturated_fat_grams: 0,
                trans_fat_grams: 0,
                polyunsaturated_fat_grams: 0.5,
                monounsaturated_fat_grams: 1.5,
                cholesterol_milligrams: 0,
                sodium_milligrams: 150,
                total_carbohydrate_grams: 8,
                dietary_fiber_grams: 0,
                total_sugars_grams: 7,
                added_sugars_grams: 7,
                protein_grams: 1,
              },
            },
            {
              servings: 1,
              nutrition_item: {
                description: "Honey Bunches of Oats",
                calories: 160,
                total_fat_grams: 2,
                saturated_fat_grams: 0,
                trans_fat_grams: 0,
                polyunsaturated_fat_grams: 0.5,
                monounsaturated_fat_grams: 1,
                cholesterol_milligrams: 0,
                sodium_milligrams: 190,
                total_carbohydrate_grams: 34,
                dietary_fiber_grams: 2,
                total_sugars_grams: 9,
                added_sugars_grams: 8,
                protein_grams: 3,
              },
            },
          ],
        },
      },
    ],
  },
};

describe("entriesToCSV", () => {
  it("converts a list of entries to a csv log", () => {
    const entries = responseData.data.food_diary_diary_entry;
    expect(entriesToCsv(entries))
      .toEqual(`Date,Time,Consumed At,Description,Servings,Calories,Total Fat (g),Saturated Fat (g),Trans Fat (g),Polyunsaturated Fat (g),Monounsaturated Fat (g),Cholesterol (mg),Sodium (mg),Total Carbohydrate (g),Dietary Fiber (g),Total Sugars (g),Added Sugars (g),Protein (g)
2022-08-28,7:30 AM,2022-08-28T07:30:00-07:00,Honey Bunches of Oats,1,160,2,0,0,0.5,1,0,190,34,2,9,8,3
2022-08-28,7:30 AM,2022-08-28T07:30:00-07:00,Almondmilk,1,60,2.5,0,0,0.5,1.5,0,150,8,0,7,7,1
2022-08-29,7:30 AM,2022-08-29T07:30:00-07:00,Test Recipe - Almondmilk,4,60,2.5,0,0,0.5,1.5,0,150,8,0,7,7,1
2022-08-29,7:30 AM,2022-08-29T07:30:00-07:00,Test Recipe - Honey Bunches of Oats,2,160,2,0,0,0.5,1,0,190,34,2,9,8,3`);
  });
});
