import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  timestamptz: { input: string; output: string };
};

export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  delete_food_diary_diary_entry_by_pk?: Maybe<Food_Diary_Diary_Entry_Mutation_Response>;
  delete_food_diary_recipe_item?: Maybe<Food_Diary_Recipe_Item_Mutation_Response>;
  insert_food_diary_diary_entry?: Maybe<Food_Diary_Diary_Entry_Mutation_Response>;
  insert_food_diary_diary_entry_one?: Maybe<Food_Diary_Diary_Entry_Mutation_Response>;
  insert_food_diary_nutrition_item_one?: Maybe<Food_Diary_Nutrition_Item_Mutation_Response>;
  insert_food_diary_recipe_item?: Maybe<Food_Diary_Recipe_Item_Mutation_Response>;
  insert_food_diary_recipe_one?: Maybe<Food_Diary_Recipe_Mutation_Response>;
  update_food_diary_diary_entry_by_pk?: Maybe<Food_Diary_Diary_Entry_Mutation_Response>;
  update_food_diary_nutrition_item_by_pk?: Maybe<Food_Diary_Nutrition_Item_Mutation_Response>;
  update_food_diary_recipe_by_pk?: Maybe<Food_Diary_Recipe_Mutation_Response>;
};

export type MutationDelete_Food_Diary_Diary_Entry_By_PkArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDelete_Food_Diary_Recipe_ItemArgs = {
  where: Food_Diary_Recipe_Item_Bool_Exp;
};

export type MutationInsert_Food_Diary_Diary_EntryArgs = {
  objects: Array<Food_Diary_Diary_Entry_Insert_Input>;
};

export type MutationInsert_Food_Diary_Diary_Entry_OneArgs = {
  object: Food_Diary_Diary_Entry_Insert_Input;
};

export type MutationInsert_Food_Diary_Nutrition_Item_OneArgs = {
  object: Food_Diary_Nutrition_Item_Insert_Input;
};

export type MutationInsert_Food_Diary_Recipe_ItemArgs = {
  objects: Array<Food_Diary_Recipe_Item_Insert_Input>;
};

export type MutationInsert_Food_Diary_Recipe_OneArgs = {
  object: Food_Diary_Recipe_Insert_Input;
};

export type MutationUpdate_Food_Diary_Diary_Entry_By_PkArgs = {
  _set: Food_Diary_Diary_Entry_Set_Input;
  pk_columns: Food_Diary_Diary_Entry_Pk_Columns_Input;
};

export type MutationUpdate_Food_Diary_Nutrition_Item_By_PkArgs = {
  _set: Food_Diary_Nutrition_Item_Set_Input;
  pk_columns: Food_Diary_Nutrition_Item_Pk_Columns_Input;
};

export type MutationUpdate_Food_Diary_Recipe_By_PkArgs = {
  _set: Food_Diary_Recipe_Set_Input;
  pk_columns: Food_Diary_Recipe_Pk_Columns_Input;
};

export type Query = {
  __typename?: "Query";
  food_diary_diary_entry: Array<Food_Diary_Diary_Entry>;
  food_diary_diary_entry_aggregate: Food_Diary_Diary_Entry_Aggregate;
  food_diary_diary_entry_by_pk?: Maybe<Food_Diary_Diary_Entry>;
  food_diary_diary_entry_recent: Array<Food_Diary_Diary_Entry>;
  food_diary_nutrition_item_by_pk?: Maybe<Food_Diary_Nutrition_Item>;
  food_diary_recipe_by_pk?: Maybe<Food_Diary_Recipe>;
  food_diary_search_nutrition_items: Array<Food_Diary_Nutrition_Item>;
  food_diary_search_recipes: Array<Food_Diary_Recipe>;
  food_diary_trends_weekly: Array<Food_Diary_Trends_Weekly>;
};

export type QueryFood_Diary_Diary_EntryArgs = {
  distinct_on?: InputMaybe<Array<Scalars["String"]["input"]>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Food_Diary_Diary_Entry_Order_By>>;
  where?: InputMaybe<Food_Diary_Diary_Entry_Bool_Exp>;
};

export type QueryFood_Diary_Diary_Entry_AggregateArgs = {
  where?: InputMaybe<Food_Diary_Diary_Entry_Bool_Exp>;
};

export type QueryFood_Diary_Diary_Entry_By_PkArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryFood_Diary_Diary_Entry_RecentArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Food_Diary_Diary_Entry_Order_By>>;
};

export type QueryFood_Diary_Nutrition_Item_By_PkArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryFood_Diary_Recipe_By_PkArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryFood_Diary_Search_Nutrition_ItemsArgs = {
  args: SearchArgs;
};

