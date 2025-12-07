import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import DiaryEntryEditForm from "./DiaryEntryEditForm";

// Mock Auth0
vi.mock("./Auth0", () => ({
  useAuth: () => [{ accessToken: () => "test-token" }],
}));

// Mock router hooks
vi.mock("@solidjs/router", async () => {
  const actual = await vi.importActual("@solidjs/router");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
    useNavigate: () => vi.fn(),
  };
});

const mockDiaryEntry = {
  data: {
    food_diary_diary_entry_by_pk: {
      id: 1,
      consumed_at: "2022-08-28T14:30:00Z",
      servings: 1,
      calories: 160,
      nutrition_item: {
        id: 10,
        description: "Test Item",
        calories: 160,
        total_fat_grams: 2,
        added_sugars_grams: 8,
        protein_grams: 3,
      },
      recipe: null,
    },
  },
};

describe("DiaryEntryEditForm", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("should send updated servings value to the backend when only servings is changed", async () => {
    let capturedRequest: any = null;
    const user = userEvent.setup();

    // Mock the GraphQL endpoint
    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        const query = (body as any).query;

        // Handle GetDiaryEntry query
        if (query.includes("GetDiaryEntry")) {
          return HttpResponse.json(mockDiaryEntry);
        }

        // Handle UpdateDiaryEntry mutation
        if (query.includes("UpdateDiaryEntry")) {
          capturedRequest = body;
          return HttpResponse.json({
            data: {
              update_food_diary_diary_entry_by_pk: {
                id: 1,
              },
            },
          });
        }

        return HttpResponse.json({ errors: [{ message: "Unknown query" }] });
      })
    );

    // Render the component
    const { unmount } = render(() => <DiaryEntryEditForm />);

    // Wait for the form to load with data
    await waitFor(
      () => {
        const label = screen.queryByLabelText("Servings");
        expect(label).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Get the servings input and change its value
    const servingsInput = screen.getByLabelText("Servings") as HTMLInputElement;
    expect(servingsInput.value).toBe("1");

    await user.clear(servingsInput);
    await user.type(servingsInput, "2");

    // Click the save button
    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    // Wait for the update request to be made
    await waitFor(() => {
      expect(capturedRequest).not.toBeNull();
    }, { timeout: 5000 });

    // Verify the mutation contains the correct variables
    expect(capturedRequest.variables.id).toBe(1);
    expect(capturedRequest.variables.attrs.servings).toBe(2);
    expect(capturedRequest.variables.attrs.consumed_at).toBe("2022-08-28T14:30:00Z");

    unmount();
  });

  it("should send both servings and consumed_at when both are changed", async () => {
    let capturedRequest: any = null;
    const user = userEvent.setup();

    // Mock the GraphQL endpoint
    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        const query = (body as any).query;

        // Handle GetDiaryEntry query
        if (query.includes("GetDiaryEntry")) {
          return HttpResponse.json(mockDiaryEntry);
        }

        // Handle UpdateDiaryEntry mutation
        if (query.includes("UpdateDiaryEntry")) {
          capturedRequest = body;
          return HttpResponse.json({
            data: {
              update_food_diary_diary_entry_by_pk: {
                id: 1,
              },
            },
          });
        }

        return HttpResponse.json({ errors: [{ message: "Unknown query" }] });
      })
    );

    // Render the component
    const { unmount } = render(() => <DiaryEntryEditForm />);

    // Wait for the form to load with data
    await waitFor(
      () => {
        const label = screen.queryByLabelText("Servings");
        expect(label).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Change servings
    const servingsInput = screen.getByLabelText("Servings") as HTMLInputElement;
    await user.clear(servingsInput);
    await user.type(servingsInput, "3");

    // Change consumed_at
    const consumedAtInput = screen.getByLabelText("Consumed At") as HTMLInputElement;
    await user.clear(consumedAtInput);
    await user.type(consumedAtInput, "2022-08-29T15:30");

    // Click the save button
    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    // Wait for the update request to be made
    await waitFor(() => {
      expect(capturedRequest).not.toBeNull();
    }, { timeout: 5000 });

    // Verify the mutation contains both updated values
    expect(capturedRequest.variables.id).toBe(1);
    expect(capturedRequest.variables.attrs.servings).toBe(3);
    expect(capturedRequest.variables.attrs.consumed_at).toContain("2022-08-29");

    unmount();
  });

  it("should handle updating servings to 0", async () => {
    let capturedRequest: any = null;
    const user = userEvent.setup();

    // Mock the GraphQL endpoint
    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        const query = (body as any).query;

        // Handle GetDiaryEntry query
        if (query.includes("GetDiaryEntry")) {
          return HttpResponse.json(mockDiaryEntry);
        }

        // Handle UpdateDiaryEntry mutation
        if (query.includes("UpdateDiaryEntry")) {
          capturedRequest = body;
          return HttpResponse.json({
            data: {
              update_food_diary_diary_entry_by_pk: {
                id: 1,
              },
            },
          });
        }

        return HttpResponse.json({ errors: [{ message: "Unknown query" }] });
      })
    );

    // Render the component
    const { unmount } = render(() => <DiaryEntryEditForm />);

    // Wait for the form to load with data
    await waitFor(
      () => {
        const label = screen.queryByLabelText("Servings");
        expect(label).not.toBeNull();
      },
      { timeout: 5000 }
    );

    // Change servings to 0 (edge case with falsy value)
    const servingsInput = screen.getByLabelText("Servings") as HTMLInputElement;
    await user.clear(servingsInput);
    await user.type(servingsInput, "0");

    // Click the save button
    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    // Wait for the update request to be made
    await waitFor(() => {
      expect(capturedRequest).not.toBeNull();
    }, { timeout: 5000 });

    // Verify the request includes servings as 0, not the original value
    expect(capturedRequest.variables.attrs.servings).toBe(0);

    unmount();
  });
});
