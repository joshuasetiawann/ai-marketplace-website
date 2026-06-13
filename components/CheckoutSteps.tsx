const STEPS = ["Keranjang", "Pembayaran", "Selesai"];

/** v2 checkout progress indicator (docs/design/v2 frame "cart"). */
export default function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Langkah checkout">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-6 bg-white/10 sm:w-10" aria-hidden />}
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] ${
                active
                  ? "bg-primary-container text-on-primary-container shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                  : done
                    ? "bg-primary-container/20 text-primary-container"
                    : "border border-white/15 text-on-surface-variant"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {n}
            </span>
            <span
              className={`text-body-sm ${active ? "font-medium text-primary-container" : "text-on-surface-variant"} max-sm:hidden`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
