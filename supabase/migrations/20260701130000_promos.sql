-- ─────────────────────────────────────────────────────────────────────────────
-- Promo codes — a real, server-authoritative discount (previously the cart's
-- promo UI was cosmetic and the buyer was charged full price). The discount is
-- platform-borne: seller sales attribution stays on the full gross.
-- ─────────────────────────────────────────────────────────────────────────────
create table promo_codes (
  code text primary key,
  percent_off int not null check (percent_off between 1 and 90),
  active boolean not null default true,
  min_subtotal numeric(10, 2) not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table promo_codes enable row level security;
-- the table itself is not client-readable; validation flows through validate_promo()
create policy promo_admin_all on promo_codes
  for all to authenticated using (is_admin()) with check (is_admin());

insert into promo_codes (code, percent_off, min_subtotal) values
  ('NEXORA10', 10, 0),
  ('WELCOME', 15, 0),
  ('LUXURY20', 20, 100);

alter table orders add column discount_usd numeric(10, 2) not null default 0;
alter table orders add column promo_code text;
alter table orders add constraint orders_discount_chk check (discount_usd >= 0);

-- validate_promo(): returns the percent-off for a code if valid for this
-- subtotal, else 0. SECURITY DEFINER so callers never read promo_codes directly.
create or replace function validate_promo(p_code text, p_subtotal numeric)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select percent_off from promo_codes
    where code = upper(trim(p_code))
      and active
      and (expires_at is null or expires_at > now())
      and p_subtotal >= min_subtotal
    limit 1
  ), 0);
$$;
revoke all on function validate_promo(text, numeric) from public;
grant execute on function validate_promo(text, numeric) to anon, authenticated;

-- checkout() gains an optional promo; the discount is applied to the subtotal
-- before PPN and recorded on the order (recomputed server-side, never trusted
-- from the client).
drop function if exists checkout(jsonb, text);
create or replace function checkout(p_contact jsonb, p_method text, p_promo text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_order uuid;
  v_subtotal numeric := 0;
  v_pct int := 0;
  v_discount numeric := 0;
  v_total numeric;
  v_name text;
  r record;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  if not exists (select 1 from cart_items where user_id = v_user) then
    raise exception 'cart is empty';
  end if;

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

  v_pct := validate_promo(p_promo, v_subtotal);
  v_discount := round(v_subtotal * v_pct / 100.0, 2);
  v_total := round((v_subtotal - v_discount) * 1.11, 2); -- PPN 11% on discounted subtotal
  select name into v_name from profiles where id = v_user;

  insert into orders (buyer_id, status, method, total_usd, discount_usd, promo_code, contact)
  values (
    v_user, 'paid', p_method, v_total, v_discount,
    case when v_pct > 0 then upper(trim(p_promo)) else null end,
    coalesce(p_contact, '{}'::jsonb)
  )
  returning id into v_order;

  for r in
    select c.qty, p.id as pid, p.name, p.price_usd, p.art, p.icon, p.owner_id
    from cart_items c
    join products p on p.id = c.product_id
    where c.user_id = v_user and p.status = 'published'
  loop
    insert into order_items (order_id, product_id, name, price_usd, qty, art, icon)
    values (v_order, r.pid, r.name, r.price_usd, r.qty, r.art, r.icon);

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
revoke all on function checkout(jsonb, text, text) from public;
grant execute on function checkout(jsonb, text, text) to authenticated;
