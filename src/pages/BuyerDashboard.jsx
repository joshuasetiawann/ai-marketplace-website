import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import ModelCard from '../components/ModelCard.jsx'
import { TierBadge } from '../components/Badge.jsx'
import { EmptyState } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'
import { recommendReason } from '../data/recommend.js'
import { formatIDR, toIDR } from '../data/payment.js'

export default function BuyerDashboard() {
  const { user, orders, wishlistDetailed, recentlyViewedDetailed, recommendations, cartCount, catalog } = useApp()
  const firstName = user?.name?.split(' ')[0] || 'there'

  const purchasedIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.id)))]
  const library = purchasedIds.map((id) => catalog.find((m) => m.id === id)).filter(Boolean)
  const data = { recentlyViewed: recentlyViewedDetailed.map((m) => m.id), wishlist: wishlistDetailed.map((m) => m.id) }

  const stats = [
    { icon: 'inventory_2', label: 'Produk Aktif', value: library.length, to: '/orders' },
    { icon: 'bookmark', label: 'Disimpan', value: wishlistDetailed.length, to: '/wishlist' },
    { icon: 'shopping_cart', label: 'Keranjang', value: cartCount, to: '/cart' },
    { icon: 'receipt_long', label: 'Pesanan', value: orders.length, to: '/orders' },
  ]

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-label text-label-sm uppercase tracking-widest text-primary-container mb-1">Buyer Dashboard</p>
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface">Halo, {firstName} 👋</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Pusat kendali AI pribadimu — semua data hanya milik akun ini.</p>
        </div>
        <Link to="/explore" className="btn-primary px-5 py-2.5 self-start"><Icon name="explore" size={18} /> Jelajahi</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="surface-card rounded-xl p-5 hover:border-primary-container/30 electric-glow-hover transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container mb-3"><Icon name={s.icon} size={20} /></div>
            <p className="font-display text-headline-md text-on-surface leading-none">{s.value}</p>
            <p className="text-body-sm text-on-surface-variant mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Library */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-title-md text-on-surface">Produk Saya</h2>
          <Link to="/orders" className="text-label-md font-label text-primary-container hover:text-primary">Riwayat</Link>
        </div>
        {library.length ? (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden relative min-h-[260px] flex flex-col justify-end">
              <ModelArtwork seed={library[0].id} colors={library[0].art} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent" />
              <div className="relative p-7">
                <div className="flex items-center gap-2 mb-2"><TierBadge tier={library[0].tier} /><span className="text-[11px] font-mono text-outline uppercase">{library[0].category}</span></div>
                <h3 className="font-display text-headline-md text-on-surface mb-2">{library[0].name}</h3>
                <p className="text-body-md text-on-surface-variant max-w-md mb-5">{library[0].tagline}</p>
                <div className="flex flex-wrap gap-3"><button className="btn-primary px-5 py-3"><Icon name="rocket_launch" size={18} /> Buka Studio</button><Link to={`/model/${library[0].id}`} className="btn-soft px-4 py-3"><Icon name="settings" size={18} /></Link></div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {library.slice(1, 4).map((m) => (
                <div key={m.id} className="surface-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0"><ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full" /></div>
                  <div className="flex-1 min-w-0"><p className="text-body-sm font-semibold text-on-surface truncate">{m.name}</p><p className="text-[12px] text-on-surface-variant truncate">{m.category}</p></div>
                  <Link to={`/model/${m.id}`} className="btn-soft px-4 py-2 text-[13px]">Akses</Link>
                </div>
              ))}
              {library.length < 2 && <div className="surface-card rounded-xl p-5 text-center text-body-sm text-on-surface-variant flex-1 flex items-center justify-center">Beli lagi untuk menambah koleksi ✨</div>}
            </div>
          </div>
        ) : (
          <EmptyState icon="inventory_2" title="Belum ada produk" message="Produk yang kamu beli akan muncul di sini, siap diakses." action={<Link to="/explore" className="btn-primary px-6 py-3">Mulai Belanja</Link>} />
        )}
      </section>

      {/* Recommendations (personalized) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <div><h2 className="font-display text-title-md text-on-surface flex items-center gap-2"><Icon name="auto_awesome" size={20} className="text-primary-container" /> Rekomendasi untukmu</h2><p className="text-body-sm text-on-surface-variant">Dipersonalisasi dari aktivitas akun kamu.</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {recommendations.map((m) => (
            <div key={m.id} className="relative">
              <span className="absolute top-2 left-2 z-10 text-[10px] bg-surface-container-high/90 backdrop-blur text-on-surface-variant px-2 py-1 rounded-full border border-white/10">{recommendReason(m, data)}</span>
              <ModelCard model={m} />
            </div>
          ))}
        </div>
      </section>

      {/* Recently viewed */}
      {recentlyViewedDetailed.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-title-md text-on-surface mb-5 flex items-center gap-2"><Icon name="history" size={20} /> Baru dilihat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentlyViewedDetailed.slice(0, 6).map((m) => (
              <Link key={m.id} to={`/model/${m.id}`} className="surface-card rounded-xl overflow-hidden group hover:border-primary-container/30 transition-all">
                <div className="h-20"><ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full group-hover:scale-105 transition-transform duration-500" /></div>
                <p className="text-[12px] font-medium text-on-surface truncate p-2">{m.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Manage */}
      <section>
        <h2 className="font-display text-title-md text-on-surface mb-5">Kelola Akun</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[{ to: '/settings', icon: 'manage_accounts', t: 'Pengaturan Akun', s: 'Profil, keamanan, 2FA' }, { to: '/orders', icon: 'receipt_long', t: 'Riwayat Pembelian', s: 'Invoice & langganan' }, { to: '/help', icon: 'support_agent', t: 'Pusat Bantuan', s: 'Dukungan 24/7' }].map((a) => (
            <Link key={a.to} to={a.to} className="surface-card rounded-xl p-5 flex items-center gap-4 hover:border-primary-container/30 electric-glow-hover transition-all">
              <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center text-primary-container"><Icon name={a.icon} size={22} /></div>
              <div className="flex-1 min-w-0"><p className="text-body-md font-semibold text-on-surface">{a.t}</p><p className="text-[12px] text-on-surface-variant truncate">{a.s}</p></div>
              <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
