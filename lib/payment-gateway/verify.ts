import "server-only";
import { timingSafeEqual } from "crypto";

/**
 * Constant-time compare for webhook credentials.
 *
 * Both providers authenticate their callbacks with a value derived from a
 * secret — Xendit a static token, Midtrans a SHA-512 signature. Hashing does
 * not remove the need for this: `!==` returns on the first differing byte, so
 * an attacker who replays the same notification and times the response can
 * recover the expected digest byte by byte, then post a forged "paid" for that
 * order. The comparison has to take the same time either way.
 */
export function secretEquals(received: string | null | undefined, expected: string | null | undefined): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, which would itself be a signal.
  return a.length === b.length && timingSafeEqual(a, b);
}
