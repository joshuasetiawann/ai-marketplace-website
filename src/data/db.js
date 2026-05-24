// ─────────────────────────────────────────────────────────────────────────────
// Simulated backend ("mock API") backed by localStorage.
//
// This module is the single source of truth for users, sessions, per-user data
// (cart / wishlist / orders / recently-viewed / preferences) and the product
// catalog with review status. It is intentionally shaped like a real REST API
// so it can be swapped for a server later (each exported function ≈ one endpoint).
//
// ⚠️  SECURITY NOTE: passwords are stored in plaintext here ONLY because this is a
//     front-end prototype with no server. In production, authentication, hashing
//     (bcrypt/argon2), email verification and payments MUST happen server-side.
// ─────────────────────────────────────────────────────────────────────────────
import { MODELS } from './models.js'

const KEYS = {
  users: 'nexora.users.v2',
  session: 'nexora.session.v2',
  sessionsByUser: 'nexora.sessions.v2',
  products: 'nexora.products.v2',
  sales: 'nexora.sales.v2',
  payouts: 'nexora.payouts.v2',
  userData: (id) => `nexora.userdata.v2.${id}`,
}

// Marketplace economics. The platform keeps a fee; sellers net the remainder —
// this matches the "80% revenue share" promised in the Help/About copy.
export const PLATFORM_FEE = 0.2
export const SELLER_SHARE = 1 - PLATFORM_FEE
export const MIN_PAYOUT_USD = 50 // ≈ Rp 790.000 minimum withdrawal

// Which real seller/developer account "owns" each base-catalog creator. Lets a
// purchase of a curated model flow through to a real seller's earnings ledger.
const STORE_OWNER = { 'synthetix-labs': 'u_seller', 'aura-labs': 'u_dev' }
const MODEL_OWNER = Object.fromEntries(MODELS.map((m) => [m.id, STORE_OWNER[m.creatorId] || null]))

export const ROLES = {
  buyer: { id: 'buyer', label: 'Buyer', icon: 'shopping_cart', home: '/dashboard', desc: 'Discover & buy premium AI models', accent: '#00e5ff' },
  seller: { id: 'seller', label: 'Seller', icon: 'storefront', home: '/seller', desc: 'Sell models & manage your store', accent: '#e9c349' },
  developer: { id: 'developer', label: 'Developer', icon: 'code', home: '/developer', desc: 'Ship models with APIs, docs & versions', accent: '#a855f7' },
  admin: { id: 'admin', label: 'Admin', icon: 'shield_person', home: '/admin', desc: 'Platform moderation & oversight', accent: '#7ee0a8' },
}

export const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes inactivity → expired

// ── low-level storage helpers ────────────────────────────────────────────────
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota */
  }
}
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

const EMPTY_USERDATA = { cart: [], wishlist: [], orders: [], recentlyViewed: [], prefs: { interests: [] } }

// ── seed demo accounts so role switching is demonstrable ─────────────────────
const DEMO_USERS = [
  { id: 'u_buyer', name: 'Alex Morgan', email: 'buyer@nexora.ai', password: 'Demo1234!', role: 'buyer', verified: true, twoFactor: false, art: ['#0b3a44', '#00e5ff'] },
  { id: 'u_seller', name: 'Synthetix Labs', email: 'seller@nexora.ai', password: 'Demo1234!', role: 'seller', verified: true, twoFactor: true, art: ['#2a1f05', '#e9c349'],
    store: { name: 'Synthetix Labs', handle: 'synthetix', tagline: 'Elite generative architecture', payout: { bank: 'BCA', account: '••••4821', status: 'verified' } } },
  { id: 'u_dev', name: 'Maya Dev', email: 'dev@nexora.ai', password: 'Demo1234!', role: 'developer', verified: true, twoFactor: false, art: ['#231038', '#a855f7'],
    store: { name: 'Maya Labs', handle: 'mayalabs', tagline: 'Developer-first AI infrastructure' } },
  { id: 'u_admin', name: 'Nexora Admin', email: 'admin@nexora.ai', password: 'Demo1234!', role: 'admin', verified: true, twoFactor: true, art: ['#072a1f', '#7ee0a8'] },
]

