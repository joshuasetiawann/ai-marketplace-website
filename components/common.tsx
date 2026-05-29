import Icon from "./Icon";

/** Decorative blurred cyan orb used behind hero/feature sections. */
export function GlowOrb({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -z-10 rounded-full bg-primary-container/10 blur-[120px] ${className}`}
    />
  );
}

/** Section heading with eyebrow, title, optional subtitle + action. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        {eyebrow && (
          <p className="mb-2 font-label text-label-sm uppercase tracking-widest text-primary-container">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-headline-md text-on-surface">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-body-md text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Empty / no-results state. */
export function EmptyState({
  icon = "search_off",
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.07] bg-surface-container-lowest/40 px-6 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-white/5 text-on-surface-variant">
        <Icon name={icon} size={30} />
      </span>
      <div>
        <h3 className="font-display text-title-md text-on-surface">{title}</h3>
        {message && <p className="mx-auto mt-2 max-w-sm text-body-sm text-on-surface-variant">{message}</p>}
      </div>
      {action}
    </div>
  );
}
