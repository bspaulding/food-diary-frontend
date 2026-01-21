import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import { fetchEntries } from "./Api";
import createAuthorizedResource from "./createAuthorizedResource";
import { parseISO, startOfWeek, format } from "date-fns";
import ButtonLink from "./ButtonLink";

type WeeklyStats = {
  weekStart: string;
  avgCalories: number;
  avgProtein: number;
  avgAddedSugar: number;
};

function recipeTotalForKey(key: string, recipe: any) {
  return (recipe?.recipe_items || []).reduce(
    (acc: number, recipe_item: any) =>
      acc + recipe_item.servings * recipe_item.nutrition_item[key],
    0
  );
}

function entryTotalMacro(key: string, entry: any) {
  const itemTotal = entry.nutrition_item?.[key] || 0;
  return entry.servings * (itemTotal + recipeTotalForKey(key, entry.recipe));
}

const Trends: Component = () => {
  const [getEntriesQuery] = createAuthorizedResource(fetchEntries);
  const entries = () => getEntriesQuery()?.data?.food_diary_diary_entry || [];

  const weeklyStats = createMemo<WeeklyStats[]>(() => {
    const entriesList = entries();
    if (entriesList.length === 0) return [];

    // Group entries by week
    const weekGroups = new Map<string, any[]>();
    entriesList.forEach((entry) => {
      const weekStart = format(
        startOfWeek(parseISO(entry.consumed_at), { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      );
      if (!weekGroups.has(weekStart)) {
        weekGroups.set(weekStart, []);
      }
      weekGroups.get(weekStart)!.push(entry);
    });

    // Calculate weekly averages
    const stats: WeeklyStats[] = [];
    weekGroups.forEach((weekEntries, weekStart) => {
      const totalCalories = weekEntries.reduce(
        (sum, entry) => sum + entry.calories,
        0
      );
      const totalProtein = weekEntries.reduce(
        (sum, entry) => sum + entryTotalMacro("protein_grams", entry),
        0
      );
      const totalAddedSugar = weekEntries.reduce(
        (sum, entry) => sum + entryTotalMacro("added_sugars_grams", entry),
        0
      );

      const daysInWeek = new Set(
        weekEntries.map((e) => format(parseISO(e.consumed_at), "yyyy-MM-dd"))
      ).size;

      stats.push({
        weekStart,
        avgCalories: Math.round(totalCalories / daysInWeek),
        avgProtein: Math.round(totalProtein / daysInWeek),
        avgAddedSugar: Math.round(totalAddedSugar / daysInWeek),
      });
    });

    // Sort by week (oldest first for chart)
    return stats.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  });

  const maxCalories = createMemo(() =>
    Math.max(...weeklyStats().map((s) => s.avgCalories), 1)
  );
  const maxProtein = createMemo(() =>
    Math.max(...weeklyStats().map((s) => s.avgProtein), 1)
  );
  const maxAddedSugar = createMemo(() =>
    Math.max(...weeklyStats().map((s) => s.avgAddedSugar), 1)
  );

  const LineChart: Component<{
    data: number[];
    max: number;
    color: string;
    label: string;
  }> = (props) => {
    const points = createMemo(() => {
      const width = props.data.length * 80; // 80px per week
      const height = 200;
      const padding = 20;

      return props.data
        .map((value, index) => {
          const x = padding + (index * (width - 2 * padding)) / (props.data.length - 1 || 1);
          const y = height - padding - ((value / props.max) * (height - 2 * padding));
          return `${x},${y}`;
        })
        .join(" ");
    });

    const width = () => props.data.length * 80;

    return (
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">{props.label}</h3>
        <div class="overflow-x-auto">
          <svg
            width={width()}
            height="200"
            class="border border-gray-300 rounded"
          >
            {/* Grid lines */}
            <line
              x1="20"
              y1="180"
              x2={width() - 20}
              y2="180"
              stroke="#e5e7eb"
              stroke-width="1"
            />
            <line
              x1="20"
              y1="100"
              x2={width() - 20}
              y2="100"
              stroke="#e5e7eb"
              stroke-width="1"
            />
            <line
              x1="20"
              y1="20"
              x2={width() - 20}
              y2="20"
              stroke="#e5e7eb"
              stroke-width="1"
            />

            {/* Data line */}
            <polyline
              points={points()}
              fill="none"
              stroke={props.color}
              stroke-width="2"
            />

            {/* Data points */}
            {props.data.map((value, index) => {
              const x = 20 + (index * (width() - 40)) / (props.data.length - 1 || 1);
              const y = 180 - ((value / props.max) * 160);
              return (
                <g>
                  <circle cx={x} cy={y} r="4" fill={props.color} />
                  <text
                    x={x}
                    y={y - 10}
                    text-anchor="middle"
                    font-size="12"
                    fill="#374151"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Week labels */}
            {weeklyStats().map((stat, index) => {
              const x = 20 + (index * (width() - 40)) / (weeklyStats().length - 1 || 1);
              return (
                <text
                  x={x}
                  y="195"
                  text-anchor="middle"
                  font-size="10"
                  fill="#6b7280"
                >
                  {format(parseISO(stat.weekStart), "MM/dd")}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Weekly Nutrition Trends</h1>
        <ButtonLink href="/">Back to Diary</ButtonLink>
      </div>

      {weeklyStats().length === 0 ? (
        <p class="text-slate-400 text-center">
          No data available yet. Add some diary entries to see trends!
        </p>
      ) : (
        <>
          <LineChart
            data={weeklyStats().map((s) => s.avgCalories)}
            max={maxCalories()}
            color="#3b82f6"
            label="Average Daily Calories (per week)"
          />
          <LineChart
            data={weeklyStats().map((s) => s.avgProtein)}
            max={maxProtein()}
            color="#10b981"
            label="Average Daily Protein (g per week)"
          />
          <LineChart
            data={weeklyStats().map((s) => s.avgAddedSugar)}
            max={maxAddedSugar()}
            color="#ef4444"
            label="Average Daily Added Sugar (g per week)"
          />
        </>
      )}
    </div>
  );
};

export default Trends;
