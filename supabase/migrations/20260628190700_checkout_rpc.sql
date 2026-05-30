-- ─────────────────────────────────────────────────────────────────────────────
-- checkout(): simulated-payment order placement.
-- Atomically turns the caller's cart into a PAID order: creates the order +
-- line items, records the per-seller sales split (80/20), and clears the cart.
-- SECURITY DEFINER because buyers cannot insert `sales` rows under RLS; the
-- function only ever touches the caller's own cart (auth.uid()). EXECUTE is
-- revoked from PUBLIC and granted only to authenticated.
-- ─────────────────────────────────────────────────────────────────────────────
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

  if not exists (select 1 from cart_items where user_id = v_user) then
    raise exception 'cart is empty';
  end if;

  select coalesce(sum(p.price_usd * c.qty), 0) into v_subtotal
  from cart_items c
  join products p on p.id = c.product_id
  where c.user_id = v_user;

  v_total := round(v_subtotal * 1.11, 2); -- PPN 11%
  select name into v_name from profiles where id = v_user;

  insert into orders (buyer_id, status, method, total_usd, contact)
  values (v_user, 'paid', p_method, v_total, coalesce(p_contact, '{}'::jsonb))
  returning id into v_order;

  for r in
    select c.qty, p.id as pid, p.name, p.price_usd, p.art, p.icon, p.owner_id
    from cart_items c
    join products p on p.id = c.product_id
    where c.user_id = v_user
  loop
    insert into order_items (order_id, product_id, name, price_usd, qty, art, icon)
    values (v_order, r.pid, r.name, r.price_usd, r.qty, r.art, r.icon);

    -- attribute revenue to the seller (skip platform-owned "house" catalog)
    if r.owner_id is not null then
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
