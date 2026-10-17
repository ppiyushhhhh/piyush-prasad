# Current State of the Project

> **File:** `ai/current-state.md`  
> **Status:** Factual Snapshot of Active Repository State  
> **Last Updated:** 2026-10-17  
> **Project:** Piyush Prasad Portfolio & CloudOps Observability Console  

---

## 1. Project Purpose

The repository powers **www.piyushprasad.in**, an engineering portfolio and private cloud observability console for **Piyush Prasad**, an aspiring Cloud & DevOps Engineer transitioning from IT Service Management (ITSM). 

The platform serves two primary purposes:
1. **Public Showcase:** A high-performance, single-scroll engineering portfolio highlighting DevOps CI/CD pipelines, AWS infrastructure, DevSecOps practices, ITIL experience, verified certifications, live GitHub activity, and a grounded AI conversational assistant ("Ask Piyush AI").
2. **Private Operations Console (`/dashboard`):** A role-guarded observability and administration hub that continuously probes endpoint response times, benchmarks Core Web Vitals, inspects live TLS 1.3 certificate status, ingests GitHub Actions telemetry, monitors PostgreSQL physical storage usage, orchestrates an automated 7-day database retention engine with pre-deletion `.sql` dumps, enforces distributed multi-tier rate limiting, and manages contact form inquiries.

---

## 2. Technology Stack

| Layer | Technologies & Versions |
|---|---|
| **Core Framework** | React 19.2.0, TanStack Start 1.168.60, TanStack Router 1.170.41 |
| **Bundler & Server Runtime** | Vite 8.0.16, Nitro 3.0.260603-beta, Node.js v20+ / Bun |
| **Styling & Design System** | Tailwind CSS v4.2.1 (`@tailwindcss/vite`), `tw-animate-css`, Swiss editorial typography (`#FAF9F6` stone / `#121316` carbon / `#1A4BFF` cobalt) |
| **Component Primitives** | Radix UI primitives (Dialog, Popover, Select, Tabs, Dropdown, Tooltip, etc.), Lucide React icons, Framer Motion 12.42.2 |
| **Interactive Telemetry** | Recharts 2.15.4 (AreaChart, BarChart, ResponsiveContainer) |
| **Database & Cloud Storage** | Supabase PostgreSQL (`ap-south-1` AWS Mumbai), `@supabase/supabase-js` 2.112.3, Supabase Storage (`database-backups`) |
| **Rate Limiting & Security** | Multi-tier distributed sliding window (Upstash Redis REST / PostgreSQL atomic stored proc `public.consume_rate_limit` / In-Memory Map) |
| **AI / Machine Learning** | Google Gemini API (`gemini-2.5-flash` / `gemini-3.6-flash`) via Google Generative Language API |
| **Email Delivery** | Resend REST API (primary HTTP), Nodemailer 10.0.14 (SMTP secondary fallback) |
| **Input Validation** | Zod 4.4.3 |
| **CI/CD & Security Audits** | GitHub Actions, GitHub CodeQL SAST, Dependabot |

---

## 3. Directory Structure

