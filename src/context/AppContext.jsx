import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import {
  ensureSeed, getUser, getSession, startSession, endSession, touchSession,
  registerUser, authenticate, saveUser, getUserData, saveUserData,
  getCatalog, getDevices, revokeDevice, ROLES,
  recordSale, getSellerListings, getSalesBySeller, sellerEarnings as computeEarnings,
  getPayouts, requestPayout as dbRequestPayout, savePayoutAccount as dbSavePayoutAccount,
  updateProduct as dbUpdateProduct, deleteProduct as dbDeleteProduct,
} from '../data/db.js'
import { recommendFor } from '../data/recommend.js'

const AppContext = createContext(null)
const GUEST = '__guest__'

export function AppProvider({ children }) {
  ensureSeed()

  const [userId, setUserId] = useState(() => {
    const s = getSession()
    return s && !s.expired ? s.userId : GUEST
  })
  const [user, setUser] = useState(() => (userId !== GUEST ? getUser(userId) : null))
  const [data, setData] = useState(() => getUserData(userId === GUEST ? GUEST : userId))
  const [sessionExpired, setSessionExpired] = useState(() => {
    const s = getSession()
    return Boolean(s && s.expired)
  })
  const [toasts, setToasts] = useState([])
  const [catalogVersion, setCatalogVersion] = useState(0)

  const catalog = useMemo(() => getCatalog(), [catalogVersion])

  // ── toasts ──────────────────────────────────────────────────────────────────
  const toast = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type: opts.type || 'success', icon: opts.icon }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration || 2800)
  }, [])
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  // ── per-user data persistence ────────────────────────────────────────────────
  const mutate = useCallback(
    (updater) => {
      setData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        saveUserData(userId === GUEST ? GUEST : userId, next)
        return next
      })
    },
    [userId],
  )

  // reload data whenever the active account changes
  useEffect(() => {
    setData(getUserData(userId === GUEST ? GUEST : userId))
  }, [userId])

  // ── session lifecycle: keep-alive on activity + expiry watcher ────────────────
  const lastTouch = useRef(0)
  useEffect(() => {
    if (userId === GUEST) return
    const onActivity = () => {
      const now = Date.now()
      if (now - lastTouch.current > 20000) {
        lastTouch.current = now
        touchSession()
      }
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    const interval = setInterval(() => {
      const s = getSession()
      if (!s || s.expired) {
        setSessionExpired(true)
        setUser(null)
        setUserId(GUEST)
      }
    }, 15000)
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      clearInterval(interval)
    }
  }, [userId])

  // ── auth ─────────────────────────────────────────────────────────────────────
  const establish = useCallback(
    (u, { silent } = {}) => {
      // merge guest cart/wishlist into the account on first sign-in
      const guest = getUserData(GUEST)
      const mine = getUserData(u.id)
      if (guest.cart.length || guest.wishlist.length) {
        const cart = [...mine.cart]
        guest.cart.forEach((g) => {
          const hit = cart.find((c) => c.id === g.id)
          if (hit) hit.qty += g.qty
          else cart.push({ ...g })
        })
        const wishlist = [...new Set([...mine.wishlist, ...guest.wishlist])]
        saveUserData(u.id, { ...mine, cart, wishlist })
        saveUserData(GUEST, { cart: [], wishlist: [], orders: [], recentlyViewed: [], prefs: { interests: [] } })
      }
      startSession(u.id, u.role)
      setUser(u)
      setUserId(u.id)
      setSessionExpired(false)
      if (!silent) toast(`Selamat datang, ${u.name.split(' ')[0]}`, { icon: 'waving_hand' })
    },
    [toast],
  )

  const api = useMemo(() => {
    // ── derived per-user collections ────────────────────────────────────────────
    const find = (id) => catalog.find((m) => m.id === id)
    const cartDetailed = data.cart.map(({ id, qty }) => { const m = find(id); return m ? { ...m, qty } : null }).filter(Boolean)
    const wishlistDetailed = data.wishlist.map(find).filter(Boolean)
    const recentlyViewedDetailed = data.recentlyViewed.map(find).filter(Boolean)
    const cartCount = data.cart.reduce((s, c) => s + c.qty, 0)
    const subtotal = cartDetailed.reduce((s, m) => s + m.price * m.qty, 0)
    const taxes = Math.round(subtotal * 0.11 * 100) / 100 // PPN 11%
    const total = subtotal + taxes
    const recommendations = recommendFor(data, 4)

    return {
      // identity
      user,
      role: user?.role || null,
      roleMeta: user ? ROLES[user.role] : null,
      isAuthenticated: Boolean(user),
      ROLES,

      // auth
      register: ({ name, email, password, role }) => {
        const res = registerUser({ name, email, password, role })
        return res
      },
      signIn: (email, password) => {
        const res = authenticate(email, password)
        if (res.error) return res
        const u = res.user
        if (!u.verified) return { needVerify: true, user: u }
        if (u.twoFactor) return { need2FA: true, user: u }
        establish(u)
        return { ok: true, user: u }
      },
      establish, // call after passing verify / 2FA
      logout: () => {
        endSession()
        setUser(null)
        setUserId(GUEST)
        toast('Berhasil keluar', { icon: 'logout' })
      },
      updateProfile: (patch) => {
        if (!user) return
        const next = saveUser({ ...user, ...patch })
        setUser(next)
        toast('Profil diperbarui', { icon: 'check' })
      },
      verifyEmail: (id) => {
        const u = getUser(id)
        if (u) { saveUser({ ...u, verified: true }) }
      },
      setTwoFactor: (on) => {
        if (!user) return
        const next = saveUser({ ...user, twoFactor: on })
        setUser(next)
        toast(on ? '2FA diaktifkan' : '2FA dimatikan', { icon: on ? 'verified_user' : 'lock' })
      },
      refreshUser: () => user && setUser(getUser(user.id)),

      // session
      sessionExpired,
      resolveSessionExpired: () => { endSession(); setSessionExpired(false) },
      devices: user ? getDevices(user.id) : [],
      revokeDevice: (devId) => { if (user) { revokeDevice(user.id, devId); toast('Perangkat dikeluarkan', { icon: 'logout' }) } },

      // catalog
      catalog,
      bumpCatalog: () => setCatalogVersion((v) => v + 1),

      // cart (per-user)
      cart: data.cart,
      cartDetailed, cartCount, subtotal, taxes, total,
      addToCart: (id, qty = 1, name) => {
        mutate((d) => {
          const hit = d.cart.find((c) => c.id === id)
          const cart = hit
            ? d.cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c))
            : [...d.cart, { id, qty }]
          return { ...d, cart }
        })
        toast(`${name || 'Item'} masuk keranjang`, { icon: 'shopping_cart' })
      },
      removeFromCart: (id) => mutate((d) => ({ ...d, cart: d.cart.filter((c) => c.id !== id) })),
      setQty: (id, qty) => mutate((d) => ({ ...d, cart: d.cart.map((c) => (c.id === id ? { ...c, qty: Math.max(1, qty) } : c)).filter((c) => c.qty > 0) })),
      clearCart: () => mutate((d) => ({ ...d, cart: [] })),

      // wishlist (per-user)
      wishlist: data.wishlist,
      wishlistDetailed,
      isWishlisted: (id) => data.wishlist.includes(id),
      toggleWishlist: (id, name) => {
        const wasIn = data.wishlist.includes(id)
        mutate((d) => ({ ...d, wishlist: wasIn ? d.wishlist.filter((x) => x !== id) : [...d.wishlist, id] }))
        toast(wasIn ? `${name || 'Item'} dihapus dari wishlist` : `${name || 'Item'} disimpan`, { icon: wasIn ? 'bookmark_remove' : 'bookmark_added' })
      },

      // recently viewed + recommendations (per-user)
      recentlyViewed: data.recentlyViewed,
      recentlyViewedDetailed,
      recordView: (id) => mutate((d) => ({ ...d, recentlyViewed: [id, ...d.recentlyViewed.filter((x) => x !== id)].slice(0, 12) })),
      recommendations,

      // orders (per-user) — paid orders also fan out into the seller sales ledger
      orders: data.orders,
      placeOrder: (order) => {
        recordSale(order, { name: user?.name, id: user?.id })
        mutate((d) => ({ ...d, orders: [order, ...d.orders], cart: [] }))
      },

      // ── seller economy (listings, sales ledger, earnings, payouts) ────────────
      sellerListings: user ? getSellerListings(user.id) : [],
      sellerSales: user ? getSalesBySeller(user.id) : [],
      sellerEarnings: user ? computeEarnings(user.id) : null,
      payoutHistory: user ? getPayouts(user.id) : [],
      payoutAccount: user?.store?.payout || null,
      updateProduct: (id, patch) => {
        const res = dbUpdateProduct(id, patch, user?.id)
        if (res.error) toast(res.error, { type: 'error', icon: 'error' })
        else { toast('Produk diperbarui', { icon: 'check' }); setCatalogVersion((v) => v + 1) }
        return res
      },
      setProductStatus: (id, status) => {
        const res = dbUpdateProduct(id, { status }, user?.id)
        if (!res.error) { toast(status === 'published' ? 'Produk ditayangkan' : 'Produk disembunyikan', { icon: status === 'published' ? 'visibility' : 'visibility_off' }); setCatalogVersion((v) => v + 1) }
        return res
      },
      deleteProduct: (id) => {
        const res = dbDeleteProduct(id, user?.id)
        if (res.error) toast(res.error, { type: 'error', icon: 'error' })
        else { toast('Produk dihapus', { icon: 'delete' }); setCatalogVersion((v) => v + 1) }
        return res
      },
      savePayoutAccount: ({ bank, account }) => {
        const res = dbSavePayoutAccount(user?.id, { bank, account })
        if (res.error) toast(res.error, { type: 'error', icon: 'error' })
        else { setUser(res.user); toast('Rekening payout terverifikasi', { icon: 'verified_user' }) }
        return res
      },
      requestPayout: (amountUSD, amountIDR) => {
        const res = dbRequestPayout(user?.id, amountUSD, amountIDR)
        if (res.error) toast(res.error, { type: 'error', icon: 'error' })
        else { toast('Pencairan diproses', { icon: 'payments' }); setCatalogVersion((v) => v + 1) }
        return res
      },

      // toasts
      toast, toasts, dismissToast,
    }
  }, [user, data, catalog, sessionExpired, toasts, mutate, establish, toast, dismissToast])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
