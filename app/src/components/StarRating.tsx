// Custom star rating widget (display, form input, and list filter).
// Stars are plain spans with SVG — no radio inputs, no aria attributes.
export function StarRating({
  value,
  onSelect,
  className,
}: {
  value: number;
  onSelect?: (n: number) => void;
  className?: string;
}) {
  return (
    <span className={'stars' + (className ? ' ' + className : '')}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={'star' + (n <= value ? ' filled' : '')}
          onClick={onSelect ? () => onSelect(n) : undefined}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M12 2.5l2.95 5.98 6.6.96-4.78 4.65 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z"
              fill={n <= value ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}
