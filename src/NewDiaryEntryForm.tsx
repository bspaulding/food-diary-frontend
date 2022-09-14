import type { Component } from "solid-js";
import { createSignal, Index, Show } from "solid-js";
import { Link } from "@solidjs/router";
import { fetchRecentEntries, createDiaryEntry } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
import { useAuth } from "./Auth0";
import SearchItemsForm from "./SearchItemsForm";

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
