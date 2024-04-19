import * as React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { FilterInputs } from "../components/FilterInputs";
import { facetDataFixture } from "./fixtures";
import { filterKeys } from "../finlandUtils";

function doNothing() {
  /* do nothing */
}

const facetData = facetDataFixture.facets;

afterAll(() => {
  jest.resetAllMocks();
});

describe("FilterInputs", () => {
  it("renders the component with filter inputs", () => {
    render(
      <FilterInputs
        toggleFilter={doNothing}
        facetData={facetData}
        startDate=""
        setStartDate={doNothing}
        endDate=""
        setEndDate={doNothing}
        filterToOptions={() => []}
      />
    );

    // Loop through filter keys and ensure that corresponding elements are present
    for (const key of filterKeys) {
      const selectElement = document.querySelector(`#${key}`);
      expect(selectElement).toBeInTheDocument();
    }
  });

  it("triggers toggleFilter when a filter is selected", async () => {
    const firstSelectId = filterKeys[0];
    const firstOption = facetDataFixture.facets[firstSelectId].buckets[0].key;

    const toggleFilterMock = jest.fn();
    render(
      <FilterInputs
        toggleFilter={toggleFilterMock}
        facetData={facetData}
        startDate=""
        setStartDate={doNothing}
        endDate=""
        setEndDate={doNothing}
        filterToOptions={(_, buckets) =>
          buckets.map((item) => ({
            value: item.key,
            name: item.key,
          }))
        }
      />
    );

    // Simulate selecting a filter option
    const selectSearch = document.querySelector(`#${firstSelectId}`);

    const searchableInput = selectSearch.querySelector("input");

    fireEvent.focus(searchableInput);
    fireEvent.change(searchableInput, { target: { value: firstOption } });

    const optionToSelect = screen.getByText(firstOption);
    fireEvent.mouseDown(optionToSelect);

    // Verify that toggleFilter is called with the expected parameters
    expect(toggleFilterMock).toHaveBeenCalledWith({
      key: firstSelectId,
      value: firstOption,
    });
  });

  it("triggers setStartDate and setEndDate when date inputs change", () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();

    render(
      <FilterInputs
        toggleFilter={doNothing}
        facetData={facetData}
        startDate="2023-01-01"
        setStartDate={setStartDateMock}
        endDate="2023-12-31"
        setEndDate={setEndDateMock}
        filterToOptions={() => []}
      />
    );

    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    fireEvent.change(startDateInput, { target: { value: "2023-02-15" } });
    fireEvent.change(endDateInput, { target: { value: "2023-12-15" } });

    // Verify that setStartDate setEndDate get called with the updated value
    expect(setStartDateMock).toHaveBeenCalledWith("2023-02-15");
    expect(setEndDateMock).toHaveBeenCalledWith("2023-12-15");
  });
});
