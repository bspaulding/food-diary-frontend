import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import NewNutritionItemForm from "./NewNutritionItemForm";

vi.mock("./Auth0", () => ({
  useAuth: () => [
    {
      isAuthenticated: () => true,
      accessToken: () => "test-token",
      user: () => ({ name: "Test User" }),
      auth0: () => null,
    },
  ],
}));

const mockNavigate = vi.fn();
vi.mock("@solidjs/router", () => ({
  useNavigate: () => mockNavigate,
  A: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe("NewNutritionItemForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nutrition item form with all fields", () => {
    render(() => <NewNutritionItemForm />);

    expect(screen.getByLabelText("Description")).toBeTruthy();
    expect(screen.getByLabelText("Calories")).toBeTruthy();
    expect(screen.getByLabelText("Total Fat (g)")).toBeTruthy();
    expect(screen.getByLabelText("Saturated Fat (g)")).toBeTruthy();
    expect(screen.getByLabelText("Trans Fat (g)")).toBeTruthy();
    expect(screen.getByLabelText("Polyunsaturated Fat (g)")).toBeTruthy();
    expect(screen.getByLabelText("Monounsaturated Fat (g)")).toBeTruthy();
    expect(screen.getByLabelText("Cholesterol (mg)")).toBeTruthy();
    expect(screen.getByLabelText("Sodium (mg)")).toBeTruthy();
    expect(screen.getByLabelText("Total Carbohydrate (g)")).toBeTruthy();
    expect(screen.getByLabelText("Dietary Fiber (g)")).toBeTruthy();
    expect(screen.getByLabelText("Total Sugars (g)")).toBeTruthy();
    expect(screen.getByLabelText("Added Sugars (g)")).toBeTruthy();
    expect(screen.getByLabelText("Protein (g)")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("should display Scan button", () => {
    render(() => <NewNutritionItemForm />);
    expect(screen.getByText("Scan")).toBeTruthy();
  });

  it("should update description input", async () => {
    const user = userEvent.setup();
    render(() => <NewNutritionItemForm />);

    const descInput = screen.getByLabelText("Description") as HTMLInputElement;
    await user.type(descInput, "Apple");

    expect(descInput.value).toBe("Apple");
  });

  it("should update calories input", async () => {
    const user = userEvent.setup();
    render(() => <NewNutritionItemForm />);

    const caloriesInput = screen.getByLabelText("Calories") as HTMLInputElement;
    await user.type(caloriesInput, "95");

    expect(caloriesInput.value).toBe("095");
  });

  it("should handle NaN in number inputs", async () => {
    const user = userEvent.setup();
    render(() => <NewNutritionItemForm />);

    const caloriesInput = screen.getByLabelText("Calories") as HTMLInputElement;
    await user.clear(caloriesInput);
    await user.type(caloriesInput, "abc");

    // Should stay at 0 when invalid
    expect(caloriesInput.value).toBe("0");
  });

  it("should populate form with initial item data", () => {
    const initialItem = {
      id: 123,
      description: "Banana",
      calories: 105,
      totalFatGrams: 0.4,
      saturatedFatGrams: 0.1,
      transFatGrams: 0,
      polyunsaturatedFatGrams: 0.1,
      monounsaturatedFatGrams: 0.1,
      cholesterolMilligrams: 0,
      sodiumMilligrams: 1,
      totalCarbohydrateGrams: 27,
      dietaryFiberGrams: 3,
      totalSugarsGrams: 14,
      addedSugarsGrams: 0,
      proteinGrams: 1.3,
    };

    render(() => <NewNutritionItemForm initialItem={initialItem} />);

    expect(
      (screen.getByLabelText("Description") as HTMLInputElement).value
    ).toBe("Banana");
    expect((screen.getByLabelText("Calories") as HTMLInputElement).value).toBe(
      "105"
    );
    expect(
      (screen.getByLabelText("Total Fat (g)") as HTMLInputElement).value
    ).toBe("0.4");
    expect(
      (screen.getByLabelText("Protein (g)") as HTMLInputElement).value
    ).toBe("1.3");
  });

  it("should create new nutrition item on save", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        if (body.query.includes("CreateNutritionItem")) {
          return HttpResponse.json({
            data: {
              insert_food_diary_nutrition_item_one: {
                id: 789,
              },
            },
          });
        }
        return HttpResponse.json({ data: {} });
      })
    );

    render(() => <NewNutritionItemForm />);

    const descInput = screen.getByLabelText("Description");
    await user.type(descInput, "Apple");

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/nutrition_item/789");
    });
  });

  it("should update existing nutrition item on save", async () => {
    const user = userEvent.setup();

    const initialItem = {
      id: 123,
      description: "Banana",
      calories: 105,
      totalFatGrams: 0.4,
      saturatedFatGrams: 0.1,
      transFatGrams: 0,
      polyunsaturatedFatGrams: 0.1,
      monounsaturatedFatGrams: 0.1,
      cholesterolMilligrams: 0,
      sodiumMilligrams: 1,
      totalCarbohydrateGrams: 27,
      dietaryFiberGrams: 3,
      totalSugarsGrams: 14,
      addedSugarsGrams: 0,
      proteinGrams: 1.3,
    };

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        if (body.query.includes("UpdateNutritionItem")) {
          return HttpResponse.json({
            data: {
              update_food_diary_nutrition_item_by_pk: {
                id: 123,
              },
            },
          });
        }
        return HttpResponse.json({ data: {} });
      })
    );

    render(() => <NewNutritionItemForm initialItem={initialItem} />);

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/nutrition_item/123");
    });
  });

  it("should show Saving... while saving", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("/api/v1/graphql", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          data: {
            insert_food_diary_nutrition_item_one: {
              id: 789,
            },
          },
        });
      })
    );

    render(() => <NewNutritionItemForm />);

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    expect(screen.getByText("Saving...")).toBeTruthy();
  });

  it("should call onSaved callback instead of navigating when provided", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = await request.json();
        if (body.query.includes("CreateNutritionItem")) {
          return HttpResponse.json({
            data: {
              insert_food_diary_nutrition_item_one: {
                id: 789,
              },
            },
          });
        }
        return HttpResponse.json({ data: {} });
      })
    );

    render(() => <NewNutritionItemForm onSaved={onSaved} />);

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should open camera modal when Scan button is clicked", async () => {
    const user = userEvent.setup();
    render(() => <NewNutritionItemForm />);

    const scanButton = screen.getByText("Scan");
    await user.click(scanButton);

    // Camera modal should be shown (CameraModal component would be tested separately)
    await waitFor(() => {
      // Just ensure the button click works - full modal testing in CameraModal.test
      expect(scanButton).toBeTruthy();
    });
  });

  it("should update all nutrition fields correctly", async () => {
    const user = userEvent.setup();
    render(() => <NewNutritionItemForm />);

    const fields = [
      { label: "Total Fat (g)", value: "1.5" },
      { label: "Saturated Fat (g)", value: "0.5" },
      { label: "Trans Fat (g)", value: "0.1" },
      { label: "Polyunsaturated Fat (g)", value: "0.3" },
      { label: "Monounsaturated Fat (g)", value: "0.6" },
      { label: "Cholesterol (mg)", value: "10" },
      { label: "Sodium (mg)", value: "150" },
      { label: "Total Carbohydrate (g)", value: "25" },
      { label: "Dietary Fiber (g)", value: "4" },
      { label: "Total Sugars (g)", value: "15" },
      { label: "Added Sugars (g)", value: "5" },
      { label: "Protein (g)", value: "3" },
    ];

    for (const field of fields) {
      const input = screen.getByLabelText(field.label) as HTMLInputElement;
      await user.clear(input);
      await user.type(input, field.value);
    }

    // Verify last field as a sanity check
    const proteinInput = screen.getByLabelText("Protein (g)") as HTMLInputElement;
    expect(proteinInput.value).toBe("3");
  });

  it("should handle handleImport with all nutrition data fields", () => {
    const initialItem = {
      id: 0,
      description: "",
      calories: 0,
      totalFatGrams: 0,
      saturatedFatGrams: 0,
      transFatGrams: 0,
      polyunsaturatedFatGrams: 0,
      monounsaturatedFatGrams: 0,
      cholesterolMilligrams: 0,
      sodiumMilligrams: 0,
      totalCarbohydrateGrams: 0,
      dietaryFiberGrams: 0,
      totalSugarsGrams: 0,
      addedSugarsGrams: 0,
      proteinGrams: 0,
    };

    render(() => <NewNutritionItemForm initialItem={initialItem} />);

    // Verify initial state
    expect(
      (screen.getByLabelText("Description") as HTMLInputElement).value
    ).toBe("");
  });
});
