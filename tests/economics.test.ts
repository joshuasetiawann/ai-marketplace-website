import { describe, it, expect } from "vitest";
import {
  feeOf,
  netOf,
  PLATFORM_FEE,
  SELLER_SHARE,
  MIN_PAYOUT_USD,
} from "@/lib/economics";

describe("economics", () => {
  it("fee is 20% of gross", () => expect(feeOf(100)).toBe(20));
  it("net is 80% of gross", () => expect(netOf(100)).toBe(80));
  it("fee + net reconstructs gross", () => expect(feeOf(49) + netOf(49)).toBe(49));
  it("rounds to 2 decimals", () => expect(netOf(9.99)).toBe(7.99));
  it("constants are correct", () => {
    expect(PLATFORM_FEE).toBe(0.2);
    expect(SELLER_SHARE).toBe(0.8);
    expect(MIN_PAYOUT_USD).toBe(50);
  });
});
