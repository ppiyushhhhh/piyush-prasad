<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Security & Access Control Rules

### Rule: Only Admin Can Change Data or Create a User
1. **User Creation & Management:**
   - Only authenticated users with the verified `admin` role in `public.user_roles` are allowed to create users, invite users, update user passwords, change user roles, or delete/disable user accounts.
   - Any request or API call to provision, modify, or delete users by non-admins or unauthenticated callers must be rejected immediately with HTTP 403 / "Forbidden: Administrator role required".

2. **Data Mutations (Insert, Update, Delete):**
   - Only users with the verified `admin` role (`public.has_role(auth.uid(), 'admin')`) are authorized to mutate database records (INSERT, UPDATE, DELETE) across all managed application tables:
     * `website_health_checks`
     * `performance_history`
     * `deployment_history`
     * `chat_activity`
     * `health_reports`
     * `user_roles`
     * `admin_audit_log`
     * `database_backups`
     * `manual_database_backups`
     * `backup_monthly_reports`
   - Public and non-admin authenticated users have read-only access (SELECT) strictly where required for public telemetry/monitoring, and are strictly prevented from changing any data.

3. **Database RLS Policies:**
   - All PostgreSQL tables in Supabase must have Row Level Security (RLS) enabled.
   - Write policies (FOR INSERT, FOR UPDATE, FOR DELETE) must strictly enforce `public.has_role(auth.uid(), 'admin')`.

