import { NavLink } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const NAV = {
  admin: [
    { to: '/admin', icon: 'shield_person', label: 'Admin' },
    { to: '/developer', icon: 'code', label: 'Developer' },
  ],
  developer: [{ to: '/developer', icon: 'code', label: 'Developer' }],
}

export default function ConsoleLayout({ children }) {
  const { user, role, logout } = useApp()
  const nav = NAV[role] || []
  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-label-md font-label flex items-center gap-2 transition-colors ${
      isActive ? 'bg-white/10 text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass-nav border-b border-white/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-on-surface/10 border border-white/10 flex items-center justify-center"><Icon name="terminal" size={18} className="text-on-surface" /></span>
              <span className="font-display font-semibold text-on-surface">Nexora <span className="text-on-surface-variant font-light">Console</span></span>
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider border border-white/15 rounded px-1.5 py-0.5 text-on-surface-variant ml-1">Internal</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              {nav.map((n) => <NavLink key={n.to} to={n.to} className={linkCls}><Icon name={n.icon} size={17} />{n.label}</NavLink>)}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-body-sm text-on-surface">{user?.name}</span>
              <span className="text-[11px] text-on-surface-variant capitalize">{role}</span>
            </div>
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary-container font-bold">{user?.name?.charAt(0)}</span>
            <button onClick={() => logout()} className="p-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors" title="Keluar"><Icon name="logout" size={20} /></button>
          </div>
        </div>
        {nav.length > 1 && (
          <nav className="sm:hidden flex items-center gap-1 px-margin-mobile pb-2 overflow-x-auto no-scrollbar">
            {nav.map((n) => <NavLink key={n.to} to={n.to} className={linkCls}><Icon name={n.icon} size={16} />{n.label}</NavLink>)}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
