import { beforeAll, afterEach, afterAll } from "vitest";

// No MSW setup for live backend tests
// Export undefined worker to maintain compatibility with mock tests
export const worker = undefined;

beforeAll(async () => {
  // Tests will use real backend via proxy
  console.log("Running acceptance tests against live backend");
});

afterEach(() => {
  // No cleanup needed for live backend
});

afterAll(() => {
  // No cleanup needed for live backend
});
