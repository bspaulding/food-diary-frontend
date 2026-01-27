import { describe, it, expect, vi, afterEach } from "vitest";
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

    // Wait for the page to load - check for action buttons which should always be present
    await waitFor(
      () => {
        const addEntryButton = screen.queryByText("Add New Entry");
        expect(addEntryButton).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Verify action buttons are present
    expect(screen.getByText("Add New Entry")).toBeTruthy();
    expect(screen.getByText("Add Item")).toBeTruthy();
    expect(screen.getByText("Add Recipe")).toBeTruthy();
    
    // If using mock backend (worker is defined and not undefined), verify mock data is displayed
    if (worker !== undefined) {
      // Wait for mock data to load
      await waitFor(
        () => {
          const banana = screen.queryByText(/Banana/i);
          expect(banana).not.toBeNull();
        },
        { timeout: 5000 },
      );
      expect(screen.getByText(/Banana/i)).toBeTruthy();
      expect(screen.getByText(/105 kcal/i)).toBeTruthy();
    }
  });

  it("should display weekly calorie summary stats", async () => {
    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
      </Router>
    ));

    // Wait for the page to load by checking for action buttons
    await waitFor(
      () => {
        const addEntryButton = screen.queryByText("Add New Entry");
        expect(addEntryButton).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Wait for the weekly stats to be fetched and displayed
    await waitFor(
      () => {
        const last7DaysLabel = screen.queryByText(/LAST 7 DAYS/i);
        expect(last7DaysLabel).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Verify weekly summary labels are displayed
    expect(screen.getByText(/LAST 7 DAYS/i)).toBeTruthy();
    expect(screen.getByText(/4 WEEK AVG/i)).toBeTruthy();

    // If using mock backend, verify specific mock values
    if (worker !== undefined) {
      // Both Last 7 Days and 4 Week Avg show 300 kcal/day in the mock data
      const kcalElements = screen.getAllByText(/300 kcal\/day/);
      expect(kcalElements).toHaveLength(2);
    } else {
      // For live backend, just verify that stats are displayed with kcal/day unit
      const kcalElements = screen.getAllByText(/\d+ kcal\/day/);
      expect(kcalElements.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should complete Add Item flow - create new item and log it", async () => {
    const user = userEvent.setup();

    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
        <Route
          path="/nutrition_item/new"
          component={NewNutritionItemForm as any}
        />
        <Route path="/diary_entry/new" component={NewDiaryEntryForm as any} />
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
        const descriptionInput = document.querySelector(
          'input[name="description"]',
        );
        expect(descriptionInput).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Fill in the nutrition item form
    const descriptionInput = document.querySelector(
      'input[name="description"]',
    ) as HTMLInputElement;
    await user.type(descriptionInput, "Test Protein Bar");

    const caloriesInput = document.querySelector(
      'input[name="calories"]',
    ) as HTMLInputElement;
    await user.type(caloriesInput, "200");

    const proteinInput = document.querySelector(
      'input[name="protein-grams"]',
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
      { timeout: 5000 },
    );
  });
});
