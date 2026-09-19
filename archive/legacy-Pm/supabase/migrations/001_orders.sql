create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  created_at timestamptz not null default now(),
  product_id text,
  product_name text,
  quantity integer not null default 1 check (quantity > 0),
  price_pm numeric(12,2),
  currency text not null default 'EGP',
  customer_name text,
  phone text,
  address text,
  payment_method text,
  status text not null default 'pending' check (status in ('pending','confirmed','paid','shipped','delivered','cancelled')),
  notes text,
  source text not null default 'whatsapp',
  wa_message text,
  wa_timestamp timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_phone_idx on public.orders (phone);

alter table public.orders enable row level security;

-- Admin dashboard: authenticated users only.
create policy "orders_select_authenticated"
  on public.orders for select
  to authenticated
  using (true);

create policy "orders_insert_authenticated"
  on public.orders for insert
  to authenticated
  with check (true);

create policy "orders_update_authenticated"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- The webhook must use the server-side service role key. Never expose it to browsers.
-- No anonymous policies are created intentionally.

revoke all on table public.orders from anon;
grant select, insert, update on table public.orders to authenticated;
grant all on table public.orders to service_role;
