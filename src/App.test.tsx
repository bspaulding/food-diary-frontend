import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  describe("when user is not authenticated", () => {
    const mockLoginWithRedirect = vi.fn();

    beforeEach(() => {
      vi.resetModules();
      mockLoginWithRedirect.mockClear();
      vi.doMock("./Auth0", () => ({
        useAuth: () => [
          {
            isAuthenticated: () => false,
            user: () => null,
            accessToken: () => null,
            auth0: () => ({ loginWithRedirect: mockLoginWithRedirect }),
          },
        ],
      }));
    });

    afterEach(() => {
      vi.doUnmock("./Auth0");
    });

    it("should display Log In button", async () => {
      const { default: TestApp } = await import("./App");
      render(() => <TestApp>Content</TestApp>);

      const loginButton = screen.getByText("Log In");
      expect(loginButton).toBeTruthy();
    });

    it("should call loginWithRedirect when Log In button is clicked", async () => {
      const user = userEvent.setup();
      const { default: TestApp } = await import("./App");

      render(() => <TestApp>Content</TestApp>);

      const loginButton = screen.getByText("Log In");
      await user.click(loginButton);

      expect(mockLoginWithRedirect).toHaveBeenCalled();
    });
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      vi.resetModules();
      vi.doMock("./Auth0", () => ({
        useAuth: () => [
          {
            isAuthenticated: () => true,
            user: () => ({
              picture: "https://example.com/avatar.jpg",
              name: "Test User",
            }),
            accessToken: () => "test-token",
            auth0: () => null,
          },
        ],
      }));
    });

    afterEach(() => {
      vi.doUnmock("./Auth0");
    });

    it("should display children", async () => {
      const { default: TestApp } = await import("./App");
      render(() => <TestApp>Test Content</TestApp>);

      expect(screen.getByText("Test Content")).toBeTruthy();
    });

    it("should display user profile picture", async () => {
      const { default: TestApp } = await import("./App");
      render(() => <TestApp>Content</TestApp>);

      const img = screen.getByRole("img") as HTMLImageElement;
      expect(img.src).toBe("https://example.com/avatar.jpg");
    });
  });
});

