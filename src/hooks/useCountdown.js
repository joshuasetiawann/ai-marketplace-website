import { useEffect, useState } from 'react'

// Counts down to an absolute timestamp; returns { ms, label, expired }.
export function useCountdown(expiresAt) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!expiresAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  const ms = Math.max(0, (expiresAt || 0) - now)
  const expired = expiresAt ? ms <= 0 : false
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (x) => String(x).padStart(2, '0')
  const label = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  return { ms, label, expired }
}
