import Icon from "./Icon";

export default function StarRating({
  value = 0,
  size = 16,
  showValue = false,
  count,
  single = false,
  className = "",
}: {
  value?: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  /** v2 card/header anatomy: one gold star + value instead of a 5-star row. */
  single?: boolean;
  className?: string;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  if (single) {
    return (
      <span className={`flex items-center gap-1 ${className}`}>
        <Icon name="star" size={size} fill className="text-secondary" />
        <span className="font-label text-label-sm text-on-surface">
          {value.toFixed(1).replace(".", ",")}
        </span>
        {count != null && (
          <span className="font-label text-label-sm text-on-surface-variant">
            ({count.toLocaleString("id-ID")})
          </span>
        )}
      </span>
    );
  }
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
      {showValue && (
        <span className="font-label text-label-sm text-on-surface">{value.toFixed(1).replace(".", ",")}</span>
      )}
      {count != null && (
        <span className="font-label text-label-sm text-on-surface-variant">({count.toLocaleString("id-ID")})</span>
      )}
    </div>
  );
}
