import Link from "next/link";
import Icon from "@/components/Icon";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Pesanan — Nexora AI" };

const STATUS_LABEL: Record<string, string> = { paid: "Lunas", pending: "Menunggu", failed: "Gagal" };

export default async function OrdersPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id,created_at,status,method,total_usd, order_items(id)")
    .eq("buyer_id", user!.id)
    .order("created_at", { ascending: false });

  const list = orders ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-display text-headline-md text-on-surface">Pesanan Saya</h1>

      {list.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="Belum ada pesanan"
          message="Pesanan yang sudah kamu bayar akan muncul di sini."
          action={
            <Link href="/explore" className="btn-primary px-6 py-3">
              <Icon name="explore" size={18} /> Mulai belanja
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((o) => {
            const items = (o.order_items as { id: string }[] | null) ?? [];
            return (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center justify-between rounded-xl surface-card p-5 transition-all hover:border-primary-container/30"
              >
                <div>
                  <p className="font-mono text-body-sm text-on-surface">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-[12px] text-on-surface-variant">
                    {new Date(o.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })} · {items.length} item
                    {o.method ? ` · ${String(o.method).toUpperCase()}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-body-lg text-primary-container">
                    {formatIDR(toIDR(Number(o.total_usd)))}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[12px] text-success">
                    <Icon name="check_circle" size={13} fill /> {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
