import * as React from "react";
import { useEffect, useMemo } from "react";
import {
  readable,
  getColor,
  prefersReducedMotion,
  KeyValuePair,
} from "../finlandUtils";
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
import { TimeframeSelector } from "./TimeframeSelector";
import { DateRangeHeader } from "./DateRangeHeader";
import { FilterInputs } from "./FilterInputs";
import { useFilters } from "../hooks/useFilters";
import { useOpenSearchAnalytics } from "../hooks/useOpenSearchAnalytics";

export function EventBarChart() {
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

  const {
    facetData,
    eventData,
    fetchEventData,
    filterToOptions,
    labelizeFilterChip,
  } = useOpenSearchAnalytics();

  useEffect(() => {
    const selections: KeyValuePair[] = [...activeFilters];
    if (startDate) selections.push({ key: "from", value: startDate });
    if (endDate) selections.push({ key: "to", value: endDate });
    fetchEventData(selections as KeyValuePair[]);
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
      </div>

      <DateRangeHeader
        activeTimeframe={activeTimeframe}
        startDate={startDate}
        endDate={endDate}
      />

      <div className="side-scrollable">
        <div className="chart" data-testid="events">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData}>
              <Bar
                dataKey="määrä"
                isAnimationActive={!prefersReducedMotion()}
                animationDuration={300}
              />
              <CartesianGrid
                stroke="#ccc"
                strokeDasharray="5 5"
                vertical={false}
              />
              <XAxis dataKey="name" interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: "#fff6" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
