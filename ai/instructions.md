# Project Instructions for AI Agents

> **File:** `ai/instructions.md`  
> **Status:** Authoritative Guidance & Constraints  
> **Last Updated:** 2026-10-17  
> **Project:** Piyush Prasad Portfolio & CloudOps Observability Console  

---

## 1. Overview & Core Directives

This document sets mandatory guidelines, constraints, and project conventions for any AI agent interacting with this repository. These instructions are derived directly from the project's codebase, configuration, git history, and user-defined rules.

---

## 2. Mandatory Project Rules (Non-Negotiable)

### 2.1 Lovable Platform Synchronization (Existing Rule — AGENTS.md)
* **DO NOT** rewrite published git history (no force pushing, amending, or rebasing commits already pushed to remote). This repository is connected to [Lovable](https://lovable.dev). Rewriting git history breaks project synchronization on Lovable's side and can cause loss of project history.
* Ensure all commits keep the connected branch in a clean, functional, buildable state.

### 2.2 Security & Access Control: Rule: Only Admin Can Change Data or Create a User (Existing Rule — AGENTS.md)
* **User Management & Creation:**
  * Only authenticated users with the verified `admin` role in `public.user_roles` are permitted to create users, invite users, update user passwords, change user roles, or delete/disable user accounts.
  * Any request or API call to provision, modify, or delete users by unauthenticated callers or non-admins must be immediately rejected with HTTP 403 / "Forbidden: Administrator role required".
* **Data Mutations (INSERT, UPDATE, DELETE):**
  * Only users with the verified `admin` role (`public.has_role(auth.uid(), 'admin')`) are authorized to mutate database records across all managed application tables:
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
    * `contact_submissions`
    * `rate_limit_configs`
  * Public and non-admin authenticated users have read-only access (`SELECT`) strictly where required for public telemetry/monitoring, and are strictly blocked from mutating any records.
* **Database RLS Policies:**
  * Every PostgreSQL table in Supabase must have Row Level Security (RLS) enabled.
  * Write policies (`FOR INSERT`, `FOR UPDATE`, `FOR DELETE`) must enforce `public.has_role(auth.uid(), 'admin')`.
* **Permanent Retention of User Accounts:**
  * Automated retention and database cleanup procedures must **NEVER** delete, prune, or modify rows in `auth.users` or `public.user_roles`. These tables are strictly protected.

### 2.3 Secret Leakage Prevention (Existing Rule — ci.yml & security standards)
* **NEVER** prefix server-only credentials with `VITE_`.
* The `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** appear in client-side code, client bundles, or repository source. CI explicitly scans for `VITE_GEMINI_API_KEY` and fails the build if found.
* All public telemetry endpoints (`/api/public/*`) requiring elevated database writes must use constant-time token comparison (`safeEqual`) against server environment variables (`MONITORING_INGEST_TOKEN`, `CRON_SECRET`, `BACKUP_CRON_SECRET`).

---

## 3. Architecture Constraints

### 3.1 Framework & Server Model
* **Framework:** TanStack Start (`@tanstack/react-start`) with TanStack Router (`@tanstack/react-router`) running on React 19 and Vite 8.
* **Server Runtimes:** Server functions (`createServerFn`) and server route handlers (`server.handlers`) run via Nitro (configured for Cloudflare / Vercel Edge targets).
* **Server Module Isolation:**
  * Do **NOT** use Next.js `server-only` package (enforced by ESLint rule `no-restricted-imports`).
  * Server-only code must be placed in `*.server.ts` files (e.g., `gemini.server.ts`, `email.server.ts`, `rate-limiter.server.ts`, `client.server.ts`).
  * `client.server.ts` exposes `supabaseAdmin` (service role). Never import `client.server.ts` inside browser-facing routes or client components.
* **Server Entry Point (`src/server.ts`):**
  * Handled via `@lovable.dev/vite-tanstack-config` through custom entry `src/server.ts`.
  * Top-level request pipeline executes rate limiting on non-static requests before invoking Nitro / TanStack Start SSR. Do not bypass this wrapper.

### 3.2 Styling & UI System
* **CSS Engine:** Tailwind CSS v4 (`@tailwindcss/vite` with `@theme` block in `src/styles.css`).
* **Design Language:** Swiss editorial / technical typography with `#FAF9F6` (Stone background), `#121316` (Carbon text), `#1A4BFF` (Cobalt primary accent), and `#E5E5DF` (Aluminum borders).
* **Component Library:** Radix UI primitives with Lucide React icons, styled using Tailwind CSS and `clsx` / `tailwind-merge` (`cn` utility in `src/lib/utils.ts`).
* **Component Metadata:** `components.json` is configured with `"css": "src/styles.css"`, `"baseColor": "slate"`, and `"style": "new-york"`.

---

## 4. Discovered Coding Conventions

### 4.1 Routing & Route Files
* Route files reside in `src/routes/` and use TanStack Router file-based route definitions (`createFileRoute` or `createRootRouteWithContext`).
* Dynamic splat route is `src/routes/$.tsx`.
* Route trees are automatically generated in `src/routeTree.gen.ts`. Do not manually edit `routeTree.gen.ts`.
* Route metadata (`head` function) must include standard title, description, Open Graph (`og:*`), and Twitter Card tags. Privileged routes (`/dashboard/*`) must specify `robots: "noindex, nofollow"`.

### 4.2 Server Functions & Client RPC
* Server-side operations in libraries use `createServerFn({ method: "POST" | "GET" })` from `@tanstack/react-start`.
* Components call server functions using `useServerFn(...)` from `@tanstack/react-start`.
* Caller authentication in server functions is obtained via `getRequest()` from `@tanstack/react-start/server` by inspecting the `authorization: Bearer <token>` header.

### 4.3 Validation & Type Safety
* All input payloads across API endpoints (`/api/chat`, `/api/contact`, `/api/public/monitoring`, `/api/public/database-backup`) must be strictly validated using **Zod** (`z.object({...})`).
* Types are stored in `src/integrations/supabase/types.ts` for database schemas, or exported directly alongside their service modules.

### 4.4 Error Handling & Privacy
* Server-side errors returned to clients must not expose internal database schemas, stack traces, or credentials. Use safe fallback error messages (e.g., `SAFE_ERROR` in `gemini.server.ts`).
* AI chat logging (`chat_activity` table) strictly records metadata (timestamps, message count, latency, error status). **Raw message text and prompts must never be stored in the database.**

---

## 5. High-Caution Modules & Protected Files

The following files require extreme caution when inspecting or editing:

| File / Directory | Reason for Caution |
|---|---|
| `AGENTS.md` | Contains baseline security and Lovable operational rules. Must not be altered without explicit user instruction. |
| `src/server.ts` | Root server request handler. Modifying can cause catastrophic 500 downtime or break rate limiting. |
| `src/integrations/supabase/client.server.ts` | Contains `supabaseAdmin` service role proxy. Any leak to the client bundle exposes database control. |
| `src/integrations/supabase/auth-middleware.ts` | Server auth middleware verifying JWTs and claims. |
| `src/lib/database-admin.functions.ts` | Contains admin database operations, role checks, password management, and retention purges. |
| `src/lib/rate-limiter.server.ts` | Multi-tier distributed rate limiter. Modifying can block legitimate traffic or disable abuse defense. |
| `supabase/migrations/*` | Immutable historical schema migrations. Never edit previously applied migrations; create new migrations. |
| `.github/workflows/*` | CI/CD, CodeQL, scheduled audits, and automated daily backup routines. |

---

## 6. Actions Requiring Explicit User Approval

Before taking any of the following actions, the AI agent **MUST** obtain explicit approval from the user:
1. Modifying or dropping database tables, foreign keys, or RLS policies.
2. Executing database data mutations outside authorized server functions.
3. Adding, removing, or changing third-party dependencies in `package.json`.
4. Modifying `.github/workflows/` CI/CD configurations.
5. Changing authentication logic or role definitions in `public.user_roles`.
6. Resetting or deleting records from `admin_audit_log` or `database_backups`.
7. Touching or altering environment variable secrets in `.env` or deployment settings.

---

## 7. Testing & Validation Expectations

Whenever changes are made to the codebase in future tasks, the following verification suite must be executed:

1. **TypeScript Typecheck:**
   ```bash
   npm run typecheck
   # or
   bun run typecheck
   ```
   *Expectation:* Must pass with 0 errors (`tsc --noEmit`).

2. **Rate Limiting Verification Suite:**
   ```bash
   npx tsx scripts/test-rate-limiting.ts
   ```
   *Expectation:* All 26 automated assertions across client identity resolution, tier mapping, HTTP 429 response structure, sliding window expiry, and authenticated user binding must pass.

3. **Backup Policy & Retention Unit Test:**
   ```bash
   node scripts/test-unit-backup.mjs
   node scripts/test-backup-policy.mjs
   ```
   *Expectation:* Confirms JSON serialization, SQL dump formatting, and user account retention exclusions.

4. **Contact Flow Verification Test:**
   ```bash
   node scripts/test-contact-flow.mjs
   ```
   *Expectation:* Validates honeypot detection, input sanitization, HTML escaping, and email template generation.

5. **Linting Check:**
   ```bash
   npm run lint
   ```
   *Note:* Note current Windows CRLF line-ending Prettier issues (documented in `ai/known-issues.md`). On Linux / CI environments, linting checks line breaks strictly.

---

## 8. Summary of Distinctions

* **Existing Project Rules:**
  * Lovable git synchronization preservation (no rewriting published history).
  * Strict Admin-Only access control for mutations and user creation (`public.has_role(auth.uid(), 'admin')`).
  * Server-only credential isolation (no `VITE_` on secrets).
  * 7-day retention with pre-deletion backup and absolute immunity for `auth.users` and `user_roles`.
* **Recommended Working Guidelines for AI Agents:**
  * Always verify that new endpoints implement rate-limiting classification (`auth`, `sensitive`, `api`, `global`).
  * Always sanitize and validate client inputs with Zod schemas.
  * When introducing UI components, match the Swiss editorial aesthetic defined in `src/styles.css`.
  * Ensure every administrative mutation logs an event to `admin_audit_log`.
