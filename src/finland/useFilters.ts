import { useCallback, useEffect, useReducer, useState } from "react";
import { EventKey, IEvent, groupBy } from "./finlandUtils";

type FilterEventType = "INIT" | "REMOVE" | "TOGGLE";
export type Selection = { key: EventKey; value: string };
export type Params = { key: string; value: string }[];
export type ActiveFilters = Selection[];

function filterReducer(
  state: ActiveFilters,
  action: { type: FilterEventType; selection?: Selection }
) {
  switch (action.type) {
    case "INIT":
      return [];
    case "REMOVE":
      return state.filter(
        (item) =>
          item.key !== action.selection.key &&
          item.value !== action.selection.value
      );
    case "TOGGLE":
      if (
        state.some(
          (item) =>
            item.key === action.selection.key &&
            item.value === action.selection.value
        )
      ) {
        return state.filter(
          (item) =>
            !(
              item.key === action.selection.key &&
              item.value === action.selection.value
            )
        );
      }
      return [...state, action.selection];
    default:
      return state;
  }
}

const today = new Date().toISOString().split("T")[0];

export function useFilters(keys: string[]) {
  const [activeFilters, dispatch] = useReducer(
    filterReducer,
    [] as Selection[]
  );
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    if (keys?.length) {
      dispatch({ type: "INIT" });
    }
  }, [keys]);

  const toggleFilter = useCallback((selection: Selection) => {
    dispatch({ type: "TOGGLE", selection });
  }, []);

  const removeFilter = useCallback((selection: Selection) => {
    dispatch({ type: "REMOVE", selection });
  }, []);

  const checkFilters = useCallback(
    (event: IEvent) => {
      const filterBuckets: Record<string, Selection[]> = groupBy(
        activeFilters,
        "key"
      );
      return Object.entries(filterBuckets).every(([key, selections]) => {
        const value = event[key as EventKey];
        return Array.isArray(value)
          ? selections.some((item) =>
              value.some((subValue) => subValue === item.value)
            )
          : selections.some((item) => value === item.value);
      });
    },
    [activeFilters]
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: "INIT" });
  }, []);

  return {
    activeFilters,
    toggleFilter,
    removeFilter,
    checkFilters,
    clearFilters,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  };
}
