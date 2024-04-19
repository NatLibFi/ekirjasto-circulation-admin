import * as React from "react";
import { render } from "@testing-library/react";
import { Histogram } from "../components/Histogram";
import {
  eventDataFixture,
  facetDataFixture,
  histogramDataFixture,
} from "./fixtures";

/* Mock globals and dependencies */

// For facet fetch in OpenSearchAnalyticsContext
global.fetch = jest.fn(
  () =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    }) as Promise<Response>
);

// For prefersReducedMotion() in utils
global.window.matchMedia = () => ({ matches: true } as MediaQueryList);

// Give hardcoded width and height to Rechart for it to render.
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

// Mock the custom hooks
jest.mock("../hooks/useFilters", () => ({
  useFilters: jest.fn(() => ({
    activeFilters: [],
    toggleFilter: jest.fn(),
    clearFilters: jest.fn(),
    startDate: "",
    setStartDate: jest.fn(),
    endDate: "",
    setEndDate: jest.fn(),
    activeTimeframe: "day",
    setActiveTimeframe: jest.fn(),
    setTimeframeOffset: jest.fn(),
  })),
}));

jest.mock("../hooks/useOpenSearchAnalytics", () => ({
  useOpenSearchAnalytics: jest.fn(() => ({
    facetData: facetDataFixture.facets,
    eventData: eventDataFixture.data,
    fetchEventData: jest.fn(() => null),
    histogramData: histogramDataFixture.data,
    fetchHistogramData: jest.fn(() => null),
    isReady: true,
    filterToOptions: jest.fn((_, buckets) =>
      buckets.map((item) => ({
        value: item.key,
        name: item.key,
      }))
    ),
  })),
}));

const eventTypesLenght = eventDataFixture.data.type.length;

afterAll(() => {
  jest.resetAllMocks();
});

describe("Histogram", () => {
  it("renders the component and correct amount of lines", () => {
    render(<Histogram />);

    const lines = document.querySelectorAll(".recharts-line");

    // Check that there's as many bars as event types
    for (let i = 0; i < eventTypesLenght; i++) {
      expect(lines[i]).toBeInTheDocument();
    }
    // ... but no more than that
    expect(lines[eventTypesLenght]).toBeFalsy();
  });

  it("toggles a line when clicking a legend", () => {
    render(<Histogram />);

    const lines = document.querySelectorAll(".recharts-legend-item");

    // Check that there's as many lines as event types
    expect(lines.length === eventTypesLenght).toBeTruthy();
  });
});
