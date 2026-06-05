-- ─────────────────────────────────────────────────────────────────────────────
-- Production hardening
-- Closes the money/security/data-integrity gaps found in the Fase-1 audit:
--   • concurrency: advisory locks in checkout() and request_payout()
--   • checkout: only sell published products; no self-purchase attribution
--   • payouts: enforce the processing→paid/rejected state machine
--   • trust columns (rating/reviews_count/creator_id) are server-managed
--   • is_seller / two_factor are server-managed (Buka Toko goes through an RPC)
--   • reviews: verified-purchase + one-per-user + live rating aggregate
--   • orders/order_items/sales: no direct client DML (checkout RPC only)
--   • stores: payout bank details are no longer world-readable
--   • CHECK constraints, missing indexes, financial FKs, updated_at
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Privilege escalation guard: role + is_seller + two_factor ──────────────
-- is_seller/two_factor must be set by trusted server code, not by a user PATCHing
-- their own profile row (which would bypass the Seller Agreement / MFA state).
create or replace function guard_profile_columns()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not (is_admin() or current_user in ('service_role', 'supabase_admin', 'postgres')) then
    if new.role is distinct from old.role then
      raise exception 'not allowed to change role';
    end if;
    if new.is_seller is distinct from old.is_seller then
      raise exception 'not allowed to change is_seller';
    end if;
    if new.two_factor is distinct from old.two_factor then
      raise exception 'not allowed to change two_factor';
    end if;
  end if;
  return new;
end;
$$;

-- open_store(): the ONLY way to become a seller. SECURITY DEFINER so it can flip
-- is_seller (blocked for end-users by the guard above) and create the store
-- atomically, with handle-collision fallback.
create or replace function open_store(p_name text, p_category text, p_tagline text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_base text;
  v_handle text;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  update profiles set is_seller = true where id = v_user;

  v_base := left(coalesce(nullif(regexp_replace(lower(p_name), '[^a-z0-9]+', '', 'g'), ''), 'toko'), 24);
  v_handle := v_base;

  begin
    insert into stores (owner_id, name, handle, tagline, category)
    values (v_user, p_name, v_handle, coalesce(p_tagline, ''), coalesce(p_category, ''))
    on conflict (owner_id) do update
      set name = excluded.name, tagline = excluded.tagline, category = excluded.category;
  exception when unique_violation then
    v_handle := v_base || '-' || left(v_user::text, 4);
    insert into stores (owner_id, name, handle, tagline, category)
    values (v_user, p_name, v_handle, coalesce(p_tagline, ''), coalesce(p_category, ''))
    on conflict (owner_id) do update
      set name = excluded.name, tagline = excluded.tagline, category = excluded.category;
  end;
end;
$$;
revoke all on function open_store(text, text, text) from public;
grant execute on function open_store(text, text, text) to authenticated;

-- ── 2. Product trust/moderation columns are server-managed ────────────────────
-- Extends the status guard: a non-admin owner can never set the moderation status
-- to published/rejected NOR write rating/reviews_count/creator_id (which would
-- forge public trust signals). Those aggregates are maintained by trigger below.
create or replace function guard_product_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not (is_admin() or current_user in ('service_role', 'supabase_admin', 'postgres')) then
    if new.status in ('published', 'rejected') then
      raise exception 'only an admin can set product status to %', new.status;
    end if;
    if tg_op = 'INSERT' then
      new.rating := 0;
      new.reviews_count := 0;
      new.creator_id := null;
    else
      new.rating := old.rating;
      new.reviews_count := old.reviews_count;
      new.creator_id := old.creator_id;
    end if;
  end if;
  return new;
end;
$$;

-- keep updated_at honest
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ── 3. Reviews: verified-purchase, one-per-user, live rating aggregate ────────
alter table reviews add constraint reviews_one_per_user unique (product_id, author_id);

-- Only a buyer who actually paid for a product may review it; a seller cannot
-- review their own listing. SECURITY INVOKER so the author's own orders are read
-- under their RLS; trusted server roles (seeding) bypass.
create or replace function guard_review()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return new;
  end if;
  if exists (select 1 from products p where p.id = new.product_id and p.owner_id = new.author_id) then
    raise exception 'Tidak bisa mengulas produk sendiri.';
  end if;
  if not exists (
    select 1 from order_items oi
    join orders o on o.id = oi.order_id
    where oi.product_id = new.product_id
      and o.buyer_id = new.author_id
      and o.status = 'paid'
  ) then
    raise exception 'Hanya pembeli yang bisa mengulas produk ini.';
  end if;
  return new;
end;
$$;
create trigger reviews_guard
  before insert or update on reviews
  for each row execute function guard_review();

-- Maintain products.rating / reviews_count from the reviews table (source of
-- truth). SECURITY DEFINER so its write to products bypasses the trust-column
-- guard above.
create or replace function sync_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pid uuid := coalesce(new.product_id, old.product_id);
begin
  update products set
    rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where product_id = v_pid), 0),
    reviews_count = (select count(*) from reviews where product_id = v_pid)
  where id = v_pid;
  return null;
