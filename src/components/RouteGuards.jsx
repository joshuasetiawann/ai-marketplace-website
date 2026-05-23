import { Navigate, useLocation, Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ROLES } from '../data/db.js'

// Requires a signed-in user; otherwise bounces to login with a return path.
export function RequireAuth({ children }) {
  const { isAuthenticated } = useApp()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }
  return children
}

// Requires the user to hold one of the allowed roles.
export function RequireRole({ roles, children }) {
  const { isAuthenticated, role } = useApp()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  if (!roles.includes(role)) {
    return <Unauthorized need={roles} have={role} />
  }
  return children
}

// Requires the signed-in shopper to have opened a store; otherwise sends them to
// the "Buka Toko" onboarding. This is how one account becomes a seller.
export function RequireStore({ children }) {
  const { isAuthenticated, hasStore } = useApp()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }
  if (!hasStore) return <Navigate to="/sell/start" replace />
  return children
}

export function Unauthorized({ need = [], have }) {
  const homes = { buyer: '/dashboard', seller: '/seller', developer: '/developer', admin: '/admin' }
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-margin-mobile py-20">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-error/[0.07] blur-[120px] rounded-full -z-10" />
      <div className="w-20 h-20 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mb-6">
        <Icon name="lock" size={38} className="text-error" />
      </div>
      <p className="font-label text-label-sm uppercase tracking-widest text-error mb-3">403 · Akses ditolak</p>
      <h1 className="font-display text-headline-md text-on-surface mb-3">Halaman ini bukan untuk role kamu</h1>
      <p className="text-body-lg text-on-surface-variant max-w-md mb-2">
        Butuh akses <b className="text-on-surface">{need.map((r) => ROLES[r]?.label).join(' / ')}</b>.
        {have && <> Akun kamu saat ini berperan sebagai <b className="text-on-surface">{ROLES[have]?.label}</b>.</>}
      </p>
      <p className="text-body-sm text-on-surface-variant max-w-md mb-8">
        Kontrol akses berbasis-role mencegah satu pengguna membuka dashboard milik role lain.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={homes[have] || '/'} className="btn-primary px-6 py-3"><Icon name="dashboard" size={18} /> Ke dashboard saya</Link>
        <Link to="/" className="btn-ghost px-6 py-3"><Icon name="home" size={18} /> Beranda</Link>
      </div>
    </div>
  )
}
