"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "./Icon";
import ModelArtwork from "./ModelArtwork";
import StarRating from "./StarRating";
import { TierBadge, StatusBadge } from "./Badge";
import { addToCart, toggleWishlist } from "@/lib/actions/commerce";
import { postReview, type ReviewItem, type ReviewState } from "@/lib/actions/reviews";
import { toIDR, formatIDR } from "@/lib/pricing";
import type { Model } from "@/lib/catalog";

const TRUST_TILES = [
  { icon: "verified_user", label: "Garansi uang kembali" },
  { icon: "bolt", label: "Akses instan" },
  { icon: "support_agent", label: "Support 24/7" },
];

export default function ProductDetailClient({
  model,
  reviews,
  wishlisted,
  loggedIn,
  owned,
  seller,
}: {
  model: Model;
  reviews: ReviewItem[];
  wishlisted: boolean;
  loggedIn: boolean;
  owned: boolean;
  seller: { name: string; handle: string | null } | null;
}) {
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(wishlisted);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const guard = () => {
    if (!loggedIn) {
      router.push(`/login?next=/model/${model.id}`);
      return false;
    }
    return true;
  };

  const onAddToCart = async () => {
    if (!guard()) return;
    setBusy(true);
    setErr("");
    const res = await addToCart(model.id);
    setBusy(false);
    if (res?.needsAuth) router.push("/login");
    else if (res?.error) setErr(res.error);
  };

  const onBuyNow = async () => {
    if (!guard()) return;
    setBusy(true);
    setErr("");
    const res = await addToCart(model.id);
    setBusy(false);
    if (res?.needsAuth) return router.push("/login");
    if (res?.error) return setErr(res.error);
    router.push("/cart");
  };

  const onWishlist = async () => {
    if (!guard()) return;
    setErr("");
    setSaved((s) => !s);
    const res = await toggleWishlist(model.id);
    if (res?.needsAuth) {
      setSaved((s) => !s); // revert
      router.push("/login");
    } else if (res?.error) {
      setSaved((s) => !s); // revert on failure
      setErr(res.error);
    }
  };

  // With review rows, distribute from real data. Seed products carry only an
  // aggregate rating/count — derive a plausible split so the bars aren't empty.
  const derived =
    model.rating >= 4.8
      ? [88, 9, 2, 1, 0]
      : model.rating >= 4.5
        ? [74, 18, 5, 2, 1]
        : model.rating >= 4
          ? [58, 26, 10, 4, 2]
          : [42, 30, 15, 8, 5];
  // 1★ belongs here too — it is the row shoppers look for first, and without it
  // the percentages never added up to 100.
  const breakdown = [5, 4, 3, 2, 1].map((star, i) => {
    if (!reviews.length) return { star, pct: model.reviews > 0 ? derived[i] : 0 };
    const n = reviews.filter((r) => r.rating === star).length;
    return { star, pct: Math.round((n / reviews.length) * 100) };
  });

  return (
    <div className="mb-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Gallery + content */}
      <div className="min-w-0">
        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl glass-panel">
          <ModelArtwork
            key={activeImg}
            seed={`${model.id}-${activeImg}`}
            colors={model.art}
            icon={model.icon}
            category={model.category}
            className="h-full w-full animate-fade-in-fast"
          />
          {model.badge && (
            <div className="absolute left-4 top-4">
              <StatusBadge type={model.badge} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: model.gallery }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              aria-label={`Pratinjau ${i + 1}`}
              className={`relative aspect-video overflow-hidden rounded-lg border transition-all ${
                activeImg === i
                  ? "border-primary-container ring-2 ring-primary-container/30"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <ModelArtwork
                seed={`${model.id}-${i}`}
                colors={model.art}
                category={model.category}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>

        {/* Deskripsi */}
        <section className="mt-12">
          <p className="mb-2 eyebrow-mono">
            <span className="mr-1 opacity-60">{"//"}</span>Tentang Model
          </p>
          <h2 className="mb-4 font-display text-title-md text-on-surface">Deskripsi</h2>
          <p className="text-body-lg leading-relaxed text-on-surface-variant">{model.description}</p>
          {model.useCaseTags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {model.useCaseTags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Kemampuan */}
        {model.capabilities.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 font-display text-title-md text-on-surface">Kemampuan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {model.capabilities.map((c) => (
                <div
                  key={c.title}
                  className="flex items-start gap-4 rounded-xl surface-card p-5 transition-all electric-glow-hover hover:border-primary-container/30"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary-container/20 bg-primary-container/10 text-primary-container">
                    <Icon name={c.icon} size={22} />
                  </span>
                  <span>
                    <span className="block font-display text-body-md font-semibold text-on-surface">{c.title}</span>
                    <span className="mt-0.5 block text-body-sm text-on-surface-variant">{c.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ulasan */}
        <section className="mt-12">
          <h2 className="mb-5 font-display text-title-md text-on-surface">Ulasan Pengguna</h2>
          <div className="mb-4 grid gap-6 rounded-xl surface-card p-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center sm:pr-6">
              <p className="font-display text-display-md leading-none text-on-surface">
                {model.rating.toFixed(1).replace(".", ",")}
              </p>
              <StarRating value={model.rating} size={18} className="my-2 justify-center" />
              <p className="font-mono text-[11px] text-on-surface-variant">
                {model.reviews.toLocaleString("id-ID")} ulasan
              </p>
            </div>
            <div className="flex flex-col gap-2 border-white/[0.06] sm:border-l sm:pl-6">
              {breakdown.map(({ star, pct }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-6 font-mono text-[11px] text-on-surface-variant">{star}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-9 text-right font-mono text-[11px] text-on-surface-variant">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ReviewForm productId={model.id} loggedIn={loggedIn} owned={owned} />
            {reviews.length === 0 ? (
              model.reviews === 0 && (
                <p className="text-body-sm text-on-surface-variant">Belum ada ulasan. Jadilah yang pertama!</p>
              )
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-xl surface-card p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-inverse-primary font-bold text-on-primary-container">
                        {r.authorName.charAt(0).toUpperCase() || "U"}
                      </span>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">{r.authorName}</p>
                        <StarRating value={r.rating} size={13} />
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-outline">
                      {new Date(r.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  {r.body && <p className="text-body-sm leading-relaxed text-on-surface-variant">{r.body}</p>}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Summary / purchase */}
      <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
        <div className="mb-4 flex items-center gap-2">
          <TierBadge tier={model.tier} />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-outline">{model.category}</span>
        </div>
        <h1 className="mb-3 font-display text-headline-md text-on-surface md:text-headline-lg">{model.name}</h1>
        <p className="mb-4 text-body-lg text-on-surface-variant">{model.tagline}</p>
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <StarRating value={model.rating} count={model.reviews} single size={15} />
          {seller && (
            <>
              <span className="hidden h-4 w-px bg-white/10 sm:block" />
              {seller.handle ? (
                <Link
                  href={`/creator/${seller.handle}`}
                  className="inline-flex items-center gap-2 text-body-sm font-medium text-on-surface transition-colors hover:text-primary-container"
                >
                  <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary" />
                  {seller.name}
                  <Icon name="verified" size={15} className="text-primary-container" fill />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-body-sm font-medium text-on-surface">
                  <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary" />
                  {seller.name}
                  <Icon name="verified" size={15} className="text-primary-container" fill />
                </span>
              )}
            </>
          )}
        </div>

        <div className="mb-4 rounded-xl surface-card p-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Langganan</p>
              <p className="mt-2 font-display text-headline-md leading-none text-on-surface">
                {model.price === 0 ? (
                  <span className="text-primary-container">Gratis</span>
                ) : (
                  <>
                    {formatIDR(toIDR(model.price))}
                    <span className="font-mono text-body-md font-normal text-on-surface-variant">/bln</span>
                  </>
                )}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-body-sm ${
                owned ? "bg-primary-container/10 text-primary-container" : "bg-success/10 text-success"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${owned ? "bg-primary-container" : "bg-success"}`} />
              {owned ? "Dimiliki" : "Tersedia"}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {owned && (
              <Link href="/library" className="btn-primary w-full py-3.5">
                <Icon name="download" size={18} /> Akses di Library
              </Link>
            )}
            <button
              onClick={onBuyNow}
              disabled={busy}
              className={owned ? "btn-ghost w-full py-3.5" : "btn-primary w-full py-3.5 glow-cyan"}
            >
              <Icon name="bolt" size={18} fill={!owned} /> {owned ? "Beli Lagi" : "Beli Sekarang"}
            </button>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <button onClick={onAddToCart} disabled={busy} className="btn-ghost py-3.5">
                <Icon name="add_shopping_cart" size={18} /> Keranjang
              </button>
              <button
                onClick={onWishlist}
                className={`btn-soft px-4 ${saved ? "border-primary-container/40 text-primary-container" : ""}`}
                aria-label="Simpan ke wishlist"
              >
                <Icon name={saved ? "bookmark" : "bookmark_border"} size={20} fill={saved} />
              </button>
            </div>
          </div>
          {err && (
            <p role="alert" className="mt-3 text-body-sm text-error">
              {err}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-2 text-[12px] text-on-surface-variant">
            <span className="flex items-center gap-2">
              <Icon name="lock" size={14} className="text-primary-container" /> Checkout aman · batal kapan saja
            </span>
            <Link
              href="/contact"
              className="flex items-center gap-1.5 transition-colors hover:text-on-surface"
            >
              <Icon name="flag" size={13} /> Laporkan
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {TRUST_TILES.map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-2 rounded-xl surface-card px-3 py-4 text-center">
              <Icon name={t.icon} size={20} className="text-primary-container" />
              <span className="text-[12px] leading-tight text-on-surface-variant">{t.label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl surface-card p-6">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
            Spesifikasi Model
          </h3>
          <dl className="grid grid-cols-2 gap-4">
            {Object.entries(
              Object.keys(model.specs).length
                ? model.specs
                : {
                    Lisensi: "Komersial",
                    Format: "API & Unduhan",
                    Update: "Gratis selamanya",
                    Diperbarui: model.createdAt
                      ? new Date(model.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                      : "—",
                  },
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-on-surface-variant">{k}</dt>
                <dd className="font-mono text-body-md font-medium text-on-surface">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-outline">
          QRIS · VA · GOPAY · OVO · DANA
        </p>
      </div>
    </div>
  );
}

function ReviewForm({
  productId,
  loggedIn,
  owned,
}: {
  productId: string;
  loggedIn: boolean;
  owned: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [state, action, pending] = useActionState(postReview, {} as ReviewState);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  if (!loggedIn) {
    return (
      <div className="rounded-xl surface-card p-6 text-body-sm text-on-surface-variant">
        <Link href={`/login?next=/model/${productId}`} className="text-primary-container hover:underline">
          Masuk
        </Link>{" "}
        untuk menulis ulasan.
      </div>
    );
  }

  // The DB enforces verified-purchase (guard_review), but it only says so after
  // the user has picked a rating and written the whole review. Say it up front.
  if (!owned) {
    return (
      <div className="flex items-start gap-3 rounded-xl surface-card p-6 text-body-sm text-on-surface-variant">
        <Icon name="lock" size={18} className="mt-0.5 shrink-0 text-outline" />
        <p>
          Ulasan hanya bisa ditulis oleh pembeli model ini. Beli dulu untuk berbagi pengalamanmu.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-xl surface-card p-6">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <h3 className="mb-3 font-display text-body-lg font-semibold text-on-surface">Tulis ulasan</h3>
      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            aria-label={`${s} bintang`}
            className={s <= rating ? "text-secondary" : "text-white/20"}
          >
            <Icon name="star" size={24} fill={s <= rating} />
          </button>
        ))}
      </div>
      <textarea
        name="body"
        rows={3}
        placeholder="Bagikan pengalamanmu memakai model ini…"
        className="input-field mb-3 resize-none"
      />
      {state.error && <p className="mb-3 text-sm text-red-400">{state.error}</p>}
      {state.ok && <p className="mb-3 text-sm text-success">Terima kasih! Ulasanmu sudah terkirim.</p>}
      <button type="submit" disabled={pending} className="btn-primary px-6 py-2.5">
        {pending ? "Mengirim…" : "Kirim ulasan"}
      </button>
    </form>
  );
}
