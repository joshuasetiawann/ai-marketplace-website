"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { allow } from "@/lib/ratelimit";
import { logError } from "@/lib/log";
import { getGateway, type PaymentStart } from "@/lib/payment-gateway";
import { toIDR } from "@/lib/pricing";

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
  if (!(await allow("checkout", 15, 60_000)))
    return { error: "Terlalu banyak percobaan. Coba lagi sebentar." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const contact = { name: user.user_metadata?.name ?? "", email: user.email ?? "" };
  const gateway = getGateway();

  // Simulated provider: checkout() creates a PAID order instantly (Fase 1 UX).
  if (gateway.id === "simulated") {
    const { data: orderId, error } = await supabase.rpc("checkout", {
      p_contact: contact,
      p_method: method,
      p_promo: promo || null,
    });
    if (error) {
      logError("checkout RPC failed", error, { userId: user.id });
      return { error: error.message };
    }
    revalidatePath("/", "layout");
    redirect(`/orders/${orderId}`);
  }

  // Real provider: create a PENDING order, then hand off to the gateway. The
  // webhook (POST /api/payments/webhook) settles it via finalize_order().
  const { data: orderId, error } = await supabase.rpc("create_pending_order", {
    p_contact: contact,
    p_method: method,
    p_provider: gateway.id,
    p_promo: promo || null,
  });
  if (error || !orderId) {
    logError("create_pending_order failed", error, { userId: user.id });
    return { error: error?.message ?? "Gagal membuat pesanan." };
  }

  const { data: order } = await supabase.from("orders").select("total_usd").eq("id", orderId).single();
  const amountUsd = Number(order?.total_usd ?? 0);

  let start: PaymentStart;
  try {
    start = await gateway.start({
      orderId,
      amountUsd,
      amountIdr: toIDR(amountUsd),
      method,
      customer: contact,
    });
  } catch (e) {
    logError("payment gateway start failed", e, { orderId, provider: gateway.id });
    return { error: "Gagal memulai pembayaran. Coba lagi." };
  }

  revalidatePath("/", "layout");
  if (start.kind === "redirect") redirect(start.url);
  redirect(`/orders/${orderId}`); // pending — the webhook will settle it
}
