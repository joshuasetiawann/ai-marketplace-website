# Nexora v2 Redesign ("Revisi Design FINAL") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the "Revisi Design — AI Marketplace (Nexora AI) v2" mockup to the existing Next.js app: darker blue-black theme, blueprint-grid texture, mono eyebrows, new page compositions for Beranda / Jelajahi / Detail / Keranjang / Auth / Seller Studio (gold) / Admin Console — without changing any server action, RPC, route, or data behavior.

**Architecture:** This is a *retheme + layout restructure*, not a rebuild. The app already uses the same brand primitives (cyan `#00E5FF` accent, gold `#E9C349`, Inter + Geist Mono via `next/font`, `lib/pricing.ts` IDR display). Work flows: (1) design source-of-truth committed into `docs/design/v2/`, (2) token layer in `app/globals.css` updated in place so every page inherits the new palette, (3) shell (Topbar/Navbar/Footer), (4) page-by-page restyle reusing existing components/actions.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 `@theme` tokens, existing components in `components/`, Playwright (visual check + e2e).

## Global Constraints

- **Design source of truth:** mockup file committed at `docs/design/v2/nexora-v2-mockup.html`; per-frame copy at `docs/design/v2/text-*.txt`; extracted tokens at `docs/design/v2/tokens.json`. Frame screenshots are regenerated on demand with `node scripts/design-shots.mjs` (never committed).
- **Palette (exact):** page bg `#0a0b0d`; cards `#101115` / `#121317`; elevated `#16181d`; borders `rgba(255,255,255,0.06)`; text `#eef1f2`, secondary `#9aa6a9`, muted `#6d7679`; accent cyan `#00e5ff` (on-accent `#00363d`); gold `#e9c349` (Seller Studio + Enterprise tier); success `#7ee0a8`; error `#ff9a8f`.
- **Category artwork gradients (exact):** `radial-gradient(circle at 62% 22%, <tint>, <deep> 46%, #08090b 100%)` with tints — vision/cyan `rgba(0,229,255,.34)/rgba(11,58,68,.62)`, video/purple `rgba(168,85,247,.32)/rgba(42,14,58,.62)`, code/blue `rgba(59,130,246,.34)/rgba(16,35,58,.62)`, data/green `rgba(52,211,153,.30)/rgba(7,39,31,.62)`, language/indigo `rgba(99,102,241,.32)/rgba(30,27,75,.62)`, audio/teal `rgba(34,211,238,.30)/rgba(11,58,68,.62)`.
- **Copy:** Bahasa Indonesia, verbatim from `docs/design/v2/text-*.txt` wherever a mockup string exists.
- **Pricing:** DB stays USD; display via existing `toIDR`/`formatIDR`/`formatIDRShort` (`lib/pricing.ts`). **No `/bln` suffix** — the app sells one-time purchases, not subscriptions; render the price alone + tier pill (deliberate deviation from mockup).
- **No behavior changes:** every server action, RPC, route path, form name, and guard stays as-is. Restyle markup/classes only; adding *static* marketing sections (stats band, marquee, Core Engine panel) is allowed.
- **Fonts:** already wired (`--font-inter`, `--font-geist-mono` in `app/layout.tsx`) — do not re-add.
- **Process:** work directly on `main` (user rule — no new branches); one task = one commit, `git push` after each; `npx tsc --noEmit` + `npm run lint` clean before every commit. Never `git add -A` (untracked `.github/workflows/ci.yml` must stay unpushed).
- **Verification:** visual check per task via dev server on port 3100 + `scripts/design-shots.mjs`-style screenshot; full `npm run test:e2e` (8/8) in the final task. If a copy change breaks an e2e selector, update the spec to the new mockup string in the same task.

## File Structure

