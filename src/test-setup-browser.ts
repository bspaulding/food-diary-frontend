import { beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

// Setup MSW worker for browser mode
export const worker = setupWorker();

beforeAll(async () => {
  await worker.start({ onUnhandledRequest: "bypass" });
});

afterEach(() => worker.resetHandlers());
afterAll(() => worker.stop());
