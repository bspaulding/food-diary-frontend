import type { Component } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import DiaryList from "./DiaryList";
import NewNutritionItemForm from "./NewNutritionItemForm";
import NutritionItemShow from "./NutritionItemShow";
import NewDiaryEntryForm from "./NewDiaryEntryForm";
import NewRecipeForm from "./NewRecipeForm";
import RecipeShow from "./RecipeShow";
import { useAuth } from "./Auth0";

const App: Component = () => {
  const [{ user, isAuthenticated, auth0 }] = useAuth();

  return (
    <div class="font-sans text-slate-800 flex flex-col bg-slate-50 relative px-4 pt-20">
      <header class="fixed top-0 left-0 right-0 h-16 flex px-4 justify-start items-center bg-slate-50">
        <h1 class="text-2xl font-bold">Food Diary</h1>
        <Show when={user()}>
          <img
            class="absolute right-2 w-12 h-12 border border-slate-800 rounded-full"
            src={user().picture}
          />
        </Show>
      </header>
      {isAuthenticated() ? (
        <Routes>
          <Route path="/" component={DiaryList} />
          <Route path="/diary_entry/new" component={NewDiaryEntryForm} />
          <Route path="/nutrition_item/new" component={NewNutritionItemForm} />
          <Route path="/nutrition_item/:id" component={NutritionItemShow} />
          <Route path="/nutrition_item/:id" component={NutritionItemShow} />
          <Route path="/recipe/new" component={NewRecipeForm} />
          <Route path="/recipe/:id" component={RecipeShow} />
        </Routes>
      ) : (
        <button onClick={() => auth0()?.loginWithRedirect()}>Log In</button>
      )}
    </div>
  );
};

export default App;