```text
piyush-prasad/
├── .github/
│   └── workflows/
│       ├── ci.yml                      # CI: quality gate, secret scanning, build verification
│       ├── codeql.yml                  # CodeQL SAST security analysis
│       ├── daily-report.yml            # Scheduled daily health check & executive report generator
│       └── database-backup.yml         # Daily 02:00 UTC Supabase backup & retention rotation
├── .lovable/
│   ├── plan.md                         # Active development plan notes
│   └── project.json                    # Lovable project metadata
├── ai/                                 # AI Project Brain Documentation
│   ├── instructions.md                 # Agent working rules, constraints, and conventions
│   ├── decisions.md                    # Chronological technical decisions record
│   ├── known-issues.md                 # Bugs, risks, debt, and discrepancies registry
│   └── current-state.md                # Factual architectural snapshot (this document)
├── data/
│   └── backups/                        # Local fallback cache for database backups and history
├── docs/
│   ├── ADMIN_SETUP.md                  # Guide for provisioning administrative credentials
│   ├── examples/                       # Template examples
│   └── styles/                         # Style references
├── public/
│   ├── certificates/                   # Certification badges and credential assets
│   ├── tech-logos/                     # Official brand vector logos for skills
│   ├── favicon.ico                     # Brand favicon
│   ├── llms.txt                        # Machine-readable context guide for LLM crawlers
│   ├── og-image.png                    # Social preview banner (1200x630)
│   ├── pp-logo.png                     # Official emblem logo
│   ├── resume.pdf                      # Downloadable engineering resume
│   ├── robots.txt                      # Search engine directives (disallows /dashboard)
│   └── sitemap.xml                     # Search engine XML index
├── scripts/
│   ├── generate-report.mjs             # Standalone site probe, Lighthouse audit & PDF mailer
│   ├── run-database-backup.mjs         # Automated runner for PostgreSQL .sql dump & 7d retention
│   ├── test-backup-policy.mjs          # Unit assertions for 7-day retention and table protection
│   ├── test-contact-flow.mjs           # Unit assertions for contact validation and honeypot
│   ├── test-rate-limiting.ts           # 26-test suite verifying sliding window & anti-evasion
│   └── test-unit-backup.mjs            # Backup JSON & SQL serialization verification
├── src/
│   ├── assets/                         # Static visual assets
│   ├── components/
│   │   ├── ContactForm.tsx             # Validated portfolio contact form (POST /api/contact)
│   │   ├── dashboard/                  # Observability console UI modules
│   │   │   ├── database/               # Database overview, table viewer, user management, backups
│   │   │   ├── ratelimiting/           # Charts, recent violations table, rule config dialogs
│   │   │   ├── CloudArchitectureMatrix.tsx # Infrastructure status grid
│   │   │   ├── MobileDashboardNav.tsx  # Responsive top bar & fast-jump navigation drawer
│   │   │   ├── primitives.tsx          # Panel, MetricCard, PageHeader, TelemetryMatrix
│   │   │   └── state.tsx               # DataTable, LoadingState, ErrorState, formatters
│   │   ├── portfolio/                  # Public portfolio UI components
│   │   │   ├── AskPiyushAI.tsx         # Floating chat trigger button & lazy panel launcher
│   │   │   ├── ChatPanel.tsx           # Conversational assistant panel with suggested prompts
│   │   │   ├── CommandPalette.tsx      # Quick navigation palette
│   │   │   ├── ContactSection.tsx      # Portfolio contact section container
│   │   │   ├── CustomCursor.tsx        # High-precision carbon pointer with trailing ring
│   │   │   ├── ExperienceTimeline.tsx  # Work history (Runtime Solutions, Credence Infotech)
│   │   │   ├── Footer.tsx              # Footer with copyright, contact info, live IST clock
│   │   │   ├── GithubActivity.tsx      # Public commit feed fetched via GitHub API
│   │   │   ├── Hero.tsx                # Hero banner with terminal badge and CTA links
│   │   │   ├── Navigation.tsx          # Header navbar with smooth-scroll section links
│   │   │   ├── Projects.tsx            # Featured DevOps/Cloud project showcase cards
│   │   │   ├── SectionHeader.tsx       # Standard section headings with numbering
│   │   │   ├── SkillsGrid.tsx          # Infrastructure tools categorized with brand logos
│   │   │   └── TechLogos.tsx           # Vector logo components
│   │   └── ui/                         # Accessible Radix primitives
│   ├── hooks/                          # Custom React hooks (mobile detection, toast, etc.)
│   ├── integrations/
│   │   └── supabase/
│   │       ├── auth-middleware.ts      # Server-side auth verification middleware
│   │       ├── client.server.ts        # Server-only service-role client (supabaseAdmin)
│   │       ├── client.ts               # Browser Supabase client
│   │       ├── previewAuthStorage.ts   # Storage adapter for preview environments
│   │       └── types.ts                # TypeScript definitions for Supabase schema
│   ├── lib/
│   │   ├── database-admin.functions.ts # Server functions for database metrics, users, backups
│   │   ├── database-backup.service.ts  # Database SQL serialization & retention engine
│   │   ├── email.server.ts             # Universal transactional email dispatcher (Resend/SMTP)
│   │   ├── gemini.server.ts            # Server-side Google Gemini API client with backoff
│   │   ├── monitoring.functions.ts     # Health checks, Core Web Vitals, TLS 1.3 socket inspector
│   │   ├── portfolio-knowledge.server.ts # System prompt & validated knowledge base for AI chat
│   │   ├── rate-limiter.server.ts      # Multi-tier distributed atomic rate limiting engine
│   │   ├── rate-limiting-admin.functions.ts # Admin server functions for rate limiting rules
│   │   ├── rate-limit.server.ts        # Compatibility adapter with in-memory fallback
│   │   ├── site.ts                     # Single source of truth for site URLs and metadata
│   │   └── utils.ts                    # Classname helper (`cn`)
│   ├── routes/
│   │   ├── __root.tsx                  # Root layout, JSON-LD Schema.org, 404 & error boundaries
│   │   ├── $.tsx                       # Wildcard 404 route
│   │   ├── index.tsx                   # Main single-scroll portfolio
│   │   ├── resume.tsx                  # In-browser PDF resume viewer
│   │   ├── thank-you.tsx               # Contact submission confirmation page
│   │   ├── guides.devsecops-pipeline.tsx # DevSecOps CI/CD technical guide
│   │   ├── guides.devsecops-tools.tsx  # DevSecOps tooling ecosystem comparison
│   │   ├── dashboard.tsx               # Monitoring layout, sidebar, mobile nav, auth wall
│   │   ├── dashboard.index.tsx         # Overview: latency area chart, infrastructure matrix
│   │   ├── dashboard.login.tsx         # Admin sign-in screen
│   │   ├── dashboard.messages.tsx      # Contact submissions inbox with batch delete
│   │   ├── dashboard.health.tsx        # Endpoint health, latency sparklines, TLS socket check
│   │   ├── dashboard.performance.tsx   # Live Core Web Vitals & historical Lighthouse audits
│   │   ├── dashboard.github.tsx        # GitHub commits and workflow status
│   │   ├── dashboard.cicd.tsx          # GitHub Actions live execution stream
│   │   ├── dashboard.ai-chat.tsx       # AI interaction telemetry & diagnostic bench
│   │   ├── dashboard.reports.tsx       # Historical audit reports & PDF print generator
│   │   ├── dashboard.database.tsx      # DB storage metrics, table browser, user management
│   │   ├── dashboard.manual-backups.tsx # On-demand snapshots & automation status monitor
│   │   ├── dashboard.rate-limiting.tsx # Rate limiting rules, violation logs & charts
│   │   ├── dashboard.settings.tsx      # Alert thresholds & browser preferences
│   │   └── api/
│   │       ├── chat.ts                 # Secure POST /api/chat endpoint
│   │       ├── contact.ts              # Secure POST /api/contact endpoint
│   │       └── public/
│   │           ├── database-backup.ts  # Automated cron endpoint for backups
│   │           └── monitoring.ts       # Ingestion endpoint for CI/CD and health checks
│   ├── routeTree.gen.ts                # Auto-generated TanStack Router route tree
│   ├── router.tsx                      # Router instance setup with QueryClient
│   ├── server.ts                       # Server entrypoint with SSR error wrapper & rate limiting
│   ├── start.ts                        # TanStack Start configuration
│   └── styles.css                      # Tailwind CSS v4 design system
├── supabase/
│   ├── config.toml                     # Supabase project configuration
│   └── migrations/                     # 13 SQL schema migrations
├── AGENTS.md                           # Core project rules & Lovable git directives
├── components.json                     # Shadcn UI configuration for Tailwind v4
├── eslint.config.js                    # ESLint 9 configuration with Prettier
├── package.json                        # Dependencies, scripts, and engine specifications
├── tsconfig.json                       # TypeScript compiler options
└── vite.config.ts                      # Vite build configuration with @lovable.dev plugins
```

