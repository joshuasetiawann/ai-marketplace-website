import { NextResponse } from "next/server";
import { getGateway } from "@/lib/payment-gateway";
import { createAdminClient } from "@/lib/supabase/admin";
import { allow } from "@/lib/ratelimit";
import { logError } from "@/lib/log";

/**
 * Payment provider webhook. The active gateway verifies + parses the payload;
 * on a definitive outcome we settle (finalize_order) or fail (fail_order) the
 * order with the service-role client. Idempotent — providers retry.
 */
export async function POST(req: Request) {
  // The only unauthenticated endpoint that reaches the service-role client, so
  // it gets a ceiling even though signature verification already rejects forged
  // payloads — verification rejects content, not volume. Generous enough for a
  // provider's own retry storm.
  if (!(await allow("payment-webhook", 120, 60_000)))
    return NextResponse.json({ ok: false }, { status: 429 });

  const gateway = getGateway();
  try {
    const outcome = await gateway.handleWebhook(req);
    if (!outcome) return NextResponse.json({ ok: true, ignored: true });

    const admin = createAdminClient();
    const rpc = outcome.status === "paid" ? "finalize_order" : "fail_order";
    const { error } = await admin.rpc(rpc, { p_order: outcome.orderId });
    if (error) {
      logError("payment webhook rpc failed", error, { orderId: outcome.orderId, rpc });
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError("payment webhook error", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
