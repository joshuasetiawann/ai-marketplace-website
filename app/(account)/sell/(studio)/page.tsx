import Link from "next/link";
import Icon from "@/components/Icon";
import { createServerClient } from "@/lib/supabase/server";
import { getSellerEarnings } from "@/lib/seller";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Ringkasan Seller — Nexora AI" };

export default async function SellerOverviewPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;

  const [{ data: store }, earnings, { data: recent }, { count: productCount }] = await Promise.all([
    supabase.from("stores").select("name, handle, tagline").eq("owner_id", uid).single(),
    getSellerEarnings(supabase, uid),
    supabase.from("sales").select("product_name,buyer_name,net,created_at").eq("seller_id", uid).order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("owner_id", uid),
  ]);

  const stats = [
    { label: "Saldo tersedia", value: formatIDR(toIDR(earnings.available)), icon: "account_balance_wallet", accent: true },
    { label: "Pendapatan bersih", value: formatIDR(toIDR(earnings.net)), icon: "payments" },
    { label: "Penjualan kotor", value: formatIDR(toIDR(earnings.gross)), icon: "trending_up" },
    { label: "Unit terjual", value: String(earnings.unitsSold), icon: "inventory_2" },
    { label: "Pelanggan", value: String(earnings.customers), icon: "group" },
    { label: "Produk", value: String(productCount ?? 0), icon: "deployed_code" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-title-md text-on-surface">{store?.name || "Toko kamu"}</h2>
          {store?.tagline && <p className="text-body-sm text-on-surface-variant">{store.tagline}</p>}
        </div>
        <Link href="/sell/products/new" className="btn-primary px-5 py-2.5">
          <Icon name="add" size={18} /> Produk baru
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl surface-card p-5 ${s.accent ? "border-primary-container/30" : ""}`}>
            <Icon name={s.icon} size={20} className={s.accent ? "text-primary-container" : "text-on-surface-variant"} />
            <p className="mt-3 font-display text-title-md text-on-surface">{s.value}</p>
            <p className="text-[12px] text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-body-lg font-semibold text-on-surface">Penjualan terbaru</h3>
          <Link href="/sell/sales" className="text-body-sm text-primary-container hover:underline">
            Lihat semua
          </Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/5">
            {recent.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-body-sm text-on-surface">{r.product_name}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {r.buyer_name} · {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span className="text-body-sm text-success">+{formatIDR(toIDR(Number(r.net)))}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant">Belum ada penjualan. Terbitkan produk untuk mulai berjualan.</p>
        )}
      </div>
    </div>
  );
}
