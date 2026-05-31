-- ─────────────────────────────────────────────────────────────────────────────
-- Prevent sellers from self-publishing. RLS lets an owner write their own
-- products but cannot restrict WHICH status they set, so a seller could set
-- status='published' and bypass moderation. This trigger limits non-admins to
-- 'draft' / 'under_review'; only admins (or trusted server roles) may set
-- 'published' / 'rejected'. SECURITY INVOKER so current_user is the real caller.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function guard_product_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status in ('published', 'rejected')
     and not (is_admin() or current_user in ('service_role', 'supabase_admin', 'postgres'))
  then
    raise exception 'only an admin can set product status to %', new.status;
  end if;
  return new;
end;
$$;

create trigger products_guard_status
  before insert or update on products
  for each row execute function guard_product_status();
