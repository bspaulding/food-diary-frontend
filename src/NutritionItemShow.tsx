import type { Component } from "solid-js";
import { useParams, Link } from "@solidjs/router";
import { createResource } from "solid-js";
import { fetchNutritionItem } from "./Api";

const NutritionItemShow: Component = () => {
  const params = useParams();
  const [nutritionItemQuery] = createResource(
    () => params.id,
    fetchNutritionItem
  );

  const nutritionItem = () =>
    nutritionItemQuery()?.data?.food_diary_nutrition_item_by_pk || {};
  return (
    <div style={{ margin: "18px" }}>
      <Link href="/">Back to entries</Link>
      <pre>{JSON.stringify(nutritionItem(), null, 2)}</pre>
    </div>
  );
};

export default NutritionItemShow;
