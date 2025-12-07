import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import { updateDiaryEntry } from "./Api";

describe("DiaryEntryEditForm - API Integration", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("should send updated servings value to the backend when only servings is changed", async () => {
    let capturedRequest: any = null;

    // Mock the GraphQL endpoint
    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        capturedRequest = body;
        
        // Return a successful response
        return HttpResponse.json({
          data: {
            update_food_diary_diary_entry_by_pk: {
              id: 1,
            },
          },
        });
      })
    );

    // Simulate what happens when user changes only servings
    const result = await updateDiaryEntry("test-token", {
      id: 1,
      servings: 2,
      consumedAt: "2022-08-28T14:30:00Z",
    });

    // Verify the request was made
    expect(capturedRequest).not.toBeNull();
    
    // Verify the mutation contains the correct variables
    expect(capturedRequest.variables.id).toBe(1);
    expect(capturedRequest.variables.attrs.servings).toBe(2);
    expect(capturedRequest.variables.attrs.consumed_at).toBe("2022-08-28T14:30:00Z");
    
    // Verify response
    expect(result.data.update_food_diary_diary_entry_by_pk.id).toBe(1);
  });

  it("should send both servings and consumed_at when both are changed", async () => {
    let capturedRequest: any = null;

    // Mock the GraphQL endpoint
    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        capturedRequest = body;
        
        return HttpResponse.json({
          data: {
            update_food_diary_diary_entry_by_pk: {
              id: 1,
            },
          },
        });
      })
    );

    // Simulate what happens when user changes both fields
    const result = await updateDiaryEntry("test-token", {
      id: 1,
      servings: 3,
      consumedAt: "2022-08-29T15:30:00Z",
    });

    // Verify the request was made
    expect(capturedRequest).not.toBeNull();
    
    // Verify the mutation contains both updated values
    expect(capturedRequest.variables.id).toBe(1);
    expect(capturedRequest.variables.attrs.servings).toBe(3);
    expect(capturedRequest.variables.attrs.consumed_at).toBe("2022-08-29T15:30:00Z");
    
    // Verify response
    expect(result.data.update_food_diary_diary_entry_by_pk.id).toBe(1);
  });

  it("should correctly convert camelCase to snake_case for consumedAt", async () => {
    let capturedRequest: any = null;

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        capturedRequest = body;
        
        return HttpResponse.json({
          data: {
            update_food_diary_diary_entry_by_pk: {
              id: 1,
            },
          },
        });
      })
    );

    await updateDiaryEntry("test-token", {
      id: 1,
      servings: 1,
      consumedAt: "2022-08-28T14:30:00Z",
    });

    // Verify snake_case conversion
    expect(capturedRequest.variables.attrs).toHaveProperty("consumed_at");
    expect(capturedRequest.variables.attrs).not.toHaveProperty("consumedAt");
  });

  it("should handle updating only servings without changing consumed_at", async () => {
    let capturedRequest: any = null;

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        capturedRequest = body;
        
        return HttpResponse.json({
          data: {
            update_food_diary_diary_entry_by_pk: {
              id: 1,
            },
          },
        });
      })
    );

    // User changes servings from 1 to 5, but keeps the original consumed_at
    const originalConsumedAt = "2022-08-28T14:30:00Z";
    await updateDiaryEntry("test-token", {
      id: 1,
      servings: 5,
      consumedAt: originalConsumedAt,
    });

    // Verify the request includes both fields
    expect(capturedRequest.variables.id).toBe(1);
    expect(capturedRequest.variables.attrs.servings).toBe(5);
    expect(capturedRequest.variables.attrs.consumed_at).toBe(originalConsumedAt);
  });
});
