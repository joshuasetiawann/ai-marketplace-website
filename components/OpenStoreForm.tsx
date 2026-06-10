"use client";

import { useState, useActionState } from "react";
import Icon from "./Icon";
import { openStore, type SellerState } from "@/lib/actions/seller";
import { CATEGORIES } from "@/lib/catalog";

export default function OpenStoreForm() {
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [state, action, pending] = useActionState(openStore, {} as SellerState);
  const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24);

  return (
    <form action={action} className="rounded-2xl glass-panel p-6 sm:p-8">
      <input type="hidden" name="agree" value={agree ? "on" : "off"} />
      <h2 className="mb-1 font-display text-title-md text-on-surface">Detail Toko</h2>
      <p className="mb-6 text-body-sm text-on-surface-variant">
        Lengkapi info dasar — bisa diubah kapan saja di Seller Studio.
      </p>

      {state.error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-body-sm text-error">
          <Icon name="error" size={18} fill /> {state.error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-2 block text-body-sm font-medium text-on-surface">Nama Toko</span>
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Synthetix Labs" className="input-field" />
          {handle && (
            <span className="mt-1.5 block text-[12px] text-on-surface-variant">
              URL toko: <span className="font-mono text-primary-container">nexora.ai/creator/{handle}</span>
            </span>
          )}
        </label>
        <label className="block">
          <span className="mb-2 block text-body-sm font-medium text-on-surface">Kategori Utama</span>
          <div className="relative">
            <select name="category" defaultValue="" className="input-field cursor-pointer appearance-none pr-10">
              <option value="" className="bg-surface-container">Pilih kategori…</option>
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-container">
                  {c.label}
                </option>
              ))}
            </select>
            <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-body-sm font-medium text-on-surface">
            Tagline <span className="text-outline">(opsional)</span>
          </span>
          <input name="tagline" placeholder="Satu kalimat tentang tokomu" className="input-field" />
        </label>
        <label className="mt-1 flex cursor-pointer items-start gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={agree}
            aria-label="Setuju dengan Perjanjian Penjual"
            onClick={() => setAgree((a) => !a)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
              agree ? "border-primary-container bg-primary-container" : "border-white/30"
            }`}
          >
            {agree && <Icon name="check" size={14} className="text-on-primary-container" />}
          </button>
          <span className="text-body-sm text-on-surface-variant">
            Saya setuju dengan <span className="text-primary-container">Perjanjian Penjual</span> &amp; kebijakan komisi 20% Nexora.
          </span>
        </label>
        <button type="submit" disabled={pending} className="btn-primary mt-2 w-full py-3.5">
          <Icon name="storefront" size={18} /> {pending ? "Mengaktifkan…" : "Aktifkan Toko"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-on-surface-variant">
          <Icon name="lock" size={13} /> Gratis, tanpa biaya pendaftaran. Komisi hanya dari penjualan.
        </p>
      </div>
    </form>
  );
}
