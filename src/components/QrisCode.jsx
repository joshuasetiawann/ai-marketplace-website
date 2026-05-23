import { useMemo } from 'react'
import { qrMatrix } from '../data/payment.js'

// Renders a QRIS-style scannable-looking code (deterministic, demo only).
export default function QrisCode({ seed = 'nexora', size = 220 }) {
  const matrix = useMemo(() => qrMatrix(seed, 29), [seed])
  const n = matrix.length
  const cell = size / n

  return (
    <div className="relative inline-block rounded-xl bg-white p-3 shadow-[0_0_40px_rgba(0,229,255,0.15)]">
      {/* QRIS header strip */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-extrabold text-[13px] tracking-tight text-[#e30613]">QRIS</span>
        <span className="text-[8px] font-semibold text-neutral-500">NEXORA AI · NMID</span>
      </div>
      <svg width={size} height={size} className="block" shapeRendering="crispEdges">
        {matrix.map((row, r) =>
          row.map((on, c) =>
            on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#0a0a0a" /> : null,
          ),
        )}
      </svg>
      {/* center logo chip */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 w-12 h-12 rounded-lg bg-white border-2 border-neutral-200 flex items-center justify-center">
        <span className="material-icon text-[#e30613] font-black text-lg">N</span>
      </div>
    </div>
  )
}
