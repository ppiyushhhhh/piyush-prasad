# Infrastructure Service Inventory & Verification Audit

**Audit Date**: November 21, 2026  
**Auditor**: Infrastructure Architect & Senior DevOps Engineer  
**Scope**: All repositories and infrastructure architectures across Piyush Prasad's portfolio.

---

## 1. Project: Kamlesh-Prasad (`kamlesh-prasad` / `kamlesh-prasad-cicd`)
**Repository**: `ppiyushhhhh/Kamlesh-Prasad` / `ppiyushhhhh/kamlesh-prasad`  
**Description**: Single-page portfolio application with zero-downtime EC2 Nginx deployment and Vercel AI chatbot integration.

| Service / Component | Technology / Tier | Used For | Evidence Files | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Vite SPA Frontend** | React 18, Vite, TanStack Query, Recharts, Tailwind CSS | High-performance single page web client | `package.json`, `src/App.tsx`, `vite.config.ts` | **Verified** |
| **GitHub Actions Deploy Runner** | `deploy.yml`, `appleboy/scp-action`, `appleboy/ssh-action` | Compiles Vite bundle, securely SCPs dist to EC2, tests Nginx and restarts via SSH | `.github/workflows/deploy.yml` | **Verified** |
| **AWS EC2 Ubuntu Host & Nginx** | AWS EC2 (ap-south-1), Nginx 1.24, Certbot SSL | Static web server hosting production build at `/var/www/html` with SSL termination | `.github/workflows/deploy.yml`, `automation/alert-monitor.cjs` | **Verified** |
| **Vercel Serverless Runtime** | Vercel Edge Serverless Functions | Hosts `/api/chat.ts` serverless route and handles SPA rewrites | `vercel.json`, `api/chat.ts` | **Verified** |
| **Google Gemini AI** | Google Gemini API (`GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`) | Generates intelligent AI chatbot responses with offline fallback answer bank | `api/chat.ts`, `src/components/ChatWidget.tsx`, `src/data/offlineAnswers.ts` | **Verified** |
| **Automation & Health Monitoring** | Node.js cron scripts, Nodemailer (Gmail SMTP), PDFKit | Automated server alerts, SSL expiry checks, backup creation, and daily PDF reporting | `automation/alert-monitor.cjs`, `automation/backup-server.cjs`, `automation/daily-report.cjs`, `automation/test-mail.cjs` | **Verified** |
| **Cloudflare DNS & CDN** | Cloudflare Global Anycast Edge | Authoritative DNS resolution and edge SSL caching | `automation/alert-monitor.cjs` | **Verified** |
| **Node.js / PM2 Cluster :3000** | Node.js, PM2 Process Supervisor | *Previously drawn backend app cluster* | None in repo (pure static SPA + Nginx) | **Removed (Unverified)** |
| **OpenSSH Ed25519 Gateway** | Standalone OpenSSH daemon card | *Previously drawn gateway card* | Merged into GitHub Actions SCP/SSH deploy step | **Removed (Unverified)** |
| **Production Ingress Target** | Vercel vs EC2 Deployment Target | Clarification of whether apex domain points to Vercel or EC2 | `vercel.json` vs `.github/workflows/deploy.yml` | **Needs Confirmation** |

---

## 2. Project: OnixMall (`onixmall` / `onixmall-devsecops`)
**Repository**: `ppiyushhhhh/onixmall`  
**Description**: Multi-container mall directory and tenant management application with Docker Compose and Ansible orchestration.

