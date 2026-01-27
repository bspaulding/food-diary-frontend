import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchEntries } from "./Api";

describe("Api authorization error handling", () => {
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should throw AuthorizationError when API returns 401", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });

    await expect(fetchEntries("test-token")).rejects.toThrow(
      "Authorization failed",
    );
  });

  it("should throw AuthorizationError when API returns 403", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: "Forbidden" }),
    });

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

    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await fetchEntries("test-token");
    expect(result).toEqual(mockData);
  });

  it("should throw generic error for non-auth errors", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ error: "Server error" }),
    });

    await expect(fetchEntries("test-token")).rejects.toThrow(
      "API request failed: 500 Internal Server Error",
    );
  });
});
