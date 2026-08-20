"use server";

import { createServerClient } from "@/lib/supabase/server";
import { dbMessage } from "@/lib/db-error";
import { allow } from "@/lib/ratelimit";
import { LIMITS } from "@/lib/form";

export type PromoResult = { percent: number; error?: string };

/**
 * Validate a promo code against a subtotal (server-authoritative).
 *
 * Rate-limited because this is a public POST endpoint that answers "is this code
 * real?" — the codes are short words, so without a ceiling it is a free
 * dictionary oracle for other people's discounts. The charged discount is still
 * recomputed inside checkout() from the real cart, so this only ever affects
 * what the cart displays.
 */
export async function checkPromo(code: string, subtotal: number): Promise<PromoResult> {
  const trimmed = String(code || "").trim().slice(0, LIMITS.short);
  if (!trimmed) return { percent: 0, error: "Masukkan kode promo." };
  if (!(await allow("promo", 20, 60_000)))
    return { percent: 0, error: "Terlalu banyak percobaan kode. Coba lagi sebentar." };

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("validate_promo", {
    p_code: trimmed,
    p_subtotal: subtotal,
  });
  if (error) return { percent: 0, error: dbMessage(error) };

  const percent = Number(data) || 0;
  if (percent <= 0) return { percent: 0, error: "Kode promo tidak valid untuk pesanan ini." };
  return { percent };
}
