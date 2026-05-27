import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function Logo({ to = '/', compact = false, className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2 group ${className}`} aria-label="Nexora AI home">
      <span className="relative flex items-center justify-center">
        <Icon
          name="hub"
          className="text-primary-container"
          size={28}
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.6))' }}
        />
      </span>
      {!compact && (
        <span className="font-display text-[22px] font-bold tracking-tight text-on-surface">
          Nexora <span className="text-primary-container">AI</span>
        </span>
      )}
    </Link>
  )
}
