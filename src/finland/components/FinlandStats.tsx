import * as React from "react";
import { useContext } from "react";
import { EventBarChart } from "./EventBarChart";
import { Histogram } from "./Histogram";
import { LoanReport } from "./LoanReport";
import {
  OpenSearchAnalyticsContext,
  OpenSearchAnalyticsContextProvider,
} from "../OpenSearchAnalyticsContext";

interface FinlandStatsProps {
  library?: string;
}

export function FinlandStats({ library }: FinlandStatsProps) {
  return (
    <div className="fin-stats-page">
      <h1>Tilastot (proto)</h1>
      <OpenSearchAnalyticsContextProvider library={library}>
        <OpenSearchStats />
      </OpenSearchAnalyticsContextProvider>
      <h2>Teosten lainausmäärät</h2>
      <LoanReport library={library} />
    </div>
  );
}

function OpenSearchStats() {
  const { isReady } = useContext(OpenSearchAnalyticsContext);
  if (!isReady) {
    return null;
  }
  return (
    <>
      <h2>Tapahtumien kokonaismäärät</h2>
      <EventBarChart />
      <h2>Tapahtumat aikajanalla</h2>
      <Histogram />
    </>
  );
}
