import type { Component } from "solid-js";
import { createSignal, Index } from "solid-js";
import { throttle } from "@solid-primitives/scheduled";
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
      : searchItemsOnly
  );
  const nutritionItems = () =>
    getItemsQuery()?.data?.food_diary_search_nutrition_items || [];
  const recipes = () => getItemsQuery()?.data?.food_diary_search_recipes || [];

  return (
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
            {(item) => children({ nutritionItem: item() })}
          </Index>
          <Index each={recipes()}>
            {(recipe) => children({ recipe: recipe() })}
          </Index>
        </ul>
      </div>
    </section>
  );
};

export default SearchItemsForm;
