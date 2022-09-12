import type { Component } from "solid-js";
import { createSignal, Index, Show } from "solid-js";
import { Link } from "@solidjs/router";
import {
  searchItemsAndRecipes,
  fetchRecentEntries,
  createDiaryEntry,
} from "./Api";
import { throttle } from "@solid-primitives/scheduled";
import createAuthorizedResource from "./createAuthorizedResource";
import { useAuth } from "./Auth0";

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
  const [search, setSearch] = createSignal("");
  const [getRecentItemsQuery] = createAuthorizedResource(fetchRecentEntries);
  const [getItemsQuery] = createAuthorizedResource(
    search,
    searchItemsAndRecipes
  );
  const nutritionItems = () =>
    getItemsQuery()?.data?.food_diary_search_nutrition_items || [];
  const recipes = () => getItemsQuery()?.data?.food_diary_search_recipes || [];
  const recentItems = () =>
    getRecentItemsQuery()?.data?.food_diary_recently_logged_items || [];

  return (
    <div>
      <p>
        <Link href="/">Back to Diary</Link>
      </p>
      <p>
        <Link href="/nutrition_item/new">Add New Nutrition Item</Link>
      </p>
      <p>
        <Link href="/recipe/new">Create New Recipe</Link>
      </p>
      <div>
        <h2>Recently Logged Items</h2>
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
      <section>
        <input
          type="search"
          placeholder="Search Previous Items"
          name="entry-item-search"
          onInput={throttle((event) => {
            setSearch(event.target.value);
          }, 1000)}
          value={search()}
        />
        <div>
          <h2>Search Results</h2>
          <p>{nutritionItems().length + recipes().length} items</p>
          <ul>
            <Index each={nutritionItems()}>
              {(item) => (
                <li>
                  <LoggableItem nutritionItem={item()} />
                </li>
              )}
            </Index>
            <Index each={recipes()}>
              {(recipe) => (
                <li>
                  <LoggableItem recipe={recipe()} />
                </li>
              )}
            </Index>
          </ul>
        </div>
      </section>
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
    <p>
      {nutritionItem?.description || recipe?.name}
      {logging() ? (
        <>
          <input
            type="number"
            value={servings()}
            onInput={(event) => setServings(parseInt(event.target.value, 10))}
            style={{ width: "50px" }}
          />
          <button
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
          <button onClick={() => setLogging(false)}>Cancel</button>
          <Show when={saving()}>Saving...</Show>
        </>
      ) : (
        <button onClick={() => setLogging(true)}>Log This</button>
      )}
      <Show when={created()}>
        <span style={{ color: "green" }}>✔</span>
      </Show>
    </p>
  );
};
