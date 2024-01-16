import * as React from "react";
import {
  getNumericDateWithYearAndWeekday,
  getNumericDateWithYear,
  timeframeOptions,
  Timeframe,
} from "../finlandUtils";

type DateRangeHeaderProps = {
  activeTimeframe: Timeframe | null;
  startDate: string;
  endDate: string;
};

export function DateRangeHeader({
  activeTimeframe,
  startDate,
  endDate,
}: DateRangeHeaderProps) {
  function getDateRangeLabel() {
    if (activeTimeframe) {
      return timeframeOptions[activeTimeframe].getDateRangeLabel(startDate);
    }
    if (startDate === endDate) {
      return getNumericDateWithYearAndWeekday(new Date(startDate));
    }
    return `${getNumericDateWithYear(
      new Date(startDate)
    )} – ${getNumericDateWithYear(new Date(endDate))}`;
  }

  return <h3 className="chart-label text-center">{getDateRangeLabel()}</h3>;
}
