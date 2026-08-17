import { describe, it, expect } from "vitest";
import { secretEquals } from "@/lib/payment-gateway/verify";

// Both payment webhooks authenticate with a value derived from a secret, and a
// forged "paid" notification is free money. The comparison must accept only an
// exact match — and must not throw on the malformed input an attacker controls
// (a `timingSafeEqual` that throws on length mismatch takes the endpoint down
// as readily as it leaks).
describe("secretEquals", () => {
  it("accepts an exact match", () => {
    expect(secretEquals("abc123", "abc123")).toBe(true);
  });

  it("rejects a different value of the same length", () => {
    expect(secretEquals("abc123", "abc124")).toBe(false);
  });

  it("rejects a prefix and an extension instead of throwing", () => {
    expect(secretEquals("abc", "abc123")).toBe(false);
    expect(secretEquals("abc123456", "abc123")).toBe(false);
  });

  it("rejects missing values rather than treating them as equal", () => {
    expect(secretEquals(null, "abc")).toBe(false);
    expect(secretEquals("abc", undefined)).toBe(false);
    expect(secretEquals(null, null)).toBe(false);
    expect(secretEquals("", "")).toBe(false);
  });

  it("compares bytes, not unicode-normalized text", () => {
    expect(secretEquals("é", "é")).toBe(false);
  });
});
