import type { Accessor, Component, Setter } from "solid-js";
import { Index } from "solid-js";
import { Link } from "@solidjs/router";
import type { DiaryEntry, GetEntriesQueryResponse } from "./Api";
import { fetchEntries, deleteDiaryEntry } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
import { useAuth } from "./Auth0";
import { parseAndFormatTime, parseAndFormatDay, pluralize } from "./Util";

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
      <p>
        <Link href="/diary_entry/new">New Entry</Link>
      </p>
      <ul style={{ "list-style-type": "none" }}>
        <Index each={entriesByDay()}>
          {(dayEntries, i) => (
            <li>
              <h2>{parseAndFormatDay(dayEntries()[0])}</h2>
              <ul>
                <Index each={dayEntries()[1]}>
                  {(entry, i) => (
                    <li>
                      <p>
                        {entry().nutrition_item?.description ||
                          entry().recipe?.name}
                      </p>
                      <p>
                        <small>
                          {pluralize(entry().servings, "serving", "servings")}{" "}
                          at {parseAndFormatTime(entry().consumed_at)}
                        </small>
                      </p>
                      <p>
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
