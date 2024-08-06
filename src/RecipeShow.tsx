import type { Component } from "solid-js";
import { createMemo, Index } from "solid-js";
import { useParams } from "@solidjs/router";
import createAuthorizedResource from "./createAuthorizedResource";
import { fetchRecipe } from "./Api";

const RecipeShow: Component = () => {
  const params = useParams();
  const [recipeQuery] = createAuthorizedResource(() => params.id, fetchRecipe);
  const recipe = () =>
    recipeQuery()?.data?.food_diary_recipe_by_pk || { id: params.id };
  const recipeItems = createMemo(() => recipe().recipe_items);

  return (
    <>
      <p>
        <a href="/">Back to entries</a>
      </p>
      <p>
        <a href={`/recipe/${params.id}/edit`}>Edit</a>
      </p>
      <h1 class="text-lg font-semibold">{recipe().name}</h1>
      <Index each={recipeItems()} fallback="No recipe items.">
        {(item) => (
          <li class="list-none my-1">
            <a href={`/nutrition_item/${item().nutrition_item.id}`}>
              {item().nutrition_item.description}
            </a>
            <p class="text-sm">{item().servings} servings</p>
          </li>
        )}
      </Index>
    </>
  );
};

export default RecipeShow;
