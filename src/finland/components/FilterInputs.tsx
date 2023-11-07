import * as React from "react";
import { KeyValuePair, filterKeys, readable, EventKey } from "../finlandUtils";
import { FacetData } from "../OpenSearchAnalyticsContext";
import SelectSearch from "react-select-search";
import { fuzzySearch } from "react-select-search";

type FilterInputsProps = {
  toggleFilter: (selection: KeyValuePair) => void;
  facetData: FacetData;
  startDate: string;
  setStartDate: (newDate: string) => void;
  endDate: string;
  setEndDate: (newDate: string) => void;
};

export function FilterInputs({
  toggleFilter,
  facetData,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: FilterInputsProps) {
  return (
    <div className="input-wrapper">
      {filterKeys.map((key) => {
        const options =
          facetData[key]?.buckets.map((item) => ({
            value: item.key,
            name: item.key,
          })) || [];
        const label = readable(key);
        return (
          <div key={key} className="flex-col">
            <label htmlFor={key}>{label}</label>
            <SelectSearch
              id={key}
              options={options}
              search
              placeholder="Rajaa.."
              onChange={(item) => {
                if (typeof item === "string") {
                  toggleFilter({
                    key: key as EventKey,
                    value: item,
                  });
                }
              }}
              filterOptions={fuzzySearch}
            />
          </div>
        );
      })}

      <div className="flex-col">
        <label htmlFor="start-date">Alkaen</label>
        <input
          className="form-control"
          type="date"
          id="start-date"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
          }}
        />
      </div>
      <div className="flex-col">
        <label htmlFor="end-date">Päättyen</label>
        <input
          className="form-control"
          type="date"
          id="end-date"
          value={endDate}
          min={startDate}
          onChange={(event) => {
            setEndDate(event.target.value);
          }}
        />
      </div>
    </div>
  );
}
