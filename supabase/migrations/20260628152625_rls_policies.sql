-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security — the primary access-control layer (enforced in Postgres,
-- not the UI). Follows Supabase best practices: explicit TO clauses, wrapped
-- (select auth.uid()) for performance, USING + WITH CHECK on writes.
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles        enable row level security;
alter table stores          enable row level security;
alter table products        enable row level security;
alter table cart_items      enable row level security;
alter table wishlist_items  enable row level security;
alter table recently_viewed enable row level security;
alter table orders          enable row level security;
alter table order_items     enable row level security;
alter table sales           enable row level security;
alter table payouts         enable row level security;
alter table reviews         enable row level security;
alter table preferences     enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
-- Public read (seller names/avatars are shown publicly). role changes are
-- blocked by the guard_profile_columns trigger, not here.
create policy profiles_read_all on profiles
  for select to anon, authenticated using (true);
create policy profiles_update_own on profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy profiles_admin_write on profiles
  for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── stores ──────────────────────────────────────────────────────────────────
create policy stores_read_all on stores
  for select to anon, authenticated using (true);
create policy stores_owner_write on stores
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy stores_admin_write on stores
  for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── products ────────────────────────────────────────────────────────────────
-- Anyone sees published; owners see their own (any status); admins see all.
create policy products_read on products
  for select to anon, authenticated
  using (status = 'published' or (select auth.uid()) = owner_id or is_admin());
create policy products_owner_write on products
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy products_admin_write on products
  for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── per-user collections ────────────────────────────────────────────────────
create policy cart_own on cart_items
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy wishlist_own on wishlist_items
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy recent_own on recently_viewed
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy prefs_own on preferences
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── orders / order_items ────────────────────────────────────────────────────
create policy orders_read on orders
  for select to authenticated
  using ((select auth.uid()) = buyer_id or is_admin());
create policy orders_insert_own on orders
  for insert to authenticated
  with check ((select auth.uid()) = buyer_id);
create policy order_items_read on order_items
  for select to authenticated
  using (exists (
    select 1 from orders o
    where o.id = order_id and ((select auth.uid()) = o.buyer_id or is_admin())
  ));
create policy order_items_insert on order_items
  for insert to authenticated
  with check (exists (
    select 1 from orders o
    where o.id = order_id and (select auth.uid()) = o.buyer_id
  ));

-- ── sales (seller sees own; admin sees all) ─────────────────────────────────
create policy sales_read on sales
  for select to authenticated
  using ((select auth.uid()) = seller_id or is_admin());

-- ── payouts ─────────────────────────────────────────────────────────────────
create policy payouts_read on payouts
  for select to authenticated
  using ((select auth.uid()) = seller_id or is_admin());
create policy payouts_admin_write on payouts
  for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── reviews ─────────────────────────────────────────────────────────────────
create policy reviews_read_all on reviews
  for select to anon, authenticated using (true);
create policy reviews_author_write on reviews
  for all to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy reviews_admin_write on reviews
  for all to authenticated
  using (is_admin()) with check (is_admin());
