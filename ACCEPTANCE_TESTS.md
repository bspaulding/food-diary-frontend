# Browser Acceptance Tests

This directory contains browser-driven acceptance tests using Vitest in browser mode. The tests can run in two modes:

1. **Mock Backend Mode** - Uses Mock Service Worker (MSW) to intercept and mock API requests
2. **Live Backend Mode** - Runs tests against an actual GraphQL backend instance with a comprehensive E2E workflow

## Running the Tests

### Mock Backend Tests

```bash
npm run test:acceptance
```

### Live Backend Tests

```bash
npm run test:acceptance:live
```

Note: Live backend tests require a running GraphQL backend at the URL specified in `VITE_API_URL` environment variable (defaults to `http://localhost:8080`).

## Test Structure

### Mock Backend Tests

These tests verify individual features work correctly with mocked API responses:

- `src/acceptance.test.tsx` - Main acceptance tests (diary list, stats, add item flow)
- `src/acceptance-add-entry.test.tsx` - Add entry flow tests
- `src/acceptance-add-recipe.test.tsx` - Add recipe flow tests

### Live Backend Tests

A comprehensive end-to-end test that validates the full workflow:

- `src/acceptance-live-e2e.test.tsx` - Complete E2E workflow test

The live backend E2E test covers:

1. Assert diary list is initially empty
2. Add a nutrition item (Banana)
3. Log that item via the item show page
4. Verify the entry appears in diary list
5. Add another item (Apple)
6. Create a recipe containing both items (Fruit Salad)
7. Log the recipe via the recipe show page
8. Verify the recipe appears in diary list
9. Navigate to Add Entry page and verify items/recipes are suggested
10. Log an item from the suggestions list
11. Search for and log an item from the search tab
12. Verify all new entries appear in the diary list

All tests use:

- **Vitest Browser Mode**: Tests run in a real Chromium browser via Playwright
- **@solidjs/testing-library**: For rendering and querying Solid components
- **Mock Service Worker (MSW)**: API requests are intercepted in mock mode only

## Configuration

### Mock Backend Mode

- `vitest.acceptance.config.mts` - Vitest config for mock backend tests
- `src/test-setup-browser.ts` - Test setup with MSW browser worker
- Browser: Chromium (via Playwright)
- Headless mode: Enabled

### Live Backend Mode

- `vitest.acceptance-live.config.mts` - Vitest config for live backend tests
- `src/test-setup-browser-live.ts` - Test setup without MSW (uses real backend)
- Browser: Chromium (via Playwright)
- Headless mode: Enabled

The live backend tests run a single comprehensive E2E test that validates the complete workflow rather than checking specific mock data.

## Mocking Strategy (Mock Backend Mode Only)

### Authentication

Auth0 is mocked using `vi.mock()` to return a logged-in user state.

### API Requests

Mock Service Worker (MSW) is used to intercept all HTTP requests in the browser:

- MSW worker is configured in `src/test-setup-browser.ts`
- Handlers are set up when the worker starts (not in beforeEach)
- **Strict mode enabled**: Any unhandled request will cause the test to fail, ensuring mocks stay in sync with the application
- Mock responses are configured per-query type (GetEntries, SearchItems, CreateDiaryEntry, etc.)

Example handler:

```typescript
export const worker = setupWorker(
  http.post("*/api/v1/graphql", async ({ request }) => {
    const body = await request.json();
    if (body.query.includes("GetEntries")) {
      return HttpResponse.json({ data: { food_diary_diary_entry: mockData } });
    }
    // Unhandled queries will throw an error
  }),
);
```

## CI Integration

The acceptance tests run in parallel in GitHub Actions:

### Mock Backend Tests (`.github/workflows/ci.yml`)

Runs acceptance tests with MSW mocking API requests:

1. Installs dependencies with `npm ci`
2. Installs Playwright browsers
3. Runs `npm run test:acceptance`

### Live Backend Tests (`.github/workflows/acceptance-tests-live.yml`)

Runs acceptance tests against actual backend services:

1. Starts PostgreSQL service container
2. Starts GraphQL engine backend container (ghcr.io/bspaulding/food-diary-graphql-engine)
3. Installs dependencies with `npm ci`
4. Waits for backend services to be ready
5. Installs Playwright browsers
6. Runs `npm run test:acceptance:live` with `VITE_API_URL=http://localhost:8080`

Both test suites run in parallel for faster CI feedback.

## Test Exclusions

The live backend tests do not cover:

- CSV import/export functionality
- Image scanning (camera or upload)

These features are tested in the mock backend suite where they can be better controlled.
