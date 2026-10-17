# Discovered Issues, Technical Debt & Risk Registry

> **File:** `ai/known-issues.md`  
> **Status:** Current Discovered State (No Fixes Applied)  
> **Last Updated:** 2026-10-17  
> **Project:** Piyush Prasad Portfolio & CloudOps Observability Console  

---

## Overview

This document records bugs, technical debt, security considerations, performance risks, and documentation gaps identified during deep analysis of the active codebase. **Per critical instructions, no issues have been fixed or modified during this task.**

---

## Issues & Risk Registry

### 1. ESLint Fails on Windows Due to Prettier CRLF Line Ending Mismatches
* **Issue:** Executing `npm run lint` fails with over 1,500 errors caused by `prettier/prettier` line break (`Delete ␍` / `CRLF vs LF`) differences across TypeScript and TSX files on Windows checkouts.
* **Severity:** Medium
* **Evidence:** Running `npm run lint` yields:
  ```text
  ✖ 1587 problems (1573 errors, 14 warnings)
    1490 errors and 0 warnings potentially fixable with the `--fix` option.
  ```
* **Affected Area:** Repository-wide (`src/**/*.{ts,tsx}`, `eslint.config.js`, `.prettierrc`).
* **Current Behavior:** Developers or CI runners on Windows machines encounter lint command failure unless `--fix` or Git CRLF normalization is applied.
* **Expected Behavior:** `npm run lint` should execute cleanly across both Windows and Unix environments.
* **Possible Impact:** Developers on Windows cannot run local lint gates before pushing; risk of developers attempting mass file reformats that dirty git history.
* **Status:** Open / Unresolved.
* **Recommended Next Investigation / Fix:** Add `.gitattributes` with `* text=auto eol=lf` to enforce LF on checkout, or configure Prettier rule `"endOfLine": "auto"` in `.prettierrc`.

---

### 2. Discrepancy Between README Documentation and Live Code
* **Issue:** `README.md` contains outdated descriptions that contradict the active codebase in two major areas:
  1. *Visual Theme:* README lines 3 and 95 claim a "Dark slate carbon theme (`#030712` / `#0b0f19`) with cyan accents (`#06b6d4`)", whereas the live codebase (`src/styles.css`, commit `ef1346c`) is a high-contrast Swiss editorial design with `#FAF9F6` stone background and `#1A4BFF` cobalt accents.
  2. *Contact Form:* README line 101 claims "Web3Forms integration protected with React Hook Form", whereas the live contact form (`src/components/ContactForm.tsx`, `src/routes/api/contact.ts`) is a custom endpoint persisting into Supabase `contact_submissions` and dispatching dual emails via Resend/SMTP.
* **Severity:** Low
* **Evidence:**
  * `README.md` lines 95, 101, 252.
  * `src/styles.css` lines 7–15.
  * `src/components/ContactForm.tsx` lines 6, 58 (`ENDPOINT = "/api/contact"`).
* **Affected Area:** `README.md`.
* **Current Behavior:** Documentation gives incorrect architectural and visual expectations to contributors.
* **Expected Behavior:** Documentation should accurately describe the Swiss editorial theme and first-party `/api/contact` pipeline.
* **Possible Impact:** Developer confusion and potential regressions if an agent or developer attempts to "restore" dark cyan or Web3Forms based on the README.
* **Status:** Open / Unresolved.
* **Recommended Next Investigation / Fix:** Update `README.md` sections on styling and form ingestion to reflect current reality.

---

### 3. Hardcoded Fallback Supabase Project URLs in Server Functions
* **Issue:** Several server functions and public endpoints contain hardcoded fallback Supabase project URLs (`https://xseiuzpzzfvtrkmohogn.supabase.co` and `https://cdofblftvzhqsrdlhqmd.supabase.co`) if `process.env.SUPABASE_URL` is undefined.
* **Severity:** Medium
* **Evidence:**
  * `src/routes/api/public/database-backup.ts` line 75:
    `process.env["SUPABASE_URL"] || ... || "https://xseiuzpzzfvtrkmohogn.supabase.co"`
  * `README.md` line 422: references `https://cdofblftvzhqsrdlhqmd.supabase.co`.
* **Affected Area:** `src/routes/api/public/database-backup.ts`, `src/lib/monitoring.functions.ts`.
* **Current Behavior:** If environment variables fail to load in a serverless container, requests silently target a potentially stale or unmaintained Supabase project instance rather than failing with a descriptive configuration error.
* **Expected Behavior:** Server functions should fail immediately and loudly if required environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are missing.
* **Possible Impact:** Accidental connection to wrong database instances, data desynchronization, or silent failure of backup workflows.
* **Status:** Open / Unresolved.
* **Recommended Next Investigation / Fix:** Remove hardcoded URLs and enforce strict environment variable validation via `createSupabaseAdminClient()`.

