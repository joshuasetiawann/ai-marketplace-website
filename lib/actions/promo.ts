"use server";

import { createServerClient } from "@/lib/supabase/server";

export type PromoResult = { percent: number; error?: string };

/** Validate a promo code against a subtotal (server-authoritative). */
export async function checkPromo(code: string, subtotal: number): Promise<PromoResult> {
  const trimmed = code.trim();
  if (!trimmed) return { percent: 0, error: "Masukkan kode promo." };

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("validate_promo", {
    p_code: trimmed,
    p_subtotal: subtotal,
  });
  if (error) return { percent: 0, error: error.message };

  const percent = Number(data) || 0;
  if (percent <= 0) return { percent: 0, error: "Kode promo tidak valid untuk pesanan ini." };
  return { percent };
}
