import * as React from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  EventKey,
  Interval,
  filterKeys,
  intervals,
  readable,
} from "../finlandUtils";
import { Params, useFilters } from "../useFilters";
import { FilterChips } from "./FilterChips";
import { OpenSearchAnalyticsContext } from "../OpenSearchAnalyticsContext";

export function Histogram() {
  const [interval, setInterval] = useState<Interval>("hour");
  const { facetData, histogramData, fetchHistogramData } = useContext(
    OpenSearchAnalyticsContext
  );
  const {
    activeFilters,
    toggleFilter,
    clearFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useFilters(filterKeys);

  useEffect(() => {
    const selections: Params = [...activeFilters];
    selections.push({ key: "interval", value: interval });
    if (startDate) selections.push({ key: "from", value: startDate });
    if (endDate) selections.push({ key: "to", value: endDate });
    fetchHistogramData(selections as Params);
  }, [activeFilters, startDate, endDate, interval]);

  // Event keys present in the data
  const eventKeys = useMemo(
    () =>
      histogramData
        ? Array.from(
            new Set(
              histogramData.events_per_interval?.buckets?.flatMap((item) =>
                item.type?.buckets?.map((bucket) => bucket.key)
              )
            )
          ).sort((a, b) => readable(a).localeCompare(readable(b)))
        : [],
    [histogramData]
  );

  // Format data for Rechart
  const timeData = useMemo(() => {
    if (!histogramData) return null;
    return histogramData?.events_per_interval?.buckets.map((item) => {
      const out = { time: item.key, label: item.readable_time };
      eventKeys.forEach((eventType) => {
        out[eventType] =
          item.type.buckets.find((bucket) => bucket.key === eventType)
            ?.doc_count || 0;
      });
      return out;
    });
  }, [histogramData]);

  if (!timeData || !facetData) return null;

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
        <div className="flex-col">
          <label htmlFor="interval">Aikaväli</label>
          <select
            className="form-control"
            name="interval"
            id="interval"
            value={interval}
            onChange={(event) => {
              setInterval(event.target.value as Interval);
            }}
          >
            {intervals.map((item) => (
              <option key={item} value={item}>
                {readable(item)}
              </option>
            ))}
          </select>
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
            <LineChart data={timeData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="time"
                minTickGap={48}
                tickFormatter={(unixTime) =>
                  timeStampToTick(unixTime, interval)
                }
              />
              <YAxis type="number" minTickGap={1} />
              <Tooltip
                labelFormatter={(unixTime) =>
                  timeStampToLabel(unixTime as number, interval)
                }
              />
              <Legend />
              {eventKeys.map((item, idx) => (
                <Line
                  isAnimationActive={false}
                  key={item}
                  type="monotone"
                  name={readable(item)}
                  dataKey={item}
                  stroke={`hsl(${idx * 40}deg, 80%, 40%)`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function timeStampToTick(unixTime: number, interval: Interval) {
  const time = new Date(unixTime);
  if (interval === "hour") {
    const hours = time.getHours();
    if (hours !== 0) {
      return time.getHours();
    }
    const options: Intl.DateTimeFormatOptions = {
      month: "numeric",
      day: "numeric",
    };
    return time.toLocaleDateString("fi-FI", options);
  }
  if (interval === "day") {
    const options: Intl.DateTimeFormatOptions = {
      month: "numeric",
      day: "numeric",
    };
    return time.toLocaleDateString("fi-FI", options);
  }
  if (interval === "month") {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
    };
    return time.toLocaleDateString("fi-FI", options);
  }
  return unixTime;
}
function timeStampToLabel(unixTime: number, interval: Interval) {
  const time = new Date(unixTime);
  if (interval === "hour") {
    const options: Intl.DateTimeFormatOptions = {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };
    return time.toLocaleDateString("fi-FI", options);
  }
  if (interval === "day") {
    const options: Intl.DateTimeFormatOptions = {
      month: "numeric",
      day: "numeric",
    };
    return time.toLocaleDateString("fi-FI", options);
  }
  if (interval === "month") {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
    };
    return time.toLocaleDateString("fi-FI", options);
  }
  return unixTime;
}