```
docs/design/v2/nexora-v2-mockup.html   ← moved from repo root (git mv-style)
docs/design/v2/tokens.json             ← extracted computed-style tokens
docs/design/v2/text-{beranda,jelajahi,detail,cart,auth,seller,admin}.txt
scripts/design-shots.mjs               ← renders mockup → per-frame PNGs (scratch output)
app/globals.css                        ← token values + primitives updated IN PLACE
components/Topbar.tsx                  ← NEW  status strip above navbar
components/Navbar.tsx                  ← v2 restyle (search pill ⌘K, cart badge, Daftar CTA)
components/Footer.tsx                  ← v2 restyle (4 columns + bottom bar)
components/SectionHeader.tsx           ← NEW  mono eyebrow + h2 + sub + right action
components/StatsBand.tsx               ← NEW  4 stat tiles (Beranda)
components/BrandMarquee.tsx            ← NEW  scrolling creator names
components/ModelCard.tsx               ← v2 card anatomy
components/ModelArtwork.tsx            ← v2 radial-gradient artwork + category icon
app/(marketplace)/page.tsx             ← Beranda v2 composition
components/HeroSearch.tsx              ← v2 hero search + chips
components/ExploreClient.tsx           ← Jelajahi v2 (filter rail + toolbar + grid)
components/ProductDetailClient.tsx     ← Detail v2
app/(marketplace)/model/[id]/page.tsx  ← Detail v2 server parts
components/CartClient.tsx              ← Keranjang v2
components/CheckoutClient.tsx          ← Checkout v2 (payment-method visuals)
app/(auth)/layout.tsx                  ← NEW  split-screen auth shell
app/(auth)/{login,register,forgot-password,reset-password,login/2fa}/page.tsx
components/SellerNav.tsx + app/(account)/sell/**  ← Seller Studio v2 (gold)
components/AdminNav.tsx + app/(admin)/admin/**    ← Admin Console v2
components/MobileNav.tsx               ← v2 mobile polish
tests/e2e/*.spec.ts                    ← selector updates only where copy changed
```

Each task below ends in exactly one commit. Steps within a task: edit → `npx tsc --noEmit` + `npm run lint` → visual check on :3100 → commit + push.

---

### Task R1: Design source-of-truth + v2 token layer

**Files:**
- Create: `docs/design/v2/` (mockup html moved from repo root, `tokens.json`, 7 × `text-*.txt` — copy from scratchpad `shots/`)
- Create: `scripts/design-shots.mjs` (generalize the scratchpad script: args = mockup path + out dir; import `playwright-core` relatively so it runs from repo root)
- Modify: `app/globals.css` — `@theme` neutrals + utilities only; accent/gold/success tokens keep their names

**Interfaces:**
- Produces (used by every later task): updated meaning of existing utility classes `.glass-panel` (v2 card: `#101115` + `rgba(255,255,255,0.06)` border), `.surface-card` (`#121317`), `.glass-nav`; NEW utilities `.eyebrow-mono` (Geist Mono 11px, `letter-spacing:.14em`, uppercase, cyan), `.tier-pill`, `.tier-pill-pro`, `.tier-pill-enterprise`, `.tier-pill-free`, `.blueprint-grid` (44px grid lines `rgba(255,255,255,0.024)`), `.glow-cyan` (`box-shadow: 0 0 14px rgba(0,229,255,.28)`).

- [ ] **Step 1: Move + commit design artifacts.** `mkdir -p docs/design/v2 && git mv` is not possible (untracked) — `mv "Revisi Design AI Marketplace FINAL.html" docs/design/v2/nexora-v2-mockup.html`; copy `tokens.json` and the 7 `text-*.txt` from the scratchpad shots dir; write `scripts/design-shots.mjs`.
- [ ] **Step 2: Update `@theme` neutrals in `app/globals.css`:**

```css
--color-background: #0a0b0d;
--color-surface: #0a0b0d;
--color-surface-dim: #08090b;
--color-surface-bright: #26282d;
--color-surface-container-lowest: #08090b;
--color-surface-container-low: #101115;
--color-surface-container: #121317;
--color-surface-container-high: #16181d;
--color-surface-container-highest: #1c1e24;
--color-surface-variant: #1c1e24;
--color-on-surface: #eef1f2;
--color-on-surface-variant: #9aa6a9;
--color-on-background: #eef1f2;
--color-inverse-surface: #eef1f2;
--color-inverse-on-surface: #101115;
--color-outline: #6d7679;
--color-outline-variant: #262a2e;
--color-error: #ff9a8f;
/* aliases */
--color-base: #0a0b0d;
--color-base-2: #08090b;
--color-ink: #eef1f2;
--color-muted: #9aa6a9;
--color-line: rgba(255, 255, 255, 0.06);
```

