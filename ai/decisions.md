# Project Architectural & Technical Decisions Log

> **File:** `ai/decisions.md`  
> **Status:** Chronological Historical Record  
> **Last Updated:** 2026-10-17  
> **Project:** Piyush Prasad Portfolio & CloudOps Observability Console  

---

## Overview

This document maintains a chronological record of major technical and architectural decisions present in the codebase. Every entry details the rationale, implementation, affected files, trade-offs, supporting evidence, and whether the rationale is explicitly verified or inferred from artifacts and git history.

---

## Chronological Decisions

### 1. Adoption of TanStack Start (SSR) & TanStack Router
* **Decision:** Build the unified application (public portfolio + private observability console) on React 19, TanStack Start, and TanStack Router using Vite and Nitro, rather than Next.js or Remix.
* **Why it appears to have been made:** Allows tight type safety between client routes and server functions without vendor lock-in; provides fine-grained control over SSR and Cloudflare/Vercel edge deployment targets; native integration with Lovable.dev tooling (`@lovable.dev/vite-tanstack-config`).
* **Current Implementation:**
  * Configured in `vite.config.ts`, `src/start.ts`, and `src/server.ts`.
  * File-based routes compiled into `src/routeTree.gen.ts`.
  * Server functions declared with `createServerFn()` and called with `useServerFn()`.
* **Files / Components Affected:**
  * `package.json`
  * `vite.config.ts`
  * `src/server.ts`
  * `src/start.ts`
  * `src/routes/*`
* **Known Trade-offs:** TanStack Start is evolving rapidly with occasional breaking API changes between beta releases; requires specific Vite plugins and strict adherence to `*.server.ts` naming conventions instead of Next.js conventions (`server-only`).
* **Evidence / Source in Project:**
  * `package.json`: `"@tanstack/react-start": "1.168.60"`, `"@tanstack/react-router": "1.170.41"`
  * `vite.config.ts`: Lines 1–15 (`@lovable.dev/vite-tanstack-config`, `server: { entry: "server" }`)
* **Verification Status:** Verified (Configured in package manifests and Lovable vite configuration).

---

### 2. Server-Side AI Chat Assistant Proxy with Grounded Knowledge Base
* **Decision:** Implement the "Ask Piyush AI" conversational assistant via a server-side route handler (`/api/chat`) using Google Gemini 2.5/3.6 Flash and a strictly grounded system prompt, rather than direct client-side SDK calls.
* **Why it appears to have been made:**
  * Keeps the Google Gemini API key strictly secret on the server.
  * Prevents hallucination by constraining the model to a verified knowledge base of Piyush's actual projects, skills, certifications, and work experience.
  * Controls API costs by enforcing message count limits, rate limits, and context truncation.
* **Current Implementation:**
  * Endpoint `src/routes/api/chat.ts` receives requests, validates with Zod, checks rate limits, and truncates conversation history to 12 turns.
  * `src/lib/gemini.server.ts` executes POST requests to Google Generative Language API with retry and backoff logic.
  * `src/lib/portfolio-knowledge.server.ts` provides the single source of truth system prompt (`SYSTEM_INSTRUCTION`).
  * Writes anonymized telemetry to `chat_activity` table without saving raw message text.
* **Files / Components Affected:**
  * `src/routes/api/chat.ts`
  * `src/lib/gemini.server.ts`
  * `src/lib/portfolio-knowledge.server.ts`
  * `src/components/portfolio/AskPiyushAI.tsx`
  * `src/components/portfolio/ChatPanel.tsx`
* **Known Trade-offs:** Requires an active server environment (cannot run as a purely static site); rate-limits external visitors to preserve token quotas.
* **Evidence / Source in Project:**
  * Git commit `27c34b1` / README Section "Ask Piyush AI".
  * Code in `src/routes/api/chat.ts` and `src/lib/gemini.server.ts`.
* **Verification Status:** Verified (Code directly asserts server-only credential access and prompt grounding).

---

