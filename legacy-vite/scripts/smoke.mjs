// Headless render smoke test: loads every route through Vite SSR and asserts
// it renders to non-trivial HTML without throwing. Catches component-level
// runtime bugs without needing a browser.

// Minimal browser globals touched at module-eval time.
const store = {}
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    store[k] = String(v)
  },
  removeItem: (k) => {
    delete store[k]
  },
}
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })

const ROUTES = [
  '/',
  '/explore',
  '/explore?cat=vision&use=creative',
  '/categories',
  '/creators',
  '/creator/synthetix-labs',
  '/creator/unknown-id',
  '/model/nexus-vision-pro',
  '/model/aura-synth',
  '/model/does-not-exist',
  '/pricing',
  '/cart',
  '/checkout',
  '/wishlist',
  '/dashboard',
  '/seller',
  '/upload',
  '/orders',
  '/settings',
  '/help',
  '/about',
  '/login',
  '/register',
  '/totally/missing/page',
]

const { createServer } = await import('vite')
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let failures = 0
try {
  const { renderRoute } = await vite.ssrLoadModule('/scripts/ssr-entry.jsx')
  for (const route of ROUTES) {
    try {
      const html = renderRoute(route)
      if (!html || html.length < 50) {
        console.log(`✗ ${route} — rendered too little (${html?.length ?? 0} chars)`)
        failures++
      } else {
        console.log(`✓ ${route.padEnd(40)} ${html.length} chars`)
      }
    } catch (err) {
      failures++
      console.log(`✗ ${route} — ${err.message}`)
      console.log(err.stack?.split('\n').slice(1, 4).join('\n'))
    }
  }
} finally {
  await vite.close()
}

console.log('\n' + (failures === 0 ? '✅ All routes rendered cleanly.' : `❌ ${failures} route(s) failed.`))
process.exit(failures === 0 ? 0 : 1)
