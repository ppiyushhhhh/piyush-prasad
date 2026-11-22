# Piyush Prasad — Cloud & DevOps Engineering Portfolio & Observability Platform

A high-performance, precision-engineered cloud & DevOps portfolio, dynamic GitHub repository showcase, interactive cloud architecture explorer, and private observability console for **Piyush Prasad**, an aspiring Cloud & DevOps Engineer specializing in AWS cloud infrastructure, CI/CD automation, Linux system administration, and DevSecOps.

Built with **React 19**, **TanStack Start (SSR)**, **Tailwind CSS v4**, and **Supabase PostgreSQL**, the platform combines an editorial architectural design system (Cream `#FAF9F6`, Carbon `#121316`, Cobalt `#1A4BFF`) with enterprise-grade operational tooling, interactive cloud architecture visualizers, grounded AI assistant integration, and multi-tier distributed rate limiting.

---

**Production Website:** [www.piyushprasad.in](https://www.piyushprasad.in) &nbsp;•&nbsp; **Staging Environment:** [test.piyushprasad.in](https://test.piyushprasad.in) &nbsp;•&nbsp; **Architecture Explorer:** [/architecture](https://www.piyushprasad.in/architecture) &nbsp;•&nbsp; **Projects Catalog:** [/projects](https://www.piyushprasad.in/projects) &nbsp;•&nbsp; **GitHub Showcase:** [/github](https://www.piyushprasad.in/github) &nbsp;•&nbsp; **Resume:** [/resume](https://www.piyushprasad.in/resume) &nbsp;•&nbsp; **Observability Console:** [/dashboard](https://www.piyushprasad.in/dashboard)

[![Live Production](https://img.shields.io/badge/Production-piyushprasad.in-1A4BFF?style=flat-square&logo=cloudflare&logoColor=white)](https://www.piyushprasad.in)
[![Staging Environment](https://img.shields.io/badge/Staging-test.piyushprasad.in-f59e0b?style=flat-square&logo=vercel&logoColor=white)](https://test.piyushprasad.in)
[![Architecture Explorer](https://img.shields.io/badge/Architecture-Interactive_Explorer-1A4BFF?style=flat-square&logo=diagramsdotnet&logoColor=white)](https://www.piyushprasad.in/architecture)
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
  - [1. Interactive Cloud Architecture Explorer (`/architecture`)](#1-interactive-cloud-architecture-explorer-architecture)
  - [2. Projects Catalog & Architecture Case Studies (`/projects`)](#2-projects-catalog--architecture-case-studies-projects)
  - [3. Editorial Cloud & DevOps Portfolio Showcase](#3-editorial-cloud--devops-portfolio-showcase)
  - [4. Dedicated GitHub Hub & Repositories (`/github`)](#4-dedicated-github-hub--repositories-github)
  - [5. Verified Credly Digital Certifications](#5-verified-credly-digital-certifications)
  - [6. "Ask Piyush AI" — Grounded Gemini 2.5 Assistant](#6-ask-piyush-ai--grounded-gemini-25-assistant)
  - [7. Secure Staging & Production Isolation Engine](#7-secure-staging--production-isolation-engine)
  - [8. Private CloudOps & Observability Console (`/dashboard`)](#8-private-cloudops--observability-console-dashboard)
  - [9. Distributed Multi-Tier Rate Limiting Engine](#9-distributed-multi-tier-rate-limiting-engine)
  - [10. Automated Database Backup & 7-Day Retention Engine](#10-automated-database-backup--7-day-retention-engine)
- [Tech Stack Matrix](#tech-stack-matrix)
- [Project Directory Structure](#project-directory-structure)
- [Telemetry & Database Schema](#telemetry--database-schema)
- [Rate Limiting Architecture & Tiers](#rate-limiting-architecture--tiers)
- [Environment Configuration & Isolation Matrix](#environment-configuration--isolation-matrix)
- [Getting Started Locally](#getting-started-locally)
- [Local Staging Execution](#local-staging-execution)
- [Available Scripts](#available-scripts)
- [CI/CD & Multi-Branch Git Strategy](#cicd--multi-branch-git-strategy)
- [Automated Daily Health Audit & Verification](#automated-daily-health-audit--verification)
- [Author & Connect](#author--connect)
- [License](#license)

---

## Architectural Overview

The repository unifies a public-facing engineering showcase, an interactive cloud architecture visualizer, a private cloud telemetry platform, and an isolated staging subsystem within a single **TanStack Start (React 19)** codebase:

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
               │  • /architecture Explorer │                   │  • Endpoint Health & TLS  │
               │  • /projects Deep Dives   │                   │  • Live Performance CWV   │
               │  • /github Repository Hub │                   │  • CI/CD Pipeline Runs    │
               │  • Credly Digital Badges  │                   │  • AI Telemetry Console   │
               │  • Work History & Skills  │                   │  • Rate Limiting Controls │
               │  • Command Palette (⌘K)   │                   │  • Architectures Console  │
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

### 1. Interactive Cloud Architecture Explorer (`/architecture`)
Located at [`/architecture`](https://www.piyushprasad.in/architecture):
- **14 Production & Project Topologies:** Features 8 dedicated full-canvas architectures and 6 project architectures including AWS CI/CD pipelines, Sentinel Cloud View, OnixMall DevSecOps, Telegram AI agent edge infrastructure, and multi-cloud web platforms.
- **Unified DAG Layout Engine (`layout.ts`):** Automatically arranges components into semantic topological tiers (*Ingress / Edge*, *Compute / Runtime*, *Data & Storage*, *CI/CD & Delivery*, *Security & Monitoring*) or horizontal 2-lane layouts (*Runtime* vs. *Delivery & Security*).
- **Group Boundary Containment:** Renders isolated group boundaries (such as the Docker Compose container stack) with dedicated container headers and verified SVG logos.
- **Single-Line Connection Paths:** Merges bidirectional pairs (e.g., A &harr; B request/response) into a single, clean orthogonal path with double-ended arrowheads (`marker-start` and `marker-end`).
- **Sequential Flow Numbering:** Replaces cluttered text pills with clean, numbered badges (1, 2, 3...) in sequential order of the primary request flow, and lettered badges (A, B, C...) for delivery/secondary flows.
- **Secondary Flows Toggle:** Hides background telemetry, logging, and fallback lines by default (keeping visible lines &le; 10 for instantaneous comprehension), toggleable with a single click.
- **Request Journey Tracer (`TRACE REQUEST`):** Step-by-step playback engine that animates active requests sequentially across nodes with speed controls (`0.5x`, `1x`, `2x`), step navigation, and looping.
- **Interactive Data Flow Table:** Positioned below the canvas with bidirectional hover highlighting—hovering a flow row highlights the line and badge on the canvas and vice versa.
- **High-Fidelity Multi-Format Export Engine:**
  - **PNG:** High-resolution 2x Retina rasterization (`.png`).
  - **PDF:** Vector Landscape A4 document (`.pdf`) featuring the embedded diagram and a formatted End-to-End Data Flows table.
  - **GIF:** Deterministic 3-second animated GIF loop (`.gif`, 12 fps, 36 frames) featuring category-colored moving packet pulses encoded via `gifenc`.

### 2. Projects Catalog & Architecture Case Studies (`/projects`)
Located at [`/projects`](https://www.piyushprasad.in/projects) and [`/projects/$slug`](https://www.piyushprasad.in/projects/onixmall-devsecops):
- **Curated DevOps & Cloud Case Studies:** Detailed technical writeups covering problem statements, architecture rationale, security controls, and live repositories.
- **Embedded Architecture Visualizer:** High-density, interactive SVG architecture diagrams embedded into each project view (`src/components/portfolio/ArchitectureDiagram.tsx`), allowing visitors to inspect component responsibilities, tech stacks, and live data flows.
- **Direct Repository & Live Links:** Deep links to source repositories, CI/CD pipeline runs, and live staging/production deployments.

### 3. Editorial Cloud & DevOps Portfolio Showcase
- **Editorial Architectural Design System:** Cream backdrop (`#FAF9F6`), crisp white elevation cards (`#FFFFFF`), carbon high-contrast typography (`#121316`), and electric cobalt accents (`#1A4BFF`).
- **Typography Standards:** Scaled with **Inter** for headings and narrative body copy, paired with **JetBrains Mono** for technical labels, system telemetry, and metadata.
- **Interactive Command Palette (`⌘K` / `Ctrl+K`):** Global keyboard shortcut or header trigger allowing instant navigation to portfolio sections, architecture diagrams, GitHub repositories, credentials, and documentation.
- **Transactional Contact Dispatch:** Dual-engine notification dispatcher using **Resend REST API** as primary provider and **Nodemailer SMTP** as fallback. Outputs verified transactional layouts with anti-bot honeypots and HTML injection protection.

### 4. Dedicated GitHub Hub & Repositories (`/github`)
Located at [`/github`](https://www.piyushprasad.in/github):
- **Curated Homepage Showcase:** 6 default curated repositories with responsive layout (3-column desktop, 2-column tablet, 1-column mobile) and animated drawer expansion.
- **Live Profile Metrics:** Displays real-time GitHub profile avatar, bio, follower metrics, star tallies, and direct repository links fetched via the GitHub REST API.
- **Category Filtering & Search:** Instant client-side search with category chips (DevOps, Cloud, TypeScript, Shell, Python) and sorting (stars, forks, recently updated).

### 5. Verified Credly Digital Certifications
- Direct integration with verified digital certifications hosted on [Credly](https://www.credly.com/users/ppiyushhhh/badges/credly).
- Displays certified credentials with issuing authority (AWS, Linux Foundation, Docker), issue dates, expiry milestones, and verified validation links.
- Synced dynamically through the server-side portfolio knowledge layer to ensure AI responses accurately reflect certified competencies.

### 6. "Ask Piyush AI" — Grounded Gemini 2.5 Assistant
- Floating launcher on all pages that lazy-loads an interactive AI terminal widget.
- **Server-Side API Proxy (`/api/chat`):** TanStack Start server route validating input payloads via Zod, enforcing distributed IP rate limiting, and authenticating server-side without exposing API keys.
- **Dynamic Portfolio Knowledge Layer:** Powered by `portfolio-knowledge.server.ts` and `ai-knowledge.functions.ts`. Aggregates verified work experience, infrastructure projects, Credly credentials, and GitHub repositories.
- **Administrative Knowledge Management:** Allows authorized administrators to inspect, add, toggle, and refresh custom knowledge records dynamically from the dashboard without redeploying code.

### 7. Secure Staging & Production Isolation Engine
- **Dedicated Staging Port & URL:** Runs locally on **port 3001** (`http://localhost:3001`) and targets `https://test.piyushprasad.in` for preview deployments.
- **Runtime Staging Guard (`src/lib/staging.guard.ts`):** Automatically detects `VITE_APP_ENV=staging`.
- **Production Database Write-Lock:** If the staging environment points to the production Supabase database (`xseiuzpzzfvtrkmohogn`), the Staging Guard intercepts mutations (`INSERT`, `UPDATE`, `DELETE`) and throws an explicit isolation violation error to protect live data.
- **Simulated Email Dispatch:** In staging mode, outbound emails to Resend or SMTP are intercepted and logged to stdout as `[STAGING EMAIL GUARD]`, preventing test emails from reaching users.
- **SEO Protection:** Injects `<meta name="robots" content="noindex, nofollow" />` in staging to ensure search engines never index test or preview URLs.
- **Staging Header Badge:** Subtle, professional `STAGING` badge with a pulsing amber indicator rendered in the navigation bar only when in staging mode.

### 8. Private CloudOps & Observability Console (`/dashboard`)
Located at [`/dashboard`](https://www.piyushprasad.in/dashboard) (protected by Supabase Auth and admin RBAC):
- **SLA & Uptime Tracking:** Rolling 30-day availability timeline and latency area charts powered by Recharts.
- **Endpoint Health & Native TLS 1.3 Inspection:** Socket handshakes via `node:tls` inspecting live certificate validity, days to expiration, and cipher suites (`TLS_AES_128_GCM_SHA256`).
- **Core Web Vitals Telemetry (`/dashboard/performance`):** Real-time monitoring of FCP, LCP, CLS, TBT, and TTFB alongside Lighthouse grade benchmarks.
- **CI/CD Pipeline Telemetry (`/dashboard/cicd`):** Live GitHub Actions execution status, commit SHAs, run durations, and deep links to workflow logs.
- **Architecture Diagram Management (`/dashboard/architectures`):** Full CRUD management console for creating, updating, publishing, and reordering interactive cloud diagrams.

### 9. Distributed Multi-Tier Rate Limiting Engine
Located at [`/dashboard/rate-limiting`](https://www.piyushprasad.in/dashboard/rate-limiting):
- **Top-Level Server Middleware (`src/server.ts`):** Intercepts requests at server entry before page renders, returning RFC-compliant HTTP `429 Too Many Requests` responses with `Retry-After` headers.
- **Multi-Tier Storage:**
  1. *Tier 1:* Upstash Redis REST atomic pipeline (`INCR` + `EXPIRE`).
  2. *Tier 2:* Supabase PostgreSQL atomic stored procedure (`public.consume_rate_limit`) using row-level transactional locks.
  3. *Tier 3:* In-memory sliding window fail-safe fallback.
- **Identity Anti-Evasion:** Evaluates Cloudflare `cf-connecting-ip`, `x-real-ip`, and binds authenticated sessions to `user:<userId>`.

### 10. Automated Database Backup & 7-Day Retention Engine
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
| **Architecture Visualization** | Custom DAG Corridor Routing Engine, SVG Animation, Vector Layouts |
| **Export Engines** | Offscreen Canvas Rasterizer, `jspdf` (Landscape A4), `gifenc` (GIF89a) |
| **Cloud Database** | Supabase PostgreSQL (AWS Mumbai `ap-south-1`), `@supabase/supabase-js` |
| **Rate Limiter & WAF** | Upstash Redis REST, PostgreSQL Row-Level Locks, Multi-Tier Sliding Windows |
| **Server Runtimes** | TanStack Start Server Functions, Nitro 3.0, Vercel Serverless, Node.js `tls` |
| **AI / Machine Learning** | Google Gemini API (`gemini-2.5-flash`), Dynamic Grounding Knowledge Service |
| **Email Dispatch** | Resend REST API, Nodemailer SMTP, Web3Forms Fallback |
| **Tooling & Bundler** | Vite 8, TypeScript 5.8, ESLint 9, Prettier |
| **Automated Testing** | Playwright (End-to-End UI, Layout Geometry, Export Validation) |
| **Hosting & CDN** | Vercel Edge Network, Cloudflare Anycast DNS & SSL Termination |
| **CI/CD & Security** | GitHub Actions, GitHub CodeQL SAST Analysis, Branch Protection |

---

## Project Directory Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Automated lint, typecheck, and build on push/PR
│       ├── codeql.yml                  # CodeQL SAST security scanning
│       └── daily-report.yml            # Scheduled daily health check & email report
├── docs/
│   └── screenshots/
│       └── architecture/               # Automated Playwright visual validation captures
├── public/
│   ├── favicon.ico                     # Brand favicon
│   ├── pp-logo.png                     # Identity monogram
│   ├── resume.pdf                      # Downloadable engineering resume
│   ├── robots.txt                      # Search engine crawl directives
│   ├── sitemap.xml                     # XML sitemap index
│   └── tech-logos/                     # Local verified SVG tech logos (AWS, Docker, Nginx, etc.)
├── scripts/
│   ├── check-architecture-dom.cjs      # Automated Playwright geometry & overlap validator
│   ├── verify-onixmall.cjs             # End-to-end 2-lane OnixMall layout verification
│   ├── generate-report.mjs             # End-to-end site probe & PDF mailer
│   └── assets/                         # Report branding assets
├── src/
│   ├── components/
│   │   ├── ContactForm.tsx             # Validated transactional contact form
│   │   ├── architecture/               # Dedicated Cloud Architecture Explorer
│   │   │   ├── ArchitectureCanvas.tsx  # Interactive zoomable SVG canvas with 4-layer stack
│   │   │   └── shared/                 # Layout algorithms, edges, nodes, and toolbars
│   │   │       ├── AnimatedEdge.tsx    # Single-line orthogonal paths with packet pulses
│   │   │       ├── ArrowheadMarkers.tsx# Universal marker definitions (auto-start-reverse)
│   │   │       ├── DiagramToolbar.tsx  # Zoom, fit, fullscreen, journey & export controls
│   │   │       ├── NodeCard.tsx        # Compact 200x96 node card with tech logo & status
│   │   │       └── layout.ts           # Topological tier & 2-lane corridor routing engine
│   │   ├── dashboard/                  # Observability UI components
│   │   │   ├── database/               # Database Admin & Storage Console
│   │   │   └── ratelimiting/           # Rate limiting telemetry & rule modals
│   │   └── portfolio/                  # Public portfolio modules
│   │       ├── ArchitectureDiagram.tsx # Embedded project architecture visualizer
│   │       ├── AskPiyushAI.tsx         # Floating chat trigger & lazy loader
│   │       ├── ChatPanel.tsx           # AI chat conversation panel
│   │       ├── CommandPalette.tsx      # Global ⌘K keyboard search & navigation
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
│   │   ├── architecture-diagrams.ts    # Single source of truth for 8 canvas diagrams
│   │   ├── architecture-export.ts      # Vector SVG, 2x PNG, A4 PDF & GIF export engines
│   │   ├── credly-badges.ts            # Credly digital badges data & verification
│   │   ├── database-admin.functions.ts # Storage metrics, user RBAC & backup routines
│   │   ├── email.server.ts             # Resend / SMTP dispatcher with staging simulation
│   │   ├── gemini.server.ts            # Server-side Gemini API client
│   │   ├── github.ts                   # GitHub REST API repository sync
│   │   ├── portfolio-knowledge.server.ts # Grounded knowledge base for AI assistant
│   │   ├── portfolio-projects.ts       # Detailed project case studies & quick architectures
│   │   ├── rate-limiter.server.ts      # Multi-tier distributed atomic rate limiter
│   │   ├── staging.guard.ts            # Staging environment detector & write isolation lock
│   │   ├── tech-logo-registry.ts       # Central verified local SVG logo registry
│   │   └── site.ts                     # Single source of truth for portfolio constants
│   ├── routes/
│   │   ├── __root.tsx                  # Root layout, dynamic robots meta, JSON-LD
│   │   ├── index.tsx                   # Main single-scroll engineering portfolio
│   │   ├── architecture.tsx            # Dedicated Cloud Architecture Explorer page
│   │   ├── projects.index.tsx          # Complete projects catalog directory
│   │   ├── projects.$slug.tsx          # Detailed project deep dive with embedded diagram
│   │   ├── github.tsx                  # Dedicated GitHub repository & activity page
│   │   ├── resume.tsx                  # In-browser engineering resume viewer
│   │   ├── thank-you.tsx               # Contact submission confirmation page
│   │   ├── api/chat.ts                 # Secure POST /api/chat AI proxy
│   │   ├── api/contact.ts              # Multi-tier transactional contact dispatch
│   │   └── dashboard.*.tsx             # Observability console routes (12+ submodules)
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
| `architecture_diagrams` | Stores cloud topology nodes, edges, journeys, and metadata | Permanent (Managed by Admin) |
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
| `CONTACT_FROM_EMAIL` | Server | `notifications@piyushprasad.in` | `notifications@piyushprasad.in` | Verified sender address in email provider |
| `CONTACT_NOTIFICATION_EMAIL` | Server | `hello@piyushprasad.in` | `hello@piyushprasad.in` | Main contact form inquiry recipient |
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
Fill in your `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY`.

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

## Automated Daily Health Audit & Verification

### 1. Automated Daily Health Probe
Executed daily at 19:00 IST (13:30 UTC) via GitHub Actions (`daily-report.yml`):
- **HTTP TTFB & Status:** Verifies global edge response times and status codes.
- **TLS 1.3 Socket Verification:** Inspects certificate expiration and cipher security.
- **DNS Resolution:** Anycast A/AAAA record verification.
- **Asset Integrity:** Verifies accessibility of `robots.txt`, `sitemap.xml`, and `favicon.ico`.
- **Headless Lighthouse Audit:** Measures Performance, Accessibility, Best Practices, and SEO.

```bash
cd scripts
npm install
SITE_DOMAIN=piyushprasad.in SKIP_EMAIL=1 node generate-report.mjs
```

### 2. Automated Architecture Quality Gate
Ensures zero visual collisions, zero detached lines, 100% badge alignment, and flawless exports:
```bash
# Verify OnixMall 2-Lane DevSecOps Layout
node scripts/verify-onixmall.cjs

# Verify All 14 Architecture Diagrams on Canvas
node scripts/check-architecture-dom.cjs
```

---

## Author & Connect

**Piyush Prasad**  
*Cloud & DevOps Engineer*  
Navi Mumbai, Maharashtra, India

- **Website:** [www.piyushprasad.in](https://www.piyushprasad.in)
- **Staging Portal:** [test.piyushprasad.in](https://test.piyushprasad.in)
- **Architecture Explorer:** [www.piyushprasad.in/architecture](https://www.piyushprasad.in/architecture)
- **Projects Catalog:** [www.piyushprasad.in/projects](https://www.piyushprasad.in/projects)
- **GitHub:** [@ppiyushhhhh](https://github.com/ppiyushhhhh)
- **LinkedIn:** [linkedin.com/in/ppiyushhhh](https://linkedin.com/in/ppiyushhhh)
- **Credly:** [credly.com/users/ppiyushhhh/badges/credly](https://www.credly.com/users/ppiyushhhh/badges/credly)
- **Email:** [hello@piyushprasad.in](mailto:hello@piyushprasad.in)

---

## License

This project is licensed under the [MIT License](LICENSE).
