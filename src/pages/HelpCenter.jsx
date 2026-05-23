import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const TOPICS = [
  { icon: 'rocket_launch', title: 'Getting Started', desc: 'Set up your account and first model', count: 12 },
  { icon: 'credit_card', title: 'Billing & Plans', desc: 'Subscriptions, invoices and refunds', count: 8 },
  { icon: 'api', title: 'API & Integration', desc: 'Keys, SDKs and webhooks', count: 24 },
  { icon: 'storefront', title: 'Selling on Nexora', desc: 'Publish and monetize your models', count: 15 },
  { icon: 'shield', title: 'Trust & Safety', desc: 'Usage policy and content rules', count: 6 },
  { icon: 'settings', title: 'Account', desc: 'Profile, security and preferences', count: 10 },
]

const FAQ = [
  { q: 'How do I integrate a model into my application?', a: 'Every model ships with REST endpoints and SDKs for Python, JavaScript and Go. Grab your API key from Settings → Billing, then follow the model\'s documentation tab for copy-paste examples.' },
  { q: 'What happens when I reach my usage limit?', a: 'On metered plans, requests beyond your quota are billed at the listed overage rate. On the Discovery plan, generations pause until your monthly reset or until you upgrade.' },
  { q: 'How do payouts work for creators?', a: 'Creators earn 80% of net revenue. Payouts are processed monthly to your connected bank account once your balance exceeds $50.' },
  { q: 'Can I get a refund?', a: 'Yes — all paid plans include a 14-day money-back guarantee. Contact support from this page and we\'ll process it within 48 hours.' },
  { q: 'Is my data used to train models?', a: 'Never. Your prompts and outputs are private by default and are not used for training. Enterprise plans add zero-retention, in-VPC deployment.' },
]

export default function HelpCenter() {
  const { toast } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(-1)

  const filtered = FAQ.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      {/* Hero */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary-container/[0.06] blur-[100px] rounded-full -z-10" />
        <h1 className="font-display text-headline-lg md:text-display-md text-on-surface mb-4">How can we help?</h1>
        <p className="text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">Search our knowledge base or reach our team — we're online 24/7.</p>
        <div className="relative max-w-xl mx-auto">
          <Icon name="search" size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for answers…"
            className="w-full bg-surface-container-lowest border border-white/10 rounded-full py-4 pl-14 pr-5 text-body-md text-on-surface placeholder:text-outline/70 outline-none focus:border-primary-container/50 transition-colors"
          />
        </div>
      </section>

      {/* Topics */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOPICS.map((t) => (
            <button
              key={t.title}
              onClick={() => toast(`Opening ${t.title}`, { icon: t.icon })}
              className="surface-card rounded-xl p-6 text-left hover:border-primary-container/30 electric-glow-hover transition-all flex items-start gap-4 group"
            >
              <span className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform shrink-0">
                <Icon name={t.icon} size={24} />
              </span>
              <div>
                <h3 className="font-display text-body-lg font-semibold text-on-surface mb-1">{t.title}</h3>
                <p className="text-body-sm text-on-surface-variant mb-2">{t.desc}</p>
                <span className="text-[12px] text-outline">{t.count} articles</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <h2 className="font-display text-title-md text-on-surface mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-3">
          {filtered.length ? (
            filtered.map((f, i) => (
              <div key={f.q} className="surface-card rounded-xl overflow-hidden">
                <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="text-body-md font-medium text-on-surface">{f.q}</span>
                  <Icon name={open === i ? 'remove' : 'add'} size={22} className="text-primary-container shrink-0" />
                </button>
                {open === i && <p className="px-6 pb-5 text-body-sm text-on-surface-variant leading-relaxed animate-fade-in-fast">{f.a}</p>}
              </div>
            ))
          ) : (
            <p className="text-body-md text-on-surface-variant text-center py-8">No articles match "{query}".</p>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: 'chat', title: 'Live Chat', desc: 'Average reply in 2 minutes', action: 'Start Chat', fn: () => toast('Connecting you to an agent…', { icon: 'chat' }) },
            { icon: 'mail', title: 'Email Support', desc: 'support@nexora.ai', action: 'Send Email', fn: () => toast('Email client opened', { icon: 'mail' }) },
            { icon: 'forum', title: 'Community', desc: 'Ask 120k+ builders', action: 'Visit Forum', fn: () => toast('Opening community…', { icon: 'forum' }) },
          ].map((c) => (
            <div key={c.title} className="glass-panel rounded-xl p-6 text-center">
              <span className="inline-flex w-12 h-12 rounded-full bg-primary-container/10 items-center justify-center text-primary-container mb-4"><Icon name={c.icon} size={24} /></span>
              <h3 className="font-display text-body-lg font-semibold text-on-surface mb-1">{c.title}</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">{c.desc}</p>
              <button onClick={c.fn} className="btn-soft px-5 py-2.5 w-full">{c.action}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
