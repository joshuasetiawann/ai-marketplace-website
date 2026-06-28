# Plan A — Fondasi & Auth (Nexora Next.js + Supabase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fondasi produksi Nexora AI di Next.js App Router + Supabase: app on-brand, skema database + RLS, dan autentikasi asli (register, verifikasi email, login/logout, reset password).

**Architecture:** Single Next.js App Router app (TypeScript) menggantikan SPA Vite. Supabase menyediakan Postgres + Auth + RLS. Sesi disimpan di cookie httpOnly via `@supabase/ssr`; `middleware.ts` me-refresh sesi & menjaga route. App Vite lama dipindah ke `legacy-vite/` sebagai referensi port (dihapus di Plan D).

**Tech Stack:** Next.js 16 (App Router) + React 19, TypeScript, **Tailwind CSS v4** (token via `@theme` di `globals.css`, bukan `tailwind.config.js`), font via **`next/font`** (bukan `@fontsource`), `@supabase/ssr` + `@supabase/supabase-js`, Supabase CLI (Docker) untuk dev lokal, Vitest (unit), Playwright (E2E). Package manager: **npm**.

> **Deviasi saat eksekusi (Commit 1):** `create-next-app@latest` menghasilkan **Next 16.2.9 + React 19.2 + Tailwind v4** (bukan Next 15 / Tailwind v3 yang diasumsikan saat menulis plan). Adaptasi: token desain didefinisikan di `app/globals.css` via `@theme` (menghasilkan utilitas `bg-base`/`text-accent`/`border-line`), dan font Inter/Geist dimuat lewat `next/font/google`. Tidak ada `tailwind.config.ts`. Semua utilitas yang dipakai task UI berikutnya (`bg-base`, `text-accent`, `border-line`, `font-geist`, dst.) tetap valid.

## Global Constraints

- Package manager **npm** (repo memakai `package-lock.json`). Jangan pakai yarn/pnpm.
- Bahasa UI **Bahasa Indonesia**, harga ditampilkan **Rupiah** (data harga disimpan USD `price_usd`).
- Model role **dua**: `user` (default) dan `admin`. Tidak ada role lain.
- Ekonomi tetap: `PLATFORM_FEE = 0.20`, `SELLER_SHARE = 0.80`, `MIN_PAYOUT_USD = 50`.
- Design system "Precision Luxury": base graphite `#131313`/`#0e0e0e`, accent electric-blue `#00e5ff`, gold `#e9c349`. Font Inter + Geist (via `next/font/google`). Ikon `lucide-react`.
- **Satu fitur = satu commit, push ke `origin` tiap commit.** Branch kerja: `feat/next-supabase-migration`.
- Password TIDAK PERNAH plaintext — ditangani Supabase Auth.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server, tidak pernah ke client.
- `next build` harus bersih sebelum tiap push.

---

## File Structure (dibuat di Plan A)

