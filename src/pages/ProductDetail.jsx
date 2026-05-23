import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import ModelCard from '../components/ModelCard.jsx'
import StarRating from '../components/StarRating.jsx'
import { TierBadge, StatusBadge } from '../components/Badge.jsx'
import { SectionHeading } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getModel, getCreator } from '../data/models.js'
import { toIDR, formatIDR } from '../data/payment.js'

const REVIEWS = [
  { name: 'Maya Chen', role: 'Creative Director', rating: 5, text: 'Genuinely the most coherent output I have seen. It cut our production time in half and the quality is editorial-grade.', when: '2 weeks ago' },
  { name: 'David Okafor', role: 'ML Engineer', rating: 5, text: 'Integration was painless and latency is exactly as advertised. The API docs are clean and the SDKs just work.', when: '1 month ago' },
  { name: 'Sofia Rossi', role: 'Indie Game Dev', rating: 4, text: 'Incredible value for the price. Occasionally needs a second pass on edge cases, but the results are stunning.', when: '1 month ago' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { catalog, addToCart, isWishlisted, toggleWishlist, recordView, orders, toast } = useApp()
  const model = catalog.find((m) => m.id === id) || getModel(id)
  const [activeImg, setActiveImg] = useState(0)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (model) recordView(model.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const owned = orders.some((o) => o.items.some((it) => it.id === id))

  if (!model) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
        <Icon name="search_off" size={48} className="text-outline mb-4" />
        <h1 className="font-display text-headline-md mb-2">Model tidak ditemukan</h1>
        <Link to="/explore" className="btn-primary px-6 py-3 mt-4">Kembali ke Jelajahi</Link>
      </div>
    )
  }

  const creator = getCreator(model.creatorId) || {
    id: model.ownerId || 'studio', name: model.ownerName || 'Studio Independen',
    verified: false, art: model.art || ['#0b3a44', '#00e5ff'], title: 'Kreator marketplace',
    stats: { followers: '—' },
  }
  const saved = isWishlisted(model.id)
  const related = catalog.filter((m) => m.id !== model.id && (m.category === model.category || m.creatorId === model.creatorId)).slice(0, 4)
  const ratingBreakdown = [76, 18, 4, 1, 1]

  const buyNow = () => {
    addToCart(model.id, 1, model.name)
    navigate('/checkout')
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6 flex-wrap">
        <Link to="/" className="hover:text-on-surface">Beranda</Link>
        <Icon name="chevron_right" size={16} />
        <Link to="/explore" className="hover:text-on-surface">Jelajahi</Link>
        <Icon name="chevron_right" size={16} />
        <Link to={`/explore?cat=${model.category}`} className="hover:text-on-surface capitalize">{model.category}</Link>
        <Icon name="chevron_right" size={16} />
        <span className="text-on-surface">{model.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 mb-16">
        {/* Gallery */}
        <div>
          <div className="relative rounded-2xl overflow-hidden glass-panel aspect-[16/10] mb-4">
            <ModelArtwork key={activeImg} seed={`${model.id}-${activeImg}`} colors={model.art} icon={model.icon} className="w-full h-full animate-fade-in-fast" />
            {model.badge && <div className="absolute top-4 left-4"><StatusBadge type={model.badge} /></div>}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: model.gallery }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative rounded-lg overflow-hidden aspect-video border transition-all ${
                  activeImg === i ? 'border-primary-container ring-2 ring-primary-container/30' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <ModelArtwork seed={`${model.id}-${i}`} colors={model.art} className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Summary / purchase */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2 mb-4">
            <TierBadge tier={model.tier} />
            <span className="text-[11px] font-mono text-outline uppercase tracking-wide">{model.category}</span>
          </div>
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-3">{model.name}</h1>
          <p className="text-body-lg text-on-surface-variant mb-5">{model.tagline}</p>

          <div className="flex items-center gap-4 mb-6">
            <StarRating value={model.rating} count={model.reviews} showValue />
            <Link to={`/creator/${creator.id}`} className="flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-primary-container transition-colors">
              <span className="w-6 h-6 rounded-full overflow-hidden">
                <ModelArtwork seed={creator.id} colors={creator.art} className="w-full h-full" />
              </span>
              {creator.name}
              {creator.verified && <Icon name="verified" size={14} className="text-primary-container" fill />}
            </Link>
          </div>

          <div className="surface-card rounded-xl p-6 mb-4">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-body-sm text-on-surface-variant">Langganan</p>
                <p className="font-display text-headline-md text-on-surface leading-none mt-1">
                  {model.price === 0 ? <span className="text-success">Gratis</span> : formatIDR(toIDR(model.price))}
                  {model.price !== 0 && <span className="text-body-md text-on-surface-variant font-normal">/bln</span>}
                </p>
              </div>
              {owned ? (
                <span className="inline-flex items-center gap-1 text-primary-container text-body-sm bg-primary-container/10 px-3 py-1 rounded-full"><Icon name="check_circle" size={16} fill /> Dimiliki</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-success text-body-sm bg-success/10 px-3 py-1 rounded-full"><Icon name="check_circle" size={16} fill /> Tersedia</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {owned ? (
                <button onClick={() => toast('Membuka studio produk…', { icon: 'rocket_launch' })} className="btn-primary w-full py-3.5">
                  <Icon name="lock_open" size={18} /> Akses Produk
                </button>
              ) : (
                <button onClick={buyNow} className="btn-primary w-full py-3.5">
                  <Icon name="bolt" size={18} fill /> Beli Sekarang
                </button>
              )}
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <button onClick={() => addToCart(model.id, 1, model.name)} className="btn-ghost py-3.5">
                  <Icon name="add_shopping_cart" size={18} /> Tambah Keranjang
                </button>
                <button
                  onClick={() => toggleWishlist(model.id, model.name)}
                  className={`btn-soft px-4 ${saved ? 'text-primary-container border-primary-container/40' : ''}`}
                  aria-label="Save to wishlist"
                >
                  <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={20} fill={saved} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-4 text-[12px] text-on-surface-variant">
              <span className="flex items-center gap-1.5"><Icon name="lock" size={14} className="text-primary-container" /> Checkout aman · batal kapan saja</span>
              <button onClick={() => toast('Laporan terkirim. Tim kami akan meninjau produk ini.', { icon: 'flag' })} className="flex items-center gap-1 hover:text-error transition-colors"><Icon name="flag" size={14} /> Laporkan</button>
            </div>
          </div>

          {/* Specs */}
          <div className="surface-card rounded-xl p-6">
            <h3 className="font-label text-label-sm uppercase tracking-wider text-outline mb-4">Spesifikasi Model</h3>
            <dl className="grid grid-cols-2 gap-4">
              {Object.entries(model.specs).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] text-on-surface-variant">{k}</dt>
                  <dd className="text-body-md font-medium text-on-surface font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b hairline mb-8 flex gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Ringkasan' },
          { id: 'capabilities', label: 'Kemampuan' },
          { id: 'reviews', label: `Ulasan (${model.reviews.toLocaleString('id-ID')})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 font-label text-label-md whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-primary-container text-primary-container' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-16">
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 animate-fade-in">
            <div>
              <h2 className="font-display text-title-md text-on-surface mb-4">Ringkasan</h2>
              <p className="text-body-lg text-on-surface-variant leading-relaxed mb-8">{model.description}</p>
              <h3 className="font-display text-body-lg font-semibold text-on-surface mb-4">Kegunaan Utama</h3>
              <div className="flex flex-wrap gap-2">
                {model.useCaseTags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>
            <div className="surface-card rounded-xl p-6 h-fit">
              <h3 className="font-display text-body-lg font-semibold text-on-surface mb-4">Kenapa pilih model ini</h3>
              <ul className="flex flex-col gap-4">
                {['Keandalan siap produksi', 'Harga transparan & dapat diprediksi', 'Dukungan API & SDK kelas satu', 'Didukung kreator terverifikasi'].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-body-sm text-on-surface-variant">
                    <Icon name="check_circle" size={18} className="text-primary-container shrink-0 mt-0.5" fill />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'capabilities' && (
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
            {model.capabilities.map((c) => (
              <div key={c.title} className="surface-card rounded-xl p-6 hover:border-primary-container/30 electric-glow-hover transition-all">
                <div className="w-11 h-11 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container mb-4">
                  <Icon name={c.icon} size={22} />
                </div>
                <h3 className="font-display text-body-lg font-semibold text-on-surface mb-1.5">{c.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{c.text}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 animate-fade-in">
            <div className="surface-card rounded-xl p-6 h-fit">
              <div className="text-center mb-6">
                <p className="font-display text-display-md text-on-surface">{model.rating}</p>
                <StarRating value={model.rating} size={20} className="justify-center my-2" />
                <p className="text-body-sm text-on-surface-variant">{model.reviews.toLocaleString('id-ID')} ulasan</p>
              </div>
              <div className="flex flex-col gap-2">
                {ratingBreakdown.map((pct, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[12px] text-on-surface-variant w-3">{5 - i}</span>
                    <Icon name="star" size={12} className="text-secondary" fill />
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] text-on-surface-variant w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {REVIEWS.map((r) => (
                <div key={r.name} className="surface-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary-container font-bold">
                        {r.name.charAt(0)}
                      </span>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">{r.name}</p>
                        <p className="text-[12px] text-on-surface-variant">{r.role}</p>
                      </div>
                    </div>
                    <span className="text-[12px] text-outline">{r.when}</span>
                  </div>
                  <StarRating value={r.rating} size={14} className="mb-2" />
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <SectionHeading title="Mungkin kamu suka" className="mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
            {related.map((m) => (
              <ModelCard key={m.id} model={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
