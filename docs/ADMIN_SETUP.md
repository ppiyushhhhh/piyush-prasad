# Admin Dashboard Setup

This document explains how to create and manage admin access for the private monitoring dashboard at `/dashboard`.

## Prerequisites

- Access to the [Supabase project dashboard](https://supabase.com/dashboard/project/xseiuzpzzfvtrkmohogn)
- The project must have Supabase Auth enabled with email/password provider

## Creating Your First Admin User

### Step 1 — Create the user in Supabase Authentication

1. Open the Supabase dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email address and a strong password (minimum 8 characters)
4. Toggle **Auto Confirm User** to skip email verification (recommended for the first admin)
5. Click **Create user**
6. Note the user's **UUID** shown in the user list

### Step 2 — Grant admin role

Open the Supabase dashboard → **SQL Editor** and run:

```sql
-- Replace YOUR_ADMIN_EMAIL with the email you used in Step 1
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'YOUR_ADMIN_EMAIL'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3 — Sign in

1. Navigate to `https://www.piyushprasad.in/dashboard/login`
2. Enter the email and password from Step 1
3. You should be redirected to `/dashboard`

## How Authentication Works

```
/dashboard/login
        │
        ▼
supabase.auth.signInWithPassword()
        │
        ▼
  Session established
        │
        ▼
  Query user_roles table:
  SELECT role FROM user_roles
  WHERE user_id = <auth.uid>
  AND role = 'admin'
        │
        ├── Row found → Redirect to /dashboard ✓
        │
        └── No row → "This account does not have admin access" ✗
```

All `/dashboard/*` routes are protected by the same guard in `src/routes/dashboard.tsx`:

- **No session** → redirect to `/dashboard/login`
- **Session but no admin role** → blocked with sign-out option
- **Session with admin role** → full dashboard access

## Security Model

### Row Level Security (RLS)

| Table | Policy | Access |
|---|---|---|
| `user_roles` | Users can read own roles | `SELECT WHERE user_id = auth.uid()` |
| `website_health_checks` | Admins only | `SELECT WHERE has_role(uid, 'admin')` |
| `performance_history` | Admins only | Same |
| `deployment_history` | Admins only | Same |
| `chat_activity` | Admins only | Same |
| `health_reports` | Admins only | Same |

### Key Security Properties

- `has_role()` is `SECURITY DEFINER` — runs with elevated privileges but only returns a boolean
- `EXECUTE` on `has_role()` is granted only to `authenticated` — not `anon` or `public`
- Admin role is assigned exclusively through the `user_roles` table — there is no self-service admin signup
- Monitoring table writes use `service_role` (server-side only)
- The dashboard is marked `noindex, nofollow` in robots meta

## Revoking Admin Access

```sql
-- Replace YOUR_ADMIN_EMAIL with the email to revoke
DELETE FROM public.user_roles
WHERE role = 'admin'
AND user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL');
```

## Password Reset

Admins can reset their password from the login page:

1. Go to `/dashboard/login`
2. Click **Forgot password?**
3. Enter the registered email address
4. Check email for the reset link
5. Follow the link to `/dashboard/reset-password` and set a new password

## Troubleshooting

### "Incorrect email or password"
- Verify the user exists in Supabase Authentication → Users
- Check that the password is correct
- Try resetting the password

### "This email address has not been confirmed yet"
- Open Supabase Authentication → Users
- Find the user and confirm their email, or toggle Auto Confirm

### "This account does not have admin access"
- The user exists and signed in successfully, but has no `admin` row in `user_roles`
- Run the SQL from Step 2 above to grant admin access

### Dashboard shows "Checking access…" indefinitely
- Verify `SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in `.env`
- Check the browser console for network errors
