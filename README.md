# Piyush Prasad — Cloud & DevOps Engineering Portfolio & Observability Platform

A high-performance, dark-themed engineering portfolio and private observability console for **Piyush Prasad**, an aspiring Cloud & DevOps Engineer transitioning from IT Service Management. Built around a "blueprint grid" motif that reflects modern infrastructure and DevSecOps engineering principles: minimal, data-dense, accessible, and fast.

**Live Deployment:** [www.piyushprasad.in](https://www.piyushprasad.in) &nbsp;•&nbsp; **Resume:** [/resume](https://www.piyushprasad.in/resume) &nbsp;•&nbsp; **Monitoring Console:** [/dashboard](https://www.piyushprasad.in/dashboard) &nbsp;•&nbsp; **Database Admin:** [/dashboard/database](https://www.piyushprasad.in/dashboard/database)

[![Live Site](https://img.shields.io/badge/Live_Site-piyushprasad.in-06b6d4?style=flat-square&logo=cloudflare&logoColor=white)](https://www.piyushprasad.in)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-SSR_&_Server_Functions-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_Cloud-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-Interactive_Telemetry-22c55e?style=flat-square&logo=chartdotjs&logoColor=white)](https://recharts.org)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-API_Proxy-8E75FF?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Vercel](https://img.shields.io/badge/Hosted-Vercel_Edge-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/ppiyushhhhh/piyush-prasad/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [System Highlights](#system-highlights)
  - [1. Public Engineering Portfolio](#1-public-engineering-portfolio)
  - [2. "Ask Piyush AI" — Gemini Assistant](#2-ask-piyush-ai--gemini-assistant)
  - [3. Private CloudOps & Monitoring Dashboard](#3-private-cloudops--monitoring-dashboard)
  - [4. Database Administration & Storage Engine](#4-database-administration--storage-engine)
  - [5. Automated 7-Day Retention & Backup Archive](#5-automated-7-day-retention--backup-archive)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Telemetry & Database Schema](#telemetry--database-schema)
- [Automated Retention & Backup Policy](#automated-retention--backup-policy)
- [Environment Variables](#environment-variables)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [CI/CD, Security & Compliance](#cicd-security--compliance)
- [Automated Daily Health Audit](#automated-daily-health-audit)
- [Author & Connect](#author--connect)
- [License](#license)

---

## Architectural Overview

The repository combines two interconnected applications within a unified **TanStack Start (React 19)** codebase:

1. **A public single-scroll portfolio** showcasing Cloud/DevOps projects, hands-on infrastructure architecture, work history, verified certifications, live GitHub commits, and an AI chat assistant.
2. **A private cloud observability & database administration console (`/dashboard`)** that continuously monitors `piyushprasad.in`, measures HTTP response latencies, inspects live TLS 1.3 socket handshakes, aggregates GitHub Actions workflow runs, benchmarks AI inference latency, tracks PostgreSQL physical disk footprints, orchestrates automated 7-day retention cleanup with pre-deletion backups, and sends real-time email alerts.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Cloudflare & Vercel Edge                 │
                    │               https://www.piyushprasad.in               │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │                                               │
            [Public Web Visitors]                             [Admin Console]
                       │                                               │
         ┌─────────────▼─────────────┐                   ┌─────────────▼─────────────┐
         │  Single-Page Portfolio    │                   │  /dashboard (Auth Guard)  │
         │  • Blueprint Grid Layout  │                   │  • Overview & SLA Trend   │
         │  • Selected Work / Guides │                   │  • Endpoint Health & TLS  │
         │  • Live GitHub Activity   │                   │  • Live Performance CWV   │
         │  • Web3Forms Contact Form │                   │  • CI/CD Pipeline Runs    │
         └─────────────┬─────────────┘                   │  • AI Telemetry Console   │
                       │                                 │  • Database Admin Console │
         ┌─────────────▼─────────────┐                   │  • Backups & 7-Day Purge  │
         │   Ask Piyush AI Widget    │                   │  • Audit Reports (PDF)    │
         │   (POST /api/chat)        │                   │  • Custom Settings        │
         └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                       │                                               │
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │     Google Gemini API     │                   │   Supabase PostgreSQL     │
         │  (Grounded System Prompt) │                   │     (AWS ap-south-1)      │
         └───────────────────────────┘                   └─────────────┬─────────────┘
                                                                       │
                                                         ┌─────────────▼─────────────┐
                                                         │ 7-Day Retention & Backup  │
                                                         │ • Auto Pre-Delete Backup  │
                                                         │ • Auth Users Strictly Kept│
                                                         │ • Web3Forms Email Alerts  │
                                                         └───────────────────────────┘
```

---

## System Highlights

### 1. Public Engineering Portfolio
- **Blueprint Grid Motif:** Dark slate carbon theme (`#030712` / `#0b0f19`) paired with subtle grid lines, cyan accents (`#06b6d4`), and monospace section headers (`001 · SELECTED WORK`).
- **Selected DevOps Projects:**
  - *DevOps CI/CD Pipeline (2025):* Multi-stage automated deployments on AWS EC2, Nginx reverse proxy, and GitHub Actions.
  - *Production AWS EC2 + DevSecOps (2026):* Hardened Linux server with Prometheus, Grafana, UFW, Let's Encrypt TLS, and Trivy image scanning.
  - *CloudOps Sentinel (2026):* Full-stack ops monitoring platform with SQLite and PM2 process management.
- **Live GitHub Activity Feed:** Fetches real-time public commit history, repository updates, and active branches via the GitHub REST API.
- **Client-Side Form Validation:** Web3Forms integration protected with React Hook Form, Zod schema validation, honeypot spam traps, and accessible `aria-live` state announcements.

### 2. "Ask Piyush AI" — Gemini Assistant
- Fixed floating launcher on every page that lazy-loads a lightweight chat interface.
- **Server-Side Proxy (`/api/chat`):** TanStack Start server route that validates input payloads with Zod, applies an in-memory per-IP rate limiter (10 req/hour), and truncates context windows to protect token quotas.
- **Grounded Knowledge Base:** The AI is strictly seeded with verified portfolio details (experience, certifications, tooling) from `portfolio-knowledge.server.ts` to prevent hallucinations.
- **Security:** The `GEMINI_API_KEY` is strictly accessed via server functions and is never exposed in the client JavaScript bundle.

### 3. Private CloudOps & Monitoring Dashboard
Located at [`/dashboard`](https://www.piyushprasad.in/dashboard) with dedicated operational views:

- **Admin Login & Session Guard (`/dashboard/login`):** Passcode & Supabase Auth session authentication with role verification (`admin`) and sign-out controls.
- **Overview Dashboard (`/dashboard`):**
  - **Latency Area Chart:** Interactive Recharts visual curve displaying real-time response time (ms) and status codes.
  - **30-Day Rolling Uptime SLA:** Segmented availability timeline with 100% operational guarantee.
  - **Infrastructure Matrix:** Live status badges for Web Gateway, PostgreSQL DB, CI/CD Pipelines, and AI Inference.
- **Website Health & Diagnostics (`/dashboard/health`):**
  - **Interactive Latency & Distribution Sparklines:** Dual-mode chart toggling between latency trends and distribution bars.
  - **Key Performance Indicators:** Min latency, average latency, P95 latency, max latency, and availability percentage.
  - **Endpoint Probe Matrix:** Verifies `/`, `/robots.txt`, `/sitemap.xml`, and `/favicon.ico`.
  - **Native TLS 1.3 Inspection:** Direct `node:tls` socket handshake extracting live certificate expiry date, days remaining, and cipher suite (`TLS_AES_128_GCM_SHA256`).
  - **On-Demand Probe Action:** "Probe Endpoints Now" button triggers an immediate live server-side probe.
- **Live Performance & Core Web Vitals (`/dashboard/performance`):**
  - Live telemetry queried directly from Supabase `performance_history` and `website_health_checks`.
  - Real-time Core Web Vitals: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), Total Blocking Time (TBT), and Time to First Byte (TTFB).
  - Live Lighthouse metric scores (Performance, Accessibility, Best Practices, SEO) with dynamic grade assignments.
  - Device distribution benchmarks (Desktop vs Mobile) and historical performance trend curves.
- **CI/CD Pipeline Telemetry (`/dashboard/cicd`):**
  - Connects to GitHub Actions API to display recent workflows (CodeQL, Daily Reports, CI).
  - Status badges, commit SHA deep links, execution durations, and direct links to GitHub run logs.
- **AI Chat Telemetry & Diagnostic Console (`/dashboard/ai-chat`):**
  - Telemetry logging for all assistant interactions (timestamp, message count, latency ms).
  - Live interactive benchmark console to send diagnostic prompts directly to `/api/chat`.
- **Audit Reports & Generator (`/dashboard/reports`):**
  - Historical health grades and Lighthouse scores.
  - "Run Audit & Generate Report" server function to generate on-demand reports.
  - Instant print/PDF export formatted for executive distribution.
- **Custom Settings & Alerts (`/dashboard/settings`):**
  - Adjustable response time thresholds (warning / critical ms).
  - Webhook & email notification preferences.
  - Polling interval controls and manual telemetry cache purge.

### 4. Database Administration & Storage Engine
Located at [`/dashboard/database`](https://www.piyushprasad.in/dashboard/database) (restricted strictly to authenticated Administrators):

- **Live PostgreSQL Engine Telemetry:**
  - Real-time disk footprint calculation via `pg_total_relation_size()`, `pg_relation_size()`, and `pg_indexes_size()`.
  - Quota gauge displaying exact consumed bytes, remaining capacity, and percentage used against Supabase limits (500 MB default quota).
  - Visual status alerts: Optimal (<75%), Warning (75-90%), and Critical (>90%).
  - Per-table physical storage breakdown table detailing table rows, data footprint, index size, total disk space, and percentage share of the database.
- **Interactive Database Table Viewer:**
  - Live browsing across monitored application tables (`website_health_checks`, `performance_history`, `deployment_history`, `chat_activity`, `health_reports`, `database_backups`, `admin_audit_log`, `user_roles`).
  - Server-side pagination (10, 25, 50, 100 records per page), multi-column search, and sortable headers.
  - Quick **"Export JSON"** button to download table records locally.
- **Administrator User Management:**
  - Create new application users with verified roles (`admin` / `user`).
  - Secure password reset utility.
  - Real-time role promotion and demotion (`admin` &harr; `user`).
  - Enable/disable user accounts with immediate authentication lockout.
  - Permanent account deletion with confirmation safeguards.
- **Immutable Admin Audit Log:**
  - Logs every administrative action (user creation, role modifications, password resets, retention purges, manual backups) with caller email, timestamp, IP address, and metadata.

### 5. Automated 7-Day Retention & Backup Archive
- **Automated Data Lifecycle:**
  - Automatically purges telemetry and activity logs older than 7 days (`created_at < NOW() - INTERVAL '7 days'`).
  - Background scheduler automatically evaluates and triggers retention cleanup during daily telemetry sync.
- **Zero User Loss Policy:**
  - `auth.users` and `public.user_roles` are **strictly protected and never pruned**. All user accounts, credentials, and access permissions are permanently preserved.
- **Pre-Deletion Backup Guarantee:**
  - Prior to executing any purge query, the retention engine extracts all matching records across monitored tables, packages them into a timestamped JSON snapshot, and stores them in `public.database_backups`.
- **Instant Email Alerts:**
  - Automatically dispatches email notifications via Web3Forms with full execution details (Backup ID, record count, cleaned tables, and user protection confirmation) whenever backups are created or aged data is pruned.
- **"Take Manual Backup" Button & Archive UI:**
  - Prominent **"Take Manual Backup"** action in the header of `/dashboard/database` for immediate on-demand full database snapshots.
  - Dedicated **"Backups & Retention"** tab listing all historical backups with one-click **"Download JSON"** and detailed payload inspector.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19, TanStack Start (SSR, Server Functions, File-based Routing) |
| **Styling & UI** | Tailwind CSS v4, Radix UI Primitives, Lucide React, Framer Motion |
| **Interactive Telemetry** | Recharts (ResponsiveContainer, AreaChart, BarChart, Custom Tooltips) |
| **Cloud Database** | Supabase PostgreSQL (AWS Mumbai `ap-south-1`) via `@supabase/supabase-js` |
| **Server-Side Runtimes** | TanStack Start Server Functions, Vercel Serverless Functions, Node.js `tls` |
| **AI / Machine Learning** | Google Gemini API (`gemini-2.5-flash` / `gemini-3.6-flash`) |
| **Forms & Ingestion** | React Hook Form, Zod Schema Validation, Web3Forms |
| **Tooling & Bundler** | Vite 8, TypeScript 5.8, ESLint 9, Prettier |
| **Hosting & CDN** | Vercel Edge Network, Cloudflare Anycast DNS & SSL Termination |
| **CI/CD & Security** | GitHub Actions, GitHub CodeQL Advanced Security, Dependabot |

---

## Project Directory Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Automated lint, typecheck, and build on push/PR
│       ├── codeql.yml                  # CodeQL SAST security scanning for TS and workflows
│       └── daily-report.yml            # Scheduled daily health check & email report
├── public/
│   ├── favicon.ico                     # Brand favicon
│   ├── llms.txt                        # Context guide for LLM crawlers
│   ├── resume.pdf                      # Downloadable engineering resume
│   ├── robots.txt                      # Search engine crawl directives
│   └── sitemap.xml                     # XML sitemap index
├── scripts/
│   ├── generate-report.mjs             # End-to-end site probe, Lighthouse audit & PDF mailer
│   └── assets/                         # Branding and visual assets for reports
├── src/
│   ├── components/
│   │   ├── ContactForm.tsx             # Zod-validated Web3Forms contact form
│   │   ├── dashboard/                  # Observability UI components
│   │   │   ├── database/               # Database Admin Console components
│   │   │   │   ├── ActivityLog.tsx     # Admin audit log viewer
│   │   │   │   ├── DatabaseBackups.tsx # Backups & 7-day retention management view
│   │   │   │   ├── DatabaseOverview.tsx# Storage metrics, quota gauge, and table cards
│   │   │   │   ├── DatabaseTableViewer.tsx # Table browser with pagination and export
│   │   │   │   └── UserManagement.tsx  # User creation, password, and RBAC controls
│   │   │   ├── primitives.tsx          # Panel, MetricCard, PageHeader, EmptyState
│   │   │   └── state.tsx               # DataTable, LoadingState, ErrorState, formatters
│   │   ├── portfolio/                  # Public portfolio modules
│   │   │   ├── AskPiyushAI.tsx         # Floating chat button & lazy bundle loader
│   │   │   ├── ChatPanel.tsx           # AI chat conversation panel & suggestions
│   │   │   ├── GithubActivity.tsx      # Real-time GitHub commits and repository feed
│   │   │   └── SectionLabel.tsx        # Blueprint monospace section titles
│   │   └── ui/                         # Accessible Radix primitives
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       ├── client.server.ts        # Server-only service role client (bypasses RLS)
│   │       └── types.ts                # TypeScript database schema types
│   ├── lib/
│   │   ├── database-admin.functions.ts # Server functions for DB metrics, users, backups & retention
│   │   ├── gemini.server.ts            # Server-only Gemini API client with backoff
│   │   ├── monitoring.functions.ts     # Server functions for health, latency, CI/CD, SSL
│   │   ├── portfolio-knowledge.server.ts # System prompt & validated knowledge base
│   │   ├── rate-limit.server.ts        # In-memory IP rate limiter for /api/chat
│   │   ├── site.ts                     # Single source of truth for site metadata
│   │   └── utils.ts                    # Classname and styling helpers
│   ├── routes/
│   │   ├── __root.tsx                  # Root layout, JSON-LD schemas, global fonts
│   │   ├── index.tsx                   # Main single-scroll engineering portfolio
│   │   ├── resume.tsx                  # Clean in-browser resume viewer
│   │   ├── thank-you.tsx               # Contact submission confirmation page
│   │   ├── api/chat.ts                 # Secure POST /api/chat endpoint
│   │   ├── dashboard.tsx               # Monitoring layout, sidebar navigation & auth guard
│   │   ├── dashboard.index.tsx         # Overview: latency charts & infrastructure matrix
│   │   ├── dashboard.health.tsx        # Health: latency sparklines, endpoint matrix, SSL
│   │   ├── dashboard.performance.tsx   # Live Performance: Core Web Vitals & Lighthouse
│   │   ├── dashboard.database.tsx      # Database Administration, Backups & User Management
│   │   ├── dashboard.cicd.tsx          # CI/CD: live GitHub Actions pipeline feed
│   │   ├── dashboard.ai-chat.tsx       # AI Telemetry & interactive diagnostic bench
│   │   ├── dashboard.reports.tsx       # Audit reports history & on-demand generator
│   │   ├── dashboard.settings.tsx      # Alert thresholds & monitoring customization
│   │   └── dashboard.login.tsx         # Admin passcode login screen
│   ├── server.ts                       # SSR fetch handler
│   ├── start.ts                        # TanStack Start instance configuration
│   └── styles.css                      # Tailwind CSS v4 design system
├── supabase/
│   ├── config.toml                     # Supabase local/cloud project configuration
│   ├── migrations/                     # Versioned SQL migrations
│   │   └── 20261005020000_database_backups_and_retention.sql # Retention proc & backup table
│   └── schema.sql                      # DDL schema for monitoring & telemetry tables
├── package.json                        # Dependencies, scripts, and engine specs
├── vite.config.ts                      # Vite build, TanStack router plugin & aliases
└── tsconfig.json                       # TypeScript compiler options
```

---

## Telemetry & Database Schema

The observability console persists metrics to a hosted **Supabase PostgreSQL** instance (`ap-south-1`). All tables are secured with Row Level Security (RLS) and queried through service-role server functions:

| Table | Purpose | Key Columns | Retention Policy |
|---|---|---|---|
| `website_health_checks` | Real-time endpoint probes & SSL | `url`, `http_status`, `response_time_ms`, `ssl_valid`, `ssl_expires_at`, `dns_ok`, `health_score`, `checked_at` | Auto-pruned > 7 days (backed up) |
| `performance_history` | Historical Lighthouse audits | `url`, `performance`, `accessibility`, `best_practices`, `seo`, `measured_at` | Auto-pruned > 7 days (backed up) |
| `deployment_history` | CI/CD execution telemetry | `workflow_name`, `provider`, `status`, `conclusion`, `commit_sha`, `duration_seconds`, `occurred_at` | Auto-pruned > 7 days (backed up) |
| `chat_activity` | Anonymized AI telemetry | `event_type`, `message_count`, `latency_ms`, `error_code`, `occurred_at` *(User message text is never stored)* | Auto-pruned > 7 days (backed up) |
| `health_reports` | Generated executive audits | `report_date`, `health_score`, `lighthouse_score`, `status`, `pdf_url` | Auto-pruned > 7 days (backed up) |
| `database_backups` | JSON snapshots of database data | `id`, `backup_type` (`manual` / `auto_prune_7d`), `tables_included`, `total_records`, `file_size_pretty`, `pruned_records_count`, `backup_data`, `metadata` | Permanent archive (downloadable) |
| `admin_audit_log` | Security audit trail of admin actions | `id`, `action`, `admin_email`, `target_user_id`, `target_table`, `details`, `ip_address`, `created_at` | Pruned > 7 days (logged events retained) |
| `auth.users` | Supabase Auth user accounts | `id`, `email`, `encrypted_password`, `email_confirmed_at`, `created_at` | **NEVER PURGED (Strictly Protected)** |
| `user_roles` | Dashboard authorization & RBAC | `id`, `user_id`, `role` (`admin` / `user`), `created_at` | **NEVER PURGED (Strictly Protected)** |

---

## Automated Retention & Backup Policy

To prevent unbounded database storage growth while guaranteeing zero loss of user profiles or critical logs, the system operates an automated 7-day retention engine:

1. **Pre-Deletion Backup Guarantee:**
   - Before executing a deletion of aged telemetry, the server function queries all records across monitored tables where `created_at < NOW() - INTERVAL '7 days'`.
   - Records are compiled into a structured JSON archive containing table names, schemas, counts, and ISO timestamps.
   - The backup is committed to `public.database_backups` with a unique ID and `backup_type = 'auto_prune_7d'`.
2. **Strict User Account Protection:**
   - `auth.users` and `public.user_roles` are hard-coded as excluded from all deletion routines.
   - User credentials, roles, and session states are never modified by retention routines.
3. **Automated Notification Dispatch:**
   - An email summary is instantly dispatched to the administrator via Web3Forms containing:
     - Pre-deletion Backup ID and download instructions
     - Number of records pruned per table
     - Total size of the generated archive
     - Confirmation of user account protection
4. **On-Demand Manual Backups:**
   - Administrators can click **"Take Manual Backup"** in the `/dashboard/database` header or Backups tab at any time to generate a full snapshot of all current table records and download the `.json` file locally.

---

## Environment Variables

### Application Variables (`.env` / Vercel Settings)

| Variable | Environment | Scope | Description |
|---|---|---|---|
| `VITE_SITE_URL` | Client & Server | Public | Canonical URL (`https://www.piyushprasad.in`) |
| `GEMINI_API_KEY` | Server Only | **Secret** | Google AI Studio API key for the chat assistant |
| `GEMINI_MODEL` | Server Only | Optional | Override model identifier (default: `gemini-3.6-flash`) |
| `SUPABASE_URL` | Server Only | Config | Supabase project URL (`https://cdofblftvzhqsrdlhqmd.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | **Secret** | Supabase service-role secret key for server function RLS bypass |
| `SUPABASE_PUBLISHABLE_KEY` | Client & Server | Config | Supabase public anonymous key |
| `VITE_SUPABASE_URL` | Client Only | Config | Public Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client Only | Config | Public Supabase anonymous key |

> **Security Rule:** Never prefix backend secrets (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) with `VITE_`. Any variable starting with `VITE_` is baked into the browser bundle at compile time.

---

## Getting Started Locally

### Prerequisites
- **Node.js** (v20+ LTS recommended) or **Bun** (v1.1+)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/ppiyushhhhh/piyush-prasad.git
cd piyush-prasad
```

### 2. Install dependencies
```bash
npm install
# or
bun install
```

### 3. Configure local environment
Copy the example file and add your credentials:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 4. Start the development server
```bash
npm run dev
# or
bun run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite dev server with hot module replacement (HMR) |
| `npm run build` | Compiles production bundle with TanStack Start SSR |
| `npm run build:dev` | Compiles production bundle in development mode for debugging |
| `npm run preview` | Previews the compiled production build locally |
| `npm run typecheck` | Validates TypeScript types across the codebase (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint 9 checks |
| `npm run format` | Formats all code with Prettier |

---

## CI/CD, Security & Compliance

- **Continuous Integration (`ci.yml`):** Automatically executes lint checks, TypeScript strict compilation, and a full production build on every push and pull request to `main`.
- **CodeQL SAST Analysis (`codeql.yml`):** Performs deep static analysis on TypeScript/JavaScript source code and GitHub Actions workflow definitions to prevent supply-chain attacks and vulnerabilities.
- **TLS 1.3 Strict Transport Security:** Enforces HTTPS with automated Let's Encrypt certificate renewals, valid through **December 2026**.
- **Edge CDN Security:** Served via Cloudflare and Vercel edge networks with DDoS mitigation and HTTP/3 support.
- **Privacy First:** The AI chat assistant stores strictly quantitative performance telemetry (response latency and token counts); raw user inquiries and message content are never persisted.
- **Safe Retention Engine:** Telemetry older than 7 days is automatically backed up to JSON before removal; user accounts and roles are strictly protected.

---

## Automated Daily Health Audit

The repository contains a standalone auditing script in `scripts/generate-report.mjs` triggered automatically every day at 19:00 IST (13:30 UTC) via GitHub Actions (`daily-report.yml`).

### Audit Parameters:
- **HTTP Reachability & TTFB:** Validates status codes and edge response latency.
- **TLS Handshake Inspection:** Checks certificate expiration, hostname verification, and cipher strength.
- **DNS Resolution:** Anycast A/AAAA record verification.
- **Asset Integrity:** Verifies crawler accessibility for `robots.txt`, `sitemap.xml`, and `favicon.ico`.
- **Headless Chrome Lighthouse:** Benchmarks Performance, Accessibility, Best Practices, and SEO.

### Running Audits Locally:
```bash
cd scripts
npm install
SITE_DOMAIN=piyushprasad.in SKIP_EMAIL=1 node generate-report.mjs
```
The generated executive audit report is saved to `scripts/reports/Daily-Website-Report-YYYY-MM-DD.pdf`.

---

## Author & Connect

**Piyush Prasad**  
*Aspiring Cloud & DevOps Engineer*  
Ranchi, Jharkhand, India

- **Website:** [www.piyushprasad.in](https://www.piyushprasad.in)
- **LinkedIn:** [linkedin.com/in/ppiyushhhh](https://linkedin.com/in/ppiyushhhh)
- **GitHub:** [@ppiyushhhhh](https://github.com/ppiyushhhhh)
- **Email:** [hello@piyushprasad.in](mailto:hello@piyushprasad.in)

---

## License

This project is licensed under the [MIT License](LICENSE).
