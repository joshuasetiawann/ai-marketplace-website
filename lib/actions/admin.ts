"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { TAG_PRODUCTS, productTag } from "@/lib/cache-tags";
import { logError } from "@/lib/log";

export type AdminResult = { error?: string; ok?: boolean };

async function requireAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");
  return { supabase, user };
}

/** Approve (-> published) or reject (-> rejected) a product. */
export async function moderateProduct(id: string, action: "approve" | "reject"): Promise<AdminResult> {
  const { supabase } = await requireAdmin();
  const status = action === "approve" ? "published" : "rejected";
  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  updateTag(TAG_PRODUCTS);
  updateTag(productTag(id));
  return { ok: true };
}

/** Promote/demote a user's role. */
export async function setUserRole(id: string, role: "user" | "admin"): Promise<AdminResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Refund a paid order (reverses the sellers' sales attribution). */
export async function refundOrder(id: string): Promise<AdminResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("refund_order", { p_order: id });
  if (error) {
    logError("refund_order RPC failed", error, { orderId: id });
    return { error: error.message };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
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
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Payout ini sudah diproses." };
  revalidatePath("/admin/payouts");
  return { ok: true };
}
