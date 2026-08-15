import type { SupabaseClient } from "@supabase/supabase-js";

export const TAX_RATE = 0.11; // PPN 11%

/**
 * Server Actions take whatever the caller sends — the +/- buttons in the UI are
 * not a constraint. Without a cap, `qty` can be pushed high enough that
 * price × qty overflows orders.total_usd (numeric(10,2)) and checkout fails with
 * a Postgres error no buyer can act on. Mirrored by the cart_items_qty_max CHECK
 * constraint so no writer can route around it.
 */
export const MAX_QTY = 99;

/** Coerce any caller-supplied quantity into 0..MAX_QTY (0 means "remove"). */
export const clampQty = (n: number) =>
  Math.min(MAX_QTY, Math.max(0, Math.trunc(Number(n) || 0)));

export type CartLine = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  art: string[];
  icon: string;
  category: string;
  qty: number;
};

export type CartSummary = {
  lines: CartLine[];
  subtotal: number;
  taxes: number;
  total: number;
};

/** Fetch the user's cart joined with product details + computed totals (USD). */
export async function getCart(
  supabase: SupabaseClient,
  userId: string,
): Promise<CartSummary> {
  const { data } = await supabase
    .from("cart_items")
    .select("qty, products(id,name,tagline,price_usd,art,icon,category)")
    .eq("user_id", userId)
    .order("added_at", { ascending: true });

  const lines: CartLine[] = (data ?? [])
    .map((row: Record<string, unknown>) => {
      const p = (Array.isArray(row.products) ? row.products[0] : row.products) as
        | { id: string; name: string; tagline: string | null; price_usd: number | string; art: string[] | null; icon: string | null; category: string | null }
        | null;
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        tagline: p.tagline ?? "",
        price: Number(p.price_usd),
        art: p.art ?? ["#0b3a44", "#00e5ff"],
        icon: p.icon ?? "apps",
        category: p.category ?? "",
        qty: Number(row.qty) || 1,
      };
    })
    .filter((x): x is CartLine => x !== null);

  const subtotal = Math.round(lines.reduce((n, l) => n + l.price * l.qty, 0) * 100) / 100;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + taxes) * 100) / 100;
  return { lines, subtotal, taxes, total };
}
