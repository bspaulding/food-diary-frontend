import type { Component } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import styles from "./App.module.css";
import DiaryList from "./DiaryList";
import NewNutritionItemForm from "./NewNutritionItemForm";
import NutritionItemShow from "./NutritionItemShow";
import NewDiaryEntryForm from "./NewDiaryEntryForm";
import NewRecipeForm from "./NewRecipeForm";

const App: Component = () => (
  <div class={styles.App}>
    <header class={styles.header}>
      <h1>Food Diary</h1>
    </header>
    <Routes>
      <Route path="/" component={DiaryList} />
      <Route path="/diary_entry/new" component={NewDiaryEntryForm} />
      <Route path="/nutrition_item/new" component={NewNutritionItemForm} />
      <Route path="/nutrition_item/:id" component={NutritionItemShow} />
      <Route path="/recipe/new" component={NewRecipeForm} />
    </Routes>
  </div>
);

export default App;
