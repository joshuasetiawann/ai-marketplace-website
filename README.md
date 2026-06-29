# Nexora AI — Marketplace Model AI Premium

A production-ready, full-stack **AI model marketplace** (Shopee/Tokopedia-style)
built with **Next.js 16 (App Router) + Supabase**. Real authentication, a real
Postgres database with row-level security, role-based access, a full buy flow,
a seller studio, and an admin console — all in Bahasa Indonesia with Rupiah
pricing and the "Precision Luxury" dark design system.

## ✨ Features

| Area | What works |
| --- | --- |
| **Auth** | Real email/password (Argon2 hashing), email verification, password reset, optional TOTP 2FA, httpOnly-cookie sessions, route-guarding proxy |
| **Marketplace** | Home, Explore (search + multi-filter + sort), product detail (SSR) with database-backed reviews |
| **Commerce** | Cart (qty, promo codes, PPN 11%), wishlist, checkout with simulated payment, order history & confirmation |
| **Selling** | Buka Toko, product CRUD + submit-for-moderation, sales ledger, earnings (80/20 split), payout account + withdrawal requests |
| **Admin** | Console with product moderation (approve/reject), user management (roles), payout processing |
| **Security** | RLS on every table; privileged ops (checkout, payouts) via `SECURITY DEFINER` RPCs; triggers prevent role/status escalation |

**Roles:** one `user` account both buys and sells (Buka Toko); `admin` runs the
platform.

## 🧱 Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth,
RLS, Storage) · lucide-react · Vitest + Playwright.

## 🚀 Getting started

### 1. Install
```bash
npm install
```

### 2. Supabase (local)
Requires Docker.
```bash
npx supabase start          # boots local Postgres + Auth (prints your keys)
npx supabase db reset       # applies migrations + seeds the catalog
npm run seed:users          # creates the demo accounts (re-run after each reset)
```

### 3. Environment
Copy `.env.example` to `.env.local` and fill from `npx supabase status -o env`:
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

### Demo accounts
| Email | Role | Password |
| --- | --- | --- |
| `user@nexora.ai` | user (buyer + seller) | `Demo1234!` |
| `admin@nexora.ai` | admin | `Demo1234!` |

Local emails (verification, password reset) land in **Mailpit**: `http://127.0.0.1:54324`.

## 📁 Structure
```
app/
  (marketplace)/   Home, explore, product, cart, checkout, categories, creators, pricing, about, help
  (account)/       dashboard, orders, settings, sell/* (Seller Studio)
  (admin)/admin/   Console: moderation, users, payouts
  (auth)/          login, register, verify-email, forgot/reset password
lib/               supabase clients, server actions, catalog/cart/seller/pricing helpers
components/        design-system components (Navbar, ModelCard, ProductDetailClient, …)
supabase/          SQL migrations (schema, RLS, grants, RPCs) + seed
```

## ☁️ Deploy
Deploy to **Vercel**, point it at a hosted **Supabase** project, run the
migrations against it (`supabase db push`), set the env vars, and enable email
confirmations in the Supabase dashboard. Done.

## 🔒 Security notes
- The service-role key is server-only (`lib/supabase/admin.ts`).
- Buyers can't insert sales; payouts are admin-write — both handled by audited
  `SECURITY DEFINER` RPCs (`checkout`, `request_payout`).
- Triggers block sellers from self-publishing and users from self-promoting to admin.