- `legacy-vite/` — app Vite lama (referensi port).
- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js` — config Next.js.
- `app/layout.tsx` — root layout, import font + globals, set lang `id`.
- `app/globals.css` — token warna + base Tailwind.
- `app/page.tsx` — placeholder Home (diisi penuh di Plan B).
- `app/(auth)/login/page.tsx`, `register/page.tsx`, `verify-email/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx` — halaman auth.
- `lib/supabase/server.ts`, `client.ts`, `admin.ts`, `middleware.ts` — helper Supabase.
- `lib/economics.ts` — konstanta + helper ekonomi (fungsi murni).
- `lib/actions/auth.ts` — Server Actions auth.
- `middleware.ts` — refresh sesi + penjaga route.
- `supabase/config.toml` — config Supabase CLI.
- `supabase/migrations/0001_init.sql` — skema + enum + index.
- `supabase/migrations/0002_rls.sql` — Row-Level Security policies.
- `supabase/migrations/0003_functions.sql` — trigger `handle_new_user` + RPC sensitif (stub yang dipakai Plan B/C/D).
- `supabase/seed.sql` — seed katalog + akun demo.
- `.env.example`, `.env.local` — environment.
- `tests/economics.test.ts` — unit ekonomi.
- `tests/e2e/auth.spec.ts` — E2E auth.
- `vitest.config.ts`, `playwright.config.ts`.

---

### Task 1: Scaffold Next.js + design system (Commit 1)

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Move: semua app Vite → `legacy-vite/`

**Interfaces:**
- Produces: app Next.js yang build & dev jalan, token Tailwind on-brand (`bg-base`, `text-accent`, dll), font ter-load.

- [ ] **Step 1: Pindahkan app Vite lama ke `legacy-vite/`**

```bash
mkdir -p legacy-vite
git mv src legacy-vite/src
git mv index.html console.html legacy-vite/
git mv vite.config.js vite.console.config.js postcss.config.js tailwind.config.js legacy-vite/
git mv package.json package-lock.json legacy-vite/
git mv scripts legacy-vite/scripts
git mv public legacy-vite/public
git mv netlify.toml vercel.json legacy-vite/ 2>/dev/null || true
# sisakan: docs/, README.md, .gitignore, dist*/ (akan dihapus nanti), node_modules (akan diganti)
rm -rf dist dist-console node_modules
```

Expected: `git status` menunjukkan file lama ter-rename ke `legacy-vite/`.

- [ ] **Step 2: Scaffold Next.js ke direktori sementara lalu pindahkan ke root**

```bash
TMP=$(mktemp -d)
npx --yes create-next-app@latest "$TMP/nx" \
  --typescript --tailwind --app --no-src-dir \
  --import-alias "@/*" --use-npm --eslint --no-turbopack
# pindahkan hasil scaffold ke root repo (kecuali .git)
shopt -s dotglob
cp -r "$TMP/nx/." .
rm -rf "$TMP"
```

Expected: muncul `package.json` (Next.js), `app/`, `next.config.ts`, `tailwind.config.ts` di root.

- [ ] **Step 3: Pasang dependensi runtime yang sudah dipakai + Supabase**

```bash
npm install @supabase/ssr @supabase/supabase-js lucide-react \
  @fontsource/inter @fontsource/geist-sans @fontsource/geist-mono
npm install -D vitest @playwright/test
```

Expected: dependensi masuk ke `package.json` tanpa error.

- [ ] **Step 4: Port token warna ke `tailwind.config.ts`**

Salin palet dari `legacy-vite/tailwind.config.js`. Ganti isi `theme.extend.colors` dan `content`:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#131313',
        'base-2': '#0e0e0e',
        accent: '#00e5ff',
        gold: '#e9c349',
        ink: '#e7e7e7',
        muted: '#9a9a9a',
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        geist: ['Geist Sans', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: Set root layout (lang `id` + font + globals)**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-mono/400.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nexora AI — Marketplace Model AI Premium',
  description: 'Temukan, beli, dan jual model AI premium.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-base text-ink font-sans antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Set `app/globals.css` (base + token)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
body { background: #131313; }
```

- [ ] **Step 7: Placeholder Home on-brand**

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <h1 className="font-geist text-4xl font-bold tracking-tight">
          Nexora <span className="text-accent">AI</span>
        </h1>
        <p className="mt-3 text-muted">Marketplace model AI premium — fondasi Next.js + Supabase.</p>
      </div>
    </main>
  )
}
```

- [ ] **Step 8: Verifikasi build & dev**

```bash
npm run build
```
Expected: build sukses, route `/` ter-generate, tanpa error TypeScript.

- [ ] **Step 9: Commit + push**

```bash
git add -A
git commit -m "feat: scaffold Next.js app + port Precision Luxury design system

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push
```

---

### Task 2: Skema database + RLS + seed (Commit 2)

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/0001_init.sql`, `0002_rls.sql`, `0003_functions.sql`, `supabase/seed.sql`
- Create: `lib/supabase/server.ts`, `client.ts`, `admin.ts`, `lib/economics.ts`
- Create: `.env.example`, `.env.local`
- Test: `tests/economics.test.ts`, `vitest.config.ts`

