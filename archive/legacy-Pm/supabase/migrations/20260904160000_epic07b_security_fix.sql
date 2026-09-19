-- EPIC07-B: Security hardening for anonymous access.
--
-- The existing RLS policies are already scoped to the `authenticated` role.
-- The remaining database-level exposure was table privileges granted to `anon`.
-- Remove those privileges while preserving authenticated and service-role access.

REVOKE ALL PRIVILEGES ON TABLE
  public.admin_users,
  public.categories,
  public.channel_events,
  public.channel_orders,
  public.commerce_channels,
  public.inventory,
  public.order_items,
  public.orders,
  public.orders_legacy,
  public.products
FROM anon;

-- Defense in depth: explicitly deny anonymous function execution.
REVOKE EXECUTE ON FUNCTION public.create_commerce_order(text, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_commerce_order_status(bigint, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;

-- Note:
-- Supabase Auth's leaked-password protection is an Auth configuration setting,
-- not a Postgres schema setting. It must be enabled in the project's Auth
-- settings; it is intentionally not faked or altered through SQL.
