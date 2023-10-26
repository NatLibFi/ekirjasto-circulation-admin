import * as React from "react";
import { KeyValuePair, readable } from "../finlandUtils";

type ChipProps = {
  onClick: () => void;
  isSingle?: boolean;
  children: React.ReactNode;
};

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
          <Chip key="clear" onClick={() => clearFilters()}>
            poista kaikki
          </Chip>
        </>
      )}
    </div>
  );
}

function Chip({ onClick, children, isSingle = false }: ChipProps) {
  return (
    <button
      className={isSingle ? "chip chip-single" : "chip"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
