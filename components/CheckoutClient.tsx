"use client";

import { useState, useActionState } from "react";
import Icon from "./Icon";
import ModelArtwork from "./ModelArtwork";
import { placeOrder, type CheckoutState } from "@/lib/actions/checkout";
import { PAYMENT_GROUPS, VA_BANKS, EWALLETS } from "@/lib/payments";
import { toIDR, formatIDR } from "@/lib/pricing";
import type { CartLine } from "@/lib/cart";

export default function CheckoutClient({
  lines,
  subtotal,
  taxes,
  total,
  discount,
  promo,
  userName,
  userEmail,
}: {
  lines: CartLine[];
  subtotal: number;
  taxes: number;
  total: number;
  discount: number;
  promo: string;
  userName: string;
  userEmail: string;
}) {
  const [method, setMethod] = useState("qris");
  const [bank, setBank] = useState("bca");
  const [ewallet, setEwallet] = useState("gopay");
  const [agree, setAgree] = useState(false);
  const [state, action, pending] = useActionState(placeOrder, {} as CheckoutState);

  return (
    <form action={action} className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
      <input type="hidden" name="method" value={method} />
      <input type="hidden" name="agree" value={agree ? "on" : "off"} />
      <input type="hidden" name="promo" value={promo} />

      <div className="flex flex-col gap-6">
        <section className="rounded-xl surface-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-title-md text-on-surface">
            <Icon name="person" size={20} className="text-primary-container" /> Akun
          </h2>
          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-container-lowest p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-inverse-primary font-bold text-on-primary-container">
              {userName.charAt(0).toUpperCase() || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-body-sm font-medium text-on-surface">{userName}</p>
              <p className="truncate text-[12px] text-on-surface-variant">{userEmail}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-success">
              <Icon name="verified" size={14} fill /> Terverifikasi
            </span>
          </div>
        </section>

        <section className="rounded-xl surface-card p-6">
          <h2 className="mb-5 flex items-center gap-2 font-display text-title-md text-on-surface">
            <Icon name="payments" size={20} className="text-primary-container" /> Metode Pembayaran
          </h2>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {PAYMENT_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setMethod(g.id)}
                aria-pressed={method === g.id}
                aria-label={`Metode pembayaran ${g.label}`}
                className={`rounded-xl border p-4 text-left transition-all ${
                  method === g.id ? "border-primary-container bg-primary-container/10" : "border-white/10 hover:border-white/25"
                }`}
              >
                <Icon name={g.icon} size={24} className={method === g.id ? "text-primary-container" : "text-on-surface-variant"} />
                <p className="mt-2 font-semibold text-on-surface">{g.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-on-surface-variant">{g.desc}</p>
              </button>
            ))}
          </div>

          {method === "qris" && (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-surface-container-lowest p-4 animate-fade-in-fast">
              <Icon name="qr_code" size={28} className="text-primary-container" />
              <p className="text-body-sm text-on-surface-variant">
                Satu QR untuk <b className="text-on-surface">GoPay, OVO, DANA, ShopeePay</b> & semua m-banking.
              </p>
            </div>
          )}
          {method === "va" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 animate-fade-in-fast">
              {VA_BANKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBank(b.id)}
                  aria-pressed={bank === b.id}
                  aria-label={`Bank ${b.short}`}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition-all ${
                    bank === b.id ? "border-primary-container bg-primary-container/10" : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: b.color }}>
                    {b.short.slice(0, 4)}
                  </span>
                  <span className="text-body-sm text-on-surface">{b.short}</span>
                </button>
              ))}
            </div>
          )}
          {method === "ewallet" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 animate-fade-in-fast">
              {EWALLETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setEwallet(w.id)}
                  aria-pressed={ewallet === w.id}
                  aria-label={`E-wallet ${w.name}`}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition-all ${
                    ewallet === w.id ? "border-primary-container bg-primary-container/10" : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: w.color }}>
                    {w.name.slice(0, 2)}
                  </span>
                  <span className="text-body-sm text-on-surface">{w.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="rounded-xl surface-card p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 font-display text-body-lg font-semibold text-on-surface">Ringkasan Pesanan</h2>
        <div className="mb-4 flex max-h-48 flex-col gap-3 overflow-y-auto no-scrollbar">
          {lines.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} category={m.category} className="h-full w-full" />
              </div>
              <span className="flex-1 truncate text-body-sm text-on-surface">
                {m.name} <span className="text-on-surface-variant">×{m.qty}</span>
              </span>
              <span className="text-body-sm text-on-surface">{formatIDR(toIDR(m.price * m.qty))}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t pt-4 text-body-sm hairline">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-on-surface">{formatIDR(toIDR(subtotal))}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Diskon{promo ? ` (${promo})` : ""}</span>
              <span className="text-success">−{formatIDR(toIDR(discount))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-on-surface-variant">PPN 11%</span>
            <span className="text-on-surface">{formatIDR(toIDR(taxes))}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 hairline">
          <span className="font-display text-body-lg text-on-surface">Total</span>
          <span className="font-display text-title-md text-primary-container">{formatIDR(toIDR(total))}</span>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-2.5">
          <button
            type="button"
            data-testid="agree-toggle"
            role="checkbox"
            aria-checked={agree}
            aria-label="Setuju dengan Syarat & Ketentuan"
            onClick={() => setAgree((a) => !a)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
              agree ? "border-primary-container bg-primary-container" : "border-white/30"
            }`}
          >
            {agree && <Icon name="check" size={14} className="text-on-primary-container" />}
          </button>
          <span className="text-[12px] text-on-surface-variant">
            Saya setuju dengan <span className="text-primary-container">Syarat &amp; Ketentuan</span> dan kebijakan refund Nexora AI.
          </span>
        </label>

        {state.error && <p role="alert" className="mt-3 text-body-sm text-error">{state.error}</p>}

        <button type="submit" disabled={pending} className="btn-primary mt-5 w-full py-3.5">
          <Icon name="lock" size={18} /> {pending ? "Memproses…" : `Bayar ${formatIDR(toIDR(total))}`}
        </button>
        <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-on-surface-variant">
          <Icon name="verified_user" size={14} className="text-primary-container" /> Pembayaran simulasi · aman
        </div>
      </div>
    </form>
  );
}
