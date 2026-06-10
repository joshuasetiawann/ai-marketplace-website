import "server-only";
import { createHash } from "crypto";
import type { PaymentGateway, PaymentInit, WebhookOutcome } from "./types";

// Midtrans (Snap) adapter. To go live: set MIDTRANS_SERVER_KEY (+ optionally
// MIDTRANS_IS_PRODUCTION=true), point the Midtrans dashboard's Payment
// Notification URL at POST /api/payments/webhook, and switch
// PAYMENT_PROVIDER=midtrans. The implementation below is the standard Snap flow.

const key = () => {
  const k = process.env.MIDTRANS_SERVER_KEY;
  if (!k) throw new Error("MIDTRANS_SERVER_KEY is not set");
  return k;
};

const snapBase = () =>
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

export const midtransGateway: PaymentGateway = {
  id: "midtrans",

  async start(init: PaymentInit) {
    const auth = Buffer.from(`${key()}:`).toString("base64");
    const res = await fetch(snapBase(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        transaction_details: { order_id: init.orderId, gross_amount: Math.round(init.amountIdr) },
        customer_details: { first_name: init.customer.name, email: init.customer.email },
      }),
    });
    if (!res.ok) throw new Error(`Midtrans Snap error ${res.status}`);
    const data = (await res.json()) as { redirect_url?: string };
    if (!data.redirect_url) throw new Error("Midtrans did not return a redirect_url");
    return { kind: "redirect", url: data.redirect_url };
  },

  async handleWebhook(req: Request): Promise<WebhookOutcome> {
    const body = (await req.json()) as {
      order_id?: string;
      status_code?: string;
      gross_amount?: string;
      signature_key?: string;
      transaction_status?: string;
      fraud_status?: string;
    };
    if (!body.order_id || !body.status_code || !body.gross_amount) return null;

    // Verify the notification is genuinely from Midtrans.
    const expected = createHash("sha512")
      .update(body.order_id + body.status_code + body.gross_amount + key())
      .digest("hex");
    if (body.signature_key !== expected) return null;

    const status = body.transaction_status;
    if ((status === "capture" && body.fraud_status !== "challenge") || status === "settlement") {
      return { orderId: body.order_id, status: "paid" };
    }
    if (status === "deny" || status === "cancel" || status === "expire") {
      return { orderId: body.order_id, status: "failed" };
    }
    return null; // pending/authorize/etc. — wait for a later notification
  },
};
