-- ─────────────────────────────────────────────────────────────────────────────
-- Nexora AI — core schema
-- Mirrors the entities from the legacy mock backend (legacy-vite/src/data/db.js)
-- but as real Postgres tables. Prices stored in USD (price_usd); Rupiah is a UI
-- presentation concern.
-- ─────────────────────────────────────────────────────────────────────────────

create type user_role as enum ('user', 'admin');
create type product_status as enum ('draft', 'under_review', 'published', 'rejected');
create type order_status as enum ('pending', 'paid', 'failed');
create type payout_status as enum ('processing', 'paid', 'rejected');

-- profiles: 1:1 with auth.users. role is server-controlled (see guard trigger).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role user_role not null default 'user',
  is_seller boolean not null default false,
  art text[] not null default array['#0b3a44', '#00e5ff'],
  two_factor boolean not null default false,
  created_at timestamptz not null default now()
);

-- stores: created when a user opens a shop ("Buka Toko"). 1:1 with a profile.
create table stores (
  owner_id uuid primary key references profiles (id) on delete cascade,
  name text not null,
  handle text unique not null,
  tagline text default '',
  category text default '',
  payout_bank text,
  payout_account_masked text,
  payout_status text not null default 'none'
);

-- products: marketplace listings. owner_id null = curated "house" catalog.
create table products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id) on delete set null,
  name text not null,
  tagline text default '',
  category text not null,
  use_cases text[] not null default '{}',
  use_case_tags text[] not null default '{}',
  tier text not null default 'Free',
  price_usd numeric(10, 2) not null default 0,
  icon text default 'apps',
  art text[] not null default array['#0b3a44', '#00e5ff'],
  description text default '',
  capabilities jsonb not null default '[]',
  specs jsonb not null default '{}',
  gallery int not null default 3,
  status product_status not null default 'under_review',
  rating numeric(2, 1) not null default 0,
  reviews_count int not null default 0,
  creator_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on products (status);
create index products_owner_idx on products (owner_id);
create index products_category_idx on products (category);

-- per-user collections
create table cart_items (
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  qty int not null default 1 check (qty > 0),
  added_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table wishlist_items (
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  primary key (user_id, product_id)
);

create table recently_viewed (
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- orders + line items
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles (id) on delete cascade,
  status order_status not null default 'pending',
  method text,
  total_usd numeric(10, 2) not null default 0,
  contact jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  name text not null,
  price_usd numeric(10, 2) not null,
  qty int not null default 1,
  art text[] not null default '{}',
  icon text
);

-- sales ledger: marketplace revenue source-of-truth (one row per sold item)
create table sales (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete set null,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  seller_id uuid not null references profiles (id) on delete cascade,
  buyer_id uuid references profiles (id) on delete set null,
  buyer_name text,
  qty int not null default 1,
  gross numeric(10, 2) not null,
  fee numeric(10, 2) not null,
  net numeric(10, 2) not null,
  status text not null default 'paid',
  method text,
  created_at timestamptz not null default now()
);
create index sales_seller_idx on sales (seller_id);

-- payouts: withdrawals to a verified bank account
create table payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles (id) on delete cascade,
  amount_usd numeric(10, 2) not null,
  amount_idr numeric(14, 2) not null,
  bank text,
  account_masked text,
  status payout_status not null default 'processing',
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);
create index payouts_seller_idx on payouts (seller_id);

-- reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text default '',
  created_at timestamptz not null default now()
);
create index reviews_product_idx on reviews (product_id);

-- user preferences
create table preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  interests text[] not null default '{}'
);
