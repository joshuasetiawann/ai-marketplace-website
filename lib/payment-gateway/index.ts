import { simulatedGateway } from "./simulated";
import { midtransGateway } from "./midtrans";
import { xenditGateway } from "./xendit";
import type { PaymentGateway } from "./types";

export type { PaymentGateway, PaymentInit, PaymentStart, WebhookOutcome } from "./types";

/** Resolve the active payment provider from PAYMENT_PROVIDER (default: simulated). */
export function getGateway(): PaymentGateway {
  switch ((process.env.PAYMENT_PROVIDER || "simulated").toLowerCase()) {
    case "midtrans":
      return midtransGateway;
    case "xendit":
      return xenditGateway;
    default:
      return simulatedGateway;
  }
}