---

### 4. Admin Bootstrap Auto-Claim Race Condition / Privilege Escalation Risk
* **Issue:** In `src/lib/database-admin.functions.ts`, the `verifyAdminCaller()` function contains a bootstrap check: if `count === 0` in `public.user_roles`, the first authenticated user to call the function is automatically promoted to `admin` and granted write access.
* **Severity:** High
* **Evidence:**
  * `src/lib/database-admin.functions.ts` lines 408–418:
    ```typescript
    if (!countError && (count === 0 || count === null)) {
      console.log(`[DatabaseAdmin] Bootstrap: Claiming admin role for first user ${user.email}`);
      await db.from("user_roles").insert({ user_id: user.id, role: "admin" });
    }
    ```
* **Affected Area:** `src/lib/database-admin.functions.ts` (`verifyAdminCaller`).
* **Current Behavior:** If the `user_roles` table is ever empty (e.g. during a migration, cleanup, or initial staging deployment), any unverified user who logs in first automatically gains full administrator privileges over the entire database and user management system.
* **Expected Behavior:** Admin promotion should either require an explicit bootstrap CLI command, an environment variable containing the designated admin email (`INITIAL_ADMIN_EMAIL`), or manual insertion in the Supabase SQL console.
* **Possible Impact:** Unauthorized privilege escalation if user roles are ever reset or during initial system provisioning.
* **Status:** Open / Unresolved.
* **Recommended Next Investigation / Fix:** Constrain the bootstrap to check whether `user.email` matches an environment variable (e.g. `process.env.ADMIN_INITIAL_EMAIL`) before inserting the `admin` role.

---

### 5. Redundant Dual Rate-Limiting Layers with In-Memory Desynchronization
* **Issue:** The application enforces two separate rate limiting systems for `/api/chat` and `/api/contact`:
  1. Top-level server middleware in `src/server.ts` invoking the distributed multi-tier engine in `src/lib/rate-limiter.server.ts` (Redis / Postgres / in-memory).
  2. Route-level handlers (`/api/chat` and `/api/contact`) invoking the synchronous `checkRateLimit()` in `src/lib/rate-limit.server.ts`, which uses an in-memory `Map` with a fixed limit of 15 requests per 60 seconds.
* **Severity:** Medium
* **Evidence:**
  * `src/server.ts` lines 77–80 (calls `evaluateRateLimit`).
  * `src/routes/api/chat.ts` line 65: `const limit = checkRateLimit(getClientKey(request));`.
  * `src/routes/api/contact.ts` line 85: `const rateLimit = checkRateLimit("contact:" + clientKey);`.
  * `src/lib/rate-limit.server.ts` lines 32–54 (standalone in-memory Map).
* **Affected Area:** `src/server.ts`, `src/lib/rate-limit.server.ts`, `src/routes/api/chat.ts`, `src/routes/api/contact.ts`.
* **Current Behavior:** Requests are evaluated twice against two distinct counters. In serverless deployments, each container instance has its own separate in-memory Map for the route-level check, while the top-level middleware uses the shared PostgreSQL/Redis store.
* **Expected Behavior:** A single, unified rate limiting engine should evaluate requests and provide shared state across all server functions.
* **Possible Impact:** Inconsistent rate limit counters, premature 429 errors from the route check, or bypass of intended database tier configurations.
* **Status:** Open / Unresolved.
* **Recommended Next Investigation / Fix:** Migrate `/api/chat` and `/api/contact` to rely exclusively on the top-level middleware or `checkRateLimitAsync()` from `rate-limiter.server.ts`.

---

### 6. Operations Dashboard Settings Stored Exclusively in Browser LocalStorage
* **Issue:** Settings configured in `/dashboard/settings` (such as response time warning thresholds, alert email addresses, and auto-refresh intervals) are persisted only in the user's browser `localStorage` under `piyush_dashboard_config`.
* **Severity:** Low
* **Evidence:**
  * `src/routes/dashboard.settings.tsx` lines 59–64, 72:
    `localStorage.setItem("piyush_dashboard_config", JSON.stringify(config));`
