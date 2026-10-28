import { ArrowLeft, Check, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { LoadingState } from "../components/LoadingState";
import { PageHeading } from "../components/PageHeading";
import { RatingStars } from "../components/RatingStars";
import { api } from "../lib/api";
import type { Employee, Review, ReviewCreate } from "../types/api";
import { useEmployees } from "../hooks/useEmployees";
import { useReviewPeriods } from "../hooks/useReviewPeriods";

const initialRatings = {
  quality_rating: 0,
  delivery_rating: 0,
  teamwork_rating: 0,
};

const criteria = [
  { key: "quality_rating", label: "Quality of work", helper: "Accuracy, craft & attention to detail" },
  { key: "delivery_rating", label: "Delivery & ownership", helper: "Reliability, initiative & follow-through" },
  { key: "teamwork_rating", label: "Teamwork & collaboration", helper: "Communication, support & shared success" },
] as const;

export function ReviewFormPage() {
  const navigate = useNavigate();
  const employees = useEmployees();
  const periods = useReviewPeriods();
  const [employeeId, setEmployeeId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [ratings, setRatings] = useState(initialRatings);
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const availablePeriods = (periods.data ?? []).filter(
    (period) => period.status.toLowerCase() === "open",
  );
  const average =
    Object.values(ratings).every((rating) => rating > 0)
      ? (Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / 3).toFixed(2)
      : "—";

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!employeeId || !periodId || Object.values(ratings).some((rating) => rating === 0)) {
      setError("Choose an employee and open review period, then rate all three criteria.");
      return;
    }
    if (!comments.trim()) {
      setError("Please add overall comments before submitting.");
      return;
    }

    const payload: ReviewCreate = {
      employee_id: Number(employeeId),
      period_id: Number(periodId),
      ...ratings,
      comments: comments.trim(),
    };

    setSubmitting(true);
    try {
      const created = await api.post<Review>("/reviews", payload);
      navigate(`/reviews/${created.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit this review.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setEmployeeId("");
    setPeriodId("");
    setRatings(initialRatings);
    setComments("");
    setError(null);
  }

  const initialLoading = employees.loading || periods.loading;

  return (
    <>
      <PageHeading
        eyebrow="PERFORMANCE CYCLE"
        title="Submit a performance review"
        description="Share thoughtful feedback to support your team’s growth."
        action={<Link className="button button-secondary" to="/reviews"><ArrowLeft size={15} /> Review history</Link>}
      />
      {employees.error && <Alert>{employees.error}</Alert>}
      {periods.error && <Alert>{periods.error}</Alert>}
      {error && <Alert>{error}</Alert>}
      {initialLoading ? (
        <section className="panel form-panel"><LoadingState label="Loading employees and review periods…" /></section>
      ) : (
        <form className="review-form-layout" onSubmit={submitReview}>
          <section className="panel form-panel">
            <div className="panel-heading form-panel-heading">
              <div>
                <span className="step-label"><span>01</span> REVIEW SETUP</span>
                <h2>Who are you reviewing?</h2>
                <p>Choose a team member and an open review period.</p>
              </div>
              <span className="step-complete"><Check size={14} /> Required</span>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Employee <b>*</b></span>
                <select
                  onChange={(event) => setEmployeeId(event.target.value)}
                  required
                  value={employeeId}
                >
                  <option value="">Select an employee</option>
                  {(employees.data ?? []).map((employee: Employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.employee_id} · {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Review period <b>*</b></span>
                <select
                  onChange={(event) => setPeriodId(event.target.value)}
                  required
                  value={periodId}
                >
                  <option value="">Select an open period</option>
                  {availablePeriods.map((period) => (
                    <option key={period.id} value={period.id}>{period.name}</option>
                  ))}
                </select>
                {!periods.error && availablePeriods.length === 0 && (
                  <small className="field-hint">There are no open review periods right now.</small>
                )}
              </label>
            </div>
            <div className="section-divider" />
            <div className="ratings-heading">
              <div>
                <span className="step-label"><span>02</span> PERFORMANCE</span>
                <h2>Rate the performance</h2>
              </div>
              <span className="rating-scale">1 = Needs improvement · 5 = Exceptional</span>
            </div>
            <div className="rating-input-list">
              {criteria.map(({ key, label, helper }) => (
                <div className="rating-input-row" key={key}>
                  <div className="rating-input-copy">
                    <strong>{label} <b>*</b></strong>
                    <span>{helper}</span>
                  </div>
                  <RatingStars
                    label={label}
                    onChange={(value) => setRatings((current) => ({ ...current, [key]: value }))}
                    value={ratings[key]}
                  />
                </div>
              ))}
            </div>
            <div className="section-divider" />
            <label className="form-field comments-field">
              <span>Overall comments <b>*</b></span>
              <span className="field-description">Share a specific example, strength, or area for growth.</span>
              <textarea
                maxLength={2000}
                onChange={(event) => setComments(event.target.value)}
                placeholder="What went well? Where could they grow? Add helpful context…"
                required
                rows={5}
                value={comments}
              />
              <span className="character-count">{comments.length} / 2,000</span>
            </label>
            <div className="form-actions">
              <button className="button button-secondary" onClick={resetForm} type="button">Reset form</button>
              <button className="button button-primary" disabled={submitting || availablePeriods.length === 0} type="submit">
                {submitting ? <span className="button-spinner" /> : <Send size={15} />}
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </section>
          <aside className="review-aside">
            <div className="panel review-preview">
              <span className="step-label">REVIEW SUMMARY</span>
              <h2>At a glance</h2>
              <div className="preview-person">
                <span className="preview-avatar">
                  {(employees.data ?? []).find((employee) => String(employee.id) === employeeId)?.name.slice(0, 1) ?? "?"}
                </span>
                <span>
                  <strong>
                    {(employees.data ?? []).find((employee) => String(employee.id) === employeeId)?.name ?? "Select an employee"}
                  </strong>
                  <small>
                    {(employees.data ?? []).find((employee) => String(employee.id) === employeeId)?.department ?? "Employee"}
                  </small>
                </span>
              </div>
              <div className="preview-detail">
                <span>Review period</span>
                <strong>{availablePeriods.find((period) => String(period.id) === periodId)?.name ?? "Not selected"}</strong>
              </div>
              <div className="preview-total">
                <span>Overall rating</span>
                <strong>{average}<small> / 5</small></strong>
              </div>
              <p className="preview-note">Your feedback is saved securely and shared with the employee’s manager.</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon"><Check size={16} /></span>
              <strong>Make feedback meaningful</strong>
              <p>Be specific, balanced, and focus on behaviors that help your teammate grow.</p>
            </div>
          </aside>
        </form>
      )}
    </>
  );
}
