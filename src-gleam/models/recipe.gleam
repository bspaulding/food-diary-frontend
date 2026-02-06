import food_diary/models/nutrition_item.{type NutritionItemWithMacros}

/// Represents a recipe
pub type Recipe {
  Recipe(
    id: String,
    name: String,
    total_servings: Float,
    calories: Float,
  )
}

/// Recipe item linking a nutrition item to a recipe
pub type RecipeItem {
  RecipeItem(
    id: String,
    servings: Float,
    nutrition_item: NutritionItemWithMacros,
  )
}

/// Recipe with its items
pub type RecipeWithItems {
  RecipeWithItems(
    id: String,
    name: String,
    total_servings: Float,
    calories: Float,
    recipe_items: List(RecipeItem),
  )
}

/// Input for creating a recipe item
pub type RecipeItemInput {
  RecipeItemInput(
    nutrition_item_id: String,
    servings: Float,
  )
}

/// Input for creating a new recipe
pub type RecipeInput {
  RecipeInput(
    name: String,
    total_servings: Float,
    items: List(RecipeItemInput),
  )
}
