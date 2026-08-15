"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { dbMessage } from "@/lib/db-error";
import { hasRequiredAal, AAL_REQUIRED } from "@/lib/auth-guard";
import { logError } from "@/lib/log";

export type PayoutState = { error?: string; ok?: boolean };

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell/payouts");
  return { supabase, user };
}

/**
 * Money leaves the platform through these two actions and neither asks for a
 * password, so they are exactly what a password-only attacker would reach for.
 * The middleware's AAL2 rule only covers navigation — a Server Action POST goes
 * to whatever route it was imported into, so the check has to be here too.
 */
async function requireStepUp(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  return (await hasRequiredAal(supabase)) ? null : { error: AAL_REQUIRED };
}

/** Save / verify a payout bank account on the seller's store. */
export async function savePayoutAccount(_prev: PayoutState, formData: FormData): Promise<PayoutState> {
  const bank = String(formData.get("bank") || "").trim();
  const digits = String(formData.get("account") || "").replace(/\D/g, "");
  if (!bank) return { error: "Pilih bank." };
  if (digits.length < 6) return { error: "Nomor rekening tidak valid." };

  const { supabase, user } = await requireUser();
  const blocked = await requireStepUp(supabase);
  if (blocked) return blocked;

  const masked = "••••" + digits.slice(-4);
  // ponytail: "verified" here means "an account is on file", not "we checked it
  // belongs to this seller" — there is no penny-drop or name match. The UI no
  // longer claims otherwise. Upgrade path when real money moves: write
  // 'pending' instead and add an approval action to /admin/payouts, which
  // request_payout() already gates on (it requires payout_status = 'verified').
  const { error } = await supabase
    .from("stores")
    .update({ payout_bank: bank, payout_account_masked: masked, payout_status: "verified" })
    .eq("owner_id", user.id);
  if (error) {
    logError("savePayoutAccount failed", error, { userId: user.id });
    return { error: dbMessage(error) };
  }

  revalidatePath("/sell/payouts");
  return { ok: true };
}

/** Request a withdrawal from the available balance (validated server-side by RPC). */
export async function requestPayout(_prev: PayoutState, formData: FormData): Promise<PayoutState> {
  const amount = Number(formData.get("amount") || 0);
  if (Number.isNaN(amount) || amount <= 0) return { error: "Masukkan jumlah pencairan." };

  const { supabase } = await requireUser();
  const blocked = await requireStepUp(supabase);
  if (blocked) return blocked;

  const { error } = await supabase.rpc("request_payout", { p_amount_usd: amount });
  if (error) {
    logError("request_payout RPC failed", error);
    return { error: dbMessage(error) };
  }

  revalidatePath("/sell/payouts");
  revalidatePath("/sell/earnings");
  return { ok: true };
}
