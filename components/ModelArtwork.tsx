import Icon from "./Icon";

// Deterministic, self-contained abstract SVG artwork for model thumbnails.
// Seed + two color stops -> an on-brand "generative AI" visual. Fully
// deterministic (no Math.random) so SSR and client markup match.

function makeRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ModelArtwork({
  seed = "nexora",
  colors = ["#0b3a44", "#00e5ff"],
  className = "",
  icon,
}: {
  seed?: string;
  colors?: string[];
  className?: string;
  icon?: string;
}) {
  const rnd = makeRng(seed);
  const gid = "g" + Math.abs(Math.floor(rnd() * 1e9));
  const rings = Array.from({ length: 3 }, (_, i) => ({
    cx: 30 + rnd() * 140,
    cy: 20 + rnd() * 90,
    r: 30 + i * 26 + rnd() * 20,
    o: 0.08 + rnd() * 0.12,
  }));
  const blobs = Array.from({ length: 3 }, () => ({
    cx: rnd() * 200,
    cy: rnd() * 130,
    r: 40 + rnd() * 70,
    o: 0.12 + rnd() * 0.22,
  }));
  const lines = Array.from({ length: 5 }, () => {
    const x1 = rnd() * 200;
    const y1 = rnd() * 130;
    return { x1, y1, x2: x1 + (rnd() - 0.5) * 120, y2: y1 + (rnd() - 0.5) * 90, o: 0.1 + rnd() * 0.25 };
  });
  const dots = Array.from({ length: 14 }, () => ({
    cx: rnd() * 200,
    cy: rnd() * 130,
    r: 0.6 + rnd() * 1.8,
    o: 0.2 + rnd() * 0.6,
  }));
  const [c0, c1] = colors;

  return (
    // decorative — the surrounding link/card carries the accessible name
    <div aria-hidden className={`relative overflow-hidden ${className}`}>
      <svg viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
        <defs>
          <radialGradient id={`${gid}-bg`} cx="65%" cy="20%" r="90%">
            <stop offset="0%" stopColor={c1} stopOpacity="0.32" />
            <stop offset="45%" stopColor={c0} stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="1" />
          </radialGradient>
          <linearGradient id={`${gid}-line`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </linearGradient>
          <filter id={`${gid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <rect width="200" height="130" fill="#0a0a0a" />
        <rect width="200" height="130" fill={`url(#${gid}-bg)`} />

        <g filter={`url(#${gid}-blur)`}>
          {blobs.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={c1} opacity={b.o} />
          ))}
        </g>
        <g fill="none" stroke={c1}>
          {rings.map((r, i) => (
            <circle key={i} cx={r.cx} cy={r.cy} r={r.r} strokeOpacity={r.o} strokeWidth="0.8" />
          ))}
        </g>
        <g stroke={`url(#${gid}-line)`} strokeWidth="0.6">
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeOpacity={l.o} />
          ))}
        </g>
        <g fill={c1}>
          {dots.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} opacity={d.o} />
          ))}
        </g>
      </svg>

      {icon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Icon name={icon} size={42} strokeWidth={1.5} className="text-white/90" style={{ filter: `drop-shadow(0 0 14px ${c1})` }} />
        </div>
      )}
    </div>
  );
}
