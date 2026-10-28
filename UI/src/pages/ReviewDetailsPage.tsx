import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { LoadingState } from "../components/LoadingState";
import { PageHeading } from "../components/PageHeading";
import { RatingSummary } from "../components/RatingSummary";
import { useApiResource } from "../hooks/useApiResource";
import type { Review } from "../types/api";

export function ReviewDetailsPage() {
  const { reviewId } = useParams();
  const review = useApiResource<Review>(`/reviews/${reviewId}`);

  return (
    <>
      <PageHeading
        eyebrow="PERFORMANCE · REVIEW DETAILS"
        title="Review details"
        description="A closer look at the submitted feedback and performance criteria."
        action={<Link className="button button-secondary" to="/reviews"><ArrowLeft size={15} /> Back to history</Link>}
      />
      {review.error && <Alert>{review.error}</Alert>}
      {review.loading ? (
        <section className="panel"><LoadingState label="Loading review…" /></section>
      ) : review.data ? (
        <div className="details-layout">
          <section className="details-main">
            <article className="panel details-summary">
              <div className="details-summary-top">
                <div className="details-employee">
                  <span className="details-avatar">{review.data.employee_name?.slice(0, 1) ?? "?"}</span>
                  <div>
                    <span className="eyebrow">EMPLOYEE</span>
                    <h2>{review.data.employee_name}</h2>
                    <span className="employee-code">{review.data.employee_code}</span>
                  </div>
                </div>
                <span className="status-badge"><span /> Completed</span>
              </div>
              <div className="details-meta-grid">
                <div className="meta-card">
                  <span><CalendarDays size={14} /> REVIEW PERIOD</span>
                  <strong>{review.data.period_name}</strong>
                </div>
                <div className="meta-card">
                  <span><UserRound size={14} /> REVIEW SUBMITTED</span>
                  <strong>{new Date(review.data.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</strong>
                </div>
                <div className="meta-card overall-meta">
                  <span>OVERALL RATING</span>
                  <strong>{review.data.average_rating.toFixed(1)}<small> / 5</small></strong>
                </div>
              </div>
            </article>
            <article className="panel details-criteria">
              <div className="panel-heading">
                <div>
                  <span className="step-label">PERFORMANCE REVIEW</span>
                  <h2>Performance criteria</h2>
                  <p>Ratings across the three core competencies</p>
                </div>
              </div>
              <RatingSummary review={review.data} />
            </article>
          </section>
          <aside className="panel comments-card">
            <span className="step-label">WRITTEN FEEDBACK</span>
            <h2>Manager comments</h2>
            <div className="quote-mark">“</div>
            <blockquote>{review.data.comments}</blockquote>
            <div className="comment-author">
              <span className="comment-avatar">PT</span>
              <span><strong>People team</strong><small>Review submitted</small></span>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
