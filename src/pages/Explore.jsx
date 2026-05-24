import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelCard from '../components/ModelCard.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import { EmptyState } from '../components/common.jsx'
import { CardGridSkeleton } from '../components/Skeleton.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES, TIERS, USE_CASES } from '../data/models.js'

const SORTS = [
  { id: 'trending', label: 'Trending' },
  { id: 'rating', label: 'Rating Tertinggi' },
  { id: 'price-low', label: 'Harga: Termurah' },
  { id: 'price-high', label: 'Harga: Termahal' },
  { id: 'newest', label: 'Terbaru' },
]

export default function Explore() {
  const { catalog } = useApp()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('cat') || 'all')
  const [useCase, setUseCase] = useState(params.get('use') || '')
  const [tiers, setTiers] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('trending')
  const [quickView, setQuickView] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Simulate an initial catalog fetch to showcase the loading state.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setQuery(params.get('q') || '')
    if (params.get('cat')) setCategory(params.get('cat'))
    if (params.get('use')) setUseCase(params.get('use'))
  }, [params])

  const toggleTier = (t) => setTiers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const clearAll = () => {
    setQuery(''); setCategory('all'); setUseCase(''); setTiers([]); setMinRating(0); setSort('trending'); setParams({})
  }

  const results = useMemo(() => {
    let list = [...catalog]
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || m.tagline.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.useCaseTags.some((t) => t.toLowerCase().includes(q)))
    if (category !== 'all') list = list.filter((m) => m.category === category)
    if (useCase) list = list.filter((m) => m.useCases.includes(useCase))
    if (tiers.length) list = list.filter((m) => tiers.includes(m.tier))
    if (minRating) list = list.filter((m) => m.rating >= minRating)
    switch (sort) {
      case 'rating': list.sort((a, b) => b.rating - a.rating); break
      case 'price-low': list.sort((a, b) => a.price - b.price); break
      case 'price-high': list.sort((a, b) => b.price - a.price); break
      case 'newest': list.reverse(); break
      default: list.sort((a, b) => (b.badge === 'trending' ? 1 : 0) - (a.badge === 'trending' ? 1 : 0) || b.reviews - a.reviews)
    }
    return list
  }, [catalog, query, category, useCase, tiers, minRating, sort])

  const activeFilterCount = (category !== 'all' ? 1 : 0) + (useCase ? 1 : 0) + tiers.length + (minRating ? 1 : 0)

  const FiltersPanel = (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-title-md text-on-surface">Filter</h3>
        {activeFilterCount > 0 && <button onClick={clearAll} className="text-label-md font-label text-primary-container hover:text-primary transition-colors">Hapus</button>}
      </div>
      <FilterGroup label="Kategori">
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm transition-colors ${category === c.id ? 'bg-primary-container/10 text-primary-container' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
              <Icon name={c.icon} size={18} />{c.label}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Kegunaan">
        <div className="flex flex-wrap gap-2">
          {USE_CASES.map((u) => <button key={u.id} onClick={() => setUseCase((prev) => (prev === u.id ? '' : u.id))} className={`chip ${useCase === u.id ? 'chip-active' : ''}`}><Icon name={u.icon} size={14} />{u.label}</button>)}
        </div>
      </FilterGroup>
      <FilterGroup label="Paket Harga">
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => <button key={t} onClick={() => toggleTier(t)} className={`chip ${tiers.includes(t) ? 'chip-active' : ''}`}>{t === 'Free' ? 'Gratis' : t}</button>)}
        </div>
      </FilterGroup>
      <FilterGroup label="Rating Minimum">
        <div className="flex flex-col gap-1">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm transition-colors ${minRating === r ? 'bg-primary-container/10 text-primary-container' : 'text-on-surface-variant hover:bg-white/5'}`}>
              <Icon name="star" size={16} className="text-secondary" fill />{r === 0 ? 'Semua rating' : `${r} ke atas`}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  )

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="mb-8">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-2">Jelajahi Model</h1>
        <p className="text-body-md text-on-surface-variant">Temukan model AI premium yang dikurasi untuk aplikasi berperforma tinggi.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, kemampuan, atau kategori…" className="input-field pl-11 rounded-full" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setFiltersOpen(true)} className="lg:hidden btn-soft px-4 py-3 relative">
            <Icon name="tune" size={20} /> Filter
            {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <div className="relative">
            <Icon name="sort" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-surface-container-lowest border border-white/10 rounded-full pl-10 pr-10 py-3 text-body-sm text-on-surface outline-none focus:border-primary-container/50 cursor-pointer h-full">
              {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-surface-container">{s.label}</option>)}
            </select>
            <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0"><div className="sticky top-24 surface-card rounded-xl p-5">{FiltersPanel}</div></aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-body-sm text-on-surface-variant">{loading ? 'Memuat…' : <><span className="text-on-surface font-semibold">{results.length}</span> model ditemukan</>}</p>
          </div>
          {loading ? (
            <CardGridSkeleton count={6} />
          ) : results.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {results.map((m) => <ModelCard key={m.id} model={m} onQuickView={setQuickView} />)}
            </div>
          ) : (
            <EmptyState icon="search_off" title="Tidak ada model yang cocok" message="Coba ubah kata kunci pencarian atau hapus beberapa filter untuk melihat lebih banyak hasil."
              action={<button onClick={clearAll} className="btn-primary px-6 py-3"><Icon name="restart_alt" size={18} /> Reset filter</button>} />
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[65] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm glass-nav border-r border-white/10 p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6"><h3 className="font-display text-title-md">Filter</h3><button onClick={() => setFiltersOpen(false)} className="p-2 text-on-surface-variant"><Icon name="close" size={24} /></button></div>
            {FiltersPanel}
            <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full py-3 mt-8 sticky bottom-0">Tampilkan {results.length} hasil</button>
          </div>
        </div>
      )}

      {quickView && <QuickViewModal model={quickView} onClose={() => setQuickView(null)} />}
    </div>
  )
}

function FilterGroup({ label, children }) {
  return <div><p className="font-label text-label-sm uppercase tracking-wider text-outline mb-3">{label}</p>{children}</div>
}
