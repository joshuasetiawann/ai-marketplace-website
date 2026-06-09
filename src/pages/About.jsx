import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { SectionHeading, GlowOrb } from '../components/common.jsx'

const VALUES = [
  { icon: 'diamond', title: 'Precision Luxury', desc: 'Every detail is curated. We treat AI as a high-status craft, not a commodity.' },
  { icon: 'verified_user', title: 'Trust by Design', desc: 'Verified creators, transparent pricing and privacy-first deployment — always.' },
  { icon: 'bolt', title: 'Effortless Power', desc: 'Complex intelligence distilled into an intuitive, frictionless experience.' },
  { icon: 'groups', title: 'Creator First', desc: 'We exist to help builders monetize their genius on fair, generous terms.' },
]

const STATS = [
  { value: '2,400+', label: 'Curated models' },
  { value: '120k+', label: 'Active builders' },
  { value: '80%', label: 'Creator revenue share' },
  { value: '99.99%', label: 'Platform uptime' },
]

const TEAM = [
  { name: 'Elena Vasquez', role: 'Co-Founder & CEO', art: ['#0b3a44', '#00e5ff'] },
  { name: 'Marcus Lee', role: 'Co-Founder & CTO', art: ['#231038', '#a855f7'] },
  { name: 'Aria Nakamura', role: 'Head of Design', art: ['#311a2b', '#f472b6'] },
  { name: 'Daniel Brooks', role: 'Head of Marketplace', art: ['#10233a', '#3b82f6'] },
]

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-16 pb-12 text-center">
        <GlowOrb className="top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]" />
        <p className="font-label text-label-sm uppercase tracking-widest text-primary-container mb-4">About Nexora AI</p>
        <h1 className="font-display text-headline-lg md:text-display-md text-on-surface max-w-3xl mx-auto mb-6">
          We're building the world's most <span className="text-gradient">premium</span> marketplace for intelligence
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Nexora exists to bridge the gap between cutting-edge artificial intelligence and the visionaries who put it to
          work — quietly, expensively, effortlessly.
        </p>
      </section>

      {/* Mission */}
      <section id="mission" className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 scroll-mt-24">
        <div className="glass-panel rounded-2xl overflow-hidden grid md:grid-cols-2">
          <div className="p-8 md:p-14 flex flex-col justify-center">
            <SectionHeading eyebrow="Our Mission" title="Intelligence, elevated" className="mb-5" />
            <p className="text-body-lg text-on-surface-variant mb-4">
              The AI landscape is noisy and chaotic. We believe the best tools deserve a setting worthy of them — a
              curated gallery where quality is the only currency.
            </p>
            <p className="text-body-md text-on-surface-variant">
              Every model on Nexora is reviewed, benchmarked and presented with the care of a luxury showroom. No clutter,
              no hype. Just intelligence you can trust, ready to ship.
            </p>
          </div>
          <div className="relative min-h-[300px] bg-gradient-to-br from-surface-container-highest to-surface-container-lowest flex items-center justify-center p-10 border-t md:border-t-0 md:border-l border-white/5">
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 border border-primary-container/20 rounded-full animate-[spin_16s_linear_infinite]" />
              <div className="absolute inset-6 border border-dashed border-primary-container/40 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary-container/20 rounded-full blur-xl" />
                <Icon name="auto_awesome" size={48} className="absolute text-primary-container" style={{ filter: 'drop-shadow(0 0 16px rgba(0,229,255,0.8))' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.07] glass-panel">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center bg-surface/30">
              <p className="font-display text-headline-md text-primary-container">{s.value}</p>
              <p className="text-body-sm text-on-surface-variant mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading center eyebrow="What we stand for" title="Our Values" className="mb-10" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="surface-card rounded-xl p-6 hover:border-primary-container/30 transition-all">
              <span className="inline-flex w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/20 items-center justify-center text-primary-container mb-4">
                <Icon name={v.icon} size={24} />
              </span>
              <h3 className="font-display text-body-lg font-semibold text-on-surface mb-2">{v.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading center eyebrow="The people" title="Leadership" className="mb-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((t) => (
            <div key={t.name} className="surface-card rounded-xl overflow-hidden text-center group">
              <div className="h-44 relative">
                <div className="w-full h-full overflow-hidden">
                  <div className="w-full h-full" style={{ background: `radial-gradient(circle at 50% 35%, ${t.art[1]}40, ${t.art[0]} 70%)` }} />
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-5xl font-display font-bold text-white/90">{t.name.charAt(0)}</span>
              </div>
              <div className="p-5">
                <p className="font-display text-body-lg font-semibold text-on-surface">{t.name}</p>
                <p className="text-body-sm text-on-surface-variant">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="relative rounded-2xl overflow-hidden border border-primary-container/20 bg-gradient-to-br from-surface-container to-surface-container-lowest p-10 md:p-16 text-center">
          <GlowOrb className="bottom-0 left-0 w-[400px] h-[400px]" />
          <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-4">Join the marketplace</h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">Whether you build or buy, there's a place for you in the Nexora ecosystem.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary px-7 py-3.5">Create Account <Icon name="arrow_forward" size={18} /></Link>
            <Link to="/explore" className="btn-ghost px-7 py-3.5">Explore Models</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
