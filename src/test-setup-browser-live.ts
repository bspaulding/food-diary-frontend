import { beforeAll, afterEach, afterAll } from "vitest";
import { setWorker } from "./test-worker-ref";

// No MSW setup for live backend tests
// Set worker to undefined to signal that we're in live mode

beforeAll(async () => {
  // Tests will use real backend via proxy
  setWorker(undefined);
  console.log("Running acceptance tests against live backend");
});

afterEach(() => {
  // No cleanup needed for live backend
});

afterAll(() => {
  // No cleanup needed for live backend
});