export function ensureSeed() {
  const users = read(KEYS.users, null)
  if (!users) {
    const map = {}
    DEMO_USERS.forEach((u) => {
      map[u.id] = { ...u, createdAt: Date.now() }
      // give the demo buyer some starter data so the dashboard is alive
      if (u.id === 'u_buyer') {
        write(KEYS.userData(u.id), {
          ...EMPTY_USERDATA,
          wishlist: ['aura-synth', 'lumen-portrait'],
          recentlyViewed: ['nexus-vision-pro', 'codeweaver-x', 'chroma-studio-fx'],
          orders: [
            { id: 'NX-7F3A21', date: Date.now() - 86400000 * 6, status: 'paid', method: 'QRIS', total: 63,
              items: [{ id: 'nexus-vision-pro', name: 'Nexus Vision Pro', price: 24, qty: 1, art: ['#0b3a44', '#00e5ff'], icon: 'visibility' },
                      { id: 'codeweaver-x', name: 'CodeWeaver X', price: 39, qty: 1, art: ['#10233a', '#3b82f6'], icon: 'code' }] },
          ],
          prefs: { interests: ['vision', 'code'] },
        })
      }
    })
    write(KEYS.users, map)
  }
  // seed the demo seller's real listings (one live, one in review)
  if (!read(KEYS.products, null)) {
    write(KEYS.products, [
      {
        id: 'aurora-diffusion-xl', name: 'Aurora Diffusion XL', tagline: 'Model difusi gambar sinematik hingga 8K',
        category: 'vision', useCases: ['creative', 'business'], useCaseTags: ['Concept Art', 'Editorial', 'Product Shots'],
        tier: 'Pro', price: 32, rating: 4.7, reviews: 64, ownerId: 'u_seller', ownerName: 'Synthetix Labs', creatorId: 'synthetix-labs',
        icon: 'auto_awesome', art: ['#1a0b2e', '#c084fc'],
        description: 'Aurora Diffusion XL menghasilkan visual sinematik beresolusi tinggi dari prompt teks, dengan kontrol gaya dan komposisi tingkat studio.',
        capabilities: [], specs: { Parameters: '8B', Latency: '~700ms', Updated: '2026' }, gallery: 3,
        status: 'published', createdAt: Date.now() - 86400000 * 20,
      },
      {
        id: 'pixelcraft-lite', name: 'PixelCraft Lite', tagline: 'Generator ikon & aset UI ringan',
        category: 'vision', useCases: ['creative', 'developer'], useCaseTags: ['Icons', 'UI Assets'],
        tier: 'Free', price: 0, rating: 0, reviews: 0, ownerId: 'u_seller', ownerName: 'Synthetix Labs', creatorId: 'synthetix-labs',
        icon: 'grid_view', art: ['#0b3a44', '#22d3ee'],
        description: 'Aset UI dan ikon vektor instan untuk prototyping cepat.',
        capabilities: [], specs: {}, gallery: 3, status: 'under_review', createdAt: Date.now() - 86400000 * 2,
      },
    ])
  }

  // seed a believable sales ledger + one completed payout for the demo seller
  if (!read(KEYS.sales, null)) {
    const r2 = (n) => Math.round(n * 100) / 100
    const sellerModels = [
      { id: 'nexus-vision-pro', name: 'Nexus Vision Pro', price: 24 },
      { id: 'codeweaver-x', name: 'CodeWeaver X', price: 39 },
      { id: 'forge-3d', name: 'Forge 3D', price: 35 },
      { id: 'chroma-studio-fx', name: 'Chroma Studio FX', price: 49 },
      { id: 'aurora-diffusion-xl', name: 'Aurora Diffusion XL', price: 32 },
    ]
    const BUYERS = ['A. Wijaya', 'R. Pratama', 'S. Lestari', 'B. Santoso', 'D. Putri', 'M. Hakim', 'N. Sari', 'F. Ramadhan']
    const sales = []
    const now = Date.now()
    sellerModels.forEach((m, mi) => {
      const count = 6 + ((mi * 5 + 3) % 7) // deterministic 6..12
      for (let i = 0; i < count; i++) {
        const daysAgo = (i * 3 + mi) % 30
        sales.push({
          id: uid('sale'), orderId: `NX-S${mi}${i}`, productId: m.id, productName: m.name, sellerId: 'u_seller',
          buyerName: BUYERS[(mi + i) % BUYERS.length], buyerId: null, qty: 1,
          gross: m.price, fee: r2(m.price * PLATFORM_FEE), net: r2(m.price * SELLER_SHARE),
          status: 'paid', method: 'QRIS', date: now - daysAgo * 86400000,
        })
      }
    })
    write(KEYS.sales, sales)
  }
  if (!read(KEYS.payouts, null)) {
    write(KEYS.payouts, [
      { id: 'PO-3K91A2', sellerId: 'u_seller', amountUSD: 500, amountIDR: 7900000, bank: 'BCA', account: '••••4821', status: 'paid', requestedAt: Date.now() - 86400000 * 9, paidAt: Date.now() - 86400000 * 8 },
    ])
  }
}

