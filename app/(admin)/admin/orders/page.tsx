import Icon from "@/components/Icon";
import AdminOrderActions from "@/components/AdminOrderActions";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Pesanan — Console" };

const STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: "Lunas", cls: "text-success" },
  refunded: { label: "Dikembalikan", cls: "text-secondary" },
  pending: { label: "Menunggu", cls: "text-on-surface-variant" },
  failed: { label: "Gagal", cls: "text-error" },
  cancelled: { label: "Dibatalkan", cls: "text-error" },
};

export default async function AdminOrdersPage() {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("orders")
    .select("id,created_at,status,method,total_usd, profiles(name), order_items(id)")
    .in("status", ["paid", "refunded"])
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (data ?? []).map((o: Record<string, unknown>) => {
    const buyer = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
    const items = (o.order_items as { id: string }[] | null) ?? [];
    return {
      id: String(o.id),
      created_at: String(o.created_at),
      status: String(o.status),
      total_usd: Number(o.total_usd),
      buyerName: (buyer as { name?: string } | null)?.name || "—",
      itemCount: items.length,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-title-md text-on-surface">Pesanan</h2>

      {orders.length === 0 ? (
        <EmptyState icon="receipt_long" title="Belum ada pesanan" message="Transaksi yang selesai akan muncul di sini." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => {
            const s = STATUS[o.status] ?? STATUS.paid;
            return (
              <div key={o.id} className="flex flex-wrap items-center gap-4 rounded-xl surface-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-body-sm text-on-surface">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {o.buyerName} · {o.itemCount} item · {new Date(o.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </p>
                </div>
                <span className="font-display text-body-lg text-on-surface">{formatIDR(toIDR(o.total_usd))}</span>
                <span className={`inline-flex items-center gap-1 text-[12px] ${s.cls}`}>
                  <Icon name="circle" size={8} fill /> {s.label}
                </span>
                {o.status === "paid" && <AdminOrderActions id={o.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
