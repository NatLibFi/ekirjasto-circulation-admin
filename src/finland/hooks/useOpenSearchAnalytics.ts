import { useContext } from "react";
import {
  OpenSearchAnalyticsContext,
  OpenSearchAnalyticsContextType,
} from "../OpenSearchAnalyticsContext";

// Provide context through custom hook to ease mocking in automated testing
export function useOpenSearchAnalytics(): OpenSearchAnalyticsContextType {
  const context = useContext(OpenSearchAnalyticsContext);
  return context;
}
