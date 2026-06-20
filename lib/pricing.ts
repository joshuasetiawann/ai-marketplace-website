// USD demo prices → believable Rupiah for display. Ported from the Vite app.
export const USD_TO_IDR = 15800;

// Jelajahi price-range slider bounds (IDR). Values are quantized to the step
// grid server-side so the explore cache key space stays bounded.
export const PRICE_MAX_IDR = 2_000_000;
export const PRICE_STEP_IDR = 50_000;

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
