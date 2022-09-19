import type { Component } from "solid-js";
import { createSignal, Index } from "solid-js";
import { Link, useNavigate } from "@solidjs/router";
import type { InsertRecipeInput } from "./Api";
import { createRecipe } from "./Api";
import SearchItemsForm, { ItemsQueryType } from "./SearchItemsForm";
import { useAuth } from "./Auth0";
import ButtonLink from "./ButtonLink";

const NewRecipeForm: Component = () => {
  const [{ accessToken }] = useAuth();
  const [input, setInput] = createSignal<InsertRecipeInput>({
    name: "",
    total_servings: 1,
    recipe_items: [],
  });
  const navigate = useNavigate();
  return (
    <div>
      <ButtonLink href="/">Back to entries</ButtonLink>
      <h2 class="font-bold text-xl mt-4">New Recipe</h2>
      <form class="flex flex-col">
        <fieldset class="flex flex-col">
          <legend class="font-semibold">Info</legend>
          <label for="name">Name</label>
          <input
            type="text"
            name="name"
            onInput={(event) => {
              setInput((input) => ({
                ...input,
                name: event.target.value,
              }));
            }}
          />
          <label for="total-servings">Total Servings</label>
          <input
            type="number"
            name="total-servings"
            min="0"
            step="0.1"
            value={input().total_servings}
            onInput={(event) => {
              const total_servings = parseFloat(event.target.value, 10);
              if (isNaN(total_servings)) {
                return;
              }
              setInput((input) => ({
                ...input,
                total_servings,
              }));
            }}
          />
        </fieldset>
        <fieldset>
          <legend class="font-semibold">Items</legend>
          <small>{input().recipe_items.length} items in recipe.</small>
          <ul>
            <Index each={input().recipe_items}>
              {(item, i) => (
                <li class="flex flex-row place-content-between items-center">
                  <p>{item().nutrition_item.description}</p>
                  <input
                    type="number"
                    value={item().servings}
                    min="0"
                    step="0.1"
                    class="w-20"
                    onInput={(event) => {
                      const servings = parseFloat(event.target.value, 10);
                      if (isNaN(servings)) {
                        return;
                      }
                      setInput((input) => ({
                        ...input,
                        recipe_items: [
                          ...input.recipe_items.slice(0, i),
                          {
                            ...item(),
                            servings,
                          },
                          ...input.recipe_items.slice(i + 1),
                        ],
                      }));
                    }}
                  />
                </li>
              )}
            </Index>
          </ul>
        </fieldset>
        <fieldset>
          <legend class="font-semibold">Add New Items</legend>
          <SearchItemsForm queryType={ItemsQueryType.ItemsOnly}>
            {({ clear, nutritionItem }) => (
              <li class="flex flex-row">
                <button
                  class="mr-1 text-3xl text-indigo-600 transition-transform "
                  onClick={(event) => {
                    event.preventDefault();
                    setInput((input) => ({
                      ...input,
                      recipe_items: [
                        ...input.recipe_items,
                        {
                          servings: 1,
                          nutrition_item: nutritionItem,
                        },
                      ],
                    }));
                    clear();
                    return false;
                  }}
                >
                  ⊕
                </button>
                <p>{nutritionItem.description}</p>
              </li>
            )}
          </SearchItemsForm>
        </fieldset>
        <fieldset class="mt-4">
          <button
            class="bg-indigo-600 text-slate-50 py-3 w-full text-xl font-semibold"
            onClick={async (event) => {
              event.preventDefault();
              const response = await createRecipe(accessToken(), input());
              const id = response?.data?.insert_food_diary_recipe_one?.id;
              if (id) {
                navigate(`/recipe/${id}`);
              }
              return false;
            }}
          >
            Save Recipe
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default NewRecipeForm;
