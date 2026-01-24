import type { Component } from "solid-js";
import { Index } from "solid-js";
import { parseISO, format } from "date-fns";
import { LoggableItem } from "./NewDiaryEntryForm";
import type { SearchNutritionItem, SearchRecipe } from "./Api";

type SuggestionItem = {
  consumed_at: string;
  nutrition_item?: SearchNutritionItem | null;
  recipe?: SearchRecipe | null;
};

type Props = {
  items: SuggestionItem[];
};

const SuggestionsList: Component<Props> = ({ items }) => {
  return (
    <ul class="mb-4">
      <Index each={items}>
        {(item) => (
          <li>
            <LoggableItem
              recipe={item().recipe}
              nutritionItem={item().nutrition_item}
            />
            <p class="text-xs ml-8 mb-2">
              Logged at{" "}
              {format(parseISO(item().consumed_at), "hh:mma' on ' MMMM dd, yyyy")}
            </p>
          </li>
        )}
      </Index>
    </ul>
  );
};

export default SuggestionsList;