export type QueryFood_Diary_Search_RecipesArgs = {
  args: SearchArgs;
};

export type SearchArgs = {
  search: Scalars["String"]["input"];
};

export type Food_Diary_Diary_Entry = {
  __typename?: "food_diary_diary_entry";
  calories: Scalars["Float"]["output"];
  consumed_at: Scalars["timestamptz"]["output"];
  day: Scalars["String"]["output"];
  id: Scalars["Int"]["output"];
  nutrition_item?: Maybe<Food_Diary_Nutrition_Item>;
  nutrition_item_id?: Maybe<Scalars["Int"]["output"]>;
  recipe?: Maybe<Food_Diary_Recipe>;
  recipe_id?: Maybe<Scalars["Int"]["output"]>;
  servings: Scalars["Float"]["output"];
};

export type Food_Diary_Diary_Entry_Aggregate = {
  __typename?: "food_diary_diary_entry_aggregate";
  aggregate?: Maybe<Food_Diary_Diary_Entry_Aggregate_Fields>;
};

export type Food_Diary_Diary_Entry_Aggregate_Fields = {
  __typename?: "food_diary_diary_entry_aggregate_fields";
  sum?: Maybe<Food_Diary_Diary_Entry_Aggregate_Sum>;
};

export type Food_Diary_Diary_Entry_Aggregate_Sum = {
  __typename?: "food_diary_diary_entry_aggregate_sum";
  calories?: Maybe<Scalars["Float"]["output"]>;
};

export type Food_Diary_Diary_Entry_Bool_Exp = {
  consumed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  nutrition_item_id?: InputMaybe<Int_Comparison_Exp>;
  recipe_id?: InputMaybe<Int_Comparison_Exp>;
};

export type Food_Diary_Diary_Entry_Insert_Input = {
  consumed_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  nutrition_item?: InputMaybe<Food_Diary_Nutrition_Item_Nested_Insert_Input>;
  nutrition_item_id?: InputMaybe<Scalars["Int"]["input"]>;
  recipe_id?: InputMaybe<Scalars["Int"]["input"]>;
  servings: Scalars["Float"]["input"];
};

export type Food_Diary_Diary_Entry_Mutation_Response = {
  __typename?: "food_diary_diary_entry_mutation_response";
  affected_rows: Scalars["Int"]["output"];
  id: Scalars["Int"]["output"];
};

export type Food_Diary_Diary_Entry_Order_By = {
  consumed_at?: InputMaybe<Order_By>;
  day?: InputMaybe<Order_By>;
};

export type Food_Diary_Diary_Entry_Pk_Columns_Input = {
  id: Scalars["Int"]["input"];
};

export type Food_Diary_Diary_Entry_Set_Input = {
  consumed_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  servings?: InputMaybe<Scalars["Float"]["input"]>;
};

export type Food_Diary_Nutrition_Item = {
  __typename?: "food_diary_nutrition_item";
  added_sugars_grams: Scalars["Float"]["output"];
  calories: Scalars["Float"]["output"];
  cholesterol_milligrams: Scalars["Float"]["output"];
  description: Scalars["String"]["output"];
  dietary_fiber_grams: Scalars["Float"]["output"];
  id: Scalars["Int"]["output"];
  monounsaturated_fat_grams: Scalars["Float"]["output"];
  polyunsaturated_fat_grams: Scalars["Float"]["output"];
  protein_grams: Scalars["Float"]["output"];
  saturated_fat_grams: Scalars["Float"]["output"];
  sodium_milligrams: Scalars["Float"]["output"];
  total_carbohydrate_grams: Scalars["Float"]["output"];
  total_fat_grams: Scalars["Float"]["output"];
  total_sugars_grams: Scalars["Float"]["output"];
  trans_fat_grams: Scalars["Float"]["output"];
};

export type Food_Diary_Nutrition_Item_Insert_Input = {
  added_sugars_grams: Scalars["Float"]["input"];
  calories: Scalars["Float"]["input"];
  cholesterol_milligrams: Scalars["Float"]["input"];
  description: Scalars["String"]["input"];
  dietary_fiber_grams: Scalars["Float"]["input"];
  monounsaturated_fat_grams: Scalars["Float"]["input"];
  polyunsaturated_fat_grams: Scalars["Float"]["input"];
  protein_grams: Scalars["Float"]["input"];
  saturated_fat_grams: Scalars["Float"]["input"];
  sodium_milligrams: Scalars["Float"]["input"];
  total_carbohydrate_grams: Scalars["Float"]["input"];
  total_fat_grams: Scalars["Float"]["input"];
  total_sugars_grams: Scalars["Float"]["input"];
  trans_fat_grams: Scalars["Float"]["input"];
};

