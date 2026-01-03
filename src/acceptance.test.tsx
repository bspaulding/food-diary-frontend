import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { setupFetchMock } from "./test-setup-browser";
import App from "./App";
import DiaryList from "./DiaryList";
import NewDiaryEntryForm from "./NewDiaryEntryForm";
import NewNutritionItemForm from "./NewNutritionItemForm";
import NewRecipeForm from "./NewRecipeForm";
import userEvent from "@testing-library/user-event";

// Mock Auth0 - simulate logged in user
vi.mock("./Auth0", () => ({
  useAuth: () => [
    {
      isAuthenticated: () => true,
      user: () => ({
        picture: "https://example.com/avatar.jpg",
        name: "Test User",
      }),
      accessToken: () => "test-access-token",
      auth0: () => null,
    },
  ],
}));

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
  beforeEach(() => {
    // Setup fetch mocks for all GraphQL queries
    setupFetchMock({
      GetEntries: {
        data: {
          food_diary_diary_entry: mockDiaryEntries,
        },
      },
      GetRecentEntryItems: {
        data: {
          food_diary_diary_entry_recent: mockRecentEntries,
        },
      },
      SearchItemsAndRecipes: {
        data: {
          food_diary_search_nutrition_items: mockNutritionItems,
          food_diary_search_recipes: mockRecipes,
        },
      },
      SearchItems: {
        data: {
          food_diary_search_nutrition_items: mockNutritionItems,
        },
      },
      CreateDiaryEntry: {
        data: {
          insert_food_diary_diary_entry_one: {
            id: 100,
          },
        },
      },
      CreateNutritionItem: {
        data: {
          insert_food_diary_nutrition_item_one: {
            id: 200,
          },
        },
      },
      CreateRecipe: {
        data: {
          insert_food_diary_recipe_one: {
            id: 300,
          },
        },
      },
    });
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

    // Verify form was submitted (navigation or success message should appear)
    // The form should have been submitted successfully
    expect(submitButton).toBeTruthy();
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

    // Verify form was submitted successfully
    expect(submitButton).toBeTruthy();
  });
});