| Service / Component | Technology / Tier | Used For | Evidence Files | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web Application** | React 18, Vite, React Router, TanStack Query | Client web portal for mall visitors and tenant directory | `frontend/package.json`, `frontend/src/App.tsx` | **Verified** |
| **Express Backend REST API** | Express 4.x, CORS, express-rate-limit, Mongoose | RESTful API endpoints for `/api/malls` CRUD operations and security rate-limiting | `backend/server.js`, `backend/routes/mallRoutes.js` | **Verified** |
| **MongoDB Database** | MongoDB 7.0 container, Mongoose ODM | Primary transactional document database storing store listings and tenant data | `docker-compose.yml`, `backend/config/db.js` | **Verified** |
| **Docker Compose Stack** | `docker-compose.yml` (`onixmall-frontend`, `onixmall-backend`, `onixmall-mongo`) | Multi-container application stack running on AWS EC2 host | `docker-compose.yml`, `.github/workflows/docker-deploy.yml` | **Verified** |
| **AWS EC2 Application Host** | AWS EC2 Ubuntu Host (ap-south-1a) | Primary production host running Docker Compose and Nginx | `scripts/daily-report.sh`, `.github/workflows/docker-deploy.yml` | **Verified** |
| **AWS EC2 Ansible Control Host** | AWS EC2 (ap-south-1c), Ansible Playbooks | Dedicated control node executing configuration management playbooks | `.github/workflows/ansible-deploy.yml`, `scripts/daily-report.sh` | **Verified** |
| **GitHub Actions Workflows** | `docker-deploy.yml`, `ansible-deploy.yml`, `deploy.yml`, `test.yml` | Multi-path CI/CD automation: Docker deploy, Ansible automation, backup SSH rollout, and Vitest/Playwright | `.github/workflows/*.yml` | **Verified** |
| **Trivy Vulnerability Scanner** | Trivy CLI, `scripts/trivy-cron.sh` | Scheduled cron job scanning filesystem and generating PDF reports via Gmail | `scripts/trivy-cron.sh` | **Verified** |
| **Daily Health Reporter** | Shell script, PDFKit, Gmail SMTP | Daily DevOps PDF report testing frontend, API, and Grafana endpoints | `scripts/daily-report.sh` | **Verified** |
| **Linux UFW & iptables** | Netfilter firewall | *Previously drawn firewall card* | Unverified in repo config | **Removed (Unverified)** |
| **Fail2ban Intrusion Defense** | Fail2ban daemon | *Previously drawn intrusion defense* | Unverified in repo config | **Removed (Unverified)** |
| **Prometheus Node Exporter** | Node Exporter daemon | *Previously drawn node exporter* | Unverified in repo config | **Removed (Unverified)** |
| **Grafana & Prometheus Host** | Monitoring Stack | Clarification of whether Grafana/Prometheus runs on app host or control host | `scripts/daily-report.sh` mentions `grafana.` | **Needs Confirmation** |

---

## 3. Project: Sentinel Cloud View (`sentinel-cloud-view`)
**Repository**: `ppiyushhhhh/sentinel-cloud-view`  
**Description**: Lightweight cloud infrastructure and Docker container monitoring console with local SQLite telemetry.

| Service / Component | Technology / Tier | Used For | Evidence Files | Status |
| :--- | :--- | :--- | :--- | :--- |
| **React Vite Dashboard** | React 18, Vite, Tailwind CSS, Recharts | Single-page monitoring UI for servers, Docker containers, cleanup, and incident management | `package.json`, `src/pages/Dashboard.tsx`, `src/pages/Docker.tsx` | **Verified** |
| **Express Backend Daemon** | Express 4.19, Helmet, CORS, express-rate-limit, JWT, bcryptjs | Backend REST API running on port 5000 managing container actions and system telemetry | `backend/server.js`, `backend/routes/auth.js` | **Verified** |
| **SQLite 3 Databases** | `better-sqlite3` with WAL mode | Fast local transactional stores for authentication, alert history, reports, and Trivy scans | `backend/db.cjs`, `backend/auth-db.cjs`, `backend/trivy-db.cjs` | **Verified** |
| **Docker Engine Socket** | UNIX Domain Socket (`/var/run/docker.sock`), Docker CLI | Real-time container inspection (`docker ps`, `docker system df`) and image prune operations | `backend/server.js` | **Verified** |
| **PM2 Process Supervisor** | PM2 Process Manager (`cloudops-backend`) | Process supervision and auto-restart watchdog on EC2 instance | `deploy.yml`, `scripts/safe-deploy.sh` | **Verified** |
| **Nginx Ingress Proxy** | Nginx 1.24, Let's Encrypt TLS 1.3 | Serves `/var/www/html` static frontend and proxies `/api` to Node.js on port 5000 | `.github/workflows/deploy.yml`, `scripts/safe-deploy.sh` | **Verified** |
| **Host Telemetry Scripts** | Bash scripts (`collect-metrics.sh`, `health-check.sh`, `alert-check.sh`) | Systemd / Cron jobs capturing CPU, memory, load average, disk usage, and health checks | `scripts/collect-metrics.sh`, `scripts/health-check.sh` | **Verified** |
| **Trivy Security Scanner** | Trivy CLI & `aquasecurity/trivy-action` | Security vulnerability scanning in GitHub Actions CI and daily cron scans on host | `.github/workflows/deploy.yml`, `scripts/run-trivy-scan.sh` | **Verified** |
| **Email & Backup Reporting** | Nodemailer (Gmail SMTP), PDFKit | Automated security alert notifications, SQLite database backup delivery, and PDF reports | `backend/services/mailService.js`, `scripts/send-db-backup-mail.cjs` | **Verified** |
| **GitHub Actions CI/CD** | `deploy.yml` workflow | Build validation, two-tier Trivy scanning, SSH deployment, PM2 restart, and post-deploy alert | `.github/workflows/deploy.yml` | **Verified** |
| **Prometheus TSDB** | Prometheus 2.50 | *Previously drawn Prometheus database* | Only mock data in `src/data/mock.ts` | **Removed (Unverified)** |
| **Grafana Dashboards** | Grafana 10 | *Previously drawn Grafana instance* | Only mock data in `src/data/mock.ts` | **Removed (Unverified)** |

