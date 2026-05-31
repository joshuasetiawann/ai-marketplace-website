"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export type PayoutState = { error?: string; ok?: boolean };

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell/payouts");
  return { supabase, user };
}

/** Save / verify a payout bank account on the seller's store. */
export async function savePayoutAccount(_prev: PayoutState, formData: FormData): Promise<PayoutState> {
  const bank = String(formData.get("bank") || "").trim();
  const digits = String(formData.get("account") || "").replace(/\D/g, "");
  if (!bank) return { error: "Pilih bank." };
  if (digits.length < 6) return { error: "Nomor rekening tidak valid." };

  const { supabase, user } = await requireUser();
  const masked = "••••" + digits.slice(-4);
  const { error } = await supabase
    .from("stores")
    .update({ payout_bank: bank, payout_account_masked: masked, payout_status: "verified" })
    .eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/sell/payouts");
  return { ok: true };
}

/** Request a withdrawal from the available balance (validated server-side by RPC). */
export async function requestPayout(_prev: PayoutState, formData: FormData): Promise<PayoutState> {
  const amount = Number(formData.get("amount") || 0);
  if (Number.isNaN(amount) || amount <= 0) return { error: "Masukkan jumlah pencairan." };

  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("request_payout", { p_amount_usd: amount });
  if (error) return { error: error.message };

  revalidatePath("/sell/payouts");
  revalidatePath("/sell/earnings");
  return { ok: true };
}
