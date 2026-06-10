-- ─────────────────────────────────────────────────────────────────────────────
-- Payment-gateway groundwork (Fase 2). The simulated flow keeps using checkout()
-- (instant paid). Real providers use a pending → paid lifecycle:
--   create_pending_order()  — buyer creates a 'pending' order (no sales yet)
--   finalize_order()        — webhook (service_role only) settles pending → paid
--                             and books the seller sales split (idempotent)
--   fail_order()            — webhook marks pending → failed
-- ─────────────────────────────────────────────────────────────────────────────

alter table orders add column provider text;
alter table orders add column payment_ref text;

-- Create a PENDING order from the caller's cart (mirrors checkout's totals/promo
-- but books no revenue until the gateway confirms). Callable by the buyer.
create or replace function create_pending_order(
  p_contact jsonb,
  p_method text,
  p_provider text,
  p_promo text default null
)
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
  v_total := round((v_subtotal - v_discount) * 1.11, 2);

  insert into orders (buyer_id, status, method, provider, total_usd, discount_usd, promo_code, contact)
  values (
    v_user, 'pending', p_method, p_provider, v_total, v_discount,
    case when v_pct > 0 then upper(trim(p_promo)) else null end,
    coalesce(p_contact, '{}'::jsonb)
  )
  returning id into v_order;

  for r in
    select c.qty, p.id as pid, p.name, p.price_usd, p.art, p.icon
    from cart_items c
    join products p on p.id = c.product_id
    where c.user_id = v_user and p.status = 'published'
  loop
    insert into order_items (order_id, product_id, name, price_usd, qty, art, icon)
    values (v_order, r.pid, r.name, r.price_usd, r.qty, r.art, r.icon);
  end loop;

  delete from cart_items where user_id = v_user;
  return v_order;
end;
$$;
revoke all on function create_pending_order(jsonb, text, text, text) from public;
grant execute on function create_pending_order(jsonb, text, text, text) to authenticated;

-- Settle a pending order and book the seller sales split. Idempotent + race-safe
-- (the conditional UPDATE only fires once). service_role-only: the gateway
-- webhook calls this with the service key; end-users have no execute grant.
create or replace function finalize_order(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
begin
  update orders set status = 'paid' where id = p_order and status = 'pending';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return; -- not pending (already settled / unknown) → no-op
  end if;

  insert into sales
    (order_id, product_id, product_name, seller_id, buyer_id, buyer_name,
     qty, gross, fee, net, status, method)
  select
    oi.order_id, oi.product_id, oi.name, p.owner_id, o.buyer_id,
    coalesce(o.contact ->> 'name', pr.name, 'Pelanggan'),
    oi.qty,
    round(oi.price_usd * oi.qty, 2),
    round(oi.price_usd * oi.qty * 0.20, 2),
    round(oi.price_usd * oi.qty * 0.80, 2),
    'paid', o.method
  from order_items oi
  join orders o on o.id = oi.order_id
  join products p on p.id = oi.product_id
  left join profiles pr on pr.id = o.buyer_id
  where oi.order_id = p_order
    and p.owner_id is not null
    and p.owner_id <> o.buyer_id; -- skip house catalog + self-purchase
end;
$$;
revoke all on function finalize_order(uuid) from public;
grant execute on function finalize_order(uuid) to service_role;

-- Mark a pending order failed (gateway declined / expired). service_role-only.
create or replace function fail_order(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders set status = 'failed' where id = p_order and status = 'pending';
end;
$$;
revoke all on function fail_order(uuid) from public;
grant execute on function fail_order(uuid) to service_role;
