# Browser Acceptance Tests

This directory contains browser-driven acceptance tests using Vitest in browser mode.

## Running the Tests

```bash
npm run test:acceptance
```

## Test Structure

The acceptance tests are located in `src/acceptance.test.tsx` and use:
- **Vitest Browser Mode**: Tests run in a real Chromium browser via Playwright
- **@solidjs/testing-library**: For rendering and querying Solid components
- **Fetch Mocking**: API requests are mocked at the fetch level for browser compatibility

## Test Coverage

### ✅ Passing Tests

1. **View the diary list page** - Tests that the main diary list loads and displays entries
2. **Add New Entry flow** - Tests searching for an item and logging it as a diary entry

### ⚠️ Partial Tests

3. **Add Item form page** - Verifies the NewNutritionItemForm page structure loads
4. **Add Recipe form page** - Verifies the NewRecipeForm page structure loads

Note: Tests 3 and 4 are simplified due to rendering issues with CSS modules in the browser test environment. Full form interaction can be added once CSS module loading is configured properly in Vitest browser mode.

## Configuration

- `vitest.acceptance.config.mts` - Separate Vitest config for browser tests
- `src/test-setup-browser.ts` - Test setup with fetch mocking utilities
- Browser: Chromium (via Playwright)
- Headless mode: Enabled

## Mocking Strategy

### Authentication
Auth0 is mocked using `vi.mock()` to return a logged-in user state.

### API Requests
Instead of MSW (which has compatibility issues in browser mode), we use a simpler fetch mocking approach:
- `setupFetchMock()` helper intercepts fetch calls
- Mock responses are configured per-query type (GetEntries, SearchItems, etc.)

## Known Issues

1. CSS modules (`.module.css`) may not load properly in browser tests
2. Complex nested components with camera/labeling features need additional setup
3. Some forms don't render in test environment - investigation needed

## Future Improvements

- Fix CSS module loading for complete form testing
- Add E2E tests with full navigation flows
- Add visual regression testing
- Test error states and edge cases
