import * as React from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { KeyValuePair, Timeframe, timeframeOptions } from "./finlandUtils";

// Context & provider for facet filters
export const FilterContext = createContext({} as FilterContextType);

export type FilterContextType = {
  activeFilters: KeyValuePair[];
  toggleFilter: (selection: KeyValuePair) => void;
  removeFilter: (selection: KeyValuePair) => void;
  clearFilters: () => void;
  startDate: string;
  endDate: string;
  setStartDate: (newDate: string) => void;
  setEndDate: (newDate: string) => void;
  activeTimeframe: Timeframe;
  setActiveTimeframe: (newTimeframe: Timeframe) => void;
  timeframeOffset: number;
  setTimeframeOffset: (amount: number) => void;
};

type FilterEventType = "INIT" | "REMOVE" | "TOGGLE";

function filterReducer(
  state: KeyValuePair[],
  action: { type: FilterEventType; selection?: KeyValuePair }
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

type ProviderProps = {
  children: React.ReactNode;
  keys: string[];
};

export function FilterContextProvider({ children, keys }: ProviderProps) {
  const [activeFilters, dispatch] = useReducer(
    filterReducer,
    [] as KeyValuePair[]
  );
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("day");
  const [timeframeOffset, setTimeframeOffset] = useState(0);

  useEffect(() => {
    if (keys?.length) {
      dispatch({ type: "INIT" });
    }
  }, [keys]);

  const handleSetStartDate = (newDate: string) => {
    setStartDate(newDate);
    if (endDate < newDate) {
      setEndDate(newDate);
    }
    setTimeframeOffset(0);
    setActiveTimeframe(null);
  };

  const handleSetEndDate = (newDate: string) => {
    setEndDate(newDate);
    setTimeframeOffset(0);
    setActiveTimeframe(null);
  };

  const toggleFilter = useCallback((selection: KeyValuePair) => {
    dispatch({ type: "TOGGLE", selection });
  }, []);

  const removeFilter = useCallback((selection: KeyValuePair) => {
    dispatch({ type: "REMOVE", selection });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "INIT" });
  }, []);

  function handleSetActiveTimeframe(timeframe: Timeframe) {
    setActiveTimeframe(timeframe);
    setTimeframeOffset(0);
    const { firstDay, lastDay } = timeframeOptions[timeframe].getDateRange();
    setStartDate(firstDay);
    setEndDate(lastDay);
  }

  function handleSetTimeframeOffset(amount: number) {
    const newOffset = timeframeOffset + amount;
    setTimeframeOffset(newOffset);
    const { firstDay, lastDay } = timeframeOptions[
      activeTimeframe
    ].getDateRange(newOffset);
    setStartDate(firstDay);
    setEndDate(lastDay);
  }

  return (
    <FilterContext.Provider
      value={{
        activeFilters,
        toggleFilter,
        removeFilter,
        clearFilters,
        startDate,
        endDate,
        setStartDate: handleSetStartDate,
        setEndDate: handleSetEndDate,
        activeTimeframe,
        setActiveTimeframe: handleSetActiveTimeframe,
        timeframeOffset,
        setTimeframeOffset: handleSetTimeframeOffset,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
