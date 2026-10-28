import { CalendarDays } from "lucide-react";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeading } from "../components/PageHeading";
import { useReviewPeriods } from "../hooks/useReviewPeriods";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewPeriodsPage() {
  const periods = useReviewPeriods();

  return (
    <>
      <PageHeading
        eyebrow="PERFORMANCE CYCLES"
        title="Review periods"
        description="View review windows and their current status."
      />
      <section className="panel">
        {periods.error && <Alert>{periods.error}</Alert>}
        {periods.loading ? (
          <LoadingState label="Loading review periods…" />
        ) : periods.data?.length ? (
          <div className="period-grid">
            {periods.data.map((period) => (
              <article className="period-card" key={period.id}>
                <span className="period-icon"><CalendarDays size={19} /></span>
                <span className={`period-status ${period.status.toLowerCase() === "open" ? "period-status-open" : ""}`}>
                  <span /> {period.status}
                </span>
                <h2>{period.name}</h2>
                <p>{formatDate(period.start_date)} <span>to</span> {formatDate(period.end_date)}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No review periods" description="There are no review periods to display." />
        )}
      </section>
    </>
  );
}