### 3. PostgreSQL Observability & Telemetry Store via Supabase
* **Decision:** Use a hosted Supabase PostgreSQL instance (AWS `ap-south-1` Mumbai) for storing site health checks, Core Web Vitals, CI/CD telemetry, rate limit events, and audit logs.
* **Why it appears to have been made:** Provides a managed cloud database with built-in Row Level Security (RLS), authentication, storage buckets, and automated PostgreSQL extensions (`pg_stat_statements`, atomic transactions).
* **Current Implementation:**
  * Client access in `src/integrations/supabase/client.ts`.
  * Elevated server operations in `src/integrations/supabase/client.server.ts` (`supabaseAdmin`).
  * 13 versioned SQL migrations in `supabase/migrations/`.
* **Files / Components Affected:**
  * `src/integrations/supabase/*`
  * `supabase/migrations/*`
  * `src/lib/monitoring.functions.ts`
* **Known Trade-offs:** Free-tier database storage quotas (500 MB) necessitate proactive storage monitoring and retention policies; service-role keys require strict isolation.
* **Evidence / Source in Project:**
  * `supabase/migrations/*.sql`
  * `src/integrations/supabase/client.server.ts`
* **Verification Status:** Verified.

---

### 4. Transition from Dark Blueprint Theme to Swiss Editorial Design
* **Decision:** Redesign the visual system from an early dark slate/cyan blueprint motif (`#030712` / `#06b6d4`) to a high-contrast Swiss editorial design language with `#FAF9F6` (Stone background), `#121316` (Carbon text), `#1A4BFF` (Cobalt blue accents), and `#E5E5DF` (Aluminum borders).
* **Why it appears to have been made:** Elevates visual professionalism, legibility, and technical density; aligns with high-end engineering portfolio aesthetics while eliminating generic dark-mode AI templates.
* **Current Implementation:**
  * Defined in Tailwind CSS v4 `@theme` block in `src/styles.css`.
  * Utility classes `@utility mono`, `@utility display`, `@utility hairline`.
  * Consistent light stone surface across public pages and the `/dashboard` operations console.
* **Files / Components Affected:**
  * `src/styles.css`
  * `src/routes/__root.tsx`
  * `src/routes/index.tsx`
  * `src/routes/dashboard.tsx`
  * `src/components/dashboard/primitives.tsx`
* **Known Trade-offs:** Light themes show contrast mismatches more easily; older documentation (e.g., sections of `README.md`) retains references to the earlier dark theme.
* **Evidence / Source in Project:**
  * Git commit `ef1346c`: "style(dashboard): match portfolio theme with Swiss editorial design language".
  * Git commit `8bb5e3b`: "feat(ui): eliminate generic cards, pills, gradients and establish distinctive telemetry visual system".
  * Active CSS definitions in `src/styles.css` (lines 7–97).
* **Verification Status:** Verified (Documented in commit logs and active CSS).

---

### 5. Strict RBAC Enforcement: "Rule: Only Admin Can Change Data or Create a User"
* **Decision:** Restrict all database mutations (`INSERT`, `UPDATE`, `DELETE`) across managed application tables and user creation/role management strictly to authenticated users with the verified `admin` role in `public.user_roles`.
* **Why it appears to have been made:** Prevents unauthorized callers, unauthenticated bots, or compromised visitor sessions from altering telemetry, injecting fake audit records, modifying rate limits, or escalating privileges.
* **Current Implementation:**
  * PostgreSQL migration `20261006200000_admin_only_data_mutations_and_user_creation.sql`.
  * Security definer function `public.has_role(_user_id, 'admin')`.
  * Trigger `trg_enforce_admin_on_user_roles` blocking role escalation.
  * Server function verification in `src/lib/database-admin.functions.ts` (`verifyAdminCaller()`).
  * Initial bootstrap safeguard: If zero admins exist in `user_roles`, the first authenticated user can claim the initial admin role.
* **Files / Components Affected:**
  * `AGENTS.md`
  * `supabase/migrations/20261006200000_admin_only_data_mutations_and_user_creation.sql`
  * `src/lib/database-admin.functions.ts`
