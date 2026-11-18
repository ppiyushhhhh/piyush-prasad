-- =============================================================================
-- Migration: Create Portfolio Projects & Case Studies System with Strict RLS
-- Description: Stores engineering projects, architecture data, technical case
--              studies, deployment status, and associated media.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Personal Project',
    short_description TEXT NOT NULL,
    overview TEXT NOT NULL,
    problem_solved TEXT,
    objectives TEXT,
    solution TEXT,
    technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    architecture_description TEXT,
    architecture_data JSONB,
    implementation_details TEXT,
    cicd_details TEXT,
    security_details TEXT,
    challenges TEXT,
    results TEXT,
    repository_url TEXT,
    live_demo_url TEXT,
    cover_image_url TEXT,
    screenshots JSONB NOT NULL DEFAULT '[]'::jsonb,
    deployment_environment TEXT,
    started_at DATE,
    updated_at_date DATE,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance, search, and sorting
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_slug
    ON public.portfolio_projects(slug);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_published
    ON public.portfolio_projects(is_published);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_category
    ON public.portfolio_projects(category);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured
    ON public.portfolio_projects(is_featured);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_display_order
    ON public.portfolio_projects(display_order ASC, created_at DESC);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_portfolio_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_updated_at
    BEFORE UPDATE ON public.portfolio_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_portfolio_projects_updated_at();

-- Enable Row Level Security
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Access Control Policies:
-- 1. Public visitors can SELECT published projects only.
-- 2. Verified administrators can SELECT all projects (both published & drafts).
-- 3. Only verified administrators with 'admin' role can INSERT, UPDATE, DELETE.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read published projects" ON public.portfolio_projects;
CREATE POLICY "Public read published projects"
    ON public.portfolio_projects
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Admin select all projects" ON public.portfolio_projects;
CREATE POLICY "Admin select all projects"
    ON public.portfolio_projects
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin insert projects" ON public.portfolio_projects;
CREATE POLICY "Admin insert projects"
    ON public.portfolio_projects
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin update projects" ON public.portfolio_projects;
CREATE POLICY "Admin update projects"
    ON public.portfolio_projects
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin delete projects" ON public.portfolio_projects;
CREATE POLICY "Admin delete projects"
    ON public.portfolio_projects
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Grants
GRANT SELECT ON public.portfolio_projects TO anon, authenticated;
GRANT ALL ON public.portfolio_projects TO authenticated;
GRANT ALL ON public.portfolio_projects TO service_role;

-- -----------------------------------------------------------------------------
-- Storage Bucket: project-media
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-media',
    'project-media',
    true,
    10485760, -- 10 MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- Storage Policies
DROP POLICY IF EXISTS "Public read project media" ON storage.objects;
CREATE POLICY "Public read project media"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'project-media');

DROP POLICY IF EXISTS "Admin insert project media" ON storage.objects;
CREATE POLICY "Admin insert project media"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin update project media" ON storage.objects;
CREATE POLICY "Admin update project media"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin delete project media" ON storage.objects;
CREATE POLICY "Admin delete project media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));
