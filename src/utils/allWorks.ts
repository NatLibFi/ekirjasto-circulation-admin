import { AllWork } from "../reducers/allWorks";

export const columns = [
  ["title", "Nimi"],
  ["author", "Tekijä(t)"],
  ["language", "Kieli"],
  ["format", "Formaatti"],
  ["license_pool_status", "Kirjan tila"],
] as const;

export const optionalColumns = [
  ["published_year", "Julkaisuvuosi"],
  ["licenses_owned", "Lukuoikeudet"],
  ["patrons_in_hold_queue", "Varausjono"],
  ["series", "Sarja"],
  ["duration", "Äänikirjan kesto (tuntia)"],
  ["number_of_pages", "E-kirjan sivumäärä"],
  ["awards", "Palkinnot"],
  ["title_created_date", "Nimekkeen luontipvm"],
  ["data_source_modified", "Tietolähteen muokkauspvm"],
  ["original_published_year", "Alkuperäinen julkaisuvuosi"],
  ["original_language", "Alkuperäinen kieli"],
  ["original_title", "Alkuperäinen nimi"],
  ["keywords", "Avainsanat"],
  ["genres", "Genret"],
  ["fiction", "Kauno-/tietokirjallisuus"],
  ["audience", "Kohdeyleisö"],
  ["target_age", "Kohdeikä"],
] as const;

export type OptionalKey = typeof optionalColumns[number][0];

export function apiMetadataFilters(filters: { [key: string]: string }) {
  const result = { ...filters };
  (["duration_min", "duration_max"] as const).forEach((key) => {
    if (result[key] !== undefined && result[key] !== "") {
      result[key] = String(Number(result[key]) * 60 * 60);
    }
  });
  return result;
}

export const numberKeys: OptionalKey[] = [
  "published_year",
  "licenses_owned",
  "patrons_in_hold_queue",
  "duration",
  "number_of_pages",
  "original_published_year",
];
export const dateKeys: OptionalKey[] = [
  "title_created_date",
  "data_source_modified",
];
export const listKeys: OptionalKey[] = ["awards", "keywords", "genres"];

export function metadataValue(work: AllWork, key: OptionalKey): string {
  const value = work[key];
  if (value == null) return "";
  if (key === "series")
    return [value, work.series_position]
      .filter((part) => part != null)
      .join(" #");
  if (key === "duration") {
    const minutes = Math.round(Number(value) / 60);
    return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(
      2,
      "0"
    )} min`;
  }
  if (dateKeys.includes(key))
    return new Date(String(value)).toLocaleDateString("fi-FI");
  if (listKeys.includes(key)) return (value as string[]).join(", ");
  if (key === "fiction")
    return value ? "Kaunokirjallisuus" : "Tietokirjallisuus";
  if (key === "audience") {
    const labels: { [key: string]: string } = {
      Adult: "Aikuiset",
      "Young Adult": "Nuoret",
      Children: "Lapset",
      "Adults Only": "Vain aikuiset",
    };
    return labels[String(value)] || String(value);
  }
  return String(value);
}

export function licensePoolStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    active: "Aktiivinen",
    exhausted: "Poistunut",
    no_licenses: "Puuttuvat lisenssit",
  };
  return labels[status] || status;
}

export function formatLabel(format: string): string {
  const labels: { [key: string]: string } = {
    audio: "äänikirja",
    book: "e-kirja",
  };
  const normalizedFormat = format.trim().toLowerCase();
  return labels[normalizedFormat] || format;
}

export function bookDetailsHref(
  library: string,
  adminUrl?: string
): string | null {
  if (!adminUrl) {
    return null;
  }

  let pathname: string;
  try {
    pathname = new URL(adminUrl, window.location.origin).pathname;
  } catch (_error) {
    return null;
  }

  const worksMarker = "/admin/works/";
  const worksIndex = pathname.indexOf(worksMarker);
  if (worksIndex < 0) {
    return null;
  }

  const workPath = pathname.slice(worksIndex + worksMarker.length);
  if (!workPath) {
    return null;
  }

  return `/admin/web/admin-book/${encodeURIComponent(
    `${library}/${workPath}`
  )}`;
}

export function bookListsUrl(adminUrl?: string): string | null {
  if (!adminUrl) return null;
  try {
    const pathname = new URL(adminUrl, window.location.origin).pathname;
    const marker = "/admin/works/";
    const index = pathname.indexOf(marker);
    if (index < 0) return null;
    return `${pathname.slice(index).replace(/\/$/, "")}/lists`;
  } catch (_error) {
    return null;
  }
}

export type ColumnKey = typeof columns[number][0] | OptionalKey;
export type SortKey = Exclude<ColumnKey, "genres" | "keywords">;

export function isSortableKey(key: ColumnKey): key is SortKey {
  return key !== "genres" && key !== "keywords";
}

export type SortDirection = "asc" | "desc";
export type FilterKey =
  | Exclude<ColumnKey, "license_pool_status">
  | "status"
  | "published_year_min"
  | "published_year_max"
  | "licenses_owned_min"
  | "licenses_owned_max"
  | "patrons_in_hold_queue_min"
  | "patrons_in_hold_queue_max"
  | "duration_min"
  | "duration_max"
  | "number_of_pages_min"
  | "number_of_pages_max"
  | "original_published_year_min"
  | "original_published_year_max"
  | "title_created_date_min"
  | "title_created_date_max"
  | "data_source_modified_min"
  | "data_source_modified_max";
export type WorkFilters = Partial<Record<FilterKey, string>>;
export type WorkQueryParams = { [key: string]: string | number };

export function serializeWorkQuery(params: WorkQueryParams): string {
  return Object.keys(params)
    .filter((key) => params[key] !== "" && params[key] !== undefined)
    .sort()
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
}

/** Pagination may reuse a total only for this same library and query. */
export function workQueryKey(library: string, params: WorkQueryParams): string {
  const query = { ...params };
  delete query.offset;
  delete query.include_total;
  return `${encodeURIComponent(library)}?${serializeWorkQuery(query)}`;
}

export type FilterKind =
  | "text"
  | "number"
  | "dateRange"
  | "numberRange"
  | "select";
export interface WorkColumn {
  key: ColumnKey;
  label: string;
  filterKey: FilterKey;
  filterKind: FilterKind;
  optional: boolean;
  formatValue: (work: AllWork) => string;
}

export const workColumns: WorkColumn[] = [...columns, ...optionalColumns].map(
  ([key, label]) => ({
    key,
    label,
    filterKey: key === "license_pool_status" ? "status" : key,
    filterKind: dateKeys.includes(key as OptionalKey)
      ? "dateRange"
      : numberKeys.includes(key as OptionalKey)
      ? "numberRange"
      : [
          "language",
          "format",
          "license_pool_status",
          "genres",
          "fiction",
          "audience",
        ].includes(key)
      ? "select"
      : key === "target_age"
      ? "number"
      : "text",
    formatValue: (work: AllWork) => {
      if (key === "format") return formatLabel(work.format);
      if (key === "license_pool_status")
        return licensePoolStatusLabel(work.license_pool_status);
      if (key === "title" || key === "author" || key === "language")
        return work[key];
      return metadataValue(work, key);
    },
    optional: optionalColumns.some(([optionalKey]) => optionalKey === key),
  })
);
