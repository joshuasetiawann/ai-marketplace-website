"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export type CheckoutState = { error?: string };

/**
 * Place an order (simulated payment). Calls the `checkout` RPC which atomically
 * creates a PAID order, records the seller sales split, and clears the cart.
 */
export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const method = String(formData.get("method") || "qris");
  const promo = String(formData.get("promo") || "").trim();
  const agree = formData.get("agree") === "on";
  if (!agree) return { error: "Setujui syarat & ketentuan dulu." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const contact = { name: user.user_metadata?.name ?? "", email: user.email ?? "" };
  const { data: orderId, error } = await supabase.rpc("checkout", {
    p_contact: contact,
    p_method: method,
    p_promo: promo || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(`/orders/${orderId}`);
}
