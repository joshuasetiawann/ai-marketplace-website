import Link from "next/link";
import Icon from "@/components/Icon";
import { createServerClient } from "@/lib/supabase/server";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Console Admin — Nexora AI" };

export default async function AdminOverviewPage() {
  const supabase = await createServerClient();

  const [users, published, pending, sales, payouts] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "under_review"),
    supabase.from("sales").select("gross").eq("status", "paid"),
    supabase.from("payouts").select("id", { count: "exact", head: true }).eq("status", "processing"),
  ]);

  const gmv = (sales.data ?? []).reduce((n, s) => n + Number(s.gross), 0);

  const stats = [
    { label: "Pengguna", value: String(users.count ?? 0), icon: "group", href: "/admin/users" },
    { label: "Produk terbit", value: String(published.count ?? 0), icon: "deployed_code", href: "/admin/products" },
    { label: "Menunggu moderasi", value: String(pending.count ?? 0), icon: "fact_check", href: "/admin/products", accent: true },
    { label: "GMV (kotor)", value: formatIDR(toIDR(gmv)), icon: "trending_up" },
    { label: "Payout diproses", value: String(payouts.count ?? 0), icon: "account_balance", href: "/admin/payouts" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((s) => {
          const hot = s.accent && Number(s.value) > 0;
          const card = (
            <div className={`rounded-xl surface-card p-5 ${hot ? "border-secondary/40" : ""}`}>
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                    hot
                      ? "border-secondary/25 bg-secondary/10 text-secondary"
                      : "border-success/20 bg-success/10 text-success"
                  }`}
                >
                  <Icon name={s.icon} size={18} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                  {s.label}
                </span>
              </div>
              <p className="mt-4 font-display text-headline-md text-on-surface">{s.value}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="transition-transform hover:-translate-y-0.5">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      <div className="rounded-xl surface-card p-6">
        <h3 className="mb-2 font-display text-body-lg font-semibold text-on-surface">Tindakan cepat</h3>
        <p className="mb-4 text-body-sm text-on-surface-variant">Kelola platform dari satu tempat.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products" className="btn-primary px-5 py-2.5">
            <Icon name="fact_check" size={18} /> Moderasi produk
          </Link>
          <Link href="/admin/payouts" className="btn-soft px-5 py-2.5">
            <Icon name="account_balance" size={18} /> Proses payout
          </Link>
        </div>
      </div>
    </div>
  );
}
