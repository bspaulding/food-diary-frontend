import type { Component } from "solid-js";
import { useAuth } from "./Auth0";
import { fetchExportEntries } from "./Api";
import { entriesToCsv, EntryRecord } from "./CSVExport";

type Auth0User = {
  picture?: string;
  nickname?: string;
  name?: string;
  email?: string;
};

const UserProfile: Component = () => {
  const [{ user, isAuthenticated, auth0, accessToken }] = useAuth();
  const userObj = (): Auth0User => (user() ?? {}) as Auth0User;
  return (
    <div class="flex flex-col items-center">
      <img
        src={userObj()?.picture}
        class="border border-slate-800 rounded-full mb-4 max-w-xs"
      />
      <p class="font-semibold text-lg">
        {userObj()?.nickname || userObj()?.name}
      </p>
      <p class="text-lg">{userObj()?.email}</p>
      <div class="mt-4 flex flex-col items-center">
        <a class="ml-3" href="/diary_entry/import">
          Import Entries
        </a>
        <button
          onClick={async (): Promise<void> => {
            const responseData: {
              data: { food_diary_diary_entry: EntryRecord[] };
            } = await fetchExportEntries(accessToken());
            const data: string = entriesToCsv(
              responseData.data.food_diary_diary_entry,
            );
            const blob: Blob = new Blob([data], { type: "text/csv" });
            const url: string = URL.createObjectURL(blob);

            const a: HTMLAnchorElement = document.createElement("a");
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
        onClick={(): void => {
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
