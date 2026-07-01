-- ─────────────────────────────────────────────────────────────────────────────
-- refund_order(): admin-only. Marks a paid order refunded and flips its sales
-- rows to 'refunded' so the amount leaves the sellers' available payout balance
-- (request_payout only counts sales with status='paid'). SECURITY DEFINER since
-- direct DML on orders/sales is revoked from clients.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function refund_order(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  update orders set status = 'refunded' where id = p_order and status = 'paid';
  if not found then
    raise exception 'Pesanan tidak dalam status paid.';
  end if;

  update sales set status = 'refunded' where order_id = p_order and status = 'paid';
end;
$$;
revoke all on function refund_order(uuid) from public;
grant execute on function refund_order(uuid) to authenticated;
