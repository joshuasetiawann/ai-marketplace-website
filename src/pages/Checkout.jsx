import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { EmptyState } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'

const STEPS = [
  { id: 1, label: 'Contact' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Review' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { cartDetailed, subtotal, taxes, total, user, placeOrder } = useApp()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({
    email: user?.email || '',
    name: user?.name || '',
    card: '',
    expiry: '',
    cvc: '',
    method: 'card',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-margin-mobile py-16 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-success/20 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
            <Icon name="check" size={40} className="text-success" />
          </div>
        </div>
        <h1 className="font-display text-headline-md text-on-surface mb-3">Order Confirmed</h1>
        <p className="text-body-md text-on-surface-variant mb-2">
          Thank you{form.name ? `, ${form.name.split(' ')[0]}` : ''}! Your AI models are now active.
        </p>
        <p className="font-mono text-body-sm text-primary-container mb-8">Order {orderId}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary px-6 py-3"><Icon name="dashboard" size={18} /> Go to Dashboard</Link>
          <Link to="/explore" className="btn-ghost px-6 py-3">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  if (!cartDetailed.length) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <EmptyState
          icon="shopping_cart_off"
          title="Nothing to check out"
          message="Your cart is empty. Add some models before checking out."
          action={<Link to="/explore" className="btn-primary px-6 py-3">Explore Models</Link>}
        />
      </div>
    )
  }

  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const complete = () => {
    const id = 'NX-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    placeOrder({
      id,
      date: new Date().toISOString(),
      items: cartDetailed.map((m) => ({ id: m.id, name: m.name, price: m.price, qty: m.qty, art: m.art, icon: m.icon })),
      total,
      status: 'Active',
    })
    setOrderId(id)
    setDone(true)
  }

  const canContinue =
    step === 1 ? form.email && form.name : step === 2 ? form.method === 'apple' || (form.card && form.expiry && form.cvc) : true

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant" aria-label="Back">
          <Icon name="arrow_back" size={22} />
        </button>
        <h1 className="font-display text-headline-md text-on-surface">Checkout</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center max-w-md mx-auto mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-label text-label-md border-2 transition-all ${
                  step > s.id
                    ? 'bg-primary-container border-primary-container text-on-primary-container'
                    : step === s.id
                      ? 'border-primary-container text-primary-container shadow-[0_0_16px_rgba(0,229,255,0.4)]'
                      : 'border-white/20 text-on-surface-variant'
                }`}
              >
                {step > s.id ? <Icon name="check" size={18} /> : s.id}
              </div>
              <span className={`text-[12px] font-label ${step >= s.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 mb-5 ${step > s.id ? 'bg-primary-container' : 'bg-white/15'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
        {/* Step content */}
        <div className="surface-card rounded-xl p-6 md:p-8 animate-fade-in">
          {step === 1 && (
            <>
              <h2 className="font-display text-title-md text-on-surface mb-6 flex items-center gap-2">
                <Icon name="person" size={22} className="text-primary-container" /> Contact Info
              </h2>
              <Field label="Email Address">
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-field" />
              </Field>
              <Field label="Full Name">
                <input value={form.name} onChange={set('name')} placeholder="Alex Morgan" className="input-field" />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-title-md text-on-surface mb-6 flex items-center gap-2">
                <Icon name="credit_card" size={22} className="text-primary-container" /> Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setForm((f) => ({ ...f, method: 'card' }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${form.method === 'card' ? 'border-primary-container bg-primary-container/10 text-primary-container' : 'border-white/10 text-on-surface-variant hover:border-white/30'}`}
                >
                  <Icon name="credit_card" size={20} /> Card
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, method: 'apple' }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${form.method === 'apple' ? 'border-primary-container bg-primary-container/10 text-primary-container' : 'border-white/10 text-on-surface-variant hover:border-white/30'}`}
                >
                  <Icon name="phone_iphone" size={20} /> Apple Pay
                </button>
              </div>

              {form.method === 'card' ? (
                <>
                  <Field label="Card Number">
                    <div className="relative">
                      <input value={form.card} onChange={set('card')} placeholder="4242 4242 4242 4242" className="input-field pr-12" />
                      <Icon name="credit_card" size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline" />
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry">
                      <input value={form.expiry} onChange={set('expiry')} placeholder="MM / YY" className="input-field" />
                    </Field>
                    <Field label="CVC">
                      <input value={form.cvc} onChange={set('cvc')} placeholder="123" className="input-field" />
                    </Field>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-white/10 bg-surface-container-lowest p-8 text-center">
                  <Icon name="phone_iphone" size={36} className="text-on-surface mb-3" />
                  <p className="text-body-sm text-on-surface-variant">You'll confirm with Apple Pay on the next step.</p>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-title-md text-on-surface mb-6 flex items-center gap-2">
                <Icon name="fact_check" size={22} className="text-primary-container" /> Review Order
              </h2>
              <div className="flex flex-col gap-3 mb-6">
                {cartDetailed.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-on-surface truncate">{m.name}</p>
                      <p className="text-[12px] text-on-surface-variant">Qty {m.qty}</p>
                    </div>
                    <span className="text-body-sm font-medium text-on-surface">${(m.price * m.qty).toLocaleString()}.00</span>
                  </div>
                ))}
              </div>
              <div className="surface-card rounded-lg p-4 space-y-2 text-body-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Contact</span><span className="text-on-surface">{form.email}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Payment</span><span className="text-on-surface capitalize">{form.method === 'apple' ? 'Apple Pay' : `Card ····${form.card.slice(-4) || '4242'}`}</span></div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t hairline">
            {step > 1 ? (
              <button onClick={back} className="btn-ghost px-5 py-3"><Icon name="arrow_back" size={18} /> Back</button>
            ) : (
              <Link to="/cart" className="btn-ghost px-5 py-3"><Icon name="arrow_back" size={18} /> Cart</Link>
            )}
            {step < 3 ? (
              <button onClick={next} disabled={!canContinue} className="btn-primary px-6 py-3">
                Continue <Icon name="arrow_forward" size={18} />
              </button>
            ) : (
              <button onClick={complete} className="btn-primary px-6 py-3">
                <Icon name="lock" size={18} /> Pay ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 surface-card rounded-xl p-6">
          <h2 className="font-display text-body-lg font-semibold text-on-surface mb-5">Summary</h2>
          <div className="flex flex-col gap-3 max-h-52 overflow-y-auto no-scrollbar mb-5">
            {cartDetailed.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full" />
                </div>
                <span className="flex-1 text-body-sm text-on-surface truncate">{m.name} <span className="text-on-surface-variant">×{m.qty}</span></span>
                <span className="text-body-sm text-on-surface">${(m.price * m.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-body-sm border-t hairline pt-4">
            <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal</span><span className="text-on-surface">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Taxes & Fees</span><span className="text-on-surface">${taxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t hairline">
            <span className="font-display text-body-lg text-on-surface">Total</span>
            <span className="font-display text-title-md text-primary-container">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-5 text-[12px] text-on-surface-variant">
            <Icon name="lock" size={14} className="text-primary-container" /> SSL Secure Checkout
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-body-sm font-medium text-on-surface mb-2">{label}</span>
      {children}
    </label>
  )
}
