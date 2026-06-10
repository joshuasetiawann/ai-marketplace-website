import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { EmptyState } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'
import { toIDR, formatIDR } from '../data/payment.js'

const PROMOS = { NEXORA10: 0.1, LUXURY20: 0.2, WELCOME: 0.15 }

export default function Cart() {
  const { cartDetailed, subtotal, taxes, total, setQty, removeFromCart } = useApp()
  const [promo, setPromo] = useState('')
  const [applied, setApplied] = useState(null)
  const [promoError, setPromoError] = useState('')

  const applyPromo = (e) => {
    e.preventDefault()
    const code = promo.trim().toUpperCase()
    if (PROMOS[code]) {
      setApplied({ code, rate: PROMOS[code] })
      setPromoError('')
    } else {
      setApplied(null)
      setPromoError('Kode promo tidak valid')
    }
  }

  const discount = applied ? Math.round(subtotal * applied.rate * 100) / 100 : 0
  const grandTotal = Math.max(0, total - discount)

  if (!cartDetailed.length) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-8">Keranjang</h1>
        <EmptyState
          icon="shopping_cart"
          title="Keranjang kamu kosong"
          message="Jelajahi marketplace dan tambahkan model AI premium untuk memulai."
          action={<Link to="/explore" className="btn-primary px-6 py-3"><Icon name="explore" size={18} /> Jelajahi Model</Link>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface">Keranjang</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{cartDetailed.length} item di keranjang kamu.</p>
        </div>
        <Link to="/explore" className="hidden sm:inline-flex btn-ghost px-5 py-2.5"><Icon name="add" size={18} /> Tambah lagi</Link>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
        <div className="flex flex-col gap-4">
          {cartDetailed.map((m) => (
            <div key={m.id} className="surface-card rounded-xl p-4 flex gap-4 items-center animate-fade-in">
              <Link to={`/model/${m.id}`} className="w-24 h-20 rounded-lg overflow-hidden shrink-0">
                <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/model/${m.id}`} className="font-display text-body-lg font-semibold text-on-surface hover:text-primary-container transition-colors truncate block">{m.name}</Link>
                <p className="text-body-sm text-on-surface-variant truncate">{m.tagline}</p>
                <p className="text-primary-container font-label text-label-md mt-1">{m.price === 0 ? 'Gratis' : `${formatIDR(toIDR(m.price))}/bln`}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => removeFromCart(m.id)} className="text-on-surface-variant hover:text-error transition-colors p-1" aria-label="Hapus"><Icon name="delete" size={20} /></button>
                <div className="flex items-center border border-white/10 rounded-full">
                  <button onClick={() => setQty(m.id, m.qty - 1)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface" aria-label="Kurangi"><Icon name="remove" size={16} /></button>
                  <span className="w-8 text-center text-body-sm font-medium text-on-surface">{m.qty}</span>
                  <button onClick={() => setQty(m.id, m.qty + 1)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface" aria-label="Tambah"><Icon name="add" size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 surface-card rounded-xl p-6">
          <h2 className="font-display text-title-md text-on-surface mb-5">Ringkasan Pesanan</h2>

          <form onSubmit={applyPromo} className="flex gap-2 mb-5">
            <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Kode promo" className="input-field flex-1" />
            <button type="submit" className="btn-soft px-5">Pakai</button>
          </form>
          {promoError && <p className="text-error text-body-sm -mt-3 mb-4">{promoError}</p>}
          {applied && (
            <div className="flex items-center justify-between text-success text-body-sm -mt-3 mb-4 bg-success/10 px-3 py-2 rounded-lg">
              <span className="flex items-center gap-1.5"><Icon name="check_circle" size={16} fill /> {applied.code} dipakai</span>
              <button onClick={() => { setApplied(null); setPromo('') }} className="hover:underline">Hapus</button>
            </div>
          )}
          <p className="text-[12px] text-on-surface-variant mb-5">Coba <span className="font-mono text-primary-container">NEXORA10</span> untuk diskon 10%.</p>

          <div className="flex flex-col gap-3 text-body-md border-t hairline pt-5">
            <Row label="Subtotal" value={formatIDR(toIDR(subtotal))} />
            {discount > 0 && <Row label="Diskon" value={`−${formatIDR(toIDR(discount))}`} accent="success" />}
            <Row label="PPN 11%" value={formatIDR(toIDR(taxes))} muted />
          </div>

          <div className="flex items-center justify-between mt-5 pt-5 border-t hairline">
            <span className="font-display text-title-md text-on-surface">Total</span>
            <span className="font-display text-headline-md text-primary-container">{formatIDR(toIDR(grandTotal))}</span>
          </div>

          <Link to="/checkout" className="btn-primary w-full py-3.5 mt-6">Lanjut ke Pembayaran <Icon name="arrow_forward" size={18} /></Link>
          <div className="flex items-center justify-center gap-2 mt-4 text-[12px] text-on-surface-variant">
            <Icon name="verified_user" size={14} className="text-primary-container" /> Checkout aman terenkripsi SSL 256-bit
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, muted, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-on-surface-variant' : 'text-on-surface'}>{label}</span>
      <span className={`font-medium ${accent === 'success' ? 'text-success' : 'text-on-surface'}`}>{value}</span>
    </div>
  )
}
