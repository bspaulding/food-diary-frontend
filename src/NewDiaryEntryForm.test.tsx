import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import NewDiaryEntryForm from "./NewDiaryEntryForm";

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

describe("NewDiaryEntryForm", () => {
  it("should display time-based suggestions when available", async () => {
    // Mock GraphQL responses
    server.use(
      http.post("*/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        const query = body.query || "";

        // Mock GetEntriesAroundTime query (time-based suggestions)
        if (query.includes("GetEntriesAroundTime")) {
          return HttpResponse.json({
            data: {
              food_diary_diary_entry: [
                {
                  consumed_at: "2024-01-24T05:30:00Z",
                  nutrition_item: { id: 1, description: "Morning Oatmeal" },
                  recipe: null,
                },
                {
                  consumed_at: "2024-01-24T05:15:00Z",
                  nutrition_item: null,
                  recipe: { id: 2, name: "Breakfast Smoothie" },
                },
              ],
            },
          });
        }

        // Mock GetRecentEntryItems query (regular suggestions)
        if (query.includes("GetRecentEntryItems")) {
          return HttpResponse.json({
            data: {
              food_diary_diary_entry_recent: [
                {
                  consumed_at: "2024-01-23T18:00:00Z",
                  nutrition_item: { id: 3, description: "Dinner Salad" },
                  recipe: null,
                },
              ],
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    render(() => <NewDiaryEntryForm onSubmit={() => ({})} />);

    // Wait for the component to load
    await waitFor(
      () => {
        expect(screen.queryByText("Suggestions")).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Check that the time-based header appears
    await waitFor(
      () => {
        const timeBasedHeader = screen.queryByText("Logged around this time");
        expect(timeBasedHeader).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Verify time-based suggestions are displayed
    expect(screen.queryByText("Morning Oatmeal")).not.toBeNull();
    expect(screen.queryByText("Breakfast Smoothie")).not.toBeNull();

    // Verify regular suggestions section still exists
    expect(screen.queryByText("Suggested Items")).not.toBeNull();
    expect(screen.queryByText("Dinner Salad")).not.toBeNull();
  });

  it("should not display time-based header when no time-based suggestions", async () => {
    // Mock GraphQL responses
    server.use(
      http.post("*/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        const query = body.query || "";

        // Mock GetEntriesAroundTime query - empty response
        if (query.includes("GetEntriesAroundTime")) {
          return HttpResponse.json({
            data: {
              food_diary_diary_entry: [],
            },
          });
        }

        // Mock GetRecentEntryItems query (regular suggestions)
        if (query.includes("GetRecentEntryItems")) {
          return HttpResponse.json({
            data: {
              food_diary_diary_entry_recent: [
                {
                  consumed_at: "2024-01-23T18:00:00Z",
                  nutrition_item: { id: 3, description: "Dinner Salad" },
                  recipe: null,
                },
              ],
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    render(() => <NewDiaryEntryForm onSubmit={() => ({})} />);

    // Wait for the component to load
    await waitFor(
      () => {
        expect(screen.queryByText("Suggestions")).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Verify regular suggestions section exists
    await waitFor(
      () => {
        expect(screen.queryByText("Suggested Items")).not.toBeNull();
      },
      { timeout: 5000 },
    );

    // Time-based header should NOT appear when there are no time-based suggestions
    const timeBasedHeader = screen.queryByText("Logged around this time");
    expect(timeBasedHeader).toBeNull();
  });

  it("should display Search tab and allow searching for items", async () => {
    const user = await import("@testing-library/user-event").then((m) =>
      m.default.setup(),
    );

    // Mock GraphQL responses
    server.use(
      http.post("*/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        const query = body.query || "";

        // Mock GetRecentEntryItems query
        if (query.includes("GetRecentEntryItems")) {
          return HttpResponse.json({
            data: { food_diary_diary_entry: [] },
          });
        }

        // Mock GetEntriesAroundTime query
        if (query.includes("GetEntriesAroundTime")) {
          return HttpResponse.json({
            data: { food_diary_diary_entry: [] },
          });
        }

        // Mock search query
        if (query.includes("SearchNutritionItems")) {
          return HttpResponse.json({
            data: {
              food_diary_nutrition_item: [
                { id: 10, description: "Search Result Item" },
              ],
              food_diary_recipe: [],
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    render(() => <NewDiaryEntryForm />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText("Suggested Items")).not.toBeNull();
    });

    // Click on Search tab
    const searchTab = screen.getByText("Search");
    await user.click(searchTab);

    // Verify we're in search mode (SearchItemsForm should be rendered)
    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).not.toBeNull();
    });
  });

  it("should handle servings input and save diary entry", async () => {
    const user = await import("@testing-library/user-event").then((m) =>
      m.default.setup(),
    );
    let createEntryCalled = false;

    // Mock GraphQL responses
    server.use(
      http.post("*/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        const query = body.query || "";

        // Mock GetRecentEntryItems query with one item
        if (query.includes("GetRecentEntryItems")) {
          return HttpResponse.json({
            data: {
              food_diary_diary_entry_recent: [
                {
                  consumed_at: "2024-01-24T08:00:00Z",
                  nutrition_item: { id: 5, description: "Test Food" },
                  recipe: null,
                },
              ],
            },
          });
        }

        // Mock GetEntriesAroundTime query
        if (query.includes("GetEntriesAroundTime")) {
          return HttpResponse.json({
            data: { food_diary_diary_entry: [] },
          });
        }

        // Mock CreateDiaryEntry mutation
        if (query.includes("CreateDiaryEntry")) {
          createEntryCalled = true;
          const { attrs } = body.variables;
          expect(attrs.servings).toBe(2.5);
          expect(attrs.nutrition_item_id).toBe(5);
          return HttpResponse.json({
            data: {
              insert_food_diary_diary_entry_one: { id: 100 },
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    render(() => <NewDiaryEntryForm />);

    // Wait for suggestions to load
    await waitFor(() => {
      expect(screen.queryByText("Test Food")).not.toBeNull();
    });

    // Click the ⊕ button on the first item
    const logButtons = screen.getAllByText("⊕");
    await user.click(logButtons[0]);

    // Wait for the logging dialog to appear
    await waitFor(() => {
      const saveButton = screen.queryByText("Save");
      expect(saveButton).not.toBeNull();
    });

    // Change servings value
    const servingsInput = screen.getByRole("spinbutton") as HTMLInputElement;
    await user.clear(servingsInput);
    await user.type(servingsInput, "2.5");

    // Click Save button
    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    // Verify the mutation was called
    await waitFor(() => {
      expect(createEntryCalled).toBe(true);
    });
  });

  it("should handle saving recipe entry", async () => {
    const user = await import("@testing-library/user-event").then((m) =>
      m.default.setup(),
    );
    let createEntryCalled = false;

    // Mock GraphQL responses
    server.use(
      http.post("*/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        const query = body.query || "";

        // Mock GetRecentEntryItems query with a recipe
        if (query.includes("GetRecentEntryItems")) {
          return HttpResponse.json({
            data: {
              food_diary_diary_entry_recent: [
                {
                  consumed_at: "2024-01-24T08:00:00Z",
                  nutrition_item: null,
                  recipe: { id: 3, name: "Test Recipe" },
                },
              ],
            },
          });
        }

        // Mock GetEntriesAroundTime query
        if (query.includes("GetEntriesAroundTime")) {
          return HttpResponse.json({
            data: { food_diary_diary_entry: [] },
          });
        }

        // Mock CreateDiaryEntry mutation for recipe
        if (query.includes("CreateDiaryEntry")) {
          createEntryCalled = true;
          const { attrs } = body.variables;
          expect(attrs.servings).toBe(1);
          expect(attrs.recipe_id).toBe(3);
          return HttpResponse.json({
            data: {
              insert_food_diary_diary_entry_one: { id: 101 },
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    render(() => <NewDiaryEntryForm />);

    // Wait for suggestions to load
    await waitFor(() => {
      expect(screen.queryByText("Test Recipe")).not.toBeNull();
    });

    // Click the ⊕ button on the recipe
    const logButtons = screen.getAllByText("⊕");
    await user.click(logButtons[0]);

    // Wait for the logging dialog to appear
    await waitFor(() => {
      const saveButton = screen.queryByText("Save");
      expect(saveButton).not.toBeNull();
    });

    // Click Save button (servings is already 1)
    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    // Verify the mutation was called
    await waitFor(() => {
      expect(createEntryCalled).toBe(true);
    });
  });
});
