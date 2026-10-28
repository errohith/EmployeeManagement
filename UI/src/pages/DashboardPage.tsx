import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeading } from "../components/PageHeading";
import { ReviewTable } from "../components/ReviewTable";
import { useEmployees } from "../hooks/useEmployees";
import { useReviews } from "../hooks/useReviews";

export function DashboardPage() {
  const employees = useEmployees();
  const reviews = useReviews({ limit: 1000 });
  const recentReviews = reviews.data?.slice(0, 5) ?? [];
  const averageRating = recentReviews.length
    ? (
        recentReviews.reduce((total, review) => total + review.average_rating, 0) /
        recentReviews.length
      ).toFixed(1)
    : "—";
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <>
      <PageHeading
        eyebrow={today.toUpperCase()}
        title="Good morning, team 👋"
        description="Here’s what’s happening across your performance reviews."
        action={
          <Link className="button button-primary" to="/reviews/new">
            <ClipboardCheck size={16} /> New review
          </Link>
        }
      />
      {employees.error && <Alert>{employees.error}</Alert>}
      {reviews.error && <Alert>{reviews.error}</Alert>}
      <section aria-label="Review overview" className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon stat-icon-blue"><Users size={18} /></span>
          <span className="stat-label">Total employees</span>
          {employees.loading ? (
            <span className="stat-value stat-loading">…</span>
          ) : (
            <strong className="stat-value">{employees.data?.length ?? "—"}</strong>
          )}
          <span className="stat-footnote">Across your organization</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-purple"><ClipboardList size={18} /></span>
          <span className="stat-label">Reviews recorded</span>
          {reviews.loading ? (
            <span className="stat-value stat-loading">…</span>
          ) : (
            <strong className="stat-value">
              {reviews.data ? `${reviews.data.length}${reviews.data.length === 1000 ? "+" : ""}` : "—"}
            </strong>
          )}
          <span className="stat-footnote">Across all review periods</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-amber"><Star size={18} /></span>
          <span className="stat-label">Average rating</span>
          <strong className="stat-value">
            {averageRating}
            <small>/ 5</small>
          </strong>
          <span className="stat-footnote">From the latest five reviews</span>
        </article>
        <Link className="stat-card stat-card-action" to="/reviews">
          <span className="stat-icon stat-icon-green"><ClipboardCheck size={18} /></span>
          <span className="stat-label">Review activity</span>
          <strong className="stat-value stat-action-value">View all</strong>
          <span className="stat-footnote">Browse submitted feedback <ArrowRight size={13} /></span>
        </Link>
      </section>
      <section className="panel dashboard-recent">
        <div className="panel-heading">
          <div>
            <h2>Recent reviews</h2>
            <p>Latest performance feedback from your team</p>
          </div>
          <Link className="subtle-link" to="/reviews">View all reviews <ArrowRight size={15} /></Link>
        </div>
        {reviews.error && <div className="inline-error">{reviews.error}</div>}
        {reviews.loading ? (
          <LoadingState label="Loading recent reviews…" />
        ) : recentReviews.length ? (
          <ReviewTable reviews={recentReviews} />
        ) : (
          <EmptyState title="No reviews yet" description="Create your first performance review to get started." />
        )}
      </section>
    </>
  );
}
