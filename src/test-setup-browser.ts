import { beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

// Mock data for tests - defined here so handlers can access them
const mockNutritionItems = [
  {
    id: 1,
    description: "Banana",
    calories: 105,
    total_fat_grams: 0.4,
    added_sugars_grams: 0,
    protein_grams: 1.3,
  },
  {
    id: 2,
    description: "Apple",
    calories: 95,
    total_fat_grams: 0.3,
    added_sugars_grams: 0,
    protein_grams: 0.5,
  },
];

const mockRecipes = [
  {
    id: 1,
    name: "Fruit Salad",
    calories: 200,
    recipe_items: [
      {
        servings: 1,
        nutrition_item: mockNutritionItems[0],
      },
      {
        servings: 1,
        nutrition_item: mockNutritionItems[1],
      },
    ],
  },
];

const mockDiaryEntries = [
  {
    id: 1,
    consumed_at: "2024-01-01T12:00:00Z",
    servings: 1,
    calories: 105,
    nutrition_item: mockNutritionItems[0],
    recipe: null,
  },
];

const mockRecentEntries = [
  {
    consumed_at: "2024-01-01T12:00:00Z",
    nutrition_item: mockNutritionItems[0],
    recipe: null,
  },
];

// Setup MSW worker for browser mode with handlers
export const worker = setupWorker(
  http.post("*/api/v1/graphql", async ({ request }) => {
    const body = (await request.json()) as any;
    const query = body.query || "";

    // Handle GetEntries query
    if (query.includes("GetEntries")) {
      return HttpResponse.json({
        data: {
          food_diary_diary_entry: mockDiaryEntries,
        },
      });
    }

    // Handle GetWeeklyTrends query
    if (query.includes("GetWeeklyTrends")) {
      return HttpResponse.json({
        data: {
          food_diary_trends_weekly: [],
        },
      });
    }

    // Handle GetRecentEntryItems query
    if (query.includes("GetRecentEntryItems")) {
      return HttpResponse.json({
        data: {
          food_diary_diary_entry_recent: mockRecentEntries,
        },
      });
    }

    // Handle SearchItemsAndRecipes query
    if (query.includes("SearchItemsAndRecipes")) {
      return HttpResponse.json({
        data: {
          food_diary_search_nutrition_items: mockNutritionItems,
          food_diary_search_recipes: mockRecipes,
        },
      });
    }

    // Handle SearchItems query
    if (query.includes("SearchItems")) {
      return HttpResponse.json({
        data: {
          food_diary_search_nutrition_items: mockNutritionItems,
        },
      });
    }

    // Handle CreateDiaryEntry mutation
    if (query.includes("CreateDiaryEntry")) {
      return HttpResponse.json({
        data: {
          insert_food_diary_diary_entry_one: {
            id: 100,
          },
        },
      });
    }

    // Handle CreateNutritionItem mutation
    if (query.includes("CreateNutritionItem")) {
      return HttpResponse.json({
        data: {
          insert_food_diary_nutrition_item_one: {
            id: 200,
          },
        },
      });
    }

    // Handle CreateRecipe mutation
    if (query.includes("CreateRecipe")) {
      return HttpResponse.json({
        data: {
          insert_food_diary_recipe_one: {
            id: 300,
          },
        },
      });
    }

    // If we reach here, it's an unhandled GraphQL query
    // Throw an error so the test fails
    console.error("Unhandled GraphQL query:", query);
    throw new Error(`Unhandled GraphQL query: ${query.substring(0, 100)}`);
  })
);

beforeAll(async () => {
  // Start the worker with strict mode: unhandled requests will cause errors
  await worker.start({
    onUnhandledRequest: "error",
    quiet: false,
  });
});

afterEach(() => {
  // Reset handlers after each test to ensure test isolation
  worker.resetHandlers();
});

afterAll(() => {
  // Stop the worker when tests are done
  worker.stop();
});
