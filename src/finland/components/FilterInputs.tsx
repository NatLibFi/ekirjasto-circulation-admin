import * as React from "react";
import { KeyValuePair, filterKeys, readable, EventKey } from "../finlandUtils";
import { FacetData } from "../OpenSearchAnalyticsContext";

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
      {filterKeys.map((key) => (
        <div key={key} className="flex-col">
          <label htmlFor={key}>{readable(key)}</label>
          <select
            className="form-control"
            name={key}
            id={key}
            onChange={(event) => {
              toggleFilter({
                key: key as EventKey,
                value: event.target.value,
              });
              event.target.value = "";
            }}
          >
            <option key="all" value="">
              – rajaa –
            </option>
            {facetData[key]?.buckets.map((item) => (
              <option key={item.key} value={item.key}>
                {item.key}
              </option>
            ))}
          </select>
        </div>
      ))}
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
