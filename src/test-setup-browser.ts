import { beforeEach, afterEach, vi } from "vitest";

// Store original fetch
const originalFetch = globalThis.fetch;

// Setup fetch mock for browser mode
beforeEach(() => {
  // Restore original fetch first
  globalThis.fetch = originalFetch;
});

afterEach(() => {
  // Restore original fetch after each test
  globalThis.fetch = originalFetch;
});

// Export a helper to set up fetch mocks for tests
export function setupFetchMock(mockResponses: Record<string, any>) {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const query = body.query || "";

    // Find matching mock response
    for (const [key, response] of Object.entries(mockResponses)) {
      if (query.includes(key)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => response,
          text: async () => JSON.stringify(response),
          headers: new Headers({ "content-type": "application/json" }),
        } as Response);
      }
    }

    // Default error response
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ errors: [{ message: "Unknown query" }] }),
      text: async () => JSON.stringify({ errors: [{ message: "Unknown query" }] }),
      headers: new Headers({ "content-type": "application/json" }),
    } as Response);
  }) as any;
}
