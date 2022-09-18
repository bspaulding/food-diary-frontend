import type { Component } from "solid-js";
import { createSignal, Index, Show } from "solid-js";
import { Link } from "@solidjs/router";
import { fetchRecentEntries, createDiaryEntry } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
import { useAuth } from "./Auth0";
import SearchItemsForm from "./SearchItemsForm";
import ButtonLink from "./ButtonLink";

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
  const [getRecentItemsQuery] = createAuthorizedResource(fetchRecentEntries);
  const recentItems = () =>
    getRecentItemsQuery()?.data?.food_diary_recently_logged_items || [];

  return (
    <div>
      <div class="flex space-x-4 mb-4">
        <ButtonLink href="/">Back to Diary</ButtonLink>
        <ButtonLink href="/nutrition_item/new">Add Item</ButtonLink>
        <ButtonLink href="/recipe/new">Add Recipe</ButtonLink>
      </div>
      <div>
        <h2>Suggestions</h2>
        <ul>
          <Index each={recentItems()}>
            {(item) => (
              <li>
                <LoggableItem
                  recipe={item().recipe}
                  nutritionItem={item().nutrition_item}
                />
              </li>
            )}
          </Index>
        </ul>
      </div>
      <SearchItemsForm>
        {({ nutritionItem, recipe }) => (
          <li>
            <LoggableItem nutritionItem={nutritionItem} recipe={recipe} />
            <small>{recipe ? "[RECIPE]" : "[ITEM]"}</small>
          </li>
        )}
      </SearchItemsForm>
    </div>
  );
};

export default NewDiaryEntryForm;

const LoggableItem: Component = ({ recipe, nutritionItem }) => {
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
            value={servings()}
            onInput={(event) => setServings(parseInt(event.target.value, 10))}
            style={{ width: "50px" }}
          />
          <button
            class="ml-2 bg-indigo-600 text-slate-50 py-1 px-3 text-lg rounded-md"
            onClick={async () => {
              const entry = {
                servings: servings(),
                recipe_id: recipe?.id,
                nutrition_item_id: nutritionItem?.id,
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
