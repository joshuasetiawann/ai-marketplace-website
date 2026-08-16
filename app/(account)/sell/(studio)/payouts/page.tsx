import PayoutClient from "@/components/PayoutClient";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSellerEarnings } from "@/lib/seller";
import { toIDR, formatIDR } from "@/lib/pricing";

export const metadata = { title: "Payout — Nexora AI" };

const STATUS: Record<string, { label: string; cls: string }> = {
  processing: { label: "Diproses", cls: "text-secondary" },
  paid: { label: "Selesai", cls: "text-success" },
  rejected: { label: "Ditolak", cls: "text-error" },
};

export default async function SellerPayoutsPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  const uid = user!.id;

  // Payout bank details are not exposed over the public API (see the RLS
  // hardening migration); read them server-side with the service-role client,
  // scoped to the signed-in owner only.
  const admin = createAdminClient();
  const [{ data: store }, earnings, { data: payouts }] = await Promise.all([
    admin.from("stores").select("payout_bank, payout_account_masked, payout_status").eq("owner_id", uid).single(),
    getSellerEarnings(supabase, uid),
    supabase.from("payouts").select("id,amount_usd,bank,account_masked,status,requested_at").eq("seller_id", uid).order("requested_at", { ascending: false }),
  ]);

  const history = payouts ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-title-md text-on-surface">Payout</h2>

      <PayoutClient
        bank={store?.payout_bank ?? null}
        accountMasked={store?.payout_account_masked ?? null}
        status={store?.payout_status ?? "none"}
        available={earnings.available}
      />

      <section className="rounded-xl surface-card p-6">
        <h3 className="mb-4 font-display text-body-lg font-semibold text-on-surface">Riwayat Pencairan</h3>
        {history.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Belum ada pencairan.</p>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {history.map((p) => {
              const s = STATUS[p.status] ?? STATUS.processing;
              return (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-body-sm text-on-surface">{formatIDR(toIDR(Number(p.amount_usd)))}</p>
                    <p className="text-[12px] text-on-surface-variant">
                      {p.bank} {p.account_masked} · {new Date(p.requested_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className={`text-[12px] ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
