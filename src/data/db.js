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
  userData: (id) => `nexora.userdata.v2.${id}`,
}

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
  if (!read(KEYS.products, null)) write(KEYS.products, [])
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
  const record = { ...product, id: product.id || uid('m'), status: 'under_review', createdAt: Date.now() }
  list.unshift(record)
  saveUploadedProducts(list)
  return record
}
export function getCatalog() {
  // published catalog = base models + approved user uploads
  const uploaded = getUploadedProducts().filter((p) => p.status === 'published')
  return [...MODELS, ...uploaded]
}
export function getProductsByOwner(userId) {
  return getUploadedProducts().filter((p) => p.ownerId === userId)
}

// reset helper (used by "switch demo account" UX)
export function wipeAll() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('nexora.'))
    .forEach((k) => localStorage.removeItem(k))
}

export const DEMO_CREDENTIALS = DEMO_USERS.map(({ email, role, name }) => ({ email, role, name, password: 'Demo1234!' }))