**Interfaces:**
- Produces:
  - Tabel: `profiles`, `stores`, `products`, `cart_items`, `wishlist_items`, `recently_viewed`, `orders`, `order_items`, `sales`, `payouts`, `reviews`, `preferences`.
  - `createServerClient()` → Supabase server client (cookies).
  - `createBrowserClient()` → Supabase browser client.
  - `createAdminClient()` → service-role client (server-only).
  - `lib/economics.ts`: `PLATFORM_FEE`, `SELLER_SHARE`, `MIN_PAYOUT_USD`, `feeOf(gross)`, `netOf(gross)`.

- [ ] **Step 1: Inisialisasi Supabase lokal**

```bash
npx --yes supabase init
npx --yes supabase start
```
Expected: Docker menyalakan stack lokal; CLI mencetak `API URL`, `anon key`, `service_role key`.

- [ ] **Step 2: Isi `.env.local` & `.env.example`**

`.env.local` (pakai nilai dari output `supabase start`):
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key dari supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key dari supabase start>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
`.env.example` (sama, tanpa nilai rahasia):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Pastikan `.env.local` ada di `.gitignore` (default Next.js sudah).

- [ ] **Step 3: Tulis migrasi skema `0001_init.sql`**

```sql
-- supabase/migrations/0001_init.sql
create type user_role as enum ('user','admin');
create type product_status as enum ('draft','under_review','published','rejected');
create type order_status as enum ('pending','paid','failed');
create type payout_status as enum ('processing','paid','rejected');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role user_role not null default 'user',
  is_seller boolean not null default false,
  art text[] not null default array['#0b3a44','#00e5ff'],
  two_factor boolean not null default false,
  created_at timestamptz not null default now()
);

create table stores (
  owner_id uuid primary key references profiles(id) on delete cascade,
  name text not null,
  handle text unique not null,
  tagline text default '',
  category text default '',
  payout_bank text,
  payout_account_masked text,
  payout_status text not null default 'none'
);

create table products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  tagline text default '',
  category text not null,
  use_cases text[] not null default '{}',
  use_case_tags text[] not null default '{}',
  tier text not null default 'Free',
  price_usd numeric(10,2) not null default 0,
  icon text default 'apps',
  art text[] not null default array['#0b3a44','#00e5ff'],
  description text default '',
  capabilities jsonb not null default '[]',
  specs jsonb not null default '{}',
  gallery int not null default 3,
  status product_status not null default 'under_review',
  rating numeric(2,1) not null default 0,
  reviews_count int not null default 0,
  creator_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on products(status);
create index products_owner_idx on products(owner_id);
create index products_category_idx on products(category);

create table cart_items (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  qty int not null default 1,
  added_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table wishlist_items (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (user_id, product_id)
);

create table recently_viewed (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  status order_status not null default 'pending',
  method text,
  total_usd numeric(10,2) not null default 0,
  contact jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  price_usd numeric(10,2) not null,
  qty int not null default 1,
  art text[] not null default '{}',
  icon text
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  seller_id uuid not null references profiles(id) on delete cascade,
  buyer_id uuid references profiles(id) on delete set null,
  buyer_name text,
  qty int not null default 1,
  gross numeric(10,2) not null,
  fee numeric(10,2) not null,
  net numeric(10,2) not null,
  status text not null default 'paid',
  method text,
  created_at timestamptz not null default now()
);
create index sales_seller_idx on sales(seller_id);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  amount_usd numeric(10,2) not null,
  amount_idr numeric(14,2) not null,
  bank text,
  account_masked text,
  status payout_status not null default 'processing',
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text default '',
  created_at timestamptz not null default now()
);

create table preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  interests text[] not null default '{}'
);
```

- [ ] **Step 4: Tulis trigger pembuatan profil `0003_functions.sql`**

```sql
-- supabase/migrations/0003_functions.sql
-- Saat user baru daftar di auth.users, otomatis buat baris profiles.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  insert into public.preferences (user_id) values (new.id);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- helper: apakah pemanggil admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
```

