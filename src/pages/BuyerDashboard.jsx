import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { TierBadge } from '../components/Badge.jsx'
import { useApp } from '../context/AppContext.jsx'
import { MODELS } from '../data/models.js'

const QUICK_ACTIONS = [
  { to: '/settings', icon: 'manage_accounts', title: 'Account Settings', sub: 'Billing, profile, security' },
  { to: '/orders', icon: 'receipt_long', title: 'Purchase History', sub: 'Invoices & subscriptions' },
  { to: '/help', icon: 'support_agent', title: 'Support Center', sub: 'Get help with your tools' },
]

export default function BuyerDashboard() {
  const { user, orders, wishlistDetailed } = useApp()
  const firstName = user?.name?.split(' ')[0] || 'there'

  // Library = purchased models, falling back to a curated default so the page is never empty.
  const purchasedIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.id)))]
  const library = purchasedIds.length ? purchasedIds.map((id) => MODELS.find((m) => m.id === id)).filter(Boolean) : MODELS.slice(0, 3)
  const recent = orders.length ? orders.flatMap((o) => o.items).slice(0, 4) : MODELS.slice(0, 4)

  const stats = [
    { icon: 'inventory_2', label: 'Active Tools', value: library.length },
    { icon: 'favorite', label: 'Wishlist', value: wishlistDetailed.length },
    { icon: 'receipt_long', label: 'Orders', value: orders.length },
    { icon: 'bolt', label: 'API Calls', value: '12.4k' },
  ]

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface">Hello, {firstName} 👋</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Welcome back to your AI command center.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/explore" className="btn-ghost px-5 py-2.5"><Icon name="explore" size={18} /> Explore</Link>
          <Link to="/seller" className="btn-primary px-5 py-2.5"><Icon name="storefront" size={18} /> Seller Studio</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="surface-card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container mb-3">
              <Icon name={s.icon} size={20} />
            </div>
            <p className="font-display text-headline-md text-on-surface leading-none">{s.value}</p>
            <p className="text-body-sm text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent purchases */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-title-md text-on-surface">Recent Activity</h2>
          <Link to="/orders" className="text-label-md font-label text-primary-container hover:text-primary">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recent.map((m, i) => (
            <Link key={`${m.id}-${i}`} to={`/model/${m.id}`} className="surface-card rounded-xl overflow-hidden group hover:border-primary-container/30 transition-all">
              <div className="relative h-28">
                <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-success/20 text-success px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="p-3">
                <p className="text-body-sm font-medium text-on-surface truncate">{m.name}</p>
                <p className="text-[12px] text-on-surface-variant truncate">{m.tagline || 'AI model'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* My Library */}
      <section className="mb-12">
        <h2 className="font-display text-title-md text-on-surface mb-5">My Library</h2>
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Featured library item */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden relative min-h-[260px] flex flex-col justify-end">
            <ModelArtwork seed={library[0].id} colors={library[0].art} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent" />
            <div className="relative p-7">
              <div className="flex items-center gap-2 mb-2">
                <TierBadge tier={library[0].tier} />
                <span className="text-[11px] font-mono text-outline uppercase">{library[0].category}</span>
              </div>
              <h3 className="font-display text-headline-md text-on-surface mb-2">{library[0].name}</h3>
              <p className="text-body-md text-on-surface-variant max-w-md mb-5">{library[0].tagline}</p>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary px-5 py-3"><Icon name="rocket_launch" size={18} /> Launch Studio</button>
                <Link to={`/model/${library[0].id}`} className="btn-soft px-4 py-3"><Icon name="settings" size={18} /></Link>
              </div>
            </div>
          </div>

          {/* Library list */}
          <div className="flex flex-col gap-4">
            {library.slice(1, 4).concat(library.length < 2 ? MODELS.slice(1, 3) : []).slice(0, 3).map((m) => (
              <div key={m.id} className="surface-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-on-surface truncate">{m.name}</p>
                  <p className="text-[12px] text-on-surface-variant truncate">{m.category}</p>
                </div>
                <Link to={`/model/${m.id}`} className="btn-soft px-4 py-2 text-[13px]">Access</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-title-md text-on-surface mb-5">Manage</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to} className="surface-card rounded-xl p-5 flex items-center gap-4 hover:border-primary-container/30 electric-glow-hover transition-all">
              <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center text-primary-container">
                <Icon name={a.icon} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-md font-semibold text-on-surface">{a.title}</p>
                <p className="text-[12px] text-on-surface-variant truncate">{a.sub}</p>
              </div>
              <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
            </Link>
          ))}
        </div>
        <div className="surface-card rounded-xl p-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary-container/5 to-transparent">
          <div className="flex items-center gap-4">
            <Icon name="support_agent" size={32} className="text-primary-container" />
            <div>
              <p className="text-body-md font-semibold text-on-surface">Need immediate assistance?</p>
              <p className="text-body-sm text-on-surface-variant">Our AI support team is online 24/7.</p>
            </div>
          </div>
          <Link to="/help" className="btn-primary px-6 py-3"><Icon name="chat" size={18} /> Live Chat</Link>
        </div>
      </section>
    </div>
  )
}
