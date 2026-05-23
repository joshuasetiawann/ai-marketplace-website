import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { EmptyState } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'

const SAMPLE = [
  {
    id: 'NX-A1B2C3',
    date: '2025-05-18T10:00:00Z',
    status: 'Active',
    total: 63,
    items: [{ id: 'nexus-vision-pro', name: 'Nexus Vision Pro', qty: 1, price: 24, art: ['#0b3a44', '#00e5ff'], icon: 'visibility' }, { id: 'codeweaver-x', name: 'CodeWeaver X', qty: 1, price: 39, art: ['#10233a', '#3b82f6'], icon: 'code' }],
  },
  {
    id: 'NX-D4E5F6',
    date: '2025-04-02T14:30:00Z',
    status: 'Active',
    total: 49,
    items: [{ id: 'chroma-studio-fx', name: 'Chroma Studio FX', qty: 1, price: 49, art: ['#231038', '#a855f7'], icon: 'movie' }],
  },
]

const STATUS_STYLES = {
  Active: 'text-success bg-success/10',
  Processing: 'text-secondary bg-secondary/10',
  Refunded: 'text-on-surface-variant bg-white/5',
}

export default function OrderHistory() {
  const { orders } = useApp()
  const list = orders.length ? orders : SAMPLE

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="mb-8">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-2">Order History</h1>
        <p className="text-body-md text-on-surface-variant">Your purchases, invoices, and active subscriptions.</p>
      </div>

      {list.length ? (
        <div className="flex flex-col gap-5">
          {list.map((o) => (
            <div key={o.id} className="surface-card rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b hairline bg-white/[0.015]">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-label">Order</p>
                    <p className="font-mono text-body-sm text-on-surface">{o.id}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-label">Date</p>
                    <p className="text-body-sm text-on-surface">{new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[o.status] || STATUS_STYLES.Active}`}>{o.status}</span>
                  <div className="text-right">
                    <p className="text-[12px] text-on-surface-variant">Total</p>
                    <p className="font-display text-body-lg text-on-surface">${o.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {o.items.map((it, i) => (
                  <div key={`${it.id}-${i}`} className="flex items-center gap-4">
                    <Link to={`/model/${it.id}`} className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <ModelArtwork seed={it.id} colors={it.art || ['#0b3a44', '#00e5ff']} icon={it.icon} className="w-full h-full" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/model/${it.id}`} className="text-body-sm font-medium text-on-surface hover:text-primary-container transition-colors truncate block">{it.name}</Link>
                      <p className="text-[12px] text-on-surface-variant">Qty {it.qty} · ${it.price}/mo</p>
                    </div>
                    <Link to={`/model/${it.id}`} className="btn-soft px-4 py-2 text-[13px]"><Icon name="rocket_launch" size={15} /> Launch</Link>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-3 border-t hairline">
                <button className="text-label-md font-label text-on-surface-variant hover:text-on-surface flex items-center gap-1"><Icon name="receipt" size={16} /> Invoice</button>
                <span className="text-white/10">·</span>
                <button className="text-label-md font-label text-on-surface-variant hover:text-on-surface flex items-center gap-1"><Icon name="autorenew" size={16} /> Manage</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="receipt_long"
          title="No orders yet"
          message="When you purchase models, your receipts and subscriptions will appear here."
          action={<Link to="/explore" className="btn-primary px-6 py-3">Start Shopping</Link>}
        />
      )}
    </div>
  )
}
