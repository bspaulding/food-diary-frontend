import type { Component, Accessor, Setter } from "solid-js";
import { createSignal } from "solid-js";
import type { Navigator } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import type { NutritionItem } from "./Api";
import { createNutritionItem, updateNutritionItem } from "./Api";
import { useAuth } from "./Auth0";
import { accessorsToObject } from "./Util";

const fromTextInput = (setter: Setter<string>) => (event) => {
  setter(event.target.value || "");
};

const fromNumberInput = (setter: Setter<number>) => (event) => {
  setter(parseInt(event.target.value, 10));
};

type Props = {
  onSaved?: (id: number) => {};
  initialItem?: NutritionItem;
};

const NewNutritionItemForm: Component = ({ onSaved, initialItem }: Props) => {
  const [{ accessToken }] = useAuth();
  const [disabled, setDisabled] = createSignal(false);
  const navigate = useNavigate();

  const [id, _setId] = createSignal(initialItem?.id);
  const [description, setDescription] = createSignal(
    initialItem?.description || ""
  );
  const [calories, setCalories] = createSignal(initialItem?.calories || 0);
  const [totalFatGrams, setTotalFatGrams] = createSignal(
    initialItem?.totalFatGrams || 0
  );
  const [saturatedFatGrams, setSaturatedFatGrams] = createSignal(
    initialItem?.saturatedFatGrams || 0
  );
  const [transFatGrams, setTransFatGrams] = createSignal(
    initialItem?.transFatGrams || 0
  );
  const [polyunsaturatedFatGrams, setPolyunsaturatedFatGrams] = createSignal(
    initialItem?.polyunsaturatedFatGrams || 0
  );
  const [monounsaturatedFatGrams, setMonounsaturatedFatGrams] = createSignal(
    initialItem?.monounsaturatedFatGrams || 0
  );
  const [cholesterolMilligrams, setCholesterolMilligrams] = createSignal(
    initialItem?.cholesterolMilligrams || 0
  );
  const [sodiumMilligrams, setSodiumMilligrams] = createSignal(
    initialItem?.sodiumMilligrams || 0
  );
  const [totalCarbohydrateGrams, setTotalCarbohydrateGrams] = createSignal(
    initialItem?.totalCarbohydrateGrams || 0
  );
  const [dietaryFiberGrams, setDietaryFiberGrams] = createSignal(
    initialItem?.dietaryFiberGrams || 0
  );
  const [totalSugarsGrams, setTotalSugarsGrams] = createSignal(
    initialItem?.totalSugarsGrams || 0
  );
  const [addedSugarsGrams, setAddedSugarsGrams] = createSignal(
    initialItem?.addedSugarsGrams || 0
  );
  const [proteinGrams, setProteinGrams] = createSignal(
    initialItem?.proteinGrams || 0
  );

  const item = () =>
    accessorsToObject({
      id,
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
    <form>
      <fieldset class="flex flex-col">
        <label for="description">Description</label>
        <input
          type="text"
          name="description"
          disabled={disabled()}
          value={description()}
          onInput={fromTextInput(setDescription)}
        />
      </fieldset>
      <fieldset class="flex flex-col my-4">
        <legend class="font-semibold">Nutrition Facts</legend>

        <label for="calories">Calories</label>
        <input
          type="number"
          step="0.1"
          name="calories"
          disabled={disabled()}
          value={calories()}
          onInput={fromNumberInput(setCalories)}
        />

        <label for="total-fat-grams">Total Fat (g)</label>
        <input
          type="number"
          step="0.1"
          name="total-fat-grams"
          disabled={disabled()}
          value={totalFatGrams()}
          onInput={fromNumberInput(setTotalFatGrams)}
        />

        <label for="saturated-fat-grams">Saturated Fat (g)</label>
        <input
          type="number"
          step="0.1"
          name="saturated-fat-grams"
          disabled={disabled()}
          value={saturatedFatGrams()}
          onInput={fromNumberInput(setSaturatedFatGrams)}
        />

        <label for="trans-fat-grams">Trans Fat (g)</label>
        <input
          type="number"
          step="0.1"
          name="trans-fat-grams"
          disabled={disabled()}
          value={transFatGrams()}
          onInput={fromNumberInput(setTransFatGrams)}
        />

        <label for="polyunsaturated-fat-grams">Polyunsaturated Fat (g)</label>
        <input
          type="number"
          step="0.1"
          name="polyunsaturated-fat-grams"
          disabled={disabled()}
          value={polyunsaturatedFatGrams()}
          onInput={fromNumberInput(setPolyunsaturatedFatGrams)}
        />

        <label for="monounsaturated-fat-grams">Monounsaturated Fat (g)</label>
        <input
          type="number"
          step="0.1"
          name="monounsaturated-fat-grams"
          disabled={disabled()}
          value={monounsaturatedFatGrams()}
          onInput={fromNumberInput(setMonounsaturatedFatGrams)}
        />

        <label for="cholesterol-milligrams">Cholesterol (mg)</label>
        <input
          type="number"
          step="0.1"
          name="cholesterol-milligrams"
          disabled={disabled()}
          value={cholesterolMilligrams()}
          onInput={fromNumberInput(setCholesterolMilligrams)}
        />

        <label for="sodium-milligrams">Sodium (mg)</label>
        <input
          type="number"
          step="0.1"
          name="sodium-milligrams"
          disabled={disabled()}
          value={sodiumMilligrams()}
          onInput={fromNumberInput(setSodiumMilligrams)}
        />

        <label for="total-carbohydrate-grams">Total Carbohydrate (g)</label>
        <input
          type="number"
          step="0.1"
          name="total-carbohydrate-grams"
          disabled={disabled()}
          value={totalCarbohydrateGrams()}
          onInput={fromNumberInput(setTotalCarbohydrateGrams)}
        />

        <label for="dietary-fiber-grams">Dietary Fiber (g)</label>
        <input
          type="number"
          step="0.1"
          name="dietary-fiber-grams"
          disabled={disabled()}
          value={dietaryFiberGrams()}
          onInput={fromNumberInput(setDietaryFiberGrams)}
        />

        <label for="total-sugars-grams">Total Sugars (g)</label>
        <input
          type="number"
          step="0.1"
          name="total-sugars-grams"
          disabled={disabled()}
          value={totalSugarsGrams()}
          onInput={fromNumberInput(setTotalSugarsGrams)}
        />

        <label for="added-sugars-grams">Added Sugars (g)</label>
        <input
          type="number"
          step="0.1"
          name="added-sugars-grams"
          disabled={disabled()}
          value={addedSugarsGrams()}
          onInput={fromNumberInput(setAddedSugarsGrams)}
        />

        <label for="protein-grams">Protein (g)</label>
        <input
          type="number"
          step="0.1"
          name="protein-grams"
          disabled={disabled()}
          value={proteinGrams()}
          onInput={fromNumberInput(setProteinGrams)}
        />
      </fieldset>
      <fieldset class="mb-4">
        <button
          class="bg-indigo-600 text-slate-50 py-3 w-full text-xl font-semibold"
          disabled={disabled()}
          onClick={async () => {
            const id = await saveItem(accessToken(), setDisabled, item());
            if (!onSaved) {
              navigate(`/nutrition_item/${id}`);
            }
          }}
        >
          {disabled() ? "Saving..." : "Save"}
        </button>
      </fieldset>
    </form>
  );
};

export default NewNutritionItemForm;

const saveItem = async (
  accessToken: string,
  setLoading: Setter<boolean>,
  item: NutritionItem
) => {
  setLoading(true);
  if (item.id) {
    const response = await updateNutritionItem(accessToken, item);
    const id = response.data?.update_food_diary_nutrition_item_by_pk.id;
    return id;
  } else {
    const response = await createNutritionItem(accessToken, item);
    const id = response.data?.insert_food_diary_nutrition_item_one.id;
    return id;
  }
};
