-- =============================================================================
-- Migration: Supabase-Based Database Backup System & Monthly Reporting
-- Replaces Web3Forms backup mechanism with private Supabase Storage,
-- rolling 7-day retention & rotation, detailed backup history, and monthly reports.
-- =============================================================================

-- 1. Ensure columns exist on public.database_backups
ALTER TABLE public.database_backups 
ADD COLUMN IF NOT EXISTS backup_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS backup_time TIME NOT NULL DEFAULT CURRENT_TIME,
ADD COLUMN IF NOT EXISTS filename TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS error_message TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'database-backups',
ADD COLUMN IF NOT EXISTS storage_path TEXT DEFAULT NULL;

-- Backfill filename and dates for existing records if empty
UPDATE public.database_backups
SET 
    backup_date = COALESCE(backup_date, created_at::DATE),
    backup_time = COALESCE(backup_time, created_at::TIME),
    filename = CASE 
        WHEN filename IS NULL OR filename = '' THEN 'database-backup-' || TO_CHAR(created_at, 'YYYY-MM-DD') || '.sql'
        ELSE filename 
    END,
    status = COALESCE(status, 'SUCCESS')
WHERE filename IS NULL OR filename = '';

-- Indexes for fast reporting and queries
CREATE INDEX IF NOT EXISTS idx_database_backups_backup_date 
ON public.database_backups (backup_date DESC);

CREATE INDEX IF NOT EXISTS idx_database_backups_status 
ON public.database_backups (status);

CREATE INDEX IF NOT EXISTS idx_database_backups_deleted_at 
ON public.database_backups (deleted_at);

-- 2. Monthly Report History Table
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
    report_status TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'PARTIAL', 'FAILED'
    report_file_url TEXT,
    summary_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_monthly_backup_report UNIQUE (year, month)
);

CREATE INDEX IF NOT EXISTS idx_backup_monthly_reports_year_month 
ON public.backup_monthly_reports (year DESC, month DESC);

-- Enable RLS on monthly reports
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
GRANT SELECT ON public.backup_monthly_reports TO authenticated;

-- 3. Setup Private Supabase Storage Bucket for Database Backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'database-backups',
    'database-backups',
    false, -- STRICTLY PRIVATE: Not publicly accessible
    524288000, -- 500 MB limit
    ARRAY['application/sql', 'text/plain', 'text/x-sql', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    allowed_mime_types = ARRAY['application/sql', 'text/plain', 'text/x-sql', 'application/octet-stream'];

-- RLS policies for storage.objects on database-backups bucket
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can read database backup files'
    ) THEN
        CREATE POLICY "Admins can read database backup files"
        ON storage.objects
        FOR SELECT
        TO authenticated
        USING (bucket_id = 'database-backups' AND public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload database backup files'
    ) THEN
        CREATE POLICY "Admins can upload database backup files"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'database-backups' AND public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete old database backup files'
    ) THEN
        CREATE POLICY "Admins can delete old database backup files"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = 'database-backups' AND public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
