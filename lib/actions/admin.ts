"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { dbMessage } from "@/lib/db-error";
import { TAG_PRODUCTS, productTag } from "@/lib/cache-tags";
import { logError } from "@/lib/log";

export type AdminResult = { error?: string; ok?: boolean };

async function requireAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  // profiles.role is no longer selectable over the API (it let any signed-in
  // user enumerate admins). is_admin() answers the same question without
  // exposing the column — it is SECURITY DEFINER and only reads the caller's
  // own row.
  const { data: admin } = await supabase.rpc("is_admin");
  if (admin !== true) redirect("/");
  return { supabase, user };
}

/** Approve (-> published) or reject (-> rejected) a product. */
export async function moderateProduct(id: string, action: "approve" | "reject"): Promise<AdminResult> {
  const { supabase } = await requireAdmin();
  const status = action === "approve" ? "published" : "rejected";
  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) return { error: dbMessage(error) };
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  updateTag(TAG_PRODUCTS);
  updateTag(productTag(id));
  return { ok: true };
}

/** Promote/demote a user's role. */
export async function setUserRole(id: string, role: "user" | "admin"): Promise<AdminResult> {
  const { supabase, user } = await requireAdmin();
  // The users table already hides this button on your own row, but a Server
  // Action is a public POST — and demoting yourself is unrecoverable from the
  // UI: `role` is not writable by a non-admin, so the last admin who does it
  // locks everyone out of /admin until someone edits the database by hand.
  if (id === user.id) return { error: "Kamu tidak bisa mengubah peran akunmu sendiri." };
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: dbMessage(error) };
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Refund a paid order (reverses the sellers' sales attribution). */
export async function refundOrder(id: string): Promise<AdminResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("refund_order", { p_order: id });
  if (error) {
    logError("refund_order RPC failed", error, { orderId: id });
    return { error: dbMessage(error) };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  return { ok: true };
}

/**
 * Approve or reject a seller's payout account.
 *
 * Sellers can only put an account into 'pending'; this is the only path to
 * 'verified', which is what request_payout() requires before money can leave
 * the platform. The RPC re-checks is_admin() server-side — the guard above is
 * for the UI, not the authorization.
 */
export async function setPayoutAccountStatus(
  ownerId: string,
  action: "approve" | "reject",
): Promise<AdminResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("set_payout_account_status", {
    p_owner: ownerId,
    p_status: action === "approve" ? "verified" : "none",
  });
  if (error) {
    logError("set_payout_account_status failed", error, { ownerId, action });
    return { error: dbMessage(error) };
  }
  revalidatePath("/admin/payouts");
  revalidatePath("/sell/payouts");
  return { ok: true };
}

/** Mark a payout as paid or rejected. */
export async function processPayout(id: string, action: "paid" | "rejected"): Promise<AdminResult> {
  const { supabase } = await requireAdmin();
  const patch =
    action === "paid"
      ? { status: "paid" as const, paid_at: new Date().toISOString() }
      : { status: "rejected" as const };
  // Only a payout still "processing" may be finalized — never re-open a terminal
  // (paid/rejected) payout, which would corrupt the seller's available balance.
  const { data, error } = await supabase
    .from("payouts")
    .update(patch)
    .eq("id", id)
    .eq("status", "processing")
    .select("id");
  if (error) return { error: dbMessage(error) };
  if (!data?.length) return { error: "Payout ini sudah diproses." };
  revalidatePath("/admin/payouts");
  return { ok: true };
}
