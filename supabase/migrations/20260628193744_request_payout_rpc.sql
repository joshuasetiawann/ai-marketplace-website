-- ─────────────────────────────────────────────────────────────────────────────
-- request_payout(): a seller withdraws from their available balance.
-- SECURITY DEFINER because `payouts` is admin-write under RLS — sellers must not
-- insert arbitrary payout rows. Validates a verified payout account, the minimum
-- amount, and that the request does not exceed the available (net - withdrawn)
-- balance. Only operates on the caller (auth.uid()). Granted to authenticated.
-- ─────────────────────────────────────────────────────────────────────────────
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
