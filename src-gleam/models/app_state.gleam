import food_diary/models/diary_entry.{type DiaryEntry}
import food_diary/models/nutrition_item.{type NutritionItem}
import food_diary/models/recipe.{type Recipe}

/// Application-wide state
pub type AppState {
  AppState(
    entries: List(DiaryEntry),
    nutrition_items: List(NutritionItem),
    recipes: List(Recipe),
  )
}
