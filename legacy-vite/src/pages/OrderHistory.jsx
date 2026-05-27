import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { StatusPill } from '../components/DashboardKit.jsx'
import { EmptyState } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'
import { formatIDR, toIDR } from '../data/payment.js'

export default function OrderHistory() {
  const { orders } = useApp()

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="mb-8">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-2">Riwayat Pesanan</h1>
        <p className="text-body-md text-on-surface-variant">Pembelian, invoice, dan langganan aktif kamu — privat untuk akun ini.</p>
      </div>

      {orders.length ? (
        <div className="flex flex-col gap-5">
          {orders.map((o) => (
            <div key={o.id} className="surface-card rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b hairline bg-white/[0.015]">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-label">Order</p>
                    <p className="font-mono text-body-sm text-on-surface">{o.id}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-label">Tanggal</p>
                    <p className="text-body-sm text-on-surface">{new Date(o.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  {o.method && (
                    <div className="hidden md:block">
                      <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-label">Metode</p>
                      <p className="text-body-sm text-on-surface">{o.method}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <StatusPill status={o.status === 'paid' ? 'paid' : o.status === 'Active' ? 'active' : o.status} />
                  <div className="text-right">
                    <p className="text-[12px] text-on-surface-variant">Total</p>
                    <p className="font-display text-body-lg text-on-surface">{formatIDR(o.totalIDR || toIDR(o.total))}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {o.items.map((it, i) => (
                  <div key={`${it.id}-${i}`} className="flex items-center gap-4">
                    <Link to={`/model/${it.id}`} className="w-12 h-12 rounded-lg overflow-hidden shrink-0"><ModelArtwork seed={it.id} colors={it.art || ['#0b3a44', '#00e5ff']} icon={it.icon} className="w-full h-full" /></Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/model/${it.id}`} className="text-body-sm font-medium text-on-surface hover:text-primary-container transition-colors truncate block">{it.name}</Link>
                      <p className="text-[12px] text-on-surface-variant">Qty {it.qty} · {formatIDR(toIDR(it.price))}/bln</p>
                    </div>
                    <Link to={`/model/${it.id}`} className="btn-soft px-4 py-2 text-[13px]"><Icon name="lock_open" size={15} /> Akses</Link>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-4 px-6 py-3 border-t hairline">
                <button className="text-label-md font-label text-on-surface-variant hover:text-on-surface flex items-center gap-1"><Icon name="receipt" size={16} /> Invoice</button>
                <button className="text-label-md font-label text-on-surface-variant hover:text-on-surface flex items-center gap-1"><Icon name="autorenew" size={16} /> Kelola</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="receipt_long" title="Belum ada pesanan" message="Saat kamu membeli model, invoice & langganan akan muncul di sini." action={<Link to="/explore" className="btn-primary px-6 py-3">Mulai Belanja</Link>} />
      )}
    </div>
  )
}
