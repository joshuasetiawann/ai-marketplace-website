import Link from "next/link";
import Icon from "@/components/Icon";
import ModelArtwork from "@/components/ModelArtwork";
import SellerProductActions from "@/components/SellerProductActions";
import { EmptyState } from "@/components/common";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Produk Saya — Nexora AI" };

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "border-white/15 text-on-surface-variant" },
  under_review: { label: "Ditinjau", cls: "border-secondary/40 bg-secondary/10 text-secondary" },
  published: { label: "Terbit", cls: "border-success/40 bg-success/10 text-success" },
  rejected: { label: "Ditolak", cls: "border-error/40 bg-error/10 text-error" },
};

export default async function SellerProductsPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();

  const { data: products } = await supabase
    .from("products")
    .select("id,name,category,price_usd,art,icon,status,created_at")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  const list = products ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-title-md text-on-surface">Produk Saya</h2>
        <Link href="/sell/products/new" className="btn-primary px-5 py-2.5">
          <Icon name="add" size={18} /> Produk baru
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="Belum ada produk"
          message="Buat listing pertamamu dan kirim untuk ditinjau admin."
          action={
            <Link href="/sell/products/new" className="btn-primary px-6 py-3">
              <Icon name="add" size={18} /> Buat produk
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((p) => {
            const s = STATUS[p.status] ?? STATUS.draft;
            return (
              // gap-x/gap-y + flex-wrap: at 360px the thumbnail, name, status pill
              // and action menu could not share one line, and the pill and menu
              // were clipped off the card. They now drop to a second row.
              <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl surface-card p-4">
                <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                  <ModelArtwork seed={p.id} colors={p.art} icon={p.icon} className="h-full w-full" />
                </div>
                <div className="min-w-[8rem] flex-1">
                  <p className="truncate font-display text-body-md font-semibold text-on-surface">{p.name}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    <span className="capitalize">{p.category}</span> ·{" "}
                    {Number(p.price_usd) === 0 ? "Gratis" : `${formatIDR(toIDR(Number(p.price_usd)))}/bln`}
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-label ${s.cls}`}>{s.label}</span>
                <SellerProductActions id={p.id} status={p.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
