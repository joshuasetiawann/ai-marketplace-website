<div align="center">

<img src="public/favicon.svg" width="72" alt="Nexora AI" />

# Nexora AI — Premium AI Marketplace

**A production-ready marketplace for discovering, buying &amp; selling curated AI models.**
One account to shop *and* sell · Indonesian payments · a built-in admin console — on **Next.js 16 + Supabase**.

<p>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-00e5ff?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Bahasa-Indonesia-e9c349?style=flat-square" />
</p>

<br/>

<img src="docs/preview/home.jpg" width="880" alt="Nexora AI — Home" />

</div>

---

## ✨ Overview

Nexora AI is a **full-stack, production-ready** AI model marketplace — real
authentication, a real Postgres database with row-level security, and role-based
access. It is built from a *Precision Luxury* design language (deep-graphite
glassmorphism, electric-blue accents, editorial typography) and is fully
localized to **Bahasa Indonesia** with **Rupiah** pricing and local payment rails
(QRIS / Virtual Account / e-wallet).

Modelled on how Shopee / Tokopedia actually work:

- 🛒 **Marketplace** — one account both **shops and sells**. Any user can *Buka Toko*
  (open a store) to start selling — no separate seller account.
- 🛡️ **Admin Console** (`/admin`) — moderation, user management and payout
  processing, guarded server-side for `admin` accounts only.

> Real backend: every table is protected by RLS, and privileged operations
> (checkout, payouts) run through audited `SECURITY DEFINER` Postgres functions.

---

## 🖼️ Preview

<table>
  <tr>
    <td width="50%"><img src="docs/preview/explore.jpg" alt="Explore" /><br/><sub><b>Explore</b> — live search · multi-filter · sort</sub></td>
    <td width="50%"><img src="docs/preview/product.jpg" alt="Product detail" /><br/><sub><b>Product detail</b> — gallery · specs · reviews · Rupiah</sub></td>
  </tr>
  <tr>
    <td><img src="docs/preview/cart.jpg" alt="Cart" /><br/><sub><b>Cart</b> — promo codes · PPN 11% · IDR totals</sub></td>
    <td><img src="docs/preview/pricing.jpg" alt="Pricing" /><br/><sub><b>Pricing</b> — tiers · FAQ</sub></td>
  </tr>
  <tr>
    <td><img src="docs/preview/buka-toko.jpg" alt="Open a store" /><br/><sub><b>Buka Toko</b> — turn any shopper into a seller</sub></td>
    <td><img src="docs/preview/buyer-dashboard.jpg" alt="Buyer dashboard" /><br/><sub><b>Dashboard</b> — your account home</sub></td>
  </tr>
  <tr>
    <td><img src="docs/preview/seller-studio.jpg" alt="Seller Studio" /><br/><sub><b>Seller Studio</b> — sales ledger → earnings (80/20) → payouts, product CRUD</sub></td>
    <td><img src="docs/preview/console-admin.jpg" alt="Admin Console" /><br/><sub><b>Admin Console</b> — moderation queue · users · payouts</sub></td>
  </tr>
</table>

> Preview images reflect the Precision Luxury design system that this app ships with.

---

## 🚀 Features

| Area | What works |
| --- | --- |
| **Auth** | Real email/password (Argon2 hashing), email verification, password reset, optional **TOTP 2FA**, httpOnly-cookie sessions, route-guarding proxy |
| **Marketplace** | Home, Explore (search + multi-filter + sort), product detail (SSR) with database-backed reviews |
| **Commerce** | Cart (qty, promo codes, PPN 11%), wishlist, checkout with simulated payment, order history &amp; confirmation |
| **Selling** | Buka Toko, product CRUD + submit-for-moderation, sales ledger, earnings (80/20 split), payout account + withdrawal requests |
| **Admin** | Console with product moderation (approve/reject), user-role management, payout processing |
| **Security** | RLS on every table; privileged ops via `SECURITY DEFINER` RPCs (`checkout`, `request_payout`); triggers block role/status escalation |

**Roles:** one `user` account both buys and sells (Buka Toko); `admin` runs the platform.

### 🔁 The selling loop (verified end-to-end)

A buyer **browses → opens a listing → buys → pays**, and the sale lands in the
seller's ledger at the correct **80% net** — earnings and the withdrawable balance
update in real time, ready to cash out to a verified bank account. The checkout +
payout maths are verified at the database level (PPN 11%, 80/20 split, min-payout
and balance checks).

---

## 🧱 Stack

**Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4** ·
**Supabase** (Postgres · Auth · RLS · Storage) · `lucide-react` · Vitest + Playwright.

- **Color** — Deep graphite base (`#131313` / `#0e0e0e`), Electric Blue accent (`#00e5ff`), Champagne Gold for premium tiers.
- **Type** — Inter (display/body) + Geist Sans/Mono (labels/metadata) via `next/font`.
- **Icons** — `lucide-react` 2px-stroke SVGs.
- **Artwork** — Product thumbnails are generated as **self-contained seeded SVGs** (`ModelArtwork`) — no external images, nothing ever 404s.

---

## ⚡ Getting started

### 1. Install
```bash
npm install
```

### 2. Supabase (local — requires Docker)
```bash
npx supabase start          # boots local Postgres + Auth (prints your keys)
npx supabase db reset       # applies migrations + seeds the catalog
npm run seed:users          # creates the demo accounts (re-run after each reset)
```

### 3. Environment
Copy `.env.example` → `.env.local` and fill from `npx supabase status -o env`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, never exposed to the browser
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run
```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm test             # unit tests (Vitest)
npm run test:e2e     # end-to-end (Playwright)
```

### 👤 Demo accounts

Password for all: **`Demo1234!`**

| Email | Role | Notes |
| --- | --- | --- |
| `user@nexora.ai` | user (buyer + seller) | shops, and can Buka Toko to sell |
| `admin@nexora.ai` | admin | the `/admin` console |

Local auth emails (verification, password reset) land in **Mailpit**: `http://127.0.0.1:54324`.

---

## 🗂️ Project structure

```
app/
  (marketplace)/   Home, explore, product, cart, checkout, categories, creators, pricing, about, help
  (account)/       dashboard, orders, settings, sell/* (Seller Studio)
  (admin)/admin/   Console: moderation, users, payouts
  (auth)/          login, register, verify-email, forgot/reset password
lib/               supabase clients, server actions, catalog/cart/seller/pricing helpers
components/        design-system components (Navbar, ModelCard, ProductDetailClient, …)
supabase/          SQL migrations (schema · RLS · grants · RPCs) + seed
```

---

## 🌐 Deploy

Deploy to **Vercel**, point it at a hosted **Supabase** project, run the migrations
against it (`supabase db push`), set the env vars, and enable email confirmations
in the Supabase dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/joshuasetiawann/ai-marketplace-website)

---

## 🔒 Security notes
- The service-role key is server-only (`lib/supabase/admin.ts`) and never shipped to the browser.
- Buyers can't insert sales; payouts are admin-write — both handled by audited `SECURITY DEFINER` RPCs.
- Triggers block sellers from self-publishing and users from self-promoting to admin.

<div align="center"><sub>© Nexora AI · Precision Luxury Intelligence</sub></div>
