import Icon from './Icon.jsx'

// Role-colored dashboard header — keeps a consistent shell while letting each
// role (buyer/seller/developer/admin) own a distinct accent.
export function DashHeader({ accent = '#00e5ff', roleLabel, title, subtitle, action, icon }) {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-7 border border-white/[0.07]">
      <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(120% 140% at 0% 0%, ${accent}1f 0%, transparent 55%)` }} />
      <div className="relative p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}1a`, color: accent, border: `1px solid ${accent}33` }}>
              <Icon name={icon} size={24} />
            </span>
          )}
          <div>
            <p className="font-label text-label-sm uppercase tracking-widest mb-1" style={{ color: accent }}>{roleLabel}</p>
            <h1 className="font-display text-headline-md text-on-surface leading-tight">{title}</h1>
            {subtitle && <p className="text-body-sm text-on-surface-variant mt-1">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  )
}

const STATUS = {
  published: { label: 'Tayang', cls: 'text-success bg-success/10', icon: 'check_circle' },
  active: { label: 'Aktif', cls: 'text-success bg-success/10', icon: 'check_circle' },
  paid: { label: 'Lunas', cls: 'text-success bg-success/10', icon: 'check_circle' },
  approved: { label: 'Disetujui', cls: 'text-success bg-success/10', icon: 'check_circle' },
  under_review: { label: 'Dalam Review', cls: 'text-secondary bg-secondary/10', icon: 'schedule' },
  pending: { label: 'Menunggu', cls: 'text-secondary bg-secondary/10', icon: 'schedule' },
  draft: { label: 'Draf', cls: 'text-on-surface-variant bg-white/5', icon: 'edit' },
  refunded: { label: 'Refund', cls: 'text-on-surface-variant bg-white/5', icon: 'autorenew' },
  rejected: { label: 'Ditolak', cls: 'text-error bg-error/10', icon: 'cancel' },
  expired: { label: 'Kedaluwarsa', cls: 'text-error bg-error/10', icon: 'timer_off' },
}

export function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.draft
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full ${s.cls}`}>
      <Icon name={s.icon} size={13} fill={['published', 'active', 'paid', 'approved'].includes(status)} /> {s.label}
    </span>
  )
}

export function DashTabs({ tabs, active, onChange, accent = '#00e5ff' }) {
  return (
    <div className="border-b hairline mb-7 flex gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-4 py-3 font-label text-label-md whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-2 ${active === t.id ? 'text-on-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          style={active === t.id ? { borderColor: accent, color: accent } : {}}>
          <Icon name={t.icon} size={17} /> {t.label}
        </button>
      ))}
    </div>
  )
}
