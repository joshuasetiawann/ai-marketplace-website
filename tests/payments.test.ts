import { describe, it, expect } from "vitest";
import { isPaymentChannel, PAYMENT_CHANNELS, VA_BANKS, EWALLETS } from "@/lib/payments";

// placeOrder() writes `method` onto the order and onto every sales row, and the
// column is plain `text` with no constraint — so this allowlist is the only thing
// standing between a public POST and arbitrary content on the admin/seller
// screens. Pinned here because the list is derived, not written out by hand.

describe("isPaymentChannel", () => {
  it("accepts every channel the checkout form can build", () => {
    expect(isPaymentChannel("qris")).toBe(true);
    for (const b of VA_BANKS) expect(isPaymentChannel(`va-${b.id}`)).toBe(true);
    for (const w of EWALLETS) expect(isPaymentChannel(`ewallet-${w.id}`)).toBe(true);
    expect(PAYMENT_CHANNELS).toHaveLength(1 + VA_BANKS.length + EWALLETS.length);
  });

  it("rejects a bare group id — the bank/wallet has to be resolved", () => {
    expect(isPaymentChannel("va")).toBe(false);
    expect(isPaymentChannel("ewallet")).toBe(false);
  });

  it("rejects anything else a direct POST could send", () => {
    expect(isPaymentChannel("")).toBe(false);
    expect(isPaymentChannel("va-notabank")).toBe(false);
    expect(isPaymentChannel("qris ")).toBe(false);
    expect(isPaymentChannel("<img src=x onerror=alert(1)>")).toBe(false);
    expect(isPaymentChannel("x".repeat(5000))).toBe(false);
  });
});