* **Affected Area:** `src/routes/dashboard.settings.tsx`.
* **Current Behavior:** Settings do not synchronize across devices, browsers, or administrative sessions, and do not influence server-side background probe thresholds (which remain hardcoded in server functions).
* **Expected Behavior:** Settings should either be persisted in a database configuration table or clearly labeled in the UI as "Local Browser Preferences".
* **Possible Impact:** Administrator modifies latency thresholds expecting automated alerts to change, but server-side background checks continue using default values.
* **Status:** Open / Unresolved.
* **Recommended Next Investigation / Fix:** Create a `dashboard_settings` table in Supabase or document that the settings view only impacts local client dashboard visuals.

---

### 7. Unimplemented GitHub Actions Telemetry in `/dashboard/github`
* **Issue:** The `/dashboard/github` route renders an `EmptyState` component with "No workflow data yet" for GitHub Actions runs, despite `/dashboard/cicd` having a full live implementation querying the GitHub Actions API.
* **Severity:** Low
* **Evidence:**
  * `src/routes/dashboard.github.tsx` lines 22–27:
    ```tsx
    <Panel title="GitHub Actions">
      <EmptyState
        title="No workflow data yet"
        description="Latest workflow, successful and failed runs will be listed here once workflow results are collected."
      />
    </Panel>
    ```
* **Affected Area:** `src/routes/dashboard.github.tsx`.
* **Current Behavior:** Users navigating to `/dashboard/github` see a static placeholder for GitHub Actions, whereas `/dashboard/cicd` shows active pipeline runs.
* **Expected Behavior:** Either consolidate the two views or connect `/dashboard/github` to the existing workflow telemetry functions in `src/lib/monitoring.functions.ts`.
* **Possible Impact:** Redundant, unfinished view in the dashboard sidebar.
* **Status:** Open / Unresolved.
* **Recommended Next Investigation / Fix:** Wire up the shared pipeline component or redirect `/dashboard/github` to `/dashboard/cicd`.

---

### 8. Silent Email Delivery Degradation When Credentials Are Unset
* **Issue:** In `src/lib/email.server.ts`, if neither `RESEND_API_KEY` nor valid `SMTP_*` environment variables are present, the function logs a console warning and returns `{ success: false, error: "No email provider configured..." }`. In `/api/contact`, if the email fails, the API still returns HTTP 200 to the client as long as database insertion succeeded.
* **Severity:** Low / Informational
* **Evidence:**
  * `src/lib/email.server.ts` lines 552–558.
  * `src/routes/api/contact.ts` lines 180–210.
* **Affected Area:** `src/lib/email.server.ts`, `src/routes/api/contact.ts`.
* **Current Behavior:** Contact form submissions succeed for the user and save to Supabase, but no email alert is dispatched, and the failure is only observable in `public.contact_submissions.admin_email_status = 'failed'`.
* **Expected Behavior:** Graceful database fallback is intentionally designed to prevent visitor data loss, but administrators have no out-of-band notification that email delivery is silent.
* **Possible Impact:** Messages remain unread in the database unless the admin regularly checks `/dashboard/messages`.
* **Status:** Open / Documented design choice.
* **Recommended Next Investigation / Fix:** Add a visual badge on `/dashboard` or `/dashboard/messages` warning if `admin_email_status` has failed records.

---

### 9. Daily Health Audit PDF Generation Layout Sensitivity
* **Issue:** In `scripts/generate-report.mjs`, the PDF rendering engine enforces strict assertions: `bufferedPageRange().count === 2` and a post-write `/Type /Page` re-parse. If content (such as long diagnostic recommendations or multiple failed endpoints) exceeds the page 2 boundary, the script throws an error rather than gracefully creating a 3rd page or trimming.
* **Severity:** Low
* **Evidence:**
  * `.lovable/plan.md` lines 92–96: "Existing 2-page assertions stay: pre-doc.end() bufferedPageRange().count === 2 check plus the post-write /Type /Page re-parse. Any regression that would produce 3+ pages or a blank still throws."
  * `scripts/generate-report.mjs` lines 850–920.
* **Affected Area:** `scripts/generate-report.mjs`, `.github/workflows/daily-report.yml`.
* **Current Behavior:** An unusually high number of recommendations could trigger a hard build/script failure during scheduled CI audit runs.
* **Expected Behavior:** Defensive truncation of recommendations before page overflow (partially mitigated by recent plan, but hard assertion remains).
* **Possible Impact:** Scheduled GitHub Actions daily report workflow could fail on days with complex diagnostic outputs.
* **Status:** Monitored.
* **Recommended Next Investigation / Fix:** Verify recommendation string length caps and measure vertical rhythm under worst-case diagnostic states.
