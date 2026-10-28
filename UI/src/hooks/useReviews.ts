import { useApiResource } from "./useApiResource";
import type { Review, ReviewFilters } from "../types/api";

export function useReviews(filters: ReviewFilters = {}) {
  const query = new URLSearchParams();
  if (filters.employeeId !== undefined) {
    query.set("employee_id", String(filters.employeeId));
  }
  if (filters.periodId !== undefined) {
    query.set("period_id", String(filters.periodId));
  }
  query.set("limit", String(filters.limit ?? 10));
  query.set("offset", String(filters.offset ?? 0));

  return useApiResource<Review[]>(`/reviews?${query.toString()}`);
}
