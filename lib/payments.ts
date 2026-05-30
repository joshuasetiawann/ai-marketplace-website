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
