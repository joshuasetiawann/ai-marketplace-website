import Link from "next/link";
import Icon from "@/components/Icon";
import ModelCard from "@/components/ModelCard";
import HeroSearch from "@/components/HeroSearch";
import BrandMarquee from "@/components/BrandMarquee";
import { SectionHeading, GlowOrb } from "@/components/common";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { getPublishedProducts } from "@/lib/catalog-data";
import { CATEGORIES, CATEGORY_COUNTS, USE_CASES } from "@/lib/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const STATS = [
  { value: "2.400", suffix: "+", label: "Model Kurasi" },
  { value: "120rb", suffix: "+", label: "Builder Aktif" },
  { value: "4,9", suffix: "★", suffixCls: "text-secondary", label: "Rating Rata-rata" },
  { value: "99,99", suffix: "%", valueCls: "text-primary-container", label: "Uptime SLA" },
];

const CREATOR_FEATURES = [
  { icon: "payments", title: "Bagi hasil 80%", desc: "Kamu simpan 80% dari tiap penjualan." },
  { icon: "verified_user", title: "Pembayaran aman", desc: "QRIS, VA & e-wallet, cair otomatis." },
  { icon: "dashboard", title: "Dashboard lengkap", desc: "Pantau penjualan & pencairan real-time." },
];

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [models, wishlistRes] = await Promise.all([
    getPublishedProducts(),
    user
      ? supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { product_id: string }[] }),
  ]);

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
            <Icon name="auto_awesome" size={13} fill className="text-primary-container" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
              Marketplace AI Generasi Baru
            </span>
            <span className="rounded-full bg-primary-container/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-primary-container">
              v2.0
            </span>
          </div>
          <h1 className="max-w-4xl font-display text-[40px] leading-[1.05] text-on-surface sm:text-[56px] md:text-display-lg">
            Temukan <span className="text-gradient">AI</span> yang pas
            <br className="hidden sm:block" /> untuk setiap ambisimu
          </h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            Marketplace kurasi untuk model AI berperforma tinggi — teks, gambar, suara, video,
            dan kode. Satu akun untuk <span className="font-semibold text-on-surface">belanja</span> sekaligus{" "}
            <span className="font-semibold text-on-surface">jualan</span>.
          </p>
          <HeroSearch />
          <div className="mt-3 flex flex-wrap justify-center gap-2.5">
            {[...USE_CASES].sort((a, b) => (a.id === "creative" ? -1 : b.id === "creative" ? 1 : 0)).map((u) => (
              <Link key={u.id} href={`/explore?use=${u.id}`} className={`chip ${u.id === "creative" ? "chip-active" : ""}`}>
                <Icon name={u.icon} size={16} />
                {u.label}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex -space-x-2" aria-hidden>
              {["#00e5ff", "#a855f7", "#34d399", "#e9c349", "#f472b6"].map((c) => (
                <span
                  key={c}
                  className="h-7 w-7 rounded-full border-2 border-surface"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${c}, #101115)` }}
                />
              ))}
            </div>
            <p className="text-body-sm text-on-surface-variant">
              <span className="text-secondary">★</span>{" "}
              <span className="font-semibold text-on-surface">4,9</span> dari{" "}
              <span className="font-semibold text-on-surface">120rb+</span> builder terpercaya
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 overflow-hidden rounded-xl glass-panel md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-7 py-6 ${i > 0 ? "border-l hairline" : ""} ${i >= 2 ? "max-md:border-t max-md:hairline" : ""} ${i === 2 ? "max-md:border-l-0" : ""}`}
            >
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                {s.label}
              </p>
              <p className={`font-display text-headline-md ${s.valueCls ?? "text-on-surface"}`}>
                {s.value}
                <span className={s.suffixCls ?? "text-primary-container"}>{s.suffix}</span>
              </p>
            </div>
          ))}
        </div>

        <BrandMarquee />
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-16">
          <SectionHeading
            eyebrow="Live sekarang"
            title="Model Trending"
            subtitle="Kecerdasan paling powerful & populer minggu ini."
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
              className="group flex flex-col items-start gap-3 rounded-xl surface-card p-5 transition-all electric-glow-hover hover:border-primary-container/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary-container/20 bg-primary-container/10 text-primary-container transition-transform group-hover:scale-110">
                <Icon name={c.icon} size={22} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-body-sm font-medium text-on-surface">{c.label}</span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  {CATEGORY_COUNTS[c.id] ?? "—"} model
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-16">
        <GlowOrb className="left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative grid min-h-[420px] overflow-hidden rounded-2xl glass-panel md:grid-cols-2">
          <span aria-hidden className="absolute left-4 top-4 h-6 w-6 border-l border-t border-primary-container/60" />
          <span aria-hidden className="absolute bottom-4 right-4 h-6 w-6 border-b border-r border-primary-container/60" />
          <div className="flex flex-col justify-center p-8 md:p-14">
            <div className="mb-5 flex items-center gap-2">
              <span className="eyebrow-mono">
                <span className="mr-1 opacity-60">{"//"}</span>Produk Unggulan
              </span>
              <span className="h-px w-12 bg-primary-container/30" />
            </div>
            <h2 className="mb-4 font-display text-headline-md text-on-surface md:text-[44px] md:leading-[1.1]">
              Nexora <span className="font-light italic text-primary-container">Core Engine</span>
            </h2>
            <p className="mb-6 max-w-md text-body-lg text-on-surface-variant">
              Model multimodal andalan kami — integrasikan kecerdasan teks, gambar, dan suara ke
              alur kerjamu dengan latensi tak tertandingi.
            </p>
            <div className="mb-8 flex flex-wrap gap-2">
              {[
                { icon: "bolt", label: "~600ms latensi" },
                { icon: "memory", label: "12B params" },
                { icon: "blur_on", label: "Multimodal" },
              ].map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-on-surface-variant"
                >
                  <Icon name={s.icon} size={13} className="text-primary-container" />
                  {s.label}
                </span>
              ))}
            </div>
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
        <div className="relative overflow-hidden rounded-2xl border border-primary-container/20 bg-gradient-to-br from-surface-container to-surface-container-lowest p-8 md:p-14">
          <GlowOrb className="right-0 top-0 h-[400px] w-[400px]" />
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-4 eyebrow-mono">
                <span className="mr-1 opacity-60">{"//"}</span>Untuk Kreator
              </p>
              <h2 className="mb-4 max-w-md font-display text-headline-md text-on-surface md:text-[40px] md:leading-[1.12]">
                Bangun, publikasikan & hasilkan dari model AI-mu
              </h2>
              <p className="mb-8 max-w-md text-body-lg text-on-surface-variant">
                Satu akun untuk belanja dan jualan. Buka toko gratis, tanpa biaya pendaftaran —
                komisi hanya saat kamu menjual.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/sell/start" className="btn-primary px-7 py-3.5">
                  Mulai Jualan <Icon name="rocket_launch" size={18} />
                </Link>
                <Link href="/about" className="btn-ghost px-7 py-3.5">
                  Selengkapnya
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {CREATOR_FEATURES.map((f) => (
                <div key={f.title} className="flex items-center gap-4 rounded-xl surface-card px-5 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-container/20 bg-primary-container/10 text-primary-container">
                    <Icon name={f.icon} size={20} />
                  </span>
                  <span>
                    <span className="block text-body-md font-semibold text-on-surface">{f.title}</span>
                    <span className="block text-body-sm text-on-surface-variant">{f.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
