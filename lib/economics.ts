// Marketplace economics — single source of truth for revenue split & payout
// rules. Mirrors the values promised in the marketing copy (80% revenue share).

export const PLATFORM_FEE = 0.2;
export const SELLER_SHARE = 1 - PLATFORM_FEE; // 0.8
export const MIN_PAYOUT_USD = 50;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Platform fee taken from a gross amount. */
export const feeOf = (gross: number) => round2(gross * PLATFORM_FEE);

/** Seller's net earnings from a gross amount. */
export const netOf = (gross: number) => round2(gross * SELLER_SHARE);
