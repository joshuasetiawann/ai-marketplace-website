import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react'
import { MODELS } from '../data/models.js'

const AppContext = createContext(null)

const STORAGE_KEY = 'nexora.state.v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

const initialState = loadState() || {
  cart: [], // [{ id, qty }]
  wishlist: [], // [id]
  user: null, // { name, email }
  orders: [], // [{ id, date, items, total, status }]
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cart.find((c) => c.id === action.id)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) => (c.id === action.id ? { ...c, qty: c.qty + (action.qty || 1) } : c)),
        }
      }
      return { ...state, cart: [...state.cart, { id: action.id, qty: action.qty || 1 }] }
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((c) => c.id !== action.id) }
    case 'SET_QTY':
      return {
        ...state,
        cart: state.cart
          .map((c) => (c.id === action.id ? { ...c, qty: Math.max(1, action.qty) } : c))
          .filter((c) => c.qty > 0),
      }
    case 'CLEAR_CART':
      return { ...state, cart: [] }
    case 'TOGGLE_WISHLIST': {
      const inList = state.wishlist.includes(action.id)
      return {
        ...state,
        wishlist: inList ? state.wishlist.filter((x) => x !== action.id) : [...state.wishlist, action.id],
      }
    }
    case 'LOGIN':
      return { ...state, user: action.user }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders], cart: [] }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const toast = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type: opts.type || 'success', icon: opts.icon }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, opts.duration || 2600)
  }, [])

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  // Derived helpers
  const cartDetailed = useMemo(
    () =>
      state.cart
        .map(({ id, qty }) => {
          const model = MODELS.find((m) => m.id === id)
          return model ? { ...model, qty } : null
        })
        .filter(Boolean),
    [state.cart],
  )

  const wishlistDetailed = useMemo(
    () => state.wishlist.map((id) => MODELS.find((m) => m.id === id)).filter(Boolean),
    [state.wishlist],
  )

  const cartCount = useMemo(() => state.cart.reduce((sum, c) => sum + c.qty, 0), [state.cart])
  const subtotal = useMemo(() => cartDetailed.reduce((sum, m) => sum + m.price * m.qty, 0), [cartDetailed])
  const taxes = useMemo(() => Math.round(subtotal * 0.05 * 100) / 100, [subtotal])
  const total = useMemo(() => subtotal + taxes, [subtotal, taxes])

  const api = useMemo(
    () => ({
      state,
      dispatch,
      // cart
      cartDetailed,
      cartCount,
      subtotal,
      taxes,
      total,
      addToCart: (id, qty = 1, name) => {
        dispatch({ type: 'ADD_TO_CART', id, qty })
        toast(`${name || 'Item'} added to cart`, { icon: 'shopping_cart' })
      },
      removeFromCart: (id) => dispatch({ type: 'REMOVE_FROM_CART', id }),
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      // wishlist
      wishlist: state.wishlist,
      wishlistDetailed,
      isWishlisted: (id) => state.wishlist.includes(id),
      toggleWishlist: (id, name) => {
        const wasIn = state.wishlist.includes(id)
        dispatch({ type: 'TOGGLE_WISHLIST', id })
        toast(wasIn ? `${name || 'Item'} removed from wishlist` : `${name || 'Item'} saved to wishlist`, {
          icon: wasIn ? 'bookmark_remove' : 'bookmark_added',
        })
      },
      // auth
      user: state.user,
      login: (user) => {
        dispatch({ type: 'LOGIN', user })
        toast(`Welcome back, ${user.name.split(' ')[0]}`, { icon: 'waving_hand' })
      },
      logout: () => {
        dispatch({ type: 'LOGOUT' })
        toast('Signed out', { icon: 'logout' })
      },
      // orders
      orders: state.orders,
      placeOrder: (order) => dispatch({ type: 'PLACE_ORDER', order }),
      // toasts
      toast,
      toasts,
      dismissToast,
    }),
    [state, cartDetailed, cartCount, subtotal, taxes, total, wishlistDetailed, toast, toasts, dismissToast],
  )

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
