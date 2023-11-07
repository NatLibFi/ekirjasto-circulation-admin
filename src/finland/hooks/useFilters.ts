import { useContext } from "react";
import { FilterContext, FilterContextType } from "../FilterContext";

// Provide context through custom hook to ease mocking in automated testing
export function useFilters(): FilterContextType {
  const context = useContext(FilterContext);
  return context;
}
