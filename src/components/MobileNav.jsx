import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const ITEMS = [
  { to: '/', icon: 'home', label: 'Beranda', end: true },
  { to: '/explore', icon: 'explore', label: 'Jelajahi' },
  { to: '/cart', icon: 'shopping_cart', label: 'Keranjang', badge: 'cart' },
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
]

export default function MobileNav() {
  const { cartCount } = useApp()
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-nav border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary-container' : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon name={it.icon} size={24} fill={isActive} />
                  {it.badge === 'cart' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-label">{it.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
