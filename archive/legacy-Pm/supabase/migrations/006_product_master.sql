create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_code text not null unique,
  name text not null,
  description text,
  brand text,
  category text,
  status text not null default 'active' check (status in ('draft','active','archived')),
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skus (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  barcode text unique,
  name text,
  attributes jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  sku_id uuid references public.skus(id) on delete cascade,
  media_type text not null check (media_type in ('image','video','document')),
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (product_id is not null or sku_id is not null)
);

create table if not exists public.channel_mappings (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  product_id uuid references public.products(id) on delete cascade,
  sku_id uuid references public.skus(id) on delete cascade,
  external_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (product_id is not null or sku_id is not null),
  unique (channel, external_id)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  sku_id uuid not null unique references public.skus(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= quantity),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  sku_id uuid references public.skus(id) on delete cascade,
  channel text,
  currency text not null default 'EGP',
  base_price numeric(12,2) not null check (base_price >= 0),
  min_price numeric(12,2) check (min_price is null or min_price >= 0),
  max_price numeric(12,2) check (max_price is null or max_price >= base_price),
  rule jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_status_idx on public.products (status);
create index if not exists skus_product_id_idx on public.skus (product_id);
create index if not exists media_product_id_idx on public.media (product_id);
create index if not exists media_sku_id_idx on public.media (sku_id);
create index if not exists channel_mappings_product_id_idx on public.channel_mappings (product_id);
create index if not exists channel_mappings_sku_id_idx on public.channel_mappings (sku_id);
create index if not exists inventory_updated_at_idx on public.inventory (updated_at desc);
create index if not exists pricing_rules_channel_idx on public.pricing_rules (channel);
create index if not exists audit_log_entity_idx on public.audit_log (entity_type, entity_id);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.products enable row level security;
alter table public.skus enable row level security;
alter table public.media enable row level security;
alter table public.channel_mappings enable row level security;
alter table public.inventory enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.audit_log enable row level security;

create policy "products_select_authenticated" on public.products for select to authenticated using (true);
create policy "products_insert_authenticated" on public.products for insert to authenticated with check (true);
create policy "products_update_authenticated" on public.products for update to authenticated using (true) with check (true);
create policy "skus_select_authenticated" on public.skus for select to authenticated using (true);
create policy "skus_insert_authenticated" on public.skus for insert to authenticated with check (true);
create policy "skus_update_authenticated" on public.skus for update to authenticated using (true) with check (true);
create policy "media_select_authenticated" on public.media for select to authenticated using (true);
create policy "channel_mappings_select_authenticated" on public.channel_mappings for select to authenticated using (true);
create policy "inventory_select_authenticated" on public.inventory for select to authenticated using (true);
create policy "pricing_rules_select_authenticated" on public.pricing_rules for select to authenticated using (true);
create policy "audit_log_select_authenticated" on public.audit_log for select to authenticated using (true);

revoke all on table public.products, public.skus, public.media, public.channel_mappings, public.inventory, public.pricing_rules, public.audit_log from anon;
grant select, insert, update on public.products, public.skus to authenticated;
grant select on public.media, public.channel_mappings, public.inventory, public.pricing_rules, public.audit_log to authenticated;
grant all on public.products, public.skus, public.media, public.channel_mappings, public.inventory, public.pricing_rules, public.audit_log to service_role;