// ── users ────────────────────────────────────────────────────────────────────
export function getUsers() {
  ensureSeed()
  return read(KEYS.users, {})
}
export function getUser(id) {
  return getUsers()[id] || null
}
export function getUserByEmail(email) {
  const users = getUsers()
  return Object.values(users).find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null
}
export function saveUser(user) {
  const users = getUsers()
  users[user.id] = user
  write(KEYS.users, users)
  return user
}

export function registerUser({ name, email, password, role = 'buyer' }) {
  if (getUserByEmail(email)) return { error: 'Email sudah terdaftar. Coba masuk.' }
  const user = {
    id: uid('u'),
    name,
    email,
    password,
    role,
    verified: false, // requires email verification
    twoFactor: false,
    art: ['#0b3a44', '#00e5ff'],
    createdAt: Date.now(),
    ...(role === 'seller' || role === 'developer'
      ? { store: { name: `${name}'s Studio`, handle: name.toLowerCase().replace(/\s+/g, ''), tagline: '' } }
      : {}),
  }
  saveUser(user)
  write(KEYS.userData(user.id), { ...EMPTY_USERDATA })
  return { user }
}

export function authenticate(email, password) {
  const user = getUserByEmail(email)
  if (!user) return { error: 'Akun tidak ditemukan.' }
  if (user.password !== password) return { error: 'Email atau password salah.' }
  return { user }
}

// ── sessions ──────────────────────────────────────────────────────────────────
export function getSession() {
  const s = read(KEYS.session, null)
  if (!s) return null
  if (Date.now() > s.expiresAt) return { ...s, expired: true }
  return s
}
export function startSession(userId, role) {
  const now = Date.now()
  const deviceId = uid('dev')
  const session = { userId, role, deviceId, startedAt: now, expiresAt: now + SESSION_TTL_MS, lastActive: now }
  write(KEYS.session, session)
  // register device under user
  const all = read(KEYS.sessionsByUser, {})
  const list = all[userId] || []
  list.unshift({ deviceId, ua: navigatorUA(), createdAt: now, lastActive: now, current: true })
  all[userId] = dedupeDevices(list).slice(0, 6)
  write(KEYS.sessionsByUser, all)
  return session
}
export function touchSession() {
  const s = read(KEYS.session, null)
  if (!s) return null
  const now = Date.now()
  if (now > s.expiresAt) return { ...s, expired: true }
  const next = { ...s, lastActive: now, expiresAt: now + SESSION_TTL_MS }
  write(KEYS.session, next)
  return next
}
export function endSession() {
  localStorage.removeItem(KEYS.session)
}
export function getDevices(userId) {
  const all = read(KEYS.sessionsByUser, {})
  return all[userId] || []
}
export function revokeDevice(userId, deviceId) {
  const all = read(KEYS.sessionsByUser, {})
  all[userId] = (all[userId] || []).filter((d) => d.deviceId !== deviceId)
  write(KEYS.sessionsByUser, all)
}
function navigatorUA() {
  if (typeof navigator === 'undefined') return 'Unknown device'
  const ua = navigator.userAgent || ''
  const os = /Mac/.test(ua) ? 'macOS' : /Win/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : 'Linux'
  const br = /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Browser'
  return `${br} · ${os}`
}
function dedupeDevices(list) {
  const seen = new Set()
  return list.filter((d) => (seen.has(d.ua) ? false : (seen.add(d.ua), true)))
}

