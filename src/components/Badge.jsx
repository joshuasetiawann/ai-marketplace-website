import Icon from './Icon.jsx'

const STATUS = {
  trending: { label: 'Trending', icon: 'local_fire_department', cls: 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,229,255,0.35)]' },
  verified: { label: 'Verified', icon: 'verified', cls: 'bg-surface-container-high/80 border border-white/15 text-on-surface backdrop-blur-md' },
  new: { label: 'New', icon: 'auto_awesome', cls: 'bg-secondary/90 text-on-secondary' },
}

export function StatusBadge({ type, className = '' }) {
  const s = STATUS[type]
  if (!s) return null
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider font-label ${s.cls} ${className}`}
    >
      <Icon name={s.icon} size={12} className={type === 'verified' ? 'text-primary-container' : ''} fill={type === 'verified'} />
      {s.label}
    </span>
  )
}

export function TierBadge({ tier, className = '' }) {
  if (!tier) return null
  const map = {
    Free: 'border-white/15 text-on-surface-variant',
    Pro: 'border-primary-container/40 bg-primary-container/10 text-primary',
    Enterprise: 'border-secondary/40 bg-secondary/10 text-secondary',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-label tracking-wide ${map[tier] || map.Free} ${className}`}
    >
      {tier === 'Enterprise' && <Icon name="workspace_premium" size={12} fill />}
      {tier === 'Pro' && <Icon name="bolt" size={12} fill />}
      {tier}
    </span>
  )
}
