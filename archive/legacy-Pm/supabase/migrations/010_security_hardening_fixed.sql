-- EPIC02: Supabase Security Hardening (fixed to the actual schema)
--
-- Actual function signature:
--   public.update_order_status(text, text, text)
-- Actual admin_users authorization model:
--   user_id = auth.uid(), role IN ('admin', 'staff')
-- There is no public.admin_users.is_admin column.

-- 1. Lock down update_order_status and remove SECURITY DEFINER execution path.
REVOKE EXECUTE ON FUNCTION public.update_order_status(text, text, text) FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.update_order_status(text, text, text) TO service_role;
ALTER FUNCTION public.update_order_status(text, text, text) SECURITY INVOKER;

-- 2. admin_users: prevent anon access and allow a signed-in user to read only its own admin record.
DROP POLICY IF EXISTS admin_users_select_self ON public.admin_users;
CREATE POLICY admin_users_select_self ON public.admin_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 3. orders: prevent anon access and restrict reads to admin/staff users.
DROP POLICY IF EXISTS orders_select_admin_staff ON public.orders;
CREATE POLICY orders_select_admin_staff ON public.orders
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
);
