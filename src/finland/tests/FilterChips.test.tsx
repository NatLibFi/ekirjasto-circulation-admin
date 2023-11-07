import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { FilterChips } from "../components/FilterChips";

function doNothing() {
  /* do nothing */
}

afterAll(() => {
  jest.resetAllMocks();
});

describe("FilterChips", () => {
  it("renders with active filters", () => {
    const activeFilters = [
      { key: "filter1", value: "value1" },
      { key: "filter2", value: "value2" },
    ];

    const { getByText } = render(
      <FilterChips
        activeFilters={activeFilters}
        toggleFilter={doNothing}
        clearFilters={doNothing}
      />
    );

    // Verify that the component renders the active filters
    expect(getByText("filter1: value1")).toBeInTheDocument();
    expect(getByText("filter2: value2")).toBeInTheDocument();
  });

  it("triggers toggleFilter when a filter chip is clicked", () => {
    const activeFilters = [{ key: "filter1", value: "value1" }];
    const toggleFilterMock = jest.fn();

    const { getByText } = render(
      <FilterChips
        activeFilters={activeFilters}
        toggleFilter={toggleFilterMock}
        clearFilters={doNothing}
      />
    );

    fireEvent.click(getByText("filter1: value1"));

    // Verify that toggleFilter was called with the correct arguments
    expect(toggleFilterMock).toHaveBeenCalledWith(activeFilters[0]);
  });

  it('triggers clearFilters when the "clear all" chip is clicked', () => {
    const activeFilters = [{ key: "filter1", value: "value1" }];
    const clearFiltersMock = jest.fn();

    const { getByTestId } = render(
      <FilterChips
        activeFilters={activeFilters}
        toggleFilter={doNothing}
        clearFilters={clearFiltersMock}
      />
    );

    fireEvent.click(getByTestId("clear-all"));

    // Verify that clearFilters was called
    expect(clearFiltersMock).toHaveBeenCalledTimes(1);
  });
});
