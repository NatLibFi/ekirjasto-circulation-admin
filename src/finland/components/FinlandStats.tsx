import * as React from "react";
import { useStatistics } from "../../components/Stats";
import { EventBarChart } from "./EventBarChart";
import { Histogram } from "./Histogram";
import { LoanReport } from "./LoanReport";
import { OpenSearchAnalyticsContextProvider } from "../OpenSearchAnalyticsContext";
import { FilterContextProvider } from "../FilterContext";
import { filterKeys } from "../finlandUtils";
import { useHash } from "../hooks/useHash";
import { useOpenSearchAnalytics } from "../hooks/useOpenSearchAnalytics";
import { useIsNarrowView } from "../hooks/useIsNarrowView";

interface FinlandStatsProps {
  library?: string;
}

type Tab = "histogram" | "events" | "loan-stats";

type TabOption = {
  key: Tab;
  label: string;
  narrowLabel: string;
};

export const statTabs: TabOption[] = [
  {
    key: "histogram",
    label: "Tapahtumat aikajanalla",
    narrowLabel: "Aikajana",
  },
  {
    key: "events",
    label: "Tapahtumien kokonaismäärät",
    narrowLabel: "Kokonaismäärät",
  },
  {
    key: "loan-stats",
    label: "Lainausmäärät (Excel)",
    narrowLabel: "Lainaukset",
  },
];

export function FinlandStats({ library }: FinlandStatsProps) {
  const activeTab = useHash("histogram");

  // Use Palace's statistics data to obtain library name
  const { data: statisticsData } = useStatistics();
  const libraryDisplayName =
    statisticsData?.libraries?.find((item) => item.key === library)?.name ||
    library;

  function renderSubComponent() {
    switch (activeTab) {
      case "histogram":
        return (
          <OpenSearchStatConsumer>
            <h2>Tapahtumat aikajanalla</h2>
            <Histogram />
          </OpenSearchStatConsumer>
        );
      case "events":
        return (
          <OpenSearchStatConsumer>
            <h2>Tapahtumien kokonaismäärät</h2>
            <EventBarChart />
          </OpenSearchStatConsumer>
        );
      case "loan-stats":
        return (
          <>
            <h2>Teosten lainausmäärät</h2>
            <LoanReport library={library} />
          </>
        );

      default:
        return null;
    }
  }
  return (
    <div className="fin-stats-page">
      <h1>
        {libraryDisplayName ? `Tilastot (${libraryDisplayName})` : "Tilastot"}
      </h1>
      <Tabs options={statTabs} activeTab={activeTab} />
      <OpenSearchAnalyticsContextProvider library={library}>
        {renderSubComponent()}
      </OpenSearchAnalyticsContextProvider>
    </div>
  );
}

function Tabs({ options, activeTab }) {
  const isNarrow = useIsNarrowView();

  // CSS class structure is copied from EntrypointsTabs.tsx (for consistency)
  return (
    <div className="entry-points-tab-container p-0" data-testid="page-tabs">
      <ul className="nav nav-tabs entry-points-list">
        {options.map(({ key, label, narrowLabel }) => (
          <li key={key} className={key === activeTab ? "active" : ""}>
            <a href={`#${key}`}>{isNarrow ? narrowLabel : label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OpenSearchStatConsumer({ children }) {
  const { isReady } = useOpenSearchAnalytics();
  if (!isReady) {
    return null;
  }
  return (
    <FilterContextProvider keys={filterKeys}>{children}</FilterContextProvider>
  );
}
