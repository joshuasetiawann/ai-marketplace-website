-- ─────────────────────────────────────────────────────────────────────────────
-- Digital fulfillment: a private per-product asset (download URL / access note)
-- that only the seller (owner), a paying buyer, or an admin may read. Kept in a
-- separate table so the public products row stays fully world-readable while the
-- delivery secret is entitlement-gated by RLS.
-- ─────────────────────────────────────────────────────────────────────────────
create table product_assets (
  product_id uuid primary key references products (id) on delete cascade,
  asset_url text,
  access_note text,
  updated_at timestamptz not null default now()
);

alter table product_assets enable row level security;

-- owner manages their own product's fulfillment
create policy product_assets_owner on product_assets
  for all to authenticated
  using (exists (select 1 from products p where p.id = product_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from products p where p.id = product_id and p.owner_id = (select auth.uid())));

-- a paying buyer may READ the asset for a product they own
create policy product_assets_buyer_read on product_assets
  for select to authenticated
  using (exists (
    select 1 from order_items oi
    join orders o on o.id = oi.order_id
    where oi.product_id = product_assets.product_id
      and o.buyer_id = (select auth.uid())
      and o.status = 'paid'
  ));

-- admins manage everything
create policy product_assets_admin on product_assets
  for all to authenticated
  using (is_admin()) with check (is_admin());
