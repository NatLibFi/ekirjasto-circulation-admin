import { BucketItem } from "../OpenSearchAnalyticsContext";
import { loanDurationOptions } from "../finlandUtils";

export function mockFilterToOptions(filterKey: string, buckets?: BucketItem[]) {
  if (filterKey === "duration") {
    return [...loanDurationOptions];
  }
  if (!buckets?.length) {
    return [];
  }
  return buckets
    .map((item) => ({
      value: item.key,
      name: item.key,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