export type Food_Diary_Nutrition_Item_Mutation_Response = {
  __typename?: "food_diary_nutrition_item_mutation_response";
  id: Scalars["Int"]["output"];
};

export type Food_Diary_Nutrition_Item_Nested_Insert_Input = {
  data: Food_Diary_Nutrition_Item_Insert_Input;
};

export type Food_Diary_Nutrition_Item_Pk_Columns_Input = {
  id: Scalars["Int"]["input"];
};

export type Food_Diary_Nutrition_Item_Set_Input = {
  added_sugars_grams?: InputMaybe<Scalars["Float"]["input"]>;
  calories?: InputMaybe<Scalars["Float"]["input"]>;
  cholesterol_milligrams?: InputMaybe<Scalars["Float"]["input"]>;
  consumed_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dietary_fiber_grams?: InputMaybe<Scalars["Float"]["input"]>;
  id?: InputMaybe<Scalars["Int"]["input"]>;
  monounsaturated_fat_grams?: InputMaybe<Scalars["Float"]["input"]>;
  polyunsaturated_fat_grams?: InputMaybe<Scalars["Float"]["input"]>;
  protein_grams?: InputMaybe<Scalars["Float"]["input"]>;
  saturated_fat_grams?: InputMaybe<Scalars["Float"]["input"]>;
  servings?: InputMaybe<Scalars["Float"]["input"]>;
  sodium_milligrams?: InputMaybe<Scalars["Float"]["input"]>;
  total_carbohydrate_grams?: InputMaybe<Scalars["Float"]["input"]>;
  total_fat_grams?: InputMaybe<Scalars["Float"]["input"]>;
  total_sugars_grams?: InputMaybe<Scalars["Float"]["input"]>;
  trans_fat_grams?: InputMaybe<Scalars["Float"]["input"]>;
};

export type Food_Diary_Recipe = {
  __typename?: "food_diary_recipe";
  calories: Scalars["Float"]["output"];
  id: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  recipe_items: Array<Food_Diary_Recipe_Item>;
  total_servings: Scalars["Float"]["output"];
};

export type Food_Diary_Recipe_Insert_Input = {
  name: Scalars["String"]["input"];
  recipe_items: Food_Diary_Recipe_Item_Nested_Insert_Input;
  total_servings: Scalars["Float"]["input"];
};

export type Food_Diary_Recipe_Item = {
  __typename?: "food_diary_recipe_item";
  id: Scalars["Int"]["output"];
  nutrition_item: Food_Diary_Nutrition_Item;
  nutrition_item_id: Scalars["Int"]["output"];
  recipe_id: Scalars["Int"]["output"];
  servings: Scalars["Float"]["output"];
};

export type Food_Diary_Recipe_Item_Bool_Exp = {
  recipe_id?: InputMaybe<Int_Comparison_Exp>;
};

export type Food_Diary_Recipe_Item_Insert_Input = {
  nutrition_item_id: Scalars["Int"]["input"];
  recipe_id?: InputMaybe<Scalars["Int"]["input"]>;
  servings: Scalars["Float"]["input"];
};

export type Food_Diary_Recipe_Item_Mutation_Response = {
  __typename?: "food_diary_recipe_item_mutation_response";
  affected_rows: Scalars["Int"]["output"];
};

export type Food_Diary_Recipe_Item_Nested_Insert_Input = {
  data: Array<Food_Diary_Recipe_Item_Insert_Input>;
};

export type Food_Diary_Recipe_Mutation_Response = {
  __typename?: "food_diary_recipe_mutation_response";
  id: Scalars["Int"]["output"];
};

export type Food_Diary_Recipe_Pk_Columns_Input = {
  id: Scalars["Int"]["input"];
};

export type Food_Diary_Recipe_Set_Input = {
  name?: InputMaybe<Scalars["String"]["input"]>;
  total_servings?: InputMaybe<Scalars["Float"]["input"]>;
};

export type Food_Diary_Trends_Weekly = {
  __typename?: "food_diary_trends_weekly";
  added_sugar: Scalars["Float"]["output"];
  calories: Scalars["Float"]["output"];
  protein: Scalars["Float"]["output"];
  week_of_year: Scalars["String"]["output"];
};

export enum Order_By {
  Asc = "asc",
  Desc = "desc",
}

export type Timestamptz_Comparison_Exp = {
  _gte?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _lt?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _lte?: InputMaybe<Scalars["timestamptz"]["input"]>;
};

export type CreateDiaryEntryMutationVariables = Exact<{
  entry: Food_Diary_Diary_Entry_Insert_Input;
}>;

export type CreateDiaryEntryMutationResult = {
  __typename?: "Mutation";
  insert_food_diary_diary_entry_one?:
    | { __typename?: "food_diary_diary_entry_mutation_response"; id: number }
    | null
    | undefined;
};

