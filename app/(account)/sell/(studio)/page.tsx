import Link from "next/link";
import Icon from "@/components/Icon";
import EarningsChart from "@/components/EarningsChart";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getSellerEarnings } from "@/lib/seller";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Ringkasan Seller — Nexora AI" };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default async function SellerOverviewPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  const uid = user!.id;

  const [earnings, { data: sales }] = await Promise.all([
    getSellerEarnings(supabase, uid),
    supabase
      .from("sales")
      .select("product_name, net, created_at")
      .eq("seller_id", uid)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const rows = sales ?? [];
  const recent = rows.slice(0, 4);

  // weekly net revenue buckets, oldest → newest ("Mgg-6" … "Kini"), anchored to
  // the newest sale so the computation stays pure (no Date.now() during render)
  const anchor = rows.length ? new Date(rows[0].created_at).getTime() : 0;
  const weekly = Array.from({ length: 6 }, () => 0);
  for (const r of rows) {
    const age = anchor - new Date(r.created_at).getTime();
    const bucket = Math.floor(age / WEEK_MS);
    if (bucket >= 0 && bucket < 6) weekly[5 - bucket] += Number(r.net) || 0;
  }
  const chartLabels = ["Mgg-6", "Mgg-5", "Mgg-4", "Mgg-3", "Mgg-2", "Kini"];

  // best sellers by unit count
  const byProduct = new Map<string, number>();
  for (const r of rows) byProduct.set(r.product_name, (byProduct.get(r.product_name) ?? 0) + 1);
  const best = [...byProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const bestMax = best[0]?.[1] ?? 1;

  const stats = [
    {
      label: "Pendapatan Bersih",
      note: "setelah fee",
      value: formatIDR(toIDR(earnings.net)),
      icon: "payments",
      gold: true,
    },
    {
      label: "Saldo Tersedia",
      note: "siap cair",
      value: formatIDR(toIDR(earnings.available)),
      icon: "account_balance_wallet",
      gold: true,
    },
    {
      label: "Produk Terjual",
      note: `${earnings.unitsSold} transaksi`,
      value: String(earnings.unitsSold),
      icon: "inventory_2",
    },
    {
      label: "Pelanggan",
      note: "pembeli unik",
      value: String(earnings.customers),
      icon: "group",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl surface-card p-5">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                s.gold ? "border-secondary/25 bg-secondary/10 text-secondary" : "border-primary-container/20 bg-primary-container/10 text-primary-container"
              }`}
            >
              <Icon name={s.icon} size={18} />
            </span>
            <p className={`mt-4 font-display text-title-md ${s.gold ? "text-secondary" : "text-on-surface"}`}>{s.value}</p>
            <p className="mt-0.5 text-[12px] text-on-surface-variant">
              <span className="text-on-surface">{s.label}</span> · {s.note}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl surface-card p-6">
        <div className="mb-5">
          <h3 className="font-display text-body-lg font-semibold text-on-surface">Tren Pendapatan Bersih</h3>
          <p className="text-[12px] text-on-surface-variant">
            6 minggu terakhir · bersih setelah potongan platform 20%.
          </p>
        </div>
        <EarningsChart points={weekly} labels={chartLabels} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl surface-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-body-lg font-semibold text-on-surface">Penjualan Terbaru</h3>
            <Link href="/sell/sales" className="text-body-sm text-secondary hover:underline">
              Semua pesanan
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm text-on-surface">{r.product_name}</p>
                    <p className="font-mono text-[11px] text-on-surface-variant">
                      {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="font-mono text-body-sm text-secondary">+{formatIDR(toIDR(Number(r.net)))}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              Belum ada penjualan. Terbitkan produk untuk mulai berjualan.
            </p>
          )}
        </div>

        <div className="flex flex-col rounded-xl surface-card p-6">
          <h3 className="mb-4 font-display text-body-lg font-semibold text-on-surface">Produk Terlaris</h3>
          {best.length > 0 ? (
            <div className="flex flex-col gap-4">
              {best.map(([name, n]) => (
                <div key={name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="truncate text-body-sm text-on-surface">{name}</p>
                    <span className="font-mono text-[11px] text-on-surface-variant">{n}×</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${(n / bestMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">Belum ada data penjualan.</p>
          )}
          <Link href="/sell/payouts" className="btn btn-gold-ghost mt-auto w-full py-3 max-lg:mt-6 lg:mt-auto">
            <Icon name="account_balance_wallet" size={18} /> Cairkan Saldo
          </Link>
        </div>
      </div>
    </div>
  );
}
