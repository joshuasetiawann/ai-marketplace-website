import { describe, it, expect } from "vitest";
import { clampQty, MAX_QTY, partitionCartRows } from "@/lib/cart";

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

// A cart row outlives its product's visibility: products_read only exposes
// 'published' to a buyer, so an ordinary seller edit turns the embedded join
// null. Dropping those rows silently made the navbar badge and checkout()
// disagree with the cart page — checkout refused an item nothing could delete.
const product = (id: string) => ({
  id,
  name: "Model " + id,
  tagline: null,
  price_usd: "10.00",
  art: null,
  icon: null,
  category: null,
});

describe("partitionCartRows", () => {
  it("maps readable rows into lines", () => {
    const { lines, unavailable } = partitionCartRows([
      { product_id: "a", qty: 2, products: product("a") },
    ]);
    expect(unavailable).toEqual([]);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ id: "a", price: 10, qty: 2 });
  });

  it("reports a withdrawn product instead of dropping the row", () => {
    const { lines, unavailable } = partitionCartRows([
      { product_id: "a", qty: 1, products: product("a") },
      { product_id: "gone", qty: 3, products: null },
    ]);
    expect(lines.map((l) => l.id)).toEqual(["a"]);
    expect(unavailable).toEqual(["gone"]);
  });

  it("handles the array shape PostgREST uses for the same embed", () => {
    const { lines, unavailable } = partitionCartRows([
      { product_id: "a", qty: 1, products: [product("a")] },
      { product_id: "gone", qty: 1, products: [] },
    ]);
    expect(lines.map((l) => l.id)).toEqual(["a"]);
    expect(unavailable).toEqual(["gone"]);
  });

  it("falls back to sane display values for null columns", () => {
    const { lines } = partitionCartRows([{ product_id: "a", qty: null, products: product("a") }]);
    expect(lines[0].qty).toBe(1);
    expect(lines[0].tagline).toBe("");
    expect(lines[0].art).toHaveLength(2);
    expect(lines[0].icon).toBe("apps");
  });
});
