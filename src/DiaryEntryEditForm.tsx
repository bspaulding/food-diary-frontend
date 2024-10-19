import type { Component } from "solid-js";
import { useAuth } from "./Auth0";
import { createSignal } from "solid-js";
import { format, parse, formatISO, parseISO } from "date-fns";
import { Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import createAuthorizedResource from "./createAuthorizedResource";
import { getDiaryEntry, updateDiaryEntry } from "./Api";
import ButtonLink from "./ButtonLink";

const DiaryEntryEditForm: Component = () => {
  const params = useParams();
  const [{ accessToken }] = useAuth();
  const [diaryEntryQuery] = createAuthorizedResource(
    () => params.id,
    getDiaryEntry
  );
  const [consumedAt, setConsumedAt] = createSignal(undefined);
  const [servings, setServings] = createSignal(undefined);
  const [disabled, setDisabled] = createSignal(false);
  const [errors, setErrors] = createSignal([]);
  const navigate = useNavigate();

  const diaryEntry = () =>
    diaryEntryQuery()?.data.food_diary_diary_entry_by_pk || {};
  const href = () =>
    diaryEntry()?.nutrition_item
      ? `/nutrition_item/${diaryEntry()?.nutrition_item?.id}`
      : `/recipe/${diaryEntry()?.recipe?.id}`;
  return (
    <>
      <div class="flex space-x-4 mb-4">
        <ButtonLink href="/">Back to Diary</ButtonLink>
      </div>
      <Show when={errors().length}>
        <pre class="text-red-600">{errors().join("\n")}</pre>
      </Show>
      <Show when={diaryEntry()?.id}>
        <div class="mb-4">
          <p class="text-2xl">
            {diaryEntry().nutrition_item?.description ||
              diaryEntry().recipe?.name}
          </p>
          <p class="text-indigo-600">
            <a href={href()}>View Detail</a>
          </p>
        </div>
        <form>
          <fieldset class="flex flex-col">
            <label for="servings">Servings</label>
            <input
              id="servings"
              type="number"
              value={diaryEntry().servings}
              onChange={(e) => setServings(parseInt(e.target.value, 10))}
            />
          </fieldset>
          <fieldset class="flex flex-col">
            <label for="consumed_at">Consumed At</label>
            <input
              id="consumed_at"
              type="datetime-local"
              value={format(
                parseISO(diaryEntry().consumed_at),
                "yyyy-MM-dd'T'HH:mm"
              )}
              onChange={(e) => setConsumedAt(e.target.value)}
            />
          </fieldset>
          <fieldset class="mt-4 mb-4">
            <button
              class="bg-indigo-600 text-slate-50 py-3 w-full text-xl font-semibold"
              disabled={disabled()}
              onClick={async () => {
                setErrors([]);
                if (!consumedAt() && !servings()) {
                  navigate("/");
                  return; // nothing changed, nothing to do
                }
                setDisabled(true);
                const parsed = parse(
                  consumedAt(),
                  "yyyy-MM-dd'T'HH:mm",
                  new Date()
                );
                console.log({ parsed });
                try {
                  const response = await updateDiaryEntry(accessToken(), {
                    id: diaryEntry().id,
                    consumedAt: formatISO(parsed),
                    servings: servings() || diaryEntry().servings,
                  });
                  console.log(response.errors);
                  if (response.errors) {
                    console.debug(response.errors);
                    setDisabled(false);
                    setErrors(
                      response.errors
                        .filter((e) => e.message)
                        .map((e) => e.message)
                    );
                  } else {
                    setErrors([]);
                    navigate("/");
                  }
                } catch (e) {
                  console.debug(e);
                  setDisabled(false);
                }
              }}
            >
              {disabled() ? "Saving..." : "Save"}
            </button>
          </fieldset>
        </form>
      </Show>
    </>
  );
};

export default DiaryEntryEditForm;
