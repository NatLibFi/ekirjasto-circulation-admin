import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Interval,
  KeyValuePair,
  daysBetween,
  estimateBestTimeInterval,
  getColor,
  intervals,
  prefersReducedMotion,
  readable,
  timeStampToLabel,
  timeStampToTick,
} from "../finlandUtils";
import { FilterChips } from "./FilterChips";
import { TimeframeSelector } from "./TimeframeSelector";
import { DateRangeHeader } from "./DateRangeHeader";
import { FilterInputs } from "./FilterInputs";
import { useFilters } from "../hooks/useFilters";
import { useOpenSearchAnalytics } from "../hooks/useOpenSearchAnalytics";

export function Histogram() {
  const [interval, setInterval] = useState<Interval>("hour");
  const [inactiveGroups, setInactiveGroups] = useState<string[]>([]);
  const lastLegendClick: React.MutableRefObject<{
    key: string | null;
    time: number | null;
  }> = useRef({ key: null, time: null });

  const {
    facetData,
    histogramData,
    fetchHistogramData,
    filterToOptions,
    labelizeFilterChip,
  } = useOpenSearchAnalytics();

  const {
    activeFilters,
    toggleFilter,
    clearFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeTimeframe,
    setActiveTimeframe,
    setTimeframeOffset,
  } = useFilters();

  // Fetch data when filters or start/end dates change
  useEffect(() => {
    const newInterval = estimateBestTimeInterval(startDate, endDate);
    setInterval(newInterval);
    const selections: KeyValuePair[] = [...activeFilters];
    selections.push({ key: "interval", value: newInterval });
    if (startDate) selections.push({ key: "from", value: startDate });
    if (endDate) selections.push({ key: "to", value: endDate });
    fetchHistogramData(selections as KeyValuePair[]);
    setInterval(estimateBestTimeInterval(startDate, endDate));
  }, [activeFilters, startDate, endDate]);

  function handleChangeInterval(newInterval: Interval) {
    setInterval(newInterval);
    const selections: KeyValuePair[] = [...activeFilters];
    selections.push({ key: "interval", value: newInterval });
    if (startDate) selections.push({ key: "from", value: startDate });
    if (endDate) selections.push({ key: "to", value: endDate });
    fetchHistogramData(selections as KeyValuePair[]);
  }

  // Event keys that are present in the data
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

  // Format data for Recharts LineChart
  const timeData = useMemo(() => {
    if (!histogramData) return null;
    return histogramData?.events_per_interval?.buckets.map((item) => {
      const out = { time: item.key, label: item.readable_time };
      // Add values (or zeroes) for each event type to the bucket
      eventKeys.forEach((eventType) => {
        out[eventType] =
          item.type.buckets.find((bucket) => bucket.key === eventType)
            ?.doc_count || 0;
      });

      return out;
    });
  }, [histogramData]);

  if (!timeData || !facetData) return null;

  const dateRangeLength = daysBetween(startDate, endDate);

  function toggleGroup(key: string) {
    setInactiveGroups(
      inactiveGroups.includes(key)
        ? inactiveGroups.filter((item) => item !== key)
        : [...inactiveGroups, key]
    );
  }

  function toggleGroupSolo(key: string) {
    setInactiveGroups(
      inactiveGroups.length <= 1 ? eventKeys.filter((item) => item !== key) : []
    );
  }

  function handleLegendClick(key: string) {
    const now = Date.now();
    if (
      lastLegendClick.current.key === key &&
      now - lastLegendClick.current.time < 300
    ) {
      toggleGroupSolo(key);
    } else {
      toggleGroup(key);
    }
    lastLegendClick.current = { key, time: now };
  }

  return (
    <div>
      <FilterInputs
        toggleFilter={toggleFilter}
        facetData={facetData}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filterToOptions={filterToOptions}
      />

      <FilterChips
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        clearFilters={clearFilters}
        labelize={labelizeFilterChip}
      />

      <div className="chart-prefix">
        <TimeframeSelector
          activeTimeframe={activeTimeframe}
          handleTimeframeClick={setActiveTimeframe}
          handleOffsetChange={setTimeframeOffset}
        />

        <TimeIntervalSelector
          interval={interval}
          handleChangeInterval={handleChangeInterval}
          dateRangeLength={dateRangeLength}
        />
      </div>

      <DateRangeHeader
        activeTimeframe={activeTimeframe}
        startDate={startDate}
        endDate={endDate}
      />

      {/* The histogram chart */}
      {!!histogramData && (
        <div className="side-scrollable">
          <div className="chart" data-testid="histogram">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(unixTime) =>
                    timeStampToTick(unixTime, interval)
                  }
                />
                <YAxis type="number" allowDecimals={false} />
                <Tooltip
                  labelFormatter={(unixTime) =>
                    timeStampToLabel(unixTime as number, interval)
                  }
                />
                <Legend onClick={(item) => handleLegendClick(item.dataKey)} />
                {eventKeys.map((item, idx) => (
                  <Line
                    isAnimationActive={!prefersReducedMotion()}
                    animationDuration={300}
                    key={item}
                    type="monotone"
                    name={readable(item)}
                    dataKey={item}
                    stroke={getColor(idx)}
                    hide={inactiveGroups.includes(item)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

type TimeIntervalSelectorProps = {
  interval: string;
  handleChangeInterval: (newInterval: Interval) => void;
  dateRangeLength: number;
};

function TimeIntervalSelector({
  interval,
  handleChangeInterval,
  dateRangeLength,
}: TimeIntervalSelectorProps) {
  return (
    <div className="flex-col items-end">
      <label className="mini-label" htmlFor="interval">
        Tarkkuus
      </label>
      <select
        className="mini-selector"
        name="interval"
        id="interval"
        value={interval}
        onChange={(event) => {
          handleChangeInterval(event.target.value as Interval);
        }}
      >
        {intervals.map((item) => (
          <option
            key={item}
            value={item}
            // Disable hour interval option for long date ranges
            disabled={item === "hour" && dateRangeLength > 31}
          >
            {readable(item)}
          </option>
        ))}
      </select>
    </div>
  );
}
