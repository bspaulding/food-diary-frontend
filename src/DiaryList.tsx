import type { Component } from "solid-js";
import { createSignal, createResource, Index } from "solid-js";
import { Link } from "@solidjs/router";
import { fetchEntries, deleteDiaryEntry } from "./Api";

function removeEntry(entry, entriesQuery, mutate) {
  const newQuery = {
    ...entriesQuery,
    data: {
      ...entriesQuery.data,
      food_diary_diary_entry: (
        entriesQuery?.data?.food_diary_diary_entry || []
      ).filter((e) => e.id !== entry.id),
    },
  };
  mutate(newQuery);
}
async function deleteEntry(entry, entriesQuery, mutate) {
  try {
    removeEntry(entry, entriesQuery, mutate);
    const response = await deleteDiaryEntry(entry.id);
    if (!response.data) {
      mutate(entriesQuery);
    }
  } catch (e) {
    console.error("Failed to delete entry: ", e);
  }
}

const DiaryList: Component = () => {
  const [getEntriesQuery, { mutate }] = createResource(fetchEntries);
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
                            deleteEntry(entry(), getEntriesQuery(), mutate)
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

const timeFormat = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });
function parseAndFormatTime(timestamp: string): string {
  return timeFormat.format(new Date(timestamp));
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });
function parseAndFormatDay(timestamp: string): string {
  return dateFormat.format(new Date(timestamp));
}

const pluralize = (n, singular, plural) =>
  `${n} ${n === 1 ? singular : plural}`;
