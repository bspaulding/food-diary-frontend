import type { Component } from "solid-js";
import { createSignal, Index, Show } from "solid-js";
import {
  fetchRecentEntries,
  fetchEntriesAroundTime,
  createDiaryEntry,
  SearchNutritionItem,
  SearchRecipe,
  CreateDiaryEntryInput,
} from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
import { useAuth } from "./Auth0";
import SearchItemsForm from "./SearchItemsForm";
import ButtonLink from "./ButtonLink";
import SegmentedControl from "./SegmentedControl";
import { parseISO, format, subHours, addHours } from "date-fns";

type RecipeId = number;
type NutritionItemId = number;
type ItemLink = RecipeId | NutritionItemId;
type NewDiaryEntryInput = {
  servings: number;
  consumed_at: Date;
  item_link: ItemLink;
};

type Props = {
  onSubmit: (input: NewDiaryEntryInput) => {};
};

const NewDiaryEntryForm: Component<Props> = ({ onSubmit }) => {
  const [getRecentItemsQuery] = createAuthorizedResource((token: string) =>
    fetchRecentEntries(token),
  );
  const recentItems = () =>
    getRecentItemsQuery()?.data?.food_diary_diary_entry_recent || [];

  // Calculate time range: current time ± 1 hour
  // These values are captured once when the component mounts, which is the desired behavior
  const now = new Date();
  const startTime = subHours(now, 1).toISOString();
  const endTime = addHours(now, 1).toISOString();

  const [getTimeBasedItemsQuery] = createAuthorizedResource((token: string) =>
    fetchEntriesAroundTime(token, startTime, endTime),
  );
  const timeBasedItems = () =>
    getTimeBasedItemsQuery()?.data?.food_diary_diary_entry_recent || [];

  return (
    <div>
      <div class="flex space-x-4 mb-4">
        <ButtonLink href="/">Back to Diary</ButtonLink>
        <ButtonLink href="/nutrition_item/new">Add Item</ButtonLink>
        <ButtonLink href="/recipe/new">Add Recipe</ButtonLink>
      </div>
      <SegmentedControl segments={["Suggestions", "Search"]}>
        {(segment) => (
          <>
            <Show when={segment === "Suggestions"}>
              <div>
                <Show when={timeBasedItems().length > 0}>
                  <h2 class="text-lg font-semibold">Logged around this time</h2>
                  <ul class="mb-4">
                    <Index each={timeBasedItems()}>
                      {(item) => (
                        <li>
                          <LoggableItem
                            recipe={item().recipe}
                            nutritionItem={item().nutrition_item}
                          />
                          <p class="text-xs ml-8 mb-2">
                            Logged at{" "}
                            {format(
                              parseISO(item().consumed_at),
                              "hh:mma' on ' MMMM dd, yyyy",
                            )}
                          </p>
                        </li>
                      )}
                    </Index>
                  </ul>
                </Show>
                <h2 class="text-lg font-semibold">Suggested Items</h2>
                <ul>
                  <Show when={recentItems().length === 0}>
                    <p class="text-slate-400 text-center">
                      No suggestions available
                    </p>
                  </Show>
                  <Index each={recentItems()}>
                    {(item) => (
                      <li>
                        <LoggableItem
                          recipe={item().recipe}
                          nutritionItem={item().nutrition_item}
                        />
                        <p class="text-xs ml-8 mb-2">
                          Logged at{" "}
                          {format(
                            parseISO(item().consumed_at),
                            "hh:mma' on ' MMMM dd, yyyy",
                          )}
                        </p>
                      </li>
                    )}
                  </Index>
                </ul>
              </div>
            </Show>
            <Show when={segment === "Search"}>
              <SearchItemsForm>
                {({
                  nutritionItem,
                  recipe,
                }: {
                  nutritionItem?: SearchNutritionItem;
                  recipe?: SearchRecipe;
                }) => (
                  <li>
                    <LoggableItem
                      nutritionItem={nutritionItem}
                      recipe={recipe}
                    />
                    <span class="bg-slate-400 text-slate-50 px-2 py-1 rounded text-xs ml-8">
                      {recipe ? "RECIPE" : "ITEM"}
                    </span>
                  </li>
                )}
              </SearchItemsForm>
            </Show>
          </>
        )}
      </SegmentedControl>
    </div>
  );
};

export default NewDiaryEntryForm;

export const LoggableItem: Component<{
  recipe?: SearchRecipe;
  nutritionItem?: SearchNutritionItem;
}> = ({ recipe, nutritionItem }) => {
  const [{ accessToken }] = useAuth();
  const [logging, setLogging] = createSignal(false);
  const [servings, setServings] = createSignal(1);
  const [created, setCreated] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  return (
    <div class="ml-7">
      <div class="flex items-center -ml-7">
        <button
          class={`mr-1 text-3xl text-indigo-600 transition-transform ${
            logging() ? "rotate-45" : ""
          }`}
          onClick={() => setLogging((l) => !l)}
        >
          ⊕
        </button>
        <p>{nutritionItem?.description || recipe?.name}</p>
      </div>
      <Show when={logging()}>
        <div class="ml-2 flex">
          <input
            type="number"
            inputmode="decimal"
            step="0.1"
            value={servings()}
            onInput={(event) => {
              const parsed = parseFloat(event.target.value);
              if (!isNaN(parsed)) {
                setServings(parsed);
              }
            }}
            style={{
              "min-width": "50px",
              border: "1px solid #3e4a49",
              padding: "8px",
            }}
          />
          <button
            class="ml-2 bg-indigo-600 text-slate-50 py-1 px-3 text-lg rounded-md"
            onClick={async () => {
              const entry: CreateDiaryEntryInput = recipe
                ? {
                    servings: servings(),
                    recipe_id: recipe.id,
                  }
                : {
                    servings: servings(),
                    nutrition_item_id: nutritionItem!.id,
                  };
              setSaving(true);
              await createDiaryEntry(accessToken(), entry);
              setSaving(false);
              setCreated(true);
              setTimeout(() => setCreated(false), 1000);
              setLogging(false);
            }}
          >
            Save
          </button>
          <Show when={saving()}>Saving...</Show>
        </div>
      </Show>
      <Show when={created()}>
        <span style={{ color: "green" }}>✔</span>
      </Show>
    </div>
  );
};
