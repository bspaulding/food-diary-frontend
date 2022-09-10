import type { Component } from "solid-js";
import { createResource } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import styles from "./App.module.css";
import DiaryList from "./DiaryList";
import NewNutritionItemForm from "./NewNutritionItemForm";
import NutritionItemShow from "./NutritionItemShow";
import NewDiaryEntryForm from "./NewDiaryEntryForm";
import NewRecipeForm from "./NewRecipeForm";
import AuthCallback from "./AuthCallback";
import { useAuth } from "./Auth0";

const App: Component = () => {
  const [{ user, isAuthenticated, auth0 }] = useAuth();

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1>Food Diary</h1>
        <Show when={user()}>
          <img class={styles.Avatar} src={user().picture} />
          <p> {user().name || user().nickname} </p>
        </Show>
      </header>
      {isAuthenticated() ? (
        <Routes>
          <Route path="/" component={DiaryList} />
          <Route path="/diary_entry/new" component={NewDiaryEntryForm} />
          <Route path="/nutrition_item/new" component={NewNutritionItemForm} />
          <Route path="/nutrition_item/:id" component={NutritionItemShow} />
          <Route path="/recipe/new" component={NewRecipeForm} />
        </Routes>
      ) : (
        <button onClick={() => auth0()?.loginWithRedirect()}>Log In</button>
      )}
    </div>
  );
};

export default App;
