import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelCard from '../components/ModelCard.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import { SectionHeading, GlowOrb } from '../components/common.jsx'
import { MODELS, CATEGORIES, USE_CASES, CREATORS } from '../data/models.js'

const STATS = [
  { value: '2.400+', label: 'Model Kurasi' },
  { value: '120rb+', label: 'Builder Aktif' },
  { value: '4,9★', label: 'Rating Rata-rata' },
  { value: '99,99%', label: 'Uptime SLA' },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [quickView, setQuickView] = useState(null)
  const navigate = useNavigate()

  const trending = MODELS.filter((m) => m.badge === 'trending' || m.rating >= 4.8).slice(0, 4)
  const fresh = MODELS.slice(4, 8)

  const submit = (e) => {
    e.preventDefault()
    navigate(`/explore${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <div className="overflow-hidden">
      {/* ───────────── Hero ───────────── */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-16 pb-16">
        <GlowOrb className="top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px]" />
        <div className="flex flex-col items-center text-center gap-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff] animate-pulse" />
            <span className="font-label text-label-sm uppercase tracking-widest text-on-surface-variant text-[11px]">Marketplace AI Generasi Baru</span>
          </div>

          <h1 className="font-display text-[40px] leading-[1.05] sm:text-[56px] md:text-display-lg text-on-surface max-w-4xl">
            Temukan <span className="text-gradient">AI</span> yang Pas untuk Hidupmu
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Marketplace digital premium untuk model AI kurasi berperforma tinggi — dirancang untuk kebutuhan bisnis,
            kreatif, dan sehari-hari.
          </p>

          <form onSubmit={submit} className="w-full max-w-2xl mt-4 relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Icon name="search" className="text-outline" size={22} /></div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kamu butuh bantuan apa?" className="w-full bg-surface-container-lowest border border-white/10 rounded-full py-4 pl-14 pr-32 text-body-md text-on-surface placeholder:text-outline/70 outline-none focus:border-primary-container/50 transition-colors" />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center"><button type="submit" className="btn-primary px-5 py-2.5">Cari <Icon name="arrow_forward" size={16} /></button></div>
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary-container to-primary-fixed opacity-0 group-focus-within:opacity-20 blur-[8px] transition-opacity duration-500 -z-10" />
          </form>

          <div className="flex flex-wrap justify-center gap-2.5 mt-3">
            {USE_CASES.map((u) => (
              <Link key={u.id} to={`/explore?use=${u.id}`} className={`chip ${u.id === 'creative' ? 'chip-active' : ''}`}><Icon name={u.icon} size={16} />{u.label}</Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-16 rounded-xl overflow-hidden border border-white/[0.07] glass-panel">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-6 text-center bg-surface/30"><p className="font-display text-headline-md text-on-surface">{s.value}</p><p className="text-body-sm text-on-surface-variant mt-1">{s.label}</p></div>
          ))}
        </div>
      </section>

      {/* ───────────── Trending ───────────── */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading eyebrow="Live sekarang" title="Model Trending" subtitle="Kecerdasan paling powerful & populer saat ini."
          action={<Link to="/explore" className="btn-ghost px-5 py-2.5 self-start md:self-auto">Lihat Semua <Icon name="arrow_forward" size={18} /></Link>} className="mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {trending.map((m) => <ModelCard key={m.id} model={m} onQuickView={setQuickView} />)}
        </div>
      </section>

      {/* ───────────── Categories ───────────── */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading eyebrow="Jelajahi" title="Telusuri per Kategori" className="mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
            <Link key={c.id} to={`/explore?cat=${c.id}`} className="group surface-card rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:border-primary-container/30 electric-glow-hover transition-all">
              <span className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform"><Icon name={c.icon} size={24} /></span>
              <span className="text-body-sm font-medium text-on-surface">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── Featured ───────────── */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%]" />
        <div className="glass-panel rounded-2xl overflow-hidden relative grid md:grid-cols-2 min-h-[420px]">
          <div className="p-8 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-5"><span className="font-label text-label-sm uppercase tracking-widest text-primary-container">Produk Unggulan</span><span className="h-px w-12 bg-primary-container/30" /></div>
            <h2 className="font-display text-headline-md md:text-[44px] md:leading-[1.1] text-on-surface mb-4">Nexora <span className="text-primary-container font-light italic">Core Engine</span></h2>
            <p className="text-body-lg text-on-surface-variant mb-8 max-w-md">Model multimodal andalan kami. Integrasikan kecerdasan teks, gambar, dan suara ke alur kerjamu dengan latensi tak tertandingi.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/model/nexus-vision-pro" className="btn-primary px-6 py-3">Jelajahi Engine <Icon name="arrow_forward" size={18} /></Link>
              <Link to="/pricing" className="btn-ghost px-6 py-3">Lihat Harga</Link>
            </div>
          </div>
          <div className="relative min-h-[280px] bg-gradient-to-br from-surface-container-highest to-surface-container-lowest border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-center p-10">
            <div className="relative w-60 h-60">
              <div className="absolute inset-0 border border-primary-container/20 rounded-full animate-[spin_14s_linear_infinite]" />
              <div className="absolute inset-5 border border-dashed border-primary-container/40 rounded-full animate-[spin_18s_linear_infinite_reverse]" />
              <div className="absolute inset-12 border-2 border-primary-container/10 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-primary-container/20 rounded-full blur-xl" />
                <Icon name="all_inclusive" size={56} className="absolute text-primary-container" style={{ filter: 'drop-shadow(0 0 16px rgba(0,229,255,0.8))' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── New arrivals ───────────── */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading eyebrow="Terbaru" title="Baru Rilis" subtitle="Kecerdasan yang baru dipublikasikan dari kreator top."
          action={<Link to="/explore" className="btn-ghost px-5 py-2.5 self-start md:self-auto">Telusuri Semua <Icon name="arrow_forward" size={18} /></Link>} className="mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {fresh.map((m) => <ModelCard key={m.id} model={m} onQuickView={setQuickView} />)}
        </div>
      </section>

      {/* ───────────── Creators ───────────── */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading eyebrow="Para pembuat" title="Kreator Teratas"
          action={<Link to="/creators" className="btn-ghost px-5 py-2.5 self-start md:self-auto">Semua Kreator <Icon name="arrow_forward" size={18} /></Link>} className="mb-10" />
        <div className="grid sm:grid-cols-3 gap-gutter">
          {Object.values(CREATORS).map((c) => (
            <Link key={c.id} to={`/creator/${c.id}`} className="glass-panel rounded-xl p-6 flex items-center gap-4 hover:border-primary-container/30 electric-glow-hover transition-all">
              <span className="w-14 h-14 rounded-full overflow-hidden border border-white/10 shrink-0"><ModelArtwork seed={c.id} colors={c.art} className="w-full h-full" /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5"><p className="font-display text-body-lg font-semibold text-on-surface truncate">{c.name}</p>{c.verified && <Icon name="verified" size={16} className="text-primary-container shrink-0" fill />}</div>
                <p className="text-body-sm text-on-surface-variant truncate">{c.title}</p>
                <p className="text-[12px] text-outline mt-1">{c.stats.followers} pengikut</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="relative rounded-2xl overflow-hidden border border-primary-container/20 bg-gradient-to-br from-surface-container to-surface-container-lowest p-10 md:p-16 text-center">
          <GlowOrb className="top-0 right-0 w-[400px] h-[400px]" />
          <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-4 max-w-2xl mx-auto">Bangun, publikasikan & hasilkan dari model AI buatanmu</h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">Bergabung dengan ribuan kreator yang memonetisasi kecerdasan mereka di marketplace paling premium di industrinya.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/sell/start" className="btn-primary px-7 py-3.5">Mulai Jualan <Icon name="rocket_launch" size={18} /></Link>
            <Link to="/about" className="btn-ghost px-7 py-3.5">Selengkapnya</Link>
          </div>
        </div>
      </section>

      {quickView && <QuickViewModal model={quickView} onClose={() => setQuickView(null)} />}
    </div>
  )
}
