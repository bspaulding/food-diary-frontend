import type { Component } from "solid-js";
import { createResource, Index } from "solid-js";

import styles from "./App.module.css";
import { fetchEntries } from "./Api";

const App: Component = () => {
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
    <div class={styles.App}>
      <header class={styles.header}>
        <h1>Food Diary</h1>
      </header>
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
                        <small>{parseAndFormatTime(entry().consumed_at)}</small>
                      </p>
                      <p>
                        {entry().nutrition_item?.description ||
                          entry().recipe?.name}
                      </p>
                    </li>
                  )}
                </Index>
              </ul>
            </li>
          )}
        </Index>
      </ul>
    </div>
  );
};

export default App;

const timeFormat = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });
function parseAndFormatTime(timestamp: string): string {
  return timeFormat.format(new Date(timestamp));
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });
function parseAndFormatDay(timestamp: string): string {
  return dateFormat.format(new Date(timestamp));
}