end;
$$;
create trigger reviews_sync_rating
  after insert or update or delete on reviews
  for each row execute function sync_product_rating();

-- ── 4. Payout state machine: no transitions out of a terminal state ──────────
create or replace function guard_payout_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status in ('paid', 'rejected') and new.status is distinct from old.status then
    raise exception 'payout is already % and cannot change', old.status;
  end if;
  return new;
end;
$$;
create trigger payouts_guard_status
  before update on payouts
  for each row execute function guard_payout_status();

-- ── 5. checkout(): lock, published-only, no self-purchase ────────────────────
create or replace function checkout(p_contact jsonb, p_method text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_order uuid;
  v_subtotal numeric := 0;
  v_total numeric;
  v_name text;
  r record;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- serialize concurrent checkouts for the same user (double-submit protection)
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  if not exists (select 1 from cart_items where user_id = v_user) then
    raise exception 'cart is empty';
  end if;

  -- refuse if any cart line is not a currently-purchasable (published) product
  if exists (
    select 1 from cart_items c
    join products p on p.id = c.product_id
    where c.user_id = v_user and p.status <> 'published'
  ) then
    raise exception 'Keranjang berisi produk yang tidak tersedia.';
  end if;

  select coalesce(sum(p.price_usd * c.qty), 0) into v_subtotal
  from cart_items c
  join products p on p.id = c.product_id
  where c.user_id = v_user and p.status = 'published';

  v_total := round(v_subtotal * 1.11, 2); -- PPN 11%
  select name into v_name from profiles where id = v_user;

  insert into orders (buyer_id, status, method, total_usd, contact)
  values (v_user, 'paid', p_method, v_total, coalesce(p_contact, '{}'::jsonb))
  returning id into v_order;

  for r in
    select c.qty, p.id as pid, p.name, p.price_usd, p.art, p.icon, p.owner_id
    from cart_items c
    join products p on p.id = c.product_id
    where c.user_id = v_user and p.status = 'published'
  loop
    insert into order_items (order_id, product_id, name, price_usd, qty, art, icon)
    values (v_order, r.pid, r.name, r.price_usd, r.qty, r.art, r.icon);

    -- attribute revenue to the seller; skip house catalog (owner_id null) AND
    -- self-purchase (buyer == seller) so a seller cannot mint balance for free.
    if r.owner_id is not null and r.owner_id <> v_user then
      insert into sales
        (order_id, product_id, product_name, seller_id, buyer_id, buyer_name,
         qty, gross, fee, net, status, method)
      values (
        v_order, r.pid, r.name, r.owner_id, v_user,
        coalesce(p_contact ->> 'name', v_name, 'Pelanggan'),
        r.qty,
        round(r.price_usd * r.qty, 2),
        round(r.price_usd * r.qty * 0.20, 2),
        round(r.price_usd * r.qty * 0.80, 2),
        'paid', p_method
      );
    end if;
  end loop;

  delete from cart_items where user_id = v_user;

  return v_order;
end;
$$;
revoke all on function checkout(jsonb, text) from public;
grant execute on function checkout(jsonb, text) to authenticated;

-- ── 6. request_payout(): lock before the balance read-check-insert ───────────
create or replace function request_payout(p_amount_usd numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_store stores%rowtype;
  v_net numeric;
  v_withdrawn numeric;
  v_available numeric;
  v_payout uuid;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- serialize concurrent payout requests for the same seller (balance race)
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 1));

  select * into v_store from stores where owner_id = v_user;
  if v_store.payout_status is distinct from 'verified' then
    raise exception 'Tambahkan rekening payout terverifikasi dulu.';
  end if;

  select coalesce(sum(net), 0) into v_net
  from sales where seller_id = v_user and status = 'paid';
  select coalesce(sum(amount_usd), 0) into v_withdrawn
  from payouts where seller_id = v_user and status <> 'rejected';
  v_available := v_net - v_withdrawn;

  if p_amount_usd < 50 then
    raise exception 'Minimal pencairan 50 USD.';
  end if;
  if p_amount_usd > v_available + 0.001 then
    raise exception 'Saldo tidak mencukupi.';
  end if;

  insert into payouts
    (seller_id, amount_usd, amount_idr, bank, account_masked, status)
  values (
    v_user, round(p_amount_usd, 2), round(p_amount_usd * 15800),
    v_store.payout_bank, v_store.payout_account_masked, 'processing'
  )
  returning id into v_payout;

  return v_payout;
