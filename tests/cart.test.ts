import { describe, it, expect } from "vitest";
import { clampQty, MAX_QTY } from "@/lib/cart";

// clampQty is the app-side half of the cart quantity bound (the DB CHECK
// constraint cart_items_qty_max is the other half). It sits on a money path:
// an unbounded qty overflows orders.total_usd and breaks checkout.
describe("clampQty", () => {
  it("passes ordinary quantities through", () => {
    expect(clampQty(1)).toBe(1);
    expect(clampQty(7)).toBe(7);
    expect(clampQty(MAX_QTY)).toBe(MAX_QTY);
  });

  it("caps anything above the ceiling", () => {
    expect(clampQty(MAX_QTY + 1)).toBe(MAX_QTY);
    expect(clampQty(1e9)).toBe(MAX_QTY);
    expect(clampQty(Number.MAX_SAFE_INTEGER)).toBe(MAX_QTY);
  });

  it("floors negatives and zero to 0, which callers treat as 'remove'", () => {
    expect(clampQty(0)).toBe(0);
    expect(clampQty(-1)).toBe(0);
    expect(clampQty(-1e9)).toBe(0);
  });

  it("truncates fractions instead of letting them reach the int column", () => {
    expect(clampQty(2.9)).toBe(2);
    expect(clampQty(0.5)).toBe(0);
  });

  it("treats junk as 0 rather than writing NaN", () => {
    expect(clampQty(NaN)).toBe(0);
    expect(clampQty(Infinity)).toBe(MAX_QTY);
    expect(clampQty(-Infinity)).toBe(0);
    expect(clampQty("12" as unknown as number)).toBe(12);
    expect(clampQty("abc" as unknown as number)).toBe(0);
  });
});
