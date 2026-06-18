import Icon from "./Icon";

// v2 artwork — matches docs/design/v2 mockup frames: a focal radial glow at
// 62% 22% fading to near-black (#08090b), thin concentric rings around the
// glow, sparse dot particles, a faint blueprint grid, and a centered outline
// icon. Gradient is keyed by product category (Global Constraints table in
// docs/superpowers/plans/2026-07-02-nexora-v2-redesign.md); products without a
// known category derive the same composition from their own art colors.
// Fully deterministic (seeded rng, no Math.random) so SSR and client match.

const CATEGORY_ART: Record<string, { tint: string; deep: string; accent: string }> = {
  vision: { tint: "rgba(0,229,255,0.34)", deep: "rgba(11,58,68,0.62)", accent: "#00e5ff" },
  video: { tint: "rgba(168,85,247,0.32)", deep: "rgba(42,14,58,0.62)", accent: "#a855f7" },
  code: { tint: "rgba(59,130,246,0.34)", deep: "rgba(16,35,58,0.62)", accent: "#3b82f6" },
  data: { tint: "rgba(52,211,153,0.30)", deep: "rgba(7,39,31,0.62)", accent: "#34d399" },
  language: { tint: "rgba(99,102,241,0.32)", deep: "rgba(30,27,75,0.62)", accent: "#6366f1" },
  audio: { tint: "rgba(34,211,238,0.30)", deep: "rgba(11,58,68,0.62)", accent: "#22d3ee" },
};

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

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export default function ModelArtwork({
  seed = "nexora",
  colors = ["#0b3a44", "#00e5ff"],
  className = "",
  icon,
  category,
}: {
  seed?: string;
  colors?: string[];
  className?: string;
  icon?: string;
  category?: string;
}) {
  const art =
    (category && CATEGORY_ART[category]) ||
    ({
      tint: hexToRgba(colors[1] ?? "#00e5ff", 0.32),
      deep: hexToRgba(colors[0] ?? "#0b3a44", 0.62),
      accent: colors[1] ?? "#00e5ff",
    } as const);

  const rnd = makeRng(seed);
  // Rings orbit the gradient's focal point (62% 22% of a 200×130 canvas).
  const fx = 124;
  const fy = 29;
  const rings = [
    { r: 34 + rnd() * 10, o: 0.16 },
    { r: 60 + rnd() * 14, o: 0.11 },
    { r: 90 + rnd() * 18, o: 0.07 },
  ];
  const counterRing = { cx: 22 + rnd() * 30, cy: 104 + rnd() * 18, r: 46 + rnd() * 16 };
  const dots = Array.from({ length: 7 }, (_, i) => ({
    cx: rnd() * 200,
    cy: rnd() * 130,
    r: 0.7 + rnd() * 0.9,
    o: 0.2 + rnd() * 0.35,
    white: i % 3 === 2,
  }));

  return (
    // decorative — the surrounding link/card carries the accessible name
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: "#08090b",
        backgroundImage: `radial-gradient(circle at 62% 22%, ${art.tint}, ${art.deep} 46%, #08090b 100%)`,
      }}
    >
      <div className="blueprint-grid absolute inset-0" />
      <svg
        viewBox="0 0 200 130"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 block h-full w-full"
      >
        <g fill="none" stroke={art.accent} strokeWidth="0.6">
          {rings.map((ring, i) => (
            <circle key={i} cx={fx} cy={fy} r={ring.r} strokeOpacity={ring.o} />
          ))}
        </g>
        <circle
          cx={counterRing.cx}
          cy={counterRing.cy}
          r={counterRing.r}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.05"
          strokeWidth="0.6"
        />
        <g>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              fill={d.white ? "#ffffff" : art.accent}
              opacity={d.o}
            />
          ))}
        </g>
      </svg>

      {icon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Icon
            name={icon}
            size={44}
            strokeWidth={1.5}
            className="text-white/90"
            style={{ filter: `drop-shadow(0 0 12px ${art.accent})` }}
          />
        </div>
      )}
    </div>
  );
}
