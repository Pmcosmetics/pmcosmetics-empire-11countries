create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
      and role in ('admin','staff')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin_user() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin_user() to authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists admin_users_select_self on public.admin_users;
create policy admin_users_select_self
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_select_authenticated on public.orders;
create policy orders_select_admin_staff
  on public.orders for select
  to authenticated
  using (public.is_admin_user());

drop policy if exists orders_insert_authenticated on public.orders;
create policy orders_insert_admin_staff
  on public.orders for insert
  to authenticated
  with check (public.is_admin_user());

drop policy if exists orders_update_authenticated on public.orders;

create or replace function public.update_order_status(
  p_order_id text,
  p_status text,
  p_notes text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.orders;
  actor_role text;
begin
  select role into actor_role
  from public.admin_users
  where user_id = auth.uid();

  if actor_role is null then
    raise exception 'not authorized';
  end if;

  if p_status not in ('pending','confirmed','paid','shipped','delivered','cancelled') then
    raise exception 'invalid status';
  end if;

  if actor_role = 'admin' then
    update public.orders
      set status = p_status,
          notes = coalesce(p_notes, notes)
    where order_id = p_order_id
    returning * into result;
  else
    update public.orders
      set status = p_status,
          notes = coalesce(p_notes, notes)
    where order_id = p_order_id
    returning * into result;
  end if;

  if result.id is null then
    raise exception 'order not found';
  end if;

  return result;
end;
$$;

revoke all on function public.update_order_status(text,text,text) from public;
grant execute on function public.update_order_status(text,text,text) to authenticated;

revoke insert, update, delete on public.orders from authenticated;
grant select on public.orders to authenticated;
grant select on public.admin_users to authenticated;
grant all on public.orders to service_role;
grant all on public.admin_users to service_role;
