import Icon from "./Icon";

export default function StarRating({
  value = 0,
  size = 16,
  showValue = false,
  count,
  className = "",
}: {
  value?: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center text-secondary">
        {Array.from({ length: 5 }).map((_, i) => {
          const name = i < full ? "star" : i === full && half ? "star_half" : "star";
          const muted = i >= full && !(i === full && half);
          return (
            <Icon
              key={i}
              name={name}
              size={size}
              fill={!muted}
              className={muted ? "text-white/15" : "text-secondary"}
            />
          );
        })}
      </div>
      {showValue && <span className="font-label text-label-sm text-on-surface">{value.toFixed(1)}</span>}
      {count != null && (
        <span className="font-label text-label-sm text-on-surface-variant">({count.toLocaleString("id-ID")})</span>
      )}
    </div>
  );
}
