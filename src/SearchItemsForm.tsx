import type { Component } from "solid-js";
import { createSignal, Index, Show, For } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { searchItemsAndRecipes, searchItemsOnly } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";

type ItemOrRecipe = { recipe?: Recipe; nutritionItem?: NutritionItem };
export enum ItemsQueryType {
  ItemsAndRecipes,
  ItemsOnly,
}
type Props = {
  children: (ItemOrRecipe) => Element;
  queryType?: ItemsQueryType;
};

const SearchItemsForm: Component = ({ children, queryType }: Props) => {
  const [search, setSearch] = createSignal("");
  const [getItemsQuery] = createAuthorizedResource(
    search,
    // TODO this should probably handle being a signal somehow? ie i think this is broken if queryType changes
    "undefined" === typeof queryType ||
      queryType === ItemsQueryType.ItemsAndRecipes
      ? searchItemsAndRecipes
      : searchItemsOnly,
  );
  const nutritionItems = () =>
    getItemsQuery()?.data?.food_diary_search_nutrition_items || [];
  const recipes = () => getItemsQuery()?.data?.food_diary_search_recipes || [];
  const clear = () => setSearch("");

  return (
    <section class="flex flex-col mt-5">
      <input
        class="border rounded px-2 text-lg"
        type="search"
        placeholder="Search Previous Items"
        name="entry-item-search"
        onInput={debounce((event: InputEvent) => {
          setSearch((event.target as HTMLInputElement).value);
        }, 500)}
        value={search()}
      />
      <div class="px-1">
        <Show when={!search().length}>
          <p class="text-center mt-4 text-slate-400">
            Search for an item or recipe you've previously added.
          </p>
        </Show>
        <Show when={search().length}>
          <p class="text-center mt-4 text-slate-400">
            <Show when={getItemsQuery.loading}>Searching...</Show>
            <Show when={!getItemsQuery.loading}>
              {nutritionItems().length + recipes().length} items
            </Show>
          </p>
          <ul>
            <For each={nutritionItems()}>
              {(nutritionItem) => children({ clear, nutritionItem })}
            </For>
            <For each={recipes()}>
              {(recipe) => children({ clear, recipe })}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
};

export default SearchItemsForm;