- [ ] **Step 5: Tulis RLS `0002_rls.sql`**

```sql
-- supabase/migrations/0002_rls.sql
alter table profiles enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;
alter table recently_viewed enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table sales enable row level security;
alter table payouts enable row level security;
alter table reviews enable row level security;
alter table preferences enable row level security;

-- profiles
create policy profiles_read_all on profiles for select using (true);
create policy profiles_update_own on profiles for update using (id = auth.uid());
create policy profiles_admin_all on profiles for all using (is_admin());

-- stores (publik baca; owner kelola; admin semua)
create policy stores_read_all on stores for select using (true);
create policy stores_owner_write on stores for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy stores_admin_all on stores for all using (is_admin());

-- products
create policy products_read_published on products for select using (status = 'published' or owner_id = auth.uid() or is_admin());
create policy products_owner_write on products for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy products_admin_all on products for all using (is_admin());

-- per-user tables
create policy cart_own on cart_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy wishlist_own on wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy recent_own on recently_viewed for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy prefs_own on preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders / order_items
create policy orders_own on orders for select using (buyer_id = auth.uid() or is_admin());
create policy orders_insert_own on orders for insert with check (buyer_id = auth.uid());
create policy order_items_read on order_items for select using (
  exists(select 1 from orders o where o.id = order_id and (o.buyer_id = auth.uid() or is_admin())));
create policy order_items_insert on order_items for insert with check (
  exists(select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid()));

-- sales (seller lihat miliknya; admin semua)
create policy sales_seller on sales for select using (seller_id = auth.uid() or is_admin());

-- payouts
create policy payouts_seller on payouts for select using (seller_id = auth.uid() or is_admin());
create policy payouts_admin on payouts for all using (is_admin());

-- reviews
create policy reviews_read_all on reviews for select using (true);
create policy reviews_author_write on reviews for all using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy reviews_admin_all on reviews for all using (is_admin());
```

- [ ] **Step 6: Tulis seed katalog + akun demo `supabase/seed.sql`**

Port subset dari `legacy-vite/src/data/models.js` menjadi baris `products` milik akun "rumah", dan buat 2 akun demo. Karena auth.users butuh dibuat lewat API, seed akun via SQL ke `auth.users` memakai helper Supabase. Minimal seed:

```sql
-- supabase/seed.sql
-- Akun demo dibuat lewat skrip Node (Task 2 Step 8), bukan SQL.
-- Di sini hanya seed katalog "rumah" (owner_id null = produk platform).
insert into products (name, tagline, category, use_cases, tier, price_usd, icon, art, description, status, rating, reviews_count, creator_id)
values
('Nexus Vision Pro','Model gambar generatif kelas enterprise','vision',array['business','creative'],'Pro',24,'visibility',array['#0b3a44','#00e5ff'],'Model difusi gambar resolusi tinggi.','published',4.9,1280,'synthetix-labs'),
('CodeWeaver X','LLM untuk generasi full-stack','code',array['developer','business'],'Pro',39,'code',array['#10233a','#3b82f6'],'Asisten koding multi-bahasa.','published',4.8,940,'synthetix-labs'),
('Chroma Studio FX','Efek visual & grading sinematik','vision',array['creative'],'Pro',49,'palette',array['#2a1f05','#e9c349'],'Pipeline warna sinematik.','published',4.7,612,'aura-labs');
```

- [ ] **Step 7: Terapkan migrasi & seed ke DB lokal**

```bash
npx supabase db reset
```
Expected: migrasi 0001→0003 jalan, seed termuat, tanpa error. (`db reset` menjalankan migrasi + `seed.sql`.)

