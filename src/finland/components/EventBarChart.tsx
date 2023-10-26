import * as React from "react";
import { useContext, useEffect, useMemo } from "react";
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
import { OpenSearchAnalyticsContext } from "../OpenSearchAnalyticsContext";
import { TimeframeSelector } from "./TimeframeSelector";
import { DateRangeHeader } from "./DateRangeHeader";
import { FilterContext } from "../FilterContext";
import { FilterInputs } from "./FilterInputs";

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
  } = useContext(FilterContext);

  const { facetData, eventData, fetchEventData } = useContext(
    OpenSearchAnalyticsContext
  );

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
      />

      <FilterChips
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        clearFilters={clearFilters}
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
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData}>
              <Bar
                dataKey="määrä"
                isAnimationActive={!prefersReducedMotion}
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
