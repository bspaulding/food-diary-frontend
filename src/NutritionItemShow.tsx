import type { Component } from "solid-js";
import { useParams, Link } from "@solidjs/router";
import { fetchNutritionItem } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
import ButtonLink from "./ButtonLink";

const keys_denylist = ["id", "description"];

const propTitles = {
  calories: "Calories",
  totalFatGrams: "Total Fat (g)",
  saturatedFatGrams: "Saturated Fat (g)",
  transFatGrams: "Trans Fat (g)",
  polyunsaturatedFatGrams: "Polyunsaturated Fat (g)",
  monounsaturatedFatGrams: "Monounsaturated Fat (g)",
  cholesterolMilligrams: "Cholesterol (mg)",
  sodiumMilligrams: "Sodium (mg)",
  totalCarbohydrateGrams: "Total Carbohydrate (g)",
  dietaryFiberGrams: "Dietary Fiber (g)",
  totalSugarsGrams: "Total Sugars (g)",
  addedSugarsGrams: "Added Sugars (g)",
  proteinGrams: "Protein (g)",
};

const boldKeys = [
  "calories",
  "totalFatGrams",
  "cholesterolMilligrams",
  "sodiumMilligrams",
  "totalCarbohydrateGrams",
  "proteinGrams",
];

const NutritionItemShow: Component = () => {
  const params = useParams();
  const [nutritionItemQuery] = createAuthorizedResource(
    () => params.id,
    fetchNutritionItem
  );

  const nutritionItem = () =>
    nutritionItemQuery()?.data?.food_diary_nutrition_item_by_pk || {};
  return (
    <div style={{ margin: "18px" }}>
      <div class="flex space-x-4 mb-4">
        <ButtonLink href="/">Back to Diary</ButtonLink>
        <ButtonLink href={`/nutrition_item/${params.id}/edit`}>
          Edit Item
        </ButtonLink>
      </div>
      <h1 class="font-semibold text-2xl">{nutritionItem().description}</h1>
      <div class="text-lg">
        {Object.keys(nutritionItem())
          .filter((k) => keys_denylist.indexOf(k) < 0)
          .map((k) => (
            <p class="flex justify-between">
              <span class={boldKeys.indexOf(k) >= 0 ? "font-semibold" : "ml-4"}>
                {propTitles[k] || k}
              </span>
              <span>{nutritionItem()[k]}</span>
            </p>
          ))}
      </div>
    </div>
  );
};

export default NutritionItemShow;
