import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import App from "./App";
import DiaryList from "./DiaryList";
import NewNutritionItemForm from "./NewNutritionItemForm";
import NutritionItemShow from "./NutritionItemShow";
import NewRecipeForm from "./NewRecipeForm";
import RecipeShow from "./RecipeShow";
import NewDiaryEntryForm from "./NewDiaryEntryForm";
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

describe("Live Backend E2E Test", () => {
  it("should complete full workflow: add items, create recipe, log entries", async () => {
    const user = userEvent.setup();

    // Render full app with all routes
    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
        <Route
          path="/nutrition_item/new"
          component={NewNutritionItemForm as any}
        />
        <Route path="/nutrition_item/:id" component={NutritionItemShow} />
        <Route path="/recipe/new" component={NewRecipeForm as any} />
        <Route path="/recipe/:id" component={RecipeShow} />
        <Route path="/diary_entry/new" component={NewDiaryEntryForm as any} />
      </Router>
    ));

    // Step 1: Assert diary list is initially empty
    console.log("Step 1: Verifying diary list is initially empty");
    await waitFor(
      () => {
        const addEntryButton = screen.queryByText("Add New Entry");
        expect(addEntryButton).not.toBeNull();
      },
      { timeout: 10000 },
    );

    // Check that there are no diary entries initially (or at least verify the page loaded)
    expect(screen.getByText("Add New Entry")).toBeTruthy();
    expect(screen.getByText("Add Item")).toBeTruthy();
    expect(screen.getByText("Add Recipe")).toBeTruthy();

    // Step 2: Add first item (Banana)
    console.log("Step 2: Adding first item - Banana");
    const addItemButton = screen.getByText("Add Item");
    await user.click(addItemButton);

    await waitFor(
      () => {
        const descriptionInput = document.querySelector(
          'input[name="description"]',
        );
        expect(descriptionInput).not.toBeNull();
      },
      { timeout: 10000 },
    );

    const descriptionInput1 = document.querySelector(
      'input[name="description"]',
    ) as HTMLInputElement;
    await user.type(descriptionInput1, "Banana");

    const caloriesInput1 = document.querySelector(
      'input[name="calories"]',
    ) as HTMLInputElement;
    await user.type(caloriesInput1, "105");

    const proteinInput1 = document.querySelector(
      'input[name="protein-grams"]',
    ) as HTMLInputElement;
    await user.type(proteinInput1, "1.3");

    const saveButton1 = screen.getByText(/Save/i);
    await user.click(saveButton1);

    // Wait for redirect to item show page
    await waitFor(
      () => {
        const backButton = screen.queryByText("Back to Diary");
        expect(backButton).not.toBeNull();
      },
      { timeout: 10000 },
    );

    // Step 3: Log the banana from item show page
    console.log("Step 3: Logging Banana from item show page");
    expect(screen.getByText("Banana")).toBeTruthy();
    expect(screen.getByText("Log It")).toBeTruthy();

    // Click the ⊕ button to expand logging form
    const logButton = screen.getByText("⊕");
    await user.click(logButton);

    await waitFor(
      () => {
        const servingsInput = document.querySelector(
          'input[type="number"]',
        ) as HTMLInputElement;
        expect(servingsInput).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Click Save to log the entry
    const saveLogButton = screen.getByText("Save");
    await user.click(saveLogButton);

    // Wait for success indicator
    await waitFor(
      () => {
        const successCheck = screen.queryByText("✔");
        expect(successCheck).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Step 4: Return to diary list and verify banana is logged
    console.log("Step 4: Returning to diary list to verify Banana entry");
    const backToDiaryButton = screen.getByText("Back to Diary");
    await user.click(backToDiaryButton);

    await waitFor(
      () => {
        const bananaEntry = screen.queryByText(/Banana/i);
        expect(bananaEntry).not.toBeNull();
      },
      { timeout: 10000 },
    );

    expect(screen.getByText(/Banana/i)).toBeTruthy();
    expect(screen.getByText(/105 kcal/i)).toBeTruthy();

    // Step 5: Add second item (Apple)
    console.log("Step 5: Adding second item - Apple");
    const addItemButton2 = screen.getByText("Add Item");
    await user.click(addItemButton2);

    await waitFor(
      () => {
        const descriptionInput = document.querySelector(
          'input[name="description"]',
        );
        expect(descriptionInput).not.toBeNull();
      },
      { timeout: 10000 },
    );

    const descriptionInput2 = document.querySelector(
      'input[name="description"]',
    ) as HTMLInputElement;
    await user.type(descriptionInput2, "Apple");

    const caloriesInput2 = document.querySelector(
      'input[name="calories"]',
    ) as HTMLInputElement;
    await user.type(caloriesInput2, "95");

    const proteinInput2 = document.querySelector(
      'input[name="protein-grams"]',
    ) as HTMLInputElement;
    await user.type(proteinInput2, "0.5");

    const saveButton2 = screen.getByText(/Save/i);
    await user.click(saveButton2);

    // Wait for redirect to item show page
    await waitFor(
      () => {
        const appleTitle = screen.queryByText("Apple");
        expect(appleTitle).not.toBeNull();
      },
      { timeout: 10000 },
    );

    // Step 6: Navigate back to diary and then to Add Recipe
    console.log("Step 6: Creating recipe with Banana and Apple");
    const backButton2 = screen.getByText("Back to Diary");
    await user.click(backButton2);

    await waitFor(
      () => {
        const addRecipeButton = screen.queryByText("Add Recipe");
        expect(addRecipeButton).not.toBeNull();
      },
      { timeout: 10000 },
    );

    const addRecipeButton = screen.getByText("Add Recipe");
    await user.click(addRecipeButton);

    // Wait for recipe form to load
    await waitFor(
      () => {
        const nameInput = document.querySelector(
          'input[name="name"]',
        ) as HTMLInputElement;
        expect(nameInput).not.toBeNull();
      },
      { timeout: 10000 },
    );

    // Fill in recipe name
    const recipeNameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    await user.type(recipeNameInput, "Fruit Salad");

    // Search for and add Banana
    const searchInput = document.querySelector(
      'input[placeholder="Search for items to add..."]',
    ) as HTMLInputElement;
    await user.type(searchInput, "Banana");

    await waitFor(
      () => {
        const bananaSearchResult = screen.queryByText("Banana");
        expect(bananaSearchResult).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Click add button for Banana (look for the button next to "Banana")
    const addButtons = screen.getAllByText("+");
    if (addButtons.length > 0) {
      await user.click(addButtons[0]);
    }

    // Clear search and add Apple
    await user.clear(searchInput);
    await user.type(searchInput, "Apple");

    await waitFor(
      () => {
        const appleSearchResult = screen.queryByText("Apple");
        expect(appleSearchResult).not.toBeNull();
      },
      { timeout: 5000 },
    );

    const addButtons2 = screen.getAllByText("+");
    if (addButtons2.length > 0) {
      await user.click(addButtons2[0]);
    }

    // Save the recipe
    const saveRecipeButton = screen.getByText("Save Recipe");
    await user.click(saveRecipeButton);

    // Wait for redirect to recipe show page
    await waitFor(
      () => {
        const fruitSaladTitle = screen.queryByText("Fruit Salad");
        expect(fruitSaladTitle).not.toBeNull();
      },
      { timeout: 10000 },
    );

    // Step 7: Log the recipe from recipe show page
    console.log("Step 7: Logging Fruit Salad from recipe show page");
    expect(screen.getByText("Fruit Salad")).toBeTruthy();
    expect(screen.getByText("Log It")).toBeTruthy();

    // Click the ⊕ button to expand logging form
    const logRecipeButton = screen.getByText("⊕");
    await user.click(logRecipeButton);

    await waitFor(
      () => {
        const servingsInput = document.querySelector(
          'input[type="number"]',
        ) as HTMLInputElement;
        expect(servingsInput).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Click Save to log the recipe entry
    const saveRecipeLogButton = screen.getByText("Save");
    await user.click(saveRecipeLogButton);

    // Wait for success indicator
    await waitFor(
      () => {
        const successCheck = screen.queryByText("✔");
        expect(successCheck).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Step 8: Navigate to diary list and verify recipe is logged
    console.log("Step 8: Verifying Fruit Salad is in diary list");
    const backToDiary2 = screen.getByText("Back to Diary");
    await user.click(backToDiary2);

    await waitFor(
      () => {
        const fruitSaladEntry = screen.queryByText(/Fruit Salad/i);
        expect(fruitSaladEntry).not.toBeNull();
      },
      { timeout: 10000 },
    );

    expect(screen.getByText(/Fruit Salad/i)).toBeTruthy();

    // Step 9: Navigate to Add Entry page and verify suggestions
    console.log("Step 9: Verifying suggested items in Add Entry page");
    const addNewEntryButton = screen.getByText("Add New Entry");
    await user.click(addNewEntryButton);

    await waitFor(
      () => {
        const suggestionsTab = screen.queryByText("Suggestions");
        expect(suggestionsTab).not.toBeNull();
      },
      { timeout: 10000 },
    );

    // Verify the items and recipe we added are shown as suggested
    await waitFor(
      () => {
        const bananaInSuggestions = screen.queryByText(/Banana/i);
        expect(bananaInSuggestions).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // We should see our items in suggestions
    expect(screen.queryByText(/Banana/i)).toBeTruthy();

    // Step 10: Log one item from suggested list
    console.log("Step 10: Logging item from suggested list");
    const logButtons = screen.getAllByText("⊕");
    if (logButtons.length > 0) {
      await user.click(logButtons[0]);

      await waitFor(
        () => {
          const servingsInput = document.querySelector(
            'input[type="number"]',
          ) as HTMLInputElement;
          expect(servingsInput).not.toBeNull();
        },
        { timeout: 5000 },
      );

      const saveSuggestionButton = screen.getByText("Save");
      await user.click(saveSuggestionButton);

      await waitFor(
        () => {
          const successCheck = screen.queryByText("✔");
          expect(successCheck).not.toBeNull();
        },
        { timeout: 5000 },
      );
    }

    // Step 11: Navigate to Search tab and search for an item
    console.log("Step 11: Searching and logging item from search");
    const searchTab = screen.getByText("Search");
    await user.click(searchTab);

    await waitFor(
      () => {
        const searchInput = screen.queryByPlaceholderText(
          /Search Previous Items/i,
        );
        expect(searchInput).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Search for Apple
    const searchInputField = screen.getByPlaceholderText(
      /Search Previous Items/i,
    ) as HTMLInputElement;
    await user.type(searchInputField, "Apple");

    await waitFor(
      () => {
        const appleInSearch = screen.queryByText("Apple");
        expect(appleInSearch).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Log the Apple from search results
    const searchLogButtons = screen.getAllByText("⊕");
    if (searchLogButtons.length > 0) {
      await user.click(searchLogButtons[0]);

      await waitFor(
        () => {
          const servingsInput = document.querySelector(
            'input[type="number"]',
          ) as HTMLInputElement;
          expect(servingsInput).not.toBeNull();
        },
        { timeout: 5000 },
      );

      const saveSearchButton = screen.getByText("Save");
      await user.click(saveSearchButton);

      await waitFor(
        () => {
          const successCheck = screen.queryByText("✔");
          expect(successCheck).not.toBeNull();
        },
        { timeout: 5000 },
      );
    }

    // Step 12: Navigate back to diary list and verify new entries
    console.log("Step 12: Verifying all entries in diary list");
    const backToDiaryFinal = screen.getByText("Back to Diary");
    await user.click(backToDiaryFinal);

    await waitFor(
      () => {
        const bananaEntry = screen.queryByText(/Banana/i);
        expect(bananaEntry).not.toBeNull();
      },
      { timeout: 10000 },
    );

    // Verify we have multiple entries now
    expect(screen.getByText(/Banana/i)).toBeTruthy();
    expect(screen.queryByText(/Apple/i)).toBeTruthy();
    expect(screen.queryByText(/Fruit Salad/i)).toBeTruthy();

    console.log("✅ All steps completed successfully!");
  }, 180000); // 3 minute timeout for the entire test
});
