import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "./test-setup";
import NewRecipeForm from "./NewRecipeForm";

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

describe("NewRecipeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render new recipe form", () => {
    render(() => <NewRecipeForm />);

    expect(screen.getByText("New Recipe")).toBeTruthy();
    const nameInput = document.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    expect(screen.getByDisplayValue("1")).toBeTruthy(); // Total Servings defaults to 1
    expect(screen.getByText("Save Recipe")).toBeTruthy();
  });

  it("should display Back to entries link", () => {
    render(() => <NewRecipeForm />);

    const backLink = screen.getByText("Back to entries");
    expect(backLink).toBeTruthy();
  });

  it("should update recipe name input", async () => {
    const user = userEvent.setup();
    render(() => <NewRecipeForm />);

    const nameInput = document.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    await user.type(nameInput, "Smoothie");

    expect(nameInput.value).toBe("Smoothie");
  });

  it("should update total servings input", async () => {
    const user = userEvent.setup();
    render(() => <NewRecipeForm />);

    const servingsInput = document.querySelector(
      'input[name="total-servings"]'
    ) as HTMLInputElement;
    await user.clear(servingsInput);
    await user.type(servingsInput, "4");

    expect(servingsInput.value).toBe("4");
  });

  it("should handle NaN in total servings input", async () => {
    const user = userEvent.setup();
    render(() => <NewRecipeForm />);

    const servingsInput = document.querySelector(
      'input[name="total-servings"]'
    ) as HTMLInputElement;
    await user.clear(servingsInput);
    await user.type(servingsInput, "abc");

    // Should not update to NaN - stays cleared
    expect(servingsInput.value).toBe("");
  });

  it("should display initial recipe data when provided", () => {
    const initialRecipe = {
      id: 123,
      name: "Existing Recipe",
      total_servings: 2,
      recipe_items: [
        {
          servings: 1,
          nutrition_item: {
            id: 1,
            description: "Banana",
          },
        },
      ],
    };

    render(() => <NewRecipeForm initialRecipe={initialRecipe} />);

    const nameInput = document.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("Existing Recipe");

    const servingsInput = document.querySelector(
      'input[name="total-servings"]'
    ) as HTMLInputElement;
    expect(servingsInput.value).toBe("2");

    expect(screen.getByText("Banana")).toBeTruthy();
    expect(screen.getByText("1 items in recipe.")).toBeTruthy();
  });

  it("should add nutrition item to recipe", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        if (body.query.includes("SearchNutritionItems")) {
          return HttpResponse.json({
            data: {
              food_diary_nutrition_item: [
                {
                  id: 1,
                  description: "Apple",
                },
              ],
            },
          });
        }
        return HttpResponse.json({ data: {} });
      })
    );

    render(() => <NewRecipeForm />);

    const searchInput = document.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;
    await user.type(searchInput, "Apple");

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeTruthy();
    });

    const addButton = screen.getByText("⊕");
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("1 items in recipe.")).toBeTruthy();
    });
  });

  it("should update item servings in recipe", async () => {
    const user = userEvent.setup();

    const initialRecipe = {
      id: 0,
      name: "Test Recipe",
      total_servings: 1,
      recipe_items: [
        {
          servings: 1,
          nutrition_item: {
            id: 1,
            description: "Banana",
          },
        },
      ],
    };

    render(() => <NewRecipeForm initialRecipe={initialRecipe} />);

    const servingsInputs = screen.getAllByRole("spinbutton");
    const itemServingsInput = servingsInputs[1] as HTMLInputElement;

    await user.clear(itemServingsInput);
    await user.type(itemServingsInput, "2.5");

    expect(itemServingsInput.value).toBe("2.5");
  });

  it("should handle NaN in item servings input", async () => {
    const user = userEvent.setup();

    const initialRecipe = {
      id: 0,
      name: "Test Recipe",
      total_servings: 1,
      recipe_items: [
        {
          servings: 1,
          nutrition_item: {
            id: 1,
            description: "Banana",
          },
        },
      ],
    };

    render(() => <NewRecipeForm initialRecipe={initialRecipe} />);

    const servingsInputs = screen.getAllByRole("spinbutton");
    const itemServingsInput = servingsInputs[1] as HTMLInputElement;

    await user.clear(itemServingsInput);
    await user.type(itemServingsInput, "invalid");

    expect(itemServingsInput.value).toBe("");
  });

  it("should create new recipe on save", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        if (body.query.includes("CreateRecipe")) {
          return HttpResponse.json({
            data: {
              insert_food_diary_recipe_one: {
                id: 456,
              },
            },
          });
        }
        return HttpResponse.json({ data: {} });
      })
    );

    render(() => <NewRecipeForm />);

    const nameInput = document.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    await user.type(nameInput, "My Recipe");

    const saveButton = screen.getByText("Save Recipe");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/recipe/456");
    });
  });

  it("should update existing recipe on save", async () => {
    const user = userEvent.setup();

    const initialRecipe = {
      id: 123,
      name: "Existing Recipe",
      total_servings: 2,
      recipe_items: [],
    };

    server.use(
      http.post("/api/v1/graphql", async ({ request }) => {
        const body = (await request.json()) as any;
        if (body.query.includes("UpdateRecipe")) {
          return HttpResponse.json({
            data: {
              update_food_diary_recipe_by_pk: {
                id: 123,
              },
            },
          });
        }
        return HttpResponse.json({ data: {} });
      })
    );

    render(() => <NewRecipeForm initialRecipe={initialRecipe} />);

    const saveButton = screen.getByText("Save Recipe");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/recipe/123");
    });
  });

  it("should not navigate when create recipe fails", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("/api/v1/graphql", () => {
        return HttpResponse.json({
          data: {
            insert_food_diary_recipe_one: null,
          },
        });
      })
    );

    render(() => <NewRecipeForm />);

    const nameInput = document.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    await user.type(nameInput, "My Recipe");

    const saveButton = screen.getByText("Save Recipe");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should not navigate when update recipe fails", async () => {
    const user = userEvent.setup();

    const initialRecipe = {
      id: 123,
      name: "Existing Recipe",
      total_servings: 2,
      recipe_items: [],
    };

    server.use(
      http.post("/api/v1/graphql", () => {
        return HttpResponse.json({
          data: {
            update_food_diary_recipe_by_pk: null,
          },
        });
      })
    );

    render(() => <NewRecipeForm initialRecipe={initialRecipe} />);

    const saveButton = screen.getByText("Save Recipe");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
