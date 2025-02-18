import * as React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { LoanReport } from "../components/LoanReport";

describe("LoanReport", () => {
  it("renders without errors", () => {
    render(<LoanReport library="test-library" />);
    expect(screen.getByTestId("loan-stats")).toBeInTheDocument();
  });

  it("allows changing the start and end date", () => {
    render(<LoanReport library="test-library" />);
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    fireEvent.change(startDateInput, { target: { value: "2023-03-01" } });
    fireEvent.change(endDateInput, { target: { value: "2023-03-31" } });

    expect(startDateInput).toHaveValue("2023-03-01");
    expect(endDateInput).toHaveValue("2023-03-31");
  });

  it("does not crash when clicking download excel button", () => {
    const { getByTestId } = render(<LoanReport library="test-library" />);
    const downloadButton = getByTestId("download-excel-button");

    fireEvent.click(downloadButton);
  });

  it("does not crash when clicking download csv button", () => {
    const { getByTestId } = render(<LoanReport library="test-library" />);
    const downloadButton = getByTestId("download-csv-button");

    fireEvent.click(downloadButton);
  });
});
