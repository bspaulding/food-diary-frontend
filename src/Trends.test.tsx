import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import App from "./App";
import Trends from "./Trends";
import DiaryList from "./DiaryList";
import userEvent from "@testing-library/user-event";

// Mock Auth0 - simulate logged in user
vi.mock("./Auth0", () => ({
  useAuth: () => [
    {
      isAuthenticated: () => true,
      user: () => ({
        picture: "https://example.com/avatar.jpg",
        name: "Test User",
      }),
      accessToken: () => "test-access-token",
      auth0: () => null,
    },
  ],
}));

describe("Trends", () => {
  it("should display trends page with no data message when there are no entries", async () => {
    render(() => (
      <Router root={App}>
        <Route path="/" component={Trends} />
      </Router>
    ));

    await waitFor(
      () => {
        const header = screen.queryByText(/Weekly Nutrition Trends/i);
        expect(header).not.toBeNull();
      },
      { timeout: 5000 }
    );

    expect(screen.getByText(/Weekly Nutrition Trends/i)).toBeTruthy();
    expect(
      screen.getByText(/No data available yet. Add some diary entries to see trends!/i)
    ).toBeTruthy();
    expect(screen.getByText(/Back to Diary/i)).toBeTruthy();
  });

  it("should have View Trends button on DiaryList page", async () => {
    render(() => (
      <Router root={App}>
        <Route path="/" component={DiaryList} />
      </Router>
    ));

    await waitFor(
      () => {
        const viewTrendsButton = screen.queryByText(/View Trends/i);
        expect(viewTrendsButton).not.toBeNull();
      },
      { timeout: 5000 }
    );

    expect(screen.getByText(/View Trends/i)).toBeTruthy();
    const viewTrendsLink = screen.getByText(/View Trends/i).closest("a");
    expect(viewTrendsLink?.getAttribute("href")).toBe("/trends");
  });
});
