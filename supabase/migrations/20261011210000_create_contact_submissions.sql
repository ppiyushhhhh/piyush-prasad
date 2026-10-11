-- =============================================================================
-- Migration: Create Contact Submissions Table with Strict RLS
-- Description: Database-backed storage for portfolio contact messages
-- Authoritative record: public.contact_submissions
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    admin_email_status TEXT NOT NULL DEFAULT 'pending',
    visitor_email_status TEXT NOT NULL DEFAULT 'pending',
    admin_email_sent_at TIMESTAMPTZ,
    visitor_email_sent_at TIMESTAMPTZ,
    email_error TEXT
);

-- Performance and query indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
    ON public.contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
    ON public.contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
    ON public.contact_submissions(status);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Access Control Policies:
-- Anonymous / public users cannot read, modify, or delete any records.
-- All submissions are inserted server-side using the secure service role key.
-- Only verified administrators can view, update, or prune contact submissions.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
