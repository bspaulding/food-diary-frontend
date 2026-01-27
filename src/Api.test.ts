import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import { fetchEntries } from "./Api";

describe("Api authorization error handling", () => {
  it("should throw AuthorizationError when API returns 401", async () => {
    server.use(
      http.post("/api/v1/graphql", () => {
        return new HttpResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        });
      }),
    );

    await expect(fetchEntries("test-token")).rejects.toThrow(
      "Authorization failed",
    );
  });

  it("should throw AuthorizationError when API returns 403", async () => {
    server.use(
      http.post("/api/v1/graphql", () => {
        return new HttpResponse(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }),
    );

    await expect(fetchEntries("test-token")).rejects.toThrow(
      "Authorization failed",
    );
  });

  it("should return data normally when API returns 200", async () => {
    const mockData = {
      data: {
        food_diary_diary_entry: [],
      },
    };

    server.use(
      http.post("/api/v1/graphql", () => {
        return HttpResponse.json(mockData);
      }),
    );

    const result = await fetchEntries("test-token");
    expect(result).toEqual(mockData);
  });

  it("should throw generic error for non-auth errors", async () => {
    server.use(
      http.post("/api/v1/graphql", () => {
        return new HttpResponse(JSON.stringify({ error: "Server error" }), {
          status: 500,
          statusText: "Internal Server Error",
        });
      }),
    );

    await expect(fetchEntries("test-token")).rejects.toThrow(
      "API request failed: 500 Internal Server Error",
    );
  });
});
