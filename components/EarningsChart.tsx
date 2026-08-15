/**
 * Gold area chart for "Tren Pendapatan Bersih" (docs/design/v2 frame "seller").
 * Pure inline SVG — server-renderable, no chart library.
 */
export default function EarningsChart({
  points,
  labels,
}: {
  /** weekly net revenue, oldest → newest (same length as labels) */
  points: number[];
  labels: string[];
}) {
  const W = 720;
  const H = 220;
  const PAD = 8;
  const max = Math.max(...points, 1);
  const step = points.length > 1 ? (W - PAD * 2) / (points.length - 1) : 0;
  const xy = points.map((v, i) => [PAD + i * step, H - PAD - (v / max) * (H - PAD * 2)] as const);
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${(PAD + (points.length - 1) * step).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`;
  const last = xy[xy.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Grafik tren pendapatan bersih mingguan">
        <defs>
          <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e9c349" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e9c349" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={PAD} x2={W - PAD} y1={H * t} y2={H * t} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#goldArea)" />
        <path d={line} fill="none" stroke="#e9c349" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {last && (
          <circle cx={last[0]} cy={last[1]} r="5" fill="#e9c349" stroke="#0a0b0d" strokeWidth="2" />
        )}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-outline">
        {/* index in the key: two weeks can render the same label text */}
        {labels.map((l, i) => (
          <span key={`${i}-${l}`} className={i === labels.length - 1 ? "text-secondary" : ""}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
