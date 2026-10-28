import type { Review } from "../types/api";
import { RatingStars } from "./RatingStars";

export const ratingCriteria = [
  { key: "quality_rating", label: "Quality of Work" },
  { key: "delivery_rating", label: "Delivery & Ownership" },
  { key: "teamwork_rating", label: "Teamwork & Collaboration" },
] as const;

export function RatingSummary({ review }: { review: Review }) {
  return (
    <div className="criteria-list">
      {ratingCriteria.map(({ key, label }) => (
        <div className="criteria-row" key={key}>
          <span>{label}</span>
          <RatingStars label={`${label}: ${review[key]} out of 5`} value={review[key]} />
        </div>
      ))}
    </div>
  );
}
