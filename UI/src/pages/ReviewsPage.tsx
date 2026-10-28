import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeading } from "../components/PageHeading";
import { ReviewTable } from "../components/ReviewTable";
import { useEmployees } from "../hooks/useEmployees";
import { useReviewPeriods } from "../hooks/useReviewPeriods";
import { useReviews } from "../hooks/useReviews";

const PAGE_SIZE = 10;

export function ReviewsPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [appliedEmployeeId, setAppliedEmployeeId] = useState<number | undefined>();
  const [appliedPeriodId, setAppliedPeriodId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const employees = useEmployees();
  const periods = useReviewPeriods();
  const reviews = useReviews({
    employeeId: appliedEmployeeId,
    periodId: appliedPeriodId,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedEmployeeId(employeeId ? Number(employeeId) : undefined);
    setAppliedPeriodId(periodId ? Number(periodId) : undefined);
    setPage(0);
  }

  return (
    <>
      <PageHeading
        eyebrow="PERFORMANCE"
        title="Review history"
        description="Browse and filter submitted performance reviews."
        action={
          <Link className="button button-primary" to="/reviews/new">
            <span>+</span> Submit a review
          </Link>
        }
      />
      <section className="panel">
        <form className="filter-bar" onSubmit={applyFilters}>
          <div className="filter-title"><Filter size={16} /> Find a review</div>
          <label className="filter-field">
            <span>Review period</span>
            <select
              onChange={(event) => setPeriodId(event.target.value)}
              value={periodId}
            >
              <option value="">All periods</option>
              {(periods.data ?? []).map((period) => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Employee</span>
            <select
              onChange={(event) => setEmployeeId(event.target.value)}
              value={employeeId}
            >
              <option value="">All employees</option>
              {(employees.data ?? []).map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employee_id} · {employee.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-primary filter-submit" type="submit">
            <Search size={15} /> Apply filters
          </button>
        </form>
        {employees.error && <Alert>{employees.error}</Alert>}
        {periods.error && <Alert>{periods.error}</Alert>}
        {reviews.error && <Alert>{reviews.error}</Alert>}
        {reviews.loading ? (
          <LoadingState label="Loading reviews…" />
        ) : reviews.data?.length ? (
          <>
            <ReviewTable reviews={reviews.data} />
            <div className="table-footer">
              <span>
                Showing {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + reviews.data.length}
                {reviews.data.length === PAGE_SIZE ? "+" : ""} reviews
              </span>
              <div className="pagination">
                <button
                  aria-label="Previous page"
                  className="pagination-button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pagination-current">{page + 1}</span>
                <button
                  aria-label="Next page"
                  className="pagination-button"
                  disabled={reviews.data.length < PAGE_SIZE}
                  onClick={() => setPage((current) => current + 1)}
                  type="button"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="No matching reviews" description="Try another employee or review period." />
        )}
      </section>
    </>
  );
}
