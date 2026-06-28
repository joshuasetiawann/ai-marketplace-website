# Nexora AI — Migrasi ke Next.js + Supabase (Fase 1: Fondasi Produksi)

**Tanggal:** 2026-06-28
**Status:** Disetujui (desain) — menunggu review spec sebelum rencana implementasi
**Pemilik:** Joshua Setiawan

---

## 1. Ringkasan

Nexora AI saat ini adalah prototipe SPA (React + Vite + Tailwind) dengan "backend" palsu:
seluruh data (user, sesi, cart, order, penjualan, payout) disimpan di `localStorage`
browser lewat `src/data/db.js`, dan password disimpan **plaintext**. Tidak ada server,
tidak ada database, tidak ada autentikasi sungguhan.

Spec ini mendefinisikan **Fase 1**: mengubahnya menjadi aplikasi **production-ready** dan
**scalable** — **Next.js (App Router) + Supabase (Postgres, Auth, RLS, Storage)** — dengan
**login asli**, **database asli**, dan **akses berbasis role yang dipaksakan di database**.

Tujuannya tetap mempertahankan tampilan & UX yang sudah ada ("Precision Luxury"), dan
membuat produk ini layak dijual sebagai template e-commerce (gaya Shopee/Tokopedia).

## 2. Tujuan & kriteria sukses

Fase 1 dianggap selesai bila:

1. Pengguna bisa **register → verifikasi email → login → logout** dengan kredensial asli
   (password di-hash oleh Supabase Auth, bukan plaintext).
2. Semua data dibaca/ditulis dari **Postgres**, bukan `localStorage`.
3. **Dua role** berfungsi: `user` (belanja + Buka Toko untuk jualan) dan `admin`.
   Pemisahan akses **dipaksakan oleh Row-Level Security (RLS)** di database, bukan sekadar
   disembunyikan di UI.
4. Alur belanja utuh jalan dari DB: jelajah → detail → keranjang → checkout
   (**pembayaran simulasi**) → order tercatat → riwayat order.
5. Alur jualan utuh jalan: **Buka Toko** → CRUD produk → moderasi admin → buku besar
   penjualan → earnings → **request payout (simulasi)**.
6. Panel **Admin** terpisah (`/admin`) hanya bisa diakses `role=admin` (dijaga di server).
7. Aplikasi build bersih (`next build`) dan alur kunci lulus uji E2E.
8. Tiap fitur didorong sebagai **satu commit** dan **di-push ke GitHub** per commit.

## 3. Lingkup

### Termasuk (Fase 1)
- Scaffold Next.js App Router + TypeScript + Tailwind, port design system lama.
- Supabase: skema DB, migrasi SQL, RLS, seed katalog & akun demo, Storage bucket.
- Auth lengkap: register, verifikasi email, login/logout, reset password, 2FA (TOTP) opsional.
- Port seluruh fitur inti marketplace + seller + admin ke database.
- Pembayaran **simulasi** (order dibuat, status `paid` di-set server).
- Testing (RLS, unit ekonomi, E2E alur kunci) + README/env example.

### TIDAK termasuk (fase berikutnya)
- **Fase 2:** Payment gateway asli (Midtrans/Xendit), webhook, pencairan payout nyata.
- **Fase 3:** SEO lanjutan, email transaksional kustom, rate-limit, observability, CI/CD.
- Dokumen/prompt jualan untuk developer (diurus pemilik sendiri).

## 4. Keputusan arsitektur

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js App Router + TypeScript | Standar produksi e-commerce, SSR/SEO, Server Actions, scalable di Vercel |
| Backend/DB | Supabase (Postgres + Auth + RLS + Storage) | Auth & DB terkelola, RLS untuk keamanan role, mudah dipasang pembeli template |
| Model role | 2 role: `user`, `admin` | Satu akun belanja + jualan (Buka Toko); admin = pemilik/developer platform |
| Pembayaran | Simulasi (Fase 1) | Prioritas auth+DB; gateway asli butuh akun merchant → Fase 2 |
| Admin app | Digabung ke `/admin` route group (bukan build terpisah) | Lebih standar & simpel daripada 2 build Vite terpisah |
| Strategi migrasi | Irisan vertikal bertahap di branch terpisah | Selalu ada app yang jalan; risiko rendah; mudah direview |
| Styling/komponen | Port `tailwind.config`, font `@fontsource`, ikon, `ModelArtwork` apa adanya | Pertahankan tampilan "Precision Luxury" |

## 5. Struktur aplikasi

