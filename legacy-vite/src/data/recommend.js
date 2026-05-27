import { MODELS } from './models.js'

// Personalized recommendations from a user's signals (recently viewed, wishlist,
// purchases, stated interests). Scores catalog items by category / use-case
// overlap and excludes things the user already owns. Falls back to trending.
export function recommendFor(userData, limit = 4) {
  const { recentlyViewed = [], wishlist = [], orders = [], prefs = {} } = userData || {}
  const owned = new Set(orders.flatMap((o) => o.items.map((i) => i.id)))
  const signalIds = [...recentlyViewed, ...wishlist]
  const signalModels = signalIds.map((id) => MODELS.find((m) => m.id === id)).filter(Boolean)

  const catWeight = {}
  const useWeight = {}
  signalModels.forEach((m) => {
    catWeight[m.category] = (catWeight[m.category] || 0) + 2
    m.useCases.forEach((u) => (useWeight[u] = (useWeight[u] || 0) + 1))
  })
  ;(prefs.interests || []).forEach((c) => (catWeight[c] = (catWeight[c] || 0) + 3))

  const hasSignal = Object.keys(catWeight).length > 0

  const scored = MODELS
    .filter((m) => !owned.has(m.id) && !signalIds.includes(m.id))
    .map((m) => {
      let score = (catWeight[m.category] || 0)
      m.useCases.forEach((u) => (score += useWeight[u] || 0))
      score += (m.rating - 4.5) * 2 // quality nudge
      return { m, score }
    })
    .sort((a, b) => b.score - a.score)

  const picks = hasSignal ? scored.filter((s) => s.score > 0) : scored
  const result = (picks.length ? picks : scored).slice(0, limit).map((s) => s.m)
  // top up with trending if short
  if (result.length < limit) {
    for (const m of MODELS) {
      if (result.length >= limit) break
      if (!result.includes(m) && !owned.has(m.id)) result.push(m)
    }
  }
  return result
}

// Lightweight reason label for a recommended item.
export function recommendReason(model, userData) {
  const { recentlyViewed = [], wishlist = [] } = userData || {}
  const viewed = recentlyViewed.map((id) => MODELS.find((m) => m.id === id)).filter(Boolean)
  if (viewed.some((v) => v.category === model.category)) return `Karena kamu lihat model ${model.category}`
  if (wishlist.length) return 'Cocok dengan selera kamu'
  return 'Sedang tren minggu ini'
}
