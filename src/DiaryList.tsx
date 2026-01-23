import type { Accessor, Component, Setter } from "solid-js";
import { Index, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import type { DiaryEntry, GetEntriesQueryResponse } from "./Api";
import { fetchEntries, deleteDiaryEntry, MAX_ENTRIES_PER_REQUEST } from "./Api";
import { useAuth } from "./Auth0";
import { parseAndFormatTime, parseAndFormatDay, pluralize } from "./Util";
import DateBadge from "./DateBadge";
import ButtonLink from "./ButtonLink";
import {
  parseISO,
  format,
  formatISO,
  startOfDay,
  compareAsc,
  compareDesc,
} from "date-fns";

function localDay(timestamp: string) {
  return formatISO(startOfDay(parseISO(timestamp)));
}

function compareEntriesByConsumedAt(a, b) {
  return compareAsc(parseISO(a.consumed_at), parseISO(b.consumed_at));
}

function recipeTotalForKey(key, recipe) {
  return (recipe?.recipe_items || []).reduce(
    (acc, recipe_item) =>
      acc + recipe_item.servings * recipe_item.nutrition_item[key],
    0
  );
}

function entryTotalMacro(key, entry) {
  const itemTotal = entry.nutrition_item?.[key] || 0;
  return entry.servings * (itemTotal + recipeTotalForKey(key, entry.recipe));
}

function totalMacro(key, entries) {
  return parseInt(
    entries.reduce(
      (acc: number, entry) => acc + entryTotalMacro(key, entry),
      0
    ),
    10
  );
}

const EntryMacro: Component<{
  value: string;
  unit?: string;
  label: string;
}> = ({ value, unit, label }) => (
  <div class="text-center text-xl mt-4">
    <p>
      {value}
      {unit}
    </p>
    <p class="text-sm uppercase">{label}</p>
  </div>
);

const DAYS_PER_PAGE = 7;

const DiaryList: Component = () => {
  const [{ accessToken }] = useAuth();
  const [entries, setEntries] = createSignal<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [hasMore, setHasMore] = createSignal(true);
  const [initialLoadComplete, setInitialLoadComplete] = createSignal(false);
  let sentinelRef: HTMLDivElement | undefined;

  const entriesByDay = () =>
    Object.entries(
      entries().reduce(
        (acc, entry) => ({
          ...acc,
          [localDay(entry.consumed_at)]: [
            ...(acc[localDay(entry.consumed_at)] || []),
            entry,
          ],
        }),
        {}
      )
    ).sort(function (a, b) {
      return compareDesc(parseISO(a[0]), parseISO(b[0]));
    });

  const loadMoreEntries = async () => {
    if (isLoading() || !hasMore() || !accessToken()) return;

    setIsLoading(true);
    try {
      const currentEntries = entries();
      
      // Use the exact consumed_at timestamp of the last entry as cursor
      const cursorDate = currentEntries.length > 0
        ? currentEntries[currentEntries.length - 1].consumed_at
        : null;
      
      const options = cursorDate
        ? { cursorConsumedAt: cursorDate }
        : {};

      const response = await fetchEntries(accessToken(), options);
      const newEntries = response?.data?.food_diary_diary_entry || [];

      // Check if we've reached the end (no new entries)
      if (newEntries.length === 0) {
        setHasMore(false);
      } else {
        // Pre-calculate localDay for each entry to avoid redundant parsing
        const entriesWithDay = newEntries.map(entry => ({
          entry,
          day: localDay(entry.consumed_at)
        }));
        
        // Get unique days - already in descending order since API sorts by consumed_at desc
        const uniqueDays = Array.from(new Set(entriesWithDay.map(e => e.day)));
        
        // Take only entries from the first DAYS_PER_PAGE days
        const daysToInclude = new Set(uniqueDays.slice(0, DAYS_PER_PAGE));
        const filteredEntries = entriesWithDay
          .filter(e => daysToInclude.has(e.day))
          .map(e => e.entry);
        
        if (filteredEntries.length > 0) {
          setEntries([...currentEntries, ...filteredEntries]);
        }
        
        // We've reached the end if we got fewer entries than the max fetch limit
        // (not when we got fewer days, since there could be more days beyond what we loaded)
        if (newEntries.length < MAX_ENTRIES_PER_REQUEST) {
          setHasMore(false);
        }
      }

      if (!initialLoadComplete()) {
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  onMount(() => {
    loadMoreEntries();
  });

  // Set up intersection observer for infinite scroll
  createEffect(() => {
    if (!sentinelRef || !initialLoadComplete()) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0].isIntersecting && hasMore() && !isLoading()) {
          loadMoreEntries();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef);

    onCleanup(() => observer.disconnect());
  });

  const handleDeleteEntry = async (entry: DiaryEntry) => {
    const originalEntries = entries();
    try {
      // Optimistically remove from UI
      setEntries(originalEntries.filter((e) => e.id !== entry.id));
      
      const response = await deleteDiaryEntry(accessToken(), entry.id);
      if (!response.data) {
        // Revert optimistic update if deletion failed
        setEntries(originalEntries);
        console.error("Failed to delete entry: no data in response");
      }
    } catch (e) {
      // Revert optimistic update on error
      setEntries(originalEntries);
      console.error("Failed to delete entry: ", e);
    }
  };

  return (
    <>
      <div class="flex space-x-4 mb-4">
        <ButtonLink href="/diary_entry/new">Add New Entry</ButtonLink>
        <ButtonLink href="/nutrition_item/new">Add Item</ButtonLink>
        <ButtonLink href="/recipe/new">Add Recipe</ButtonLink>
      </div>
      <ul class="mt-4">
        <Show when={initialLoadComplete() && entries().length === 0}>
          <p class="text-slate-400 text-center">No entries, yet...</p>
        </Show>
        <Index each={entriesByDay()}>
          {(dayEntries, i) => (
            <li class="grid grid-cols-6 -ml-4 mb-6">
              <div>
                <DateBadge
                  class="col-span-1"
                  date={parseISO(dayEntries()[0])}
                />
                <EntryMacro
                  value={Math.ceil(
                    dayEntries()[1].reduce(
                      (acc, entry) => acc + entry.calories,
                      0
                    )
                  )}
                  unit=""
                  label="KCAL"
                />
              </div>
              <ul class="col-span-5 mb-6">
                <li class="mb-4">
                  <div class="flex flex-row justify-around">
                    <EntryMacro
                      value={totalMacro("added_sugars_grams", dayEntries()[1])}
                      unit="g"
                      label="Added Sugar"
                    />
                    <EntryMacro
                      value={totalMacro("protein_grams", dayEntries()[1])}
                      unit="g"
                      label="Protein"
                    />
                    <EntryMacro
                      value={totalMacro("total_fat_grams", dayEntries()[1])}
                      unit="g"
                      label="Total Fat"
                    />
                  </div>
                </li>
                <Index each={dayEntries()[1].sort(compareEntriesByConsumedAt)}>
                  {(entry, i) => (
                    <li class="mb-4">
                      <p class="font-semibold">
                        {entry().calories} kcal,{" "}
                        {entryTotalMacro("protein_grams", entry())}g protein
                      </p>
                      <p>
                        <a
                          href={
                            entry().recipe?.id
                              ? `/recipe/${entry().recipe?.id}`
                              : `/nutrition_item/${entry().nutrition_item?.id}`
                          }
                        >
                          {entry().nutrition_item?.description ||
                            entry().recipe?.name}
                        </a>
                      </p>
                      <p class="flex justify-between text-sm">
                        {pluralize(entry().servings, "serving", "servings")} at{" "}
                        {parseAndFormatTime(entry().consumed_at)}
                        <span>
                          <a href={`/diary_entry/${entry().id}/edit`}>Edit</a>
                          <button
                            class="ml-2"
                            onClick={() => handleDeleteEntry(entry())}
                          >
                            Delete
                          </button>
                        </span>
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
        <Show when={isLoading()}>
          <div class="text-center py-4 text-slate-400">Loading more entries...</div>
        </Show>
        <div ref={sentinelRef} class="h-4" />
      </ul>
    </>
  );
};

export default DiaryList;
