import Link from "next/link";
import Icon from "@/components/Icon";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getSellerEarnings } from "@/lib/seller";
import { MIN_PAYOUT_USD } from "@/lib/economics";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Earnings — Nexora AI" };

export default async function SellerEarningsPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  const earnings = await getSellerEarnings(supabase, user!.id);

  const canPayout = earnings.available >= MIN_PAYOUT_USD;

  const rows = [
    { label: "Penjualan kotor", value: earnings.gross, icon: "trending_up" },
    { label: "Komisi platform (20%)", value: -earnings.fees, icon: "remove", muted: true },
    { label: "Pendapatan bersih", value: earnings.net, icon: "payments", strong: true },
    { label: "Sudah dicairkan", value: -earnings.withdrawn, icon: "account_balance", muted: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-title-md text-on-surface">Earnings</h2>

      <div className="rounded-xl border border-primary-container/30 bg-primary-container/5 p-6">
        <p className="text-body-sm text-on-surface-variant">Saldo tersedia untuk dicairkan</p>
        {/* Rupiah runs long — "Rp 12.345.678" needs ~420px at the old fixed 56px,
            which overflowed every phone. Scale it like the marketplace headings do. */}
        <p className="mt-1 font-display text-headline-md leading-tight text-primary-container md:text-display-md">
          {formatIDR(toIDR(earnings.available))}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/sell/payouts"
            className={`btn-primary px-6 py-3 ${canPayout ? "" : "pointer-events-none opacity-50"}`}
          >
            <Icon name="account_balance_wallet" size={18} /> Cairkan dana
          </Link>
          {!canPayout && (
            <span className="text-[12px] text-on-surface-variant">
              Minimal pencairan {formatIDR(toIDR(MIN_PAYOUT_USD))}.
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl surface-card p-6">
        <h3 className="mb-4 font-display text-body-lg font-semibold text-on-surface">Rincian</h3>
        <div className="flex flex-col divide-y divide-white/5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <span className={`flex items-center gap-2 text-body-sm ${r.muted ? "text-on-surface-variant" : "text-on-surface"}`}>
                <Icon name={r.icon} size={16} /> {r.label}
              </span>
              <span
                className={`text-body-md ${
                  r.strong ? "font-semibold text-success" : r.value < 0 ? "text-on-surface-variant" : "text-on-surface"
                }`}
              >
                {r.value < 0 ? "−" : ""}
                {formatIDR(toIDR(Math.abs(r.value)))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
