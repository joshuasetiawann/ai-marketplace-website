-- ─────────────────────────────────────────────────────────────────────────────
-- Close the two findings the previous pass only half-closed (audit 2026-08-16)
--   • SEC-05: `role` was still readable by any signed-in user
--   • SEC-06: payout accounts were marked verified without anyone verifying them
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. profiles.role is no longer readable over the API at all ───────────────
-- The previous migration stopped anonymous enumeration but left `authenticated`
-- holding every column, so any signed-in user could still list the platform's
-- admins. Column privileges are per-role, not per-row, so "admins may read it"
-- cannot be expressed as a grant — the two places that legitimately need it go
-- through routes that do not rely on this grant:
--   • "am I an admin?"  → is_admin(), a SECURITY DEFINER function that only ever
--                         inspects the caller's own row
--   • the admin user list → the service-role client, server-side, behind the
--                         admin layout's own guard (same pattern the seller
--                         payout page already uses for bank details)
revoke select on profiles from authenticated;
grant select (id, name, art, is_seller, created_at) on profiles to authenticated;

-- is_admin() relied on PUBLIC's default EXECUTE. Make the grant explicit now
-- that application code calls it directly. All three API roles need it, not
-- just `authenticated`: it appears inside RLS policies (profiles_admin_write,
-- stores_admin_write, …) which Postgres evaluates under whatever role is
-- reading, so revoking it from `anon` turns every anonymous catalog read into
-- "permission denied for function is_admin". It leaks nothing — it only ever
-- looks at the caller's own row, and returns false when auth.uid() is null.
revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated, service_role;

-- ── 2. Payout accounts start unverified ──────────────────────────────────────
-- savePayoutAccount() used to write 'verified' the moment a seller typed six
-- digits — no penny drop, no name match — and request_payout() treats exactly
-- that value as proof the destination is real. An admin now has to look at it.
--
-- Existing rows are moved to 'pending' rather than left alone: they were all
-- self-asserted, and quietly grandfathering them in would defeat the point.
-- Sellers keep their saved details; only the flag changes.
update stores set payout_status = 'pending' where payout_status = 'verified';

-- Approve or reject a seller's payout account. Admin-only, SECURITY DEFINER
-- because the payout_* columns are not readable through the API by design.
create or replace function set_payout_account_status(p_owner uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;
  if p_status not in ('verified', 'none') then
    raise exception 'status tidak valid';
  end if;
  update stores set payout_status = p_status
  where owner_id = p_owner and payout_status = 'pending';
  if not found then
    raise exception 'Rekening ini tidak sedang menunggu verifikasi.';
  end if;
end;
$$;
revoke all on function set_payout_account_status(uuid, text) from public;
grant execute on function set_payout_account_status(uuid, text) to authenticated;

-- Writing 'pending' from the Server Action is not enough on its own: the owner
-- still held UPDATE on the payout columns, so a seller could PATCH
-- payout_status='verified' straight over PostgREST, or — worse — keep a
-- verified flag and swap payout_bank/payout_account_masked to a different
-- destination afterwards. Take the column privileges away; the two SECURITY
-- DEFINER functions here become the only write path, and one of them always
-- resets the flag to 'pending'.
-- Note the table-level revoke first: a column-level REVOKE against a role that
-- holds table-level UPDATE is a silent no-op in Postgres (api_grants.sql grants
-- `update on all tables`), so the columns have to be granted back explicitly.
-- Rows are still created by open_store(), a SECURITY DEFINER RPC — neither role
-- needs INSERT on this table at all.
revoke insert, update on stores from anon, authenticated;
grant update (name, tagline, category) on stores to authenticated;

-- Propose a payout account for the caller's own store. Always lands in
-- 'pending' — changing the destination re-opens verification by construction.
create or replace function save_payout_account(p_bank text, p_account_masked text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if coalesce(trim(p_bank), '') = '' then
    raise exception 'Pilih bank.';
  end if;
  if coalesce(trim(p_account_masked), '') = '' then
    raise exception 'Nomor rekening tidak valid.';
  end if;
  update stores
     set payout_bank = trim(p_bank),
         payout_account_masked = p_account_masked,
         payout_status = 'pending'
   where owner_id = auth.uid();
  if not found then
    raise exception 'Buka toko dulu sebelum menambahkan rekening pencairan.';
  end if;
end;
$$;
revoke all on function save_payout_account(text, text) from public;
grant execute on function save_payout_account(text, text) to authenticated;
