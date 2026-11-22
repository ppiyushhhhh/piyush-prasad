# Enterprise DevSecOps Release & Promotion Flow

This document details the multi-branch promotion workflow, automated testing quality gates, scheduled observability jobs, and environment isolation rules governing `piyush-prasad`.

---

## 1. Promotion & Release Pipeline

The application adheres to a structured, audit-gated promotion sequence designed to guarantee zero-downtime, verified deployments to production while preventing unreviewed code from affecting live users.

```
+---------------------------------------------------------------------------------------------------+
| [1] Feature Branch / Lovable                                                                      |
|     Local Developer Workstation / Lovable Web Editor                                              |
+---------------------------------------------------------------------------------------------------+
                                  │ (git push feature-branch)
                                  ▼
+---------------------------------------------------------------------------------------------------+
| [2] GitHub Repository (feat/* -> uat PR)                                                          |
|     Triggers Enterprise DevSecOps CI Workflow (.github/workflows/ci.yml)                          |
+---------------------------------------------------------------------------------------------------+
                                  │
                                  ▼
+---------------------------------------------------------------------------------------------------+
| [3] CI Quality Gates & Verification                                                               |
|     • Bun Typecheck (`tsc --noEmit`)                                                             |
|     • ESLint 9 Static Code Analysis                                                               |
|     • Supply Chain & Dependency Integrity Audit                                                  |
|     • Forbidden Secrets Leakage Scan                                                              |
|     • Production Bundle SSR Compilation (`vite build`)                                            |
+---------------------------------------------------------------------------------------------------+
                                  │ (push to uat auto-deploys via Vercel Git Integration)
                                  ▼
+---------------------------------------------------------------------------------------------------+
| [4] UAT / Staging Environment (`test.piyushprasad.in`)                                            |
|     • Runs on Vercel preview deployment mapped to `uat` branch                                    |
|     • Staging Guard active (`VITE_APP_ENV=staging`):                                              |
|       - robots meta tag: `noindex, nofollow`                                                      |
|       - Document title prefix: `[STAGING]`                                                        |
|       - Supabase mutation blocker: throws error on writes to production database                  |
|       - Email interception: contact form emails simulated/blocked; zero live emails sent          |
+---------------------------------------------------------------------------------------------------+
                                  │
                                  ▼
+---------------------------------------------------------------------------------------------------+
| [5] Promotion Approval Gate (PR: uat → main)                                                      |
|     • Mandatory peer code review & human QA verification                                          |
|     • All CI status checks required to pass                                                       |
|     • Direct pushes to `main` strictly blocked                                                    |
+---------------------------------------------------------------------------------------------------+
                                  │ (approved PR merge)
                                  ▼
+---------------------------------------------------------------------------------------------------+
| [6] GitHub Repository (`main` Branch)                                                             |
|     Triggers release CI verification pipeline                                                     |
+---------------------------------------------------------------------------------------------------+
                                  │ (auto-deploys via Vercel Git Integration)
                                  ▼
+---------------------------------------------------------------------------------------------------+
| [7] Production Environment (`piyushprasad.in`) [GOES LIVE ONLY HERE]                              |
|     • Serves global live traffic across Vercel Anycast Edge                                      |
|     • Connects to production Supabase PostgreSQL cluster                                          |
|     • Outbound transactional emails enabled via Resend & SMTP                                     |
+---------------------------------------------------------------------------------------------------+
```

> [!IMPORTANT]
> **Push to `uat` deploys to `test.piyushprasad.in` only. Only the approved merge into `main` goes live.**

---

## 2. Scheduled Automation & Nightly Maintenance

The portfolio operates autonomous scheduled GitHub Actions workflows to monitor production availability and safeguard persistent database records:

