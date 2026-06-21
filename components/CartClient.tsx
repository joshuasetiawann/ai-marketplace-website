"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import ModelArtwork from "./ModelArtwork";
import { updateCartQty, removeFromCart } from "@/lib/actions/commerce";
import { checkPromo } from "@/lib/actions/promo";
import { toIDR, formatIDR } from "@/lib/pricing";
import type { CartLine } from "@/lib/cart";

const r2 = (n: number) => Math.round(n * 100) / 100;

export default function CartClient({
  lines,
  subtotal,
  taxes,
  total,
}: {
  lines: CartLine[];
  subtotal: number;
  taxes: number;
  total: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [checking, setChecking] = useState(false);

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setPromoError("");
    const res = await checkPromo(promo, subtotal);
    setChecking(false);
    if (res.percent > 0) {
      setApplied({ code: promo.trim().toUpperCase(), rate: res.percent / 100 });
    } else {
      setApplied(null);
      setPromoError(res.error ?? "Kode promo tidak valid");
    }
  };

  const setQty = (id: string, qty: number) =>
    startTransition(async () => {
      await updateCartQty(id, qty);
      router.refresh();
    });
  const remove = (id: string) =>
    startTransition(async () => {
      await removeFromCart(id);
      router.refresh();
    });

  // Discount is applied to the subtotal before PPN — mirrors the checkout RPC so
  // the total shown here equals the amount actually charged.
  const discount = applied ? r2(subtotal * applied.rate) : 0;
  const discSubtotal = subtotal - discount;
  const shownTaxes = discount > 0 ? r2(discSubtotal * 0.11) : taxes;
  const grandTotal = discount > 0 ? r2(discSubtotal * 1.11) : total;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-4">
        {lines.map((m) => (
          <div key={m.id} className="flex items-center gap-4 rounded-xl surface-card p-4 animate-fade-in">
            <Link href={`/model/${m.id}`} aria-label={m.name} className="h-20 w-24 shrink-0 overflow-hidden rounded-lg">
              <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} category={m.category} className="h-full w-full" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/model/${m.id}`}
                className="block truncate font-display text-body-lg font-semibold text-on-surface transition-colors hover:text-primary-container"
              >
                {m.name}
              </Link>
              <p className="truncate text-body-sm text-on-surface-variant">{m.tagline}</p>
              <p className="mt-1 font-label text-label-md text-primary-container">
                {m.price === 0 ? "Gratis" : `${formatIDR(toIDR(m.price))}/bln`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button onClick={() => remove(m.id)} disabled={isPending} className="p-1 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40" aria-label="Hapus">
                <Icon name="delete" size={20} />
              </button>
              <div className="flex items-center rounded-full border border-white/10">
                <button onClick={() => setQty(m.id, m.qty - 1)} disabled={isPending} className="flex h-8 w-8 items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-40" aria-label="Kurangi">
                  <Icon name="remove" size={16} />
                </button>
                <span className="w-8 text-center text-body-sm font-medium text-on-surface">{m.qty}</span>
                <button onClick={() => setQty(m.id, m.qty + 1)} disabled={isPending} className="flex h-8 w-8 items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-40" aria-label="Tambah">
                  <Icon name="add" size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl surface-card px-5 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-outline">Metode Pembayaran</span>
          {["QRIS", "Virtual Account", "E-Wallet", "Kartu"].map((m) => (
            <span
              key={m}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-on-surface-variant"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl surface-card p-6 lg:sticky lg:top-24">
        <h2 className="mb-5 font-display text-title-md text-on-surface">Ringkasan Pesanan</h2>

        <form onSubmit={applyPromo} className="mb-5 flex gap-2">
          <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Kode promo" aria-label="Kode promo" className="input-field flex-1" />
          <button type="submit" disabled={checking} className="btn-soft px-5">{checking ? "…" : "Pakai"}</button>
        </form>
        {promoError && <p className="-mt-3 mb-4 text-body-sm text-error">{promoError}</p>}
        {applied && (
          <div className="-mt-3 mb-4 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-body-sm text-success">
            <span className="flex items-center gap-1.5">
              <Icon name="check_circle" size={16} fill /> {applied.code} dipakai
            </span>
            <button onClick={() => { setApplied(null); setPromo(""); }} className="hover:underline">Hapus</button>
          </div>
        )}
        <p className="mb-5 text-[12px] text-on-surface-variant">
          Coba <span className="font-mono text-primary-container">NEXORA10</span> untuk diskon 10%.
        </p>

        <div className="flex flex-col gap-3 border-t pt-5 text-body-md hairline">
          <Row label="Subtotal" value={formatIDR(toIDR(subtotal))} />
          {discount > 0 && <Row label="Diskon" value={`−${formatIDR(toIDR(discount))}`} accent />}
          <Row label="PPN 11%" value={formatIDR(toIDR(shownTaxes))} muted />
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-5 hairline">
          <span className="font-display text-title-md text-on-surface">Total</span>
          <span className="font-display text-headline-md text-primary-container">{formatIDR(toIDR(grandTotal))}</span>
        </div>

        <Link href={applied ? `/checkout?promo=${encodeURIComponent(applied.code)}` : "/checkout"} className="btn-primary mt-6 w-full py-3.5">
          Lanjut ke Pembayaran <Icon name="arrow_forward" size={18} />
        </Link>
        <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-on-surface-variant">
          <Icon name="verified_user" size={14} className="text-primary-container" /> Checkout aman terenkripsi SSL 256-bit
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-on-surface-variant" : "text-on-surface"}>{label}</span>
      <span className={`font-medium ${accent ? "text-success" : "text-on-surface"}`}>{value}</span>
    </div>
  );
}
