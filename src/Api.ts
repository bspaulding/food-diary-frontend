import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import type * as Types from "./generated/graphql";
import * as Documents from "./generated/graphql";

const host = "/api/v1/graphql";

/**
 * Custom error class for authorization failures (401/403 responses)
 */
export class AuthorizationError extends Error {
  constructor(message: string = "Authorization failed") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Type for GraphQL error objects in the response
 */
interface GraphQLErrorObject {
  message: string;
  [key: string]: unknown;
}

/**
 * Type for GraphQL response body
 */
interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLErrorObject[];
}

/**
 * Custom error class for GraphQL errors
 */
export class GraphQLError extends Error {
  constructor(
    message: string,
    public errors: GraphQLErrorObject[],
  ) {
    super(message);
    this.name = "GraphQLError";
  }
}

/**
 * Type-safe fetchQuery function using TypedDocumentNode
 */
async function fetchQuery<TResult, TVariables>(
  accessToken: string,
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never>
    ? []
    : [variables: TVariables]
): Promise<GraphQLResponse<TResult>> {
  const query = print(document);
  const response = await fetch(`${host}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  // Check for authorization errors (401 Unauthorized or 403 Forbidden)
  if (response.status === 401 || response.status === 403) {
    throw new AuthorizationError("Authorization failed");
  }

  // Check for other HTTP errors
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  // Check for GraphQL errors in the response body
  const json: GraphQLResponse<TResult> = await response.json();
  if (json.errors) {
    const errorMessage: string = json.errors
      .map((e: GraphQLErrorObject) => e.message)
      .join(", ");
    throw new GraphQLError(errorMessage, json.errors);
  }

  return json;
}

// Macro nutrient keys that can be accessed on nutrition items
export type MacroKey =
  | "calories"
  | "added_sugars_grams"
  | "protein_grams"
  | "total_fat_grams"
  | "saturated_fat_grams"
  | "trans_fat_grams"
  | "polyunsaturated_fat_grams"
  | "monounsaturated_fat_grams"
  | "cholesterol_milligrams"
  | "sodium_milligrams"
  | "total_carbohydrate_grams"
  | "dietary_fiber_grams"
  | "total_sugars_grams";

// Nutrition item with all macro fields
export type NutritionItemWithMacros = {
  id: number;
  description: string;
  calories: number;
  added_sugars_grams: number;
  protein_grams: number;
  total_fat_grams: number;
  saturated_fat_grams: number;
  trans_fat_grams: number;
  polyunsaturated_fat_grams: number;
  monounsaturated_fat_grams: number;
  cholesterol_milligrams: number;
  sodium_milligrams: number;
  total_carbohydrate_grams: number;
  dietary_fiber_grams: number;
  total_sugars_grams: number;
};

// Recipe item that's part of a recipe
export type RecipeItem = {
  id: number;
  servings: number;
  nutrition_item: NutritionItemWithMacros;
};

// Recipe with items
export type RecipeWithItems = {
  id: number;
  name: string;
  calories: number;
  recipe_items: RecipeItem[];
};

export type DiaryEntry = {
  id: number;
  day: string;
  consumed_at: string;
  servings: number;
  calories: number;
  nutrition_item?: NutritionItemWithMacros;
  recipe?: RecipeWithItems;
};

export type GetEntriesQueryResponse = {
  data: {
    food_diary_diary_entry: DiaryEntry[];
  };
};

export async function fetchEntries(
  accessToken: string,
): Promise<GraphQLResponse<Types.GetEntriesQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetEntriesDocument);
}

export type WeeklyStatsResponse = {
  data: {
    current_week: {
      aggregate: {
        sum: {
          calories: number | null;
        };
      };
    };
    past_four_weeks: {
      aggregate: {
        sum: {
          calories: number | null;
        };
      };
    };
  };
};

export async function fetchWeeklyStats(
  accessToken: string,
  currentWeekStart: string,
  todayStart: string,
  fourWeeksAgoStart: string,
): Promise<GraphQLResponse<Types.GetWeeklyStatsQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetWeeklyStatsDocument, {
    currentWeekStart,
    todayStart,
    fourWeeksAgoStart,
  });
}

// Search result types
export type SearchNutritionItem = {
  id: number;
  description: string;
};

export type SearchRecipe = {
  id: number;
  name: string;
};

export type SearchItemsAndRecipesQueryResponse = {
  data?: {
    food_diary_search_nutrition_items: SearchNutritionItem[];
    food_diary_search_recipes: SearchRecipe[];
  };
};

export async function searchItemsAndRecipes(
  accessToken: string,
  search: string,
): Promise<GraphQLResponse<Types.SearchItemsAndRecipesQueryResult>> {
  return await fetchQuery(
    accessToken,
    Documents.SearchItemsAndRecipesDocument,
    {
      search,
    },
  );
}

export type SearchItemsOnlyQueryResponse = {
  data?: {
    food_diary_search_nutrition_items: SearchNutritionItem[];
    food_diary_search_recipes?: SearchRecipe[];
  };
};

export async function searchItemsOnly(
  accessToken: string,
  search: string,
): Promise<GraphQLResponse<Types.SearchItemsQueryResult>> {
  return await fetchQuery(accessToken, Documents.SearchItemsDocument, {
    search,
  });
}

export type NutritionItemAttrs = {
  description: string;
  calories: number;
  totalFatGrams: number;
  saturatedFatGrams: number;
  transFatGrams: number;
  polyunsaturatedFatGrams: number;
  monounsaturatedFatGrams: number;
  cholesterolMilligrams: number;
  sodiumMilligrams: number;
  totalCarbohydrateGrams: number;
  dietaryFiberGrams: number;
  totalSugarsGrams: number;
  addedSugarsGrams: number;
  proteinGrams: number;
};

export type NutritionItem = NutritionItemAttrs & {
  id: number;
};

export async function createNutritionItem(
  accessToken: string,
  item: NutritionItem,
): Promise<GraphQLResponse<Types.CreateNutritionItemMutationResult>> {
  // Exclude id field when creating a new item
  const { id: _id, ...itemWithoutId } = item;
  return await fetchQuery(accessToken, Documents.CreateNutritionItemDocument, {
    nutritionItem: objectToSnakeCaseKeys(
      itemWithoutId,
    ) as Types.Food_Diary_Nutrition_Item_Insert_Input,
  });
}

export async function updateNutritionItem(
  accessToken: string,
  item: NutritionItem,
): Promise<GraphQLResponse<Types.UpdateItemMutationResult>> {
  return await fetchQuery(accessToken, Documents.UpdateItemDocument, {
    id: item.id,
    attrs: objectToSnakeCaseKeys(item),
  });
}

function isUppercase(s: string): boolean {
  return s === s.toUpperCase();
}

function camelToSnakeCase(s: string): string {
  return Array.from(s).reduce(
    (acc, c) => acc + (isUppercase(c) ? "_" + c.toLowerCase() : c),
    "",
  );
}

function objectToSnakeCaseKeys<T extends Record<string, unknown>>(
  o: T,
): Record<string, unknown> {
  return Object.entries(o).reduce(
    (acc: Record<string, unknown>, [k, v]: [string, unknown]) => ({
      ...acc,
      [camelToSnakeCase(k)]: v,
    }),
    {},
  );
}

export type GetNutritionItemQueryResponse = {
  data?: {
    food_diary_nutrition_item_by_pk?: NutritionItem;
  };
};

export async function fetchNutritionItem(
  accessToken: string,
  id: number | string,
): Promise<GraphQLResponse<Types.GetNutritionItemQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetNutritionItemDocument, {
    id: Number(id),
  });
}

export async function fetchRecentEntries(
  accessToken: string,
): Promise<GraphQLResponse<Types.GetRecentEntryItemsQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetRecentEntryItemsDocument);
}

export async function fetchEntriesAroundTime(
  accessToken: string,
  startTime: string,
  endTime: string,
): Promise<GraphQLResponse<Types.GetEntriesAroundTimeQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetEntriesAroundTimeDocument, {
    startTime,
    endTime,
  });
}

export type CreateDiaryEntryInput =
  | CreateDiaryEntryRecipeInput
  | CreateDiaryEntryItemInput;

export type CreateDiaryEntryItemInput = {
  servings: number;
  nutrition_item_id: number;
};

export type CreateDiaryEntryRecipeInput = {
  servings: number;
  recipe_id: number;
};

export async function createDiaryEntry(
  accessToken: string,
  entry: CreateDiaryEntryInput,
): Promise<GraphQLResponse<Types.CreateDiaryEntryMutationResult>> {
  return await fetchQuery(accessToken, Documents.CreateDiaryEntryDocument, {
    entry,
  });
}

export async function deleteDiaryEntry(
  accessToken: string,
  id: number,
): Promise<GraphQLResponse<Types.DeleteEntryMutationResult>> {
  return await fetchQuery(accessToken, Documents.DeleteEntryDocument, { id });
}

export type RecipeAttrs = {
  name: string;
  total_servings: number;
  recipe_items: InsertRecipeItemInput[];
};

export type Recipe = RecipeAttrs & {
  id: number;
};

export type InsertRecipeItemInput = InsertRecipeItemExistingItem;
// TODO: Support nested new item creation
// | InsertRecipeItemNewItem;

export type InsertRecipeItemExistingItem = {
  servings: number;
  nutrition_item: { id: number; description: string };
};

export type InsertRecipeItemNewItem = {
  servings: number;
  nutrition_item: NutritionItemAttrs;
};

function transformRecipeInput(formInput: RecipeAttrs) {
  return {
    ...formInput,
    recipe_items: {
      data: formInput.recipe_items.map((item) => ({
        servings: item.servings,
        nutrition_item_id: item.nutrition_item.id,
      })),
    },
  };
}

export async function createRecipe(
  accessToken: string,
  formInput: RecipeAttrs,
): Promise<GraphQLResponse<Types.CreateRecipeMutationResult>> {
  return await fetchQuery(accessToken, Documents.CreateRecipeDocument, {
    input: transformRecipeInput(formInput),
  });
}

export async function updateRecipe(
  accessToken: string,
  recipe: Recipe,
): Promise<GraphQLResponse<Types.UpdateRecipeMutationResult>> {
  const { id, ...attrs } = recipe;
  const { recipe_items, ...recipeAttrs } = transformRecipeInput(attrs);
  const recipeItemsInput = recipe_items.data.map((item) => ({
    ...item,
    recipe_id: id,
  }));
  return await fetchQuery(accessToken, Documents.UpdateRecipeDocument, {
    id,
    attrs: recipeAttrs,
    items: recipeItemsInput,
  });
}

export type GetRecipeQueryResponse = {
  data?: {
    food_diary_recipe_by_pk?: {
      id: number;
      name: string;
      total_servings: number;
      recipe_items: RecipeItem[];
    };
  };
};

export async function fetchRecipe(
  accessToken: string,
  id: number,
): Promise<GraphQLResponse<Types.GetRecipeQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetRecipeDocument, {
    id,
  });
}

export type NewDiaryEntry = {
  consumed_at: string;
  servings: number;
  nutrition_item: NutritionItemAttrs;
};

export async function insertDiaryEntries(
  accessToken: string,
  entries: NewDiaryEntry[],
): Promise<
  GraphQLResponse<Types.InsertDiaryEntriesWithNewItemsMutationResult>
> {
  return await fetchQuery(
    accessToken,
    Documents.InsertDiaryEntriesWithNewItemsDocument,
    {
      entries: entries.map((entry) => ({
        ...entry,
        nutrition_item: {
          data: objectToSnakeCaseKeys(
            entry.nutrition_item,
          ) as Types.Food_Diary_Nutrition_Item_Insert_Input,
        },
      })),
    },
  );
}

export async function fetchExportEntries(
  accessToken: string,
): Promise<GraphQLResponse<Types.ExportEntriesQueryResult>> {
  return await fetchQuery(accessToken, Documents.ExportEntriesDocument);
}

export async function getDiaryEntry(
  accessToken: string,
  id: number | string,
): Promise<GraphQLResponse<Types.GetDiaryEntryQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetDiaryEntryDocument, {
    id: Number(id),
  });
}

export async function updateDiaryEntry(
  accessToken: string,
  entry: { id: number; servings: number; consumedAt: string },
): Promise<GraphQLResponse<Types.UpdateDiaryEntryMutationResult>> {
  return fetchQuery(accessToken, Documents.UpdateDiaryEntryDocument, {
    id: entry.id,
    attrs: objectToSnakeCaseKeys(entry),
  });
}

// Weekly trends query - uses backend view for pre-aggregated data
export type WeeklyTrendsData = {
  week_of_year: string;
  protein: number;
  calories: number;
  added_sugar: number;
};

export type GetWeeklyTrendsResponse = {
  data: {
    food_diary_trends_weekly: WeeklyTrendsData[];
  };
};

export async function fetchWeeklyTrends(
  accessToken: string,
): Promise<GraphQLResponse<Types.GetWeeklyTrendsQueryResult>> {
  return await fetchQuery(accessToken, Documents.GetWeeklyTrendsDocument);
}
