const BRANDS = [
  "SYNTHETIX LABS",
  "AURA LABS",
  "HELIX SYSTEMS",
  "PIXELFORGE",
  "ECHOLABS",
  "NEURA STUDIO",
  "VANTA AI",
];

/** v2 scrolling creator-brand strip under the hero stats (docs/design/v2 frame "beranda"). */
export default function BrandMarquee() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <div
      aria-hidden
      className="relative overflow-hidden py-8 [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]"
    >
      <div className="flex w-max animate-marquee gap-14 motion-reduce:animate-none">
        {row.map((b, i) => (
          <span
            key={`${b}-${i}`}
            className="whitespace-nowrap font-mono text-[11px] tracking-[0.22em] text-on-surface-variant/50"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
