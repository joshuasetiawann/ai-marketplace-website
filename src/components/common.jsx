import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

// Scroll to top on every route change.
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

// Eyebrow + heading block used across pages.
export function SectionHeading({ eyebrow, title, subtitle, action, className = '', center = false }) {
  return (
    <div className={`flex flex-col ${center ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'} gap-4 ${className}`}>
      <div className={center ? 'max-w-2xl' : ''}>
        {eyebrow && (
          <div className={`flex items-center gap-2 mb-3 ${center ? 'justify-center' : ''}`}>
            <span className="font-label text-label-sm uppercase tracking-widest text-primary-container">{eyebrow}</span>
            {!center && <span className="h-px w-10 bg-primary-container/30" />}
          </div>
        )}
        <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface">{title}</h2>
        {subtitle && <p className="text-body-md text-on-surface-variant mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-20 px-6 ${className}`}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary-container/10 blur-2xl rounded-full" />
        <div className="relative w-20 h-20 rounded-full glass-panel flex items-center justify-center">
          <Icon name={icon} size={36} className="text-primary-container" />
        </div>
      </div>
      <h3 className="font-display text-title-md text-on-surface mb-2">{title}</h3>
      {message && <p className="text-body-md text-on-surface-variant max-w-sm mb-6">{message}</p>}
      {action}
    </div>
  )
}

// Section / page glow backdrop.
export function GlowOrb({ className = '' }) {
  return (
    <div
      className={`absolute rounded-full bg-primary-container/[0.06] blur-[120px] pointer-events-none -z-10 ${className}`}
      aria-hidden="true"
    />
  )
}
