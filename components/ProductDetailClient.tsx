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

const BENEFITS = [
  "Keandalan siap produksi",
  "Harga transparan & dapat diprediksi",
  "Dukungan API & SDK kelas satu",
  "Didukung kreator terverifikasi",
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
  seller: { name: string; handle: string } | null;
}) {
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"overview" | "capabilities" | "reviews">("overview");
  const [saved, setSaved] = useState(wishlisted);
  const [busy, setBusy] = useState(false);

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
    const res = await addToCart(model.id);
    setBusy(false);
    if (res?.needsAuth) router.push("/login");
  };

  const onBuyNow = async () => {
    if (!guard()) return;
    setBusy(true);
    await addToCart(model.id);
    router.push("/cart");
  };

  const onWishlist = async () => {
    if (!guard()) return;
    setSaved((s) => !s);
    const res = await toggleWishlist(model.id);
    if (res?.needsAuth) router.push("/login");
  };

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => r.rating === star).length;
    return reviews.length ? Math.round((n / reviews.length) * 100) : 0;
  });

  const tabs = [
    { id: "overview" as const, label: "Ringkasan" },
    { id: "capabilities" as const, label: "Kemampuan" },
    { id: "reviews" as const, label: `Ulasan (${model.reviews.toLocaleString("id-ID")})` },
  ];

  return (
    <>
      <div className="mb-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Gallery */}
        <div>
          <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl glass-panel">
            <ModelArtwork
              key={activeImg}
              seed={`${model.id}-${activeImg}`}
              colors={model.art}
              icon={model.icon}
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
                className={`relative aspect-video overflow-hidden rounded-lg border transition-all ${
                  activeImg === i
                    ? "border-primary-container ring-2 ring-primary-container/30"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <ModelArtwork seed={`${model.id}-${i}`} colors={model.art} className="h-full w-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Summary / purchase */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 flex items-center gap-2">
            <TierBadge tier={model.tier} />
            <span className="font-mono text-[11px] uppercase tracking-wide text-outline">{model.category}</span>
          </div>
          <h1 className="mb-3 font-display text-headline-md text-on-surface md:text-headline-lg">{model.name}</h1>
          <p className="mb-3 text-body-lg text-on-surface-variant">{model.tagline}</p>
          {seller && (
            <p className="mb-5 text-body-sm text-on-surface-variant">
              oleh{" "}
              <Link href={`/creator/${seller.handle}`} className="font-medium text-primary-container hover:underline">
                {seller.name}
              </Link>
            </p>
          )}

          <div className="mb-6 flex items-center gap-4">
            <StarRating value={model.rating} count={model.reviews} showValue />
          </div>

          <div className="mb-4 rounded-xl surface-card p-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-body-sm text-on-surface-variant">Langganan</p>
                <p className="mt-1 font-display text-headline-md leading-none text-on-surface">
                  {model.price === 0 ? (
                    <span className="text-success">Gratis</span>
                  ) : (
                    <>
                      {formatIDR(toIDR(model.price))}
                      <span className="text-body-md font-normal text-on-surface-variant">/bln</span>
                    </>
                  )}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-body-sm ${
                  owned ? "bg-primary-container/10 text-primary-container" : "bg-success/10 text-success"
                }`}
              >
                <Icon name="check_circle" size={16} fill /> {owned ? "Dimiliki" : "Tersedia"}
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
                className={owned ? "btn-ghost w-full py-3.5" : "btn-primary w-full py-3.5"}
              >
                <Icon name="bolt" size={18} fill={!owned} /> {owned ? "Beli Lagi" : "Beli Sekarang"}
              </button>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <button onClick={onAddToCart} disabled={busy} className="btn-ghost py-3.5">
                  <Icon name="add_shopping_cart" size={18} /> Tambah Keranjang
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
            <div className="mt-4 flex items-center gap-2 text-[12px] text-on-surface-variant">
              <Icon name="lock" size={14} className="text-primary-container" /> Checkout aman · batal kapan saja
            </div>
          </div>

          {Object.keys(model.specs).length > 0 && (
            <div className="rounded-xl surface-card p-6">
              <h3 className="mb-4 font-label text-label-sm uppercase tracking-wider text-outline">Spesifikasi Model</h3>
              <dl className="grid grid-cols-2 gap-4">
                {Object.entries(model.specs).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[12px] text-on-surface-variant">{k}</dt>
                    <dd className="font-mono text-body-md font-medium text-on-surface">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 overflow-x-auto border-b hairline no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-5 py-3 font-label text-label-md transition-colors ${
              tab === t.id
                ? "border-primary-container text-primary-container"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-16">
        {tab === "overview" && (
          <div className="grid gap-10 animate-fade-in lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="mb-4 font-display text-title-md text-on-surface">Ringkasan</h2>
              <p className="mb-8 text-body-lg leading-relaxed text-on-surface-variant">{model.description}</p>
              {model.useCaseTags.length > 0 && (
                <>
                  <h3 className="mb-4 font-display text-body-lg font-semibold text-on-surface">Kegunaan Utama</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.useCaseTags.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="h-fit rounded-xl surface-card p-6">
              <h3 className="mb-4 font-display text-body-lg font-semibold text-on-surface">Kenapa pilih model ini</h3>
              <ul className="flex flex-col gap-4">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-body-sm text-on-surface-variant">
                    <Icon name="check_circle" size={18} className="mt-0.5 shrink-0 text-primary-container" fill />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "capabilities" && (
          <div className="grid gap-4 animate-fade-in sm:grid-cols-2">
            {model.capabilities.length > 0 ? (
              model.capabilities.map((c) => (
                <div key={c.title} className="rounded-xl surface-card p-6 transition-all electric-glow-hover hover:border-primary-container/30">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-primary-container/20 bg-primary-container/10 text-primary-container">
                    <Icon name={c.icon} size={22} />
                  </div>
                  <h3 className="mb-1.5 font-display text-body-lg font-semibold text-on-surface">{c.title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-on-surface-variant">Detail kemampuan belum ditambahkan oleh kreator.</p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="grid gap-10 animate-fade-in lg:grid-cols-[1fr_1.5fr]">
            <div className="h-fit rounded-xl surface-card p-6">
              <div className="mb-6 text-center">
                <p className="font-display text-display-md text-on-surface">{model.rating.toFixed(1)}</p>
                <StarRating value={model.rating} size={20} className="my-2 justify-center" />
                <p className="text-body-sm text-on-surface-variant">
                  {model.reviews.toLocaleString("id-ID")} ulasan
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {breakdown.map((pct, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-3 text-[12px] text-on-surface-variant">{5 - i}</span>
                    <Icon name="star" size={12} className="text-secondary" fill />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-[12px] text-on-surface-variant">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <ReviewForm productId={model.id} loggedIn={loggedIn} />
              {reviews.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">Belum ada ulasan. Jadilah yang pertama!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="rounded-xl surface-card p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-inverse-primary font-bold text-on-primary-container">
                          {r.authorName.charAt(0).toUpperCase() || "U"}
                        </span>
                        <p className="text-body-md font-semibold text-on-surface">{r.authorName}</p>
                      </div>
                      <span className="text-[12px] text-outline">
                        {new Date(r.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <StarRating value={r.rating} size={14} className="mb-2" />
                    {r.body && <p className="text-body-sm leading-relaxed text-on-surface-variant">{r.body}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ReviewForm({ productId, loggedIn }: { productId: string; loggedIn: boolean }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [state, action, pending] = useActionState(postReview, {} as ReviewState);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  if (!loggedIn) {
    return (
      <div className="rounded-xl surface-card p-6 text-body-sm text-on-surface-variant">
        <a href="/login" className="text-primary-container hover:underline">
          Masuk
        </a>{" "}
        untuk menulis ulasan.
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
