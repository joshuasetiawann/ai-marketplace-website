import { useId } from 'react'

// Lightweight, dependency-free SVG area + line chart with a smooth curve.
export default function AreaChart({ data = [], height = 220, stroke = '#00e5ff', labels = [], className = '' }) {
  const uid = useId().replace(/:/g, '')
  const W = 600
  const H = height
  const pad = 16
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (W - pad * 2)
    const y = pad + (1 - (d - min) / range) * (H - pad * 2)
    return [x, y]
  })

  // Smooth path via Catmull-Rom → Bézier
  const linePath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p[0]},${p[1]}`
    const prev = arr[i - 1]
    const cx = (prev[0] + p[0]) / 2
    return `${acc} C ${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`
  }, '')

  const areaPath = `${linePath} L ${points[points.length - 1]?.[0] ?? pad},${H - pad} L ${points[0]?.[0] ?? pad},${H - pad} Z`

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={W - pad} y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        <path d={areaPath} fill={`url(#${uid}-fill)`} />
        <path d={linePath} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${stroke}66)` }} />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 4 : 0} fill={stroke} />
        ))}
      </svg>
      {labels.length > 0 && (
        <div className="flex justify-between mt-2 px-2">
          {labels.map((l) => (
            <span key={l} className="text-[11px] text-on-surface-variant font-mono">{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}
