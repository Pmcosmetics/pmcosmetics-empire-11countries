-- Migration 004: cleanup duplicate non-unique indexes in public schema
-- This migration finds duplicate non-unique, non-primary indexes on the same table
-- with identical index definitions and drops all but one copy (keeps the lowest-oid copy).
-- WARNING: DROP INDEX (non-CONCURRENT) will take locks. On high-traffic production DBs,
-- consider running DROP INDEX CONCURRENTLY manually during maintenance window.

DO $$
DECLARE
  grp RECORD;
  idxs TEXT[];
  keep_index TEXT;
  i INT;
BEGIN
  -- Find groups of duplicate index definitions on the same table
  FOR grp IN
    SELECT tablename, indexdef, array_agg(indexname ORDER BY indexrelid) AS index_names
    FROM (
      SELECT
        t.relname AS tablename,
        c.relname AS indexname,
        c.oid   AS indexrelid,
        pg_get_indexdef(c.oid) AS indexdef,
        i.indisprimary,
        i.indisunique
      FROM pg_class c
      JOIN pg_namespace ns ON c.relnamespace = ns.oid
      JOIN pg_index i ON c.oid = i.indexrelid
      JOIN pg_class t ON i.indrelid = t.oid
      WHERE ns.nspname = 'public'
        AND i.indisprimary = false   -- skip primary key indexes
        AND i.indisunique = false    -- skip unique indexes
    ) s
    GROUP BY tablename, indexdef
    HAVING count(*) > 1
  LOOP
    idxs := grp.index_names;
    -- keep the first (lowest OID order as aggregated); drop the rest
    IF array_length(idxs,1) > 1 THEN
      keep_index := idxs[1];
      RAISE NOTICE 'Keeping index % on table % and dropping duplicates: %', keep_index, grp.tablename, array_to_string(idxs[2:array_length(idxs,1)], ', ');
      FOR i IN 2 .. array_length(idxs,1) LOOP
        EXECUTE format('DROP INDEX IF EXISTS public.%I;', idxs[i]);
      END LOOP;
    END IF;
  END LOOP;
END$$;
