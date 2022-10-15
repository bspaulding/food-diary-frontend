import type { Component } from "solid-js";
import { useAuth } from "./Auth0";
import { fetchExportEntries } from "./Api";

const UserProfile: Component = () => {
  const [{ user, isAuthenticated, auth0, accessToken }] = useAuth();
  return (
    <div class="flex flex-col items-center">
      <img
        src={user()?.picture}
        class="border border-slate-800 rounded-full mb-4 max-w-xs"
      />
      <p class="font-semibold text-lg">{user()?.nickname || user()?.name}</p>
      <p class="text-lg">{user()?.email}</p>
      <div class="mt-4 flex flex-col items-center">
        <a class="ml-3" href="/diary_entry/import">
          Import Entries
        </a>
        <button
          onClick={async () => {
            const entries = await fetchExportEntries(accessToken());
            const data = JSON.stringify(entries);
            const blob = new Blob([data], { type: "text/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "food-diary-entries.json";
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();

            URL.revokeObjectURL(url);
            a.remove();
          }}
        >
          Export Entries As CSV
        </button>
      </div>
      <button
        class="text-red-600 mt-4"
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
