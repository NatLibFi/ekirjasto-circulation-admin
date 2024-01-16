import * as React from "react";
import { createContext, useEffect, useState } from "react";
import { KeyValuePair } from "./finlandUtils";
const termsEndpoint = "/admin/events/terms";
const histogramEndpoint = "/admin/events/histogram";
const facetsEndpoint = "/admin/events/facets";

type BucketItem = {
  key: string;
  doc_count: number;
};

type TermBucketData = Record<string, BucketItem[]>;

type HistogramBucketItem = {
  key: number;
  readable_time: string;
  type: {
    buckets: BucketItem[];
  };
};

type HistogramData = {
  events_per_interval: {
    buckets: HistogramBucketItem[];
  };
};

export type FacetData = Record<string, { buckets: BucketItem[] }>;

export type OpenSearchAnalyticsContextType = {
  facetData?: FacetData;
  eventData?: TermBucketData;
  fetchEventData?: (params: KeyValuePair[]) => void;
  histogramData?: HistogramData;
  fetchHistogramData?: (params: KeyValuePair[]) => void;
  isReady?: boolean;
};

// Context & provider for OpenSearch analytics queries
export const OpenSearchAnalyticsContext = createContext(
  {} as OpenSearchAnalyticsContextType
);

type ProviderProps = {
  children: React.ReactNode;
  library?: string;
};

export function OpenSearchAnalyticsContextProvider({
  children,
  library,
}: ProviderProps) {
  const [facetData, setFacetData] = useState<FacetData>(null);
  const [isReady, setIsReady] = useState(false);
  const [eventData, setEventData] = useState<TermBucketData>(null);
  const [histogramData, setHistogramData] = useState<HistogramData>(null);

  useEffect(() => {
    async function fetchFacets() {
      try {
        const response = await fetch(`/${library}${facetsEndpoint}`);
        const data = await response.json();
        const newFacetData = data?.facets;
        if (newFacetData) {
          setFacetData(newFacetData);
          setIsReady(true);
        }
      } catch (err) {
        console.error("Error while fetching facets for statistics", err);
      }
    }
    fetchFacets();
  }, [library]);

  async function fetchEventData(selections?: KeyValuePair[]) {
    try {
      const queryString = selections?.length
        ? selectionsToQueryString(selections)
        : null;
      const url = queryString
        ? `/${library}${termsEndpoint}?${queryString}`
        : termsEndpoint;
      const response = await fetch(url);
      const newData = await response.json();
      setEventData(newData?.data);
    } catch (err) {
      console.error("Error while fetching event data for statistics", err);
    }
  }

  async function fetchHistogramData(selections?: KeyValuePair[]) {
    try {
      const queryString = selections?.length
        ? selectionsToQueryString(selections)
        : null;
      const url = queryString
        ? `/${library}${histogramEndpoint}?${queryString}`
        : histogramEndpoint;
      const response = await fetch(url);
      const newData = await response.json();
      setHistogramData(newData?.data);
    } catch (err) {
      console.error("Error while fetching histogram data for statistics", err);
    }
  }

  return (
    <OpenSearchAnalyticsContext.Provider
      value={{
        isReady,
        facetData,
        eventData,
        fetchEventData,
        histogramData,
        fetchHistogramData,
      }}
    >
      {children}
    </OpenSearchAnalyticsContext.Provider>
  );
}

// Helper functions
function selectionsToQueryString(selections?: KeyValuePair[]) {
  const searchParams = new URLSearchParams();

  selections.forEach(({ key, value }) => {
    searchParams.append(key, value);
  });

  return searchParams.toString();
}
