import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  label: string;
}

export function RatingStars({ value, onChange, label }: RatingStarsProps) {
  return (
    <div className="rating-stars" role={onChange ? "radiogroup" : undefined} aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const selected = rating <= value;
        return onChange ? (
          <button
            aria-checked={value === rating}
            aria-label={`${rating} out of 5`}
            className={`star-button${selected ? " star-filled" : ""}`}
            key={rating}
            onClick={() => onChange(rating)}
            role="radio"
            type="button"
          >
            <Star size={20} fill={selected ? "currentColor" : "none"} />
          </button>
        ) : (
          <Star
            aria-hidden="true"
            className={selected ? "star-display-filled" : "star-display-empty"}
            fill={selected ? "currentColor" : "none"}
            key={rating}
            size={18}
          />
        );
      })}
      {onChange && <span className="rating-count">{value}/5</span>}
    </div>
  );
}
