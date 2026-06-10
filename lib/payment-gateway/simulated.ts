import type { PaymentGateway } from "./types";

/**
 * Default provider: settles instantly (no real money). The checkout() RPC has
 * already created a PAID order, so start() just reports "settled" and there is
 * no webhook. Swap PAYMENT_PROVIDER=midtrans|xendit to go live.
 */
export const simulatedGateway: PaymentGateway = {
  id: "simulated",
  async start() {
    return { kind: "settled" };
  },
  async handleWebhook() {
    return null;
  },
};