---

## 4. Major Components & Subsystems

### 4.1 Public Portfolio Subsystem
* **Hero Banner (`Hero.tsx`):** Features status badges ("AVAILABLE FOR HIRE"), professional title, terminal quick-read, and deep links to projects and resume.
* **Experience Timeline (`ExperienceTimeline.tsx`):** Detailed career history highlighting transition from ITSM Consultant at Credence Infotech to Junior Cloud Engineer at Runtime Solutions.
* **Projects Showcase (`Projects.tsx`):** DevOps CI/CD Pipeline (2025), Production AWS EC2 + DevSecOps (2026), and CloudOps Sentinel (2026) with architecture tags and links.
* **Skills Grid (`SkillsGrid.tsx`):** Categorized matrix of 12 priority infrastructure technologies (AWS, Linux, GitHub Actions, Docker, Nginx, Prometheus, Grafana, Trivy, UFW, Let's Encrypt, Cloudflare, ManageEngine) with official SVG brand logos.
* **Certifications (`Certifications.tsx`):** Verified credentials from AWS, Cisco, and Google Cloud with verification links.
* **Ask Piyush AI (`AskPiyushAI.tsx`, `ChatPanel.tsx`):** Fixed floating button that lazily loads a chat panel. Seeks advice and answers questions strictly based on the grounded portfolio knowledge base.
* **Contact Form (`ContactForm.tsx`):** Accessible form featuring client-side field validation, honeypot spam protection, submission timeout handling, and connection to `/api/contact`.
* **Technical Guides (`guides.*.tsx`):** In-depth DevSecOps documentation on GitHub Actions pipelines, Trivy scanning, SBOMs, and toolchain selection.

### 4.2 Observability & Administration Console Subsystem (`/dashboard`)
* **Session Guard (`dashboard.tsx`):** Client-side authentication barrier. Checks Supabase session on mount and listens to `onAuthStateChange`. Unauthenticated visitors see a branded login gate redirecting to `/dashboard/login`.
* **Overview View (`dashboard.index.tsx`):** Displays real-time HTTP response time curve, 30-day rolling uptime timeline, and infrastructure status matrix.
* **Website Health (`dashboard.health.tsx`):** Performs on-demand probes of `/`, `/robots.txt`, `/sitemap.xml`, and `/favicon.ico`. Initiates live `node:tls` socket handshakes to measure certificate expiration and cipher security.
* **Live Performance (`dashboard.performance.tsx`):** Reads Core Web Vitals (FCP, LCP, CLS, TBT, TTFB) and Lighthouse category scores from `performance_history`.
* **CI/CD Telemetry (`dashboard.cicd.tsx`):** Connects to GitHub Actions API to display recent workflow runs with commit SHAs, run duration, and status indicators.
* **AI Telemetry (`dashboard.ai-chat.tsx`):** Charts assistant usage, latency, and error codes from `chat_activity`. Includes an interactive diagnostic bench to test `/api/chat`.
* **Audit Reports (`dashboard.reports.tsx`):** Lists generated health reports with a live report generator and an in-browser printable executive audit report.
* **Database Administration (`dashboard.database.tsx`):**
  * Storage breakdown displaying real disk usage (`pg_total_relation_size()`) against the 500 MB quota.
  * Server-side paginated table browser with multi-column filtering and JSON export.
  * User management console to create users, reset passwords, change roles (`admin`/`user`), enable/disable accounts, or delete users.
  * Immutable audit log (`admin_audit_log`).
* **Manual Backups (`dashboard.manual-backups.tsx`):** Standalone manager to execute on-demand snapshots, download `.sql` files, inspect manual backup history, and run automation diagnostics.
* **Rate Limiting Console (`dashboard.rate-limiting.tsx`):** View inspected traffic, adjust tier thresholds (`auth`, `sensitive`, `api`, `global`), inspect live violation logs (HTTP 429), and toggle global enforcement.
* **Messages Console (`dashboard.messages.tsx`):** Centralized inbox for portfolio contact submissions with status toggles (`new`, `in_progress`, `resolved`), detail inspect modals, and batch deletion.

---

## 5. Frontend & Backend Data Flow

### 5.1 Public Visitor Flow
```text
Browser Visitor
  │
  ├─► GET / ──────────────► Vite / TanStack Start SSR ──► HTML + CSS (Swiss Editorial)
  │
  ├─► POST /api/chat ─────► Server Entry (src/server.ts)
  │                          │
  │                          ├─► evaluateRateLimit() [Tiers: Redis -> Postgres -> Memory]
  │                          │    (Blocks > 15 req/min with HTTP 429)
  │                          │
  │                          └─► src/routes/api/chat.ts
  │                               │
  │                               ├─► Zod Validation & Truncation (12 turns)
  │                               ├─► generateReply() [Google Gemini API]
  │                               └─► logChatActivity() [chat_activity table]
  │
  └─► POST /api/contact ──► Server Entry (src/server.ts)
                             │
                             ├─► evaluateRateLimit()
                             └─► src/routes/api/contact.ts
                                  │
                                  ├─► Zod Validation & Honeypot Check
                                  ├─► INSERT INTO contact_submissions [Supabase]
                                  └─► sendEmail() [Resend API / SMTP]
                                       ├─► Admin notification -> support@piyushprasad.in
                                       └─► Visitor confirmation -> sender email
```

### 5.2 Admin Console Flow
```text
Administrator
  │
  ├─► GET /dashboard/login ──► Supabase Auth (signInWithPassword) ──► JWT Bearer Token
  │
  └─► GET /dashboard/* ──────► Session Guard (dashboard.tsx)
                                │
                                ├─► useServerFn(getDatabaseOverview) ──► getRequest() Bearer Token
                                │                                         │
                                │                                         ├─► verifyAdminCaller()
                                │                                         │    (Checks public.user_roles)
                                │                                         └─► Service Role Client Query
                                │
                                ├─► createManualBackup() ───────────────► database-backup.service.ts
                                │                                         │
                                │                                         ├─► Generate .sql Dump
                                │                                         ├─► Upload to Supabase Storage
                                │                                         └─► Log to manual_database_backups
                                │
                                └─► updateRateLimitConfig() ────────────► UPDATE public.rate_limit_configs
```

---

## 6. Database Schema & RLS Architecture

The Supabase PostgreSQL instance hosts 13 application tables plus built-in `auth.users`. All tables have Row Level Security enabled:

| Table | Primary Columns | Purpose | Access Control (RLS) |
|---|---|---|---|
| `website_health_checks` | `id`, `url`, `http_status`, `response_time_ms`, `ssl_valid`, `ssl_expires_at`, `health_score`, `checked_at` | Real-time endpoint health logs | Admin: ALL; Public/Auth: SELECT |
| `performance_history` | `id`, `url`, `performance`, `accessibility`, `best_practices`, `seo`, `measured_at` | Lighthouse audit history | Admin: ALL; Public/Auth: SELECT |
| `deployment_history` | `id`, `workflow_name`, `provider`, `status`, `conclusion`, `commit_sha`, `duration_seconds`, `occurred_at` | CI/CD pipeline execution logs | Admin: ALL; Public/Auth: SELECT |
| `chat_activity` | `id`, `event_type`, `message_count`, `latency_ms`, `error_code`, `occurred_at` | Anonymized AI telemetry | Admin: ALL; Public: INSERT via server |
| `health_reports` | `id`, `report_date`, `health_score`, `lighthouse_score`, `status`, `pdf_url` | Executive health audits | Admin: ALL; Public/Auth: SELECT |
| `database_backups` | `id`, `backup_date`, `filename`, `file_size_bytes`, `status`, `backup_type`, `deleted_at`, `tables_included` | Daily 7-day retention backup archive | Admin: ALL; Non-admin: None |
| `manual_database_backups` | `id`, `backup_date`, `filename`, `admin_email`, `status`, `total_records`, `file_size_bytes`, `storage_path` | Dedicated on-demand manual snapshots | Admin: ALL; Non-admin: None |
| `backup_monthly_reports` | `id`, `month`, `year`, `total_backups`, `successful_backups`, `success_percentage`, `summary_data` | End-of-month backup summaries | Admin: ALL; Non-admin: None |
| `admin_audit_log` | `id`, `admin_email`, `action`, `target_user_id`, `target_table`, `details`, `ip_address`, `created_at` | Immutable security audit trail | Admin: SELECT & INSERT; Non-admin: None |
| `contact_submissions` | `id`, `name`, `email`, `subject`, `message`, `status`, `admin_email_status`, `visitor_email_status` | Portfolio contact messages | Admin: SELECT, UPDATE, DELETE; Server: INSERT |
| `rate_limit_configs` | `id`, `name`, `endpoint_pattern`, `max_requests`, `window_seconds`, `enabled` | Rate limiting tier quotas | Admin: ALL; Server: SELECT |
| `rate_limit_events` | `id`, `client_identifier`, `endpoint`, `http_method`, `status_code`, `action_taken`, `rule_name` | Logged 429 violations and audit | Admin: ALL; Server: INSERT |
| `rate_limit_buckets` | `bucket_key`, `request_count`, `window_start`, `expires_at`, `updated_at` | Atomic sliding-window state | Postgres procedure / Service role |
| `user_roles` | `id`, `user_id`, `role` (`admin`/`user`), `created_at` | RBAC mapping | Admin: ALL; User: SELECT own; Trigger blocks escalation |

---

## 7. API Structure

| Endpoint | HTTP Method | Authentication | Rate Limit Tier | Purpose |
|---|---|---|---|---|
| `/api/chat` | `POST` | Public | `sensitive` (15/min) | Proxies conversation messages to Google Gemini API |
| `/api/contact` | `POST` | Public | `sensitive` (15/min) | Validates and persists contact form, sends dual emails |
| `/api/public/database-backup` | `GET` / `POST` | Bearer Token (`BACKUP_CRON_SECRET`) | `api` (60/min) | Triggers automated daily backup, 7d retention, or monthly summary |
| `/api/public/monitoring` | `POST` | Bearer Token (`MONITORING_INGEST_TOKEN`) | `api` (60/min) | Ingests health checks, performance, reports, and deployments from CI |

---

## 8. Authentication & Authorization Model

1. **Authentication Engine:** Supabase Auth (`supabase.auth.signInWithPassword`, `supabase.auth.signOut`). Sessions stored via browser cookies and localStorage.
2. **Role Verification:**
   * User roles reside in `public.user_roles`.
   * Stored procedure `public.has_role(auth.uid(), 'admin')` checks authorization inside RLS policies.
   * Trigger `trg_enforce_admin_on_user_roles` blocks non-admin role mutation at the database engine level.
3. **Server Functions Guard:**
   * Server functions extract the caller's bearer JWT via `getRequest()`.
   * Calls `verifyAdminCaller()` to check `public.user_roles` before executing administrative mutations.
   * Logs all administrative changes to `public.admin_audit_log`.

---

## 9. External Services & Integrations

* **Supabase (AWS ap-south-1):** PostgreSQL cloud database, authentication service, and private storage bucket `database-backups`.
* **Google Gemini API:** Cloud AI inference service invoked server-side for the portfolio chat assistant.
* **Resend API:** Primary HTTP email service provider for transactional portfolio notifications.
* **SMTP (Nodemailer):** Secondary fallback email delivery provider.
* **GitHub Actions:** CI quality gates, CodeQL security scanning, daily health audit runners, and automated backup cron jobs.
* **Cloudflare:** DNS routing, CDN caching, DDoS mitigation, and SSL/TLS termination.
* **Vercel:** Edge hosting platform serving TanStack Start SSR.

---

## 10. Environment Variables

Documented in `.env.example`:

| Variable | Scope | Requirement | Purpose |
|---|---|---|---|
| `VITE_SITE_URL` | Client & Server | Required | Canonical site URL (`https://www.piyushprasad.in`) |
| `GEMINI_API_KEY` | Server Only | **Secret** | Google Generative Language API key |
| `GEMINI_MODEL` | Server Only | Optional | Override model identifier (default: `gemini-3.6-flash`) |
| `SUPABASE_URL` | Server Only | Required | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | **Secret** | Supabase service-role secret key (RLS bypass) |
| `SUPABASE_PUBLISHABLE_KEY` | Client & Server | Required | Supabase public anonymous API key |
| `VITE_SUPABASE_URL` | Client Only | Required | Browser Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client Only | Required | Browser Supabase anonymous API key |
| `RESEND_API_KEY` | Server Only | Optional | Primary email delivery key |
| `CONTACT_FROM_EMAIL` | Server Only | Optional | Verified sender address (`support@piyushprasad.in`) |
| `CONTACT_NOTIFICATION_EMAIL` | Server Only | Optional | Alert destination (`support@piyushprasad.in`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Server Only | Optional | Secondary SMTP delivery credentials |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Server Only | Optional | Distributed Redis tier credentials |
| `MONITORING_INGEST_TOKEN` | Server Only | **Secret** | Shared bearer token for CI ingestion |
| `BACKUP_CRON_SECRET` | Server Only | **Secret** | Shared bearer token for automated backup scheduler |

---

## 11. Build, Run, and Testing Processes

* **Local Development:** `npm run dev` or `bun run dev` (starts Vite on `http://localhost:5173`).
* **Production Build:** `npm run build` (compiles client bundle and TanStack Start SSR entry).
* **Static Typing:** `npm run typecheck` (`tsc --noEmit`). Verified passing with 0 errors.
* **Code Linting:** `npm run lint` (`eslint .`).
* **Automated Test Scripts:**
  * `npx tsx scripts/test-rate-limiting.ts`: Validates rate limiting and identity anti-evasion.
  * `node scripts/test-unit-backup.mjs`: Validates SQL serialization and retention logic.
  * `node scripts/test-contact-flow.mjs`: Validates contact form validation and honeypots.

---

## 12. Current Feature Status Matrix

| Feature | Location | Status | Implementation Notes |
|---|---|---|---|
| Public Single-Scroll Portfolio | `/` | Operational | Complete with Swiss editorial theme, responsive layout, animations |
| In-Browser Resume Viewer | `/resume` | Operational | PDF embed and direct download link |
| DevSecOps Pipeline Guides | `/guides/*` | Operational | Two complete technical guides on CI/CD and tooling |
| Ask Piyush AI Assistant | `/` (`#chat`) | Operational | Server proxy, grounded system prompt, rate-limited |
| Portfolio Contact Form | `/` (`#contact`) | Operational | First-party `/api/contact`, Supabase persistence, dual emails |
| Admin Session & Auth Wall | `/dashboard` | Operational | Supabase Auth login, session subscriber, sign-out controls |
| Overview Telemetry & SLA | `/dashboard` | Operational | Recharts latency curve, infrastructure status matrix |
| Website Health & TLS Socket | `/dashboard/health` | Operational | Live endpoint probe, native TLS 1.3 socket handshake |
| Core Web Vitals & Lighthouse | `/dashboard/performance` | Operational | Reads live CWV metrics from `performance_history` |
| CI/CD Pipeline Telemetry | `/dashboard/cicd` | Operational | Connects to GitHub Actions API for workflow runs |
| AI Telemetry & Diagnostic Bench | `/dashboard/ai-chat` | Operational | Telemetry charting and live diagnostic testing |
| Audit Reports & PDF Generator | `/dashboard/reports` | Operational | Report history and on-demand printable report generator |
| Database Administration | `/dashboard/database` | Operational | Storage quota gauge, table browser, user management, audit log |
| Manual Database Backups | `/dashboard/manual-backups`| Operational | On-demand snapshots, SQL downloads, automation diagnostics |
| Distributed Rate Limiting | `/dashboard/rate-limiting`| Operational | Multi-tier rules matrix, live 429 violation stream, charts |
| Messages & Inquiries Inbox | `/dashboard/messages` | Operational | Full message viewer, status tagging, batch deletion |
| Operations Settings | `/dashboard/settings` | Partial / Local | Persists only to browser `localStorage` |
| GitHub Actions in `/dashboard/github`| `/dashboard/github` | Incomplete | Displays empty state placeholder for workflows |

---

## 13. Known Limitations

1. **Database Storage Quota:** Hosted Supabase PostgreSQL has a 500 MB quota, necessitating the 7-day retention engine to prune high-frequency telemetry.
2. **Settings Scope:** Operations settings configured in `/dashboard/settings` are stored in client `localStorage` and do not affect server-side alert jobs.
3. **Dual Rate Limiting Counters:** Route handlers perform an auxiliary in-memory check in addition to top-level middleware, creating separate counters across serverless instances.
4. **Daily PDF Report Fixed Assertions:** `scripts/generate-report.mjs` strictly asserts a 2-page count and throws if content overflows.
