// USD demo prices → believable Rupiah for display. Ported from the Vite app.
export const USD_TO_IDR = 15800;

// Jelajahi price-range slider bounds (IDR). Values are quantized to the step
// grid server-side so the explore cache key space stays bounded.
export const PRICE_MAX_IDR = 2_000_000;
export const PRICE_STEP_IDR = 50_000;

/**
 * Ceiling for a listing price, in USD (enforced in saveProduct).
 *
 * orders.total_usd is numeric(10,2) — it tops out just under 100 million. A
 * cart line is price × qty (qty ≤ MAX_QTY = 99) plus 11% PPN, so anything up to
 * ~910k is arithmetically safe; 100k is far above any real listing and leaves
 * the margin obvious. Without it, one absurdly priced product makes checkout
 * fail with a numeric-overflow error for whoever puts it in their cart.
 */
export const MAX_PRICE_USD = 100_000;

export const toIDR = (usd: number) => Math.round(usd * USD_TO_IDR);

export const formatIDR = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

/** Compact Rupiah for tight spots like product cards (e.g. "Rp 379rb", "Rp 1,4jt"). */
export function formatIDRShort(n: number) {
  n = Math.round(n);
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return "Rp " + (Number.isInteger(v) ? v : v.toFixed(1)).toString().replace(".", ",") + "jt";
  }
  if (n >= 1000) return "Rp " + Math.round(n / 1000) + "rb";
  return "Rp " + n;
}
