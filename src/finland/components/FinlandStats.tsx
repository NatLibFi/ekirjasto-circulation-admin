import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { useStatistics } from "../../components/Stats";
import { EventBarChart } from "./EventBarChart";
import { Histogram } from "./Histogram";
import { LoanReport } from "./LoanReport";
import {
  OpenSearchAnalyticsContext,
  OpenSearchAnalyticsContextProvider,
} from "../OpenSearchAnalyticsContext";
import { FilterContextProvider } from "../FilterContext";
import { filterKeys } from "../finlandUtils";

interface FinlandStatsProps {
  library?: string;
}

type Tab = "histogram" | "events" | "loan-stats";

type TabOption = {
  key: Tab;
  label: string;
  narrowLabel: string;
};
const tabs: TabOption[] = [
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
      <h1>Tilastot ({libraryDisplayName})</h1>
      <Tabs options={tabs} activeTab={activeTab} />
      <OpenSearchAnalyticsContextProvider library={library}>
        {renderSubComponent()}
      </OpenSearchAnalyticsContextProvider>
    </div>
  );
}

function Tabs({ options, activeTab }) {
  const isNarrow = useIsNarrow();

  // CSS class structure is copied from EntrypointsTabs.tsx (for consistency)
  return (
    <div className="entry-points-tab-container p-0">
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
  const { isReady } = useContext(OpenSearchAnalyticsContext);
  if (!isReady) {
    return null;
  }
  return (
    <FilterContextProvider keys={filterKeys}>{children}</FilterContextProvider>
  );
}

// React-router v3 is old and has rather poor support for nested routing in sub components
// so let's create a quick hash-based navigation system until it is updated in the upstream
function useHash(fallback?: string) {
  const [currentHash, setCurrentHash] = useState(
    fallback
      ? window.location.hash.replace("#", "") || fallback
      : window.location.hash.replace("#", "")
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.replace("#", ""));
    };

    // Add event listener to handle hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return currentHash;
}

const WIDTH_THRESHOLD = 800;

function useIsNarrow() {
  const [isBelowThreshold, setIsBelowThreshold] = useState(
    window.innerWidth < WIDTH_THRESHOLD
  );

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsBelowThreshold(width < WIDTH_THRESHOLD);
    }
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isBelowThreshold;
}
