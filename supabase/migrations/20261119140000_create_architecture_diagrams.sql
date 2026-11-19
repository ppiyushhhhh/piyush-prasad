-- =============================================================================
-- Migration: Create Interactive Infrastructure Architecture System
-- Description: Stores verified cloud infrastructure topologies, node schemas,
--              connection flows, security boundaries, and view configurations.
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'portfolio_projects'
    ) THEN
        CREATE TABLE IF NOT EXISTS public.architecture_diagrams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID REFERENCES public.portfolio_projects(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            architecture_type TEXT NOT NULL DEFAULT 'cloud',
            diagram_data JSONB NOT NULL DEFAULT '{"version":1,"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}}'::jsonb,
            is_published BOOLEAN NOT NULL DEFAULT true,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    ELSE
        CREATE TABLE IF NOT EXISTS public.architecture_diagrams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            architecture_type TEXT NOT NULL DEFAULT 'cloud',
            diagram_data JSONB NOT NULL DEFAULT '{"version":1,"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}}'::jsonb,
            is_published BOOLEAN NOT NULL DEFAULT true,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    END IF;
END $$;

-- Indexes for performance, slug queries, and publication filters
CREATE INDEX IF NOT EXISTS idx_architecture_diagrams_slug 
    ON public.architecture_diagrams(slug);

CREATE INDEX IF NOT EXISTS idx_architecture_diagrams_published 
    ON public.architecture_diagrams(is_published);

CREATE INDEX IF NOT EXISTS idx_architecture_diagrams_project_id 
    ON public.architecture_diagrams(project_id);

CREATE INDEX IF NOT EXISTS idx_architecture_diagrams_display_order 
    ON public.architecture_diagrams(display_order ASC, created_at DESC);

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_architecture_diagrams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_architecture_diagrams_updated_at ON public.architecture_diagrams;
CREATE TRIGGER trg_architecture_diagrams_updated_at
    BEFORE UPDATE ON public.architecture_diagrams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_architecture_diagrams_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.architecture_diagrams ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Access Control Policies:
-- 1. Public visitors can SELECT published diagrams only.
-- 2. Verified administrators can SELECT all diagrams (published & drafts).
-- 3. Only verified administrators with 'admin' role can INSERT, UPDATE, DELETE.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read published diagrams" ON public.architecture_diagrams;
CREATE POLICY "Public read published diagrams"
    ON public.architecture_diagrams
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Admin select all diagrams" ON public.architecture_diagrams;
CREATE POLICY "Admin select all diagrams"
    ON public.architecture_diagrams
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin insert diagrams" ON public.architecture_diagrams;
CREATE POLICY "Admin insert diagrams"
    ON public.architecture_diagrams
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin update diagrams" ON public.architecture_diagrams;
CREATE POLICY "Admin update diagrams"
    ON public.architecture_diagrams
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin delete diagrams" ON public.architecture_diagrams;
CREATE POLICY "Admin delete diagrams"
    ON public.architecture_diagrams
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
