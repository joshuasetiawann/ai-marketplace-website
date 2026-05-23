// Indonesian payment method metadata + a localStorage-backed "pending payment"
// record (stands in for a payment gateway like Midtrans/Xendit).

export const VA_BANKS = [
  { id: 'bca', name: 'BCA Virtual Account', short: 'BCA', color: '#0066b3', prefix: '12345' },
  { id: 'mandiri', name: 'Mandiri Virtual Account', short: 'Mandiri', color: '#003d79', prefix: '88810' },
  { id: 'bni', name: 'BNI Virtual Account', short: 'BNI', color: '#ee6f00', prefix: '98810' },
  { id: 'bri', name: 'BRI Virtual Account', short: 'BRI', color: '#00529c', prefix: '26215' },
  { id: 'permata', name: 'Permata Virtual Account', short: 'Permata', color: '#5a2d81', prefix: '77160' },
]

export const EWALLETS = [
  { id: 'gopay', name: 'GoPay', color: '#00aa13' },
  { id: 'ovo', name: 'OVO', color: '#4c2a86' },
  { id: 'dana', name: 'DANA', color: '#118eea' },
  { id: 'shopeepay', name: 'ShopeePay', color: '#ee4d2d' },
  { id: 'linkaja', name: 'LinkAja', color: '#e62129' },
]

export const PAYMENT_GROUPS = [
  { id: 'qris', label: 'QRIS', icon: 'qr_code', desc: 'Scan satu QR untuk semua e-wallet & m-banking' },
  { id: 'va', label: 'Virtual Account', icon: 'account_balance', desc: 'Transfer via ATM / m-banking' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'account_balance_wallet', desc: 'GoPay, OVO, DANA, ShopeePay' },
]

// Convert USD demo prices to a believable IDR amount.
export const USD_TO_IDR = 15800
export function toIDR(usd) {
  return Math.round(usd * USD_TO_IDR)
}
export function formatIDR(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

// Compact Rupiah for tight spots like product cards (e.g. "Rp 379rb", "Rp 1,4jt").
export function formatIDRShort(n) {
  n = Math.round(n)
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return 'Rp ' + (Number.isInteger(v) ? v : v.toFixed(1)).toString().replace('.', ',') + 'jt'
  }
  if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + 'rb'
  return 'Rp ' + n
}

export function makeVaNumber(prefix) {
  let n = ''
  for (let i = 0; i < 11; i++) n += Math.floor(Math.random() * 10)
  return prefix + n
}

const KEY = (uid) => `nexora.pendingpay.${uid || 'guest'}`

export function getPending(uid) {
  try {
    const raw = localStorage.getItem(KEY(uid))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
export function setPending(uid, payment) {
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(payment))
  } catch {
    /* ignore */
  }
}
export function clearPending(uid) {
  localStorage.removeItem(KEY(uid))
}

// QRIS validity 15 min; VA validity 24h.
export function expiryFor(method) {
  const now = Date.now()
  return method === 'qris' ? now + 15 * 60 * 1000 : now + 24 * 60 * 60 * 1000
}

// Deterministic pseudo-QR matrix (looks like a real QR, encodes nothing real).
export function qrMatrix(seed = 'nexora', size = 29) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const rnd = () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const m = Array.from({ length: size }, () => Array(size).fill(false))
  const isFinderZone = (r, c) => {
    const inBox = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7
    return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0)
  }
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (isFinderZone(r, c)) continue
      m[r][c] = rnd() > 0.5
    }
  // draw 7x7 finder patterns
  const finder = (br, bc) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
        m[br + r][bc + c] = edge || core
      }
  }
  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)
  return m
}
