import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'
import { useApp } from '../context/AppContext.jsx'

const NAV_LINKS = [
  { to: '/explore', label: 'Jelajahi' },
  { to: '/categories', label: 'Kategori' },
  { to: '/creators', label: 'Kreator' },
  { to: '/pricing', label: 'Harga' },
]

export default function Navbar() {
  const { cartCount, wishlist, user, roleMeta, logout } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const accountRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close transient UI on route change
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    navigate(`/explore${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-nav border-b border-white/10' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-16 md:h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `relative font-label text-label-md transition-colors duration-300 ${
                      isActive ? 'text-primary-container' : 'text-on-surface/60 hover:text-on-surface'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-container rounded-full shadow-[0_0_8px_#00e5ff]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2.5 rounded-full text-on-surface/70 hover:text-on-surface hover:bg-white/5 transition-colors"
              aria-label="Search"
            >
              <Icon name="search" size={22} />
            </button>

            <Link
              to="/wishlist"
              className="hidden sm:flex relative p-2.5 rounded-full text-on-surface/70 hover:text-on-surface hover:bg-white/5 transition-colors"
              aria-label="Wishlist"
            >
              <Icon name="favorite" size={22} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-on-surface/70 hover:text-on-surface hover:bg-white/5 transition-colors"
              aria-label="Cart"
            >
              <Icon name="shopping_cart" size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.5)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((s) => !s)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary-container font-bold text-sm">
                    {user.name.charAt(0)}
                  </span>
                  <Icon name="expand_more" size={18} className="text-on-surface-variant" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-lg p-2 animate-scale-in origin-top-right">
                    <div className="px-3 py-2 border-b hairline mb-1">
                      <p className="text-body-sm font-semibold text-on-surface truncate">{user.name}</p>
                      <p className="text-[12px] text-on-surface-variant truncate">{user.email}</p>
                      {roleMeta && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px]" style={{ background: `${roleMeta.accent}1a`, color: roleMeta.accent }}>
                          <Icon name={roleMeta.icon} size={12} /> {roleMeta.label}
                        </span>
                      )}
                    </div>
                    {[
                      { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
                      ...(user.role === 'seller' || user.role === 'admin' ? [{ to: '/seller', icon: 'storefront', label: 'Seller Studio' }] : []),
                      ...(user.role === 'developer' || user.role === 'admin' ? [{ to: '/developer', icon: 'code', label: 'Developer Console' }] : []),
                      ...(user.role === 'admin' ? [{ to: '/admin', icon: 'shield_person', label: 'Admin' }] : []),
                      { to: '/orders', icon: 'receipt_long', label: 'Pesanan' },
                      { to: '/settings', icon: 'settings', label: 'Pengaturan' },
                    ].map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
                      >
                        <Icon name={i.icon} size={18} />
                        {i.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-body-sm text-error hover:bg-error/10 transition-colors mt-1 border-t hairline"
                    >
                      <Icon name="logout" size={18} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block font-label text-label-md text-on-surface/70 hover:text-on-surface transition-colors px-3 py-2"
                >
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary hidden md:inline-flex px-5 py-2.5">
                  Daftar
                  <Icon name="arrow_forward" size={18} />
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-full text-on-surface/80 hover:bg-white/5"
              aria-label="Open menu"
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && (
          <div className="border-t border-white/10 glass-nav animate-fade-in-fast">
            <form
              onSubmit={submitSearch}
              className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex items-center gap-3"
            >
              <Icon name="search" size={22} className="text-outline" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari model, kreator, kategori…"
                className="flex-1 bg-transparent outline-none text-body-md text-on-surface placeholder:text-outline/70"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" size={20} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm glass-nav border-l border-white/10 p-6 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} className="p-2 text-on-surface-variant hover:text-on-surface" aria-label="Close menu">
                <Icon name="close" size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-title-md font-display transition-colors ${
                      isActive ? 'text-primary-container bg-primary-container/10' : 'text-on-surface hover:bg-white/5'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <NavLink to="/wishlist" className="px-4 py-3 rounded-lg text-title-md font-display text-on-surface hover:bg-white/5 flex items-center justify-between">
                Wishlist {wishlist.length > 0 && <span className="text-secondary text-base">{wishlist.length}</span>}
              </NavLink>
            </nav>
            <div className="mt-auto pt-6 border-t hairline flex flex-col gap-3">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-soft py-3">
                    <Icon name="dashboard" size={20} /> Dashboard
                  </Link>
                  <button onClick={() => logout()} className="btn-ghost py-3 text-error border-error/30">
                    <Icon name="logout" size={20} /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-soft py-3">
                    Masuk
                  </Link>
                  <Link to="/register" className="btn-primary py-3">
                    Daftar <Icon name="arrow_forward" size={18} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
