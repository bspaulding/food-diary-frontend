import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import NewDiaryEntryForm from "./NewDiaryEntryForm";

interface GraphQLRequest {
  query: string;
}

function isGraphQLRequest(obj: unknown): obj is GraphQLRequest {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const record = obj as Record<string, unknown>;
  return "query" in record && typeof record.query === "string";
}

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
      http.post("*/api/v1/graphql", async ({ request }): Promise<Response> => {
        const body: unknown = await request.json();
        if (!isGraphQLRequest(body)) {
          return HttpResponse.json({
            errors: [{ message: "Invalid request" }],
          });
        }
        const query: string = body.query || "";

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
      http.post("*/api/v1/graphql", async ({ request }): Promise<Response> => {
        const body: unknown = await request.json();
        if (!isGraphQLRequest(body)) {
          return HttpResponse.json({
            errors: [{ message: "Invalid request" }],
          });
        }
        const query: string = body.query || "";

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
});
