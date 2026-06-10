// Client-side validation + simulated security primitives (OTP, email checks).
// In production these checks must be mirrored/enforced on the server.

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

// Returns { score 0..4, label, checks: [{label, ok}] }
export function passwordStrength(pw = '') {
  const checks = [
    { label: 'Minimal 8 karakter', ok: pw.length >= 8 },
    { label: 'Huruf besar & kecil', ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: 'Mengandung angka', ok: /\d/.test(pw) },
    { label: 'Karakter spesial (!@#$…)', ok: /[^A-Za-z0-9]/.test(pw) },
  ]
  const score = checks.filter((c) => c.ok).length
  const label = ['Terlalu lemah', 'Lemah', 'Cukup', 'Bagus', 'Kuat'][score]
  return { score, label, checks, ok: score >= 3 }
}

// Deterministic-but-throwaway 6-digit OTP for the demo. The code is surfaced in
// the UI (and via toast) because there is no real email/SMS provider here.
export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function maskEmail(email = '') {
  const [name, domain] = String(email).split('@')
  if (!domain) return email
  const shown = name.slice(0, Math.min(2, name.length))
  return `${shown}${'•'.repeat(Math.max(2, name.length - 2))}@${domain}`
}
