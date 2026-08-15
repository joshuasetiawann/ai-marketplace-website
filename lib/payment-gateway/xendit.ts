import "server-only";
import { timingSafeEqual } from "crypto";
import type { PaymentGateway, PaymentInit, WebhookOutcome } from "./types";

/** Constant-time token compare — `!==` leaks the shared secret byte by byte. */
function tokenMatches(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, which would itself be a signal.
  return a.length === b.length && timingSafeEqual(a, b);
}

// Xendit adapter (Invoice API). To go live: set XENDIT_SECRET_KEY +
// XENDIT_WEBHOOK_TOKEN, register the webhook URL (POST /api/payments/webhook)
// in the Xendit dashboard, and set PAYMENT_PROVIDER=xendit.

const secret = () => {
  const k = process.env.XENDIT_SECRET_KEY;
  if (!k) throw new Error("XENDIT_SECRET_KEY is not set");
  return k;
};

export const xenditGateway: PaymentGateway = {
  id: "xendit",

  async start(init: PaymentInit) {
    const auth = Buffer.from(`${secret()}:`).toString("base64");
    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        external_id: init.orderId,
        amount: Math.round(init.amountIdr),
        payer_email: init.customer.email,
        currency: "IDR",
      }),
    });
    if (!res.ok) throw new Error(`Xendit invoice error ${res.status}`);
    const data = (await res.json()) as { invoice_url?: string };
    if (!data.invoice_url) throw new Error("Xendit did not return an invoice_url");
    return { kind: "redirect", url: data.invoice_url };
  },

  async handleWebhook(req: Request): Promise<WebhookOutcome> {
    // Xendit authenticates callbacks with a static token header.
    if (!tokenMatches(req.headers.get("x-callback-token"), process.env.XENDIT_WEBHOOK_TOKEN))
      return null;
    const body = (await req.json()) as { external_id?: string; status?: string };
    if (!body.external_id) return null;
    if (body.status === "PAID" || body.status === "SETTLED") {
      return { orderId: body.external_id, status: "paid" };
    }
    if (body.status === "EXPIRED") {
      return { orderId: body.external_id, status: "failed" };
    }
    return null;
  },
};
