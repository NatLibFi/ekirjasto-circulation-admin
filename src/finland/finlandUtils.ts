export interface IEvent {
  sort_title: string;
  sort_author: string;
  audience: string | null;
  collection_name: string;
  distributor: string | null;
  event_type: string;
  fiction: string;
  genres: string[] | null;
  identifier: string;
  identifier_type: string;
  imprint: string | null;
  language: string;
  library_name: string;
  library_short_name: string;
  location: string | null;
  medium: string | null;
  publisher: string | null;
  target_age: string;
  time: string;
  contributors: string[] | null;
  start: string;
  duration: string | null;
  date?: string;
}

export type EventKey = keyof IEvent;

export type KeyValuePair = { key: string; value: string };

export type NameValuePair = { name: string; value: string };

export const eventTypes = {
  circulation_manager_check_out: "circulation_manager_check_out",
  circulation_manager_check_in: "circulation_manager_check_in",
  circulation_manager_fulfill: "circulation_manager_fulfill",
  circulation_manager_hold_place: "circulation_manager_hold_place",
  circulation_manager_hold_release: "circulation_manager_hold_release",
  circulation_manager_new_patron: "circulation_manager_new_patron",
  distributor_check_out: "distributor_check_out",
  distributor_check_in: "distributor_check_in",
  distributor_hold_place: "distributor_hold_place",
  distributor_hold_release: "distributor_hold_release",
  distributor_license_add: "distributor_license_add",
  distributor_license_remove: "distributor_license_remove",
  distributor_availability_notify: "distributor_availability_notify",
  distributor_title_add: "distributor_title_add",
  distributor_title_remove: "distributor_title_remove",
  open_book: "open_book",
};

export const readableNames: Record<string, string> = {
  // Event types
  [eventTypes.circulation_manager_check_out]: "Lainaukset",
  [eventTypes.circulation_manager_check_in]: "Palautukset",
  [eventTypes.circulation_manager_fulfill]: "Toimitukset",
  [eventTypes.circulation_manager_hold_place]: "Varaukset, pyyntö",
  [eventTypes.circulation_manager_hold_release]: "Varaukset, nouto",
  [eventTypes.circulation_manager_new_patron]: "Uudet asiakkaat",
  [eventTypes.distributor_check_out]: "Lainaukset",
  [eventTypes.distributor_check_in]: "Palautukset",
  [eventTypes.distributor_hold_place]: "Varaukset, pyyntö",
  [eventTypes.distributor_hold_release]: "Varaukset, nouto",
  [eventTypes.distributor_license_add]: "Lisätyt lisenssit",
  [eventTypes.distributor_license_remove]: "Poistetut lisenssit",
  [eventTypes.distributor_availability_notify]:
    "distributor_availability_notify",
  [eventTypes.distributor_title_add]: "Lisätyt nimekkeet",
  [eventTypes.distributor_title_remove]: "Poistetut nimekkeet",
  [eventTypes.open_book]: "Kirjan avaukset",
  // Metadata fields
  sort_author: "Tekijä",
  distributor: "Jakelija",
  publisher: "Julkaisija",
  language: "Kieli",
  fiction: "Fiktio",
  genres: "Genre",
  audience: "Kohderyhmä",
  location: "Sijainti",
  duration: "Laina-aika (palautukset)",
  // Time intervals
  hour: "Tunti",
  day: "Päivä",
  month: "Kuukausi",
  // Loan duration options:
  under_2h: "Alle 2h",
  over_2h: "Yli 2h",
};

export const readable = (input: string): string =>
  readableNames[input] || input;

export const filterKeys = [
  "publisher",
  "language",
  "audience",
  "genres",
  "location",
  "duration",
];

export const intervals = ["hour", "day", "month"];
export type Interval = "hour" | "day" | "month";

export type Timeframe = "year" | "month" | "week" | "day";

export type TimeframeOption = {
  label: string;
  getDateRange: (offset?: number) => { firstDay: string; lastDay: string };
  getDateRangeLabel: (startDate: string) => string;
};

export const timeframeOptions: Record<Timeframe, TimeframeOption> = {
  year: {
    label: "vuosi",
    getDateRange: (offset) => getFirstAndLastDateOfYear(offset),
    getDateRangeLabel: (startDate) => startDate.split("-")[0],
  },
  month: {
    label: "kk",
    getDateRange: (offset) => getFirstAndLastDateOfMonth(offset),
    getDateRangeLabel: (startDate) => getLongMonthAndYear(new Date(startDate)),
  },
  week: {
    label: "vko",
    getDateRange: (offset) => getFirstAndLastDateOfWeek(offset),
    getDateRangeLabel: (startDate) =>
      `Viikko ${getWeekNumber(new Date(startDate))}, ${
        startDate.split("-")[0]
      }`,
  },
  day: {
    label: "pv",
    getDateRange: (offset) => {
      const date = getISODate(offset);
      return { firstDay: date, lastDay: date };
    },
    getDateRangeLabel: (startDate) =>
      getNumericDateWithYearAndWeekday(new Date(startDate)),
  },
};

const loanDurations = ["under_2h", "over_2h"];

export const loanDurationOptions = loanDurations.map((key) => ({
  value: key,
  name: readable(key),
}));

/*
 * General helper functions
 */

