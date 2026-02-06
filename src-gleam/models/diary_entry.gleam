import food_diary/models/nutrition_item.{type NutritionItemWithMacros}
import food_diary/models/recipe.{type RecipeWithItems}

/// Represents a diary entry for food consumed
pub type DiaryEntry {
  DiaryEntry(
    id: String,
    day: String,
    consumed_at: String,
    servings: Float,
    calories: Float,
    nutrition_item: Option(NutritionItemWithMacros),
    recipe: Option(RecipeWithItems),
  )
}

/// Input for creating a new diary entry
pub type DiaryEntryInput {
  DiaryEntryInput(
    day: String,
    consumed_at: String,
    servings: Float,
    nutrition_item_id: Option(String),
    recipe_id: Option(String),
  )
}

/// Input for updating a diary entry
pub type DiaryEntryUpdate {
  DiaryEntryUpdate(
    consumed_at: Option(String),
    servings: Option(Float),
  )
}
