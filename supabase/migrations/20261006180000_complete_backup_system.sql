-- =============================================================================
-- COMPLETE SUPABASE BACKUP SYSTEM MIGRATION (Idempotent)
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It creates all tables, indexes, storage buckets, and RLS policies required for:
-- 1. Automated & Manual Database Backups (public.database_backups)
-- 2. Monthly Summary Reporting (public.backup_monthly_reports)
-- 3. Administrative Audit Logging (public.admin_audit_log)
-- 4. Private Storage Bucket (storage.buckets: 'database-backups')
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLE: public.database_backups
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.database_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    backup_date DATE NOT NULL DEFAULT CURRENT_DATE,
    backup_time TIME NOT NULL DEFAULT CURRENT_TIME,
    filename TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'DELETED'
    backup_type TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'manual', 'auto_prune_7d'
    tables_included TEXT[] NOT NULL DEFAULT '{}',
    total_records INT NOT NULL DEFAULT 0,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_size_pretty TEXT NOT NULL DEFAULT '0 B',
    pruned_records_count INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'database-backups',
    storage_path TEXT DEFAULT NULL,
    backup_data JSONB,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Ensure all columns exist if table was partially created
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS backup_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS backup_time TIME NOT NULL DEFAULT CURRENT_TIME;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS filename TEXT NOT NULL DEFAULT '';
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'SUCCESS';
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS backup_type TEXT NOT NULL DEFAULT 'daily';
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS tables_included TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS total_records INT NOT NULL DEFAULT 0;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS file_size_pretty TEXT NOT NULL DEFAULT '0 B';
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS pruned_records_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS error_message TEXT DEFAULT NULL;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'database-backups';
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS storage_path TEXT DEFAULT NULL;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS backup_data JSONB;
ALTER TABLE public.database_backups ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Indexes for database_backups
CREATE INDEX IF NOT EXISTS idx_database_backups_created_at ON public.database_backups (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_database_backups_backup_date ON public.database_backups (backup_date DESC);
CREATE INDEX IF NOT EXISTS idx_database_backups_status ON public.database_backups (status);
CREATE INDEX IF NOT EXISTS idx_database_backups_deleted_at ON public.database_backups (deleted_at);

-- RLS for database_backups
ALTER TABLE public.database_backups ENABLE ROW LEVEL SECURITY;

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

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'database_backups' AND policyname = 'Admins can update database backups'
    ) THEN
        CREATE POLICY "Admins can update database backups" 
        ON public.database_backups 
        FOR UPDATE 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'))
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

GRANT ALL ON public.database_backups TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.database_backups TO authenticated;


-- -----------------------------------------------------------------------------
-- 2. TABLE: public.backup_monthly_reports
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.backup_monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    month_name TEXT NOT NULL,
    year INT NOT NULL CHECK (year >= 2020),
    total_backups INT NOT NULL DEFAULT 0,
    successful_backups INT NOT NULL DEFAULT 0,
    failed_backups INT NOT NULL DEFAULT 0,
    success_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    total_backup_size_bytes BIGINT NOT NULL DEFAULT 0,
    total_backup_size_pretty TEXT NOT NULL DEFAULT '0 B',
    deleted_backups_count INT NOT NULL DEFAULT 0,
    report_generated_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    report_status TEXT NOT NULL DEFAULT 'SUCCESS',
    report_file_url TEXT,
    summary_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_monthly_backup_report UNIQUE (year, month)
);

CREATE INDEX IF NOT EXISTS idx_backup_monthly_reports_year_month 
ON public.backup_monthly_reports (year DESC, month DESC);

ALTER TABLE public.backup_monthly_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backup_monthly_reports' AND policyname = 'Admins can view monthly backup reports'
    ) THEN
        CREATE POLICY "Admins can view monthly backup reports" 
        ON public.backup_monthly_reports 
        FOR SELECT 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backup_monthly_reports' AND policyname = 'Admins can insert or update monthly backup reports'
    ) THEN
        CREATE POLICY "Admins can insert or update monthly backup reports" 
        ON public.backup_monthly_reports 
        FOR ALL 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'))
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

GRANT ALL ON public.backup_monthly_reports TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.backup_monthly_reports TO authenticated;


-- -----------------------------------------------------------------------------
-- 3. TABLE: public.admin_audit_log
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log (action);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_audit_log' AND policyname = 'Admins can view audit log'
    ) THEN
        CREATE POLICY "Admins can view audit log" 
        ON public.admin_audit_log 
        FOR SELECT 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

GRANT ALL ON public.admin_audit_log TO service_role;
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;


-- -----------------------------------------------------------------------------
-- 4. STORAGE: Private 'database-backups' Bucket
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'database-backups',
    'database-backups',
    FALSE,
    52428800, -- 50 MB
    ARRAY['application/sql', 'application/x-sql', 'text/plain', 'text/sql', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
    public = FALSE,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/sql', 'application/x-sql', 'text/plain', 'text/sql', 'application/json'];

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admins can access database backup objects'
    ) THEN
        CREATE POLICY "Admins can access database backup objects"
        ON storage.objects
        FOR ALL
        TO authenticated
        USING (bucket_id = 'database-backups' AND public.has_role(auth.uid(), 'admin'))
        WITH CHECK (bucket_id = 'database-backups' AND public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