export function groupBy(collection: Record<string, any>[], groupKey: string) {
  return collection.reduce(
    (result: Record<string, Record<string, any>>, item) => {
      const value = item[groupKey];
      if (!value) return result;
      if (Array.isArray(value)) {
        value.forEach((val) => {
          result[val] ??= [];
          result[val].push(item);
        });
      } else {
        result[value] ??= [];
        result[value].push(item);
      }

      return result;
    },
    {}
  );
}

/*
 * Color generation
 */

export const getColor = (hueFactor: number, startHue = 140) =>
  `hsl(${40 * hueFactor + startHue}deg, 50%, 50%)`;

/*
 *  Helper functions for datetime presentations
 */

const millisecondsInDay = 24 * 60 * 60 * 1000;
const millisecondsInWeek = millisecondsInDay * 7;

// Converts a Unix timestamp to a tick label based on the specified time interval.
export function timeStampToTick(unixTime: number, interval: Interval) {
  const time = new Date(unixTime);

  switch (interval) {
    case "hour":
      return time.getHours();

    case "day":
      return getNumericDate(time);

    case "month":
      return getShortMonthAndYear(time);

    default:
      return unixTime;
  }
}

// Converts a Unix timestamp to a tooltip label based on the specified time interval.
export function timeStampToLabel(unixTime: number, interval: Interval) {
  const time = new Date(unixTime);

  switch (interval) {
    case "hour":
      return getNumericDateTime(time);

    case "day":
      return getNumericDateWithWeekday(time);

    case "month":
      return getShortMonthAndYear(time);

    default:
      return unixTime;
  }
}

// Time Formatter functions
export function getNumericDate(time: Date) {
  const options: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
  };

  return time.toLocaleDateString("fi-FI", options);
}

export function getNumericDateWithWeekday(time: Date) {
  const options: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  };

  return time.toLocaleDateString("fi-FI", options);
}

export function getShortMonthAndYear(time: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "numeric",
  };
  return time.toLocaleDateString("en-GB", options);
}

export function getLongMonthAndYear(time: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };
  return time.toLocaleDateString("fi-FI", options);
}

export function getNumericDateTime(time: Date) {
  const options: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  return time.toLocaleDateString("fi-FI", options);
}

export function getNumericDateWithYear(time: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  return time.toLocaleDateString("fi-FI", options);
}

export function getNumericDateWithYearAndWeekday(time: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  return time.toLocaleDateString("fi-FI", options);
}

export function getWeekNumber(date: Date) {
  // In ISO 8601 week 1 is basically the week that includes Jan 4th
  const referenceDate = new Date(date.valueOf());
  const dayOfWeek = (date.getDay() + 6) % 7; // Adjust to start week on monday
  referenceDate.setDate(referenceDate.getDate() - dayOfWeek + 3);
  const thisWeeksThursday = referenceDate.valueOf();
  referenceDate.setMonth(0, 1);
  if (referenceDate.getDay() !== 4) {
    referenceDate.setMonth(0, 1 + ((4 - referenceDate.getDay() + 7) % 7));
  }
  const firstThursday = referenceDate.valueOf();

  return (
    1 + Math.ceil((thisWeeksThursday - firstThursday) / millisecondsInWeek)
  );
}

// Returns time difference between two ISO dates (eg. "2023-30-11") in days
export function daysBetween(startDate: string, endDate: string) {
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);

  const timeDifference = Number(date2) - Number(date1);

  // Convert milliseconds to days
  const daysDifference = timeDifference / millisecondsInDay;

  return daysDifference;
}

// Estimate a sensible time interval when giving custom dates
export function estimateBestTimeInterval(startDate: string, endDate: string) {
  const daysDifference = daysBetween(startDate, endDate);

  if (daysDifference <= 2) {
    return "hour";
  }
  if (daysDifference <= 31) {
    return "day";
  }
  return "month";
}

export function getFirstAndLastDateOfYear(offset = 0, referenceDate?: Date) {
  const today = referenceDate || new Date();
  today.setHours(12);
  const year = today.getFullYear() + offset;

  return {
    firstDay: `${year}-01-01`,
    lastDay: `${year}-12-31`,
  };
}

export function getFirstAndLastDateOfMonth(offset = 0, referenceDate?: Date) {
  const today = referenceDate || new Date();
  today.setHours(12);

  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + offset,
    1
  );
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + offset + 1,
    0
  );
  firstDayOfMonth.setHours(12);
  lastDayOfMonth.setHours(12);

  return {
    firstDay: firstDayOfMonth.toISOString().split("T")[0],
    lastDay: lastDayOfMonth.toISOString().split("T")[0],
  };
}

export function getFirstAndLastDateOfWeek(offset = 0, referenceDate?: Date) {
  const today = referenceDate || new Date();
  today.setHours(12);
  today.setDate(today.getDate() + offset * 7);

  const dayOfWeek = (today.getDay() + 6) % 7; // Adjust to start week on monday
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - dayOfWeek);

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

  return {
    firstDay: firstDayOfWeek.toISOString().split("T")[0],
    lastDay: lastDayOfWeek.toISOString().split("T")[0],
  };
}

export function getISODate(offset = 0) {
  const referenceDay = new Date();
  referenceDay.setHours(12);
  referenceDay.setDate(referenceDay.getDate() + offset);

  return referenceDay.toISOString().split("T")[0];
}

// Misc
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduced)").matches;
