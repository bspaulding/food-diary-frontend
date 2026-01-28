import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import UserProfile from "./UserProfile";

vi.mock("./Auth0", () => ({
  useAuth: () => [
    {
      user: () => ({
        picture: "https://example.com/avatar.jpg",
        nickname: "testuser",
        name: "Test User",
        email: "test@example.com",
      }),
      isAuthenticated: () => true,
      auth0: () => ({
        logout: vi.fn(),
      }),
      accessToken: () => "test-token",
    },
  ],
}));

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display user profile information", () => {
    render(() => <UserProfile />);

    expect(screen.getByText("testuser")).toBeTruthy();
    expect(screen.getByText("test@example.com")).toBeTruthy();
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/avatar.jpg");
  });

  it("should display name when nickname is not available", () => {
    vi.doMock("./Auth0", () => ({
      useAuth: () => [
        {
          user: () => ({
            picture: "https://example.com/avatar.jpg",
            name: "Test User",
            email: "test@example.com",
          }),
          isAuthenticated: () => true,
          auth0: () => ({
            logout: vi.fn(),
          }),
          accessToken: () => "test-token",
        },
      ],
    }));

    render(() => <UserProfile />);
    expect(screen.getByText("Test User")).toBeTruthy();
  });

  it("should have link to import entries", () => {
    render(() => <UserProfile />);

    const importLink = screen.getByText("Import Entries");
    expect(importLink.getAttribute("href")).toBe("/diary_entry/import");
  });

  it("should export entries as CSV when button is clicked", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("/api/v1/graphql", () => {
        return HttpResponse.json({
          data: {
            food_diary_diary_entry: [
              {
                id: 1,
                description: "Test Entry",
                date: "2024-01-01T10:00:00Z",
                servings: 1,
                nutrition_item: {
                  id: 1,
                  description: "Apple",
                  calories: 95,
                },
              },
            ],
          },
        });
      })
    );

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement to track the anchor element
    const mockAnchor = document.createElement("a");
    const mockClick = vi.fn();
    mockAnchor.click = mockClick;
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tag: string) => {
      if (tag === "a") {
        return mockAnchor;
      }
      return originalCreateElement(tag);
    }) as any;

    render(() => <UserProfile />);

    const exportButton = screen.getByText("Export Entries As CSV");
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    // Restore
    document.createElement = originalCreateElement;
  });

  it("should call logout when logout button is clicked", async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();

    vi.doMock("./Auth0", () => ({
      useAuth: () => [
        {
          user: () => ({
            picture: "https://example.com/avatar.jpg",
            nickname: "testuser",
            name: "Test User",
            email: "test@example.com",
          }),
          isAuthenticated: () => true,
          auth0: () => ({
            logout: mockLogout,
          }),
          accessToken: () => "test-token",
        },
      ],
    }));

    const { default: TestUserProfile } = await import("./UserProfile");
    render(() => <TestUserProfile />);

    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledWith({
      returnTo: expect.stringContaining("/auth/logout"),
    });
  });
});