* **Known Trade-offs:** All automated pipelines (GitHub Actions, cron jobs) must authenticate via shared secret tokens (`MONITORING_INGEST_TOKEN`, `BACKUP_CRON_SECRET`) and write via `supabaseAdmin` service role to bypass client RLS.
* **Evidence / Source in Project:**
  * User rule in `AGENTS.md`.
  * Migration `supabase/migrations/20261006200000_admin_only_data_mutations_and_user_creation.sql`.
* **Verification Status:** Verified.

---

### 6. Automated 7-Day Rolling Retention Policy with Pre-Deletion Backups
* **Decision:** Automatically prune operational telemetry older than 7 days from monitored tables while archiving full snapshots as PostgreSQL `.sql` dumps in a private Supabase Storage bucket (`database-backups`) and recording metadata in `public.database_backups`.
* **Why it appears to have been made:** Prevents database storage from exceeding Supabase free-tier quotas (500 MB) while preserving full compliance and historical recovery capabilities.
* **Current Implementation:**
  * Scheduled via GitHub Actions (`.github/workflows/database-backup.yml`) daily at 02:00 UTC.
  * Script `scripts/run-database-backup.mjs` serializes tables to `.sql` files, uploads to Supabase Storage, and records execution status.
  * Backups older than 7 days are pruned from storage and flagged with `deleted_at` timestamps in `database_backups`.
  * Hardcoded protection: `auth.users` and `public.user_roles` are strictly exempt from retention routines.
* **Files / Components Affected:**
  * `.github/workflows/database-backup.yml`
  * `scripts/run-database-backup.mjs`
  * `src/lib/database-backup.service.ts`
  * `src/routes/api/public/database-backup.ts`
  * `supabase/migrations/20261005020000_database_backups_and_retention.sql`
* **Known Trade-offs:** Detailed per-second telemetry older than 7 days is moved to backup archives and no longer queryable in real-time charts.
* **Evidence / Source in Project:**
  * Git commit `d4a881d`: "feat(database): automated 7-day retention cleanup, pre-deletion backups...".
  * Git commit `b8c4d21`: "feat: implement Supabase database backup policy, 7-day retention rotation...".
* **Verification Status:** Verified.

---