- [ ] **Step 8: Skrip pembuat akun demo (service-role)**

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const a = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  for (const u of [
    { email:'user@nexora.ai', name:'Alex Morgan', role:'user' },
    { email:'admin@nexora.ai', name:'Nexora Admin', role:'admin' },
  ]) {
    const { data, error } = await a.auth.admin.createUser({ email:u.email, password:'Demo1234!', email_confirm:true, user_metadata:{ name:u.name } });
    if (error) { console.error(error.message); continue; }
    if (u.role==='admin') await a.from('profiles').update({ role:'admin' }).eq('id', data.user.id);
    console.log('seeded', u.email);
  }
})();
" 
```
Simpan perintah ini sebagai `scripts/seed-users.mjs` agar dapat diulang. Expected: cetak `seeded user@nexora.ai` & `seeded admin@nexora.ai`.

- [ ] **Step 9: Tulis helper Supabase clients**

```ts
// lib/supabase/server.ts
import { createServerClient as _create } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  return _create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  )
}
```

```ts
// lib/supabase/client.ts
import { createBrowserClient as _create } from '@supabase/ssr'
export const createBrowserClient = () =>
  _create(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
```

```ts
// lib/supabase/admin.ts  (server-only — JANGAN import dari komponen client)
import 'server-only'
import { createClient } from '@supabase/supabase-js'
export const createAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
```

- [ ] **Step 10: Tulis `lib/economics.ts` + unit test (TDD)**

Tulis test dulu:
```ts
// tests/economics.test.ts
import { describe, it, expect } from 'vitest'
import { feeOf, netOf, PLATFORM_FEE, SELLER_SHARE, MIN_PAYOUT_USD } from '@/lib/economics'

describe('economics', () => {
  it('fee is 20% of gross', () => expect(feeOf(100)).toBe(20))
  it('net is 80% of gross', () => expect(netOf(100)).toBe(80))
  it('rounds to 2 decimals', () => expect(netOf(9.99)).toBe(7.99))
  it('constants', () => {
    expect(PLATFORM_FEE).toBe(0.2); expect(SELLER_SHARE).toBe(0.8); expect(MIN_PAYOUT_USD).toBe(50)
  })
})
```

- [ ] **Step 11: Jalankan test → gagal**

```bash
npx vitest run tests/economics.test.ts
```
Expected: FAIL (modul `@/lib/economics` belum ada).

- [ ] **Step 12: Implementasi `lib/economics.ts`**

```ts
// lib/economics.ts
export const PLATFORM_FEE = 0.2
export const SELLER_SHARE = 1 - PLATFORM_FEE // 0.8
export const MIN_PAYOUT_USD = 50
const r2 = (n: number) => Math.round(n * 100) / 100
export const feeOf = (gross: number) => r2(gross * PLATFORM_FEE)
export const netOf = (gross: number) => r2(gross * SELLER_SHARE)
```

Tambahkan `vitest.config.ts` dengan alias `@`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'
export default defineConfig({ resolve: { alias: { '@': path.resolve(__dirname, '.') } } })
```

- [ ] **Step 13: Jalankan test → lulus**

```bash
npx vitest run tests/economics.test.ts
```
Expected: 4 test PASS.

- [ ] **Step 14: Commit + push**

```bash
git add -A
git commit -m "feat: add Supabase schema, RLS policies, seed + economics lib

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push
```

---

### Task 3: Register + verifikasi email (Commit 3)

**Files:**
- Create: `lib/actions/auth.ts` (fungsi `registerUser`)
- Create: `app/(auth)/register/page.tsx`, `app/(auth)/verify-email/page.tsx`
- Create: `components/auth/AuthCard.tsx` (wrapper UI on-brand)
- Test: `tests/e2e/auth.spec.ts` (kasus register), `playwright.config.ts`

**Interfaces:**
- Consumes: `createServerClient()` dari Task 2.
- Produces: `registerUser(formData: FormData): Promise<{ error?: string }>` — Server Action; sukses → redirect `/verify-email`.

- [ ] **Step 1: Tulis Server Action `registerUser`**

```ts
// lib/actions/auth.ts
'use server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export async function registerUser(_prev: unknown, formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  if (!name || !email || password.length < 8) return { error: 'Lengkapi nama, email, dan password min. 8 karakter.' }
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    },
  })
  if (error) return { error: error.message }
  redirect('/verify-email')
}
```

- [ ] **Step 2: Tulis `AuthCard` (wrapper UI)**

```tsx
// components/auth/AuthCard.tsx
export function AuthCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-base-2/60 p-8 backdrop-blur">
        <h1 className="font-geist text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Tulis halaman Register (client form + useActionState)**

```tsx
// app/(auth)/register/page.tsx
'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { registerUser } from '@/lib/actions/auth'
import { AuthCard } from '@/components/auth/AuthCard'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, { error: undefined } as { error?: string })
  return (
    <AuthCard title="Buat akun" sub="Gratis. Belanja & jual model AI dalam satu akun.">
      <form action={action} className="space-y-4">
        <input name="name" placeholder="Nama lengkap" className="w-full rounded-lg border border-line bg-base px-4 py-3" />
        <input name="email" type="email" placeholder="Email" className="w-full rounded-lg border border-line bg-base px-4 py-3" />
        <input name="password" type="password" placeholder="Password (min. 8)" className="w-full rounded-lg border border-line bg-base px-4 py-3" />
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-accent py-3 font-semibold text-base disabled:opacity-60">
          {pending ? 'Memproses…' : 'Daftar'}
        </button>
        <p className="text-center text-sm text-muted">Sudah punya akun? <Link href="/login" className="text-accent">Masuk</Link></p>
      </form>
    </AuthCard>
  )
}
```

- [ ] **Step 4: Tulis halaman Verify Email**

```tsx
// app/(auth)/verify-email/page.tsx
import { AuthCard } from '@/components/auth/AuthCard'
export default function VerifyEmailPage() {
  return (
    <AuthCard title="Cek email kamu" sub="Kami kirim tautan verifikasi. Klik untuk mengaktifkan akun, lalu masuk.">
      <p className="text-sm text-muted">Tidak menerima email? Periksa folder spam atau coba daftar ulang.</p>
    </AuthCard>
  )
}
```

- [ ] **Step 5: Konfigurasi Playwright + tulis E2E register (TDD)**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true },
})
```

