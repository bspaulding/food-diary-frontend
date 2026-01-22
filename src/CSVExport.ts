import { parseISO, format, formatISO } from "date-fns";

const header = [
  "Date",
  "Time",
  "Consumed At",
  "Description",
  "Servings",
  "Calories",
  "Total Fat (g)",
  "Saturated Fat (g)",
  "Trans Fat (g)",
  "Polyunsaturated Fat (g)",
  "Monounsaturated Fat (g)",
  "Cholesterol (mg)",
  "Sodium (mg)",
  "Total Carbohydrate (g)",
  "Dietary Fiber (g)",
  "Total Sugars (g)",
  "Added Sugars (g)",
  "Protein (g)",
];

const DESCRIPTION_COLUMN_INDEX = header.indexOf("Description");

const headerKeyMap: Record<string, string[]> = {
  "Consumed At": ["consumed_at"],
  Description: ["nutrition_item", "description"],
  Servings: ["servings"],
  Calories: ["nutrition_item", "calories"],
  "Total Fat (g)": ["nutrition_item", "total_fat_grams"],
  "Saturated Fat (g)": ["nutrition_item", "saturated_fat_grams"],
  "Trans Fat (g)": ["nutrition_item", "trans_fat_grams"],
  "Polyunsaturated Fat (g)": ["nutrition_item", "polyunsaturated_fat_grams"],
  "Monounsaturated Fat (g)": ["nutrition_item", "monounsaturated_fat_grams"],
  "Cholesterol (mg)": ["nutrition_item", "cholesterol_milligrams"],
  "Sodium (mg)": ["nutrition_item", "sodium_milligrams"],
  "Total Carbohydrate (g)": ["nutrition_item", "total_carbohydrate_grams"],
  "Dietary Fiber (g)": ["nutrition_item", "dietary_fiber_grams"],
  "Total Sugars (g)": ["nutrition_item", "total_sugars_grams"],
  "Added Sugars (g)": ["nutrition_item", "added_sugars_grams"],
  "Protein (g)": ["nutrition_item", "protein_grams"],
};

export function entriesToCsv(entries: any[]): string {
  return stringsToCsv([
    header,
    ...entries.flatMap((entry: any) => {
      if (entry.nutrition_item) {
        return [
          header.map((key) => {
            const consumedAt = parseISO(
              getPath(headerKeyMap["Consumed At"], entry)
            );
            switch (key) {
              case "Date":
                return format(consumedAt, "yyyy-MM-dd");
              case "Time":
                return format(consumedAt, "p");
              case "Consumed At":
                return formatISO(consumedAt);
              default:
                return getPath(headerKeyMap[key], entry);
            }
          }),
        ];
      } else {
        return entry.recipe.recipe_items.map((recipe_item: any) => {
          return header.map((key) => {
            const consumedAt = parseISO(
              getPath(headerKeyMap["Consumed At"], entry)
            );
            switch (key) {
              case "Date":
                return format(consumedAt, "yyyy-MM-dd");
              case "Time":
                return format(consumedAt, "p");
              case "Consumed At":
                return formatISO(consumedAt);
              case "Servings":
                return entry.servings * recipe_item.servings;
              case "Description":
                const itemName = getPath(headerKeyMap[key], recipe_item);
                return `${entry.recipe.name} - ${itemName}`;
              default:
                return getPath(headerKeyMap[key], recipe_item);
            }
          });
        });
      }
    }),
  ]);
}

function stringsToCsv(rows: string[][]): string {
  return rows
    .map((row, rowIndex) => {
      return row
        .map((cell, cellIndex) => {
          // Quote the Description field in data rows (not in header row)
          if (rowIndex > 0 && cellIndex === DESCRIPTION_COLUMN_INDEX) {
            // Escape double quotes by doubling them (CSV RFC 4180)
            const escapedCell = String(cell).replace(/"/g, '""');
            return `"${escapedCell}"`;
          }
          return `${cell}`;
        })
        .join(",");
    })
    .join("\n")
    .trim();
}

function getPath(path: string[], x: any): any {
  return path.reduce((x: any, k) => x[k], x);
}
