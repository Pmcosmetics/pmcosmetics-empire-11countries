-- EPIC05__multi_channel.sql
-- Project: rhozehqlpnmzmknlpmvf
-- Adds a normalized channel registry, external-order idempotency layer,
-- and inbound channel-event ledger without modifying the locked EPIC03 core.

create table if not exists public.commerce_channels (
  id bigserial primary key,
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.channel_orders (
  id bigserial primary key,
  channel_id bigint not null references public.commerce_channels(id) on delete restrict,
  external_order_id text not null,
  order_id bigint references public.orders(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint channel_orders_status_chk check (status in ('received','processed','failed')),
  constraint channel_orders_external_unique unique (channel_id, external_order_id)
);

create table if not exists public.channel_events (
  id bigserial primary key,
  channel_id bigint not null references public.commerce_channels(id) on delete restrict,
  external_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  constraint channel_events_status_chk check (status in ('received','processed','failed')),
  constraint channel_events_external_unique unique (channel_id, external_event_id)
);

create index if not exists idx_channel_orders_channel on public.channel_orders(channel_id);
create index if not exists idx_channel_orders_order on public.channel_orders(order_id);
create index if not exists idx_channel_orders_status on public.channel_orders(status);
create index if not exists idx_channel_events_channel on public.channel_events(channel_id);
create index if not exists idx_channel_events_status on public.channel_events(status);

alter table public.commerce_channels enable row level security;
alter table public.channel_orders enable row level security;
alter table public.channel_events enable row level security;

create policy commerce_channels_admin_staff_select on public.commerce_channels
  for select to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.role in ('admin','staff')));

create policy channel_orders_admin_staff_select on public.channel_orders
  for select to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.role in ('admin','staff')));

create policy channel_events_admin_staff_select on public.channel_events
  for select to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.role in ('admin','staff')));

revoke all on public.commerce_channels, public.channel_orders, public.channel_events from anon;
revoke all on public.commerce_channels, public.channel_orders, public.channel_events from authenticated;
revoke all on public.commerce_channels, public.channel_orders, public.channel_events from public;