export type CreateNutritionItemMutationVariables = Exact<{
  nutritionItem: Food_Diary_Nutrition_Item_Insert_Input;
}>;

export type CreateNutritionItemMutationResult = {
  __typename?: "Mutation";
  insert_food_diary_nutrition_item_one?:
    | { __typename?: "food_diary_nutrition_item_mutation_response"; id: number }
    | null
    | undefined;
};

export type CreateRecipeMutationVariables = Exact<{
  input: Food_Diary_Recipe_Insert_Input;
}>;

export type CreateRecipeMutationResult = {
  __typename?: "Mutation";
  insert_food_diary_recipe_one?:
    | { __typename?: "food_diary_recipe_mutation_response"; id: number }
    | null
    | undefined;
};

export type DeleteEntryMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type DeleteEntryMutationResult = {
  __typename?: "Mutation";
  delete_food_diary_diary_entry_by_pk?:
    | { __typename?: "food_diary_diary_entry_mutation_response"; id: number }
    | null
    | undefined;
};

export type NutritionItemFullFragment = {
  __typename?: "food_diary_nutrition_item";
  description: string;
  calories: number;
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
  added_sugars_grams: number;
  protein_grams: number;
};

export type ExportEntriesQueryVariables = Exact<{ [key: string]: never }>;

export type ExportEntriesQueryResult = {
  __typename?: "Query";
  food_diary_diary_entry: Array<{
    __typename?: "food_diary_diary_entry";
    servings: number;
    consumed_at: string;
    nutrition_item?:
      | {
          __typename?: "food_diary_nutrition_item";
          description: string;
          calories: number;
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
          added_sugars_grams: number;
          protein_grams: number;
        }
      | null
      | undefined;
    recipe?:
      | {
          __typename?: "food_diary_recipe";
          name: string;
          recipe_items: Array<{
            __typename?: "food_diary_recipe_item";
            servings: number;
            nutrition_item: {
              __typename?: "food_diary_nutrition_item";
              description: string;
              calories: number;
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
              added_sugars_grams: number;
              protein_grams: number;
            };
          }>;
        }
      | null
      | undefined;
  }>;
};

