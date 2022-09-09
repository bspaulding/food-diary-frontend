import type { Component } from "solid-js";
import { createSignal, createResource, Index } from "solid-js";
import { Link } from "@solidjs/router";
import { fetchEntries } from "./Api";

const DiaryList: Component = () => {
  const [getEntriesQuery] = createResource(fetchEntries);
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
