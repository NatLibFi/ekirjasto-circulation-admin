import * as React from "react";
import { Timeframe, timeframeOptions } from "../finlandUtils";

type TimeframeSelectorProps = {
  activeTimeframe: Timeframe;
  handleTimeframeClick: (timeframe: Timeframe) => void;
  handleOffsetChange: (amount: number) => void;
};

export function TimeframeSelector({
  handleTimeframeClick,
  activeTimeframe,
  handleOffsetChange,
}: TimeframeSelectorProps) {
  return (
    <div className="timeframe-button-wrapper">
      {Object.entries(timeframeOptions).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => handleTimeframeClick(key as Timeframe)}
          className={
            activeTimeframe === key
              ? "timeframe-button active"
              : "timeframe-button"
          }
        >
          {label}
        </button>
      ))}
      {/* Back and forth buttons */}
      {!!activeTimeframe && (
        <span>
          <button
            className="timeframe-offset-button"
            onClick={() => handleOffsetChange(-1)}
          >
            －
          </button>
          <button
            className="timeframe-offset-button"
            onClick={() => handleOffsetChange(1)}
          >
            ＋
          </button>
        </span>
      )}
    </div>
  );
}
