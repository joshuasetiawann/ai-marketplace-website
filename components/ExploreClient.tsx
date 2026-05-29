"use client";

import { useMemo, useState } from "react";
import Icon from "./Icon";
import ModelCard from "./ModelCard";
import { EmptyState } from "./common";
import { CATEGORIES, TIERS, USE_CASES, type Model } from "@/lib/catalog";

const SORTS = [
  { id: "trending", label: "Trending" },
  { id: "rating", label: "Rating Tertinggi" },
  { id: "price-low", label: "Harga: Termurah" },
  { id: "price-high", label: "Harga: Termahal" },
  { id: "newest", label: "Terbaru" },
];

export default function ExploreClient({
  models,
  wishlistedIds,
  loggedIn,
  initialQuery = "",
  initialCategory = "all",
  initialUseCase = "",
}: {
  models: Model[];
  wishlistedIds: string[];
  loggedIn: boolean;
  initialQuery?: string;
  initialCategory?: string;
  initialUseCase?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [useCase, setUseCase] = useState(initialUseCase);
  const [tiers, setTiers] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("trending");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const wished = useMemo(() => new Set(wishlistedIds), [wishlistedIds]);
  const toggleTier = (t: string) =>
    setTiers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const clearAll = () => {
    setQuery("");
    setCategory("all");
    setUseCase("");
    setTiers([]);
    setMinRating(0);
    setSort("trending");
  };

  const results = useMemo(() => {
    let list = [...models];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.tagline.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.useCaseTags.some((t) => t.toLowerCase().includes(q)),
      );
    if (category !== "all") list = list.filter((m) => m.category === category);
    if (useCase) list = list.filter((m) => m.useCases.includes(useCase));
    if (tiers.length) list = list.filter((m) => tiers.includes(m.tier));
    if (minRating) list = list.filter((m) => m.rating >= minRating);
    switch (sort) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        break;
      default:
        list.sort(
          (a, b) =>
            (b.badge === "trending" ? 1 : 0) - (a.badge === "trending" ? 1 : 0) || b.reviews - a.reviews,
        );
    }
    return list;
  }, [models, query, category, useCase, tiers, minRating, sort]);

  const activeFilterCount =
    (category !== "all" ? 1 : 0) + (useCase ? 1 : 0) + tiers.length + (minRating ? 1 : 0);

  const FiltersPanel = (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-title-md text-on-surface">Filter</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="font-label text-label-md text-primary-container transition-colors hover:text-primary">
            Hapus
          </button>
        )}
      </div>
      <FilterGroup label="Kategori">
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition-colors ${
                category === c.id
                  ? "bg-primary-container/10 text-primary-container"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <Icon name={c.icon} size={18} />
              {c.label}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Kegunaan">
        <div className="flex flex-wrap gap-2">
          {USE_CASES.map((u) => (
            <button
              key={u.id}
              onClick={() => setUseCase((prev) => (prev === u.id ? "" : u.id))}
              className={`chip ${useCase === u.id ? "chip-active" : ""}`}
            >
              <Icon name={u.icon} size={14} />
              {u.label}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Paket Harga">
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <button key={t} onClick={() => toggleTier(t)} className={`chip ${tiers.includes(t) ? "chip-active" : ""}`}>
              {t === "Free" ? "Gratis" : t}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Rating Minimum">
        <div className="flex flex-col gap-1">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm transition-colors ${
                minRating === r ? "bg-primary-container/10 text-primary-container" : "text-on-surface-variant hover:bg-white/5"
              }`}
            >
              <Icon name="star" size={16} className="text-secondary" fill />
              {r === 0 ? "Semua rating" : `${r} ke atas`}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
      <div className="mb-8">
        <h1 className="mb-2 font-display text-headline-md text-on-surface md:text-headline-lg">Jelajahi Model</h1>
        <p className="text-body-md text-on-surface-variant">
          Temukan model AI premium yang dikurasi untuk aplikasi berperforma tinggi.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, kemampuan, atau kategori…"
            className="input-field rounded-full pl-11"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setFiltersOpen(true)} className="btn-soft relative px-4 py-3 lg:hidden">
            <Icon name="tune" size={20} /> Filter
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-container text-[11px] font-bold text-on-primary-container">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative">
            <Icon name="sort" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-full cursor-pointer appearance-none rounded-full border border-white/10 bg-surface-container-lowest py-3 pl-10 pr-10 text-body-sm text-on-surface outline-none focus:border-primary-container/50"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-surface-container">
                  {s.label}
                </option>
              ))}
            </select>
            <Icon name="expand_more" size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl surface-card p-5">{FiltersPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-body-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">{results.length}</span> model ditemukan
            </p>
          </div>
          {results.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((m) => (
                <ModelCard key={m.id} model={m} wishlisted={wished.has(m.id)} loggedIn={loggedIn} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search_off"
              title="Tidak ada model yang cocok"
              message="Coba ubah kata kunci pencarian atau hapus beberapa filter untuk melihat lebih banyak hasil."
              action={
                <button onClick={clearAll} className="btn-primary px-6 py-3">
                  <Icon name="restart_alt" size={18} /> Reset filter
                </button>
              }
            />
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[65] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 top-0 w-[85%] max-w-sm overflow-y-auto border-r border-white/10 p-6 glass-nav animate-slide-in-right">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-title-md">Filter</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2 text-on-surface-variant">
                <Icon name="close" size={24} />
              </button>
            </div>
            {FiltersPanel}
            <button onClick={() => setFiltersOpen(false)} className="btn-primary sticky bottom-0 mt-8 w-full py-3">
              Tampilkan {results.length} hasil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-label text-label-sm uppercase tracking-wider text-outline">{label}</p>
      {children}
    </div>
  );
}
