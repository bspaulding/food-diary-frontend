import type { Accessor, Component, Setter } from "solid-js";
import { Index, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import type {
  DiaryEntry,
  GetEntriesQueryResponse,
  MacroKey,
  RecipeWithItems,
} from "./Api";
import { fetchEntries, deleteDiaryEntry, fetchWeeklyStats, MAX_ENTRIES_PER_REQUEST } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
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
  startOfWeek,
  subWeeks,
} from "date-fns";
import {
  calculateCurrentWeekDays,
  calculateFourWeeksDays,
  calculateDailyAverage,
} from "./WeeklyStatsCalculations";

function localDay(timestamp: string) {
  return formatISO(startOfDay(parseISO(timestamp)));
}

function compareEntriesByConsumedAt(a: DiaryEntry, b: DiaryEntry) {
  return compareAsc(parseISO(a.consumed_at), parseISO(b.consumed_at));
}

function recipeTotalForKey(
  key: MacroKey,
  recipe: RecipeWithItems | undefined,
): number {
  if (!recipe) return 0;
  return (recipe.recipe_items || []).reduce(
    (acc: number, recipe_item) =>
      acc + recipe_item.servings * recipe_item.nutrition_item[key],
    0,
  );
}

function entryTotalMacro(key: MacroKey, entry: DiaryEntry): number {
  const itemTotal = entry.nutrition_item?.[key] || 0;
  return entry.servings * (itemTotal + recipeTotalForKey(key, entry.recipe));
}

function totalMacro(key: MacroKey, entries: DiaryEntry[]): number {
  return entries.reduce(
    (acc: number, entry: DiaryEntry) => acc + entryTotalMacro(key, entry),
    0,
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

  // Fetch weekly stats from the backend
  const now = new Date();
  const todayStart = formatISO(startOfDay(now));
  const currentWeekStart = formatISO(startOfWeek(now, { weekStartsOn: 0 }));
  const fourWeeksAgoStart = formatISO(startOfDay(subWeeks(now, 4)));

  const [weeklyStatsQuery] = createAuthorizedResource((token: string) =>
    fetchWeeklyStats(token, currentWeekStart, todayStart, fourWeeksAgoStart),
  );

  // Calculate number of complete days (up to but not including today)
  const currentWeekDays = calculateCurrentWeekDays(now);
  const fourWeeksDays = calculateFourWeeksDays(now);

  const entriesByDay = (): [string, DiaryEntry[]][] => {
    const grouped = entries().reduce(
      (acc: Record<string, DiaryEntry[]>, entry: DiaryEntry) => ({
        ...acc,
        [localDay(entry.consumed_at)]: [
          ...(acc[localDay(entry.consumed_at)] || []),
          entry,
        ],
      }),
      {},
    );
    return (Object.entries(grouped) as [string, DiaryEntry[]][]).sort(
      function (a, b) {
        return compareDesc(parseISO(a[0]), parseISO(b[0]));
      },
    );
  };

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

      // We've reached the end if we got no entries or fewer than the max fetch limit
      if (newEntries.length === 0) {
        setHasMore(false);
      } else if (newEntries.length < MAX_ENTRIES_PER_REQUEST) {
        setHasMore(false);
      }
      
      if (newEntries.length > 0) {
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
      <Show when={weeklyStatsQuery()?.data}>
        <div class="flex justify-around mb-6 border-t border-b border-slate-200 py-2">
          <EntryMacro
            value={String(
              calculateDailyAverage(
                weeklyStatsQuery()?.data?.current_week?.aggregate?.sum
                  ?.calories || 0,
                currentWeekDays,
              ),
            )}
            unit=" kcal/day"
            label="This Week"
          />
          <EntryMacro
            value={String(
              calculateDailyAverage(
                weeklyStatsQuery()?.data?.past_four_weeks?.aggregate?.sum
                  ?.calories || 0,
                fourWeeksDays,
              ),
            )}
            unit=" kcal/day"
            label="4 Week Avg"
          />
          <div class="text-center mb-4">
            <a
              href="/trends"
              class="text-indigo-600 hover:text-indigo-800 underline"
            >
              View Trends
            </a>
          </div>
        </div>
      </Show>
      <ul class="mt-4">
        <Show when={initialLoadComplete() && entries().length === 0}>
          <p class="text-slate-400 text-center">No entries, yet...</p>
        </Show>
        <Index each={entriesByDay()}>
          {(dayEntries, i) => {
            const [dateStr, entries] = dayEntries();
            return (
              <li class="grid grid-cols-6 -ml-4 mb-6">
                <div>
                  <DateBadge class="col-span-1" date={parseISO(dateStr)} />
                  <EntryMacro
                    value={String(
                      Math.ceil(
                        entries.reduce(
                          (acc: number, entry: DiaryEntry) =>
                            acc + entry.calories,
                          0,
                        ),
                      ),
                    )}
                    unit=""
                    label="KCAL"
                  />
                </div>
                <ul class="col-span-5 mb-6">
                  <li class="mb-4">
                    <div class="flex flex-row justify-around">
                      <EntryMacro
                        value={String(
                          totalMacro("added_sugars_grams", entries),
                        )}
                        unit="g"
                        label="Added Sugar"
                      />
                      <EntryMacro
                        value={String(totalMacro("protein_grams", entries))}
                        unit="g"
                        label="Protein"
                      />
                      <EntryMacro
                        value={String(totalMacro("total_fat_grams", entries))}
                        unit="g"
                        label="Total Fat"
                      />
                    </div>
                  </li>
                  <Index each={entries.sort(compareEntriesByConsumedAt)}>
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
                                : `/nutrition_item/${
                                    entry().nutrition_item?.id
                                  }`
                            }
                          >
                            {entry().nutrition_item?.description ||
                              entry().recipe?.name}
                          </a>
                        </p>
                        <p class="flex justify-between text-sm">
                          {pluralize(entry().servings, "serving", "servings")}{" "}
                          at {parseAndFormatTime(entry().consumed_at)}
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
            );
          }}
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
