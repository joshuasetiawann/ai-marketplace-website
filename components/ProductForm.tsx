"use client";

import { useActionState, useState } from "react";
import Icon from "./Icon";
import { saveProduct, type ProductState } from "@/lib/actions/products";
import { CATEGORIES, USE_CASES, TIERS, type Capability } from "@/lib/catalog";
import { formatIDR, toIDR } from "@/lib/pricing";

export type ProductFormValues = {
  id?: string;
  name?: string;
  tagline?: string;
  category?: string;
  tier?: string;
  price?: number;
  description?: string;
  icon?: string;
  art?: string[];
  useCases?: string[];
  useCaseTags?: string[];
  gallery?: number;
  capabilities?: Capability[];
  specs?: Record<string, string>;
  assetUrl?: string;
  accessNote?: string;
};

const field = "input-field";
const labelCls = "mb-2 block text-body-sm font-medium text-on-surface";

type SpecRow = { key: string; value: string };

export default function ProductForm({ product }: { product?: ProductFormValues }) {
  const [state, action, pending] = useActionState(saveProduct, {} as ProductState);
  const [price, setPrice] = useState(product?.price ?? 0);
  const art = product?.art ?? ["#0b3a44", "#00e5ff"];
  const useCases = product?.useCases ?? [];

  const [caps, setCaps] = useState<Capability[]>(product?.capabilities ?? []);
  const [specs, setSpecs] = useState<SpecRow[]>(
    Object.entries(product?.specs ?? {}).map(([key, value]) => ({ key, value })),
  );

  const specsObject = Object.fromEntries(
    specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]),
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      {/* serialized rich fields */}
      <input type="hidden" name="capabilities" value={JSON.stringify(caps.filter((c) => c.title.trim()))} />
      <input type="hidden" name="specs" value={JSON.stringify(specsObject)} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-body-sm text-error">
          <Icon name="error" size={18} fill /> {state.error}
        </div>
      )}

      <label className="block">
        <span className={labelCls}>Nama Produk</span>
        <input name="name" defaultValue={product?.name} placeholder="cth. Aurora Diffusion XL" className={field} required />
      </label>

      <label className="block">
        <span className={labelCls}>Tagline</span>
        <input name="tagline" defaultValue={product?.tagline} placeholder="Satu kalimat yang menjual" className={field} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Kategori</span>
          <select name="category" defaultValue={product?.category ?? ""} className={`${field} cursor-pointer appearance-none`} required>
            <option value="" className="bg-surface-container">Pilih…</option>
            {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
              <option key={c.id} value={c.id} className="bg-surface-container">{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Paket</span>
          <select name="tier" defaultValue={product?.tier ?? "Free"} className={`${field} cursor-pointer appearance-none`}>
            {TIERS.map((t) => (
              <option key={t} value={t} className="bg-surface-container">{t === "Free" ? "Gratis" : t}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Harga per bulan (USD)</span>
        <input
          name="price"
          type="number"
          min={0}
          step="1"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className={field}
        />
        <span className="mt-1.5 block text-[12px] text-on-surface-variant">
          ≈ {price > 0 ? `${formatIDR(toIDR(price))}/bln` : "Gratis"}
        </span>
      </label>

      <label className="block">
        <span className={labelCls}>Deskripsi</span>
        <textarea name="description" rows={4} defaultValue={product?.description} placeholder="Jelaskan apa yang membuat model ini istimewa…" className={`${field} resize-none`} />
      </label>

      <label className="block">
        <span className={labelCls}>Tag kegunaan <span className="text-outline">(pisahkan dengan koma)</span></span>
        <input name="use_case_tags" defaultValue={product?.useCaseTags?.join(", ")} placeholder="Concept Art, Editorial, Product Shots" className={field} />
      </label>

      <div>
        <span className={labelCls}>Cocok untuk</span>
        <div className="flex flex-wrap gap-2">
          {USE_CASES.map((u) => (
            <label
              key={u.id}
              className="chip cursor-pointer has-[:checked]:border-primary-container/40 has-[:checked]:bg-primary-container/10 has-[:checked]:text-primary"
            >
              <input type="checkbox" name="use_cases" value={u.id} defaultChecked={useCases.includes(u.id)} className="sr-only" />
              <Icon name={u.icon} size={14} /> {u.label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Capabilities ─────────────────────────────────────────────── */}
      <fieldset className="rounded-xl border border-white/10 p-4">
        <legend className="px-2 text-body-sm font-medium text-on-surface">Kemampuan</legend>
        <p className="mb-3 text-[12px] text-on-surface-variant">Kartu fitur yang tampil di tab “Kemampuan”.</p>
        <div className="flex flex-col gap-3">
          {caps.map((c, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[7rem_1fr_1.5fr_auto]">
              <input
                aria-label={`Ikon kemampuan ${i + 1}`}
                value={c.icon}
                onChange={(e) => setCaps((p) => p.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))}
                placeholder="bolt"
                className={field}
              />
              <input
                aria-label={`Judul kemampuan ${i + 1}`}
                value={c.title}
                onChange={(e) => setCaps((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                placeholder="Judul"
                className={field}
              />
              <input
                aria-label={`Deskripsi kemampuan ${i + 1}`}
                value={c.text}
                onChange={(e) => setCaps((p) => p.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                placeholder="Deskripsi singkat"
                className={field}
              />
              <button type="button" onClick={() => setCaps((p) => p.filter((_, j) => j !== i))} className="btn-soft px-3" aria-label={`Hapus kemampuan ${i + 1}`}>
                <Icon name="delete" size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCaps((p) => [...p, { icon: "bolt", title: "", text: "" }])}
          className="btn-soft mt-3 px-4 py-2 text-body-sm"
        >
          <Icon name="add" size={16} /> Tambah kemampuan
        </button>
      </fieldset>

      {/* ── Specs ────────────────────────────────────────────────────── */}
      <fieldset className="rounded-xl border border-white/10 p-4">
        <legend className="px-2 text-body-sm font-medium text-on-surface">Spesifikasi</legend>
        <p className="mb-3 text-[12px] text-on-surface-variant">Pasangan atribut/nilai (mis. “Context Window” → “128k”).</p>
        <div className="flex flex-col gap-3">
          {specs.map((s, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                aria-label={`Atribut spesifikasi ${i + 1}`}
                value={s.key}
                onChange={(e) => setSpecs((p) => p.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))}
                placeholder="Atribut"
                className={field}
              />
              <input
                aria-label={`Nilai spesifikasi ${i + 1}`}
                value={s.value}
                onChange={(e) => setSpecs((p) => p.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                placeholder="Nilai"
                className={field}
              />
              <button type="button" onClick={() => setSpecs((p) => p.filter((_, j) => j !== i))} className="btn-soft px-3" aria-label={`Hapus spesifikasi ${i + 1}`}>
                <Icon name="delete" size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSpecs((p) => [...p, { key: "", value: "" }])}
          className="btn-soft mt-3 px-4 py-2 text-body-sm"
        >
          <Icon name="add" size={16} /> Tambah spesifikasi
        </button>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Ikon</span>
          <input name="icon" defaultValue={product?.icon ?? "auto_awesome"} placeholder="auto_awesome" className={field} />
        </label>
        <label className="block">
          <span className={labelCls}>Jumlah pratinjau galeri</span>
          <input name="gallery" type="number" min={1} max={6} defaultValue={product?.gallery ?? 3} className={field} />
        </label>
      </div>

      <div>
        <span className={labelCls}>Warna artwork</span>
        <div className="flex gap-3">
          <input type="color" name="art0" defaultValue={art[0]} className="h-11 w-full rounded-lg border border-white/10 bg-surface-container-lowest" />
          <input type="color" name="art1" defaultValue={art[1]} className="h-11 w-full rounded-lg border border-white/10 bg-surface-container-lowest" />
        </div>
      </div>

      {/* ── Fulfillment (private to buyers) ──────────────────────────── */}
      <fieldset className="rounded-xl border border-white/10 p-4">
        <legend className="px-2 text-body-sm font-medium text-on-surface">Pengiriman digital</legend>
        <p className="mb-3 text-[12px] text-on-surface-variant">Hanya terlihat oleh pembeli yang sudah membayar.</p>
        <label className="mb-3 block">
          <span className={labelCls}>Tautan unduhan / akses</span>
          <input name="asset_url" type="url" defaultValue={product?.assetUrl} placeholder="https://…" className={field} />
        </label>
        <label className="block">
          <span className={labelCls}>Catatan akses</span>
          <textarea name="access_note" rows={2} defaultValue={product?.accessNote} placeholder="Instruksi aktivasi, endpoint API, dsb." className={`${field} resize-none`} />
        </label>
      </fieldset>

      <div className="mt-2 flex flex-wrap gap-3">
        <button type="submit" name="intent" value="submit" disabled={pending} className="btn-primary px-6 py-3">
          <Icon name="send" size={18} /> {pending ? "Menyimpan…" : "Kirim untuk ditinjau"}
        </button>
        <button type="submit" name="intent" value="draft" disabled={pending} className="btn-soft px-6 py-3">
          <Icon name="save" size={18} /> Simpan draft
        </button>
      </div>
    </form>
  );
}