export type MacrosFragment = {
  __typename?: "food_diary_nutrition_item";
  total_fat_grams: number;
  added_sugars_grams: number;
  protein_grams: number;
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

export type GetDiaryEntryQueryVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type GetDiaryEntryQueryResult = {
  __typename?: "Query";
  food_diary_diary_entry_by_pk?:
    | {
        __typename?: "food_diary_diary_entry";
        id: number;
        consumed_at: string;
        calories: number;
        servings: number;
        nutrition_item?:
          | {
              __typename?: "food_diary_nutrition_item";
              id: number;
              description: string;
              calories: number;
              total_fat_grams: number;
              added_sugars_grams: number;
              protein_grams: number;
              saturated_fat_grams: number;
              trans_fat_grams: number;
              polyunsaturated_fat_grams: number;
              monounsaturated_fat_grams: number;
              cholesterol_milligrams: number;
              sodium_milligrams: number;
              total_carbohydrate_grams: number;
              dietary_fiber_grams: number;
              total_sugars_grams: number;
            }
          | null
          | undefined;
        recipe?:
          | {
              __typename?: "food_diary_recipe";
              id: number;
              name: string;
              calories: number;
              recipe_items: Array<{
                __typename?: "food_diary_recipe_item";
                servings: number;
                nutrition_item: {
                  __typename?: "food_diary_nutrition_item";
                  id: number;
                  description: string;
                  calories: number;
                  total_fat_grams: number;
                  added_sugars_grams: number;
                  protein_grams: number;
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
              }>;
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetEntriesQueryVariables = Exact<{ [key: string]: never }>;

export type GetEntriesQueryResult = {
  __typename?: "Query";
  food_diary_diary_entry: Array<{
    __typename?: "food_diary_diary_entry";
    id: number;
    day: string;
    consumed_at: string;
    calories: number;
    servings: number;
    nutrition_item?:
      | {
          __typename?: "food_diary_nutrition_item";
          id: number;
          description: string;
          calories: number;
          total_fat_grams: number;
          added_sugars_grams: number;
          protein_grams: number;
          saturated_fat_grams: number;
          trans_fat_grams: number;
          polyunsaturated_fat_grams: number;
          monounsaturated_fat_grams: number;
          cholesterol_milligrams: number;
          sodium_milligrams: number;
          total_carbohydrate_grams: number;
          dietary_fiber_grams: number;
          total_sugars_grams: number;
        }
      | null
      | undefined;
    recipe?:
      | {
          __typename?: "food_diary_recipe";
          id: number;
          name: string;
          calories: number;
          recipe_items: Array<{
            __typename?: "food_diary_recipe_item";
            id: number;
            servings: number;
            nutrition_item: {
              __typename?: "food_diary_nutrition_item";
              id: number;
              description: string;
              calories: number;
              total_fat_grams: number;
              added_sugars_grams: number;
              protein_grams: number;
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
          }>;
        }
      | null
      | undefined;
  }>;
};

export type GetEntriesAroundTimeQueryVariables = Exact<{
  startTime: Scalars["timestamptz"]["input"];
  endTime: Scalars["timestamptz"]["input"];
}>;

export type GetEntriesAroundTimeQueryResult = {
  __typename?: "Query";
  food_diary_diary_entry: Array<{
    __typename?: "food_diary_diary_entry";
    consumed_at: string;
    nutrition_item?:
      | {
          __typename?: "food_diary_nutrition_item";
          id: number;
          description: string;
        }
      | null
      | undefined;
    recipe?:
      | { __typename?: "food_diary_recipe"; id: number; name: string }
      | null
      | undefined;
  }>;
};

export type GetNutritionItemQueryVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type GetNutritionItemQueryResult = {
  __typename?: "Query";
  food_diary_nutrition_item_by_pk?:
    | {
        __typename?: "food_diary_nutrition_item";
        id: number;
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
      }
    | null
    | undefined;
};

export type GetRecentEntryItemsQueryVariables = Exact<{ [key: string]: never }>;

export type GetRecentEntryItemsQueryResult = {
  __typename?: "Query";
  food_diary_diary_entry_recent: Array<{
    __typename?: "food_diary_diary_entry";
    consumed_at: string;
    nutrition_item?:
      | {
          __typename?: "food_diary_nutrition_item";
          id: number;
          description: string;
        }
      | null
      | undefined;
    recipe?:
      | { __typename?: "food_diary_recipe"; id: number; name: string }
      | null
      | undefined;
  }>;
};

export type RecipeMacrosFragment = {
  __typename?: "food_diary_nutrition_item";
  total_fat_grams: number;
  added_sugars_grams: number;
  protein_grams: number;
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

export type GetRecipeQueryVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type GetRecipeQueryResult = {
  __typename?: "Query";
  food_diary_recipe_by_pk?:
    | {
        __typename?: "food_diary_recipe";
        id: number;
        name: string;
        total_servings: number;
        recipe_items: Array<{
          __typename?: "food_diary_recipe_item";
          id: number;
          servings: number;
          nutrition_item: {
            __typename?: "food_diary_nutrition_item";
            id: number;
            description: string;
            calories: number;
            total_fat_grams: number;
            added_sugars_grams: number;
            protein_grams: number;
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
        }>;
      }
    | null
    | undefined;
};

export type GetWeeklyStatsQueryVariables = Exact<{
  currentWeekStart: Scalars["timestamptz"]["input"];
  todayStart: Scalars["timestamptz"]["input"];
  fourWeeksAgoStart: Scalars["timestamptz"]["input"];
}>;

export type GetWeeklyStatsQueryResult = {
  __typename?: "Query";
  current_week: {
    __typename?: "food_diary_diary_entry_aggregate";
    aggregate?:
      | {
          __typename?: "food_diary_diary_entry_aggregate_fields";
          sum?:
            | {
                __typename?: "food_diary_diary_entry_aggregate_sum";
                calories?: number | null | undefined;
              }
            | null
            | undefined;
        }
      | null
      | undefined;
  };
  past_four_weeks: {
    __typename?: "food_diary_diary_entry_aggregate";
    aggregate?:
      | {
          __typename?: "food_diary_diary_entry_aggregate_fields";
          sum?:
            | {
                __typename?: "food_diary_diary_entry_aggregate_sum";
                calories?: number | null | undefined;
              }
            | null
            | undefined;
        }
      | null
      | undefined;
  };
};

export type GetWeeklyTrendsQueryVariables = Exact<{ [key: string]: never }>;

export type GetWeeklyTrendsQueryResult = {
  __typename?: "Query";
  food_diary_trends_weekly: Array<{
    __typename?: "food_diary_trends_weekly";
    week_of_year: string;
    protein: number;
    calories: number;
    added_sugar: number;
  }>;
};

export type InsertDiaryEntriesWithNewItemsMutationVariables = Exact<{
  entries:
    | Array<Food_Diary_Diary_Entry_Insert_Input>
    | Food_Diary_Diary_Entry_Insert_Input;
}>;

export type InsertDiaryEntriesWithNewItemsMutationResult = {
  __typename?: "Mutation";
  insert_food_diary_diary_entry?:
    | {
        __typename?: "food_diary_diary_entry_mutation_response";
        affected_rows: number;
      }
    | null
    | undefined;
};

export type SearchItemsQueryVariables = Exact<{
  search: Scalars["String"]["input"];
}>;

export type SearchItemsQueryResult = {
  __typename?: "Query";
  food_diary_search_nutrition_items: Array<{
    __typename?: "food_diary_nutrition_item";
    id: number;
    description: string;
  }>;
};

export type SearchItemsAndRecipesQueryVariables = Exact<{
  search: Scalars["String"]["input"];
}>;

export type SearchItemsAndRecipesQueryResult = {
  __typename?: "Query";
  food_diary_search_nutrition_items: Array<{
    __typename?: "food_diary_nutrition_item";
    id: number;
    description: string;
  }>;
  food_diary_search_recipes: Array<{
    __typename?: "food_diary_recipe";
    id: number;
    name: string;
  }>;
};

export type UpdateDiaryEntryMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  attrs: Food_Diary_Diary_Entry_Set_Input;
}>;

export type UpdateDiaryEntryMutationResult = {
  __typename?: "Mutation";
  update_food_diary_diary_entry_by_pk?:
    | { __typename?: "food_diary_diary_entry_mutation_response"; id: number }
    | null
    | undefined;
};

export type UpdateItemMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  attrs: Food_Diary_Nutrition_Item_Set_Input;
}>;

export type UpdateItemMutationResult = {
  __typename?: "Mutation";
  update_food_diary_nutrition_item_by_pk?:
    | { __typename?: "food_diary_nutrition_item_mutation_response"; id: number }
    | null
    | undefined;
};

export type UpdateRecipeMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  attrs: Food_Diary_Recipe_Set_Input;
  items:
    | Array<Food_Diary_Recipe_Item_Insert_Input>
    | Food_Diary_Recipe_Item_Insert_Input;
}>;

export type UpdateRecipeMutationResult = {
  __typename?: "Mutation";
  update_food_diary_recipe_by_pk?:
    | { __typename?: "food_diary_recipe_mutation_response"; id: number }
    | null
    | undefined;
  delete_food_diary_recipe_item?:
    | {
        __typename?: "food_diary_recipe_item_mutation_response";
        affected_rows: number;
      }
    | null
    | undefined;
  insert_food_diary_recipe_item?:
    | {
        __typename?: "food_diary_recipe_item_mutation_response";
        affected_rows: number;
      }
    | null
    | undefined;
};

export const NutritionItemFullFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NutritionItemFull" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "food_diary_nutrition_item" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "calories" } },
          { kind: "Field", name: { kind: "Name", value: "total_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "saturated_fat_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "trans_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "polyunsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "monounsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "cholesterol_milligrams" },
          },
          { kind: "Field", name: { kind: "Name", value: "sodium_milligrams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_carbohydrate_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "dietary_fiber_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_sugars_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "added_sugars_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "protein_grams" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NutritionItemFullFragment, unknown>;
export const MacrosFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Macros" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "food_diary_nutrition_item" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "total_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "added_sugars_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "protein_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "saturated_fat_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "trans_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "polyunsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "monounsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "cholesterol_milligrams" },
          },
          { kind: "Field", name: { kind: "Name", value: "sodium_milligrams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_carbohydrate_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "dietary_fiber_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_sugars_grams" },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MacrosFragment, unknown>;
export const RecipeMacrosFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeMacros" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "food_diary_nutrition_item" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "total_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "added_sugars_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "protein_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "saturated_fat_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "trans_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "polyunsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "monounsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "cholesterol_milligrams" },
          },
          { kind: "Field", name: { kind: "Name", value: "sodium_milligrams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_carbohydrate_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "dietary_fiber_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_sugars_grams" },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RecipeMacrosFragment, unknown>;
export const CreateDiaryEntryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateDiaryEntry" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "entry" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: {
                kind: "Name",
                value: "food_diary_diary_entry_insert_input",
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "insert_food_diary_diary_entry_one" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "object" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "entry" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateDiaryEntryMutationResult,
  CreateDiaryEntryMutationVariables
>;
export const CreateNutritionItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateNutritionItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "nutritionItem" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: {
                kind: "Name",
                value: "food_diary_nutrition_item_insert_input",
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "insert_food_diary_nutrition_item_one",
            },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "object" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "nutritionItem" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateNutritionItemMutationResult,
  CreateNutritionItemMutationVariables
>;
export const CreateRecipeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateRecipe" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "food_diary_recipe_insert_input" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "insert_food_diary_recipe_one" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "object" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateRecipeMutationResult,
  CreateRecipeMutationVariables
>;
export const DeleteEntryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteEntry" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "delete_food_diary_diary_entry_by_pk",
            },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteEntryMutationResult,
  DeleteEntryMutationVariables
>;
export const ExportEntriesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExportEntries" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_diary_entry" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "servings" } },
                { kind: "Field", name: { kind: "Name", value: "consumed_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nutrition_item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "NutritionItemFull" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "recipe" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "recipe_items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "servings" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "nutrition_item" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "FragmentSpread",
                                    name: {
                                      kind: "Name",
                                      value: "NutritionItemFull",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NutritionItemFull" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "food_diary_nutrition_item" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "calories" } },
          { kind: "Field", name: { kind: "Name", value: "total_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "saturated_fat_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "trans_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "polyunsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "monounsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "cholesterol_milligrams" },
          },
          { kind: "Field", name: { kind: "Name", value: "sodium_milligrams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_carbohydrate_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "dietary_fiber_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_sugars_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "added_sugars_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "protein_grams" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ExportEntriesQueryResult,
  ExportEntriesQueryVariables
>;
export const GetDiaryEntryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetDiaryEntry" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_diary_entry_by_pk" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "consumed_at" } },
                { kind: "Field", name: { kind: "Name", value: "calories" } },
                { kind: "Field", name: { kind: "Name", value: "servings" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nutrition_item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "calories" },
                      },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "Macros" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "recipe" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "calories" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "recipe_items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "servings" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "nutrition_item" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "calories" },
                                  },
                                  {
                                    kind: "FragmentSpread",
                                    name: { kind: "Name", value: "Macros" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Macros" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "food_diary_nutrition_item" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "total_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "added_sugars_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "protein_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "saturated_fat_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "trans_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "polyunsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "monounsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "cholesterol_milligrams" },
          },
          { kind: "Field", name: { kind: "Name", value: "sodium_milligrams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_carbohydrate_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "dietary_fiber_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_sugars_grams" },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDiaryEntryQueryResult,
  GetDiaryEntryQueryVariables
>;
export const GetEntriesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetEntries" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_diary_entry" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "order_by" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "day" },
                      value: { kind: "EnumValue", value: "desc" },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "consumed_at" },
                      value: { kind: "EnumValue", value: "asc" },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "day" } },
                { kind: "Field", name: { kind: "Name", value: "consumed_at" } },
                { kind: "Field", name: { kind: "Name", value: "calories" } },
                { kind: "Field", name: { kind: "Name", value: "servings" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nutrition_item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "calories" },
                      },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "Macros" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "recipe" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "calories" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "recipe_items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "servings" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "nutrition_item" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "calories" },
                                  },
                                  {
                                    kind: "FragmentSpread",
                                    name: { kind: "Name", value: "Macros" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Macros" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "food_diary_nutrition_item" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "total_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "added_sugars_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "protein_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "saturated_fat_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "trans_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "polyunsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "monounsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "cholesterol_milligrams" },
          },
          { kind: "Field", name: { kind: "Name", value: "sodium_milligrams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_carbohydrate_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "dietary_fiber_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_sugars_grams" },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetEntriesQueryResult, GetEntriesQueryVariables>;
export const GetEntriesAroundTimeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetEntriesAroundTime" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "startTime" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "timestamptz" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "endTime" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "timestamptz" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_diary_entry" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "where" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "consumed_at" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "_gte" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "startTime" },
                            },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "_lte" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "endTime" },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "order_by" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "consumed_at" },
                      value: { kind: "EnumValue", value: "desc" },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "consumed_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nutrition_item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "recipe" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEntriesAroundTimeQueryResult,
  GetEntriesAroundTimeQueryVariables
>;
export const GetNutritionItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetNutritionItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_nutrition_item_by_pk" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "calories" } },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "totalFatGrams" },
                  name: { kind: "Name", value: "total_fat_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "saturatedFatGrams" },
                  name: { kind: "Name", value: "saturated_fat_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "transFatGrams" },
                  name: { kind: "Name", value: "trans_fat_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "polyunsaturatedFatGrams" },
                  name: { kind: "Name", value: "polyunsaturated_fat_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "monounsaturatedFatGrams" },
                  name: { kind: "Name", value: "monounsaturated_fat_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "cholesterolMilligrams" },
                  name: { kind: "Name", value: "cholesterol_milligrams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "sodiumMilligrams" },
                  name: { kind: "Name", value: "sodium_milligrams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "totalCarbohydrateGrams" },
                  name: { kind: "Name", value: "total_carbohydrate_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "dietaryFiberGrams" },
                  name: { kind: "Name", value: "dietary_fiber_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "totalSugarsGrams" },
                  name: { kind: "Name", value: "total_sugars_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "addedSugarsGrams" },
                  name: { kind: "Name", value: "added_sugars_grams" },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "proteinGrams" },
                  name: { kind: "Name", value: "protein_grams" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetNutritionItemQueryResult,
  GetNutritionItemQueryVariables
>;
export const GetRecentEntryItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRecentEntryItems" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_diary_entry_recent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "order_by" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "consumed_at" },
                      value: { kind: "EnumValue", value: "desc" },
                    },
                  ],
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: { kind: "IntValue", value: "10" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "consumed_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nutrition_item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "recipe" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetRecentEntryItemsQueryResult,
  GetRecentEntryItemsQueryVariables
>;
export const GetRecipeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRecipe" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_recipe_by_pk" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "total_servings" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "recipe_items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "servings" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nutrition_item" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "description" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "calories" },
                            },
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "RecipeMacros" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeMacros" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "food_diary_nutrition_item" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "total_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "added_sugars_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "protein_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "saturated_fat_grams" },
          },
          { kind: "Field", name: { kind: "Name", value: "trans_fat_grams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "polyunsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "monounsaturated_fat_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "cholesterol_milligrams" },
          },
          { kind: "Field", name: { kind: "Name", value: "sodium_milligrams" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_carbohydrate_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "dietary_fiber_grams" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "total_sugars_grams" },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetRecipeQueryResult, GetRecipeQueryVariables>;
export const GetWeeklyStatsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetWeeklyStats" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "currentWeekStart" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "timestamptz" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "todayStart" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "timestamptz" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "fourWeeksAgoStart" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "timestamptz" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            alias: { kind: "Name", value: "current_week" },
            name: { kind: "Name", value: "food_diary_diary_entry_aggregate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "where" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "consumed_at" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "_gte" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "currentWeekStart" },
                            },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "_lt" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "todayStart" },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregate" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sum" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "calories" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "past_four_weeks" },
            name: { kind: "Name", value: "food_diary_diary_entry_aggregate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "where" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "consumed_at" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "_gte" },
                            value: {
                              kind: "Variable",
                              name: {
                                kind: "Name",
                                value: "fourWeeksAgoStart",
                              },
                            },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "_lt" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "todayStart" },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregate" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sum" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "calories" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWeeklyStatsQueryResult,
  GetWeeklyStatsQueryVariables
>;
export const GetWeeklyTrendsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetWeeklyTrends" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_trends_weekly" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "week_of_year" },
                },
                { kind: "Field", name: { kind: "Name", value: "protein" } },
                { kind: "Field", name: { kind: "Name", value: "calories" } },
                { kind: "Field", name: { kind: "Name", value: "added_sugar" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWeeklyTrendsQueryResult,
  GetWeeklyTrendsQueryVariables
>;
export const InsertDiaryEntriesWithNewItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "InsertDiaryEntriesWithNewItems" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "entries" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: {
                    kind: "Name",
                    value: "food_diary_diary_entry_insert_input",
                  },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "insert_food_diary_diary_entry" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "objects" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "entries" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "affected_rows" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  InsertDiaryEntriesWithNewItemsMutationResult,
  InsertDiaryEntriesWithNewItemsMutationVariables
>;
export const SearchItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchItems" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_search_nutrition_items" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "args" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "search" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "search" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchItemsQueryResult, SearchItemsQueryVariables>;
export const SearchItemsAndRecipesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchItemsAndRecipes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_search_nutrition_items" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "args" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "search" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "search" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "food_diary_search_recipes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "args" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "search" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "search" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchItemsAndRecipesQueryResult,
  SearchItemsAndRecipesQueryVariables
>;
export const UpdateDiaryEntryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateDiaryEntry" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attrs" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "food_diary_diary_entry_set_input" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "update_food_diary_diary_entry_by_pk",
            },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "pk_columns" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "_set" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attrs" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateDiaryEntryMutationResult,
  UpdateDiaryEntryMutationVariables
>;
export const UpdateItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attrs" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: {
                kind: "Name",
                value: "food_diary_nutrition_item_set_input",
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "update_food_diary_nutrition_item_by_pk",
            },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "pk_columns" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "_set" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attrs" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateItemMutationResult,
  UpdateItemMutationVariables
>;
export const UpdateRecipeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateRecipe" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attrs" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "food_diary_recipe_set_input" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "items" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: {
                    kind: "Name",
                    value: "food_diary_recipe_item_insert_input",
                  },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "update_food_diary_recipe_by_pk" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "pk_columns" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "_set" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attrs" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "delete_food_diary_recipe_item" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "where" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "recipe_id" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "_eq" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "id" },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "affected_rows" },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "insert_food_diary_recipe_item" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "objects" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "items" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "affected_rows" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateRecipeMutationResult,
  UpdateRecipeMutationVariables
>;
