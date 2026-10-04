-- Migration: Create database_backups table and 7-day retention cleanup helper
-- Stores pre-deletion JSON backups and manual administrative database snapshots

CREATE TABLE IF NOT EXISTS public.database_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    backup_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'auto_prune_7d'
    tables_included TEXT[] NOT NULL DEFAULT '{}',
    total_records INT NOT NULL DEFAULT 0,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_size_pretty TEXT NOT NULL DEFAULT '0 B',
    pruned_records_count INT NOT NULL DEFAULT 0,
    backup_data JSONB, -- JSON snapshot of records
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index on created_at for fast retrieval of recent backups
CREATE INDEX IF NOT EXISTS idx_database_backups_created_at 
ON public.database_backups (created_at DESC);

-- Enable RLS
ALTER TABLE public.database_backups ENABLE ROW LEVEL SECURITY;

-- Admins can view and create backups
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'database_backups' AND policyname = 'Admins can view database backups'
    ) THEN
        CREATE POLICY "Admins can view database backups" 
        ON public.database_backups 
        FOR SELECT 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'database_backups' AND policyname = 'Admins can insert database backups'
    ) THEN
        CREATE POLICY "Admins can insert database backups" 
        ON public.database_backups 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- Service role has full access
GRANT ALL ON public.database_backups TO service_role;
GRANT SELECT, INSERT ON public.database_backups TO authenticated;

-- Stored procedure to safely prune records older than N days (default 7 days)
-- STRICTLY PRESERVES all users and user roles!
CREATE OR REPLACE FUNCTION public.prune_telemetry_older_than(days_retention INT DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    cutoff_time TIMESTAMPTZ := NOW() - (days_retention || ' days')::INTERVAL;
    health_deleted INT := 0;
    perf_deleted INT := 0;
    deploy_deleted INT := 0;
    chat_deleted INT := 0;
    reports_deleted INT := 0;
    audit_deleted INT := 0;
    total_deleted INT := 0;
BEGIN
    -- 1. website_health_checks
    WITH del AS (
        DELETE FROM public.website_health_checks
        WHERE checked_at < cutoff_time
        RETURNING id
    )
    SELECT count(*) INTO health_deleted FROM del;

    -- 2. performance_history
    WITH del AS (
        DELETE FROM public.performance_history
        WHERE measured_at < cutoff_time
        RETURNING id
    )
    SELECT count(*) INTO perf_deleted FROM del;

    -- 3. deployment_history
    WITH del AS (
        DELETE FROM public.deployment_history
        WHERE occurred_at < cutoff_time
        RETURNING id
    )
    SELECT count(*) INTO deploy_deleted FROM del;

    -- 4. chat_activity
    WITH del AS (
        DELETE FROM public.chat_activity
        WHERE occurred_at < cutoff_time
        RETURNING id
    )
    SELECT count(*) INTO chat_deleted FROM del;

    -- 5. health_reports
    WITH del AS (
        DELETE FROM public.health_reports
        WHERE created_at < cutoff_time
        RETURNING id
    )
    SELECT count(*) INTO reports_deleted FROM del;

    -- 6. admin_audit_log (older than cutoff, keep audit trail clean)
    WITH del AS (
        DELETE FROM public.admin_audit_log
        WHERE created_at < cutoff_time
        RETURNING id
    )
    SELECT count(*) INTO audit_deleted FROM del;

    total_deleted := health_deleted + perf_deleted + deploy_deleted + chat_deleted + reports_deleted + audit_deleted;

    RETURN jsonb_build_object(
        'cutoff_time', cutoff_time,
        'days_retention', days_retention,
        'total_deleted', total_deleted,
        'website_health_checks', health_deleted,
        'performance_history', perf_deleted,
        'deployment_history', deploy_deleted,
        'chat_activity', chat_deleted,
        'health_reports', reports_deleted,
        'admin_audit_log', audit_deleted,
        'users_preserved', true
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.prune_telemetry_older_than(INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.prune_telemetry_older_than(INT) TO authenticated;
