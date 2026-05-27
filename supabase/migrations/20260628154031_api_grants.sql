-- ─────────────────────────────────────────────────────────────────────────────
-- API role grants.
-- Tables created via CLI migrations are NOT auto-granted to the PostgREST API
-- roles, so anon/authenticated/service_role start with no DML privileges and
-- every API query returns "permission denied". This is table-level access;
-- ROW access is still gated by the RLS policies in the previous migration.
--   • anon / authenticated → DML granted, RLS restricts which rows.
--   • service_role         → DML granted, bypasses RLS (trusted server code).
-- ─────────────────────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
  on all tables in schema public
  to anon, authenticated, service_role;

grant usage, select
  on all sequences in schema public
  to anon, authenticated, service_role;

-- Future tables/sequences in public inherit the same grants.
alter default privileges in schema public
  grant select, insert, update, delete on tables
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant usage, select on sequences
  to anon, authenticated, service_role;
