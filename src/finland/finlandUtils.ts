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
  date?: string;
}

export type EventKey = keyof IEvent;

export const eventTypes = {
  circulation_manager_check_out: "circulation_manager_check_out",
  circulation_manager_check_in: "circulation_manager_check_in",
  circulation_manager_fulfill: "circulation_manager_fulfill",
  circulation_manager_hold_place: "circulation_manager_hold_place",
  circulation_manager_hold_release: "circulation_manager_hold_release",
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
  // Time intervals
  hour: "Tunti",
  day: "Päivä",
  month: "Kuukausi",
};

export const readable = (input: string): string =>
  readableNames[input] || input;

export const filterKeys = ["publisher", "language", "audience", "genres"];

export const intervals = ["hour", "day", "month"];
export type Interval = "hour" | "day" | "month";

// Helper functions
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

export const getColor = (hueFactor: number, startHue = 140) =>
  `hsl(${40 * hueFactor + startHue}deg, 50%, 50%)`;
