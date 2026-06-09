import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort in-memory sliding-window rate limiter. This is a TEMPLATE DEFAULT,
 * not a security boundary:
 *   • It is per-instance (not shared across serverless/edge instances).
 *   • It keys on the client IP from x-forwarded-for, which is only trustworthy
 *     behind a proxy that sets it (Vercel does). Treat it as a courtesy limit
 *     and pair it with a real edge control (Vercel WAF / Upstash Redis) for
 *     abuse resistance.
 * Memory is bounded: expired buckets are swept and a hard key cap prevents
 * unbounded growth from many distinct IPs.
 */
const buckets = new Map<string, number[]>();
const MAX_KEYS = 10_000;

function sweep(now: number, windowMs: number) {
  for (const [k, arr] of buckets) {
    const live = arr.filter((t) => now - t < windowMs);
    if (live.length === 0) buckets.delete(k);
    else buckets.set(k, live);
  }
  // If a burst of unique keys still blows past the cap, evict only the OLDEST
  // (least-recently-active) buckets — never wipe all state, which would reset
  // every active limit at once and let a flooder clear their own counter.
  if (buckets.size > MAX_KEYS) {
    const byAge = [...buckets.entries()]
      .map(([k, arr]) => [k, arr[arr.length - 1] ?? 0] as const)
      .sort((a, b) => a[1] - b[1]);
    const dropCount = buckets.size - MAX_KEYS + Math.ceil(MAX_KEYS * 0.1);
    for (let i = 0; i < dropCount && i < byAge.length; i++) buckets.delete(byAge[i][0]);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > MAX_KEYS) sweep(now, windowMs);
  return true;
}

/**
 * Client IP from the proxy-set forwarded header, or null when it can't be
 * determined (e.g. local dev) — callers fail OPEN in that case so a single
 * shared "unknown" bucket can't lock out every anonymous request.
 */
export async function clientKey(namespace: string): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  return ip ? `${namespace}:${ip}` : null;
}

/** Allow `limit` requests per `windowMs` for this namespace + IP (fail-open if no IP). */
export async function allow(namespace: string, limit: number, windowMs: number): Promise<boolean> {
  const key = await clientKey(namespace);
  if (!key) return true; // no reliable identifier — defer to platform-level limits
  return rateLimit(key, limit, windowMs);
}
