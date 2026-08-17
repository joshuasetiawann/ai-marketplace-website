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
  /** product_ids whose product is no longer readable — see partitionCartRows(). */
  unavailable: string[];
  subtotal: number;
  taxes: number;
  total: number;
};

/** Shape of one `cart_items` row joined with its product, as PostgREST returns it. */
type CartRow = {
  product_id?: string | null;
  qty?: number | null;
  products?:
    | { id: string; name: string; tagline: string | null; price_usd: number | string; art: string[] | null; icon: string | null; category: string | null }
    | { id: string; name: string; tagline: string | null; price_usd: number | string; art: string[] | null; icon: string | null; category: string | null }[]
    | null;
};

/**
 * Split cart rows into buyable lines and dead ones.
 *
 * A cart row outlives its product's visibility: `products_read` only exposes
 * `status = 'published'` to a buyer, and saveProduct() pushes every edited
 * listing back to draft/under_review — so an ordinary seller edit makes the
 * embedded join come back null for anyone holding that item.
 *
 * Those rows used to be dropped on the floor here. The row itself stayed, so the
 * navbar badge (which counts cart_items directly) kept counting it, and
 * checkout() refused the whole cart with "Keranjang berisi produk yang tidak
 * tersedia." — naming an item the buyer could neither see nor delete. Returning
 * the ids instead lets the cart offer a Hapus button for them.
 */
export function partitionCartRows(rows: CartRow[]): { lines: CartLine[]; unavailable: string[] } {
  const lines: CartLine[] = [];
  const unavailable: string[] = [];

  for (const row of rows) {
    const p = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!p) {
      if (row.product_id) unavailable.push(row.product_id);
      continue;
    }
    lines.push({
      id: p.id,
      name: p.name,
      tagline: p.tagline ?? "",
      price: Number(p.price_usd),
      art: p.art ?? ["#0b3a44", "#00e5ff"],
      icon: p.icon ?? "apps",
      category: p.category ?? "",
      qty: Number(row.qty) || 1,
    });
  }
  return { lines, unavailable };
}

/** Fetch the user's cart joined with product details + computed totals (USD). */
export async function getCart(
  supabase: SupabaseClient,
  userId: string,
): Promise<CartSummary> {
  const { data } = await supabase
    .from("cart_items")
    .select("product_id, qty, products(id,name,tagline,price_usd,art,icon,category)")
    .eq("user_id", userId)
    .order("added_at", { ascending: true });

  const { lines, unavailable } = partitionCartRows((data ?? []) as CartRow[]);

  const subtotal = Math.round(lines.reduce((n, l) => n + l.price * l.qty, 0) * 100) / 100;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + taxes) * 100) / 100;
  return { lines, unavailable, subtotal, taxes, total };
}

/**
 * Badge count for the navbar. Goes through the same join as the cart page — a
 * bare count of cart_items reports items the page cannot show.
 */
export async function getCartCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase
    .from("cart_items")
    .select("product_id, qty, products(id)")
    .eq("user_id", userId);
  // summed quantity, not row count — the badge shows how many units are in there
  return partitionCartRows((data ?? []) as CartRow[]).lines.reduce((n, l) => n + l.qty, 0);
}
