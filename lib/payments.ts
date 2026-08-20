// Indonesian payment-method metadata (display only; the gateway is simulated).
export const VA_BANKS = [
  { id: "bca", short: "BCA", color: "#0066b3" },
  { id: "mandiri", short: "Mandiri", color: "#003d79" },
  { id: "bni", short: "BNI", color: "#ee6f00" },
  { id: "bri", short: "BRI", color: "#00529c" },
  { id: "permata", short: "Permata", color: "#5a2d81" },
] as const;

export const EWALLETS = [
  { id: "gopay", name: "GoPay", color: "#00aa13" },
  { id: "ovo", name: "OVO", color: "#4c2a86" },
  { id: "dana", name: "DANA", color: "#118eea" },
  { id: "shopeepay", name: "ShopeePay", color: "#ee4d2d" },
  { id: "linkaja", name: "LinkAja", color: "#e62129" },
] as const;

export const PAYMENT_GROUPS = [
  { id: "qris", label: "QRIS", icon: "qr_code", desc: "Scan satu QR untuk semua e-wallet & m-banking" },
  { id: "va", label: "Virtual Account", icon: "account_balance", desc: "Transfer via ATM / m-banking" },
  { id: "ewallet", label: "E-Wallet", icon: "account_balance_wallet", desc: "GoPay, OVO, DANA, ShopeePay" },
] as const;

/**
 * Every channel the checkout form can submit — `qris`, or a group plus its
 * chosen provider (see CheckoutClient's `channel`). The picker is UI, and a
 * Server Action is a public POST endpoint: without this list `method` is an
 * unbounded attacker-controlled string written to orders.method and sales.method
 * (plain `text`, no constraint) and then rendered on the admin and seller
 * screens. Derived from the lists above so a new bank can't be forgotten here.
 */
export const PAYMENT_CHANNELS: readonly string[] = [
  "qris",
  ...VA_BANKS.map((b) => `va-${b.id}`),
  ...EWALLETS.map((w) => `ewallet-${w.id}`),
];

export function isPaymentChannel(value: string): boolean {
  return PAYMENT_CHANNELS.includes(value);
}
