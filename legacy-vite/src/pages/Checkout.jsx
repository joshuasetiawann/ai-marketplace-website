import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { EmptyState } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'
import { PAYMENT_GROUPS, VA_BANKS, EWALLETS, toIDR, formatIDR, makeVaNumber, expiryFor, setPending } from '../data/payment.js'
import { uid } from '../data/db.js'

export default function Checkout() {
  const navigate = useNavigate()
  const { cartDetailed, subtotal, taxes, total, user, toast } = useApp()
  const [method, setMethod] = useState('qris')
  const [bank, setBank] = useState('bca')
  const [ewallet, setEwallet] = useState('gopay')
  const [agree, setAgree] = useState(false)

  if (!cartDetailed.length) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <EmptyState icon="shopping_cart_off" title="Tidak ada yang di-checkout" message="Keranjang kamu kosong. Tambahkan model dulu." action={<Link to="/explore" className="btn-primary px-6 py-3">Jelajahi Model</Link>} />
      </div>
    )
  }

  const totalIDR = toIDR(total)

  const pay = () => {
    if (!agree) { toast('Setujui syarat & ketentuan dulu', { type: 'error', icon: 'error' }); return }
    const orderId = 'NX-' + uid('').slice(0, 6).toUpperCase()
    const payment = {
      id: orderId,
      method,
      bank: method === 'va' ? bank : null,
      ewallet: method === 'ewallet' ? ewallet : null,
      vaNumber: method === 'va' ? makeVaNumber(VA_BANKS.find((b) => b.id === bank).prefix) : null,
      amountIDR: totalIDR,
      amountUSD: total,
      items: cartDetailed.map((m) => ({ id: m.id, name: m.name, price: m.price, qty: m.qty, art: m.art, icon: m.icon })),
      contact: { name: user?.name, email: user?.email },
      createdAt: Date.now(),
      expiresAt: expiryFor(method),
      status: 'pending',
    }
    setPending(user?.id, payment)
    navigate('/payment')
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/cart" className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant" aria-label="Kembali"><Icon name="arrow_back" size={22} /></Link>
        <h1 className="font-display text-headline-md text-on-surface">Checkout</h1>
      </div>
      <p className="text-body-sm text-on-surface-variant mb-8 flex items-center gap-2">
        <Icon name="lock" size={15} className="text-primary-container" /> Pembayaran aman · terenkripsi · diproses lewat gateway tepercaya
      </p>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        <div className="flex flex-col gap-6">
          {/* Contact */}
          <section className="surface-card rounded-xl p-6">
            <h2 className="font-display text-title-md text-on-surface mb-4 flex items-center gap-2"><Icon name="person" size={20} className="text-primary-container" /> Akun</h2>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border border-white/5">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary-container font-bold">{user?.name?.charAt(0)}</span>
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-on-surface truncate">{user?.name}</p>
                <p className="text-[12px] text-on-surface-variant truncate">{user?.email}</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-success"><Icon name="verified" size={14} fill /> Terverifikasi</span>
            </div>
          </section>

          {/* Payment method */}
          <section className="surface-card rounded-xl p-6">
            <h2 className="font-display text-title-md text-on-surface mb-5 flex items-center gap-2"><Icon name="payments" size={20} className="text-primary-container" /> Metode Pembayaran</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {PAYMENT_GROUPS.map((g) => (
                <button key={g.id} onClick={() => setMethod(g.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${method === g.id ? 'border-primary-container bg-primary-container/10' : 'border-white/10 hover:border-white/25'}`}>
                  <Icon name={g.icon} size={24} className={method === g.id ? 'text-primary-container' : 'text-on-surface-variant'} />
                  <p className="font-semibold text-on-surface mt-2">{g.label}</p>
                  <p className="text-[11px] text-on-surface-variant leading-snug mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>

            {method === 'qris' && (
              <div className="rounded-lg border border-white/10 bg-surface-container-lowest p-4 flex items-center gap-3 animate-fade-in-fast">
                <Icon name="qr_code" size={28} className="text-primary-container" />
                <p className="text-body-sm text-on-surface-variant">Satu QR untuk <b className="text-on-surface">GoPay, OVO, DANA, ShopeePay</b> & semua m-banking. QR muncul di langkah berikutnya.</p>
              </div>
            )}

            {method === 'va' && (
              <div className="animate-fade-in-fast">
                <p className="text-body-sm text-on-surface-variant mb-3">Pilih bank:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VA_BANKS.map((b) => (
                    <button key={b.id} onClick={() => setBank(b.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${bank === b.id ? 'border-primary-container bg-primary-container/10' : 'border-white/10 hover:border-white/25'}`}>
                      <span className="w-8 h-8 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: b.color }}>{b.short.slice(0, 4)}</span>
                      <span className="text-body-sm text-on-surface">{b.short}</span>
                      {bank === b.id && <Icon name="check_circle" size={16} className="text-primary-container ml-auto" fill />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'ewallet' && (
              <div className="animate-fade-in-fast">
                <p className="text-body-sm text-on-surface-variant mb-3">Pilih e-wallet:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EWALLETS.map((w) => (
                    <button key={w.id} onClick={() => setEwallet(w.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${ewallet === w.id ? 'border-primary-container bg-primary-container/10' : 'border-white/10 hover:border-white/25'}`}>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: w.color }}>{w.name.slice(0, 2)}</span>
                      <span className="text-body-sm text-on-surface">{w.name}</span>
                      {ewallet === w.id && <Icon name="check_circle" size={16} className="text-primary-container ml-auto" fill />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 surface-card rounded-xl p-6">
          <h2 className="font-display text-body-lg font-semibold text-on-surface mb-4">Ringkasan Pesanan</h2>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto no-scrollbar mb-4">
            {cartDetailed.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"><ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full" /></div>
                <span className="flex-1 text-body-sm text-on-surface truncate">{m.name} <span className="text-on-surface-variant">×{m.qty}</span></span>
                <span className="text-body-sm text-on-surface">{formatIDR(toIDR(m.price * m.qty))}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-body-sm border-t hairline pt-4">
            <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal</span><span className="text-on-surface">{formatIDR(toIDR(subtotal))}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">PPN 11%</span><span className="text-on-surface">{formatIDR(toIDR(taxes))}</span></div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t hairline">
            <span className="font-display text-body-lg text-on-surface">Total</span>
            <span className="font-display text-title-md text-primary-container">{formatIDR(totalIDR)}</span>
          </div>

          <label className="flex items-start gap-2.5 mt-5 cursor-pointer">
            <button type="button" onClick={() => setAgree((a) => !a)} className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${agree ? 'bg-primary-container border-primary-container' : 'border-white/30'}`}>
              {agree && <Icon name="check" size={14} className="text-on-primary-container" />}
            </button>
            <span className="text-[12px] text-on-surface-variant">Saya setuju dengan <a href="#" onClick={(e) => e.preventDefault()} className="text-primary-container">Syarat & Ketentuan</a> dan kebijakan refund Nexora AI.</span>
          </label>

          <button onClick={pay} className="btn-primary w-full py-3.5 mt-5">
            <Icon name="lock" size={18} /> Bayar {formatIDR(totalIDR)}
          </button>
          <div className="flex items-center justify-center gap-2 mt-3 text-[12px] text-on-surface-variant">
            <Icon name="verified_user" size={14} className="text-primary-container" /> Dilindungi enkripsi SSL 256-bit
          </div>
        </div>
      </div>
    </div>
  )
}