```ts
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'
test('register menampilkan halaman verifikasi email', async ({ page }) => {
  await page.goto('/register')
  await page.fill('input[name=name]', 'Tester')
  await page.fill('input[name=email]', `t${Date.now()}@nexora.ai`)
  await page.fill('input[name=password]', 'Demo1234!')
  await page.click('button:has-text("Daftar")')
  await expect(page.getByText('Cek email kamu')).toBeVisible()
})
```

- [ ] **Step 6: Jalankan E2E**

```bash
npx playwright install --with-deps chromium
npx playwright test tests/e2e/auth.spec.ts
```
Expected: test PASS (Supabase lokal mengirim email ke Inbucket; redirect ke `/verify-email`).

- [ ] **Step 7: Commit + push**

```bash
git add -A
git commit -m "feat: real registration with email verification (Supabase Auth)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push
```

---

### Task 4: Login + logout + middleware penjaga sesi (Commit 4)

**Files:**
- Create: `middleware.ts`, `lib/supabase/middleware.ts`
- Modify: `lib/actions/auth.ts` (tambah `signIn`, `signOut`)
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(account)/layout.tsx` (guard server-side), `app/(account)/dashboard/page.tsx` (placeholder)
- Test: tambah kasus login + guard ke `tests/e2e/auth.spec.ts`

**Interfaces:**
- Consumes: `registerUser` (Task 3), `createServerClient` (Task 2).
- Produces:
  - `signIn(_prev, formData): Promise<{ error?: string }>` — sukses redirect `/dashboard`.
  - `signOut(): Promise<void>` — redirect `/login`.
  - `middleware.ts` — refresh sesi + redirect: belum login & akses `/(account)`/`/admin` → `/login`.

- [ ] **Step 1: Helper middleware Supabase (refresh sesi)**

```ts
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const protectedPrefix = ['/dashboard', '/cart', '/checkout', '/wishlist', '/orders', '/settings', '/sell', '/admin']
  if (!user && protectedPrefix.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }
  return response
}
```

- [ ] **Step 2: `middleware.ts` root**

```ts
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
export async function middleware(request: NextRequest) { return updateSession(request) }
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }
```

- [ ] **Step 3: Tambah `signIn` & `signOut` ke `lib/actions/auth.ts`**

```ts
// (tambahan di lib/actions/auth.ts)
export async function signIn(_prev: unknown, formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Email atau password salah.' }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 4: Halaman Login**

```tsx
// app/(auth)/login/page.tsx
'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { AuthCard } from '@/components/auth/AuthCard'

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, { error: undefined } as { error?: string })
  return (
    <AuthCard title="Masuk" sub="Selamat datang kembali di Nexora AI.">
      <form action={action} className="space-y-4">
        <input name="email" type="email" placeholder="Email" className="w-full rounded-lg border border-line bg-base px-4 py-3" />
        <input name="password" type="password" placeholder="Password" className="w-full rounded-lg border border-line bg-base px-4 py-3" />
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-accent py-3 font-semibold text-base disabled:opacity-60">
          {pending ? 'Memproses…' : 'Masuk'}
        </button>
        <p className="text-center text-sm text-muted">Belum punya akun? <Link href="/register" className="text-accent">Daftar</Link></p>
        <p className="text-center text-sm"><Link href="/forgot-password" className="text-muted hover:text-accent">Lupa password?</Link></p>
      </form>
    </AuthCard>
  )
}
```

- [ ] **Step 5: Guard layout `(account)` + dashboard placeholder**

```tsx
// app/(account)/layout.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="font-geist font-bold">Nexora <span className="text-accent">AI</span></span>
        <form action={signOut}><button className="text-sm text-muted hover:text-accent">Keluar</button></form>
      </header>
      <div className="p-6">{children}</div>
    </div>
  )
}
```

```tsx
// app/(account)/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
export default async function Dashboard() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user!.id).single()
  return <h1 className="font-geist text-2xl font-bold">Halo, {profile?.name || 'Pengguna'} 👋</h1>
}
```

- [ ] **Step 6: Tambah E2E login + guard**

```ts
// tambahan di tests/e2e/auth.spec.ts
test('guard: akses /dashboard tanpa login → redirect /login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
test('login akun demo → dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name=email]', 'user@nexora.ai')
  await page.fill('input[name=password]', 'Demo1234!')
  await page.click('button:has-text("Masuk")')
  await expect(page.getByText('Halo,')).toBeVisible()
})
```

- [ ] **Step 7: Jalankan E2E**

```bash
npx playwright test tests/e2e/auth.spec.ts
```
Expected: semua test (register, guard, login) PASS. (Pastikan akun demo sudah di-seed via `scripts/seed-users.mjs`.)

- [ ] **Step 8: Commit + push**

```bash
git add -A
git commit -m "feat: real login/logout + session-guard middleware

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push
```

---

### Task 5: Reset password + 2FA opsional (Commit 5)

**Files:**
- Modify: `lib/actions/auth.ts` (`requestPasswordReset`, `updatePassword`)
- Create: `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`
- Test: tambah kasus forgot-password ke `tests/e2e/auth.spec.ts`

**Interfaces:**
- Consumes: `createServerClient` (Task 2).
- Produces:
  - `requestPasswordReset(_prev, formData): Promise<{ error?: string; ok?: boolean }>`.
  - `updatePassword(_prev, formData): Promise<{ error?: string }>` — dipakai setelah klik tautan reset.

- [ ] **Step 1: Tambah action reset password**

```ts
// (tambahan di lib/actions/auth.ts)
export async function requestPasswordReset(_prev: unknown, formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const supabase = await createServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function updatePassword(_prev: unknown, formData: FormData) {
  const password = String(formData.get('password') || '')
  if (password.length < 8) return { error: 'Password min. 8 karakter.' }
  const supabase = await createServerClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  redirect('/dashboard')
}
```

- [ ] **Step 2: Halaman Forgot Password**

```tsx
// app/(auth)/forgot-password/page.tsx
'use client'
import { useActionState } from 'react'
import { requestPasswordReset } from '@/lib/actions/auth'
import { AuthCard } from '@/components/auth/AuthCard'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, {} as { error?: string; ok?: boolean })
  return (
    <AuthCard title="Lupa password" sub="Masukkan email, kami kirim tautan untuk atur ulang.">
      {state?.ok ? (
        <p className="text-sm text-accent">Tautan reset terkirim. Cek email kamu.</p>
      ) : (
        <form action={action} className="space-y-4">
          <input name="email" type="email" placeholder="Email" className="w-full rounded-lg border border-line bg-base px-4 py-3" />
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button disabled={pending} className="w-full rounded-lg bg-accent py-3 font-semibold text-base disabled:opacity-60">
            {pending ? 'Mengirim…' : 'Kirim tautan reset'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
```

- [ ] **Step 3: Halaman Reset Password**

```tsx
// app/(auth)/reset-password/page.tsx
'use client'
import { useActionState } from 'react'
import { updatePassword } from '@/lib/actions/auth'
import { AuthCard } from '@/components/auth/AuthCard'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, {} as { error?: string })
  return (
    <AuthCard title="Atur password baru">
      <form action={action} className="space-y-4">
        <input name="password" type="password" placeholder="Password baru (min. 8)" className="w-full rounded-lg border border-line bg-base px-4 py-3" />
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-accent py-3 font-semibold text-base disabled:opacity-60">
          {pending ? 'Menyimpan…' : 'Simpan password'}
        </button>
      </form>
    </AuthCard>
  )
}
```

- [ ] **Step 4: E2E forgot-password (form submit → konfirmasi)**

```ts
// tambahan di tests/e2e/auth.spec.ts
test('forgot password menampilkan konfirmasi terkirim', async ({ page }) => {
  await page.goto('/forgot-password')
  await page.fill('input[name=email]', 'user@nexora.ai')
  await page.click('button:has-text("Kirim tautan reset")')
  await expect(page.getByText('Tautan reset terkirim')).toBeVisible()
})
```

- [ ] **Step 5: Jalankan seluruh E2E auth + build**

```bash
npx playwright test tests/e2e/auth.spec.ts
npm run build
```
Expected: semua test auth PASS; build bersih.

- [ ] **Step 6: Commit + push**

```bash
git add -A
git commit -m "feat: password reset flow (request + update)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push
```

> Catatan 2FA (TOTP): Supabase Auth mendukung MFA via `supabase.auth.mfa.enroll({ factorType: 'totp' })`. Diaktifkan opsional di halaman Settings pada **Plan D** (bukan blocker Fase 1 auth dasar).

---

## Self-Review

**1. Spec coverage (vs §2 & §9 spec):**
- Register/verifikasi/login/logout → Task 3 & 4. ✅
- Data dari Postgres (bukan localStorage) → skema Task 2; auth pakai DB. ✅
- Dua role + RLS → Task 2 (`user_role`, policies, `is_admin()`). ✅
- Reset password (+2FA opsional) → Task 5. ✅
- Per fitur = 1 commit + push → tiap Task diakhiri commit+push. ✅
- Commit 6–17 (marketplace/seller/admin/polish) → **bukan** lingkup Plan A; ditangani Plan B/C/D.

**2. Placeholder scan:** Tidak ada "TBD/TODO". Placeholder Home & dashboard memang sengaja (diisi Plan B), bukan plan-failure — keduanya berisi kode lengkap yang build.

**3. Type consistency:** `createServerClient`/`createBrowserClient`/`createAdminClient` konsisten dipakai. Server Action signature `(_prev, formData)` konsisten dengan `useActionState`. `feeOf`/`netOf` konsisten antara test & implementasi.

---

## Catatan eksekusi

- Sebelum mulai: pastikan Docker hidup (untuk `supabase start`).
- Akun demo di-seed lewat `scripts/seed-users.mjs` (Task 2 Step 8) — perlu dijalankan ulang setiap `supabase db reset`.
- Plan B (commit 6–9) ditulis setelah Plan A selesai & direview.
