import { useRef, useState } from 'react'

// 6-digit OTP entry with auto-advance, paste support, and onComplete callback.
export default function OtpInput({ length = 6, onComplete }) {
  const [vals, setVals] = useState(Array(length).fill(''))
  const refs = useRef([])

  const fire = (arr) => {
    const joined = arr.join('')
    if (joined.length === length && !arr.includes('')) onComplete?.(joined)
  }

  const setAt = (i, v) => {
    const next = [...vals]
    next[i] = v
    setVals(next)
    return next
  }

  const onChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const next = setAt(i, v)
    if (v && i < length - 1) refs.current[i + 1]?.focus()
    fire(next)
  }
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const onPaste = (e) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length).split('')
    if (!digits.length) return
    e.preventDefault()
    const next = Array(length).fill('').map((_, idx) => digits[idx] || '')
    setVals(next)
    refs.current[Math.min(digits.length, length - 1)]?.focus()
    fire(next)
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={v}
          onChange={(e) => onChange(i, e)}
          onKeyDown={(e) => onKey(i, e)}
          inputMode="numeric"
          maxLength={1}
          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-title-md font-display font-semibold bg-surface-container-lowest border border-white/15 rounded-lg text-on-surface outline-none focus:border-primary-container focus:shadow-[0_0_0_4px_rgba(0,229,255,0.12)] transition-all"
        />
      ))}
    </div>
  )
}
