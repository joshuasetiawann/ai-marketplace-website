import AdminPayoutActions from "@/components/AdminPayoutActions";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Payout — Console" };

const STATUS: Record<string, { label: string; cls: string }> = {
  processing: { label: "Diproses", cls: "border-secondary/40 bg-secondary/10 text-secondary" },
  paid: { label: "Dibayar", cls: "border-success/40 bg-success/10 text-success" },
  rejected: { label: "Ditolak", cls: "border-error/40 bg-error/10 text-error" },
};

export default async function AdminPayoutsPage() {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("payouts")
    .select("id,amount_usd,bank,account_masked,status,requested_at,profiles!payouts_seller_id_fkey(name)")
    .order("requested_at", { ascending: false });

  const rows = (data ?? []).map((p: Record<string, unknown>) => {
    const seller = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    return { ...p, sellerName: (seller as { name?: string } | null)?.name || "—" } as {
      id: string;
      amount_usd: number;
      bank: string | null;
      account_masked: string | null;
      status: string;
      requested_at: string;
      sellerName: string;
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-title-md text-on-surface">Pencairan Dana</h2>

      {rows.length === 0 ? (
        <EmptyState icon="account_balance" title="Belum ada permintaan payout" />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((p) => {
            const s = STATUS[p.status] ?? STATUS.processing;
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl surface-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-body-md font-semibold text-on-surface">
                    {formatIDR(toIDR(Number(p.amount_usd)))}
                  </p>
                  <p className="text-[12px] text-on-surface-variant">
                    {p.sellerName} · {p.bank} {p.account_masked} ·{" "}
                    {new Date(p.requested_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${s.cls}`}>{s.label}</span>
                {p.status === "processing" && <AdminPayoutActions id={p.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