---

## 4. Project: PP·OPS Portfolio (`piyush-prasad` / `personal-portfolio`)
**Repository**: `ppiyushhhhh/piyush-prasad`  
**Description**: Production multi-cloud infrastructure powering `piyushprasad.in`.

| Service / Component | Technology / Tier | Used For | Evidence Files | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel Edge Network** | Vercel Global Anycast Edge | Edge routing, global CDN caching, SSL termination, and static asset delivery | Stated by owner, `package.json` | **Verified** |
| **TanStack Start & Nitro** | React 19, TanStack Start, Nitro SSR runtime | High-performance full-stack SSR runtime executing server functions and API handlers | `src/router.tsx`, `package.json`, `app.config.ts` | **Verified** |
| **Supabase PostgreSQL** | PostgreSQL 15, PostgREST, RLS policies (AWS ap-south-1) | Database cluster storing projects, skills, certificates, experience, and contact entries | `src/integrations/supabase/types.ts` | **Verified** |
| **Supabase Storage** | S3-compatible object storage (`project-media`, `database-backups`) | Cloud storage for portfolio media assets, architecture diagrams, and nightly backups | `scripts/run-database-backup.mjs` | **Verified** |
| **Google Gemini 3.6 Flash** | Gemini 3.6 Flash API | Primary conversational AI assistant powering `/api/chat` with deep context integration | `src/routes/api/chat.ts` | **Verified** |
| **Resend Email Service** | Resend REST API | Primary transactional email dispatch for contact inquiries | `src/routes/api/contact.ts` | **Verified** |
| **Nodemailer SMTP Fallback** | Nodemailer over TLS Port 465 (Gmail SMTP) | Secondary fallback email gateway if primary Resend API fails | `src/routes/api/contact.ts` | **Verified** |
| **Web3Forms Emergency Alert** | Web3Forms HTTP API | Operational alert fallback for backup failure notifications | `scripts/run-database-backup.mjs` | **Verified** |
| **GitHub Actions CI/CD & Crons** | GitHub Actions Ubuntu runners | Code validation, CodeQL analysis, daily health reports, and nightly database backups | `.github/workflows/*.yml` | **Verified** |
| **Headless Chrome & Lighthouse** | Headless Chrome, Lighthouse CLI, PDFKit | Daily performance audit and PDF generation in GitHub Actions | `scripts/generate-report.mjs` | **Verified** |

---

## 5. Unreadable External Repositories (Documented Status)

The following repositories were not accessible in public GitHub (`ppiyushhhhh/*`), so their architecture diagrams maintain `verification: "documented"` status:

1. **Telegram AI Agent** (`telegram-ai-agent`):
   - **Technologies**: Telegram Bot API Cloud, Cloudflare Workers (V8), Auth/Idempotency Layer, Google Gemini 1.5 Flash (Primary), Cloudflare Workers AI Fallback (Llama 3), Cloudflare D1 Database.
   - **Status**: Documented from portfolio specification. Needs repository name confirmation.

2. **DevSecOps Pipeline Scripts** (`devsecops-pipeline-scripts`):
   - **Technologies**: Git Workstation, Pre-commit Secret Scanner, GitHub Actions CI Runner, Hadolint Dockerfile Linter, Trivy Security Gate, Compliance Reporter, OCI Container Registry.
   - **Status**: Documented from portfolio specification. Needs repository name confirmation.

3. **AWS Infrastructure Templates** (`aws-infrastructure-templates`):
   - **Technologies**: Terraform / CloudFormation, AWS VPC (10.0.0.0/16), Public Subnets & IGW, NAT Gateways, Private Subnets, IAM Roles & Security Groups, Ubuntu Cloud-Init, AWS Backup & EBS Snapshots.
   - **Status**: Documented from portfolio specification. Needs repository name confirmation.
