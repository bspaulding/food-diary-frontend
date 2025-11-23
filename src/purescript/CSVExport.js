import { parseISO, format, formatISO } from "date-fns";

export function parseISOImpl(dateStr) {
  try {
    const date = parseISO(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.getTime();
  } catch (e) {
    return null;
  }
}

export function formatDateImpl(formatStr, timestamp) {
  try {
    const date = new Date(timestamp);
    return format(date, formatStr);
  } catch (e) {
    return "Invalid Date";
  }
}

export function formatTimeImpl(timestamp) {
  try {
    const date = new Date(timestamp);
    return format(date, "p");
  } catch (e) {
    return "Invalid Time";
  }
}

export function formatISOImpl(timestamp) {
  try {
    const date = new Date(timestamp);
    return formatISO(date);
  } catch (e) {
    return "Invalid Date";
  }
}
