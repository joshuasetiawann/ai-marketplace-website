import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort in-memory sliding-window rate limiter. This is per-instance and
 * NOT distributed — good enough as a template default and to blunt casual abuse.
 * For production at scale, back this with Upstash Redis / Vercel KV.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Build a rate-limit key from the caller's IP (best-effort) + a namespace. */
export async function clientKey(namespace: string): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${namespace}:${ip}`;
}

/** Convenience: allow `limit` requests per `windowMs` for this namespace + IP. */
export async function allow(namespace: string, limit: number, windowMs: number): Promise<boolean> {
  return rateLimit(await clientKey(namespace), limit, windowMs);
}
