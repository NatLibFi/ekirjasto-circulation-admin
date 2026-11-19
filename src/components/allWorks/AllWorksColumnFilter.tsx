import * as React from "react";
import { AllWork, AllWorksData } from "../../reducers/allWorks";
import { GenreTree, LanguagesData } from "../../interfaces";
import {
  FilterKey,
  formatLabel,
  WorkColumn,
  WorkFilters,
} from "../../utils/allWorks";

export interface ColumnFilterProps {
  column: WorkColumn;
  filters: WorkFilters;
  rows: AllWork[];
  languages: LanguagesData;
  genreTree: GenreTree;
  genreOptions: AllWorksData["genre_options"];
  onFilter: (key: FilterKey, value: string, debounce: boolean) => void;
}

export default function AllWorksColumnFilter({
  column,
  filters,
  rows,
  languages,
  genreTree,
  genreOptions,
  onFilter,
}: ColumnFilterProps) {
  const { key, label, filterKey, filterKind } = column;
  if (filterKind === "numberRange" || filterKind === "dateRange") {
    const isDate = filterKind === "dateRange";
    return (
      <div
        className={`all-works-range-filter${
          key === "duration" ? " duration-range-filter" : ""
        }`}
      >
        {(["min", "max"] as const).map((bound, index) => {
          const name = `${key}_${bound}` as FilterKey;
          return (
            <React.Fragment key={bound}>
              {index === 1 && <span aria-hidden="true">-</span>}
              <input
                aria-label={`${label}: ${
                  bound === "min" ? "vähintään" : "enintään"
                }${key === "duration" ? " tuntia" : ""}`}
                type={isDate ? "date" : "number"}
                step={key === "duration" ? "any" : undefined}
                value={filters[name] || ""}
                onChange={(event) =>
                  onFilter(name, event.target.value, !isDate)
                }
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }
  if (filterKind !== "select") {
    return (
      <input
        aria-label={`Rajaa: ${label}`}
        type={filterKind}
        value={filters[filterKey] || ""}
        onChange={(event) => onFilter(filterKey, event.target.value, true)}
      />
    );
  }
  let options: { value: string; label: string }[] = [];
  if (key === "language") {
    options = Object.keys(languages || {})
      .sort((a, b) => a.localeCompare(b))
      .map((code) => ({ value: code, label: languages[code]?.[0] || code }));
  } else if (key === "format") {
    options = Array.from(
      new Set([
        "book",
        "audio",
        ...rows.map((work) => work.format),
        filters.format,
      ])
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: formatLabel(value) }));
  } else if (key === "license_pool_status") {
    options = [
      { value: "active", label: "Aktiivinen" },
      { value: "exhausted", label: "Poistunut" },
      { value: "no_licenses", label: "Puuttuvat lisenssit" },
    ];
  } else if (key === "fiction") {
    options = [
      { value: "true", label: "Kaunokirjallisuus" },
      { value: "false", label: "Tietokirjallisuus" },
    ];
  } else if (key === "audience") {
    options = [
      { value: "Adult", label: "Aikuiset" },
      { value: "Young Adult", label: "Nuoret" },
      { value: "Children", label: "Lapset" },
      { value: "Adults Only", label: "Vain aikuiset" },
    ];
  }
  const genresByLabel = new Map(
    (genreOptions || []).map((genre) => [genre.label, genre])
  );
  return (
    <select
      aria-label={`Rajaa: ${label}`}
      value={filters[filterKey] || ""}
      onChange={(event) => onFilter(filterKey, event.target.value, false)}
    >
      <option value="">Kaikki</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {key === "genres" &&
        Object.entries(genreTree || {}).map(([group, genres]) => (
          <optgroup key={group} label={group}>
            {Object.keys(genres).map((name) => {
              const genre = genresByLabel.get(name);
              return genre ? (
                <option key={genre.value} value={genre.value}>
                  {name}
                </option>
              ) : null;
            })}
          </optgroup>
        ))}
    </select>
  );
}