- [ ] **Step 3: Update body background + primitives** (same file, below `@theme`):

```css
body {
  background-color: #0a0b0d;
  background-image:
    radial-gradient(circle at 15% 0%, rgba(0, 229, 255, 0.05), transparent 34%),
    radial-gradient(circle at 100% 100%, rgba(0, 229, 255, 0.035), transparent 34%);
}
.blueprint-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.024) 1px, transparent 1px);
  background-size: 44px 44px;
}
.glass-panel { background: rgba(16, 17, 21, 0.78); border-color: rgba(255, 255, 255, 0.06); }
.glass-nav { background: rgba(10, 11, 13, 0.72); }
.surface-card { background: #121317; border: 1px solid rgba(255, 255, 255, 0.06); }
.eyebrow-mono {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-primary-container);
}
.glow-cyan { box-shadow: 0 0 14px rgba(0, 229, 255, 0.28); }
.tier-pill {
  display: inline-flex; align-items: center; gap: 4px; border-radius: 9999px;
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
  padding: 3px 9px; border: 1px solid;
}
.tier-pill-pro { color: #00e5ff; border-color: rgba(0, 229, 255, 0.35); background: rgba(0, 229, 255, 0.1); }
.tier-pill-enterprise { color: #e9c349; border-color: rgba(233, 195, 73, 0.35); background: rgba(233, 195, 73, 0.1); }
.tier-pill-free { color: #9aa6a9; border-color: rgba(255, 255, 255, 0.14); background: rgba(255, 255, 255, 0.04); }
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit && npm run lint`; start dev on 3100, screenshot `/`, confirm darker bg everywhere and nothing unreadable.
- [ ] **Step 5: Commit** `feat(design): v2 token layer + design source-of-truth in docs/design/v2` — stage explicitly (`git add docs/design scripts/design-shots.mjs app/globals.css`), push.

### Task R2: Shell v2 — Topbar, Navbar, Footer

**Files:**
- Create: `components/Topbar.tsx`
- Modify: `components/Navbar.tsx`, `components/Footer.tsx`, `components/MobileNav.tsx` (only if nav-link list changes), `app/layout.tsx` (mount Topbar above Navbar)

**Interfaces:**
- Consumes: R1 utilities. Produces: none new — same component names/props.

- [ ] **Step 1: Topbar** — full-width strip, `border-b hairline`, `bg-[#08090b]`, `.eyebrow-mono` at 10px: left `✳ SEMUA SISTEM OPERASIONAL · 99,99% UPTIME` (✳ in cyan, `text-on-surface-variant` for the rest); right `QRIS · VIRTUAL ACCOUNT · E-WALLET` + link `Bantuan` → `/help`. Hidden on `< md`.
- [ ] **Step 2: Navbar v2** — keep all existing links/behavior (auth state, cart count, wishlist). Restyle: logo `Nexora` white + `AI` cyan; center links `Jelajahi Kategori Kreator Harga` 13px `text-on-surface-variant hover:text-on-surface`; search opens `/explore?q=` as today but styled as a pill (`surface-card`, magnifier icon, placeholder `Cari model…`, kbd chip `⌘K` in mono); cart icon with cyan count badge; `Masuk` ghost text link + `Daftar →` `.btn-primary` pill.
- [ ] **Step 3: Footer v2** — 4 columns per `text-beranda.txt`: brand block (logo + "Marketplace digital premium untuk model AI kurasi berperforma tinggi. Precision luxury intelligence untuk para visioner." + 4 social icon buttons) / `MARKETPLACE` (Jelajahi Model, Kategori, Kreator, Harga) / `JUALAN` (Buka Toko, Seller Studio, Pusat Bantuan, Panduan) / `PERUSAHAAN` (Tentang Kami, Misi Kami, Admin Console, Kontak). Column headers `.eyebrow-mono`. Bottom bar: `© 2026 Nexora AI · Precision Luxury Intelligence` left; `Privasi Ketentuan Keamanan Dokumentasi` right. Map links to existing routes (`/explore`, `/categories`, `/creators`, `/pricing`, `/sell/start`, `/sell`, `/help`, `/about`, `/admin`, `/contact`); keep legal links pointing at `/help` if no page exists.
- [ ] **Step 4: Verify** tsc + lint + screenshot `/` top and bottom vs `frame-01.png`.
- [ ] **Step 5: Commit** `feat(design): v2 shell — topbar, navbar, footer`, push.

