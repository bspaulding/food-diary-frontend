const timeFormat = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });

export function parseAndFormatTimeImpl (timestamp) {
  return function() {
    return timeFormat.format(new Date(timestamp));
  };
};

export function parseAndFormatDayImpl (timestamp) {
  return function() {
    return dateFormat.format(new Date(timestamp));
  };
};