### Job 1: Daily Website Health & Synthetic Audit Report
- **Workflow File**: `.github/workflows/daily-report.yml`
- **Schedule**: Daily at `13:30 UTC` (`19:00 IST`) via cron `30 13 * * *`, plus manual on-demand `workflow_dispatch`.
- **Runner**: `ubuntu-latest` with Node.js 20.x and Headless Google Chrome (`browser-actions/setup-chrome`).
- **Audit Steps**:
  1. **HTTPS Connectivity & Latency**: Resolves target domain (`SITE_DOMAIN`, defaults to `piyushprasad.in`) and measures HTTP TTFB and status code.
  2. **DNS & Resolution**: Queries authoritative A and AAAA DNS records.
  3. **TLS Certificate Expiry**: Inspects active SSL socket and warns if certificate expiry is `< 30 days` (critical if `< 14 days`).
  4. **Core Asset Probing**: Verifies availability of `/robots.txt`, `/sitemap.xml`, and `/favicon.ico`.
  5. **Lighthouse Audit**: Executes headless Lighthouse pass to evaluate Performance, Accessibility, Best Practices, and SEO metrics.
  6. **Executive PDF Generation**: Compiles audit metrics into a multi-page PDF using PDFKit.
  7. **Delivery & Alerting**:
     - Sends report PDF via SMTP (Nodemailer TLS port 465) to `REPORT_TO`.
     - Dispatches urgent failure alert to `ALERT_TO` if HTTP/DNS/TLS checks fail.
     - Uploads PDF as a GitHub Actions workflow artifact named `daily-website-report` with 30-day retention (`if: always()`).

### Job 2: Nightly Supabase Database Backup & Rolling Retention
- **Workflow File**: `.github/workflows/database-backup.yml`
- **Schedule**: Nightly at `02:00 UTC` (`07:30 IST`) via cron `0 2 * * *`, plus manual `workflow_dispatch`.
- **Runner**: `ubuntu-latest` with Node.js 20.x.
- **Backup Steps**:
  1. Connects to Supabase PostgreSQL database using server-side service credentials.
  2. Iterates across all core public schema tables (`projects`, `profiles`, `contact_messages`, `activity_logs`, etc.).
  3. Generates pure SQL dump files with timestamps and checksums.
  4. Archives backup into Supabase Storage bucket `database-backups`.
  5. Enforces 7-day rolling retention policy, purging expired backups.
  6. Dispatches status email via SMTP (`REPORT_TO`), falling back to Web3Forms emergency webhook if SMTP fails.

---

## 3. Required Secrets Specification

All workflow runners rely on encrypted GitHub Repository Secrets. Secret values must **never** be logged or hardcoded in repository files:

| Secret Name | Consumed By | Purpose |
| :--- | :--- | :--- |
| `SITE_DOMAIN` | `daily-report.yml` | Target domain to probe (defaults to `piyushprasad.in`) |
| `SMTP_HOST` | `daily-report.yml`, `database-backup.yml` | Outbound mail server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | `daily-report.yml`, `database-backup.yml` | SMTP port (typically `465` for SSL or `587` for TLS) |
| `SMTP_USER` | `daily-report.yml`, `database-backup.yml` | Authenticated username / email address |
| `SMTP_PASS` | `daily-report.yml`, `database-backup.yml` | App-specific password or relay credential |
| `REPORT_TO` | `daily-report.yml`, `database-backup.yml` | Recipient email address for daily health PDF and backup summaries |
| `REPORT_FROM` | `daily-report.yml`, `database-backup.yml` | Sender email address / identity |
| `ALERT_TO` | `daily-report.yml`, `database-backup.yml` | Incident alert recipient for urgent check failures |
| `WEB3FORMS_ACCESS_KEY` | `database-backup.yml` | Emergency webhook fallback key if SMTP fails |
| `SUPABASE_URL` | `database-backup.yml` | Supabase API connection URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `database-backup.yml` | Elevated service-role key for table export |

---

## 4. Manual Configuration Checklist for Repository Owner

Execute the following external settings to fully enforce the release flow:

