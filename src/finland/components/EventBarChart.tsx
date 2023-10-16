import * as React from "react";
import { useEffect, useMemo } from "react";
import { Params, useFilters } from "../useFilters";
import { readable, EventKey, getColor, filterKeys } from "../finlandUtils";
import { FilterChips } from "./FilterChips";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { OpenSearchAnalyticsContext } from "../OpenSearchAnalyticsContext";

export function EventBarChart() {
  const {
    activeFilters,
    toggleFilter,
    clearFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useFilters(filterKeys);

  const { facetData, eventData, fetchEventData } = React.useContext(
    OpenSearchAnalyticsContext
  );

  useEffect(() => {
    const selections: Params = [...activeFilters];
    if (startDate) selections.push({ key: "from", value: startDate });
    if (endDate) selections.push({ key: "to", value: endDate });
    fetchEventData(selections as Params);
  }, [activeFilters, startDate, endDate]);

  // Format data for Rechart
  const groupData = useMemo(() => {
    return eventData?.type
      .map(({ doc_count, key }, idx) => ({
        name: readable(key),
        määrä: doc_count || 0,
        fill: getColor(idx),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [eventData]);

  if (!eventData || !facetData) return null;

  return (
    <div>
      <div className="input-wrapper">
        <div className="flex-col">
          <label htmlFor="start-date">Alkaen</label>
          <input
            className="form-control"
            type="date"
            id="start-date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
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
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
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
      </div>

      <FilterChips
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        clearFilters={clearFilters}
      />

      <div className="side-scrollable">
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData}>
              <Bar dataKey="määrä" />
              <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5"
                vertical={false}
              />
              <XAxis dataKey="name" interval={0} />
              <YAxis />
              <Tooltip cursor={{ fill: "#fff6" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
