import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import ModelArtwork from "@/components/ModelArtwork";
import { createServerClient } from "@/lib/supabase/server";
import { toIDR, formatIDR } from "@/lib/pricing";

type OrderItem = {
  product_id: string | null;
  name: string;
  price_usd: number | string;
  qty: number;
  art: string[] | null;
  icon: string | null;
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("id,created_at,status,method,total_usd, order_items(product_id,name,price_usd,qty,art,icon)")
    .eq("id", id)
    .eq("buyer_id", user!.id)
    .maybeSingle();

  if (!order) notFound();

  const items = (order.order_items as OrderItem[] | null) ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
          <Icon name="check_circle" size={34} fill />
        </span>
        <h1 className="font-display text-headline-md text-on-surface">Pembayaran berhasil</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Pesanan <span className="font-mono text-on-surface">#{order.id.slice(0, 8).toUpperCase()}</span> sudah lunas.
        </p>
      </div>

      <div className="rounded-xl surface-card p-6">
        <div className="flex flex-col gap-4">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <ModelArtwork seed={it.product_id ?? it.name} colors={it.art ?? ["#0b3a44", "#00e5ff"]} icon={it.icon ?? "apps"} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                {it.product_id ? (
                  <Link href={`/model/${it.product_id}`} className="truncate text-body-md text-on-surface hover:text-primary-container">
                    {it.name}
                  </Link>
                ) : (
                  <span className="truncate text-body-md text-on-surface">{it.name}</span>
                )}
                <p className="text-[12px] text-on-surface-variant">Qty {it.qty}</p>
              </div>
              <span className="text-body-sm text-on-surface">{formatIDR(toIDR(Number(it.price_usd) * it.qty))}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-5 hairline">
          <span className="font-display text-title-md text-on-surface">Total dibayar</span>
          <span className="font-display text-headline-md text-primary-container">{formatIDR(toIDR(Number(order.total_usd)))}</span>
        </div>
        <p className="mt-2 text-[12px] text-on-surface-variant">
          Metode: {order.method ? String(order.method).toUpperCase() : "—"} ·{" "}
          {new Date(order.created_at).toLocaleString("id-ID")}
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/orders" className="btn-ghost px-6 py-3">
          <Icon name="receipt_long" size={18} /> Semua pesanan
        </Link>
        <Link href="/explore" className="btn-primary px-6 py-3">
          Lanjut belanja <Icon name="arrow_forward" size={18} />
        </Link>
      </div>
    </div>
  );
}
