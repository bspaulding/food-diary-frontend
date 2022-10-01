import type { Component } from "solid-js";
import { createSignal, Index, Show } from "solid-js";
import { parse } from "csv-parse/browser/esm/sync";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as timezone from "dayjs/plugin/timezone";
import * as advancedFormat from "dayjs/plugin/advancedFormat";
import type { NewDiaryEntry } from "./Api";
import type { Either } from "./Either";
import { Left, Right, isRight, isLeft } from "./Either";
import { useAuth } from "./Auth0";
import { insertDiaryEntries } from "./Api";
import ButtonLink from "./ButtonLink";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(timezone);

function readFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      resolve(event.target.result);
    });
    reader.addEventListener("error", reject);
    reader.readAsText(file);
  });
}

function parseCSV(csv: string) {
  const lines = parse(csv);
  const header = lines[0];
  const rows = lines.slice(1);
  console.log({ header, rows });
  return rows.map((row) =>
    row.reduce(
      (acc, cell, i) => ({
        ...acc,
        [header[i]]: cell,
      }),
      {}
    )
  );
}

function parseNumber(parser, value) {
  const parsed = parser(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function rowToEntry(row: string[]): Either<object, NewDiaryEntry> {
  try {
    return Right({
      consumed_at: dayjs(row["Consumed At"], [
        "YYYY-MM-DD h:mm A",
        "YYYY-MM-DD H:mm",
      ]).toISOString(),
      servings: parseFloat(row["Servings"], 10),
      nutrition_item: {
        description: row["Description"],
        calories: parseNumber(parseInt, row["Calories"]),
        totalFatGrams: parseNumber(parseFloat, row["Total Fat (g)"]),
        saturatedFatGrams: parseNumber(parseFloat, row["Saturated Fat (g)"]),
        transFatGrams: parseNumber(parseFloat, row["Trans Fat (g)"]),
        polyunsaturatedFatGrams: parseNumber(
          parseFloat,
          row["Polyunsaturated Fat (g)"]
        ),
        monounsaturatedFatGrams: parseNumber(
          parseFloat,
          row["Monounsaturated Fat (g)"]
        ),
        cholesterolMilligrams: parseNumber(parseFloat, row["Cholesterol (mg)"]),
        sodiumMilligrams: parseNumber(parseFloat, row["Sodium (mg)"]),
        totalCarbohydrateGrams: parseNumber(
          parseFloat,
          row["Total Carbohydrate (g)"]
        ),
        dietaryFiberGrams: parseNumber(parseFloat, row["Dietary Fiber (g)"]),
        totalSugarsGrams: parseNumber(parseFloat, row["Total Sugars (g)"]),
        addedSugarsGrams: parseNumber(parseFloat, row["Added Sugars (g)"]),
        proteinGrams: parseNumber(parseFloat, row["Protein (g)"]),
      },
    });
  } catch (e: any) {
    return Left({ error: e, row });
  }
}

const ImportDiaryEntries: Component = () => {
  const [parseResult, setParseResult] = createSignal({ lefts: [], rights: [] });
  const [{ accessToken }] = useAuth();
  const [saving, setSaving] = createSignal(false);
  const [saved, setSaved] = createSignal(false);

  const fileChanged = async (event) => {
    const file = event.target.files[0];
    const csv = await readFile(file);
    const rows = parseCSV(csv);
    const entries = rows.map(rowToEntry);
    const lefts = entries.filter(isLeft).map((r) => r.value);
    const rights = entries.filter(isRight).map((r) => r.value);
    console.log({ lefts, rights });
    setParseResult({ parsed: true, lefts, rights });
  };

  const startImport = async (e) => {
    e.preventDefault();
    setSaving(true);
    const response = await insertDiaryEntries(
      accessToken(),
      parseResult().rights
    );
    setSaving(false);
    setSaved(!!response.data);
  };

  return (
    <>
      <Show when={saved()}>
        <p class="font-semibold text-center text-lg mb-4">Import successful!</p>
        <ButtonLink href="/">Back to diary</ButtonLink>
      </Show>
      <Show when={!parseResult().parsed}>
        <form>
          <fieldset class="flex flex-col">
            <label for="diary-import-file" class="mb-4">
              Select a CSV to import entries from.
            </label>
            <input type="file" name="diary-import-file" onInput={fileChanged} />
            <p class="mt-4">Expected columns are:</p>
            <ul class="list-disc ml-5">
              <li>Consumed At</li>
              <li>Description</li>
              <li>Servings</li>
              <li>Calories</li>
              <li>Total Fat (g)</li>
              <li>Saturated Fat (g)</li>
              <li>Trans Fat (g)</li>
              <li>Polyunsaturated Fat (g)</li>
              <li>Monounsaturated Fat (g)</li>
              <li>Cholesterol (mg)</li>
              <li>Sodium (mg)</li>
              <li>Total Carbohydrate (g)</li>
              <li>Dietary Fiber (g)</li>
              <li>Total Sugars (g)</li>
              <li>Added Sugars (g)</li>
              <li>Protein (g)</li>
            </ul>
          </fieldset>
        </form>
      </Show>
      <Show when={parseResult().parsed && !saved()}>
        <p>
          {parseResult().rights.length} rows parsed.{" "}
          {parseResult().lefts.length} errors.
        </p>
        <table>
          <thead>
            <tr>
              <th></th>
              <th class="text-left">Servings</th>
              <th class="text-left">Calories</th>
            </tr>
          </thead>
          <tbody>
            <Index each={parseResult().rights}>
              {(row) => (
                <>
                  <tr>
                    <td>
                      <p class="font-semibold">
                        {row().nutrition_item.description}
                      </p>
                      <p class="text-xs">
                        {dayjs(row().consumed_at).format(
                          "MMMM D, YYYY [at] h:mm A z"
                        )}
                      </p>
                    </td>
                    <td class="text-right">{row().servings}</td>
                    <td class="text-right">{row().nutrition_item.calories}</td>
                  </tr>
                  <tr>
                    <td colspan="3">
                      <CollapsibleNutritionFacts entry={row()} />
                    </td>
                  </tr>
                </>
              )}
            </Index>
          </tbody>
        </table>
        <button
          disabled={saving()}
          onClick={startImport}
          class="bg-indigo-600 text-slate-50 py-2 px-3 text-lg rounded-md my-4"
        >
          {saving() ? "Importing..." : "Import Entries"}
        </button>
      </Show>
    </>
  );
};

export default ImportDiaryEntries;

const CollapsibleNutritionFacts: Component = ({ entry }) => {
  const [collapsed, setCollapsed] = createSignal(true);
  const toggleCollapsed = (e) => {
    e.preventDefault();
    setCollapsed(!collapsed());
  };
  return (
    <div class="text-right">
      <button class="text-xs" onClick={toggleCollapsed}>
        {collapsed() ? "View" : "Hide"} Details
      </button>
      <Show when={!collapsed()}>
        <div class="grid grid-cols-6 justify-end text-right">
          <p class="font-semibold col-span-5">Total Fat (g)</p>
          <p>{entry.nutrition_item.totalFatGrams}</p>
          <p class="font-semibold col-span-5">Saturated Fat (g)</p>
          <p>{entry.nutrition_item.saturatedFatGrams}</p>
          <p class="font-semibold col-span-5">Trans Fat (g)</p>
          <p>{entry.nutrition_item.transFatGrams}</p>
          <p class="font-semibold col-span-5">Polyunsaturated Fat (g)</p>
          <p>{entry.nutrition_item.polyunsaturatedFatGrams}</p>
          <p class="font-semibold col-span-5">Monounsaturated Fat (g)</p>
          <p>{entry.nutrition_item.monounsaturatedFatGrams}</p>
          <p class="font-semibold col-span-5">Cholesterol (mg)</p>
          <p>{entry.nutrition_item.cholesterolMilligrams}</p>
          <p class="font-semibold col-span-5">Sodium (mg)</p>
          <p>{entry.nutrition_item.sodiumMilligrams}</p>
          <p class="font-semibold col-span-5">Total Carbohydrate (g)</p>
          <p>{entry.nutrition_item.totalCarbohydrateGrams}</p>
          <p class="font-semibold col-span-5">Dietary Fiber (g)</p>
          <p>{entry.nutrition_item.dietaryFiberGrams}</p>
          <p class="font-semibold col-span-5">Total Sugars (g)</p>
          <p>{entry.nutrition_item.totalSugarsGrams}</p>
          <p class="font-semibold col-span-5">Added Sugars (g)</p>
          <p>{entry.nutrition_item.addedSugarsGrams}</p>
          <p class="font-semibold col-span-5">Protein (g)</p>
          <p>{entry.nutrition_item.proteinGrams}</p>
        </div>
      </Show>
    </div>
  );
};
