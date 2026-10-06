-- =============================================================================
-- Migration: Enforce Rule: Only Admin Can Change Data or Create a User
-- 
-- 1. Restricts all data mutations (INSERT, UPDATE, DELETE) across all managed
--    tables strictly to verified administrators (public.has_role(auth.uid(), 'admin')).
-- 2. Restricts user creation and role assignments in public.user_roles strictly to admins.
-- 3. Attaches trigger to public.user_roles to prevent privilege escalation.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper Function: Check if user has a specific role (if not exists)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    );
$$;

-- Grant execution to public & authenticated
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, anon;


-- -----------------------------------------------------------------------------
-- 1. Strict Policy on public.user_roles (Only Admin Can Create / Assign Roles)
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admins can read all roles
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own role
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ONLY admins can insert into user_roles
DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
CREATE POLICY "Only admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ONLY admins can update user_roles
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
CREATE POLICY "Only admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ONLY admins can delete user_roles
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;
CREATE POLICY "Only admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));


-- -----------------------------------------------------------------------------
-- Trigger: Hard Block Against Non-Admin Role Manipulation
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_admin_for_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow service role context (auth.uid() is null when invoked by backend service key)
    -- If invoked by an authenticated client, verify caller has admin role
    IF auth.uid() IS NOT NULL THEN
        IF NOT public.has_role(auth.uid(), 'admin') THEN
            RAISE EXCEPTION 'Forbidden: Only administrators can create users or change roles.';
        END IF;
    END IF;
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_admin_on_user_roles ON public.user_roles;
CREATE TRIGGER trg_enforce_admin_on_user_roles
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_admin_for_role_changes();


-- -----------------------------------------------------------------------------
-- 2. Strict RLS on Application Telemetry Tables (Only Admin Can Mutate Data)
-- -----------------------------------------------------------------------------

-- Macro loop to apply strict mutation policies across application tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'website_health_checks',
        'performance_history',
        'deployment_history',
        'chat_activity',
        'health_reports',
        'admin_audit_log',
        'database_backups',
        'manual_database_backups',
        'backup_monthly_reports'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Check if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

            -- Drop permissive mutation policies if any exist
            EXECUTE format('DROP POLICY IF EXISTS "Admins can mutate %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Only admin can insert into %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Only admin can update %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Only admin can delete from %I" ON public.%I;', t, t);

            -- Policy: Only admin can insert data
            EXECUTE format('
                CREATE POLICY "Only admin can insert into %I" 
                ON public.%I 
                FOR INSERT 
                TO authenticated 
                WITH CHECK (public.has_role(auth.uid(), ''admin''));
            ', t, t);

            -- Policy: Only admin can update data
            EXECUTE format('
                CREATE POLICY "Only admin can update %I" 
                ON public.%I 
                FOR UPDATE 
                TO authenticated 
                USING (public.has_role(auth.uid(), ''admin''))
                WITH CHECK (public.has_role(auth.uid(), ''admin''));
            ', t, t);

            -- Policy: Only admin can delete data
            EXECUTE format('
                CREATE POLICY "Only admin can delete from %I" 
                ON public.%I 
                FOR DELETE 
                TO authenticated 
                USING (public.has_role(auth.uid(), ''admin''));
            ', t, t);
        END IF;
    END LOOP;
END $$;
