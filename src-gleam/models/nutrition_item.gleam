/// Represents a nutrition item with all nutritional information
pub type NutritionItem {
  NutritionItem(
    id: String,
    description: String,
    calories: Float,
    protein_grams: Float,
    total_fat_grams: Float,
    saturated_fat_grams: Float,
    trans_fat_grams: Float,
    polyunsaturated_fat_grams: Float,
    monounsaturated_fat_grams: Float,
    cholesterol_milligrams: Float,
    sodium_milligrams: Float,
    total_carbohydrate_grams: Float,
    dietary_fiber_grams: Float,
    total_sugars_grams: Float,
    added_sugars_grams: Float,
  )
}

/// Nutrition item with only macro nutrients
pub type NutritionItemWithMacros {
  NutritionItemWithMacros(
    id: String,
    description: String,
    calories: Float,
    protein_grams: Float,
    total_fat_grams: Float,
    added_sugars_grams: Float,
  )
}

/// Input for creating or updating a nutrition item
pub type NutritionItemInput {
  NutritionItemInput(
    description: String,
    calories: Float,
    protein_grams: Float,
    total_fat_grams: Float,
    saturated_fat_grams: Float,
    trans_fat_grams: Float,
    polyunsaturated_fat_grams: Float,
    monounsaturated_fat_grams: Float,
    cholesterol_milligrams: Float,
    sodium_milligrams: Float,
    total_carbohydrate_grams: Float,
    dietary_fiber_grams: Float,
    total_sugars_grams: Float,
    added_sugars_grams: Float,
  )
}

/// Macro nutrient keys
pub type MacroKey {
  Calories
  ProteinGrams
  TotalFatGrams
  AddedSugarsGrams
}

pub fn get_macro(item: NutritionItemWithMacros, key: MacroKey) -> Float {
  case key {
    Calories -> item.calories
    ProteinGrams -> item.protein_grams
    TotalFatGrams -> item.total_fat_grams
    AddedSugarsGrams -> item.added_sugars_grams
  }
}
