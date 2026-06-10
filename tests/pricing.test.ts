import { describe, it, expect } from "vitest";
import { toIDR, formatIDR, formatIDRShort, USD_TO_IDR } from "@/lib/pricing";

describe("pricing", () => {
  it("converts USD to IDR at the fixed rate", () => {
    expect(toIDR(10)).toBe(10 * USD_TO_IDR);
    expect(toIDR(0)).toBe(0);
  });

  it("formats full IDR with id-ID thousand separators", () => {
    expect(formatIDR(158000)).toBe("Rp 158.000");
    expect(formatIDR(0)).toBe("Rp 0");
  });

  it("formats compact IDR — thousands", () => {
    expect(formatIDRShort(379000)).toBe("Rp 379rb");
    expect(formatIDRShort(15800)).toBe("Rp 16rb");
  });

  it("formats compact IDR — millions", () => {
    expect(formatIDRShort(2_000_000)).toBe("Rp 2jt");
    expect(formatIDRShort(1_400_000)).toBe("Rp 1,4jt");
  });

  it("formats compact IDR — under a thousand", () => {
    expect(formatIDRShort(999)).toBe("Rp 999");
  });
});
