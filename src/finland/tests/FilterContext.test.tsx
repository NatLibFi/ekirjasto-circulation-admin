import * as React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { FilterContextProvider } from "../FilterContext";
import { useFilters } from "../hooks/useFilters";

function FilterTestComponent() {
  const {
    activeFilters,
    toggleFilter,
    removeFilter,
    clearFilters,
  } = useFilters();

  const handleToggleFilter1 = () => {
    toggleFilter({ key: "filter1", value: "value1" });
  };

  const handleToggleFilter2 = () => {
    toggleFilter({ key: "filter2", value: "value2" });
  };

  const handleRemoveFilter1 = () => {
    removeFilter({ key: "filter1", value: "value1" });
  };

  const handleRemoveFilter2 = () => {
    removeFilter({ key: "filter2", value: "value2" });
  };

  return (
    <div>
      <div>
        <button onClick={handleToggleFilter1}>Toggle Filter 1</button>
        <button onClick={handleRemoveFilter1}>Remove Filter 1</button>
        <button onClick={handleToggleFilter2}>Toggle Filter 2</button>
        <button onClick={handleRemoveFilter2}>Remove Filter 2</button>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>
      <div>Active Filters: {activeFilters.length}</div>
    </div>
  );
}

describe("FilterContextProvider", () => {
  it("initially has an empty activeFilters array", () => {
    render(
      <FilterContextProvider keys={[]}>
        <FilterTestComponent />
      </FilterContextProvider>
    );

    const activeFiltersElement = screen.getByText("Active Filters: 0");
    expect(activeFiltersElement).toBeInTheDocument();
  });

  it("toggles items in activeFilters", () => {
    render(
      <FilterContextProvider keys={[]}>
        <FilterTestComponent />
      </FilterContextProvider>
    );

    const toggleButton1 = screen.getByText("Toggle Filter 1");
    const toggleButton2 = screen.getByText("Toggle Filter 2");

    fireEvent.click(toggleButton1);
    let activeFiltersElement = screen.getByText("Active Filters: 1");
    expect(activeFiltersElement).toBeInTheDocument();

    fireEvent.click(toggleButton2);
    activeFiltersElement = screen.getByText("Active Filters: 2");
    expect(activeFiltersElement).toBeInTheDocument();
  });

  it("removes items from activeFilters", () => {
    render(
      <FilterContextProvider keys={[]}>
        <FilterTestComponent />
      </FilterContextProvider>
    );

    const toggleButton1 = screen.getByText("Toggle Filter 1");
    const toggleButton2 = screen.getByText("Toggle Filter 2");
    const removeButton1 = screen.getByText("Remove Filter 1");
    const removeButton2 = screen.getByText("Remove Filter 2");

    fireEvent.click(toggleButton1);
    fireEvent.click(toggleButton2);

    let activeFiltersElement = screen.getByText("Active Filters: 2");
    expect(activeFiltersElement).toBeInTheDocument();

    fireEvent.click(removeButton1);
    activeFiltersElement = screen.getByText("Active Filters: 1");
    expect(activeFiltersElement).toBeInTheDocument();

    fireEvent.click(removeButton2);
    activeFiltersElement = screen.getByText("Active Filters: 0");
    expect(activeFiltersElement).toBeInTheDocument();
  });

  it("clears all filters from activeFilters", () => {
    render(
      <FilterContextProvider keys={[]}>
        <FilterTestComponent />
      </FilterContextProvider>
    );

    const toggleButton1 = screen.getByText("Toggle Filter 1");
    const toggleButton2 = screen.getByText("Toggle Filter 2");
    const clearButton = screen.getByText("Clear Filters");

    fireEvent.click(toggleButton1);
    fireEvent.click(toggleButton2);

    let activeFiltersElement = screen.getByText("Active Filters: 2");
    expect(activeFiltersElement).toBeInTheDocument();

    fireEvent.click(clearButton);
    activeFiltersElement = screen.getByText("Active Filters: 0");
    expect(activeFiltersElement).toBeInTheDocument();
  });
});
