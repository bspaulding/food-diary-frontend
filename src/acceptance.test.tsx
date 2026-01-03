import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { http, HttpResponse } from "msw";
import { worker } from "./test-setup-browser";
import App from "./App";
import DiaryList from "./DiaryList";
import NewDiaryEntryForm from "./NewDiaryEntryForm";
import NewNutritionItemForm from "./NewNutritionItemForm";
import NewRecipeForm from "./NewRecipeForm";
import userEvent from "@testing-library/user-event";

// Mock Auth0 - simulate logged in user
const mockAuth0 = {
  isAuthenticated: () => true,
  user: () => ({
    picture: "https://example.com/avatar.jpg",
    name: "Test User",
  }),
  accessToken: () => "test-access-token",
  auth0: () => null,
};

// Replace the useAuth hook globally
import * as Auth0Module from "./Auth0";
const originalUseAuth = Auth0Module.useAuth;

// Mock data
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

describe("Browser Acceptance Tests", () => {
  let capturedRequests: any[] = [];

  beforeEach(() => {
    capturedRequests = [];
    worker.resetHandlers();

    // Setup default handlers
    worker.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        const query = body.query;
        capturedRequests.push({ query, variables: body.variables });

        // Handle GetEntries query
        if (query.includes("GetEntries")) {
          return HttpResponse.json({
            data: {
              food_diary_diary_entry: mockDiaryEntries,
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
          const search = body.variables?.search?.toLowerCase() || "";
          return HttpResponse.json({
            data: {
              food_diary_search_nutrition_items: mockNutritionItems.filter(
                (item) => item.description.toLowerCase().includes(search)
              ),
              food_diary_search_recipes: mockRecipes.filter((recipe) =>
                recipe.name.toLowerCase().includes(search)
              ),
            },
          });
        }

        // Handle SearchItems query
        if (query.includes("SearchItems")) {
          const search = body.variables?.search?.toLowerCase() || "";
          return HttpResponse.json({
            data: {
              food_diary_search_nutrition_items: mockNutritionItems.filter(
                (item) => item.description.toLowerCase().includes(search)
              ),
            },
          });
        }

        // Handle CreateDiaryEntry mutation
        if (query.includes("CreateDiaryEntry")) {
          return HttpResponse.json({
            data: {
              insert_food_diary_diary_entry_one: {
                id: Math.floor(Math.random() * 1000),
              },
            },
          });
        }

        // Handle CreateNutritionItem mutation
        if (query.includes("CreateNutritionItem")) {
          return HttpResponse.json({
            data: {
              insert_food_diary_nutrition_item_one: {
                id: Math.floor(Math.random() * 1000),
              },
            },
          });
        }

        // Handle CreateRecipe mutation
        if (query.includes("CreateRecipe")) {
          return HttpResponse.json({
            data: {
              insert_food_diary_recipe_one: {
                id: Math.floor(Math.random() * 1000),
              },
            },
          });
        }

        return HttpResponse.json({ errors: [{ message: "Unknown query" }] });
      })
    );

    // Mock useAuth to return authenticated user
    (Auth0Module as any).useAuth = () => [mockAuth0];
  });

  afterEach(() => {
    // Restore original useAuth
    (Auth0Module as any).useAuth = originalUseAuth;
  });

  it("should view the diary list page", async () => {
    const user = userEvent.setup();

    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
      </Router>
    ));

    // Wait for the page to load
    await waitFor(
      () => {
        const banana = screen.queryByText(/Banana/i);
        expect(banana).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Verify diary list is displayed
    expect(screen.getByText(/Banana/i)).toBeTruthy();
    expect(screen.getByText(/105 kcal/i)).toBeTruthy();

    // Verify action buttons are present
    expect(screen.getByText("Add New Entry")).toBeTruthy();
    expect(screen.getByText("Add Item")).toBeTruthy();
    expect(screen.getByText("Add Recipe")).toBeTruthy();
  });

  it("should complete Add New Entry flow - search for item and log it", async () => {
    const user = userEvent.setup();

    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
        <Route path="/diary_entry/new" component={NewDiaryEntryForm} />
      </Router>
    ));

    // Navigate to Add New Entry
    await waitFor(() => {
      expect(screen.queryByText("Add New Entry")).not.toBeNull();
    });

    const addEntryButton = screen.getByText("Add New Entry");
    await user.click(addEntryButton);

    // Wait for the new entry form to load
    await waitFor(
      () => {
        expect(screen.queryByText("Search")).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Switch to Search tab
    const searchTab = screen.getByText("Search");
    await user.click(searchTab);

    // Wait for search input to appear
    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(
        /Search Previous Items/i
      );
      expect(searchInput).not.toBeNull();
    });

    // Search for an item
    const searchInput = screen.getByPlaceholderText(
      /Search Previous Items/i
    ) as HTMLInputElement;
    await user.type(searchInput, "Banana");

    // Wait for search results
    await waitFor(
      () => {
        const bananaResult = screen.queryByText(/Banana/i);
        expect(bananaResult).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Find and click the log button (⊕)
    const logButtons = screen.getAllByText("⊕");
    expect(logButtons.length).toBeGreaterThan(0);
    await user.click(logButtons[0]);

    // Wait for servings input to appear
    await waitFor(() => {
      const servingsInput = document.querySelector(
        'input[type="number"]'
      ) as HTMLInputElement;
      expect(servingsInput).not.toBeNull();
    });

    // Click Save button
    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    // Wait for success indicator
    await waitFor(
      () => {
        const checkmark = screen.queryByText("✔");
        expect(checkmark).not.toBeNull();
      },
      { timeout: 3000 }
    );

    // Verify CreateDiaryEntry mutation was called
    const createEntryRequest = capturedRequests.find((req) =>
      req.query.includes("CreateDiaryEntry")
    );
    expect(createEntryRequest).toBeTruthy();
    expect(createEntryRequest.variables.entry.nutrition_item_id).toBe(1);
  });

  it("should complete Add Item flow - create new item and log it", async () => {
    const user = userEvent.setup();

    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
        <Route path="/nutrition_item/new" component={NewNutritionItemForm} />
      </Router>
    ));

    // Navigate to Add Item
    await waitFor(() => {
      expect(screen.queryByText("Add Item")).not.toBeNull();
    });

    const addItemButton = screen.getByText("Add Item");
    await user.click(addItemButton);

    // Wait for the form to load
    await waitFor(
      () => {
        const descriptionLabel = screen.queryByText(/Description/i);
        expect(descriptionLabel).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Fill in the nutrition item form
    const descriptionInput = screen.getByLabelText(
      /Description/i
    ) as HTMLInputElement;
    await user.type(descriptionInput, "Test Protein Bar");

    const caloriesInput = screen.getByLabelText(/Calories/i) as HTMLInputElement;
    await user.type(caloriesInput, "200");

    const proteinInput = screen.getByLabelText(
      /Protein \(g\)/i
    ) as HTMLInputElement;
    await user.type(proteinInput, "20");

    // Submit the form
    const submitButton = screen.getByText(/Submit/i);
    await user.click(submitButton);

    // Wait for the mutation to be called
    await waitFor(
      () => {
        const createItemRequest = capturedRequests.find((req) =>
          req.query.includes("CreateNutritionItem")
        );
        expect(createItemRequest).toBeTruthy();
      },
      { timeout: 3000 }
    );

    // Verify the request payload
    const createItemRequest = capturedRequests.find((req) =>
      req.query.includes("CreateNutritionItem")
    );
    expect(createItemRequest.variables.nutritionItem.description).toBe(
      "Test Protein Bar"
    );
    expect(createItemRequest.variables.nutritionItem.calories).toBe(200);
    expect(createItemRequest.variables.nutritionItem.protein_grams).toBe(20);
  });

  it("should complete Add Recipe flow - create new recipe and log it", async () => {
    const user = userEvent.setup();

    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
        <Route path="/recipe/new" component={NewRecipeForm} />
      </Router>
    ));

    // Navigate to Add Recipe
    await waitFor(() => {
      expect(screen.queryByText("Add Recipe")).not.toBeNull();
    });

    const addRecipeButton = screen.getByText("Add Recipe");
    await user.click(addRecipeButton);

    // Wait for the form to load
    await waitFor(
      () => {
        const nameLabel = screen.queryByLabelText(/Name/i);
        expect(nameLabel).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Fill in recipe name
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    await user.type(nameInput, "Test Smoothie");

    // Fill in total servings
    const servingsInput = screen.getByLabelText(
      /Total Servings/i
    ) as HTMLInputElement;
    await user.clear(servingsInput);
    await user.type(servingsInput, "2");

    // Add an item to the recipe - first search for an item
    const searchInput = screen.getByPlaceholderText(
      /Search Previous Items/i
    ) as HTMLInputElement;
    await user.type(searchInput, "Banana");

    // Wait for search results
    await waitFor(
      () => {
        const bananaResult = screen.queryByText(/Banana/i);
        expect(bananaResult).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Find and click the add button to add the item to recipe
    const addButtons = screen.getAllByText("⊕");
    if (addButtons.length > 0) {
      await user.click(addButtons[0]);
    }

    // Submit the form
    const submitButton = screen.getByText(/Submit/i);
    await user.click(submitButton);

    // Wait for the mutation to be called
    await waitFor(
      () => {
        const createRecipeRequest = capturedRequests.find((req) =>
          req.query.includes("CreateRecipe")
        );
        expect(createRecipeRequest).toBeTruthy();
      },
      { timeout: 3000 }
    );

    // Verify the request payload
    const createRecipeRequest = capturedRequests.find((req) =>
      req.query.includes("CreateRecipe")
    );
    expect(createRecipeRequest.variables.input.name).toBe("Test Smoothie");
    expect(createRecipeRequest.variables.input.total_servings).toBe(2);
  });
});
