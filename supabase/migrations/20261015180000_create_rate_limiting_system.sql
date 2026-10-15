-- =============================================================================
-- Migration: Production-Ready Rate Limiting System
-- 
-- 1. Creates public.rate_limit_configs for configurable limits per endpoint tier
-- 2. Creates public.rate_limit_events for audit logging of blocked/allowed requests
-- 3. Creates public.rate_limit_buckets for atomic distributed sliding window state
-- 4. Creates atomic stored procedures for consuming rate limits and resetting stats
-- 5. Enforces Row Level Security (RLS) strictly adhering to Rule: Only Admin Can Change Data
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table: public.rate_limit_configs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    endpoint_pattern TEXT NOT NULL,
    max_requests INT NOT NULL DEFAULT 60,
    window_seconds INT NOT NULL DEFAULT 60,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default configuration tiers
INSERT INTO public.rate_limit_configs (id, name, description, endpoint_pattern, max_requests, window_seconds, enabled)
VALUES
    ('global', 'Global Master Limit', 'Fallback protection across all incoming requests and routes', '*', 120, 60, TRUE),
    ('api', 'General API Endpoints', 'Standard REST endpoints and background ingestion routes (/api/*)', '/api/*', 60, 60, TRUE),
    ('sensitive', 'Sensitive Operations', 'Compute/AI intensive APIs and outbound contact mailers (/api/contact, /api/chat)', '/api/contact,/api/chat', 15, 60, TRUE),
    ('auth', 'Authentication Endpoints', 'Console sign-in, session verification, and password updates (/dashboard/login, /api/auth)', '/dashboard/login,/api/auth/*', 10, 60, TRUE)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Table: public.rate_limit_events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_identifier TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    http_method TEXT NOT NULL DEFAULT 'GET',
    status_code INT NOT NULL DEFAULT 429,
    action_taken TEXT NOT NULL DEFAULT 'blocked', -- 'blocked' or 'allowed'
    rule_name TEXT NOT NULL DEFAULT 'global',
    request_count INT NOT NULL DEFAULT 1,
    limit_max INT NOT NULL DEFAULT 60,
    window_seconds INT NOT NULL DEFAULT 60,
    user_agent TEXT
);

-- Indexes for fast analytics and time-series aggregation
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_created_at ON public.rate_limit_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_action_taken ON public.rate_limit_events (action_taken, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_endpoint ON public.rate_limit_events (endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_client ON public.rate_limit_events (client_identifier);

-- -----------------------------------------------------------------------------
-- 3. Table: public.rate_limit_buckets (Atomic distributed storage)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
    bucket_key TEXT PRIMARY KEY,
    request_count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires_at ON public.rate_limit_buckets (expires_at);

-- -----------------------------------------------------------------------------
-- 4. Atomic Stored Procedure: Consume Rate Limit (Distributed Sliding Window)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
    p_key TEXT,
    p_max_requests INT,
    p_window_seconds INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INT,
    limit_max INT,
    reset_at TIMESTAMPTZ,
    retry_after_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now TIMESTAMPTZ := clock_timestamp();
    v_expires_at TIMESTAMPTZ;
    v_rec RECORD;
    v_allowed BOOLEAN;
    v_retry_after INT := 0;
BEGIN
    -- Look for existing active bucket with row lock
    SELECT * INTO v_rec
    FROM public.rate_limit_buckets
    WHERE bucket_key = p_key
    FOR UPDATE;

    IF NOT FOUND OR v_rec.expires_at <= v_now THEN
        -- Bucket expired or does not exist: create fresh window
        v_expires_at := v_now + (p_window_seconds || ' seconds')::INTERVAL;
        
        INSERT INTO public.rate_limit_buckets (bucket_key, request_count, window_start, expires_at, updated_at)
        VALUES (p_key, 1, v_now, v_expires_at, v_now)
        ON CONFLICT (bucket_key) DO UPDATE
        SET request_count = 1,
            window_start = v_now,
            expires_at = v_expires_at,
            updated_at = v_now;

        allowed := TRUE;
        current_count := 1;
        limit_max := p_max_requests;
        reset_at := v_expires_at;
        retry_after_seconds := 0;
        RETURN NEXT;
        RETURN;
    ELSE
        -- Existing window is active
        IF v_rec.request_count >= p_max_requests THEN
            -- Limit exceeded
            v_allowed := FALSE;
            v_retry_after := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_rec.expires_at - v_now)))::INT);
            
            -- Increment counter so admin can see violation severity
            UPDATE public.rate_limit_buckets
            SET request_count = request_count + 1,
                updated_at = v_now
            WHERE bucket_key = p_key;

            allowed := FALSE;
            current_count := v_rec.request_count + 1;
            limit_max := p_max_requests;
            reset_at := v_rec.expires_at;
            retry_after_seconds := v_retry_after;
            RETURN NEXT;
            RETURN;
        ELSE
            -- Within limit: increment counter
            UPDATE public.rate_limit_buckets
            SET request_count = request_count + 1,
                updated_at = v_now
            WHERE bucket_key = p_key;

            allowed := TRUE;
            current_count := v_rec.request_count + 1;
            limit_max := p_max_requests;
            reset_at := v_rec.expires_at;
            retry_after_seconds := 0;
            RETURN NEXT;
            RETURN;
        END IF;
    END IF;
END;
$$;

-- Grant execution to service role & postgres
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INT, INT) TO authenticated, service_role, anon;

-- -----------------------------------------------------------------------------
-- 5. Stored Procedure: Reset Rate Limit Stats (Admin Only)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reset_rate_limit_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Enforce admin authorization
    IF auth.uid() IS NOT NULL THEN
        IF NOT public.has_role(auth.uid(), 'admin') THEN
            RAISE EXCEPTION 'Forbidden: Only administrators can reset rate limit statistics.';
        END IF;
    END IF;

    TRUNCATE TABLE public.rate_limit_events;
    TRUNCATE TABLE public.rate_limit_buckets;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_rate_limit_stats() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. Row Level Security Policies (Adhering strictly to Rule: Only Admin Can Change Data)
-- -----------------------------------------------------------------------------
ALTER TABLE public.rate_limit_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Policies for public.rate_limit_configs
DROP POLICY IF EXISTS "Admins can view rate limit configs" ON public.rate_limit_configs;
CREATE POLICY "Admins can view rate limit configs"
ON public.rate_limit_configs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can update rate limit configs" ON public.rate_limit_configs;
CREATE POLICY "Only admin can update rate limit configs"
ON public.rate_limit_configs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can insert rate limit configs" ON public.rate_limit_configs;
CREATE POLICY "Only admin can insert rate limit configs"
ON public.rate_limit_configs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can delete rate limit configs" ON public.rate_limit_configs;
CREATE POLICY "Only admin can delete rate limit configs"
ON public.rate_limit_configs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for public.rate_limit_events
DROP POLICY IF EXISTS "Admins can view rate limit events" ON public.rate_limit_events;
CREATE POLICY "Admins can view rate limit events"
ON public.rate_limit_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can delete rate limit events" ON public.rate_limit_events;
CREATE POLICY "Only admin can delete rate limit events"
ON public.rate_limit_events FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for public.rate_limit_buckets
DROP POLICY IF EXISTS "Admins can view rate limit buckets" ON public.rate_limit_buckets;
CREATE POLICY "Admins can view rate limit buckets"
ON public.rate_limit_buckets FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can delete rate limit buckets" ON public.rate_limit_buckets;
CREATE POLICY "Only admin can delete rate limit buckets"
ON public.rate_limit_buckets FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
