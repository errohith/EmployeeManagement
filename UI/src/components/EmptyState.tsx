import { ClipboardList } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  description = "Try changing the filters or check back later.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <ClipboardList size={22} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