// ── per-user data ─────────────────────────────────────────────────────────────
export function getUserData(userId) {
  if (!userId) return { ...EMPTY_USERDATA }
  return { ...EMPTY_USERDATA, ...read(KEYS.userData(userId), {}) }
}
export function saveUserData(userId, data) {
  if (!userId) return
  write(KEYS.userData(userId), data)
}

// ── products / catalog ────────────────────────────────────────────────────────
export function getUploadedProducts() {
  return read(KEYS.products, [])
}
export function saveUploadedProducts(list) {
  write(KEYS.products, list)
}
export function addProduct(product) {
  const list = getUploadedProducts()
  const record = { ...product, id: product.id || uid('m'), status: product.status || 'under_review', createdAt: Date.now() }
  list.unshift(record)
  saveUploadedProducts(list)
  return record
}
// Owner-guarded mutations — a seller can only ever touch their own listings.
export function updateProduct(id, patch, ownerId) {
  const list = getUploadedProducts()
  const idx = list.findIndex((p) => p.id === id)
  if (idx < 0) return { error: 'Produk tidak ditemukan' }
  if (ownerId && list[idx].ownerId !== ownerId) return { error: 'Bukan produk kamu' }
  list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() }
  saveUploadedProducts(list)
  return { product: list[idx] }
}
export function deleteProduct(id, ownerId) {
  const list = getUploadedProducts()
  const target = list.find((p) => p.id === id)
  if (!target) return { error: 'Produk tidak ditemukan' }
  if (ownerId && target.ownerId !== ownerId) return { error: 'Bukan produk kamu' }
  saveUploadedProducts(list.filter((p) => p.id !== id))
  return { ok: true }
}
export function getCatalog() {
  // published catalog = base models + approved user uploads
  const uploaded = getUploadedProducts().filter((p) => p.status === 'published')
  return [...MODELS, ...uploaded]
}
export function getProductsByOwner(userId) {
  return getUploadedProducts().filter((p) => p.ownerId === userId)
}
export function ownerOfProduct(productId) {
  const uploaded = getUploadedProducts().find((p) => p.id === productId)
  if (uploaded) return uploaded.ownerId || null
  return MODEL_OWNER[productId] || null
}

// All listings a seller manages: their own uploads (editable) + the curated
// base-catalog models attributed to their store (read-only "catalog" items).
export function getSellerListings(sellerId) {
  if (!sellerId) return []
  const sales = getSales()
  const soldQty = (pid) => sales.filter((s) => s.productId === pid && s.status === 'paid').reduce((n, s) => n + s.qty, 0)
  const own = getProductsByOwner(sellerId).map((p) => ({
    id: p.id, name: p.name, category: p.category, status: p.status, price: p.price,
    art: p.art, icon: p.icon, tier: p.tier, sales: soldQty(p.id), editable: true, kind: 'upload',
  }))
  const curated = MODELS.filter((m) => MODEL_OWNER[m.id] === sellerId).map((m) => ({
    id: m.id, name: m.name, category: m.category, status: 'published', price: m.price,
    art: m.art, icon: m.icon, tier: m.tier, sales: soldQty(m.id), editable: false, kind: 'catalog',
  }))
  return [...own, ...curated]
}

