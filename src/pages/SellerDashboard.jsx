import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import AreaChart from '../components/AreaChart.jsx'
import { DashHeader, StatusPill } from '../components/DashboardKit.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getProductsByOwner } from '../data/db.js'
import { formatIDR, toIDR } from '../data/payment.js'

const ACCENT = '#e9c349'
const TABS = [
  { id: 'overview', label: 'Ringkasan', icon: 'monitoring' },
  { id: 'products', label: 'Produk', icon: 'inventory_2' },
  { id: 'orders', label: 'Pesanan', icon: 'receipt_long' },
  { id: 'reviews', label: 'Ulasan', icon: 'star' },
  { id: 'messages', label: 'Pesan', icon: 'chat' },
  { id: 'payouts', label: 'Payout', icon: 'payments' },
]

const REV = [12, 18, 15, 22, 19, 26, 24, 31, 28, 35]
const SEED_PRODUCTS = [
  { id: 'nexus-vision-pro', name: 'Nexus Vision Pro', category: 'vision', status: 'published', price: 24, sales: 842, art: ['#0b3a44', '#00e5ff'], icon: 'visibility' },
  { id: 'codeweaver-x', name: 'CodeWeaver X', category: 'code', status: 'published', price: 39, sales: 521, art: ['#10233a', '#3b82f6'], icon: 'code' },
  { id: 'chroma-studio-fx', name: 'Chroma Studio FX', category: 'video', status: 'under_review', price: 49, sales: 0, art: ['#231038', '#a855f7'], icon: 'movie' },
]
const ORDERS = [
  { id: 'NX-9920', buyer: 'A. Wijaya', product: 'Nexus Vision Pro', amount: 24, when: '2 jam lalu', status: 'paid' },
  { id: 'NX-9918', buyer: 'R. Pratama', product: 'CodeWeaver X', amount: 39, when: '5 jam lalu', status: 'paid' },
  { id: 'NX-9915', buyer: 'S. Lestari', product: 'Nexus Vision Pro', amount: 24, when: 'Kemarin', status: 'refunded' },
]
const REVIEWS = [
  { name: 'Maya C.', rating: 5, text: 'Output paling koheren yang pernah saya pakai. Worth it!', product: 'Nexus Vision Pro' },
  { name: 'David O.', rating: 4, text: 'Integrasi mulus, latensi sesuai klaim.', product: 'CodeWeaver X' },
]
const MESSAGES = [
  { name: 'Andi Saputra', text: 'Apakah model ini support batch API?', unread: true, when: '10m' },
  { name: 'Putri Maharani', text: 'Terima kasih, lisensinya sudah aktif 🙏', unread: false, when: '1j' },
]

