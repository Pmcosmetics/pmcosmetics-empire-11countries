-- EPIC07-B: FINAL LOCKED v2
-- Security hardening for anonymous access using the actual function signatures.

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

-- Defense in depth: revoke EXECUTE from anon for every function currently
-- defined in public, using pg_get_function_identity_arguments() so overloaded
-- functions are addressed with their real signatures.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc AS p
    JOIN pg_namespace AS n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon',
      r.schema_name,
      r.function_name,
      r.identity_args
    );
  END LOOP;
END
$$;

-- Supabase Auth leaked-password protection is an Auth configuration setting,
-- not a Postgres schema setting; it must be enabled in the project's Auth settings.
