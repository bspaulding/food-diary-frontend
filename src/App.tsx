import type { Component, ParentProps } from "solid-js";
import { Show } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { useAuth } from "./Auth0";

const App: Component<ParentProps> = (props) => {
  const [{ user, isAuthenticated, auth0 }] = useAuth();

  return (
    <div class="font-sans text-slate-800 flex flex-col bg-slate-50 relative px-4 pt-20">
      <header class="fixed top-0 left-0 right-0 h-16 flex px-4 justify-start items-center bg-slate-50">
        <h1 class="text-2xl font-bold">Food Diary</h1>
        <Show when={user()}>
          <div class="absolute right-2 w-12 h-12 ">
            <a href="/profile">
              <img
                src={(user() as any)?.picture}
                class="border border-slate-800 rounded-full"
              />
            </a>
          </div>
        </Show>
      </header>
      <Show
        when={isAuthenticated()}
        keyed
        fallback={
          <button onClick={() => auth0()?.loginWithRedirect()}>Log In</button>
        }
      >
        {props.children}
      </Show>
    </div>
  );
};

export default App;
