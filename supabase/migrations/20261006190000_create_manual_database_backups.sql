-- =============================================================================
-- Migration: Create manual_database_backups Table & RLS Policies
-- Dedicated table for administrative manual snapshots taken on demand.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.manual_database_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    backup_date DATE NOT NULL DEFAULT CURRENT_DATE,
    backup_time TIME NOT NULL DEFAULT CURRENT_TIME,
    filename TEXT NOT NULL,
    admin_email TEXT NOT NULL DEFAULT 'admin@piyushprasad.in',
    status TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED'
    tables_included TEXT[] NOT NULL DEFAULT '{}',
    total_records INT NOT NULL DEFAULT 0,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_size_pretty TEXT NOT NULL DEFAULT '0 B',
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    email_recipient TEXT,
    storage_path TEXT,
    backup_data JSONB,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index on created_at for fast descending query
CREATE INDEX IF NOT EXISTS idx_manual_database_backups_created_at 
ON public.manual_database_backups (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_manual_database_backups_date 
ON public.manual_database_backups (backup_date DESC);

-- Enable Row Level Security
ALTER TABLE public.manual_database_backups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'manual_database_backups' AND policyname = 'Admins can view manual database backups'
    ) THEN
        CREATE POLICY "Admins can view manual database backups" 
        ON public.manual_database_backups 
        FOR SELECT 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'manual_database_backups' AND policyname = 'Admins can insert manual database backups'
    ) THEN
        CREATE POLICY "Admins can insert manual database backups" 
        ON public.manual_database_backups 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

GRANT ALL ON public.manual_database_backups TO service_role;
GRANT SELECT, INSERT ON public.manual_database_backups TO authenticated;
