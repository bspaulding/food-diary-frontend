import type { Component, Accessor, Setter } from "solid-js";
import { createSignal } from "solid-js";
import type { Navigator } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import styles from "./NewNutritionItemForm.module.css";
import type { NutritionItem } from "./Api";
import { createNutritionItem } from "./Api";

const fromTextInput = (setter: Setter<string>) => (event) => {
  console.log("fromTextInput for ", setter);
  setter(event.target.value || "");
};

const fromNumberInput = (setter: Setter<number>) => (event) => {
  console.log("fromNumberInput for ", setter);
  setter(parseInt(event.target.value, 10));
};

const NewNutritionItemForm: Component = () => {
  const [disabled, setDisabled] = createSignal(false);
  const navigate = useNavigate();

  const [description, setDescription] = createSignal("");
  const [calories, setCalories] = createSignal(0);
  const [totalFatGrams, setTotalFatGrams] = createSignal(0);
  const [saturatedFatGrams, setSaturatedFatGrams] = createSignal(0);
  const [transFatGrams, setTransFatGrams] = createSignal(0);
  const [polyunsaturatedFatGrams, setPolyunsaturatedFatGrams] = createSignal(0);
  const [monounsaturatedFatGrams, setMonounsaturatedFatGrams] = createSignal(0);
  const [cholesterolMilligrams, setCholesterolMilligrams] = createSignal(0);
  const [sodiumMilligrams, setSodiumMilligrams] = createSignal(0);
  const [totalCarbohydrateGrams, setTotalCarbohydrateGrams] = createSignal(0);
  const [dietaryFiberGrams, setDietaryFiberGrams] = createSignal(0);
  const [totalSugarsGrams, setTotalSugarsGrams] = createSignal(0);
  const [addedSugarsGrams, setAddedSugarsGrams] = createSignal(0);
  const [proteinGrams, setProteinGrams] = createSignal(0);

  const item = () =>
    accessorsToObject({
      description,
      calories,
      totalFatGrams,
      saturatedFatGrams,
      transFatGrams,
      polyunsaturatedFatGrams,
      monounsaturatedFatGrams,
      cholesterolMilligrams,
      sodiumMilligrams,
      totalCarbohydrateGrams,
      dietaryFiberGrams,
      totalSugarsGrams,
      addedSugarsGrams,
      proteinGrams,
    });

  return (
    <form class={styles.form}>
      <fieldset>
        <label for="description">Description</label>
        <input
          type="text"
          name="description"
          disabled={disabled()}
          value={description()}
          onInput={fromTextInput(setDescription)}
        />
      </fieldset>
      <fieldset class={styles.facts}>
        <legend>Nutrition Facts</legend>

        <label for="calories">Calories</label>
        <input
          type="number"
          name="calories"
          disabled={disabled()}
          value={calories()}
          onInput={fromNumberInput(setCalories)}
        />

        <label for="total-fat-grams">Total Fat (g)</label>
        <input
          type="number"
          name="total-fat-grams"
          disabled={disabled()}
          value={totalFatGrams()}
          onInput={fromNumberInput(setTotalFatGrams)}
        />

        <label for="saturated-fat-grams">Saturated Fat (g)</label>
        <input
          type="number"
          name="saturated-fat-grams"
          disabled={disabled()}
          value={saturatedFatGrams()}
          onInput={fromNumberInput(setSaturatedFatGrams)}
        />

        <label for="trans-fat-grams">Trans Fat (g)</label>
        <input
          type="number"
          name="trans-fat-grams"
          disabled={disabled()}
          value={transFatGrams()}
          onInput={fromNumberInput(setTransFatGrams)}
        />

        <label for="polyunsaturated-fat-grams">Polyunsaturated Fat (g)</label>
        <input
          type="number"
          name="polyunsaturated-fat-grams"
          disabled={disabled()}
          value={polyunsaturatedFatGrams()}
          onInput={fromNumberInput(setPolyunsaturatedFatGrams)}
        />

        <label for="monounsaturated-fat-grams">Monounsaturated Fat (g)</label>
        <input
          type="number"
          name="monounsaturated-fat-grams"
          disabled={disabled()}
          value={monounsaturatedFatGrams()}
          onInput={fromNumberInput(setMonounsaturatedFatGrams)}
        />

        <label for="cholesterol-milligrams">Cholesterol (mg)</label>
        <input
          type="number"
          name="cholesterol-milligrams"
          disabled={disabled()}
          value={cholesterolMilligrams()}
          onInput={fromNumberInput(setCholesterolMilligrams)}
        />

        <label for="sodium-milligrams">Sodium (mg)</label>
        <input
          type="number"
          name="sodium-milligrams"
          disabled={disabled()}
          value={sodiumMilligrams()}
          onInput={fromNumberInput(setSodiumMilligrams)}
        />

        <label for="total-carbohydrate-grams">Total Carbohydrate (g)</label>
        <input
          type="number"
          name="total-carbohydrate-grams"
          disabled={disabled()}
          value={totalCarbohydrateGrams()}
          onInput={fromNumberInput(setTotalCarbohydrateGrams)}
        />

        <label for="dietary-fiber-grams">Dietary Fiber (g)</label>
        <input
          type="number"
          name="dietary-fiber-grams"
          disabled={disabled()}
          value={dietaryFiberGrams()}
          onInput={fromNumberInput(setDietaryFiberGrams)}
        />

        <label for="total-sugars-grams">Total Sugars (g)</label>
        <input
          type="number"
          name="total-sugars-grams"
          disabled={disabled()}
          value={totalSugarsGrams()}
          onInput={fromNumberInput(setTotalSugarsGrams)}
        />

        <label for="added-sugars-grams">Added Sugars (g)</label>
        <input
          type="number"
          name="added-sugars-grams"
          disabled={disabled()}
          value={addedSugarsGrams()}
          onInput={fromNumberInput(setAddedSugarsGrams)}
        />

        <label for="protein-grams">Protein (g)</label>
        <input
          type="number"
          name="protein-grams"
          disabled={disabled()}
          value={proteinGrams()}
          onInput={fromNumberInput(setProteinGrams)}
        />
      </fieldset>
      <fieldset>
        <button
          disabled={disabled()}
          onClick={() => saveItem(setDisabled, navigate, item())}
        >
          Save
        </button>
      </fieldset>
    </form>
  );
};

export default NewNutritionItemForm;

const saveItem = async (
  setLoading: Setter<boolean>,
  navigator: Navigator,
  item: NutritionItem
) => {
  setLoading(true);
  const response = await createNutritionItem(item);
  const id = response.data?.insert_food_diary_nutrition_item_one.id;
  navigator(`/nutrition_item/${id}`);
};

type Accessors<T> = {
  [P in keyof T]: () => T[P];
};

function accessorsToObject<T>(accessors: Accessors<T>): T {
  return Object.entries(accessors).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: v(),
    }),
    {}
  );
}
