import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { SectionHeading, GlowOrb } from '../components/common.jsx'

const PLANS = [
  {
    name: 'Discovery',
    price: { mo: 0, yr: 0 },
    tagline: 'Essential tools to begin your exploration of the Nexora ecosystem.',
    cta: 'Begin Free',
    to: '/register',
    highlight: false,
    features: ['100 AI generations per month', 'Standard resolution outputs', 'Access to public community models', 'Community support'],
  },
  {
    name: 'Creator',
    price: { mo: 29, yr: 290 },
    tagline: 'Unleash full creative potential with priority processing and premium models.',
    cta: 'Upgrade to Creator',
    to: '/register',
    highlight: true,
    features: ['Unlimited AI generations', '4K high-resolution outputs', 'Priority GPU processing cluster', 'Exclusive access to Pro models', 'Commercial usage rights'],
  },
  {
    name: 'Professional',
    price: { mo: 99, yr: 990 },
    tagline: 'Enterprise-grade infrastructure for studios and high-volume professionals.',
    cta: 'Contact Sales',
    to: '/help',
    highlight: false,
    features: ['Everything in Creator, plus', 'Dedicated server node assignment', 'Custom API integration', 'White-glove onboarding support', 'Advanced team collaboration tools'],
  },
]

const FAQ = [
  { q: 'Can I switch plans later?', a: 'Yes — upgrade, downgrade or cancel anytime from your account settings. Changes are prorated automatically.' },
  { q: 'Do unused generations roll over?', a: 'Generations reset monthly on the Discovery plan. Creator and Professional plans include unlimited generations.' },
  { q: 'Is there a free trial for paid plans?', a: 'Every paid plan includes a 14-day money-back guarantee, no questions asked.' },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const [open, setOpen] = useState(0)

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 relative">
      <GlowOrb className="top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px]" />

      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-label text-label-sm uppercase tracking-widest text-primary-container mb-3">Pricing</p>
        <h1 className="font-display text-headline-lg md:text-display-md text-on-surface mb-4">Precision Luxury Intelligence</h1>
        <p className="text-body-lg text-on-surface-variant">
          Select the tier that aligns with your creative ambitions. Experience frictionless AI integration tailored for visionaries.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-body-sm ${!annual ? 'text-on-surface' : 'text-on-surface-variant'}`}>Monthly</span>
        <button
          onClick={() => setAnnual((a) => !a)}
          className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-primary-container' : 'bg-white/15'}`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${annual ? 'left-8' : 'left-1'}`} />
        </button>
        <span className={`text-body-sm ${annual ? 'text-on-surface' : 'text-on-surface-variant'}`}>
          Annual <span className="text-success text-[12px] ml-1">Save 16%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid lg:grid-cols-3 gap-6 items-start mb-20">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl p-7 flex flex-col ${
              p.highlight
                ? 'glass-panel border-primary-container/40 lg:-mt-4 lg:mb-4 electric-glow'
                : 'surface-card'
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-[0_0_16px_rgba(0,229,255,0.4)]">
                Recommended
              </span>
            )}
            <h3 className={`font-display text-title-md mb-2 ${p.highlight ? 'text-primary-container' : 'text-on-surface'}`}>{p.name}</h3>
            <div className="flex items-end gap-1 mb-3">
              <span className="font-display text-display-md text-on-surface leading-none">
                ${annual ? Math.round(p.price.yr / 12) : p.price.mo}
              </span>
              <span className="text-body-md text-on-surface-variant mb-1">/mo</span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-6 min-h-[40px]">{p.tagline}</p>
            <Link to={p.to} className={`${p.highlight ? 'btn-primary' : 'btn-ghost'} w-full py-3 mb-6`}>
              {p.cta}
            </Link>
            <ul className="flex flex-col gap-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-body-sm text-on-surface-variant">
                  <Icon name="check_circle" size={18} className={p.highlight ? 'text-primary-container shrink-0 mt-0.5' : 'text-on-surface-variant shrink-0 mt-0.5'} fill={p.highlight} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <SectionHeading center title="Frequently asked questions" className="mb-8" />
        <div className="flex flex-col gap-3">
          {FAQ.map((f, i) => (
            <div key={f.q} className="surface-card rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-body-md font-medium text-on-surface">{f.q}</span>
                <Icon name={open === i ? 'remove' : 'add'} size={22} className="text-primary-container shrink-0" />
              </button>
              {open === i && <p className="px-6 pb-5 text-body-sm text-on-surface-variant animate-fade-in-fast">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
