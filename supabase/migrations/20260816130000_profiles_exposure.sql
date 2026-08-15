-- ─────────────────────────────────────────────────────────────────────────────
-- Profile exposure (audit 2026-08-16)
--   • SEC-05: `role` was readable by anonymous visitors
--   • BUG-10: `two_factor` was a column nothing ever wrote
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Anonymous visitors get storefront columns only ────────────────────────
-- profiles_read_all is `using (true)`, and the table-level grant covered every
-- column, so PostgREST happily answered
--   GET /rest/v1/profiles?select=id,name,role&role=eq.admin
-- with the platform's full list of administrators — to anyone, unauthenticated.
-- Same fix the stores table already got in prod_hardening: revoke the blanket
-- SELECT, grant back only what public pages actually render (review author
-- names, creator names, avatar colours).
--
-- `authenticated` keeps full column access because the admin console lists
-- every user's role and seller flag. That leaves a signed-in user able to read
-- other people's role — a much smaller surface than anonymous enumeration, and
-- closing it properly needs a restricted view rather than a grant change.
revoke select on profiles from anon;
grant select (id, name, art, is_seller, created_at) on profiles to anon;

-- ── 2. Drop the dead two_factor column ───────────────────────────────────────
-- Nothing in the app ever set it: the real 2FA state lives in auth.mfa_factors,
-- which is what listFactors()/getAuthenticatorAssuranceLevel() read. A column
-- that is permanently false is a trap for the next feature that trusts it.
-- The guard trigger has to stop referencing it first.
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
  end if;
  return new;
end;
$$;

alter table profiles drop column if exists two_factor;
