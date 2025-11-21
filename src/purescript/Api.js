const host = "/api/v1/graphql";

export function fetchQueryImpl(accessToken, query, variables) {
  return function() {
    return fetch(host, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables })
    })
    .then(response => response.json())
    .then(data => ({ success: true, data }))
    .catch(error => ({ success: false, error: error.message }));
  };
}

export function camelToSnakeCaseImpl(str) {
  return function() {
    return Array.from(str).reduce(
      (acc, c) => acc + (c === c.toUpperCase() && c !== c.toLowerCase() ? "_" + c.toLowerCase() : c),
      ""
    );
  };
}

export function objectToSnakeCaseKeysImpl(obj) {
  return function() {
    return Object.entries(obj).reduce(
      (acc, [k, v]) => {
        const snakeKey = Array.from(k).reduce(
          (keyAcc, c) => keyAcc + (c === c.toUpperCase() && c !== c.toLowerCase() ? "_" + c.toLowerCase() : c),
          ""
        );
        acc[snakeKey] = v;
        return acc;
      },
      {}
    );
  };
}

