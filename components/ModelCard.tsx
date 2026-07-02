"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import ModelArtwork from "./ModelArtwork";
import StarRating from "./StarRating";
import { StatusBadge, TierBadge } from "./Badge";
import { addToCart, toggleWishlist } from "@/lib/actions/commerce";
import { toIDR, formatIDRShort } from "@/lib/pricing";
import type { Model } from "@/lib/catalog";

export default function ModelCard({
  model,
  wishlisted = false,
  loggedIn = false,
  className = "",
}: {
  model: Model;
  wishlisted?: boolean;
  loggedIn?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(wishlisted);
  const [pending, startTransition] = useTransition();

  const requireLogin = () => {
    router.push("/login?next=/explore");
    return true;
  };

  const onWishlist = () => {
    if (!loggedIn) return requireLogin();
    setSaved((s) => !s);
    startTransition(async () => {
      const res = await toggleWishlist(model.id);
      if (res?.needsAuth || res?.error) {
        setSaved((s) => !s); // revert optimistic toggle on failure
        if (res?.needsAuth) router.push("/login");
      }
    });
  };

  const onAddToCart = () => {
    if (!loggedIn) return requireLogin();
    startTransition(async () => {
      const res = await addToCart(model.id);
      if (res?.needsAuth) router.push("/login");
    });
  };

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl glass-panel electric-glow-hover transition-all hover:border-primary-container/30 ${className}`}
    >
      <Link href={`/model/${model.id}`} aria-label={model.name} className="relative block h-44 overflow-hidden">
        <ModelArtwork
          seed={model.id}
          colors={model.art}
          icon={model.icon}
          className="h-full w-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest/70" />
        {model.badge && (
          <div className="absolute left-3 top-3">
            <StatusBadge type={model.badge} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/model/${model.id}`} className="min-w-0">
            <h3 className="truncate font-display text-[19px] font-semibold leading-tight text-on-surface transition-colors group-hover:text-primary-container">
              {model.name}
            </h3>
          </Link>
          <StarRating value={model.rating} size={14} showValue />
        </div>

        <p className="line-clamp-2 flex-1 text-body-sm text-on-surface-variant">{model.tagline}</p>

        <div className="flex items-center gap-2">
          <TierBadge tier={model.tier} />
          <span className="font-mono text-[11px] uppercase tracking-wide text-outline">{model.category}</span>
        </div>

        <div className="mt-1 flex items-center justify-between border-t pt-4 hairline">
          <span className="font-label text-label-md text-on-surface">
            {model.price === 0 ? (
              <span className="text-success">Gratis</span>
            ) : (
              <>
                {formatIDRShort(toIDR(model.price))}
                <span className="text-[12px] font-normal text-on-surface-variant">/bln</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onWishlist}
              disabled={pending}
              className={`rounded-full p-2 transition-colors ${
                saved
                  ? "bg-primary-container/10 text-primary-container"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-primary-container"
              }`}
              aria-label={saved ? "Hapus dari wishlist" : "Simpan ke wishlist"}
            >
              <Icon name={saved ? "bookmark" : "bookmark_border"} size={20} fill={saved} />
            </button>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={pending}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary-container"
              aria-label={`Tambah ${model.name} ke keranjang`}
            >
              <Icon name="add_shopping_cart" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