### Task R3: Beranda v2

**Files:**
- Modify: `app/(marketplace)/page.tsx`, `components/HeroSearch.tsx`, `components/ModelCard.tsx`, `components/ModelArtwork.tsx`
- Create: `components/SectionHeader.tsx`, `components/StatsBand.tsx`, `components/BrandMarquee.tsx`

**Interfaces:**
- Produces: `SectionHeader({eyebrow, title, sub, action}: {eyebrow: string; title: ReactNode; sub?: string; action?: ReactNode})`; `ModelCard` keeps its current props (product row) — internal anatomy only changes; `StatsBand()` and `BrandMarquee()` take no props (static content).

- [ ] **Step 1: Hero** (in `page.tsx` + `HeroSearch.tsx`): centered; badge pill `✦ MARKETPLACE AI GENERASI BARU  v2.0` (mono, cyan sparkle, `v2.0` in a nested cyan chip); h1 56–72px `Temukan AI yang pas untuk setiap ambisimu` with `AI` in cyan; sub paragraph with `belanja`/`jualan` in white; search bar (`surface-card` pill, placeholder `Coba 'model gambar 8K' atau 'asisten koding'…`, cyan `✨ Cari` submit → `/explore?q=`); chip row `Kreatif Bisnis Developer Belajar Gaya Hidup` linking to `/explore?q=<chip>`; trust row (5 overlapping gradient avatar dots + `★ 4,9 dari 120rb+ builder terpercaya`). Hero sits on `.blueprint-grid` + top cyan radial.
- [ ] **Step 2: StatsBand** — one `glass-panel` row, 4 cells split by hairlines; label `.eyebrow-mono` (`MODEL KURASI`, `BUILDER AKTIF`, `RATING RATA-RATA`, `UPTIME SLA`), value 28px semibold (`2.400+`, `120rb+`, `4,9★` gold star, `99,99%` in cyan).
- [ ] **Step 3: BrandMarquee** — one-line infinite scroll (CSS `@keyframes marquee`, duplicated list, `motion-reduce:animate-none`): SYNTHETIX LABS · AURA LABS · HELIX SYSTEMS · PIXELFORGE · ECHOLABS · NEURA STUDIO · VANTA AI (mono 11px, `text-muted`, edge fade masks).
- [ ] **Step 4: ModelCard v2 + ModelArtwork v2** — artwork block h-44: category radial gradient (Global Constraints table, key off existing category field) + faint `.blueprint-grid` + centered category icon (existing `Icon`); overlay top-left status pill (`⚡ TRENDING` cyan / `✓ VERIFIED` green `#7ee0a8`, mono 10px — derive: rating ≥ 4.9 → VERIFIED else TRENDING), top-right category name mono 10px uppercase. Body: name (semibold, truncate) + `★ 4,9` gold; description 2-line clamp `text-on-surface-variant`; divider; price row — `formatIDRShort(toIDR(price))` white semibold (or `Gratis` in cyan when 0) + right tier pill (`◆ Pro` / `⛨ Enterprise` / `Free` — map: price 0 → Free, ≥ 60 USD → Enterprise, else Pro). Keep wishlist/cart buttons + links exactly as today.
- [ ] **Step 5: Sections** in `page.tsx`, in order: hero → StatsBand → BrandMarquee → `SectionHeader eyebrow="// LIVE SEKARANG" title="Model Trending" sub="Kecerdasan paling powerful & populer minggu ini." action=<Link .btn-ghost>Lihat Semua →` + 4-col grid (existing trending query) → `// JELAJAHI  Telusuri per Kategori` 6 category cards (icon, name, `<n> model` count mono; reuse existing category data/counts if queryable, else the mockup's static counts) → Core Engine panel (`glass-panel` 2-col: left `// PRODUK UNGGULAN`, h2 `Nexora <i class=cyan>Core Engine</i>`, copy, 3 mono spec chips `~600ms latensi · 12B params · Multimodal`, `Jelajahi Engine →` btn-primary + `Lihat Harga` btn-ghost → `/explore` + `/pricing`; right: infinity glow artwork — CSS radial + ∞ glyph 96px cyan with `.glow-cyan`) → `// TERBARU  Baru Rilis` + 4-col grid (existing newest query) → Kreator CTA panel (left: `// UNTUK KREATOR`, h2 `Bangun, publikasikan & hasilkan dari model AI-mu`, copy, `Mulai Jualan 🚀` btn-primary → `/sell/start`, `Selengkapnya` btn-ghost → `/about`; right: 3 `surface-card` rows — `Bagi hasil 80% / Kamu simpan 80% dari tiap penjualan.`, `Pembayaran aman / QRIS, VA & e-wallet, cair otomatis.`, `Dashboard lengkap / Pantau penjualan & pencairan real-time.` with cyan icon tiles).
- [ ] **Step 6: Verify** tsc + lint; screenshot `/` full-page vs `frame-01.png`; e2e spec `marketplace.spec.ts:3` ("home shows trending catalog") still passes: `npx playwright test tests/e2e/marketplace.spec.ts`.
- [ ] **Step 7: Commit** `feat(design): Beranda v2 — hero, stats, marquee, card anatomy, core engine & creator CTA`, push.

### Task R4: Jelajahi v2

**Files:**
- Modify: `components/ExploreClient.tsx`, `app/(marketplace)/explore/page.tsx` (headings/frame only — keep server-side search/filter/sort/pagination wiring intact)

- [ ] **Step 1:** Page header: `.eyebrow-mono` `// KATALOG`, h1 `Jelajahi Model`, sub `Temukan model AI premium yang dikurasi untuk aplikasi berperforma tinggi.` (from `text-jelajahi.txt`).
- [ ] **Step 2:** Two-column layout: left sticky filter rail (~240px, `glass-panel`): `FILTER` mono header + `Hapus semua` reset; groups Kategori (existing checkboxes), Harga (existing range/brackets), Rating, Tier — same form state/URL params as today, restyled (cyan checkbox accent, mono group labels). Right: toolbar (`<n> model ditemukan` + sort select styled `surface-card`; keep options/param) + 3-col `ModelCard` grid + existing pagination restyled as pill buttons.
- [ ] **Step 3: Verify** tsc + lint; `npx playwright test tests/e2e/marketplace.spec.ts` (explore search + category-link specs must stay green); screenshot `/explore` vs `frame-03.png`.
- [ ] **Step 4: Commit** `feat(design): Jelajahi v2 — filter rail, toolbar, grid`, push.

### Task R5: Detail Produk v2

**Files:**
- Modify: `app/(marketplace)/model/[id]/page.tsx`, `components/ProductDetailClient.tsx`, `components/StarRating.tsx` (gold stars only if not already)

- [ ] **Step 1:** Breadcrumb `Jelajahi / <Kategori> / <Nama>` mono 11px. Two-column: left large artwork panel (category gradient + icon, gallery thumbnails strip below when `gallery` images exist — reuse fulfillment/gallery fields from ProductForm work); right sticky buy card (`glass-panel`): status pill row, h1 name, seller line + `★ 4,9 (n ulasan)`, `formatIDR(toIDR(price))` 32px, `+ Tambah ke Keranjang` btn-primary full-width + wishlist ghost, then mono spec mini-grid from product `specs` (fallback: params/latency/license rows), trust rows (`Pembelian sekali bayar, akses selamanya`, `Lisensi komersial`, `Update gratis dari kreator`).
- [ ] **Step 2:** Below: `Deskripsi` (prose), `Kemampuan` 2-col checklist (existing capabilities field, cyan check tiles), `Ulasan Pengguna` — big `4,9` + star + distribution bars (cyan fill) + review cards (avatar dot, name, `Verified` chip when verified-purchase, body). Keep review form + verified-purchase guard behavior untouched.
- [ ] **Step 3: Verify** tsc + lint; screenshot `/model/<seed-id>` vs `frame-05.png`; checkout e2e still passes (`npx playwright test tests/e2e/checkout.spec.ts` — it navigates via product page).
- [ ] **Step 4: Commit** `feat(design): Detail Produk v2 — gallery, buy card, kemampuan & ulasan`, push.

### Task R6: Keranjang & Checkout v2

**Files:**
- Modify: `components/CartClient.tsx`, `components/CheckoutClient.tsx`, `app/(marketplace)/checkout/page.tsx`

- [ ] **Step 1: Keranjang** — h1 `Keranjang` + `<n> item…` sub + `Hapus semua`; left: item rows (`surface-card`: 64px artwork thumb w/ category gradient, name, category mono, price IDR, remove ✕) — keep all handlers; right sticky `Ringkasan Pesanan` (`glass-panel`): Subtotal / PPN 11% / diskon promo (existing promo input restyled) / hairline / `Total` big cyan `formatIDR`; `Lanjut ke Pembayaran` btn-primary full width. Below: `Metode Pembayaran` strip — static logos/chips `QRIS · Virtual Account · E-Wallet · Kartu` (mono chips, informational only).
- [ ] **Step 2: Checkout** — same summary card language; keep simulated/provider-aware `placeOrder` flow, buttons, and promo wiring exactly; restyle states (pending spinner on cyan button, success panel with mono order id).
- [ ] **Step 3: Verify** tsc + lint; `npx playwright test tests/e2e/checkout.spec.ts` (full purchase must stay green); screenshots `/cart`, `/checkout` vs `frame-07.png`.
- [ ] **Step 4: Commit** `feat(design): Keranjang & Checkout v2`, push.

### Task R7: Auth v2 — split-screen shell

**Files:**
- Create: `app/(auth)/layout.tsx`
- Modify: `app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `login/2fa/page.tsx`, `components/auth/*` (styling only)

- [ ] **Step 1: layout.tsx** — min-h-screen 2-col: left brand panel (hidden `< lg`): logo, mono `// SATU AKUN DUA PERAN`, h2 `Belanja & jualan model AI dari satu tempat.`, copy `Akses ribuan model AI kurasi…` + 3 bullet rows from `text-auth.txt` (`Bagi hasil 80% untuk kreator`, `Pembayaran aman & instan`, `Kurasi kualitas oleh tim Nexora`), `.blueprint-grid` + cyan glow bg; right: centered form card (`glass-panel`, max-w-105).
- [ ] **Step 2:** Restyle each form page inside the card: heading (`Selamat datang kembali` for login; keep existing headings elsewhere), inputs (`surface-card`, cyan focus ring `focus:border-primary-container`), primary submit `.btn-primary` full-width (`Masuk →`), tab/link row `Masuk / Daftar`, `Lupa password?`, divider `atau lanjut dengan` + existing OAuth buttons if any. **Do not** rename form fields or actions; keep error `role=alert` regions.
- [ ] **Step 3: Verify** tsc + lint; `npx playwright test tests/e2e/auth.spec.ts` (4 specs green — update text selectors only if a heading string changed); screenshot `/login` vs `frame-09.png`.
- [ ] **Step 4: Commit** `feat(design): Auth v2 — split-screen shell + form restyle`, push.

### Task R8: Seller Studio v2 (gold)

**Files:**
- Modify: `components/SellerNav.tsx`, `app/(account)/sell/(studio)/{page,products,sales,earnings,payouts}/…`, `app/(account)/sell/start/page.tsx`, `components/OpenStoreForm.tsx`, `components/PayoutClient.tsx`, `components/SellerProductActions.tsx`, `components/ProductForm.tsx` (chrome only)

- [ ] **Step 1:** Studio chrome switches accent cyan → gold: store identity header (gold gradient avatar tile, store name + `✓ Terverifikasi` gold chip, `+ Produk Baru` gold button `background:#e9c349; color:#3c2f00`), gold tab nav. Add `.btn-gold` + `.glow-gold` (`box-shadow: 0 0 14px rgba(233,195,73,.4)`) to `globals.css`.
- [ ] **Step 2:** Overview: 4 stat cards (`Pendapatan`, `Saldo Tersedia`, `Penjualan`, `Produk Aktif` — mono labels, gold values where money) + `Tren Pendapatan Bersih` area chart restyled gold (existing chart) + `Pembelian Terbaru` / `Produk Terlaris` two-column lists per `frame-10.png`. Products/Sales/Earnings/Payouts tables: `surface-card` rows, mono numerals, gold accents; keep every action/RPC.
- [ ] **Step 3: Verify** tsc + lint; screenshot `/sell` (logged in as demo user with store) vs `frame-10.png`.
- [ ] **Step 4: Commit** `feat(design): Seller Studio v2 — gold accent chrome`, push.

### Task R9: Admin Console v2

**Files:**
- Modify: `components/AdminNav.tsx`, `app/(admin)/admin/**` pages, `components/Admin*Actions.tsx` (styling only)

- [ ] **Step 1:** Header `Moderasi Platform` + mono sub; 4 stat tiles (`Antrian Review`, `Dilaporkan`, `Kreator Aktif`, `Total Model` per `text-admin.txt`); moderation queue cards: product row (artwork thumb, name, kreator, mono submitted-at) + `Setujui` (cyan) / `Tolak` (error `#ff9a8f` outline) buttons — existing actions unchanged; same treatment for users/payouts/orders/messages tables.
- [ ] **Step 2: Verify** tsc + lint; screenshot `/admin` as `admin@nexora.ai` vs `frame-12.png`.
- [ ] **Step 3: Commit** `feat(design): Admin Console v2`, push.

### Task R10: Mobile polish + inherited pages sweep + full verification

**Files:**
- Modify: `components/MobileNav.tsx`, any page with mobile overflow; `app/(account)/{dashboard,orders,library,settings}/…`, static pages `categories/creators/pricing/about/help/contact` (token-consistency sweep only); `tests/e2e/*.spec.ts` if selectors drifted

- [ ] **Step 1:** Compare `mobile-row.png` frames: bottom mobile nav pill bar, hero scale, 1-col card grids, cart/detail stacking; fix regressions at 390px viewport (screenshot at 390×844).
- [ ] **Step 2:** Sweep inherited pages for leftover old-graphite hardcoded colors (`grep -rn "#131313\|#1c1b1b\|#0e0e0e\|#201f1f" app components`) → replace with tokens.
- [ ] **Step 3: Full verification** — `npx tsc --noEmit && npm run lint && npm run test:e2e` → 8/8; fresh `supabase db reset` + `npm run seed:users` first.
- [ ] **Step 4: Commit** `feat(design): v2 mobile polish + page sweep`, push. Update memory file status.

## Self-Review

- **Spec coverage:** 7 desktop frames → R3–R9; mobile row → R10; tokens/copy/pricing constraints → R1 + Global Constraints. Static/account pages not in mockup → R10 sweep. ✔
- **Placeholder scan:** copy strings reference committed `text-*.txt` (in-repo artifact, verbatim source) — intentional, not TBD. Chart/table details bound to existing components + frame PNGs. ✔
- **Type consistency:** only new component APIs are `SectionHeader`/`StatsBand`/`BrandMarquee`/`Topbar` as declared in R2/R3 Interfaces; all other components keep current props. ✔