### A. GitHub Repository Settings (`ppiyushhhhh/piyush-prasad`)
- [ ] **Create Branch `uat`**:
  ```bash
  git checkout -b uat main
  git push origin uat
  ```
- [ ] **Configure Branch Protection for `main`**:
  - Navigate to **Settings > Branches > Add branch protection rule**.
  - Branch name pattern: `main`.
  - Check **Require a pull request before merging** (require at least 1 approval).
  - Check **Require status checks to pass before merging**:
    - Select `Quality Gate (Typecheck & Lint)`
    - Select `Security & Supply Chain Audit`
    - Select `Production Build & Asset Verification`
  - Check **Do not allow bypassing the above settings**.
- [ ] **Lovable Synchronization Policy**:
  - *Note*: Lovable default integration commits directly to the default repository branch (`main`).
  - *Recommended Option*: Configure Lovable to target `uat` instead of `main`, allowing Lovable commits to deploy to `test.piyushprasad.in` for verification prior to opening a PR into `main`.
  - *Alternative*: If Lovable requires `main`, restrict Lovable to drafting feature branches, or accept the risk that Lovable commits bypass UAT staging review.

### B. Vercel Hosting Configuration
- [ ] **Production Branch**: Ensure **Settings > Git > Production Branch** is set strictly to `main`.
- [ ] **Assign UAT Domain to Branch `uat`**:
  - Navigate to **Settings > Domains**.
  - Add domain `test.piyushprasad.in`.
  - Under **Git Branch**, select `uat` (maps `test.piyushprasad.in` strictly to preview builds of branch `uat`).
- [ ] **Environment Variables Segregation**:
  - In **Settings > Environment Variables**:
    - Set `VITE_APP_ENV=staging` and `APP_ENV=staging` for **Preview** environment (specifically branch `uat`).
    - Set `VITE_APP_ENV=production` and `APP_ENV=production` strictly for **Production** environment.
    - Set production credentials (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) only on **Production**.

### C. Supabase & Database Isolation
- [ ] **Staging Database Project**:
  - Either provision a separate Supabase project for staging and configure its URL/keys in Vercel's Preview environment, OR
  - Rely on `src/lib/staging.guard.ts` which throws an explicit runtime exception on any attempted database mutation in staging mode when pointing to the production Supabase URL.

### D. SEO & Indexing Verification
- [ ] **Search Engine Exclusion**:
  - Confirm that `https://test.piyushprasad.in` serves `<meta name="robots" content="noindex, nofollow" />` (enforced via `src/routes/__root.tsx`).
  - Confirm `sitemap.xml` generated by the build only lists URLs on `https://piyushprasad.in`.

---

## 5. Staging Protection Enforcement Matrix

| Protection Mechanism | Enforced in Code | Enforced by Convention / Cloud Config | Details |
| :--- | :---: | :---: | :--- |
| **`[STAGING]` Title Prefix** | Yes | No | Enforced in `src/routes/__root.tsx:32-34` based on `isStaging`. |
| **`noindex, nofollow` Meta Tag** | Yes | No | Enforced in `src/routes/__root.tsx:39-44` based on `isStaging`. |
| **Database Write Mutation Blocker** | Yes | No | Enforced in `src/lib/staging.guard.ts:86-92` (`assertStagingWriteAllowed`). Throws error on write when pointing to production Supabase. |
| **Contact Form Email Suppression** | Yes | No | Enforced in `src/lib/email.server.ts:466-476`. Simulates email dispatch and logs dry-run output; no emails sent. |
| **UAT Domain Branch Mapping** | No | Yes | Requires Vercel domain assignment: `test.piyushprasad.in` -> branch `uat`. |
| **Branch Protection & PR Gate** | No | Yes | Requires GitHub repository branch rule on `main`. |
| **Separate Staging Supabase Credentials** | No | Yes | Requires configuring separate keys in Vercel Preview environment if staging mutations are desired. |
