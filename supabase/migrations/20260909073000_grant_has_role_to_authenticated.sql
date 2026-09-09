-- Fix: Restore EXECUTE permission on public.has_role() for the authenticated role.
--
-- Migration 20260907102626 correctly revoked EXECUTE from PUBLIC and anon to
-- prevent unauthenticated callers from invoking the function directly.  However,
-- it also revoked EXECUTE from authenticated, which broke every RLS policy that
-- calls public.has_role(auth.uid(), 'admin') — because PostgreSQL evaluates
-- policy expressions under the calling role's permissions.
--
-- The function is SECURITY DEFINER, so granting EXECUTE to authenticated does
-- NOT let callers read user_roles directly; they can only obtain a boolean
-- result scoped to their own auth.uid().

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
