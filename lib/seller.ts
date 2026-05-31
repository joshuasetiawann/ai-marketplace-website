import type { SupabaseClient } from "@supabase/supabase-js";

const r2 = (n: number) => Math.round(n * 100) / 100;

export type SellerEarnings = {
  gross: number;
  fees: number;
  net: number;
  withdrawn: number;
  available: number;
  salesCount: number;
  unitsSold: number;
  customers: number;
};

/** Aggregate a seller's economy from the sales ledger + payouts. */
export async function getSellerEarnings(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<SellerEarnings> {
  const [{ data: sales }, { data: payouts }] = await Promise.all([
    supabase.from("sales").select("gross,fee,net,qty,buyer_name").eq("seller_id", sellerId).eq("status", "paid"),
    supabase.from("payouts").select("amount_usd,status").eq("seller_id", sellerId),
  ]);

  const s = sales ?? [];
  const gross = r2(s.reduce((n, x) => n + Number(x.gross), 0));
  const fees = r2(s.reduce((n, x) => n + Number(x.fee), 0));
  const net = r2(s.reduce((n, x) => n + Number(x.net), 0));
  const withdrawn = r2(
    (payouts ?? []).filter((p) => p.status !== "rejected").reduce((n, p) => n + Number(p.amount_usd), 0),
  );
  return {
    gross,
    fees,
    net,
    withdrawn,
    available: Math.max(0, r2(net - withdrawn)),
    salesCount: s.length,
    unitsSold: s.reduce((n, x) => n + (Number(x.qty) || 1), 0),
    customers: new Set(s.map((x) => x.buyer_name)).size,
  };
}
