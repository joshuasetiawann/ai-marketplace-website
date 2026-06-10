/** Contract every payment provider implements. Swap providers via PAYMENT_PROVIDER. */
export type PaymentInit = {
  orderId: string;
  amountUsd: number;
  amountIdr: number;
  method: string;
  customer: { name: string; email: string };
};

export type PaymentStart =
  | { kind: "settled" } //   paid synchronously (simulated) — order already finalized
  | { kind: "redirect"; url: string } // send the buyer to the provider's payment page
  | { kind: "pending" }; //  awaiting an async webhook callback

export type WebhookOutcome = { orderId: string; status: "paid" | "failed" } | null;

export interface PaymentGateway {
  readonly id: string;
  /** Begin payment for an already-created order. */
  start(init: PaymentInit): Promise<PaymentStart>;
  /** Parse + verify an inbound webhook; return the order transition, or null to ignore. */
  handleWebhook(req: Request): Promise<WebhookOutcome>;
}
