import type { ReviewPeriod } from "../types/api";
import { useApiResource } from "./useApiResource";

export function useReviewPeriods() {
  return useApiResource<ReviewPeriod[]>("/review-periods");
}
