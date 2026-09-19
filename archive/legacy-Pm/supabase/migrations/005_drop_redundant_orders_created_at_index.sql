-- Remove the redundant created_at index that duplicates the existing orders_created_at_idx.
-- Safe to run on databases where the redundant index has already been removed.
DROP INDEX IF EXISTS public.idx_orders_created_at;
