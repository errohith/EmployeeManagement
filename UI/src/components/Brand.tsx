export function Brand() {
  return (
    <div aria-label="Testleaf — Always Ahead" className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg
          aria-hidden="true"
          fill="none"
          viewBox="0 0 32 42"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 2.5 29 15v12.5L16 39.5 3 27.5V15L16 2.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.1"
          />
          <path
            d="M16 4v33M4 15l12 8 12-8M4 22l12 8 12-8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span className="brand-copy">
        <span className="brand-name">Testleaf</span>
        <span className="brand-tagline">Always Ahead</span>
      </span>
    </div>
  );
}
