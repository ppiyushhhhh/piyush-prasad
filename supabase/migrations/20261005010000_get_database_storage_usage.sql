-- Migration: Add get_db_storage_usage() RPC function
-- Allows administrators to inspect PostgreSQL database storage, table sizes, and index usage.

CREATE OR REPLACE FUNCTION public.get_db_storage_usage()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  db_size_bytes bigint;
  db_size_pretty text;
  table_sizes jsonb;
BEGIN
  -- Measure total disk storage consumed by current database
  SELECT pg_database_size(current_database()) INTO db_size_bytes;
  SELECT pg_size_pretty(db_size_bytes) INTO db_size_pretty;

  -- Measure individual application table and index sizes
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', table_name,
      'total_bytes', total_bytes,
      'total_pretty', pg_size_pretty(total_bytes),
      'table_bytes', table_bytes,
      'table_pretty', pg_size_pretty(table_bytes),
      'index_bytes', index_bytes,
      'index_pretty', pg_size_pretty(index_bytes)
    )
  )
  INTO table_sizes
  FROM (
    SELECT
      c.relname AS table_name,
      pg_total_relation_size(c.oid) AS total_bytes,
      pg_relation_size(c.oid) AS table_bytes,
      pg_indexes_size(c.oid) AS index_bytes
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
    ORDER BY total_bytes DESC
  ) t;

  RETURN jsonb_build_object(
    'database_size_bytes', db_size_bytes,
    'database_size_pretty', db_size_pretty,
    'table_sizes', COALESCE(table_sizes, '[]'::jsonb)
  );
END;
$$;

-- Grant execution to authenticated users and service_role
GRANT EXECUTE ON FUNCTION public.get_db_storage_usage() TO authenticated, service_role;
