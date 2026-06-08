import Link from "next/link";
import Icon from "@/components/Icon";
import ModelCard from "@/components/ModelCard";
import HeroSearch from "@/components/HeroSearch";
import { SectionHeading, GlowOrb } from "@/components/common";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { CATEGORIES, USE_CASES, PRODUCT_COLUMNS, mapProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const STATS = [
  { value: "2.400+", label: "Model Kurasi" },
  { value: "120rb+", label: "Builder Aktif" },
  { value: "4,9★", label: "Rating Rata-rata" },
  { value: "99,99%", label: "Uptime SLA" },
];

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: rows }, wishlistRes] = await Promise.all([
    supabase.from("products").select(PRODUCT_COLUMNS).eq("status", "published"),
    user
      ? supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { product_id: string }[] }),
  ]);

  const models = (rows ?? []).map(mapProduct);
  const wished = new Set((wishlistRes.data ?? []).map((w) => w.product_id));
  const loggedIn = !!user;

  const byRating = [...models].sort((a, b) => b.rating - a.rating);
  const trending = byRating.slice(0, 4);
  const fresh = [...models]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 4);

  const card = (m: (typeof models)[number]) => (
    <ModelCard key={m.id} model={m} wishlisted={wished.has(m.id)} loggedIn={loggedIn} />
  );

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-16 md:px-16">
        <GlowOrb className="left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2" />
        <div className="flex flex-col items-center gap-6 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]" />
            <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
              Marketplace AI Generasi Baru
            </span>
          </div>
          <h1 className="max-w-4xl font-display text-[40px] leading-[1.05] text-on-surface sm:text-[56px] md:text-display-lg">
            Temukan <span className="text-gradient">AI</span> yang Pas untuk Hidupmu
          </h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            Marketplace digital premium untuk model AI kurasi berperforma tinggi — dirancang
            untuk kebutuhan bisnis, kreatif, dan sehari-hari.
          </p>
          <HeroSearch />
          <div className="mt-3 flex flex-wrap justify-center gap-2.5">
            {USE_CASES.map((u) => (
              <Link key={u.id} href={`/explore?use=${u.id}`} className={`chip ${u.id === "creative" ? "chip-active" : ""}`}>
                <Icon name={u.icon} size={16} />
                {u.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] glass-panel md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-surface/30 px-6 py-6 text-center">
              <p className="font-display text-headline-md text-on-surface">{s.value}</p>
              <p className="mt-1 text-body-sm text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-16">
          <SectionHeading
            eyebrow="Live sekarang"
            title="Model Trending"
            subtitle="Kecerdasan paling powerful & populer saat ini."
            action={
              <Link href="/explore" className="btn-ghost self-start px-5 py-2.5 md:self-auto">
                Lihat Semua <Icon name="arrow_forward" size={18} />
              </Link>
            }
            className="mb-10"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {trending.map(card)}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-16">
        <SectionHeading eyebrow="Jelajahi" title="Telusuri per Kategori" className="mb-10" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
            <Link
              key={c.id}
              href={`/explore?cat=${c.id}`}
              className="group flex flex-col items-center gap-3 rounded-xl surface-card p-5 text-center transition-all electric-glow-hover hover:border-primary-container/30"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary-container/20 bg-primary-container/10 text-primary-container transition-transform group-hover:scale-110">
                <Icon name={c.icon} size={24} />
              </span>
              <span className="text-body-sm font-medium text-on-surface">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-16">
        <GlowOrb className="left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative grid min-h-[420px] overflow-hidden rounded-2xl glass-panel md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-14">
            <div className="mb-5 flex items-center gap-2">
              <span className="font-label text-label-sm uppercase tracking-widest text-primary-container">Produk Unggulan</span>
              <span className="h-px w-12 bg-primary-container/30" />
            </div>
            <h2 className="mb-4 font-display text-headline-md text-on-surface md:text-[44px] md:leading-[1.1]">
              Nexora <span className="font-light italic text-primary-container">Core Engine</span>
            </h2>
            <p className="mb-8 max-w-md text-body-lg text-on-surface-variant">
              Model multimodal andalan kami. Integrasikan kecerdasan teks, gambar, dan suara ke
              alur kerjamu dengan latensi tak tertandingi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/explore" className="btn-primary px-6 py-3">
                Jelajahi Engine <Icon name="arrow_forward" size={18} />
              </Link>
              <Link href="/pricing" className="btn-ghost px-6 py-3">
                Lihat Harga
              </Link>
            </div>
          </div>
          <div className="relative flex min-h-[280px] items-center justify-center border-t border-white/5 bg-gradient-to-br from-surface-container-highest to-surface-container-lowest p-10 md:border-l md:border-t-0">
            <div className="relative h-60 w-60">
              <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border border-primary-container/20" />
              <div className="absolute inset-5 animate-[spin_18s_linear_infinite_reverse] rounded-full border border-dashed border-primary-container/40" />
              <div className="absolute inset-12 rounded-full border-2 border-primary-container/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-primary-container/20 blur-xl" />
                <Icon name="all_inclusive" size={56} className="absolute text-primary-container" style={{ filter: "drop-shadow(0 0 16px rgba(0,229,255,0.8))" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {fresh.length > 0 && (
        <section className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-16">
          <SectionHeading
            eyebrow="Terbaru"
            title="Baru Rilis"
            subtitle="Kecerdasan yang baru dipublikasikan dari kreator top."
            action={
              <Link href="/explore" className="btn-ghost self-start px-5 py-2.5 md:self-auto">
                Telusuri Semua <Icon name="arrow_forward" size={18} />
              </Link>
            }
            className="mb-10"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {fresh.map(card)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-16">
        <div className="relative overflow-hidden rounded-2xl border border-primary-container/20 bg-gradient-to-br from-surface-container to-surface-container-lowest p-10 text-center md:p-16">
          <GlowOrb className="right-0 top-0 h-[400px] w-[400px]" />
          <h2 className="mx-auto mb-4 max-w-2xl font-display text-headline-md text-on-surface md:text-headline-lg">
            Bangun, publikasikan & hasilkan dari model AI buatanmu
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-body-lg text-on-surface-variant">
            Bergabung dengan ribuan kreator yang memonetisasi kecerdasan mereka di marketplace
            paling premium di industrinya.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sell/start" className="btn-primary px-7 py-3.5">
              Mulai Jualan <Icon name="rocket_launch" size={18} />
            </Link>
            <Link href="/about" className="btn-ghost px-7 py-3.5">
              Selengkapnya
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
