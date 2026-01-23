type Accessors<T> = {
  [P in keyof T]: () => T[P];
};

export function accessorsToObject<T>(accessors: Accessors<T>): T {
  return Object.entries(accessors).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: (v as any)(),
    }),
    {} as T,
  );
}

const timeFormat = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });
export function parseAndFormatTime(timestamp: string): string {
  return timeFormat.format(new Date(timestamp));
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });
export function parseAndFormatDay(timestamp: string): string {
  return dateFormat.format(new Date(timestamp));
}

export const pluralize = (n: number, singular: string, plural: string) =>
  `${n} ${n === 1 ? singular : plural}`;
