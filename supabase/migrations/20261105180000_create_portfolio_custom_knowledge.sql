-- =============================================================================
-- Migration: Create Portfolio Custom Knowledge and FAQs System
-- Description: Stores dynamic administrator facts, FAQs, and public knowledge
--              retrieved dynamically by the portfolio AI chatbot (Ask Piyush AI).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_custom_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'General',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_custom_knowledge_published
    ON public.portfolio_custom_knowledge(is_published, display_order ASC);

CREATE INDEX IF NOT EXISTS idx_custom_knowledge_category
    ON public.portfolio_custom_knowledge(category);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_custom_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_custom_knowledge_updated_at ON public.portfolio_custom_knowledge;
CREATE TRIGGER trg_custom_knowledge_updated_at
    BEFORE UPDATE ON public.portfolio_custom_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_custom_knowledge_updated_at();

-- Enable Row Level Security
ALTER TABLE public.portfolio_custom_knowledge ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Policies:
-- 1. Public (anon & authenticated) can SELECT published items only.
-- 2. Verified administrators can SELECT, INSERT, UPDATE, DELETE all items.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read published custom knowledge" ON public.portfolio_custom_knowledge;
CREATE POLICY "Public read published custom knowledge"
    ON public.portfolio_custom_knowledge
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Admin manage custom knowledge" ON public.portfolio_custom_knowledge;
CREATE POLICY "Admin manage custom knowledge"
    ON public.portfolio_custom_knowledge
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grants
GRANT SELECT ON public.portfolio_custom_knowledge TO anon, authenticated;
GRANT ALL ON public.portfolio_custom_knowledge TO authenticated;
GRANT ALL ON public.portfolio_custom_knowledge TO service_role;
