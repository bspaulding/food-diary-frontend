type Accessors<T> = {
  [P in keyof T]: () => T[P];
};

export function accessorsToObject<T>(accessors: Accessors<T>): T {
  return Object.entries(accessors).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: v(),
    }),
    {}
  );
}
