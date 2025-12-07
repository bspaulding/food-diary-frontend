import type { Component } from "solid-js";
import { createMemo, Index, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import createAuthorizedResource from "./createAuthorizedResource";
import { fetchRecipe } from "./Api";
import ButtonLink from "./ButtonLink";
import { LoggableItem } from "./NewDiaryEntryForm";

const RecipeShow: Component = () => {
  const params = useParams();
  const [recipeQuery] = createAuthorizedResource(() => params.id, fetchRecipe);
  const recipe = () =>
    recipeQuery()?.data?.food_diary_recipe_by_pk || { id: params.id };
  const recipeItems = createMemo(() => recipe().recipe_items);

  const itemLoaded = () => !!recipeQuery()?.data;

  return (
    <div style={{ margin: "18px" }}>
      <div class="flex space-x-4 mb-4">
        <ButtonLink href="/">Back to Diary</ButtonLink>
        <ButtonLink href={`/recipe/${params.id}/edit`}>Edit Recipe</ButtonLink>
      </div>
      <h1 class="font-semibold text-2xl">{recipe().name}</h1>
      <Show when={itemLoaded()}>
        <LoggableItem recipe={{ id: recipe().id, name: "Log It" }} />
      </Show>
      <div class="text-lg">
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
      </div>
    </div>
  );
};

export default RecipeShow;