// ── sales ledger (the marketplace's revenue source of truth) ──────────────────
export function getSales() {
  return read(KEYS.sales, [])
}
export function getSalesBySeller(sellerId) {
  return getSales().filter((s) => s.sellerId === sellerId)
}
// Split a paid order into per-item sale records attributed to each product owner.
export function recordSale(order, buyer = {}) {
  if (!order?.items?.length) return []
  const sales = getSales()
  const created = []
  order.items.forEach((it) => {
    const sellerId = ownerOfProduct(it.id)
    if (!sellerId) return // house / unattributed product — no seller payout
    const gross = (it.price || 0) * (it.qty || 1)
    const fee = Math.round(gross * PLATFORM_FEE * 100) / 100
    const rec = {
      id: uid('sale'), orderId: order.id, productId: it.id, productName: it.name,
      sellerId, buyerName: buyer.name || order.contact?.name || 'Pelanggan', buyerId: buyer.id || null,
      qty: it.qty || 1, gross, fee, net: Math.round((gross - fee) * 100) / 100,
      status: 'paid', method: order.method || null, date: order.date || Date.now(),
    }
    sales.unshift(rec)
    created.push(rec)
  })
  if (created.length) write(KEYS.sales, sales)
  return created
}

// Aggregate a seller's economy: gross/net, fees, what's been withdrawn, and the
// balance that's actually available to cash out right now.
export function sellerEarnings(sellerId) {
  const sales = getSalesBySeller(sellerId).filter((s) => s.status === 'paid')
  const gross = sales.reduce((n, s) => n + s.gross, 0)
  const fees = sales.reduce((n, s) => n + s.fee, 0)
  const net = sales.reduce((n, s) => n + s.net, 0)
  const payouts = getPayouts(sellerId)
  const withdrawn = payouts.filter((p) => p.status !== 'rejected').reduce((n, p) => n + p.amountUSD, 0)
  const customers = new Set(sales.map((s) => s.buyerName)).size
  const unitsSold = sales.reduce((n, s) => n + s.qty, 0)
  return {
    gross, fees, net, withdrawn,
    available: Math.max(0, Math.round((net - withdrawn) * 100) / 100),
    customers, unitsSold, salesCount: sales.length,
  }
}

// ── payouts (withdrawals to a verified bank account) ──────────────────────────
export function getPayouts(sellerId) {
  const all = read(KEYS.payouts, [])
  return sellerId ? all.filter((p) => p.sellerId === sellerId) : all
}
export function savePayoutAccount(userId, { bank, account }) {
  const user = getUser(userId)
  if (!user) return { error: 'User tidak ditemukan' }
  const masked = '••••' + String(account).replace(/\D/g, '').slice(-4)
  const next = saveUser({ ...user, store: { ...(user.store || {}), payout: { bank, account: masked, status: 'verified' } } })
  return { user: next }
}
export function requestPayout(sellerId, amountUSD, amountIDR) {
  const user = getUser(sellerId)
  const payout = user?.store?.payout
  if (!payout || payout.status !== 'verified') return { error: 'Tambahkan rekening payout terverifikasi dulu.' }
  const { available } = sellerEarnings(sellerId)
  if (amountUSD < MIN_PAYOUT_USD) return { error: `Minimal pencairan ${Math.round(MIN_PAYOUT_USD)} USD.` }
  if (amountUSD > available + 0.001) return { error: 'Saldo tidak mencukupi.' }
  const all = read(KEYS.payouts, [])
  const rec = {
    id: 'PO-' + uid('').slice(0, 6).toUpperCase(), sellerId,
    amountUSD: Math.round(amountUSD * 100) / 100, amountIDR,
    bank: payout.bank, account: payout.account, status: 'processing', requestedAt: Date.now(),
  }
  all.unshift(rec)
  write(KEYS.payouts, all)
  return { payout: rec }
}

// reset helper (used by "switch demo account" UX)
export function wipeAll() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('nexora.'))
    .forEach((k) => localStorage.removeItem(k))
}

export const DEMO_CREDENTIALS = DEMO_USERS.map(({ email, role, name }) => ({ email, role, name, password: 'Demo1234!' }))
