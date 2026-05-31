import Icon from "@/components/Icon";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { getSellerEarnings } from "@/lib/seller";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Penjualan — Nexora AI" };

export default async function SellerSalesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;

  const [{ data: sales }, earnings] = await Promise.all([
    supabase
      .from("sales")
      .select("id,product_name,buyer_name,qty,gross,fee,net,method,created_at")
      .eq("seller_id", uid)
      .order("created_at", { ascending: false }),
    getSellerEarnings(supabase, uid),
  ]);

  const list = sales ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-title-md text-on-surface">Penjualan</h2>
        <div className="text-right">
          <p className="font-display text-title-md text-success">{formatIDR(toIDR(earnings.net))}</p>
          <p className="text-[12px] text-on-surface-variant">pendapatan bersih ({earnings.salesCount} transaksi)</p>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="Belum ada penjualan"
          message="Penjualan dari produk terbitanmu akan muncul di sini, lengkap dengan komisi dan pendapatan bersih."
        />
      ) : (
        <div className="overflow-hidden rounded-xl surface-card">
          <div className="hidden grid-cols-[1.6fr_1fr_0.6fr_0.9fr_0.9fr] gap-3 border-b px-5 py-3 text-[12px] uppercase tracking-wide text-on-surface-variant hairline sm:grid">
            <span>Produk</span>
            <span>Pembeli</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Kotor</span>
            <span className="text-right">Bersih</span>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {list.map((s) => (
              <div key={s.id} className="grid grid-cols-2 gap-2 px-5 py-3 text-body-sm sm:grid-cols-[1.6fr_1fr_0.6fr_0.9fr_0.9fr] sm:items-center sm:gap-3">
                <div className="min-w-0">
                  <p className="truncate text-on-surface">{s.product_name}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {new Date(s.created_at).toLocaleDateString("id-ID")}
                    {s.method ? ` · ${String(s.method).toUpperCase()}` : ""}
                  </p>
                </div>
                <span className="truncate text-on-surface-variant">{s.buyer_name}</span>
                <span className="text-on-surface-variant sm:text-center">×{s.qty}</span>
                <span className="text-on-surface sm:text-right">{formatIDR(toIDR(Number(s.gross)))}</span>
                <span className="text-success sm:text-right">{formatIDR(toIDR(Number(s.net)))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
        <Icon name="insights" size={14} /> Komisi platform 20% sudah dipotong dari setiap transaksi.
      </p>
    </div>
  );
}
