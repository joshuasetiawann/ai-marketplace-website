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
| **Accounts** | Mock auth (login / register), buyer dashboard, account settings (profile / security / notifications / billing), order history |
| **Selling** | Seller dashboard with live SVG revenue chart & performance table, multi-section "publish product" flow with drag-&-drop |
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
npm install      # install dependencies
npm run dev      # start the dev server  → http://localhost:5173
npm run build    # production build       → dist/
npm run preview  # preview the build      → http://localhost:4173
npm run smoke    # SSR render-check every route (no browser needed)
```

## 🗂 Project structure

```
src/
├── components/        # Reusable UI: Navbar, Footer, ModelCard, QuickViewModal,
│                      #   Icon (lucide map), ModelArtwork (SVG), AreaChart, Toaster…
├── context/
│   └── AppContext.jsx # Global state: cart, wishlist, auth, orders, toasts (+ persistence)
├── data/
│   └── models.js      # Catalog of AI models, categories, creators
├── pages/             # 19 routed pages (Home, Explore, ProductDetail, Cart, Checkout,
│                      #   Dashboards, Upload, Pricing, Settings, Auth, About, Help…)
├── App.jsx            # Routes + layouts
├── main.jsx           # Entry (fonts + providers)
└── index.css          # Tailwind layers + glass/glow utilities
```

## 🧪 Verification

`npm run smoke` server-renders all 24 routes through Vite + React Router and asserts each
mounts without errors — a fast, browser-free guard against regressions.

## 🛠 Tech

React 18 · React Router 6 · Vite 5 · Tailwind CSS 3 · lucide-react · @fontsource

---

© Nexora AI. Precision Luxury Intelligence.
