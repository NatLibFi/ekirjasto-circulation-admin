import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinlandStats, statTabs } from "../components/FinlandStats";
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

// Make Rechart play with Jest
jest.mock("recharts", () => ({
  ...jest.requireActual("recharts"),
  ResponsiveContainer: (props) => <div {...props} />,
}));

// Mock custom hooks
jest.mock("../../components/Stats", () => ({
  useStatistics: jest.fn(() => ({
    libraries: [{ key: "test-library", name: "Test library" }],
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

afterAll(() => {
  jest.resetAllMocks();
});

describe("FinlandStats", () => {
  it('renders with default library and "histogram" as default tab', () => {
    render(<FinlandStats />);
    const histogramElement = screen.getByTestId("histogram");
    expect(histogramElement).toBeInTheDocument();
  });

  it('renders event barchart instead if url hash is "event"', () => {
    window.location.hash = "events";
    render(<FinlandStats />);
    const barchartElement = screen.getByTestId("events");
    expect(barchartElement).toBeInTheDocument();
  });

  it("changes page content correctly when clicking tabs", async () => {
    const { container } = render(<FinlandStats />);
    const tabLinks = container.querySelectorAll("[data-testid=page-tabs] a");

    // Loop through tabs in statTabs
    for (let i = 0; i < statTabs.length; i++) {
      const tabSettings = statTabs[i];
      const link = tabLinks[i];
      // Check that tab has correct label
      expect(link).toHaveTextContent(tabSettings.label);
      await userEvent.click(link);
      await screen.findByTestId(tabSettings.key);
      // Check that url hash has changed
      expect(window.location.hash).toEqual(`#${tabSettings.key}`);
      const tabContentElement = screen.getByTestId(tabSettings.key);
      // Check that correct page component is loaded
      expect(tabContentElement).toBeInTheDocument();
    }
  });
});
