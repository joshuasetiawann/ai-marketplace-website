import Link from "next/link";
import Icon from "./Icon";

export default function Logo({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`flex items-center gap-2 group ${className}`} aria-label="Nexora AI home">
      <span className="relative flex items-center justify-center">
        <Icon
          name="hub"
          className="text-primary-container"
          size={28}
          style={{ filter: "drop-shadow(0 0 8px rgba(0,229,255,0.6))" }}
        />
      </span>
      {!compact && (
        <span className="font-display text-[22px] font-bold tracking-tight text-on-surface">
          Nexora <span className="text-primary-container">AI</span>
        </span>
      )}
    </Link>
  );
}
