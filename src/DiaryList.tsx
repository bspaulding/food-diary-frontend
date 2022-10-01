import type { Accessor, Component, Setter } from "solid-js";
import { Index, Show } from "solid-js";
import { Link } from "@solidjs/router";
import type { DiaryEntry, GetEntriesQueryResponse } from "./Api";
import { fetchEntries, deleteDiaryEntry } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
import { useAuth } from "./Auth0";
import { parseAndFormatTime, parseAndFormatDay, pluralize } from "./Util";
import DateBadge from "./DateBadge";
import ButtonLink from "./ButtonLink";

const DiaryList: Component = () => {
  const [{ accessToken }] = useAuth();
  const [getEntriesQuery, { mutate }] = createAuthorizedResource(fetchEntries);
  const entries = () => getEntriesQuery()?.data?.food_diary_diary_entry || [];
  const entriesByDay = () =>
    Object.entries(
      entries().reduce(
        (acc, entry) => ({
          ...acc,
          [entry.day]: [...(acc[entry.day] || []), entry],
        }),
        {}
      )
    );

  return (
    <>
      <p class="mb-3">
        <ButtonLink href="/diary_entry/new">Add New Entry</ButtonLink>
        <ButtonLink class="ml-3" href="/diary_entry/import">Import Entries</ButtonLink>
      </p>
      <ul class="mt-4">
        <Show when={entries().length === 0}>
          <p class="text-slate-400 text-center">No entries, yet...</p>
        </Show>
        <Index each={entriesByDay()}>
          {(dayEntries, i) => (
            <li class="grid grid-cols-6 -ml-4 mb-6">
              <div>
                <DateBadge
                  class="col-span-1"
                  date={new Date(dayEntries()[0])}
                />
                <div class="text-center text-xl mt-4">
                  <p>
                    {dayEntries()[1].reduce(
                      (acc, entry) => acc + entry.calories,
                      0
                    )}
                  </p>
                  <p class="text-sm uppercase">KCAL</p>
                </div>
              </div>
              <ul class="col-span-5 mb-6">
                <Index each={dayEntries()[1]}>
                  {(entry, i) => (
                    <li class="mb-4">
                      <p class="font-semibold">{entry().calories} kcal</p>
                      <p>
                        <Link
                          href={
                            entry().recipe?.id
                              ? `/recipe/${entry().recipe?.id}`
                              : `/nutrition_item/${entry().nutrition_item?.id}`
                          }
                        >
                          {entry().nutrition_item?.description ||
                            entry().recipe?.name}
                        </Link>
                      </p>
                      <p class="flex justify-between text-sm">
                        {pluralize(entry().servings, "serving", "servings")} at{" "}
                        {parseAndFormatTime(entry().consumed_at)}
                        <button
                          onClick={() =>
                            deleteEntry(
                              accessToken,
                              entry(),
                              getEntriesQuery(),
                              mutate
                            )
                          }
                        >
                          Delete
                        </button>
                      </p>
                      <Show when={entry().recipe?.id}>
                        <p>
                          <span class="bg-slate-400 text-slate-50 px-2 py-1 rounded text-xs">
                            RECIPE
                          </span>
                        </p>
                      </Show>
                    </li>
                  )}
                </Index>
              </ul>
            </li>
          )}
        </Index>
      </ul>
    </>
  );
};

export default DiaryList;

function removeEntry(
  entry: DiaryEntry,
  entriesQuery: GetEntriesQueryResponse,
  mutate: Setter<GetEntriesQueryResponse>
) {
  mutate({
    ...entriesQuery,
    data: {
      ...entriesQuery.data,
      food_diary_diary_entry: (
        entriesQuery?.data?.food_diary_diary_entry || []
      ).filter((e) => e.id !== entry.id),
    },
  });
}
async function deleteEntry(
  accessToken: Accessor<string>,
  entry: DiaryEntry,
  entriesQuery: GetEntriesQueryResponse,
  mutate: Setter<GetEntriesQueryResponse>
) {
  try {
    removeEntry(entry, entriesQuery, mutate);
    const response = await deleteDiaryEntry(accessToken(), entry.id);
    if (!response.data) {
      mutate(entriesQuery);
    }
  } catch (e) {
    console.error("Failed to delete entry: ", e);
  }
}