end;
$$;
revoke all on function request_payout(numeric) from public;
grant execute on function request_payout(numeric) to authenticated;

-- ── 7. No direct client DML on orders / order_items / sales ──────────────────
-- All order + revenue creation must go through the SECURITY DEFINER checkout()
-- (and refund/cancel RPCs). This removes the "POST a fake paid order" class.
revoke insert, update, delete on orders      from anon, authenticated;
revoke insert, update, delete on order_items from anon, authenticated;
revoke insert, update, delete on sales       from anon, authenticated;

-- ── 8. Payout bank details are not world-readable ────────────────────────────
-- Public reads need only the storefront columns; payout_* stays owner/admin-only
-- (read server-side via the service-role client / RPCs).
revoke select on stores from anon, authenticated;
grant select (owner_id, name, handle, tagline, category) on stores to anon, authenticated;

-- ── 9. CHECK constraints on money + quantity + status ────────────────────────
alter table products    add constraint products_price_chk    check (price_usd >= 0);
alter table products    add constraint products_rating_chk   check (rating >= 0 and rating <= 5);
alter table products    add constraint products_reviews_chk  check (reviews_count >= 0);
alter table orders      add constraint orders_total_chk      check (total_usd >= 0);
alter table order_items add constraint order_items_qty_chk   check (qty > 0);
alter table order_items add constraint order_items_price_chk check (price_usd >= 0);
alter table order_items add constraint order_items_uniq      unique (order_id, product_id);
alter table sales       add constraint sales_qty_chk         check (qty > 0);
alter table sales       add constraint sales_amounts_chk     check (gross >= 0 and fee >= 0 and net >= 0);
alter table sales       add constraint sales_status_chk      check (status in ('paid', 'refunded', 'void'));
alter table payouts     add constraint payouts_amount_chk    check (amount_usd > 0);
alter table stores      add constraint stores_payout_status_chk check (payout_status in ('none', 'pending', 'verified'));

-- ── 10. Indexes for the real query patterns ──────────────────────────────────
create index orders_buyer_idx       on orders (buyer_id, created_at desc);
create index order_items_order_idx  on order_items (order_id);
create index order_items_product_idx on order_items (product_id);
create index sales_order_idx        on sales (order_id);
create index sales_product_idx      on sales (product_id);
create index sales_buyer_idx        on sales (buyer_id);
create index reviews_author_idx     on reviews (author_id);

-- ── 11. Preserve the financial ledger when an account is deleted ─────────────
alter table sales   drop constraint sales_seller_id_fkey;
alter table sales   add  constraint sales_seller_id_fkey
  foreign key (seller_id) references profiles (id) on delete restrict;
alter table payouts drop constraint payouts_seller_id_fkey;
alter table payouts add  constraint payouts_seller_id_fkey
  foreign key (seller_id) references profiles (id) on delete restrict;
