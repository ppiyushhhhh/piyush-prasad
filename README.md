# Piyush Prasad — Cloud & DevOps Engineering Portfolio & Observability Platform

A high-performance, precision-engineered cloud & DevOps portfolio, dynamic GitHub repository showcase, and private observability console for **Piyush Prasad**, an aspiring Cloud & DevOps Engineer specializing in AWS infrastructure, CI/CD automation, Linux system administration, and DevSecOps.

Built with **React 19**, **TanStack Start (SSR)**, **Tailwind CSS v4**, and **Supabase PostgreSQL**, the platform combines an editorial architectural design system (Cream `#FAF9F6`, Carbon `#121316`, Cobalt `#1A4BFF`) with enterprise-grade operational tooling, AI assistant integration, and multi-tier rate limiting.

---

**Production Website:** [www.piyushprasad.in](https://www.piyushprasad.in) &nbsp;•&nbsp; **Staging Environment:** [test.piyushprasad.in](https://test.piyushprasad.in) &nbsp;•&nbsp; **GitHub Showcase:** [/github](https://www.piyushprasad.in/github) &nbsp;•&nbsp; **Resume:** [/resume](https://www.piyushprasad.in/resume) &nbsp;•&nbsp; **Observability Console:** [/dashboard](https://www.piyushprasad.in/dashboard)

[![Live Production](https://img.shields.io/badge/Production-piyushprasad.in-1A4BFF?style=flat-square&logo=cloudflare&logoColor=white)](https://www.piyushprasad.in)
[![Staging Environment](https://img.shields.io/badge/Staging-test.piyushprasad.in-f59e0b?style=flat-square&logo=vercel&logoColor=white)](https://test.piyushprasad.in)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-SSR_&_Server_Functions-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_Cloud-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Rate Limiting](https://img.shields.io/badge/Rate_Limiter-Distributed_Multi--Tier-0047AB?style=flat-square&logo=shield&logoColor=white)](https://www.piyushprasad.in/dashboard/rate-limiting)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash_Proxy-8E75FF?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Vercel](https://img.shields.io/badge/Hosted-Vercel_Edge-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/ppiyushhhhh/piyush-prasad/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [System Highlights](#system-highlights)
  - [1. Public Cloud & DevOps Portfolio](#1-public-cloud--devops-portfolio)
  - [2. GitHub Projects & Dedicated Repository Page (`/github`)](#2-github-projects--dedicated-repository-page-github)
  - [3. Verified Credly Digital Badges](#3-verified-credly-digital-badges)
  - [4. "Ask Piyush AI" — Grounded Gemini 2.5 Assistant](#4-ask-piyush-ai--grounded-gemini-25-assistant)
  - [5. Secure Staging & Production Isolation Engine](#5-secure-staging--production-isolation-engine)
  - [6. Private CloudOps & Observability Console (`/dashboard`)](#6-private-cloudops--observability-console-dashboard)
  - [7. Distributed Multi-Tier Rate Limiting Engine](#7-distributed-multi-tier-rate-limiting-engine)
  - [8. Automated Database Backup & 7-Day Retention Engine](#8-automated-database-backup--7-day-retention-engine)
- [Tech Stack Matrix](#tech-stack-matrix)
- [Project Directory Structure](#project-directory-structure)
- [Telemetry & Database Schema](#telemetry--database-schema)
- [Rate Limiting Architecture & Tiers](#rate-limiting-architecture--tiers)
- [Environment Configuration & Isolation Matrix](#environment-configuration--isolation-matrix)
- [Getting Started Locally](#getting-started-locally)
- [Local Staging Execution](#local-staging-execution)
- [Available Scripts](#available-scripts)
- [CI/CD & Multi-Branch Git Strategy](#cicd--multi-branch-git-strategy)
- [Automated Daily Health Audit](#automated-daily-health-audit)
- [Author & Connect](#author--connect)
- [License](#license)

---

## Architectural Overview

The repository unifies a public-facing engineering showcase with a private cloud telemetry platform and an isolated staging subsystem within a single **TanStack Start (React 19)** codebase:

```
                          ┌────────────────────────────────────────────────────────┐
                          │               Cloudflare Edge & DNS                    │
                          │   piyushprasad.in (Prod)  •  test.piyushprasad.in (Stg)│
                          └──────────────────────────┬─────────────────────────────┘
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             │                                               │
                  [Public Visitors]                                   [Admin Console]
                             │                                               │
               ┌─────────────▼─────────────┐                   ┌─────────────▼─────────────┐
               │  Single-Page Portfolio    │                   │  /dashboard (Auth Guard)  │
               │  • Editorial Theme        │                   │  • Overview & SLA Trend   │
               │  • GitHub Projects Grid   │                   │  • Endpoint Health & TLS  │
               │  • Credly Digital Badges  │                   │  • Live Performance CWV   │
               │  • Work History & Skills  │                   │  • CI/CD Pipeline Runs    │
               │  • Command Palette (⌘K)   │                   │  • AI Telemetry Console   │
               │  • Resend / SMTP Contact  │                   │  • Database Admin Console │
               └─────────────┬─────────────┘                   │  • 7-Day Purge & Backups  │
                             │                                 └─────────────┬─────────────┘
               ┌─────────────▼─────────────┐                                 │
               │   Ask Piyush AI Widget    │                                 │
               │   (POST /api/chat)        │                                 │
               └─────────────┬─────────────┘                                 │
                             │                                               │
                             ▼                                               ▼
               ┌───────────────────────────┐                   ┌───────────────────────────┐
               │     Google Gemini API     │                   │   Supabase PostgreSQL     │
               │ (Server-Side Knowledge)   │                   │     (AWS ap-south-1)      │
               └───────────────────────────┘                   └─────────────┬─────────────┘
                                                                             │
                                                               ┌─────────────▼─────────────┐
                                                               │ Staging Isolation Guard   │
                                                               │ • Production Write-Lock   │
                                                               │ • Email Simulation Only   │
                                                               │ • noindex Robots Meta     │
                                                               └───────────────────────────┘
```

---

## System Highlights

### 1. Public Cloud & DevOps Portfolio
- **Editorial Architectural Design System:** Cream backdrop (`#FAF9F6`), crisp white elevation cards (`#FFFFFF`), carbon high-contrast typography (`#121316`), and electric cobalt accents (`#1A4BFF`).
- **Typography Standards:** Scaled with **Inter** for headings and narrative body copy, paired with **JetBrains Mono** for technical labels, system telemetry, and metadata.
- **Interactive Command Palette:** Global keyboard search shortcut (`⌘K` / `Ctrl+K` or header trigger) allowing instant navigation to sections, external repositories, credentials, and documentation.
- **Transactional Contact Dispatch:** Dual-engine notification dispatcher using **Resend REST API** as primary provider and **Nodemailer SMTP** as fallback. Outputs verified transactional layouts with anti-bot honeypots and HTML injection protection.

### 2. GitHub Projects & Dedicated Repository Page (`/github`)
- **Homepage GitHub Projects Grid:** Showcases 6 default curated repositories with responsive layout (3-column desktop, 2-column tablet, 1-column mobile).
- **Expandable Project Drawer:** Smooth animated expansion ("View More Projects" &harr; "Show Less") with real-time counter indicators (`Showing 6 of 14 Projects`).
- **Dedicated GitHub Page ([`/github`](https://www.piyushprasad.in/github)):**
  - Live profile header displaying avatar, bio, follower metrics, and direct GitHub links.
  - Interactive repository search, language category filtering (DevOps, Cloud, TypeScript, Shell, Python), and sorting (stars, forks, recently updated).
  - Real-time commit message readouts, star counters, fork tallies, and direct repository links fetched via the GitHub REST API.

### 3. Verified Credly Digital Badges
- Direct integration with verified digital certifications hosted on [Credly](https://www.credly.com/users/ppiyushhhh/badges/credly).
- Displays certified credentials with issuing authority (AWS, Linux Foundation, Docker), issue dates, expiry milestones, and verified validation links.
- Synced dynamically through the server-side portfolio knowledge layer to ensure AI responses accurately reflect certified competencies.

### 4. "Ask Piyush AI" — Grounded Gemini 2.5 Assistant
- Floating launcher on all pages that lazy-loads an interactive AI terminal widget.
- **Server-Side API Proxy (`/api/chat`):** TanStack Start server route validating input payloads via Zod, enforcing distributed IP rate limiting, and authenticating server-side without exposing API keys.
- **Dynamic Portfolio Knowledge Layer:** Powered by `portfolio-knowledge.server.ts` and `ai-knowledge.functions.ts`. Aggregates verified work experience, infrastructure projects, Credly credentials, and GitHub repositories.
- **Administrative Knowledge Management:** Allows authorized administrators to inspect, add, toggle, and refresh custom knowledge records dynamically from the dashboard without redeploying code.

### 5. Secure Staging & Production Isolation Engine
- **Dedicated Staging Port & URL:** Runs locally on **port 3001** (`http://localhost:3001`) and targets `https://test.piyushprasad.in` for preview deployments.
- **Runtime Staging Guard (`src/lib/staging.guard.ts`):** Automatically detects `VITE_APP_ENV=staging`.
- **Production Database Write-Lock:** If the staging environment points to the production Supabase database (`xseiuzpzzfvtrkmohogn`), the Staging Guard intercepts mutations (`INSERT`, `UPDATE`, `DELETE`) and throws an explicit isolation violation error to protect live data.
- **Simulated Email Dispatch:** In staging mode, outbound emails to Resend or SMTP are intercepted and logged to stdout as `[STAGING EMAIL GUARD]`, preventing test emails from reaching users.
- **SEO Protection:** Injects `<meta name="robots" content="noindex, nofollow" />` in staging to ensure search engines never index test or preview URLs.
- **Staging Header Badge:** Subtle, professional `STAGING` badge with a pulsing amber indicator rendered in the navigation bar only when in staging mode.

### 6. Private CloudOps & Observability Console (`/dashboard`)
Located at [`/dashboard`](https://www.piyushprasad.in/dashboard) (protected by Supabase Auth and admin RBAC):
- **SLA & Uptime Tracking:** Rolling 30-day availability timeline and latency area charts powered by Recharts.
- **Endpoint Health & Native TLS 1.3 Inspection:** Socket handshakes via `node:tls` inspecting live certificate validity, days to expiration, and cipher suites (`TLS_AES_128_GCM_SHA256`).
- **Core Web Vitals Telemetry (`/dashboard/performance`):** Real-time monitoring of FCP, LCP, CLS, TBT, and TTFB alongside Lighthouse grade benchmarks.
- **CI/CD Pipeline Telemetry (`/dashboard/cicd`):** Live GitHub Actions execution status, commit SHAs, run durations, and deep links to workflow logs.

### 7. Distributed Multi-Tier Rate Limiting Engine
Located at [`/dashboard/rate-limiting`](https://www.piyushprasad.in/dashboard/rate-limiting):
- **Top-Level Server Middleware (`src/server.ts`):** Intercepts requests at server entry before page renders, returning RFC-compliant HTTP `429 Too Many Requests` responses with `Retry-After` headers.
- **Multi-Tier Storage:**
  1. *Tier 1:* Upstash Redis REST atomic pipeline (`INCR` + `EXPIRE`).
  2. *Tier 2:* Supabase PostgreSQL atomic stored procedure (`public.consume_rate_limit`) using row-level transactional locks.
  3. *Tier 3:* In-memory sliding window fail-safe fallback.
- **Identity Anti-Evasion:** Evaluates Cloudflare `cf-connecting-ip`, `x-real-ip`, and binds authenticated sessions to `user:<userId>`.

### 8. Automated Database Backup & 7-Day Retention Engine
- **Scheduled Daily Dumps:** Automated backup runs every 24 hours at `02:00 UTC` via GitHub Actions (`.github/workflows/database-backup.yml`).
- **PostgreSQL Dump Archives:** Generates structured `.sql` snapshot files stored in a private Supabase Storage bucket (`database-backups`).
- **7-Day Rolling Retention:** Automatically rotates and prunes backups older than 7 days while preserving immutable audit logs and monthly summary reports.
- **User Account Safeguard:** `auth.users` and `public.user_roles` are hard-coded as non-deletable to prevent administrative lockouts.

---

## Tech Stack Matrix

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19, TanStack Start 1.168, TanStack Router 1.170 |
| **Styling & Design** | Tailwind CSS v4, Radix UI Primitives, Lucide React, Framer Motion |
| **Interactive Telemetry** | Recharts (ResponsiveContainer, AreaChart, BarChart, Custom Tooltips) |
| **Cloud Database** | Supabase PostgreSQL (AWS Mumbai `ap-south-1`), `@supabase/supabase-js` |
| **Rate Limiter & WAF** | Upstash Redis REST, PostgreSQL Row-Level Locks, Multi-Tier Sliding Windows |
| **Server Runtimes** | TanStack Start Server Functions, Nitro 3.0, Vercel Serverless, Node.js `tls` |
| **AI / Machine Learning** | Google Gemini API (`gemini-2.5-flash`), Dynamic Grounding Knowledge Service |
| **Email Dispatch** | Resend REST API, Nodemailer SMTP, Web3Forms Fallback |
| **Tooling & Bundler** | Vite 8, TypeScript 5.8, ESLint 9, Prettier |
| **Hosting & CDN** | Vercel Edge Network, Cloudflare Anycast DNS & SSL Termination |
| **CI/CD & Security** | GitHub Actions, GitHub CodeQL SAST Analysis, Dependabot |

---

## Project Directory Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Automated lint, typecheck, and build on push/PR
│       ├── codeql.yml                  # CodeQL SAST security scanning
│       └── daily-report.yml            # Scheduled daily health check & email report
├── public/
│   ├── favicon.ico                     # Brand favicon
│   ├── pp-logo.png                     # Identity monogram
│   ├── resume.pdf                      # Downloadable engineering resume
│   ├── robots.txt                      # Search engine crawl directives
│   └── sitemap.xml                     # XML sitemap index
├── scripts/
│   ├── generate-report.mjs             # End-to-end site probe & PDF mailer
│   └── assets/                         # Report branding assets
├── src/
│   ├── components/
│   │   ├── ContactForm.tsx             # Validated transactional contact form
│   │   ├── dashboard/                  # Observability UI components
│   │   │   ├── database/               # Database Admin & Storage Console
│   │   │   └── ratelimiting/           # Rate limiting telemetry & rule modals
│   │   └── portfolio/                  # Public portfolio modules
│   │       ├── AskPiyushAI.tsx         # Floating chat trigger & lazy loader
│   │       ├── ChatPanel.tsx           # AI chat conversation panel
│   │       ├── GithubProjects.tsx      # Curated 6-project expandable showcase
│   │       ├── Navigation.tsx          # Desktop/mobile nav + STAGING indicator
│   │       └── SectionLabel.tsx        # Monospace section headers
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client with staging guard
│   │       ├── client.server.ts        # Server admin client (service-role)
│   │       └── types.ts                # TypeScript database schema types
│   ├── lib/
│   │   ├── ai-knowledge.functions.ts   # AI knowledge base CRUD server functions
│   │   ├── database-admin.functions.ts # Storage metrics, user RBAC & backup routines
│   │   ├── email.server.ts             # Resend / SMTP dispatcher with staging simulation
│   │   ├── gemini.server.ts            # Server-side Gemini API client
│   │   ├── github.ts                   # GitHub REST API repository sync
│   │   ├── portfolio-knowledge.server.ts # Grounded knowledge base for AI assistant
│   │   ├── rate-limiter.server.ts      # Multi-tier distributed atomic rate limiter
│   │   ├── staging.guard.ts            # Staging environment detector & write isolation lock
│   │   └── site.ts                     # Single source of truth for portfolio constants
│   ├── routes/
│   │   ├── __root.tsx                  # Root layout, dynamic robots meta, JSON-LD
│   │   ├── index.tsx                   # Main single-scroll engineering portfolio
│   │   ├── github.tsx                  # Dedicated GitHub repository & activity page
│   │   ├── resume.tsx                  # In-browser engineering resume viewer
│   │   ├── api/chat.ts                 # Secure POST /api/chat AI proxy
│   │   └── dashboard.*.tsx             # Observability console routes
│   ├── server.ts                       # SSR fetch handler & rate-limit middleware
│   └── styles.css                      # Tailwind CSS v4 design system
├── supabase/
│   ├── config.toml                     # Supabase project configuration
│   └── migrations/                     # Versioned SQL migrations
├── .env.example                        # Production environment variable template
├── .env.staging.example                # Staging environment variable template
├── package.json                        # Scripts, dependencies, and engines
├── tsconfig.json                       # TypeScript compiler options
└── vite.config.ts                      # Vite build & TanStack configuration
```

---

## Telemetry & Database Schema

All database interactions leverage hosted **Supabase PostgreSQL** (`ap-south-1`), protected by Row Level Security (RLS) policies:

| Table | Purpose | Retention Policy |
|---|---|---|
| `website_health_checks` | Real-time endpoint probes, TTFB, and SSL telemetry | Auto-pruned > 7 days (backed up) |
| `performance_history` | Core Web Vitals and Lighthouse audit scores | Auto-pruned > 7 days (backed up) |
| `deployment_history` | CI/CD workflow executions from GitHub Actions | Auto-pruned > 7 days (backed up) |
| `chat_activity` | Quantitative AI assistant metrics (latency, token count) | Auto-pruned > 7 days (backed up) |
| `database_backups` | PostgreSQL `.sql` dump manifests and JSON snapshots | Permanent archive in private Storage |
| `admin_audit_log` | Immutable security audit trail of privileged administrative operations | Pruned > 7 days (logs retained) |
| `auth.users` | Supabase Auth user accounts | **NEVER PURGED (Strictly Excluded)** |
| `user_roles` | Role-based access control mappings (`admin` / `user`) | **NEVER PURGED (Strictly Excluded)** |
| `rate_limit_configs` | Dynamic quotas and window durations for rate limiting tiers | Managed by Administrators |
| `rate_limit_events` | Logged HTTP 429 rate limit violations | Auto-pruned / Reset on demand |
| `rate_limit_buckets` | Atomic sliding-window state counters | Auto-expires per window |

---

## Rate Limiting Architecture & Tiers

```
   Incoming HTTP Request
            │
            ▼
┌───────────────────────┐   Configured?   ┌───────────────────────────────┐
│ Tier 1: Upstash Redis ├────────────────►│ Atomic INCR + EXPIRE Pipeline │
└───────────┬───────────┘                 └───────────────┬───────────────┘
            │ (Not Configured / Fallback)                 │
            ▼                                             │
┌───────────────────────┐   Connected?    ┌───────────────▼───────────────┐
│ Tier 2: PostgreSQL    ├────────────────►│ public.consume_rate_limit()   │
│         Stored Proc   │                 │ (Row-Level Transaction Locks) │
└───────────┬───────────┘                 └───────────────┬───────────────┘
            │ (DB Outage Fallback)                        │
            ▼                                             │
┌───────────────────────┐                 ┌───────────────▼───────────────┐
│ Tier 3: In-Memory     ├────────────────►│ Bounded Sliding Window Bucket │
│         Fail-Safe     │                 └───────────────┬───────────────┘
└───────────────────────┘                                 │
            │                                             │
            └──────────────────────┬──────────────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
          [Count <= Max Limit]          [Count > Max Limit]
                     │                           │
                     ▼                           ▼
            HTTP 200 / Handler          HTTP 429 Too Many Requests
         • X-RateLimit-Limit            • Retry-After: <seconds>
         • X-RateLimit-Remaining        • X-RateLimit-Remaining: 0
         • X-RateLimit-Reset            • Async event write to DB
```

| Tier ID | Rule Name | Target Endpoints | Default Limit | Window |
|---|---|---|---|---|
| `auth` | Authentication | `/dashboard/login`, `/api/auth/*` | **10 requests** | 60s (1 min) |
| `sensitive` | Sensitive Operations | `/api/contact`, `/api/chat` | **15 requests** | 60s (1 min) |
| `api` | General REST APIs | `/api/*`, `/_server` RPCs | **60 requests** | 60s (1 min) |
| `global` | Global Master Limit | All dynamic application routes (`*`) | **120 requests** | 60s (1 min) |

---

## Environment Configuration & Isolation Matrix

| Variable | Scope | Production (`.env`) | Staging (`.env.staging`) | Purpose |
|---|---|---|---|---|
| `VITE_APP_ENV` | Client/Server | `production` | `staging` | Drives `isStaging` guards & UI badge |
| `VITE_SITE_URL` | Client/Server | `https://piyushprasad.in` | `http://localhost:3001` | Base site URL & canonical tags |
| `SITE_DOMAIN` | Server | `piyushprasad.in` | `test.piyushprasad.in` | Domain identifier for audit reports |
| `VITE_SUPABASE_URL` | Client | Production Supabase URL | Staging Supabase URL | Supabase API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Production Publishable Key | Staging Publishable Key | Supabase client auth token |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | **Secret** (Server Only) | Staging Service Key | Service-role administrative access |
| `SKIP_EMAIL` | Server | `0` (or unset) | `1` | Forces email delivery simulation |
| `CONTACT_FROM_EMAIL` | Server | `support@piyushprasad.in` | `staging@test.piyushprasad.in` | From address header |
| `CONTACT_NOTIFICATION_EMAIL` | Server | `support@piyushprasad.in` | `dev-staging@piyushprasad.in` | Notification recipient |
| `GEMINI_API_KEY` | Server | **Secret** (Server Only) | Staging API Key | Google AI Studio access key |
| `GEMINI_MODEL` | Server | `gemini-2.5-flash` | `gemini-2.5-flash` | LLM model identifier |

> **Security Rule:** Never prefix server credentials (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`) with `VITE_`. Any variable prefixed with `VITE_` is automatically bundled into public client JavaScript.

---

## Getting Started Locally

### Prerequisites
- **Node.js** (v20+ LTS recommended)
- **Git**
- **npm** or **bun**

### 1. Clone the repository
```bash
git clone https://github.com/ppiyushhhhh/piyush-prasad.git
cd piyush-prasad
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure production-mode local environment
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY`.

### 4. Run standard development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the displayed Vite port) in your browser.

---

## Local Staging Execution

The repository provides an isolated local staging workflow that mirrors production while enforcing strict database write-locks and email simulation:

### 1. Configure staging environment
```bash
# Copy the staging template
cp .env.staging.example .env.staging
```

### 2. Start staging server on dedicated port 3001
```bash
npm run dev:staging
```
The application will boot in **staging mode** on [http://localhost:3001](http://localhost:3001) with:
- `STAGING` badge displayed in navigation.
- Diagnostic startup readout verifying write protection.
- Email delivery safely mocked to the console.
- Search indexing blocked (`noindex, nofollow`).

### 3. Build & preview staging bundles
```bash
# Build with staging environment mode
npm run build:staging

# Preview the built staging artifact on port 3001
npm run preview:staging
```

---

## Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR) |
| `npm run dev:staging` | Starts isolated staging dev server on **port 3001** (`--mode staging`) |
| `npm run build` | Compiles optimized production bundle with TanStack Start SSR |
| `npm run build:staging` | Compiles staging bundle with staging environment variables |
| `npm run preview` | Previews the compiled production build locally |
| `npm run preview:staging` | Previews the compiled staging build on **port 3001** |
| `npm run typecheck` | Validates TypeScript compiler types across all files (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint 9 checks across the codebase |
| `npm run format` | Formats all files using Prettier |

---

## CI/CD & Multi-Branch Git Strategy

The repository follows a Git branching workflow designed for safe deployment:

```
[Feature Branch] ──► [staging branch] ──► [Vercel Preview: test.piyushprasad.in]
                           │
                    (Manual Approval)
                           │
                           ▼
                     [main branch]    ──► [Vercel Production: piyushprasad.in]
```

- **`main` Branch:** Represents the live, audited production release deployed to `https://piyushprasad.in`.
- **`staging` Branch:** Dedicated testing branch deployed to `https://test.piyushprasad.in` for verifying UI changes, database migrations, and integrations before production promotion.
- **Continuous Integration (`ci.yml`):** Automatically executes lint checks, strict TypeScript verification, and full production build bundling on every push and pull request.
- **CodeQL SAST Analysis (`codeql.yml`):** Automated static analysis scanning for security vulnerabilities and supply-chain weaknesses.

---

## Automated Daily Health Audit

The repository contains an automated health probe in `scripts/generate-report.mjs` executed daily at 19:00 IST (13:30 UTC) via GitHub Actions (`daily-report.yml`).

### Audit Verifications:
- **HTTP TTFB & Status:** Verifies global edge response times and status codes.
- **TLS 1.3 Socket Verification:** Inspects certificate expiration and cipher security.
- **DNS Resolution:** Anycast A/AAAA record verification.
- **Asset Integrity:** Verifies accessibility of `robots.txt`, `sitemap.xml`, and `favicon.ico`.
- **Headless Lighthouse Audit:** Measures Performance, Accessibility, Best Practices, and SEO.

### Running Audits Locally:
```bash
cd scripts
npm install
SITE_DOMAIN=piyushprasad.in SKIP_EMAIL=1 node generate-report.mjs
```
The output PDF is saved to `scripts/reports/Daily-Website-Report-YYYY-MM-DD.pdf`.

---

## Author & Connect

**Piyush Prasad**  
*Cloud & DevOps Engineer*  
Navi Mumbai, Maharashtra, India

- **Website:** [www.piyushprasad.in](https://www.piyushprasad.in)
- **Staging Portal:** [test.piyushprasad.in](https://test.piyushprasad.in)
- **GitHub:** [@ppiyushhhhh](https://github.com/ppiyushhhhh)
- **LinkedIn:** [linkedin.com/in/ppiyushhhh](https://linkedin.com/in/ppiyushhhh)
- **Credly:** [credly.com/users/ppiyushhhh/badges/credly](https://www.credly.com/users/ppiyushhhh/badges/credly)
- **Email:** [hello@piyushprasad.in](mailto:hello@piyushprasad.in)

---

## License

This project is licensed under the [MIT License](LICENSE).
