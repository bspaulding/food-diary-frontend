import { parseISO, formatISO } from "date-fns";

export function parseISOImpl (dateStr) {
  return function() {
    try {
      const date = parseISO(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.getTime();
    } catch (e) {
      return null;
    }
  };
};

export function formatISOImpl (timestamp) {
  return function() {
    try {
      const date = new Date(timestamp);
      return formatISO(date);
    } catch (e) {
      return "Invalid Date";
    }
  };
};

