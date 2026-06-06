import Link from "next/link";
import Icon from "@/components/Icon";
import ModelArtwork from "@/components/ModelArtwork";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Library — Nexora AI" };

type OwnedRow = {
  product_id: string | null;
  name: string;
  icon: string | null;
  art: string[] | null;
  orders: { created_at: string } | { created_at: string }[] | null;
};

export default async function LibraryPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;

  const { data } = await supabase
    .from("order_items")
    .select("product_id, name, icon, art, orders!inner(buyer_id, status, created_at)")
    .eq("orders.buyer_id", uid)
    .eq("orders.status", "paid");

  // one card per product (most recent purchase wins)
  const byProduct = new Map<string, OwnedRow>();
  for (const row of (data ?? []) as OwnedRow[]) {
    if (!row.product_id) continue;
    if (!byProduct.has(row.product_id)) byProduct.set(row.product_id, row);
  }
  const owned = [...byProduct.values()];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-title-md text-on-surface">Library</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">Model AI yang sudah kamu miliki.</p>
      </div>

      {owned.length === 0 ? (
        <EmptyState
          icon="deployed_code"
          title="Library masih kosong"
          message="Model yang kamu beli akan muncul di sini."
          action={
            <Link href="/explore" className="btn-primary px-6 py-2.5 text-body-sm">
              Jelajahi model
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map((m) => {
            const order = Array.isArray(m.orders) ? m.orders[0] : m.orders;
            return (
              <div key={m.product_id} className="flex flex-col overflow-hidden rounded-xl surface-card">
                <div className="aspect-video">
                  <ModelArtwork seed={m.product_id ?? m.name} colors={m.art ?? undefined} icon={m.icon ?? undefined} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="font-display text-body-lg font-semibold text-on-surface">{m.name}</p>
                    {order && (
                      <p className="mt-0.5 text-[12px] text-on-surface-variant">
                        Dibeli {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <Link href={`/library/${m.product_id}`} className="btn-primary flex-1 justify-center py-2.5 text-body-sm">
                      <Icon name="key" size={16} /> Akses
                    </Link>
                    <Link href={`/model/${m.product_id}`} className="btn-soft px-4 py-2.5 text-body-sm" aria-label="Lihat halaman model">
                      <Icon name="open_in_new" size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
