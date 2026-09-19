-- Migration 003: indexes and RLS / function execution hardening
-- Adds useful indexes for orders/admin_users and applies a safe REVOKE/GRANT
-- Uses dynamic SQL to locate update_order_status function(s) and set execute privileges

-- Create indexes to improve admin query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders (order_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users (user_id);

-- Improve performance for admin_users lookups by ensuring the user_id uses proper type
-- (Assumes admin_users.user_id is uuid referencing auth.users.id)

-- Revoke EXECUTE from PUBLIC for any function named update_order_status and grant to authenticated
DO $$
DECLARE
  r RECORD;
  v_sql TEXT;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS fullname
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'update_order_status'
  LOOP
    v_sql := format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC;', r.fullname);
    EXECUTE v_sql;
    v_sql := format('GRANT EXECUTE ON FUNCTION %s TO authenticated;', r.fullname);
    EXECUTE v_sql;
  END LOOP;
END$$;

-- Note: the 'authenticated' role is the Supabase role used for logged-in requests. If your project uses
-- a different role name for authenticated users, adjust accordingly.
