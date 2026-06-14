import Link from "next/link";
import Icon from "@/components/Icon";
import ModelArtwork from "@/components/ModelArtwork";
import AdminModerateActions from "@/components/AdminModerateActions";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Moderasi Produk — Console" };

export default async function AdminModerationPage() {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("products")
    .select("id,name,category,price_usd,art,icon,created_at,profiles!products_owner_id_fkey(name)")
    .eq("status", "under_review")
    .order("created_at", { ascending: true });

  const queue = (data ?? []).map((p: Record<string, unknown>) => {
    const owner = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    return { ...p, ownerName: (owner as { name?: string } | null)?.name || "—" } as {
      id: string;
      name: string;
      category: string;
      price_usd: number;
      art: string[];
      icon: string;
      ownerName: string;
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-title-md text-on-surface">Antrian Moderasi</h2>
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-[12px] text-secondary">{queue.length} menunggu</span>
      </div>

      {queue.length === 0 ? (
        <EmptyState icon="fact_check" title="Antrian bersih" message="Tidak ada produk yang menunggu ditinjau saat ini." />
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl surface-card p-4">
              <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                <ModelArtwork seed={p.id} colors={p.art} icon={p.icon} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/model/${p.id}`} className="truncate font-display text-body-md font-semibold text-on-surface hover:text-primary-container">
                  {p.name}
                </Link>
                <p className="text-[12px] text-on-surface-variant">
                  oleh <span className="text-on-surface">{p.ownerName}</span> ·{" "}
                  <span className="font-mono text-[11px]">{p.category}</span> ·{" "}
                  {Number(p.price_usd) === 0 ? "Gratis" : `${formatIDR(toIDR(Number(p.price_usd)))}/bln`}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/35 bg-secondary/10 px-3 py-1 text-[12px] text-secondary">
                <Icon name="schedule" size={14} /> Dalam Review
              </span>
              <Link href={`/model/${p.id}`} className="rounded-md p-2 text-on-surface-variant hover:bg-white/5" title="Pratinjau">
                <Icon name="visibility" size={18} />
              </Link>
              <AdminModerateActions id={p.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
