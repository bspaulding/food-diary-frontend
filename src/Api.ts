const host = "https://direct-satyr-14.hasura.app/v1/graphql";

const getEntriesQuery = `
query GetEntries {
    food_diary_diary_entry(order_by: { day: desc, consumed_at: asc }, limit: 10) {
        id
        day
        consumed_at
        servings
        nutrition_item { description }
        recipe { name }
    }
}
`;

async function fetchQuery(
  accessToken: string,
  query: string,
  variables: object = {}
) {
  return await fetch(`${host}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });
}

export async function fetchEntries(accessToken: string) {
  const response = await fetchQuery(accessToken, getEntriesQuery);
  return response.json();
}

const searchItemsAndRecipesQuery = `
query SearchItemsAndRecipes($search: String!) {
  food_diary_search_nutrition_items(args: { search: $search }) {
    id,
    description
  }
  
  food_diary_search_recipes(args: { search: $search }) {
    id,
    name
  }
}
`;

export async function searchItemsAndRecipes(
  accessToken: string,
  search: string
) {
  const response = await fetchQuery(accessToken, searchItemsAndRecipesQuery, {
    search,
  });
  return response.json();
}

const createNutritionItemMutation = `
mutation CreateNutritionItem($nutritionItem: food_diary_nutrition_item_insert_input!) {
	insert_food_diary_nutrition_item_one(object: $nutritionItem) {
    id
  }  
}
`;

export type NutritionItem = {
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

export async function createNutritionItem(
  accessToken: string,
  item: NutritionItem
) {
  const response = await fetchQuery(accessToken, createNutritionItemMutation, {
    nutritionItem: objectToSnakeCaseKeys(item),
  });
  return response.json();
}

function isUppercase(s: string): boolean {
  return s === s.toUpperCase();
}

function camelToSnakeCase(s: string): string {
  return Array.from(s).reduce(
    (acc, c) => acc + (isUppercase(c) ? "_" + c.toLowerCase() : c),
    ""
  );
}

function objectToSnakeCaseKeys(o: object): object {
  return Object.entries(o).reduce(
    (acc, [k, v]) => ({ ...acc, [camelToSnakeCase(k)]: v }),
    {}
  );
}

const getNutritionItemQuery = `
query GetNutritionItem($id: Int!) {
  food_diary_nutrition_item_by_pk(id: $id) {
    id,
    description
    calories
    totalFatGrams: total_fat_grams,
    saturatedFatGrams: saturated_fat_grams,
    transFatGrams: trans_fat_grams,
    polyunsaturatedFatGrams: polyunsaturated_fat_grams
    monounsaturatedFatGrams: monounsaturated_fat_grams
    cholesterolMilligrams: cholesterol_milligrams
    sodiumMilligrams: sodium_milligrams,
    totalCarbohydrateGrams: total_carbohydrate_grams
    dietaryFiberGrams: dietary_fiber_grams
    totalSugarsGrams: total_sugars_grams
    addedSugarsGrams: added_sugars_grams
    proteinGrams: protein_grams
  }
}
`;
export async function fetchNutritionItem(accessToken: string, id: number) {
  const response = await fetchQuery(accessToken, getNutritionItemQuery, { id });
  return response.json();
}

const getRecentEntriesQuery = `
query GetRecentEntryItems {
  food_diary_recently_logged_items {
    recipe { id, name }
    nutrition_item { id, description }
  }
}
`;

export async function fetchRecentEntries(accessToken: string) {
  return (await fetchQuery(accessToken, getRecentEntriesQuery)).json();
}

const createDiaryEntryQuery = `
mutation CreateDiaryEntry($entry: food_diary_diary_entry_insert_input!) {
  insert_food_diary_diary_entry_one(object: $entry) {
    id
  }
}`;

type CreateDiaryEntryInput =
  | CreateDiaryEntryRecipeInput
  | CreateDiaryEntryItemInput;

type CreateDiaryEntryItemInput = {
  servings: number;
  nutrition_item_id: number;
};

type CreateDiaryEntryRecipeInput = {
  servings: number;
  recipe_id: number;
};

export async function createDiaryEntry(
  accessToken: string,
  entry: CreateDiaryEntryInput
) {
  return (
    await fetchQuery(accessToken, createDiaryEntryQuery, { entry })
  ).json();
}

const deleteDiaryEntryQuery = `
mutation DeleteEntry($id: Int!) {
  delete_food_diary_diary_entry_by_pk(id: $id) {
    id
  }
}`;

export async function deleteDiaryEntry(accessToken: string, id: number) {
  return (await fetchQuery(accessToken, deleteDiaryEntryQuery, { id })).json();
}
