import gleam/dynamic/decode
import gleam/int
import gleam/option.{type Option, None}

pub fn get_entries_query(offset: Int) {
  "fragment NutritionItemFields on food_diary_nutrition_item {
  id
  description
  calories
	total_fat_grams
  added_sugars_grams
	protein_grams
}

query GetEntries {
    food_diary_diary_entry(order_by: { consumed_at: desc }, limit: 50, offset: " <> int.to_string(
    offset,
  ) <> ") {
        id
        consumed_at
        calories
        servings
        nutrition_item { ...NutritionItemFields }
        recipe { id, name, calories, recipe_items { servings, nutrition_item { ...NutritionItemFields } } }
    }
}"
}

pub type NutritionItem {
  NutritionItem(
    id: Int,
    description: String,
    calories: Float,
    total_fat_grams: Float,
    added_sugars_grams: Float,
    protein_grams: Float,
  )
}

pub fn nutrition_item_decoder() {
  use id <- decode.field("id", decode.int)
  use description <- decode.field("description", decode.string)
  use calories <- decode.field("calories", decode.float)
  use total_fat_grams <- decode.field("total_fat_grams", decode.float)
  use added_sugars_grams <- decode.field("added_sugars_grams", decode.float)
  use protein_grams <- decode.field("protein_grams", decode.float)
  decode.success(NutritionItem(
    id,
    description,
    calories,
    total_fat_grams,
    added_sugars_grams,
    protein_grams,
  ))
}

pub type RecipeItem {
  RecipeItem(servings: Float, nutrition_item: NutritionItem)
}

fn recipe_item_decoder() {
  use servings <- decode.field("servings", decode.float)
  use nutrition_item <- decode.field("nutrition_item", nutrition_item_decoder())
  decode.success(RecipeItem(servings, nutrition_item))
}

pub type Recipe {
  Recipe(id: Int, name: String, calories: Float, recipe_items: List(RecipeItem))
}

pub fn recipe_decoder() {
  use id <- decode.field("id", decode.int)
  use name <- decode.field("name", decode.string)
  use calories <- decode.field("calories", decode.float)
  use recipe_items <- decode.field(
    "recipe_items",
    decode.list(recipe_item_decoder()),
  )
  decode.success(Recipe(id, name, calories, recipe_items))
}

pub type DiaryEntry {
  DiaryEntry(
    id: Int,
    consumed_at: String,
    calories: Float,
    servings: Float,
    nutrition_item: Option(NutritionItem),
    recipe: Option(Recipe),
  )
}

pub fn diary_entry_decoder() {
  use id <- decode.field("id", decode.int)
  use consumed_at <- decode.field("consumed_at", decode.string)
  use calories <- decode.field("calories", decode.float)
  use servings <- decode.field("servings", decode.float)
  use nutrition_item <- decode.optional_field(
    "nutrition_item",
    None,
    decode.optional(nutrition_item_decoder()),
  )
  use recipe <- decode.optional_field(
    "recipe",
    None,
    decode.optional(recipe_decoder()),
  )
  decode.success(DiaryEntry(
    id: id,
    consumed_at: consumed_at,
    calories: calories,
    servings: servings,
    nutrition_item: nutrition_item,
    recipe: recipe,
  ))
}

pub type DiaryEntriesResponseData {
  DiaryEntriesResponseData(entries: List(DiaryEntry))
}

pub fn diary_entries_response_data_decoder() {
  use entries <- decode.field(
    "food_diary_diary_entry",
    decode.list(diary_entry_decoder()),
  )
  decode.success(DiaryEntriesResponseData(entries: entries))
}

pub type DiaryEntriesResponse {
  DiaryEntriesResponse(data: Option(DiaryEntriesResponseData))
}

pub fn diary_entries_response_decoder() {
  use data <- decode.optional_field(
    "data",
    None,
    decode.optional(diary_entries_response_data_decoder()),
  )
  decode.success(DiaryEntriesResponse(data))
}
