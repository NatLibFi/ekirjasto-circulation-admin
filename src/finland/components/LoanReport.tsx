import * as React from "react";
import { useState } from "react";
import { Button } from "library-simplified-reusable-components";

const DOWNLOAD_EXCEL_SLUG = "/admin/circulation_loan_statistics_excel";

interface LoanReportProps {
  library?: string;
}

const thisYear = new Date().toISOString().split("-")[0];

export function LoanReport({ library }: LoanReportProps) {
  const [startDate, setStartDate] = useState(`${thisYear}-01-01`);
  const [endDate, setEndDate] = useState(`${thisYear}-12-31`);

  function downloadLoanExcel() {
    const params = {
      date: startDate,
      dateEnd: endDate,
    };
    const queryString = new URLSearchParams(params).toString();

    const url = `/${library}${DOWNLOAD_EXCEL_SLUG}?${queryString}`;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div>
      <div className="input-wrapper">
        <div className="flex-col">
          <label htmlFor="start-date">Alkaen</label>
          <input
            className="form-control"
            type="date"
            id="start-date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="flex-col">
          <label htmlFor="end-date">Päättyen</label>
          <input
            className="form-control"
            type="date"
            id="end-date"
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>
      <Button
        className="inverted left-align"
        callback={downloadLoanExcel}
        content="Lataa Excel-taulukkona"
      />
    </div>
  );
}