```
app/
  (marketplace)/            # publik + user login
    page.tsx                #   Home
    explore/ categories/ creators/ creators/[handle]/
    product/[id]/           #   Detail produk (Server Component → SEO)
    pricing/ about/ help/
  (account)/                # WAJIB login (role=user)
    dashboard/ cart/ checkout/ wishlist/ orders/ settings/
    sell/                   #   "Mode Penjual" (muncul setelah Buka Toko)
      overview/ products/ products/new/ sales/ earnings/ payouts/ store/
  (admin)/admin/            # WAJIB role=admin (middleware + RLS)
    overview/ users/ products/ sales/ payouts/ reports/
  (auth)/                   # login/ register/ verify-email/ forgot-password/
  layout.tsx, not-found.tsx
middleware.ts               # refresh sesi Supabase + penjaga route
lib/
  supabase/server.ts        # client server (cookies, @supabase/ssr)
  supabase/client.ts        # client browser
  supabase/admin.ts         # service-role client (server-only, ops sensitif)
  economics.ts              # PLATFORM_FEE, SELLER_SHARE, MIN_PAYOUT, helper murni
  actions/                  # Server Actions (mutasi)
components/                 # port: Navbar, MobileNav, ModelCard, ModelArtwork, dst.
supabase/
  migrations/               # SQL migrasi (skema, RLS, fungsi)
  seed.sql                  # seed katalog + akun demo
styles/, public/
```

**Pemisahan menu:** layout `(account)` menampilkan menu belanja. Setelah Buka Toko,
muncul grup menu `sell/*` (penjual). `(admin)` benar-benar terpisah dan hanya untuk admin.

## 6. Model data (Postgres)

Skema mengikuti entitas yang sudah ada di `src/data/db.js`. Harga disimpan dalam **USD**
(`price_usd`), tampilan Rupiah dihitung di UI seperti sekarang.

### profiles  (1:1 dengan `auth.users`)
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK → `auth.users.id` | |
| name | text | |
| role | text `user`/`admin` | default `user` |
| is_seller | boolean | true setelah Buka Toko |
| art | text[2] | warna avatar |
| two_factor | boolean | |
| created_at | timestamptz | |

### stores  (1:1 dengan profile, nullable sampai Buka Toko)
owner_id (uuid, unik) · name · handle (unik) · tagline · category ·
payout_bank · payout_account_masked · payout_status (`none`/`verified`)

### products
owner_id (uuid, nullable untuk katalog "rumah") · name · tagline · category ·
use_cases (text[]) · use_case_tags (text[]) · tier (`Free`/`Pro`/`Enterprise`) ·
price_usd (numeric) · icon · art (text[]) · description · capabilities (jsonb) ·
specs (jsonb) · gallery (int) · status (`draft`/`under_review`/`published`/`rejected`) ·
rating (numeric) · reviews_count (int) · creator_id · created_at · updated_at

### cart_items / wishlist_items / recently_viewed
(user_id, product_id, …); `cart_items` punya `qty`; `recently_viewed` punya `viewed_at`.
Primary key komposit (user_id, product_id) untuk cart/wishlist.

### orders / order_items
- **orders:** buyer_id · status (`pending`/`paid`/`failed`) · method · total_usd ·
  contact (jsonb) · created_at
- **order_items:** order_id · product_id · name · price_usd · qty · art · icon (snapshot)

### sales  (buku besar pendapatan — sumber kebenaran)
order_id · product_id · product_name · seller_id · buyer_id · buyer_name · qty ·
gross · fee · net · status (`paid`) · method · created_at

### payouts
seller_id · amount_usd · amount_idr · bank · account_masked ·
status (`processing`/`paid`/`rejected`) · requested_at · paid_at

### reviews
product_id · author_id · rating (int 1–5) · body · created_at

### preferences
user_id (PK) · interests (text[])

**Seed:** katalog `MODELS` (sekarang di `models.js`) + akun demo (1 user, 1 admin) dimuat
lewat `supabase/seed.sql`. Ekonomi: `PLATFORM_FEE=0.20`, `SELLER_SHARE=0.80`,
`MIN_PAYOUT_USD=50`.

## 7. Autentikasi & keamanan

- **Supabase Auth** — email+password, verifikasi email, reset password, MFA/TOTP opsional.
  Password di-hash Supabase (Argon2). Tidak ada lagi plaintext.
- **Sesi** — cookie httpOnly via `@supabase/ssr`; `middleware.ts` me-refresh sesi tiap
  request dan menjaga route (redirect ke `/login` bila perlu; tolak non-admin di `/admin`).
- **RLS = pertahanan utama** (dipaksakan di Postgres, bukan UI):
  - `profiles`: baca publik terbatas; update hanya milik sendiri; admin update siapa pun.
  - `products`: `published` boleh dibaca siapa pun; owner baca/tulis miliknya (status apa pun);
    admin baca/tulis semua (moderasi).
  - `cart_items`/`wishlist_items`/`recently_viewed`/`preferences`: hanya pemilik.
  - `orders`/`order_items`: buyer lihat miliknya; admin semua.
  - `sales`: seller lihat `seller_id = auth.uid()`; admin semua.
  - `payouts`: seller miliknya; admin semua.
  - `reviews`: baca publik; tulis hanya untuk produk yang dibeli; edit/hapus milik sendiri.