### 7. Multi-Tier Distributed Rate Limiting & Abuse Defense Engine
* **Decision:** Implement a three-tier atomic sliding-window rate limiting engine evaluated at the top-level server middleware (`src/server.ts`) before rendering pages or executing server functions.
* **Why it appears to have been made:** Protects against credential stuffing, DoS attacks, API scraping, and excessive LLM token consumption across serverless, multi-process, and distributed environments without crashing if an external dependency fails.
* **Current Implementation:**
  * Middleware in `src/server.ts` calls `evaluateRateLimit(request)`.
  * *Tier 1:* Upstash Redis REST (`INCR` + `EXPIRE` pipeline) if configured.
  * *Tier 2:* PostgreSQL atomic stored procedure `public.consume_rate_limit()` with row-level locks.
  * *Tier 3:* In-memory sliding window Map fallback for network/database outages.
  * Static asset requests (`/_build/*`, `/assets/*`, `.ico`, `.css`, etc.) bypass evaluation.
  * Four configurable tiers: `auth` (10/min), `sensitive` (15/min), `api` (60/min), `global` (120/min).
  * Returns RFC-standard headers: `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
* **Files / Components Affected:**
  * `src/server.ts`
  * `src/lib/rate-limiter.server.ts`
  * `src/lib/rate-limiting-admin.functions.ts`
  * `src/routes/dashboard.rate-limiting.tsx`
  * `supabase/migrations/20261015180000_create_rate_limiting_system.sql`
  * `scripts/test-rate-limiting.ts`
* **Known Trade-offs:** Introduces database query overhead on dynamic requests when Redis is unconfigured; requires maintaining cache sync between memory and DB.
* **Evidence / Source in Project:**
  * Git commit `bda8c33`: "feat(security): implement production-ready distributed rate limiting and admin dashboard".
  * Migration `20261015180000_create_rate_limiting_system.sql`.
* **Verification Status:** Verified.

---

### 8. Replacement of Web3Forms with Supabase Contact Submissions & Dual Transactional Emails
* **Decision:** Replace third-party Web3Forms contact form submission with a first-party server route (`/api/contact`), persisting messages into `public.contact_submissions` and dispatching dual branded transactional emails via Resend (with SMTP fallback).
* **Why it appears to have been made:**
  * Eliminates dependency on external form aggregators for primary communication.
  * Preserves an authoritative database record in Supabase with admin management and deletion features.
  * Delivers immediate dual transactional emails: an admin notification to `support@piyushprasad.in` and an instant professional confirmation email to the visitor.
* **Current Implementation:**
  * Route handler `src/routes/api/contact.ts` validates with Zod, checks honeypots, checks rate limits, and persists to `contact_submissions`.
  * `src/lib/email.server.ts` renders Google Workspace-styled HTML/text emails and dispatches via Resend REST API or Nodemailer SMTP.
  * `src/routes/dashboard.messages.tsx` provides full admin inbox UI to read, filter, status-tag, and delete submissions.
* **Files / Components Affected:**
  * `src/routes/api/contact.ts`
  * `src/components/ContactForm.tsx`
  * `src/lib/email.server.ts`
  * `src/routes/dashboard.messages.tsx`
  * `supabase/migrations/20261011210000_create_contact_submissions.sql`
* **Known Trade-offs:** Requires configured email API keys (`RESEND_API_KEY` or `SMTP_*`) on the server; form submissions can fail if neither service is active and database insert fails.
* **Evidence / Source in Project:**
  * Git commit `b00d7b0`: "feat(contact): replace Web3Forms with Supabase database persistence and automated dual email notifications".
  * Git commit `2814ea4`: "feat(dashboard): add Messages & Contact Inquiries management page...".
* **Verification Status:** Verified.

---

### 9. Native Server-Side TLS 1.3 Inspection via `node:tls`
* **Decision:** Inspect SSL certificate validity and expiry using direct Node.js `tls.connect` socket handshakes rather than calling external third-party SSL checker APIs.
* **Why it appears to have been made:** Eliminates external API dependencies and rate limits; provides exact, authoritative certificate data (cipher suite, days remaining, expiration timestamp) directly from the target socket.
* **Current Implementation:**
  * Function `getSslDetails(url)` in `src/lib/monitoring.functions.ts` initiates a TLS connection on port 443 with `servername: parsed.hostname`.
  * Extracts `valid_to`, calculates days remaining, and records cipher name.
* **Files / Components Affected:**
  * `src/lib/monitoring.functions.ts`
  * `src/routes/dashboard.health.tsx`
* **Known Trade-offs:** Requires a Node.js runtime environment supporting `node:tls`; cannot execute in pure browser or edge workers lacking TCP socket APIs.
* **Evidence / Source in Project:**
  * `src/lib/monitoring.functions.ts` lines 120–180.
* **Verification Status:** Verified.

---

### 10. Separation of Manual Database Backups from Automated Daily Retention
* **Decision:** Introduce a dedicated `manual_database_backups` table and a standalone management view (`/dashboard/manual-backups`) alongside the automated 7-day retention rotation.
* **Why it appears to have been made:** Allows administrators to generate on-demand point-in-time snapshots before major schema changes or migrations without polluting the automated daily backup rotation schedule or risking unintended pruning.
* **Current Implementation:**
  * Migration `20261006190000_create_manual_database_backups.sql`.
  * Server functions `createManualBackup()` and `getManualBackupsList()` in `src/lib/database-admin.functions.ts`.
  * UI page at `src/routes/dashboard.manual-backups.tsx`.
* **Files / Components Affected:**
  * `src/routes/dashboard.manual-backups.tsx`
  * `src/components/dashboard/database/ManualBackupsManager.tsx`
  * `src/lib/database-admin.functions.ts`
  * `supabase/migrations/20261006190000_create_manual_database_backups.sql`
* **Known Trade-offs:** Maintains two separate backup history lists (`database_backups` and `manual_database_backups`).
* **Evidence / Source in Project:**
  * Git commit `fbd1d3f`: "feat(backups): add manual database backups table, dedicated page, and automation health monitor".
* **Verification Status:** Verified.
