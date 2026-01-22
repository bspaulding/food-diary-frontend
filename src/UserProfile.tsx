import type { Component } from "solid-js";
import { useAuth } from "./Auth0";
import { fetchExportEntries } from "./Api";
import { entriesToCsv } from "./CSVExport";

const UserProfile: Component = () => {
  const [{ user, isAuthenticated, auth0, accessToken }] = useAuth();
  return (
    <div class="flex flex-col items-center">
      <img
        src={(user() as any)?.picture}
        class="border border-slate-800 rounded-full mb-4 max-w-xs"
      />
      <p class="font-semibold text-lg">{(user() as any)?.nickname || (user() as any)?.name}</p>
      <p class="text-lg">{(user() as any)?.email}</p>
      <div class="mt-4 flex flex-col items-center">
        <a class="ml-3" href="/diary_entry/import">
          Import Entries
        </a>
        <button
          onClick={async () => {
            const responseData = await fetchExportEntries(accessToken());
            const data = entriesToCsv(responseData.data.food_diary_diary_entry);
            const blob = new Blob([data], { type: "text/csv" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "food-diary-entries.csv";
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
