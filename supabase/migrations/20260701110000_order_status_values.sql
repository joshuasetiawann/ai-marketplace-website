-- Add lifecycle states for refunds/cancellations. Kept in its own migration so
-- the new enum values are committed before the refund RPC (next migration) uses
-- them (Postgres forbids using a freshly-added enum value in the same tx).
alter type order_status add value if not exists 'refunded';
alter type order_status add value if not exists 'cancelled';
