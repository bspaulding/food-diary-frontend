import type { Component } from "solid-js";
import { useParams, Link } from "@solidjs/router";
import createAuthorizedResource from "./createAuthorizedResource";
import { fetchRecipe } from "./Api";

const RecipeShow: Component = () => {
  const params = useParams();
  const [recipeQuery] = createAuthorizedResource(() => params.id, fetchRecipe);
  const recipe = () =>
    recipeQuery()?.data?.food_diary_recipe_by_pk || { id: params.id };

  return (
    <>
      <p>
        <Link href="/">Back to entries</Link>
        <Link href={`/recipe/${params.id}/edit`}>Edit</Link>
      </p>
      <pre>{JSON.stringify(recipe(), null, 2)}</pre>
    </>
  );
};

export default RecipeShow;
