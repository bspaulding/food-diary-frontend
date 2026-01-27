# Browser Acceptance Tests

This directory contains browser-driven acceptance tests using Vitest in browser mode. The tests can run in two modes:

1. **Mock Backend Mode** - Uses Mock Service Worker (MSW) to intercept and mock API requests
2. **Live Backend Mode** - Runs tests against an actual GraphQL backend instance

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

The acceptance tests are located in:

- `src/acceptance.test.tsx` - Main acceptance tests
- `src/acceptance-add-entry.test.tsx` - Add entry flow tests
- `src/acceptance-add-recipe.test.tsx` - Add recipe flow tests

All tests use:

- **Vitest Browser Mode**: Tests run in a real Chromium browser via Playwright
- **@solidjs/testing-library**: For rendering and querying Solid components
- **Mock Service Worker (MSW)**: API requests are intercepted in mock mode (conditionally enabled)

## Test Coverage

### ✅ Passing Tests

1. **View the diary list page** - Tests that the main diary list loads and displays entries ✅ **PASSING**
2. **Add Item flow** - Tests creating a new nutrition item (description, calories, protein) ✅ **PASSING**

### ⚠️ Known Issues

3. **Add New Entry flow** - Search results load correctly, but click interaction to expand logging form doesn't trigger state update in browser test environment
4. **Add Recipe form** - Initial render issue in browser test environment

**Note**: Tests 3 and 4 have limitations due to SolidJS reactivity and state updates in browser-based testing. The components work correctly in the application but state changes triggered by click events don't propagate properly in the Vitest browser test environment. This is a known limitation when testing reactive frameworks in browser mode.

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

Tests automatically adapt their assertions based on whether MSW is active:

- **With MSW** (mock mode): Verifies specific mock data is displayed
- **Without MSW** (live mode): Verifies page structure and components load correctly

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

## Known Issues

1. Click interactions don't trigger SolidJS state updates properly in browser tests
2. Some forms don't render in test environment - under investigation

## Future Improvements

- Fix click interaction issues for logging forms in browser tests
- Fix NewRecipeForm rendering in browser test environment
- Add E2E tests with full navigation flows
- Add visual regression testing
- Test error states and edge cases
