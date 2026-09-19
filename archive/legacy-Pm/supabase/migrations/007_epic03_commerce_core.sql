-- EPIC03__commerce_core.sql - FINAL LOCKED
-- Project: rhozehqlpnmzmknlpmvf
--
-- Migration 007: introduces the locked Commerce Core schema.
-- The previous orders table is preserved as orders_legacy because it used
-- an incompatible legacy structure. No legacy rows existed at migration time.

begin;

alter table if exists public.orders rename to orders_legacy;

create table public.categories (
  id bigserial primary key,
  code text not null unique,
  name_ar text,
  name_en text,
  name text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id bigserial primary key,
  sku text not null unique,
  name text not null,
  description text,
  category_id bigint references public.categories(id),
  base_price numeric not null default 0,
  currency text not null default 'EGP',
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_base_price_nonnegative check (base_price >= 0),
  constraint products_currency_not_null check (currency is not null)
);

create table public.inventory (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  location_code text not null default 'EG-MAIN',
  quantity integer not null default 0,
  reserved integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_quantity_nonnegative check (quantity >= 0),
  constraint inventory_reserved_nonnegative check (reserved >= 0),
  constraint inventory_reserved_within_quantity check (reserved <= quantity),
  constraint inventory_product_location_unique unique (product_id, location_code)
);

create table public.orders (
  id bigserial primary key,
  order_number text not null unique,
  channel_code text,
  status text not null default 'pending',
  total_amount numeric not null default 0,
  currency text not null default 'EGP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_nonnegative check (total_amount >= 0),
  constraint orders_status_check check (status in ('pending','confirmed','shipped','delivered','cancelled','returned'))
);

create table public.order_items (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  quantity integer not null,
  unit_price numeric not null,
  line_total numeric not null,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_price_nonnegative check (unit_price >= 0),
  constraint order_items_line_total_nonnegative check (line_total >= 0)
);

create index epic03_products_category_id_idx on public.products(category_id);
create index epic03_products_is_active_idx on public.products(is_active);
create index epic03_inventory_product_id_idx on public.inventory(product_id);
create index epic03_inventory_location_code_idx on public.inventory(location_code);
create index epic03_orders_status_idx on public.orders(status);
create index epic03_orders_channel_code_idx on public.orders(channel_code);
create index epic03_order_items_order_id_idx on public.order_items(order_id);
create index epic03_order_items_product_id_idx on public.order_items(product_id);

-- Public is exposed by Supabase; keep these tables closed until EPIC07 policies are defined.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

commit;
