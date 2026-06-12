import Icon from "./Icon";

const STATUS: Record<string, { label: string; icon: string; cls: string }> = {
  trending: {
    label: "Trending",
    icon: "bolt",
    cls: "bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,229,255,0.35)]",
  },
  verified: {
    label: "Verified",
    icon: "verified",
    cls: "border border-success/35 bg-success/10 text-success backdrop-blur-md",
  },
  new: { label: "New", icon: "auto_awesome", cls: "bg-secondary/90 text-on-secondary" },
};

export function StatusBadge({ type, className = "" }: { type?: string; className?: string }) {
  const s = type ? STATUS[type] : undefined;
  if (!s) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${s.cls} ${className}`}
    >
      <Icon name={s.icon} size={12} fill />
      {s.label}
    </span>
  );
}

export function TierBadge({ tier, className = "" }: { tier?: string; className?: string }) {
  if (!tier) return null;
  const map: Record<string, string> = {
    Free: "tier-pill-free",
    Pro: "tier-pill-pro",
    Enterprise: "tier-pill-enterprise",
  };
  return (
    <span className={`tier-pill ${map[tier] || map.Free} ${className}`}>
      {tier === "Enterprise" && <Icon name="workspace_premium" size={12} fill />}
      {tier === "Pro" && <Icon name="bolt" size={12} fill />}
      {tier}
    </span>
  );
}
