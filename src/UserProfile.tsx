import type { Component } from "solid-js";
import { useAuth } from "./Auth0";

const UserProfile: Component = () => {
  const [{ user, isAuthenticated, auth0 }] = useAuth();
  return (
    <div class="flex flex-col items-center">
      <img
        src={user()?.picture}
        class="border border-slate-800 rounded-full mb-4 max-w-xs"
      />
      <p class="font-semibold text-lg">{user()?.nickname || user()?.name}</p>
      <button
        class="text-red-600"
        onClick={() => {
          auth0()?.logout({
            returnTo: `${window.location.protocol}//${window.location.host}/auth/logout`,
          });
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
