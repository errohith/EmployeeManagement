import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Review } from "../types/api";

export function ReviewTable({ reviews }: { reviews: Review[] }) {
  return (
    <div className="table-scroll">
      <table className="review-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee name</th>
            <th>Period</th>
            <th>Ratings</th>
            <th>Average</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td className="employee-code">{review.employee_code}</td>
              <td>
                <span className="table-person">
                  <span className="person-avatar">
                    {review.employee_name?.slice(0, 1) ?? "?"}
                  </span>
                  {review.employee_name ?? "Employee"}
                </span>
              </td>
              <td>{review.period_name}</td>
              <td className="rating-cell">
                {review.quality_rating}, {review.delivery_rating},{" "}
                {review.teamwork_rating}
              </td>
              <td>
                <span className="average-pill">
                  {review.average_rating.toFixed(1)}
                </span>
              </td>
              <td>
                <span className="status-badge">
                  <span />
                  Completed
                </span>
              </td>
              <td>
                <Link
                  aria-label={`View review for ${review.employee_name ?? "employee"}`}
                  className="table-link"
                  to={`/reviews/${review.id}`}
                >
                  View <ArrowUpRight aria-hidden="true" size={13} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
