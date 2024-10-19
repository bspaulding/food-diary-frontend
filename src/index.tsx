/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import App from "./App";
import DiaryList from "./DiaryList";
import NewNutritionItemForm from "./NewNutritionItemForm";
import NutritionItemShow from "./NutritionItemShow";
import NutritionItemEdit from "./NutritionItemEdit";
import NewDiaryEntryForm from "./NewDiaryEntryForm";
import NewRecipeForm from "./NewRecipeForm";
import RecipeShow from "./RecipeShow";
import RecipeEdit from "./RecipeEdit";
import ImportDiaryEntries from "./ImportDiaryEntries";
import UserProfile from "./UserProfile";
import DiaryEntryEditForm from "./DiaryEntryEditForm";

render(
  () => (
    <Router root={App}>
      <Route path="/auth/callback" />
      <Route path="/auth/logout" />
      <Route path="/" component={DiaryList} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/diary_entry/new" component={NewDiaryEntryForm} />
      <Route path="/diary_entry/:id/edit" component={DiaryEntryEditForm} />
      <Route path="/diary_entry/import" component={ImportDiaryEntries} />
      <Route path="/nutrition_item/new" component={NewNutritionItemForm} />
      <Route path="/nutrition_item/:id" component={NutritionItemShow} />
      <Route path="/nutrition_item/:id/edit" component={NutritionItemEdit} />
      <Route path="/recipe/new" component={NewRecipeForm} />
      <Route path="/recipe/:id" component={RecipeShow} />
      <Route path="/recipe/:id/edit" component={RecipeEdit} />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
