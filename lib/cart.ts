import type { SupabaseClient } from "@supabase/supabase-js";

export const TAX_RATE = 0.11; // PPN 11%

export type CartLine = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  art: string[];
  icon: string;
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
    .select("qty, products(id,name,tagline,price_usd,art,icon)")
    .eq("user_id", userId)
    .order("added_at", { ascending: true });

  const lines: CartLine[] = (data ?? [])
    .map((row: Record<string, unknown>) => {
      const p = (Array.isArray(row.products) ? row.products[0] : row.products) as
        | { id: string; name: string; tagline: string | null; price_usd: number | string; art: string[] | null; icon: string | null }
        | null;
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        tagline: p.tagline ?? "",
        price: Number(p.price_usd),
        art: p.art ?? ["#0b3a44", "#00e5ff"],
        icon: p.icon ?? "apps",
        qty: Number(row.qty) || 1,
      };
    })
    .filter((x): x is CartLine => x !== null);

  const subtotal = Math.round(lines.reduce((n, l) => n + l.price * l.qty, 0) * 100) / 100;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + taxes) * 100) / 100;
  return { lines, subtotal, taxes, total };
}
