"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Icon from "./Icon";
import ModelCard from "./ModelCard";
import ModelArtwork from "./ModelArtwork";
import StarRating from "./StarRating";
import { TierBadge } from "./Badge";
import { EmptyState } from "./common";
import { CATEGORIES, CATEGORY_COUNTS, TIERS, USE_CASES, type Model } from "@/lib/catalog";
import { PRICE_MAX_IDR, PRICE_STEP_IDR, toIDR, formatIDRShort } from "@/lib/pricing";

const SORTS = [
  { id: "trending", label: "Trending" },
  { id: "rating", label: "Rating Tertinggi" },
  { id: "price-low", label: "Harga: Termurah" },
  { id: "price-high", label: "Harga: Termahal" },
  { id: "newest", label: "Terbaru" },
];

type Params = {
  q: string;
  cat: string;
  use: string;
  tiers: string[];
  minRating: number;
  maxIdr: number;
  sort: string;
  page: number;
};

export default function ExploreClient({
  models,
  total,
  hasMore,
  wishlistedIds,
  loggedIn,
  params,
}: {
  models: Model[];
  total: number;
  hasMore: boolean;
  wishlistedIds: string[];
  loggedIn: boolean;
  params: Params;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { q, cat, use, tiers, minRating, maxIdr, sort } = params;

  const [search, setSearch] = useState(q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  // slider position while dragging; committed to the URL debounced
  const [priceIdr, setPriceIdr] = useState(maxIdr || PRICE_MAX_IDR);
  const wished = useMemo(() => new Set(wishlistedIds), [wishlistedIds]);

  // build a URL from the current params + a patch; any patch except {page}
  // resets pagination back to the first page.
  type Patch = Record<string, string | number | undefined>;
  const buildUrl = (patch: Patch) => {
    const merged: Record<string, string> = {
      q,
      cat,
      use,
      tier: tiers.join(","),
      rating: minRating ? String(minRating) : "",
      max: maxIdr ? String(maxIdr) : "",
      sort,
    };
    Object.entries(patch).forEach(([k, v]) => {
      merged[k] = v == null ? "" : String(v);
    });
    const p = new URLSearchParams();
    if (merged.q) p.set("q", merged.q);
    if (merged.cat && merged.cat !== "all") p.set("cat", merged.cat);
    if (merged.use) p.set("use", merged.use);
    if (merged.tier) p.set("tier", merged.tier);
    if (merged.rating) p.set("rating", merged.rating);
    if (merged.max) p.set("max", merged.max);
    if (merged.sort && merged.sort !== "trending") p.set("sort", merged.sort);
    const pg = Number(patch.page) || 0;
    if (pg > 1) p.set("page", String(pg));
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const go = (patch: Patch, opts?: { scroll?: boolean }) => router.push(buildUrl(patch), opts);

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim() !== q) go({ q: search.trim() });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // resync slider when the URL param changes from outside (chip ✕, Hapus semua) —
  // React's derive-state-from-props pattern (adjust during render, no effect)
  const [prevMaxIdr, setPrevMaxIdr] = useState(maxIdr);
  if (prevMaxIdr !== maxIdr) {
    setPrevMaxIdr(maxIdr);
    setPriceIdr(maxIdr || PRICE_MAX_IDR);
  }

  // debounced price slider → URL (PRICE_MAX_IDR = slider parked right = off)
  useEffect(() => {
    const committed = priceIdr >= PRICE_MAX_IDR ? 0 : priceIdr;
    if (committed === maxIdr) return;
    const t = setTimeout(() => go({ max: committed || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceIdr]);

  const toggleTier = (t: string) => {
    const next = tiers.includes(t) ? tiers.filter((x) => x !== t) : [...tiers, t];
    go({ tier: next.join(",") });
  };
  const clearAll = () => {
    setSearch("");
    setPriceIdr(PRICE_MAX_IDR);
    router.push(pathname);
  };

  const activeFilterCount =
    (cat !== "all" ? 1 : 0) + (use ? 1 : 0) + tiers.length + (minRating ? 1 : 0) + (maxIdr ? 1 : 0);

  const FiltersPanel = (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-title-md text-on-surface">Filter</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="font-label text-label-md text-primary-container transition-colors hover:text-primary">
            Reset
          </button>
        )}
      </div>
      <FilterGroup label="Kategori">
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => go({ cat: c.id })}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition-colors ${
                cat === c.id
                  ? "bg-primary-container/10 text-primary-container"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <Icon name={c.icon} size={18} />
              {c.label}
              {CATEGORY_COUNTS[c.id] && (
                <span className={`ml-auto font-mono text-[11px] ${cat === c.id ? "text-primary-container/80" : "text-outline"}`}>
                  {CATEGORY_COUNTS[c.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Rentang Harga">
        <input
          type="range"
          min={PRICE_STEP_IDR}
          max={PRICE_MAX_IDR}
          step={PRICE_STEP_IDR}
          value={priceIdr}
          onChange={(e) => setPriceIdr(Number(e.target.value))}
          aria-label="Harga maksimum"
          className="w-full cursor-pointer accent-primary-container"
        />
        <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
          <span>Rp 0</span>
          <span className={priceIdr < PRICE_MAX_IDR ? "text-primary-container" : ""}>
            {priceIdr >= PRICE_MAX_IDR ? "Rp 2jt+" : `≤ ${formatIDRShort(priceIdr)}`}
          </span>
        </div>
      </FilterGroup>
      <FilterGroup label="Kegunaan">
        <div className="flex flex-wrap gap-2">
          {USE_CASES.map((u) => (
            <button
              key={u.id}
              onClick={() => go({ use: use === u.id ? "" : u.id })}
              className={`chip ${use === u.id ? "chip-active" : ""}`}
            >
              <Icon name={u.icon} size={14} />
              {u.label}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Paket">
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
              onClick={() => go({ rating: r ? String(r) : "" })}
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
        <p className="mb-2 eyebrow-mono">
          <span className="mr-1 opacity-60">{"//"}</span>Katalog
        </p>
        <h1 className="mb-2 font-display text-headline-md text-on-surface md:text-headline-lg">Jelajahi Model</h1>
        <p className="text-body-md text-on-surface-variant">
          Temukan model AI premium yang dikurasi untuk aplikasi berperforma tinggi.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kemampuan, atau kategori…"
            aria-label="Cari model"
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
              onChange={(e) => go({ sort: e.target.value })}
              aria-label="Urutkan"
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
          <div className="hidden overflow-hidden rounded-full border border-white/10 sm:flex" role="group" aria-label="Mode tampilan">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Tampilan grid"
              className={`px-3.5 transition-colors ${view === "grid" ? "bg-primary-container/15 text-primary-container" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <Icon name="grid_view" size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="Tampilan daftar"
              className={`border-l border-white/10 px-3.5 transition-colors ${view === "list" ? "bg-primary-container/15 text-primary-container" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <Icon name="view_list" size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)] rounded-xl surface-card p-5">{FiltersPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {activeFilterCount > 0 && (
                <>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-outline">Filter:</span>
                  {cat !== "all" && (
                    <FilterChip label={CATEGORIES.find((c) => c.id === cat)?.label ?? cat} onClear={() => go({ cat: "all" })} />
                  )}
                  {use && (
                    <FilterChip label={USE_CASES.find((u) => u.id === use)?.label ?? use} onClear={() => go({ use: "" })} />
                  )}
                  {tiers.map((t) => (
                    <FilterChip key={t} label={t === "Free" ? "Gratis" : t} onClear={() => toggleTier(t)} />
                  ))}
                  {minRating > 0 && (
                    <FilterChip label={`${String(minRating).replace(".", ",")}★ ke atas`} onClear={() => go({ rating: "" })} />
                  )}
                  {maxIdr > 0 && (
                    <FilterChip label={`≤ ${formatIDRShort(maxIdr)}`} onClear={() => go({ max: undefined })} />
                  )}
                  <button
                    onClick={clearAll}
                    className="ml-1 text-body-sm text-primary-container transition-colors hover:text-primary"
                  >
                    Hapus semua
                  </button>
                </>
              )}
            </div>
            <p className="text-body-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">{total}</span> model ditemukan
            </p>
          </div>
          {models.length ? (
            <>
              {view === "grid" ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {models.map((m) => (
                    <ModelCard key={m.id} model={m} wishlisted={wished.has(m.id)} loggedIn={loggedIn} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {models.map((m) => (
                    <ModelRow key={m.id} model={m} />
                  ))}
                </div>
              )}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => go({ page: params.page + 1 }, { scroll: false })}
                    className="btn-soft px-8 py-3"
                  >
                    <Icon name="expand_more" size={18} /> Muat lebih banyak
                  </button>
                </div>
              )}
            </>
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
              <button onClick={() => setFiltersOpen(false)} className="p-2 text-on-surface-variant" aria-label="Tutup filter">
                <Icon name="close" size={24} />
              </button>
            </div>
            {FiltersPanel}
            <button onClick={() => setFiltersOpen(false)} className="btn-primary sticky bottom-0 mt-8 w-full py-3">
              Tampilkan {total} hasil
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
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-outline">{label}</p>
      {children}
    </div>
  );
}

function ModelRow({ model }: { model: Model }) {
  return (
    <Link
      href={`/model/${model.id}`}
      className="group flex items-center gap-5 rounded-xl glass-panel p-4 transition-all electric-glow-hover hover:border-primary-container/30"
    >
      <ModelArtwork
        seed={model.id}
        colors={model.art}
        icon={model.icon}
        category={model.category}
        className="h-24 w-40 shrink-0 rounded-lg max-sm:h-20 max-sm:w-28"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="truncate font-display text-body-lg font-semibold text-on-surface transition-colors group-hover:text-primary-container">
            {model.name}
          </h3>
          <StarRating value={model.rating} size={13} single className="shrink-0" />
        </div>
        <p className="mt-1 line-clamp-1 text-body-sm text-on-surface-variant">{model.tagline}</p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-outline">{model.category}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-semibold text-on-surface">
          {model.price === 0 ? (
            <span className="text-primary-container">Gratis</span>
          ) : (
            <>
              {formatIDRShort(toIDR(model.price))}
              <span className="font-mono text-[11px] font-normal text-on-surface-variant">/bln</span>
            </>
          )}
        </span>
        <TierBadge tier={model.tier} />
      </div>
    </Link>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-container/35 bg-primary-container/10 py-1 pl-3 pr-1.5 text-[12px] text-primary">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Hapus filter ${label}`}
        className="rounded-full p-0.5 text-primary/70 transition-colors hover:bg-primary-container/20 hover:text-primary"
      >
        <Icon name="close" size={13} />
      </button>
    </span>
  );
}
