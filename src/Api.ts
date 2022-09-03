const host = "https://direct-satyr-14.hasura.app/v1/graphql";
const adminSecret = import.meta.env.VITE_HASURA_ADMIN_SECRET;

const getEntriesQuery = `
query GetEntries {
    food_diary_diary_entry(order_by: { day: desc, consumed_at: asc }, limit: 10) {
        day
        consumed_at
        nutrition_item { description }
        recipe { name }
    }
}
`;

export async function fetchEntries() {
  const response = await fetch(`${host}`, {
    method: "POST",
    headers: {
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({ query: getEntriesQuery }),
  });
  return response.json();
}