- **Operasi sensitif via server** (Server Action / RPC `SECURITY DEFINER`), tak dipercayakan
  ke browser:
  - `confirm_order_paid(order_id)` — simulasi bayar: set `paid` + buat baris `sales` (split fee/net).
  - `open_store(...)` — set `is_seller=true`, buat `stores`.
  - `submit_product` / `moderate_product(approve|reject)` (admin).
  - `request_payout(amount)` — cek saldo tersedia ≥ min, buat payout `processing`.
  - `set_user_role(...)` — hanya admin.
- **Service-role key** hanya dipakai di server (`lib/supabase/admin.ts`), tidak pernah
  ke client. Env disimpan via `.env.local` / Vercel env.

## 8. Server Actions / RPC (daftar)

`registerUser`, `signIn`, `signOut`, `resendVerification`, `requestPasswordReset`,
`enrollMFA` · `addToCart/updateQty/removeFromCart`, `toggleWishlist`, `recordRecentlyViewed`
· `checkout` → `confirm_order_paid` · `openStore`, `saveStore` · `createProduct`,
`updateProduct`, `deleteProduct`, `submitForReview` · `requestPayout`, `savePayoutAccount`
· `moderateProduct`, `setUserRole`, `processPayout` (admin) · `postReview`.

## 9. Rencana fitur → commit

Tiap baris = **satu commit + push** (sesuai aturan kerja pemilik). Tiap commit
meninggalkan app yang tetap bisa di-build.

| # | Commit | Hasil |
|---|---|---|
| 1 | Scaffold Next.js + Tailwind + port design system/font/ikon | App kosong tampil on-brand |
| 2 | Supabase: skema + RLS + seed katalog/akun (migrasi SQL) | DB siap, katalog ada |
| 3 | Auth: register + verifikasi email | Bisa daftar, email verifikasi terkirim |
| 4 | Auth: login + logout + middleware penjaga sesi | Login asli, route terjaga |
| 5 | Auth: forgot/reset password (+ 2FA opsional) | Pemulihan akun |
| 6 | Katalog: Home + Explore (filter/sort) dari DB | Jelajah produk nyata |
| 7 | Detail produk (SSR) + review | Halaman produk + ulasan |
| 8 | Keranjang + wishlist (server actions) | Simpan ke DB per user |
| 9 | Checkout + order (bayar simulasi) + riwayat order | Alur beli utuh |
| 10 | Buka Toko (jadi seller) + halaman toko | Jadi penjual |
| 11 | Seller: CRUD produk + submit moderasi | Kelola listing |
| 12 | Seller: buku besar penjualan + earnings | Lihat pendapatan |
| 13 | Seller: request payout (simulasi) | Tarik saldo (simulasi) |
| 14 | Admin: moderasi produk (approve/reject) | Kurasi katalog |
| 15 | Admin: kelola user + laporan + payout | Operasi platform |
| 16 | Settings + perangkat/sesi + halaman statis + 404 | Kelengkapan |
| 17 | Polish: skeleton/toast/responsif + README & env example | Siap rilis |

## 10. Testing & verifikasi

- **RLS/migrasi:** Supabase CLI lokal; uji policy sebagai anon vs user vs admin.
- **Unit:** fungsi ekonomi (`fee`/`net`/`available`/validasi payout) — fungsi murni.
- **E2E (Playwright):** daftar→login→beli; buka toko→jual→payout; admin moderasi.
- **Build gate:** `next build` + render route utama harus lulus **sebelum push** tiap commit.

## 11. Environment & deployment

`.env.local` (+ Vercel env): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (server-only), `NEXT_PUBLIC_SITE_URL`.
`.env.example` disertakan untuk pembeli template. Deploy target: Vercel + Supabase.

## 12. Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Migrasi besar memakan waktu | Irisan vertikal; tiap commit app tetap jalan |
| RLS salah → kebocoran data | Uji policy per-role eksplisit sebelum lanjut |
| Operasi sensitif dipalsukan client | Semua via Server Action/RPC `SECURITY DEFINER` + service-role server-only |
| Kehilangan tampilan saat port | Port design system & komponen apa adanya, bandingkan visual |
| Pembeli template kesulitan setup | `.env.example` + README + migrasi/seed otomatis |

## 13. Definition of Done (Fase 1)

Semua kriteria di §2 terpenuhi; 17 commit terdorong & ter-push; `next build` bersih;
uji E2E alur kunci hijau; README + `.env.example` ada; RLS lulus uji per-role.
