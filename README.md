# Piyush Prasad — Portfolio Website

A single-page, dark-themed engineering portfolio for **Piyush Prasad**, an aspiring Cloud & DevOps Engineer transitioning from an IT Service Management background. Built with a "blueprint grid" motif to reinforce the infrastructure/DevOps aesthetic — clean, minimal, and information-dense without feeling cluttered.

**Live site:** [www.piyushprasad.in](https://www.piyushprasad.in) &nbsp;•&nbsp; **Resume:** [/resume](https://www.piyushprasad.in/resume)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TanStack Start](https://img.shields.io/badge/TanStack%20Start-SSR-FF4154?logo=react-query&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Animations-0055FF?logo=framer&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-Package%20Manager-000000?logo=bun&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Sections](#sections)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Contact Form](#contact-form)
- [Daily Website Health Report](#daily-website-health-report)
- [CI/CD & Security](#cicd--security)
- [SEO & Performance](#seo--performance)
- [Contact](#contact)
- [License](#license)

---

## Overview

This repository contains the source for my personal portfolio — a single-scroll site with anchor navigation that showcases my DevOps projects, work experience, skills, certifications, education, and live GitHub activity. It is built as a technical portfolio meant to read like an engineering artifact: thin grid lines, monospace section labels, a restrained cobalt-on-carbon palette, and scroll-triggered motion.

There is **no backend and no database**. Every dynamic element is either static content, a public read-only API call (GitHub), or a third-party form endpoint (Web3Forms).

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Framework        | React 19 + TanStack Start (SSR, file-based routing) |
| Styling          | Tailwind CSS v4 + shadcn/ui (Radix primitives)      |
| Animation        | Framer Motion                                        |
| Icons            | lucide-react                                         |
| Data Fetching    | TanStack Query (public GitHub REST API)             |
| Forms            | Web3Forms (no custom backend)                        |
| Build Tool       | Vite                                                 |
| Package Manager  | Bun                                                  |
| Monitoring       | Node.js + Lighthouse via GitHub Actions (PDF report)|

## Sections

The site is organized as a single scrollable page with a sticky anchor nav:

1. **Hero** — name, role, one-line pitch, contact quick-actions, animated blueprint-grid background
2. **Projects** — flagship DevOps work with repo links (CI/CD on AWS EC2 + Nginx + Cloudflare, a hardened production EC2 deployment, and CloudOps Sentinel)
3. **Experience** — reverse-chronological history with a nested timeline for multiple roles at one company
4. **Skills** — categorized tags (Cloud, OS, DevOps Tools, Web Server, CI/CD, Monitoring, Security, ITSM)
5. **Certifications** — top 5 shown by default with an accessible, animated "show more" toggle
6. **Education** — reverse-chronological academic history with linked institution logos
7. **GitHub** — live public activity (recently pushed repos + latest commit per repo)
8. **Contact** — quick actions plus a validated contact form

Additional routes: `/resume` (view-only PDF), `/thank-you`, and two long-form DevSecOps guides.

## Project Structure

```
.
├── .github/workflows/
│   ├── ci.yml                 # Lint, typecheck, build on every push/PR
│   ├── codeql.yml             # CodeQL security analysis
│   └── daily-report.yml       # Scheduled website health report
├── public/
│   ├── resume.pdf
│   ├── robots.txt
│   ├── sitemap.xml
│   └── llms.txt
├── scripts/
│   ├── generate-report.mjs    # Health checks -> scoring -> PDF -> email
│   ├── assets/                # Report branding assets
│   └── python/                # Standalone maintenance utilities
├── src/
│   ├── components/
│   │   ├── ContactForm.tsx    # Web3Forms-backed contact form
│   │   ├── portfolio/         # GithubActivity, SectionLabel
│   │   └── ui/                # shadcn/ui primitives
│   ├── lib/
│   │   └── site.ts            # Single source of truth for site identity
│   ├── routes/                # File-based routes (index, resume, guides, …)
│   └── styles.css             # Tailwind v4 theme tokens
├── vite.config.ts
└── package.json
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1+
- Node.js 20+ (required for the report scripts)

```bash
git clone https://github.com/ppiyushhhhh/portfolio.git
cd portfolio
bun install
bun run dev
```

## Available Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `bun run dev`       | Start the local development server |
| `bun run build`     | Build the app for production       |
| `bun run preview`   | Serve the production build locally |
| `bun run lint`      | Run ESLint checks                  |
| `bun run typecheck` | Run TypeScript type checking       |
| `bun run format`    | Format code with Prettier          |

## Environment Variables

The website itself requires **no secrets**. All external calls use public, unauthenticated endpoints. `.env.example` documents the optional variable names; never commit a real `.env`.

The health report workflow reads its configuration from GitHub Actions secrets and variables:

| Name                                     | Type     | Purpose                          |
| ---------------------------------------- | -------- | -------------------------------- |
| `SITE_DOMAIN`                            | secret   | Domain to audit                  |
| `SMTP_HOST` / `SMTP_PORT`                | secret   | Mail transport                   |
| `SMTP_USER` / `SMTP_PASS`                | secret   | SMTP credentials                 |
| `REPORT_TO` / `REPORT_FROM` / `ALERT_TO` | secret   | Recipients                       |
| `REPORT_BRAND_NAME` / `REPORT_BRAND_TAGLINE` | variable | Report branding              |
| `REPORT_CONTACT_*`, `REPORT_LINKEDIN`, `REPORT_GITHUB` | variable | Report footer contact details |

## Contact Form

Submissions post directly to the [Web3Forms](https://web3forms.com) API — there is no server component. The form includes:

- Client-side validation for every field, plus email format and minimum message length
- A hidden honeypot field to absorb naive bots
- An `AbortController` timeout so a hung request cannot leave the button spinning
- Explicit loading, success, and error states announced via `aria-live`

The Web3Forms access key is a publishable, write-only submission key — it is safe in client code and cannot read past submissions.

## Daily Website Health Report

`scripts/generate-report.mjs` runs on a schedule (19:00 IST) and can be triggered manually from the Actions tab. It performs:

- **HTTP** reachability, status code, and response time
- **TLS** inspection with explicit states: valid, expiring soon, expired, hostname mismatch, untrusted chain, or connection failure
- **DNS** resolution
- **Asset** checks for `robots.txt`, `sitemap.xml`, and the favicon
- **Lighthouse** performance, accessibility, best practices, and SEO audits

Results feed a weighted scoring model that produces five independent category scores plus one overall grade:

| Category      | Weight | Inputs                                     |
| ------------- | ------ | ------------------------------------------ |
| Availability  | 30%    | HTTP status, DNS, response time            |
| Performance   | 25%    | Lighthouse performance                      |
| Security      | 20%    | TLS state, Lighthouse best practices        |
| SEO           | 15%    | Lighthouse SEO, robots.txt, sitemap.xml     |
| Accessibility | 10%    | Lighthouse accessibility                    |

Missing inputs (for example, a failed Lighthouse run) are skipped rather than penalised, and the remaining weights are re-normalised. The output is a branded, exactly two-page PDF emailed to the configured recipient and uploaded as a workflow artifact.

## CI/CD & Security

- **CI** (`ci.yml`) runs typecheck, lint, and a production build on every push and pull request to `main`.
- **CodeQL** (`codeql.yml`) scans JavaScript/TypeScript and workflow definitions on push, PR, and weekly.
- No secrets are shipped to the browser; the client bundle contains only public endpoints.
- Dependencies are pinned via `bun.lock`, and CI installs with `--frozen-lockfile`.

## SEO & Performance

- Page-specific `<title>`, meta description, canonical, Open Graph, and Twitter tags on every route
- Person + WebSite JSON-LD structured data, plus DigitalDocument data on `/resume`
- `sitemap.xml`, `robots.txt`, and `llms.txt` for crawlers and AI assistants
- Semantic headings, ARIA labels, and reduced-motion support throughout
- Mobile-first and fully responsive; grid and animation effects degrade gracefully

## Contact

**Piyush Prasad**

- Email: [hello@piyushprasad.in](mailto:hello@piyushprasad.in)
- GitHub: [@ppiyushhhhh](https://github.com/ppiyushhhhh)
- LinkedIn: [linkedin.com/in/ppiyushhhh](https://linkedin.com/in/ppiyushhhh)

## License

This project is licensed under the [MIT License](LICENSE).
