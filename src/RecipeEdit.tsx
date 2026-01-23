import type { Component } from "solid-js";
import { Show } from "solid-js";
import { useParams } from "@solidjs/router";
import createAuthorizedResource from "./createAuthorizedResource";
import { fetchRecipe } from "./Api";
import NewRecipeForm from "./NewRecipeForm";

const RecipeEdit: Component = () => {
  const params = useParams();
  const [recipeQuery] = createAuthorizedResource(
    () => params.id,
    (token: string, id: string) => fetchRecipe(token, parseInt(id, 10)),
  );
  const recipe = () => recipeQuery()?.data?.food_diary_recipe_by_pk || {};

  return (
    <Show when={recipe().id}>
      <NewRecipeForm initialRecipe={recipe() as any} />
    </Show>
  );
  return <div>{recipe().id}</div>;
};

export default RecipeEdit;