export default function SellerDashboard() {
  const { user } = useApp()
  const [tab, setTab] = useState('overview')
  const mine = getProductsByOwner(user?.id)
  const products = [...mine.map((p) => ({ ...p, sales: 0 })), ...SEED_PRODUCTS]

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <DashHeader
        accent={ACCENT}
        roleLabel="Seller Studio"
        title={user?.store?.name || 'Toko Saya'}
        subtitle="Kelola produk, pesanan, dan pendapatan AI kamu."
        action={<Link to="/upload" className="btn-primary px-5 py-2.5" style={{ background: ACCENT, color: '#241a00' }}><Icon name="add" size={18} /> Produk Baru</Link>}
        icon="storefront"
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} accent={ACCENT} />

      {tab === 'overview' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Pendapatan', value: formatIDR(toIDR(24592)), delta: '+12.5%', up: true, icon: 'payments' },
              { label: 'Pelanggan Aktif', value: '1,204', delta: '+4.2%', up: true, icon: 'group' },
              { label: 'Produk Terjual', value: '1,363', delta: '+8.1%', up: true, icon: 'shopping_bag' },
              { label: 'Rating Toko', value: '4.92', delta: '+0.1', up: true, icon: 'star' },
            ].map((s) => (
              <div key={s.label} className="surface-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}1a`, color: ACCENT }}><Icon name={s.icon} size={18} fill={s.icon === 'star'} /></span>
                  <span className={`text-[12px] px-2 py-0.5 rounded-full ${s.up ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>{s.delta}</span>
                </div>
                <p className="font-display text-[26px] leading-none text-on-surface mb-1">{s.value}</p>
                <p className="text-[13px] text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="font-display text-title-md text-on-surface">Tren Pendapatan</h2><span className="text-[12px] px-3 py-1 rounded-full" style={{ background: `${ACCENT}1a`, color: ACCENT }}>30 hari</span></div>
            <AreaChart data={REV} stroke={ACCENT} labels={['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4']} height={220} />
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="surface-card rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead><tr className="border-b hairline text-[12px] uppercase tracking-wider text-on-surface-variant font-label"><th className="px-6 py-4 font-medium">Produk</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium text-right">Harga</th><th className="px-6 py-4 font-medium text-right">Terjual</th><th className="px-6 py-4" /></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hairline last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg overflow-hidden shrink-0"><ModelArtwork seed={p.id} colors={p.art || ['#2a1f05', ACCENT]} icon={p.icon} className="w-full h-full" /></span><span className="text-body-sm font-medium text-on-surface">{p.name}</span></div></td>
                    <td className="px-6 py-4"><StatusPill status={p.status} /></td>
                    <td className="px-6 py-4 text-body-sm text-on-surface text-right font-mono">{formatIDR(toIDR(p.price))}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface text-right font-mono">{p.sales}</td>
                    <td className="px-6 py-4 text-right"><button className="text-on-surface-variant hover:text-on-surface p-1"><Icon name="edit" size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {ORDERS.map((o) => (
            <div key={o.id} className="surface-card rounded-xl p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0"><p className="text-body-sm font-semibold text-on-surface">{o.product}</p><p className="text-[12px] text-on-surface-variant font-mono">{o.id} · {o.buyer} · {o.when}</p></div>
              <StatusPill status={o.status} />
              <span className="font-display text-body-lg text-on-surface">{formatIDR(toIDR(o.amount))}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
          {REVIEWS.map((r, i) => (
            <div key={i} className="surface-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-2"><span className="font-semibold text-on-surface">{r.name}</span><span className="flex items-center gap-0.5 text-secondary">{Array.from({ length: r.rating }).map((_, j) => <Icon key={j} name="star" size={14} fill />)}</span></div>
              <p className="text-body-sm text-on-surface-variant mb-3">"{r.text}"</p>
              <p className="text-[12px] text-outline">pada {r.product}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'messages' && (
        <div className="surface-card rounded-xl divide-y divide-white/5 animate-fade-in">
          {MESSAGES.map((m, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-container flex items-center justify-center text-on-secondary font-bold">{m.name.charAt(0)}</span>
              <div className="flex-1 min-w-0"><p className="text-body-sm font-semibold text-on-surface flex items-center gap-2">{m.name} {m.unread && <span className="w-2 h-2 rounded-full bg-primary-container" />}</p><p className="text-[13px] text-on-surface-variant truncate">{m.text}</p></div>
              <span className="text-[12px] text-outline">{m.when}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'payouts' && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 animate-fade-in">
          <div className="surface-card rounded-xl p-6" style={{ background: `linear-gradient(135deg, ${ACCENT}10, transparent)` }}>
            <p className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Saldo siap dicairkan</p>
            <p className="font-display text-display-md text-on-surface leading-none mb-4">{formatIDR(toIDR(8420))}</p>
            <button className="btn-primary px-6 py-3" style={{ background: ACCENT, color: '#241a00' }}><Icon name="payments" size={18} /> Cairkan ke Rekening</button>
          </div>
          <div className="surface-card rounded-xl p-6">
            <h3 className="font-display text-body-lg font-semibold text-on-surface mb-4">Rekening Payout</h3>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10">
              <span className="w-10 h-10 rounded bg-[#0066b3] text-white text-[10px] font-bold flex items-center justify-center">BCA</span>
              <div className="flex-1"><p className="text-body-sm text-on-surface">BCA · {user?.store?.payout?.account || '••••4821'}</p><p className="text-[12px] text-success flex items-center gap-1"><Icon name="verified" size={13} fill /> Terverifikasi</p></div>
              <button className="text-label-md font-label text-primary-container">Ubah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Tabs({ tabs, active, onChange, accent }) {
  return (
    <div className="border-b hairline mb-7 flex gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={`px-4 py-3 font-label text-label-md whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-2 ${active === t.id ? 'text-on-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`} style={active === t.id ? { borderColor: accent, color: accent } : {}}>
          <Icon name={t.icon} size={17} /> {t.label}
        </button>
      ))}
    </div>
  )
}
