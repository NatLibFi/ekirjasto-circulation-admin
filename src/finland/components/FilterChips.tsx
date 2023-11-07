import * as React from "react";
import { KeyValuePair, readable } from "../finlandUtils";

type FilterChipsProps = {
  activeFilters: KeyValuePair[];
  toggleFilter: (selection: KeyValuePair) => void;
  clearFilters: () => void;
};

export function FilterChips({
  activeFilters,
  toggleFilter,
  clearFilters,
}: FilterChipsProps) {
  return (
    <div className="chip-container">
      {!!activeFilters.length && (
        <>
          {activeFilters.map((item) => (
            <Chip
              key={`${item.key}${item.value}`}
              onClick={() => toggleFilter(item)}
              isSingle
            >
              {readable(item.key)}: {item.value}
            </Chip>
          ))}
          <Chip
            key="clear"
            data-testid="clear-all"
            onClick={() => clearFilters()}
          >
            poista kaikki
          </Chip>
        </>
      )}
    </div>
  );
}

type ChipProps = {
  onClick: () => void;
  isSingle?: boolean;
  children: React.ReactNode;
  "data-testid"?: string;
};

function Chip({
  onClick,
  children,
  isSingle = false,
  "data-testid": testId,
}: ChipProps) {
  return (
    <button
      className={isSingle ? "chip chip-single" : "chip"}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </button>
  );
}
