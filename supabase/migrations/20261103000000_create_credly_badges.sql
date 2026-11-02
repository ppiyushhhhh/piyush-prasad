-- =============================================================================
-- Migration: Create Credly Digital Badges System with Storage and Strict RLS
-- Description: Stores professional digital badges earned via Credly,
--              manages display ordering, publishing states, skills, and images.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.credly_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    description TEXT,
    badge_image_url TEXT NOT NULL,
    badge_storage_path TEXT,
    credly_url TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    skills TEXT[] NOT NULL DEFAULT '{}'::text[],
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance and sorting
CREATE INDEX IF NOT EXISTS idx_credly_badges_display_order
    ON public.credly_badges(display_order ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credly_badges_is_published
    ON public.credly_badges(is_published);

CREATE INDEX IF NOT EXISTS idx_credly_badges_issuer
    ON public.credly_badges(issuer);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_credly_badges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_credly_badges_updated_at ON public.credly_badges;
CREATE TRIGGER trg_credly_badges_updated_at
    BEFORE UPDATE ON public.credly_badges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_credly_badges_updated_at();

-- Enable Row Level Security
ALTER TABLE public.credly_badges ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Access Control Policies:
-- 1. Public users can SELECT published badges only.
-- 2. Verified administrators can SELECT all badges (both published & draft).
-- 3. Only verified administrators with the 'admin' role can INSERT, UPDATE, DELETE.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read published badges" ON public.credly_badges;
CREATE POLICY "Public read published badges"
    ON public.credly_badges
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Admin select all badges" ON public.credly_badges;
CREATE POLICY "Admin select all badges"
    ON public.credly_badges
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin insert badges" ON public.credly_badges;
CREATE POLICY "Admin insert badges"
    ON public.credly_badges
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin update badges" ON public.credly_badges;
CREATE POLICY "Admin update badges"
    ON public.credly_badges
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin delete badges" ON public.credly_badges;
CREATE POLICY "Admin delete badges"
    ON public.credly_badges
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Grants
GRANT SELECT ON public.credly_badges TO anon, authenticated;
GRANT ALL ON public.credly_badges TO authenticated;
GRANT ALL ON public.credly_badges TO service_role;

-- -----------------------------------------------------------------------------
-- Dedicated Storage Bucket: credly-badges
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'credly-badges',
    'credly-badges',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- Storage bucket access policies
DROP POLICY IF EXISTS "Public can view badge images" ON storage.objects;
CREATE POLICY "Public can view badge images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'credly-badges');

DROP POLICY IF EXISTS "Admin can upload badge images" ON storage.objects;
CREATE POLICY "Admin can upload badge images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'credly-badges'
        AND public.has_role(auth.uid(), 'admin')
    );

DROP POLICY IF EXISTS "Admin can update badge images" ON storage.objects;
CREATE POLICY "Admin can update badge images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'credly-badges'
        AND public.has_role(auth.uid(), 'admin')
    )
    WITH CHECK (
        bucket_id = 'credly-badges'
        AND public.has_role(auth.uid(), 'admin')
    );

DROP POLICY IF EXISTS "Admin can delete badge images" ON storage.objects;
CREATE POLICY "Admin can delete badge images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'credly-badges'
        AND public.has_role(auth.uid(), 'admin')
    );
