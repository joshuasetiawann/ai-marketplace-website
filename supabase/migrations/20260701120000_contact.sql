-- Contact / support messages. Anyone may submit; only admins may read.
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  name text not null,
  email text not null,
  subject text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy contact_insert on contact_messages
  for insert to anon, authenticated with check (true);
create policy contact_admin_read on contact_messages
  for select to authenticated using (is_admin());

create index contact_messages_created_idx on contact_messages (created_at desc);
