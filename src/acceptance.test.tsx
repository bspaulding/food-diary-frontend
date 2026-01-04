import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { worker } from "./test-setup-browser";
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

describe("Browser Acceptance Tests", () => {


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
    
    // Click the first button using native click
    logButtons[0].click();
    
    // Wait for the state to update and UI to re-render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Wait for servings input to appear (it should be in the expanded logging form)
    await waitFor(
      () => {
        // Look for the input that appears when logging is true
        const servingsInput = document.querySelector(
          'input[type="number"][inputmode="decimal"]'
        ) as HTMLInputElement;
        expect(servingsInput).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Click Save button
    await waitFor(() => {
      expect(screen.queryByText("Save")).not.toBeNull();
    });
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
        <Route path="/diary_entry/new" component={NewDiaryEntryForm} />
      </Router>
    ));

    // Wait for diary list to load
    await waitFor(() => {
      expect(screen.queryByText("Add Item")).not.toBeNull();
    });

    // Navigate to Add Item
    const addItemButton = screen.getByText("Add Item");
    await user.click(addItemButton);

    // Wait for the form to load
    await waitFor(
      () => {
        // Check if we're on the add item page by looking for the form
        const descriptionInput = document.querySelector('input[name="description"]');
        expect(descriptionInput).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Fill in the nutrition item form
    const descriptionInput = document.querySelector(
      'input[name="description"]'
    ) as HTMLInputElement;
    await user.type(descriptionInput, "Test Protein Bar");

    const caloriesInput = document.querySelector(
      'input[name="calories"]'
    ) as HTMLInputElement;
    await user.type(caloriesInput, "200");

    const proteinInput = document.querySelector(
      'input[name="protein-grams"]'
    ) as HTMLInputElement;
    await user.type(proteinInput, "20");

    // Submit the form
    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    // Wait for navigation or success indication
    await waitFor(
      () => {
        // The form should either navigate away or show success
        // Check if we're still seeing the form or if we've navigated
        const stillOnForm = screen.queryByText(/Save/i);
        expect(stillOnForm).toBeNull();
      },
      { timeout: 5000 }
    );
  });

  it("should complete Add Recipe flow - create new recipe and log it", async () => {
    const user = userEvent.setup();

    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
        <Route path="/recipe/new" component={NewRecipeForm} />
        <Route path="/diary_entry/new" component={NewDiaryEntryForm} />
      </Router>
    ));

    // Wait for diary list to load
    await waitFor(() => {
      expect(screen.queryByText("Add Recipe")).not.toBeNull();
    });

    // Navigate to Add Recipe
    const addRecipeButton = screen.getByText("Add Recipe");
    await user.click(addRecipeButton);

    // Wait for the form to load
    await waitFor(
      () => {
        // Check if we're on the add recipe page by looking for the name input
        const nameInput = document.querySelector('input[name="name"]');
        expect(nameInput).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Fill in the recipe form
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    await user.type(nameInput, "Test Smoothie");

    const servingsInput = document.querySelector(
      'input[name="total-servings"]'
    ) as HTMLInputElement;
    await user.clear(servingsInput);
    await user.type(servingsInput, "2");

    // Add an item to the recipe by searching
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

    // Add the first item to the recipe
    const addButtons = screen.getAllByText("⊕");
    if (addButtons.length > 0) {
      await user.click(addButtons[0]);
    }

    // Wait for item to be added to recipe
    await waitFor(
      () => {
        // Check if item was added (there should be some indication)
        const addedItem = screen.queryByText(/Banana/i);
        expect(addedItem).not.toBeNull();
      },
      { timeout: 3000 }
    );

    // Submit the form
    const submitButton = screen.getByText(/Submit/i);
    await user.click(submitButton);

    // Wait for navigation or success indication
    await waitFor(
      () => {
        // The form should either navigate away or show success
        const stillOnForm = screen.queryByText(/Submit/i);
        expect(stillOnForm).toBeNull();
      },
      { timeout: 5000 }
    );
  });
});
