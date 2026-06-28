# Nexora AI — Premium AI Marketplace

A fully-functional, responsive marketplace web app for discovering, buying and selling
curated AI models. Built from the **"Precision Luxury"** design system — a dark,
glassmorphic aesthetic with electric-blue accents, editorial typography and generous
negative space.

> Every screen is interactive and stateful — this is a working application, not static mockups.

![Nexora AI](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Tailwind-00e5ff?style=flat-square)

## ✨ Features

| Area | What works |
| --- | --- |
| **Discovery** | Home, Explore with live search, multi-filter (category / use-case / tier / rating) and sorting, category & creator browsing |
| **Product** | Rich detail page (gallery, capabilities, specs, reviews, related), quick-view modal |
| **Commerce** | Cart with quantity + promo codes, multi-step checkout with order confirmation, wishlist |
| **Accounts** | Mock auth (login / register), **one account both buys & sells** (Shopee/Tokopedia-style "Buka Toko"), buyer dashboard, account settings, order history |
| **Selling** | Seller dashboard wired to a real **sales ledger → earnings → secure payouts** (2FA-gated withdrawals, 80/20 split), product CRUD, multi-section publish flow |
| **Console** | Separate internal app (own port) for **Admin** (moderation, reports, users) & **Developer** (API keys, versions, analytics), role-gated with 2FA |
| **Content** | Pricing (monthly/annual toggle + FAQ), Help Center (search + FAQ + contact), About / Mission |
| **UX** | Responsive (desktop top-nav + mobile bottom-nav), toast notifications, 404, route-aware scroll, `localStorage` persistence |

State (cart, wishlist, auth, orders) is managed via React Context and **persisted to
`localStorage`**, so your session survives refreshes.

## 🎨 Design system

- **Colors** — Deep graphite base (`#131313` / `#0e0e0e`), Electric Blue accent (`#00e5ff`),
  Champagne Gold for premium tiers.
- **Type** — Inter (display/body) + Geist Sans/Mono (labels/metadata), **self-hosted** via
  `@fontsource` (no CDN).
- **Icons** — `lucide-react` 2px-stroke SVGs (matches the design spec, fully bundled).
- **Artwork** — Product/creator thumbnails are generated as **self-contained abstract SVGs**
  (`ModelArtwork`) seeded per item — no external images, nothing ever 404s.
- **Depth** — Glassmorphism (backdrop blur + hairline borders) and soft cyan glows instead
  of heavy shadows.

No runtime depends on any external service — fonts, icons and imagery are all bundled.

## 🚀 Getting started

```bash
npm install          # install dependencies

# Consumer marketplace (buyers + sellers)
npm run dev          # dev server        → http://localhost:5173
npm run build        # production build   → dist/
npm run preview      # preview the build  → http://localhost:4173

# Nexora Console — internal Admin + Developer app (separate port)
npm run dev:console      # dev server     → http://localhost:5174/console.html
npm run build:console    # build          → dist-console/
npm run preview:console  # preview        → http://localhost:4174/console.html

npm run build:all    # build both apps
npm run smoke        # SSR render-check every consumer route (no browser needed)
```

### 🏬 Two apps, one codebase

Like Shopee/Tokopedia, the **consumer marketplace** is a single app where one
account both shops and sells — any user can **Buka Toko** (open a store) to start
selling, no separate seller account. The **Admin & Developer tools live in a
separate "Nexora Console" app** on its own port (built to `dist-console/`), so
internal surfaces deploy independently from the public storefront. Both apps share
the same `src/` (context, data layer, components) and the same `localStorage`
"backend" — swap that layer for a real API and the two apps light up together.

**Demo accounts** (password `Demo1234!`): `buyer@nexora.ai`, `seller@nexora.ai`
(consumer) · `admin@nexora.ai` (2FA), `dev@nexora.ai` (console).

## 🌐 Deploy

Both apps are static SPAs — deploy to any static host. The consumer app builds with
`npm run build` → `dist/` (SPA deep-link fallback preconfigured via `vercel.json`,
`netlify.toml` + `public/_redirects`). The internal console builds with
`npm run build:console` → `dist-console/` and is deployed separately (e.g. an
`admin.` subdomain or access-restricted host) — it uses hash routing, so it needs no
server rewrites.

**One-click:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/joshuasetiawann/ai-marketplace-website)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/joshuasetiawann/ai-marketplace-website)

Or connect the repo manually — both auto-detect Vite and need no extra settings.

## 🗂 Project structure

```
index.html             # Consumer app entry          (port 5173 / dist/)
console.html           # Nexora Console entry         (port 5174 / dist-console/)
vite.config.js         # Consumer build config
vite.console.config.js # Console build config
src/
├── components/        # Reusable UI: Navbar, Footer, ModelCard, QuickViewModal,
│                      #   Icon (lucide map), ModelArtwork (SVG), AreaChart, Toaster…
├── context/
│   └── AppContext.jsx # Global state: cart, wishlist, auth, orders, seller economy
├── data/
│   ├── models.js      # Catalog of AI models, categories, creators
│   ├── db.js          # localStorage "backend": users, sessions, products, sales, payouts
│   ├── payment.js     # Indonesian payments (QRIS / VA / e-wallet) + Rupiah helpers
│   └── security.js    # Validation + simulated OTP/2FA primitives
├── pages/             # Consumer pages (Home, Explore, ProductDetail, Cart, Checkout,
│                      #   Seller Studio, Buka Toko, Pricing, Settings, Auth, About, Help…)
├── console/           # Nexora Console app: main + ConsoleApp/Layout/Login (Admin + Developer)
├── App.jsx            # Consumer routes + layouts
├── main.jsx           # Consumer entry (fonts + providers)
└── index.css          # Tailwind layers + glass/glow utilities
```

## 🧪 Verification

`npm run smoke` server-renders all 24 routes through Vite + React Router and asserts each
mounts without errors — a fast, browser-free guard against regressions.

## 🛠 Tech

React 18 · React Router 6 · Vite 5 · Tailwind CSS 3 · lucide-react · @fontsource

---

© Nexora AI. Precision Luxury Intelligence.
