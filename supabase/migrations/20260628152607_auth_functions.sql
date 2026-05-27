-- ─────────────────────────────────────────────────────────────────────────────
-- Auth glue + authorization helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- When a new auth user is created, mirror it into profiles + preferences.
-- SECURITY DEFINER so it can write profiles regardless of RLS. `name` comes from
-- user_metadata (display only — never used for authorization).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  insert into public.preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- is_admin(): true when the CURRENT caller is an admin. SECURITY DEFINER so it
-- can read profiles without recursing into profiles' own RLS policies. It only
-- ever inspects the caller's own row (auth.uid()), so it leaks nothing.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Prevent privilege escalation: an authenticated end-user must not be able to
-- change their own `role`. Admins may change roles; service_role/postgres (used
-- by trusted server code + seeding) bypass the guard.
-- SECURITY INVOKER (the default) is REQUIRED here: current_user must reflect the
-- real caller. A SECURITY DEFINER trigger would set current_user to the owner
-- (postgres) and silently match the bypass list, defeating the guard.
create or replace function guard_profile_columns()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not (is_admin() or current_user in ('service_role', 'supabase_admin', 'postgres')) then
      raise exception 'not allowed to change role';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_columns
  before update on profiles
  for each row execute function guard_profile_columns();
