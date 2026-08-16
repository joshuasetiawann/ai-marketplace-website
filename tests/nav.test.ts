import { describe, it, expect } from "vitest";
import { safeNext, clampPage, hasMorePages, EXPLORE_MAX_PAGE } from "@/lib/nav";

// safeNext guards the post-login destination; clampPage/hasMorePages bound the
// public ?page= parameter. Both read attacker-controlled URL values, so their
// edges are worth pinning: an open redirect and a 1.2M-row scan respectively.

describe("safeNext", () => {
  it("keeps ordinary same-origin paths", () => {
    expect(safeNext("/orders")).toBe("/orders");
    expect(safeNext("/produk/abc?ref=1")).toBe("/produk/abc?ref=1");
  });

  it("rejects anything that could leave the origin", () => {
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
});

describe("clampPage", () => {
  it("passes real page numbers through", () => {
    expect(clampPage("1")).toBe(1);
    expect(clampPage("7")).toBe(7);
    expect(clampPage(String(EXPLORE_MAX_PAGE))).toBe(EXPLORE_MAX_PAGE);
  });

  it("caps the ceiling — the whole point of the fix", () => {
    expect(clampPage("100000")).toBe(EXPLORE_MAX_PAGE);
    expect(clampPage(Number.MAX_SAFE_INTEGER)).toBe(EXPLORE_MAX_PAGE);
  });

  it("floors junk, negatives and fractions to a usable page", () => {
    expect(clampPage("0")).toBe(1);
    expect(clampPage("-5")).toBe(1);
    expect(clampPage("abc")).toBe(1);
    expect(clampPage(undefined)).toBe(1);
    expect(clampPage("3.9")).toBe(3);
  });
});

describe("hasMorePages", () => {
  it("offers more while results remain", () => {
    expect(hasMorePages(12, 40, 1)).toBe(true);
  });

  it("stops when everything is loaded", () => {
    expect(hasMorePages(40, 40, 4)).toBe(false);
  });

  it("stops at the ceiling even with rows left, so the button is never dead", () => {
    expect(hasMorePages(600, 5000, EXPLORE_MAX_PAGE)).toBe(false);
  });
});
