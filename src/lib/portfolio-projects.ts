import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { GITHUB } from "@/lib/site";

type DbProjectInsert = Database["public"]["Tables"]["portfolio_projects"]["Insert"];
type DbProjectUpdate = Database["public"]["Tables"]["portfolio_projects"]["Update"];

export type ProjectStatus = "Production" | "UAT" | "Personal Project" | "Development" | "Archived";

export interface ArchitectureComponent {
  id: string;
  name: string;
  type:
    "edge" | "compute" | "network" | "security" | "storage" | "database" | "observability" | "cicd";
  description: string;
  tech: string;
  details?: string;
  port?: string;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  label?: string;
  protocol?: string;
  category?: "network" | "data" | "security" | "deployment" | "telemetry";
  direction?: "directional" | "bidirectional";
  secondary?: boolean;
  description?: string;
  step?: number;
}

export interface ArchitectureData {
  title?: string;
  summary?: string;
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
  journey?: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: ProjectStatus;
  short_description: string;
  overview: string;
  problem_solved?: string | null;
  objectives?: string | null;
  solution?: string | null;
  technologies: string[];
  key_features: string[];
  architecture_description?: string | null;
  architecture_data?: ArchitectureData | null;
  implementation_details?: string | null;
  cicd_details?: string | null;
  security_details?: string | null;
  challenges?: string | null;
  results?: string | null;
  repository_url?: string | null;
  live_demo_url?: string | null;
  cover_image_url?: string | null;
  screenshots: string[];
  deployment_environment?: string | null;
  started_at?: string | null;
  updated_at_date?: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProjectInput {
  title: string;
  slug: string;
  category: string;
  status: ProjectStatus;
  short_description: string;
  overview: string;
  problem_solved?: string | null;
  objectives?: string | null;
  solution?: string | null;
  technologies: string[];
  key_features: string[];
  architecture_description?: string | null;
  architecture_data?: ArchitectureData | null;
  implementation_details?: string | null;
  cicd_details?: string | null;
  security_details?: string | null;
  challenges?: string | null;
  results?: string | null;
  repository_url?: string | null;
  live_demo_url?: string | null;
  cover_image_url?: string | null;
  screenshots?: string[];
  deployment_environment?: string | null;
  started_at?: string | null;
  updated_at_date?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
  display_order?: number;
}

export const PROJECT_CATEGORIES = [
  "AWS & Cloud Infrastructure",
  "CI/CD & Automation",
  "DevSecOps & Security",
  "Docker & Monitoring",
  "Linux & System Administration",
  "Cloud Operations",
] as const;

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Production",
  "UAT",
  "Personal Project",
  "Development",
  "Archived",
];

export const STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Production: {
    label: "Production",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  UAT: {
    label: "UAT",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  "Personal Project": {
    label: "Personal Project",
    bg: "bg-accent-soft dark:bg-accent-soft",
    text: "text-accent dark:text-accent",
    border: "border-accent/30 dark:border-accent/40",
    dot: "bg-accent",
  },
  Development: {
    label: "Development",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    dot: "bg-cyan-500",
  },
  Archived: {
    label: "Archived",
    bg: "bg-neutral-100 dark:bg-neutral-900",
    text: "text-neutral-600 dark:text-neutral-400",
    border: "border-neutral-200 dark:border-neutral-800",
    dot: "bg-neutral-400",
  },
};

/**
 * Initial verified project data derived from Piyush Prasad's GitHub and production architecture.
 * Ensures that if Supabase is offline or the migration hasn't run on a preview container,
 * all pages continue to render complete, verified technical case studies without errors.
 */
export const INITIAL_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "init-kamlesh-prasad",
    title: "Kamlesh Prasad Production Portfolio & Cloud Infrastructure",
    slug: "kamlesh-prasad",
    category: "CI/CD & Automation",
    status: "Production",
    short_description:
      "High-availability web hosting on AWS EC2 with automated GitHub Actions push-to-deploy pipeline, Nginx reverse proxy, and Cloudflare edge CDN caching.",
    overview:
      "Engineered an automated cloud delivery architecture for a production client web application. The platform incorporates zero-downtime Nginx reloads upon release tag creation, TLS 1.3 cryptographic termination, automated Let's Encrypt certificate renewal, and enterprise email security records (SPF, DKIM, DMARC).",
    problem_solved:
      "Replaced error-prone manual FTP/SSH uploads with a strict continuous delivery pipeline, eliminated customer-facing downtime during content deployments, and mitigated public cloud attack surfaces through rigorous security group controls.",
    objectives:
      "1. Build a zero-downtime deployment pipeline triggered by Git tags.\n2. Enforce edge security and DDoS mitigation via Cloudflare.\n3. Implement automated TLS certificate lifecycles via Let's Encrypt and Certbot.\n4. Protect enterprise email deliverability through SPF, DKIM, and DMARC policies.",
    solution:
      "Configured an AWS EC2 instance running Ubuntu 24.04 LTS behind Cloudflare DNS and CDN caching. Connected GitHub Actions to trigger automated test suites, build minified production bundles, and execute zero-downtime deployment scripts over authenticated SSH keys.",
    technologies: [
      "AWS EC2",
      "Ubuntu 24.04 LTS",
      "GitHub Actions",
      "Nginx Reverse Proxy",
      "Cloudflare CDN",
      "Let's Encrypt SSL",
      "SPF / DKIM / DMARC",
      "SSH Key Auth",
      "TypeScript",
    ],
    key_features: [
      "Automated push-to-deploy continuous delivery pipeline with GitHub Actions",
      "Zero-downtime Nginx reload upon release tag push",
      "Cloudflare CDN edge caching with TLS 1.3 encryption and DDoS protection",
      "Domain and DNS administration with ResellerClub and Cloudflare",
      "Configured enterprise email security records (SPF, DKIM, DMARC)",
    ],
    architecture_description:
      "Client Browser → Cloudflare Global Edge CDN → AWS EC2 Security Group (Ports 80/443) → Nginx Reverse Proxy with TLS termination → Node.js application process supervisor.",
    architecture_data: {
      title: "Cloud Delivery Architecture",
      summary: "End-to-end edge-to-compute traffic flow and automated CI/CD pipeline",
      components: [
        {
          id: "client",
          name: "Client Browser",
          type: "edge",
          description: "Global web visitors accessing kamleshprasad.in over HTTPS",
          tech: "React 18 / Vite SPA",
        },
        {
          id: "cloudflare",
          name: "Cloudflare Edge Network",
          type: "network",
          description: "Authoritative DNS resolution, edge caching, WAF, and DDoS mitigation",
          tech: "Cloudflare DNS & CDN",
          details: "Caches static assets, terminates public TLS 1.3, forwards dynamic traffic to origin.",
        },
        {
          id: "nginx",
          name: "Nginx Web Server & EC2",
          type: "compute",
          description: "Reverse proxy on AWS EC2 serving static production bundle with Certbot SSL",
          tech: "Nginx 1.24",
          port: "80, 443",
        },
        {
          id: "vercel",
          name: "Vercel Edge Functions",
          type: "compute",
          description: "Serverless edge runtime hosting /api/chat endpoint for AI chatbot",
          tech: "Vercel Edge Functions",
        },
        {
          id: "gemini",
          name: "Google Gemini AI Engine",
          type: "compute",
          description: "Conversational AI model streaming answers via Gemini 1.5 Flash API",
          tech: "Gemini 1.5 Flash",
        },
        {
          id: "github-actions",
          name: "GitHub Actions CI/CD",
          type: "cicd",
          description: "Continuous delivery runner compiling Vite bundle and syncing to EC2 via SSH",
          tech: "GitHub Actions Runner",
        },
        {
          id: "automation",
          name: "Health & Alert Automation",
          type: "observability",
          description: "Host monitoring scripts performing health probes and mailing PDF reports",
          tech: "Nodemailer & PDFKit",
        },
      ],
      connections: [
        { from: "client", to: "cloudflare", label: "HTTPS Ingress", protocol: "TLS 1.3" },
        { from: "cloudflare", to: "nginx", label: "Origin Request", protocol: "HTTPS (Port 443)" },
        { from: "client", to: "vercel", label: "AI Chat Invocations", protocol: "HTTPS / POST /api/chat" },
        { from: "vercel", to: "gemini", label: "Prompt Inference", protocol: "REST API / TLS 1.3" },
        { from: "github-actions", to: "nginx", label: "SCP Dist & SSH Reload", protocol: "SSH (Port 22)" },
        { from: "automation", to: "nginx", label: "Daily Health Probe", protocol: "HTTP Localhost", secondary: true },
      ],
    },
    implementation_details:
      "Provisioned AWS EC2 in region ap-south-1 with 20GB gp3 EBS storage. Configured systemd service descriptors and PM2 ecosystem configuration. Created a dedicated deploy user with restricted sudo privileges and public key authentication.",
    cicd_details:
      "GitHub Actions workflow runs on every push to main. It installs dependencies, runs linter and unit tests, executes production build, and executes an atomic blue/green or symlink reload script on the server.",
    security_details:
      "Configured UFW default-deny policy. Enforced Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, and Content-Security-Policy headers in Nginx configuration. Implemented rate-limited SSH ingress.",
    challenges:
      "Ensuring zero dropped HTTP connections during Nginx reload was solved by utilizing systemctl reload nginx combined with PM2 graceful reload signals.",
    results:
      "Achieved 100% automated release velocity with zero manual SSH commands required for deployments. Global time-to-first-byte (TTFB) reduced significantly via Cloudflare edge caching.",
    repository_url: `${GITHUB}/Kamlesh-Prasad`,
    live_demo_url: "https://kamleshprasad.com",
    cover_image_url: null,
    screenshots: [],
    deployment_environment: "AWS EC2 (Ubuntu 24.04 LTS ap-south-1)",
    started_at: "2024-03-01",
    updated_at_date: "2026-05-15",
    is_featured: true,
    is_published: true,
    display_order: 1,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2026-05-15T00:00:00Z",
  },

  {
    id: "init-onixmall",
    title: "OnixMall Production-Hardened Cloud & Observability Stack",
    slug: "onixmall",
    category: "DevSecOps & Security",
    status: "Production",
    short_description:
      "Hardened AWS EC2 infrastructure with Prometheus metrics collection, Grafana observability dashboards, Trivy vulnerability scanning, and strict UFW firewall policies.",
    overview:
      "Designed and deployed a production-hardened Linux cloud infrastructure for an e-commerce platform. Features continuous automated Trivy CVE vulnerability scans, Prometheus metric scraping of host resources, Grafana operational telemetry dashboards, and strict network isolation.",
    problem_solved:
      "Overcame lack of server health visibility, unmonitored disk/memory usage surges, unpatched OS package vulnerabilities, and unprotected network attack surfaces on public cloud instances.",
    objectives:
      "1. Build real-time host and process metrics telemetry with Prometheus.\n2. Design Grafana dashboards for CPU, memory, network, and disk I/O monitoring.\n3. Implement automated vulnerability scanning using Trivy.\n4. Enforce CIS-inspired Linux OS hardening standards and UFW firewall rules.",
    solution:
      "Configured Prometheus server scraping Node Exporter on localhost:9100. Built custom Grafana dashboards for alert notifications on high CPU or memory thresholds. Automated Trivy scans running scheduled daily audits with Markdown vulnerability reports.",
    technologies: [
      "AWS EC2",
      "Prometheus",
      "Grafana",
      "Node Exporter",
      "Trivy Vulnerability Scanner",
      "UFW Firewall",
      "Certbot SSL",
      "Bash / Shell",
      "Linux Hardening",
    ],
    key_features: [
      "Continuous automated Trivy vulnerability scanning for OS packages and container layers",
      "Prometheus time-series collection of CPU, RAM, disk I/O, and network metrics",
      "Grafana dashboards visualising real-time host resource utilisation and alert triggers",
      "UFW firewall policy enforcing default-deny ingress with rate-limited SSH",
      "Automated SSL certificate renewal daemon managed via systemd timers",
    ],
    architecture_description:
      "Ingress → AWS EC2 Security Group → Linux UFW Firewall → Nginx Web Server. Prometheus server periodically scrapes Node Exporter on localhost:9100, providing telemetry to Grafana.",
    architecture_data: {
      title: "DevSecOps Multi-Container Architecture",
      summary: "Docker Compose multi-container stack with Ansible orchestration and Trivy security auditing",
      components: [
        {
          id: "client",
          name: "Client Public Visitor",
          type: "edge",
          description: "Visitors and tenants accessing the OnixMall web platform over HTTPS",
          tech: "Web Browser / HTTPS",
        },
        {
          id: "nginx",
          name: "Nginx Hardened Web Server",
          type: "network",
          description: "SSL termination with modern TLS suites and rate-limiting reverse proxy",
          tech: "Nginx 1.24 / SSL",
          port: "80, 443",
        },
        {
          id: "vite",
          name: "Frontend Web Application",
          type: "compute",
          description: "Tenant directory and mall search portal running in Docker container",
          tech: "React 18 / Vite SPA",
          port: "80",
        },
        {
          id: "express",
          name: "Express REST API Backend",
          type: "compute",
          description: "RESTful API handling mall listings, tenant CRUD, and rate limiting",
          tech: "Express 4.x / Node.js",
          port: "5000",
        },
        {
          id: "mongo",
          name: "MongoDB Document Store",
          type: "database",
          description: "Transactional document datastore persisting store listings and tenant data",
          tech: "MongoDB 7.0 Community",
          port: "27017",
        },
        {
          id: "email",
          name: "DevOps Alert & PDF Reporter",
          type: "observability",
          description: "Daily reporting daemon emailing health metrics and PDF summaries",
          tech: "Nodemailer / Gmail SMTP",
        },
        {
          id: "trivy",
          name: "Trivy Security Scanner",
          type: "security",
          description: "Vulnerability scanning daemon auditing container images and gating CI",
          tech: "Trivy Vulnerability Gate",
        },
        {
          id: "actions",
          name: "GitHub Actions CI/CD",
          type: "cicd",
          description: "Automated delivery runner building container images and deploying to EC2 host",
          tech: "GitHub Actions Runner",
        },
        {
          id: "ansible",
          name: "Ansible Control Host",
          type: "cicd",
          description: "Configuration management node executing playbooks for host provisioning",
          tech: "Ansible Playbooks",
        },
      ],
      connections: [
        { from: "client", to: "nginx", label: "HTTPS Web Ingress", protocol: "TLS 1.3", step: 1 },
        { from: "nginx", to: "vite", label: "Frontend Proxy Pass", protocol: "HTTP / Port 80", step: 2 },
        { from: "vite", to: "express", label: "REST API Requests", protocol: "HTTP /api/malls", step: 3 },
        { from: "express", to: "mongo", label: "Database CRUD Operations", protocol: "MongoDB Port 27017", direction: "bidirectional", step: 4 },
        { from: "actions", to: "trivy", label: "CI Vulnerability Gate", protocol: "Trivy Action / Exit 1", secondary: true, step: 5 },
        { from: "actions", to: "sec-onix-docker", label: "SSH Compose Deploy", protocol: "docker-compose up -d --build", secondary: true, step: 6 },
        { from: "actions", to: "ansible", label: "Trigger Ansible CI", protocol: "ansible-deploy.yml", secondary: true, step: 7 },
        { from: "ansible", to: "sec-onix-docker", label: "Ansible Playbook Rollout", protocol: "ansible-playbook", secondary: true, step: 8 },
        { from: "trivy", to: "email", label: "Email Daily PDF Report", protocol: "Nodemailer / SMTP 465", secondary: true, step: 9 },
      ],
    },
    implementation_details:
      "Created standardized Bash provisioning scripts to configure non-root system users, disable SSH password authentication, configure sysctl kernel parameters (such as disabling IP forwarding and enabling SYN cookies), and automate security updates via unattended-upgrades.",
    cicd_details:
      "Automated cron jobs execute Trivy security audits daily, generating formatted Markdown status reports to verify zero unaddressed High or Critical CVEs in installed packages.",
    security_details:
      "Fail2ban daemon actively monitors SSH authentication failures and injects temporary iptables drop rules against repeat offenders. Ingress ports for Grafana and Prometheus are restricted to localhost and accessible only via SSH tunnels or authenticated reverse proxies.",
    challenges:
      "Balancing Prometheus memory consumption on standard EC2 instances was resolved by fine-tuning storage retention policies (--storage.tsdb.retention.time=15d) and scrape intervals.",
    results:
      "100% visibility into server resource consumption and instant alerting before memory exhaustion occurs. System security posture verified against common vulnerability benchmarks.",
    repository_url: `${GITHUB}/onixmall`,
    live_demo_url: null,
    cover_image_url: null,
    screenshots: [],
    deployment_environment: "AWS EC2 (Ubuntu LTS ap-south-1)",
    started_at: "2024-04-10",
    updated_at_date: "2026-06-20",
    is_featured: true,
    is_published: true,
    display_order: 2,
    created_at: "2024-04-10T00:00:00Z",
    updated_at: "2026-06-20T00:00:00Z",
  },

  {
    id: "init-sentinel-cloud-view",
    title: "CloudOps Sentinel: Docker Fleet & Infrastructure Cockpit",
    slug: "sentinel-cloud-view",
    category: "Docker & Monitoring",
    status: "Personal Project",
    short_description:
      "Full-stack operational monitoring dashboard providing real-time server cluster metrics, Docker container lifecycle controls, and automated database retention routines.",
    overview:
      "CloudOps Sentinel is a full-stack infrastructure cockpit engineered to monitor fleet metrics, supervise Docker containers, and automate backup cycles. Features real-time CPU/memory meters, Docker container start/stop/restart management, automated SQLite database retention with pre-cleanup SQL dumps, and Trivy CVE report ingestion.",
    problem_solved:
      "Replaced disjointed command-line utilities (docker ps, htop, df, systemctl) with a consolidated, secure web cockpit for swift diagnosis during incident responses.",
    objectives:
      "1. Build authenticated telemetry endpoints interfacing with the Linux kernel and Docker socket.\n2. Render live CPU, RAM, disk, and container lifecycle telemetry in a React dashboard.\n3. Automate SQLite database retention routines with pre-cleanup SQL dumps.\n4. Ingest and display Trivy vulnerability trends.",
    solution:
      "Built a Node.js/Express backend communicating directly with /proc system statistics and the Docker UNIX domain socket (/var/run/docker.sock). Connected to a React single-page frontend with responsive metric cards, chart visualizations, and process controls.",
    technologies: [
      "Docker",
      "React",
      "Node.js",
      "Express",
      "SQLite",
      "PM2",
      "Nginx",
      "Trivy",
      "GitHub Actions",
    ],
    key_features: [
      "Real-time server cluster metric telemetry and storage volume consumption graphs",
      "Docker container fleet health monitoring and restart management",
      "Automated scheduled SQLite database retention and pre-cleanup SQL dumps",
      "Role-based authenticated administrative login protecting monitoring endpoints",
      "Trivy CVE scan report ingestion and vulnerability trend charts",
    ],
    architecture_description:
      "React dashboard client → Role-gated Node.js REST API → Linux /proc telemetry & Docker Engine socket (/var/run/docker.sock) → Local SQLite persistent store.",
    architecture_data: {
      title: "Sentinel Fleet Telemetry Architecture",
      summary: "Role-gated monitoring console with Docker socket IPC and local SQLite persistence",
      components: [
        {
          id: "ui",
          name: "Sentinel React UI",
          type: "edge",
          description: "Authenticated web interface with live gauges and container management",
          tech: "React 18 / Vite Admin",
        },
        {
          id: "nginx",
          name: "Nginx Ingress Proxy",
          type: "network",
          description: "Reverse proxy handling SSL termination and proxying authenticated API requests",
          tech: "Nginx 1.24 / TLS 1.3",
          port: "80, 443",
        },
        {
          id: "pm2",
          name: "PM2 Process Supervisor",
          type: "compute",
          description: "Process supervisor maintaining backend daemon with automatic recovery",
          tech: "PM2 Daemon / Watchdog",
        },
        {
          id: "api",
          name: "Express Monitoring API",
          type: "compute",
          description: "Protected REST API reading system telemetry and container states",
          tech: "Express 4.19 / Node.js",
          port: "5000",
        },
        {
          id: "docker-sock",
          name: "Docker Engine Daemon",
          type: "compute",
          description: "Container runtime socket providing container inspection and lifecycle controls",
          tech: "Docker Socket (/var/run/docker.sock)",
        },
        {
          id: "sqlite",
          name: "Persistent SQLite Store",
          type: "database",
          description: "Local embedded datastore maintaining historical metrics and audit trails",
          tech: "SQLite 3 (WAL Mode)",
        },
        {
          id: "actions",
          name: "GitHub Actions CI/CD",
          type: "cicd",
          description: "Automated continuous delivery runner triggering SSH deploy and PM2 reload",
          tech: "GitHub Actions Runner",
        },
        {
          id: "alerts",
          name: "Email & Backup Reporter",
          type: "observability",
          description: "Alert notification daemon mailing threshold warnings and SQLite dumps",
          tech: "Nodemailer & PDFKit",
        },
      ],
      connections: [
        { from: "ui", to: "nginx", label: "HTTPS Admin Route", protocol: "HTTPS / TLS 1.3" },
        { from: "nginx", to: "pm2", label: "Supervised Proxy Pass", protocol: "HTTP / localhost:5000" },
        { from: "pm2", to: "api", label: "Process Management", protocol: "Node.js IPC" },
        { from: "api", to: "docker-sock", label: "Engine Socket IPC", protocol: "UNIX Domain Socket", direction: "bidirectional" },
        { from: "api", to: "sqlite", label: "Telemetry & Logs", protocol: "WAL Mode SQL", direction: "bidirectional" },
        { from: "actions", to: "pm2", label: "CI/CD SSH Deploy", protocol: "SSH (Port 22)" },
        { from: "alerts", to: "api", label: "Alert Dispatch & Backup", protocol: "SMTP 465 / Mail", secondary: true },
      ],
    },
    implementation_details:
      "Implemented Node.js child-process supervisors and stream readers to process /proc/stat, /proc/meminfo, and Docker socket events without CPU-intensive polling.",
    cicd_details:
      "Continuous integration runs automated Dockerfile linting (Hadolint), vulnerability scans with Trivy, and unit tests validating API endpoint authentication.",
    security_details:
      "Secured access to /var/run/docker.sock by running the service within a dedicated group with least-privilege POSIX permissions. Implemented JWT token expiration and rate limiting.",
    challenges:
      "Preventing SQLite database bloat over long monitoring runs was achieved by implementing an automated 30-day retention pruning job with automatic vacuuming.",
    results:
      "Sub-second container state discovery and metric refresh without noticeable CPU overhead on host infrastructure.",
    repository_url: `${GITHUB}/sentinel-cloud-view`,
    live_demo_url: null,
    cover_image_url: null,
    screenshots: [],
    deployment_environment: "AWS EC2 Docker Host",
    started_at: "2024-05-01",
    updated_at_date: "2026-07-10",
    is_featured: true,
    is_published: true,
    display_order: 3,
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
  },

  {
    id: "init-piyush-prasad",
    title: "PP·OPS: Cloud Operations Portfolio & Diagnostic Console",
    slug: "piyush-prasad",
    category: "AWS & Cloud Infrastructure",
    status: "Production",
    short_description:
      "Personal CloudOps engineering portfolio and operational dashboard featuring live endpoint health diagnostics, atomic rate limiting, and Supabase integration.",
    overview:
      "Engineered a production full-stack engineering portfolio and operational telemetry cockpit (PP·OPS). Includes live TLS 1.3 socket diagnostics, atomic PostgreSQL rate limiting with row-level locks, automated backup retention with pre-deletion SQL dumps, digital credential ingestion, and an AI assistant powered by Google Gemini.",
    problem_solved:
      "Provides verifiable proof of cloud engineering capability through live diagnostic instrumentation, hardened database policies, and real-time operational status transparency.",
    objectives:
      "1. Build a high-performance modern web application with TanStack Start and React 19.\n2. Implement live TLS 1.3 certificate inspection and DNS health probing.\n3. Enforce distributed IP rate limiting using atomic PostgreSQL locks.\n4. Design automated database retention policies with pre-cleanup SQL backups.",
    solution:
      "Deployed on Cloudflare edge and AWS infrastructure using TanStack Start server functions and Supabase PostgreSQL. Integrated Credly digital credentials API sync and Google Gemini AI assistant.",
    technologies: [
      "AWS EC2",
      "Cloudflare Workers",
      "Supabase",
      "PostgreSQL",
      "React 19",
      "TanStack Start",
      "TypeScript",
      "Tailwind CSS",
      "Google Gemini AI API",
    ],
    key_features: [
      "Real-time TLS 1.3 certificate inspection and DNS health probing",
      "Distributed IP rate limiter using atomic PostgreSQL row-level locks",
      "Supabase database retention policies with pre-deletion SQL backups",
      "Verified Credly digital credentials sync with automatic profile badge ingestion",
      "Ask Piyush AI assistant trained on portfolio content using Google Gemini API",
    ],
    architecture_description:
      "Enterprise DevSecOps multi-branch release pipeline: Feature Branch → UAT Preview (test.piyushprasad.in) → Promotion Approval Gate → Production (piyushprasad.in), coupled with autonomous 19:00 IST synthetic audits and 02:00 UTC database backups.",
    architecture_data: {
      title: "PP·OPS Cloud Architecture & Release Pipeline",
      summary: "Multi-branch UAT release flow, server-side rendering, and scheduled automation",
      components: [
        {
          id: "dev",
          name: "Developer / Lovable Editor",
          type: "edge",
          description: "Engineers code changes via local Git CLI or Lovable editor",
          tech: "Local Git / Lovable",
        },
        {
          id: "github",
          name: "GitHub Repository",
          type: "cicd",
          description: "Multi-branch repository managing feature, uat, and main branches",
          tech: "GitHub Enterprise",
        },
        {
          id: "ci",
          name: "GitHub Actions CI Pipeline",
          type: "cicd",
          description: "Automated Bun typecheck, ESLint, security audit, and Vite SSR build verification",
          tech: "GitHub Actions / Bun",
        },
        {
          id: "uat",
          name: "UAT Staging Environment",
          type: "compute",
          description: "Pre-production Vercel preview at test.piyushprasad.in with mutation blocker and simulated email",
          tech: "Vercel Preview / Staging Guard",
        },
        {
          id: "approval",
          name: "Promotion Approval Gate",
          type: "security",
          description: "Mandatory PR review and CI check verification before merging into main",
          tech: "GitHub PR Review",
        },
        {
          id: "prod",
          name: "Production Environment",
          type: "compute",
          description: "Live production website serving global traffic at piyushprasad.in (goes live only here)",
          tech: "Vercel Serverless Edge",
        },
        {
          id: "db",
          name: "Supabase PostgreSQL",
          type: "database",
          description: "Production relational database with strict Row Level Security policies",
          tech: "PostgreSQL 15 / Supabase",
        },
        {
          id: "automation",
          name: "Scheduled Automation",
          type: "cicd",
          description: "Daily 19:00 IST synthetic Lighthouse health audits and 02:00 UTC table backups",
          tech: "GitHub Actions / Node 20",
        },
      ],
      connections: [
        { from: "dev", to: "github", label: "1. Push Feature Branch", protocol: "Git Push / HTTPS" },
        { from: "github", to: "ci", label: "2. Trigger CI Pipeline", protocol: "Actions Webhook" },
        { from: "ci", to: "uat", label: "3. Deploy UAT Preview", protocol: "Vercel Preview Deploy" },
        { from: "uat", to: "approval", label: "4. Test & Sign-Off", protocol: "UAT QA Review" },
        { from: "approval", to: "github", label: "5. Merge PR into main", protocol: "GitHub PR Merge" },
        { from: "github", to: "ci", label: "6. Production CI", protocol: "Release CI Trigger" },
        { from: "ci", to: "prod", label: "7. Auto-Deploy Production", protocol: "Vercel Production Deploy" },
        { from: "prod", to: "db", label: "Atomic SQL Query", protocol: "PostgreSQL Wire" },
        { from: "automation", to: "prod", label: "HTTPS Health Probe", protocol: "Lighthouse / HTTPS" },
        { from: "automation", to: "db", label: "Nightly SQL Backup", protocol: "pg_dump / TLS" },
      ],
    },
    implementation_details:
      "Configured TypeScript strict mode with zero any types across all routes, models, and server handlers. Implemented custom Vite bundling configurations for staging and production parity.",
    cicd_details:
      "Enterprise DevSecOps multi-branch promotion workflow: Commits on feature branches or via the Lovable editor are pushed to pull requests targeting `uat`. GitHub Actions CI verifies TypeScript strict types, ESLint rules, and builds a Vercel preview deployment mapped to `test.piyushprasad.in` with staging isolation guards (robots noindex, [STAGING] prefix, database mutation blocker, and simulated email). After QA verification, an approval gate PR from `uat` into `main` promotes code to production at `piyushprasad.in`. Push to uat deploys to test.piyushprasad.in only. Only the approved merge into main goes live. In parallel, scheduled GitHub Actions cron jobs orchestrate daily 19:00 IST synthetic Lighthouse health audits (generating executive PDF reports delivered via SMTP) and 02:00 UTC database backups with 7-day rolling retention in Supabase storage.",
    security_details:
      "Strict Row Level Security policies protect all tables. Honeypot traps and sliding-window rate limiters prevent spam bots without CAPTCHAs. Sensitive environment credentials are encrypted at rest.",
    challenges:
      "Preventing database concurrency races during burst traffic was solved by implementing PostgreSQL SELECT ... FOR UPDATE atomic locks in rate-limiting procedures.",
    results:
      "Sub-100ms response latencies, 100% automated CI verification pass rate, and zero spam penetration across live contact forms.",
    repository_url: `${GITHUB}/piyush-prasad`,
    live_demo_url: "https://piyushprasad.in",
    cover_image_url: null,
    screenshots: [],
    deployment_environment: "Vercel & Supabase Cloud",
    started_at: "2024-01-15",
    updated_at_date: "2026-11-18",
    is_featured: true,
    is_published: true,
    display_order: 4,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2026-11-18T00:00:00Z",
  },

  {
    id: "init-devsecops-pipeline-scripts",
    title: "DevSecOps Automated Pipeline & Security Gate Suite",
    slug: "devsecops-pipeline-scripts",
    category: "CI/CD & Automation",
    status: "Personal Project",
    short_description:
      "Curated library of production-tested Shell and Python automation scripts for container scanning, policy enforcement, pre-commit secret detection, and CI/CD quality gates.",
    overview:
      "Developed a modular automation suite of Bash and Python security utilities designed to integrate into CI/CD pipelines (GitHub Actions, GitLab CI) and local developer Git hooks. Automatically discovers exposed secrets, enforces container image vulnerability thresholds, and generates compliance reports.",
    problem_solved:
      "Prevents secrets leakage, misconfigured container permissions, and unpatched CVEs from advancing into production deployment pipelines.",
    objectives:
      "1. Build pre-commit hooks preventing hardcoded AWS/API credentials.\n2. Implement automated exit-code gating on HIGH/CRITICAL Trivy vulnerabilities.\n3. Create automated vulnerability report generators in Markdown and JSON.\n4. Recommend minimal base-image alternatives for Docker containers.",
    solution:
      "Engineered portable, version-controlled scripts that execute within GitHub Actions runners and local Git repositories. Configured automated regex scanning for secret patterns and container layer vulnerability thresholds.",
    technologies: [
      "Bash / Shell",
      "Python 3",
      "Trivy",
      "Docker",
      "Git Hooks",
      "GitHub Actions",
      "Linux CLI",
    ],
    key_features: [
      "Automated exit-code gating on HIGH/CRITICAL severity vulnerabilities in CI/CD",
      "Git pre-commit hooks to block exposed API keys and sensitive credentials",
      "Automated generation of vulnerability reports in Markdown and JSON formats",
      "Docker image layer security analysis and minimal base-image recommendations",
    ],
    architecture_description:
      "Integrated into GitHub Actions workflow execution pipelines and local developer Git hooks before code merge and container push.",
    architecture_data: {
      title: "DevSecOps Pipeline Gate Flow",
      summary: "Security verification stages from local commit to container registry",
      components: [
        {
          id: "dev",
          name: "Local Git Commit",
          type: "edge",
          description: "Developer runs git commit",
          tech: "Git CLI",
        },
        {
          id: "hook",
          name: "Pre-Commit Hook",
          type: "security",
          description: "Scans staged files for high-entropy tokens and regex credential patterns",
          tech: "Shell / Python Regex",
        },
        {
          id: "ci",
          name: "GitHub Actions Runner",
          type: "cicd",
          description: "Isolated Linux runner checking out code upon pull request",
          tech: "GitHub Actions (Ubuntu Latest)",
        },
        {
          id: "trivy-step",
          name: "Trivy Security Gate",
          type: "security",
          description: "Scans Dockerfile and container images for known CVEs",
          tech: "Trivy CLI",
          details: "Fails pipeline build with exit code 1 if Critical CVE is detected.",
        },
        {
          id: "registry",
          name: "Secure Artifact Registry",
          type: "storage",
          description: "Verified container images pushed only after all security gates pass",
          tech: "Container Registry",
        },
      ],
      connections: [
        { from: "dev", to: "hook", label: "Local Staging", protocol: "Git Hook" },
        { from: "hook", to: "ci", label: "Push / PR Trigger", protocol: "Git Push" },
        { from: "ci", to: "trivy-step", label: "Image Scan", protocol: "CLI Execution" },
        { from: "trivy-step", to: "registry", label: "Authorized Push", protocol: "Docker Push" },
      ],
    },
    implementation_details:
      "Scripts are designed with zero third-party dependencies where possible, utilizing native Linux tools (grep, awk, sed, jq) for fast execution in minimalist runner environments.",
    cicd_details:
      "Includes complete sample GitHub Actions YAML templates demonstrating how to drop the security suite into existing repositories in under 5 minutes.",
    security_details:
      "Enforces non-root container user verification and checks for missing USER directives in Dockerfiles.",
    challenges:
      "Preventing false positives during secret scanning was solved by adding configurable allowlist patterns for test fixture hashes.",
    results:
      "Zero secret leaks across audited repositories and rapid sub-15 second security gate verification times.",
    repository_url: `${GITHUB}/devsecops-pipeline-scripts`,
    live_demo_url: null,
    cover_image_url: null,
    screenshots: [],
    deployment_environment: "GitHub Actions Runners / Linux CLI",
    started_at: "2024-06-01",
    updated_at_date: "2026-08-15",
    is_featured: false,
    is_published: true,
    display_order: 5,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  },

  {
    id: "init-aws-infrastructure-templates",
    title: "AWS Well-Architected Infrastructure-as-Code Templates",
    slug: "aws-infrastructure-templates",
    category: "AWS & Cloud Infrastructure",
    status: "Personal Project",
    short_description:
      "Modular CloudFormation and Terraform infrastructure-as-code templates for reproducible AWS VPC network topologies, EC2 servers, and automated backup routines.",
    overview:
      "Curated library of modular, reusable CloudFormation and Terraform infrastructure-as-code templates designed according to the AWS Well-Architected Framework. Provisions multi-availability zone VPCs with public/private subnet isolation, NAT gateways, least-privilege IAM roles, automated EBS snapshot routines, and UserData cloud-init configurations.",
    problem_solved:
      "Eliminates manual cloud configuration drift, unrecorded security group openings, and human errors by codifying infrastructure topologies as version-controlled code.",
    objectives:
      "1. Build reproducible multi-AZ VPC topologies with public/private subnets.\n2. Codify least-privilege IAM roles and strict security group ingress rules.\n3. Automate EBS volume backup snapshot lifecycles.\n4. Write modular UserData cloud-init scripts for Ubuntu server bootstrapping.",
    solution:
      "Developed parameterized CloudFormation (YAML) and Terraform (HCL) modules targeting AWS region ap-south-1. Each template includes validation parameters, output exports for cross-stack referencing, and resource tagging conventions.",
    technologies: [
      "AWS CloudFormation",
      "Terraform",
      "AWS EC2",
      "AWS VPC",
      "AWS S3",
      "AWS IAM",
      "Python",
    ],
    key_features: [
      "Multi-Availability Zone VPC templates with public and private subnets",
      "Least-privilege IAM policies and security group port declarations",
      "Automated EBS volume snapshot retention policies",
      "UserData cloud-init scripts for automated Ubuntu server configuration",
    ],
    architecture_description:
      "Declarative YAML/HCL templates provisioning AWS VPC, Internet Gateway, Route Tables, NAT, Security Groups, and EC2 instances.",
    architecture_data: {
      title: "AWS Containerized Architecture (EKS, Multi-AZ VPC, ALB & RDS)",
      summary: "Containerized microservices topology with OIDC, ALB ingress, private EKS, Multi-AZ RDS, and Secrets Manager",
      components: [
        {
          id: "gh-actions",
          name: "GitHub Actions & OIDC",
          type: "cicd",
          description: "Builds Docker images and assumes AWS IAM roles via OIDC with zero static keys",
          tech: "GitHub Actions / AWS OIDC",
        },
        {
          id: "ecr",
          name: "Amazon ECR Registry",
          type: "storage",
          description: "Private encrypted container image repository with automated CVE scans",
          tech: "Amazon ECR",
        },
        {
          id: "vpc",
          name: "AWS Multi-AZ VPC (10.0.0.0/16)",
          type: "network",
          description: "3-tier isolated network spanning ap-south-1a and ap-south-1b",
          tech: "AWS VPC / Subnets",
        },
        {
          id: "alb",
          name: "Application Load Balancer",
          type: "network",
          description: "Internet-facing TLS terminator routing HTTPS :443 into private EKS targets",
          tech: "AWS ALB / ACM",
        },
        {
          id: "eks",
          name: "Amazon EKS Workload Pods",
          type: "compute",
          description: "Containerized application pods running in private compute subnets with IRSA",
          tech: "Amazon EKS / Docker",
        },
        {
          id: "rds",
          name: "Amazon RDS Multi-AZ",
          type: "storage",
          description: "Private transactional database with synchronous failover replica across AZs",
          tech: "Amazon RDS (PostgreSQL/MySQL)",
        },
        {
          id: "secrets",
          name: "AWS Secrets Manager",
          type: "security",
          description: "KMS-encrypted database credentials retrieved dynamically via IRSA",
          tech: "AWS Secrets Manager",
        },
        {
          id: "observability",
          name: "Prometheus & CloudWatch",
          type: "observability",
          description: "End-to-end metrics scraping, Grafana dashboards, and CloudWatch alarms",
          tech: "Prometheus / Grafana / CloudWatch",
        },
      ],
      connections: [
        { from: "gh-actions", to: "ecr", label: "Push Docker Image", protocol: "OIDC / Docker Push" },
        { from: "alb", to: "eks", label: "HTTPS Ingress Traffic", protocol: "TLS :443 -> TargetGroup" },
        { from: "eks", to: "secrets", label: "Retrieve DB Secret", protocol: "IRSA / KMS API" },
        { from: "eks", to: "rds", label: "Encrypted DB Queries", protocol: "PostgreSQL :5432 (Private)" },
        { from: "eks", to: "observability", label: "Metrics & Logs", protocol: "Prometheus & CloudWatch" },
      ],
    },
    implementation_details:
      "Designed templates with strict parameter type checking, default values adhering to least-cost principles, and standardized naming conventions for easy multi-account tagging.",
    cicd_details:
      "Includes pre-deployment validation scripts utilizing aws cloudformation validate-template and tflint to catch syntax errors before cloud resource dispatch.",
    security_details:
      "Default configurations disallow 0.0.0.0/0 ingress on administrative ports. Requires explicit VPC CIDR or bastion host security group references for SSH connectivity.",
    challenges:
      "Cost optimization in staging environments was addressed by parameterizing NAT Gateway creation to use single-AZ NAT for development and multi-AZ NAT for production.",
    results:
      "Complete multi-AZ AWS environments can be provisioned or torn down reproducibly in under 8 minutes without manual console interventions.",
    repository_url: `${GITHUB}/aws-infrastructure-templates`,
    live_demo_url: null,
    cover_image_url: null,
    screenshots: [],
    deployment_environment: "AWS CloudFormation & Terraform (ap-south-1)",
    started_at: "2024-02-01",
    updated_at_date: "2026-09-01",
    is_featured: false,
    is_published: true,
    display_order: 6,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
];

/**
 * Fetch all published projects for public display.
 * Reads from Supabase if table exists and returns data;
 * falls back to INITIAL_PORTFOLIO_PROJECTS if table is empty or unmigrated.
 */
export async function fetchPublishedProjects(): Promise<PortfolioProject[]> {
  try {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_PORTFOLIO_PROJECTS.filter((p) => p.is_published).sort(
        (a, b) => a.display_order - b.display_order,
      );
    }

    return (data as unknown[]).map(formatDbProject);
  } catch {
    return INITIAL_PORTFOLIO_PROJECTS.filter((p) => p.is_published).sort(
      (a, b) => a.display_order - b.display_order,
    );
  }
}

/**
 * Fetch a single project by slug.
 */
export async function fetchProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  try {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (error || !data) {
      const fallback = INITIAL_PORTFOLIO_PROJECTS.find(
        (p) => p.slug.toLowerCase() === normalizedSlug,
      );
      return fallback || null;
    }

    return formatDbProject(data);
  } catch {
    const fallback = INITIAL_PORTFOLIO_PROJECTS.find(
      (p) => p.slug.toLowerCase() === normalizedSlug,
    );
    return fallback || null;
  }
}

/**
 * Fetch all projects for the admin dashboard (including drafts).
 */
export async function fetchAllProjectsAdmin(): Promise<PortfolioProject[]> {
  try {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_PORTFOLIO_PROJECTS.slice().sort((a, b) => a.display_order - b.display_order);
    }

    return (data as unknown[]).map(formatDbProject);
  } catch {
    return INITIAL_PORTFOLIO_PROJECTS.slice().sort((a, b) => a.display_order - b.display_order);
  }
}

/**
 * Create a new portfolio project (Admin only).
 */
export async function createProject(input: PortfolioProjectInput): Promise<PortfolioProject> {
  const insertPayload: DbProjectInsert = {
    title: input.title.trim(),
    slug: input.slug.toLowerCase().trim(),
    category: input.category,
    status: input.status,
    short_description: input.short_description.trim(),
    overview: input.overview.trim(),
    problem_solved: input.problem_solved?.trim() || null,
    objectives: input.objectives?.trim() || null,
    solution: input.solution?.trim() || null,
    technologies: (input.technologies as unknown as Json) || [],
    key_features: (input.key_features as unknown as Json) || [],
    architecture_description: input.architecture_description?.trim() || null,
    architecture_data: (input.architecture_data as unknown as Json) || null,
    implementation_details: input.implementation_details?.trim() || null,
    cicd_details: input.cicd_details?.trim() || null,
    security_details: input.security_details?.trim() || null,
    challenges: input.challenges?.trim() || null,
    results: input.results?.trim() || null,
    repository_url: input.repository_url?.trim() || null,
    live_demo_url: input.live_demo_url?.trim() || null,
    cover_image_url: input.cover_image_url?.trim() || null,
    screenshots: (input.screenshots as unknown as Json) || [],
    deployment_environment: input.deployment_environment?.trim() || null,
    started_at: input.started_at || null,
    updated_at_date: input.updated_at_date || null,
    is_featured: input.is_featured ?? false,
    is_published: input.is_published ?? true,
    display_order: input.display_order ?? 0,
  };

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create project");
  }

  return formatDbProject(data);
}

/**
 * Update an existing portfolio project (Admin only).
 */
export async function updateProject(
  id: string,
  updates: Partial<PortfolioProjectInput>,
): Promise<PortfolioProject> {
  const updatePayload: DbProjectUpdate = {};

  if (updates.title !== undefined) updatePayload.title = updates.title.trim();
  if (updates.slug !== undefined) updatePayload.slug = updates.slug.toLowerCase().trim();
  if (updates.category !== undefined) updatePayload.category = updates.category;
  if (updates.status !== undefined) updatePayload.status = updates.status;
  if (updates.short_description !== undefined)
    updatePayload.short_description = updates.short_description.trim();
  if (updates.overview !== undefined) updatePayload.overview = updates.overview.trim();
  if (updates.problem_solved !== undefined)
    updatePayload.problem_solved = updates.problem_solved?.trim() || null;
  if (updates.objectives !== undefined)
    updatePayload.objectives = updates.objectives?.trim() || null;
  if (updates.solution !== undefined) updatePayload.solution = updates.solution?.trim() || null;
  if (updates.technologies !== undefined)
    updatePayload.technologies = (updates.technologies as unknown as Json) || [];
  if (updates.key_features !== undefined)
    updatePayload.key_features = (updates.key_features as unknown as Json) || [];
  if (updates.architecture_description !== undefined)
    updatePayload.architecture_description = updates.architecture_description?.trim() || null;
  if (updates.architecture_data !== undefined)
    updatePayload.architecture_data = (updates.architecture_data as unknown as Json) || null;
  if (updates.implementation_details !== undefined)
    updatePayload.implementation_details = updates.implementation_details?.trim() || null;
  if (updates.cicd_details !== undefined)
    updatePayload.cicd_details = updates.cicd_details?.trim() || null;
  if (updates.security_details !== undefined)
    updatePayload.security_details = updates.security_details?.trim() || null;
  if (updates.challenges !== undefined)
    updatePayload.challenges = updates.challenges?.trim() || null;
  if (updates.results !== undefined) updatePayload.results = updates.results?.trim() || null;
  if (updates.repository_url !== undefined)
    updatePayload.repository_url = updates.repository_url?.trim() || null;
  if (updates.live_demo_url !== undefined)
    updatePayload.live_demo_url = updates.live_demo_url?.trim() || null;
  if (updates.cover_image_url !== undefined)
    updatePayload.cover_image_url = updates.cover_image_url?.trim() || null;
  if (updates.screenshots !== undefined)
    updatePayload.screenshots = (updates.screenshots as unknown as Json) || [];
  if (updates.deployment_environment !== undefined)
    updatePayload.deployment_environment = updates.deployment_environment?.trim() || null;
  if (updates.started_at !== undefined) updatePayload.started_at = updates.started_at || null;
  if (updates.updated_at_date !== undefined)
    updatePayload.updated_at_date = updates.updated_at_date || null;
  if (updates.is_featured !== undefined) updatePayload.is_featured = updates.is_featured;
  if (updates.is_published !== undefined) updatePayload.is_published = updates.is_published;
  if (updates.display_order !== undefined) updatePayload.display_order = updates.display_order;

  const { data, error } = await supabase
    .from("portfolio_projects")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update project");
  }

  return formatDbProject(data);
}

/**
 * Delete a project (Admin only).
 */
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to delete project");
  }
}

/**
 * Toggle published state of a project (Admin only).
 */
export async function toggleProjectPublish(id: string, is_published: boolean): Promise<void> {
  const { error } = await supabase.from("portfolio_projects").update({ is_published }).eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to toggle published state");
  }
}

/**
 * Update project display ordering (Admin only).
 */
export async function updateProjectsOrder(
  orderedItems: { id: string; display_order: number }[],
): Promise<void> {
  const updates = orderedItems.map((item) =>
    supabase
      .from("portfolio_projects")
      .update({ display_order: item.display_order })
      .eq("id", item.id),
  );

  await Promise.all(updates);
}

/**
 * Upload project media (cover image or screenshot) to Supabase Storage.
 */
export async function uploadProjectMedia(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds 10MB limit.");
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PNG, JPEG, WebP, and SVG images are allowed.");
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage.from("project-media").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "Failed to upload image.");
  }

  const { data: publicUrlData } = supabase.storage.from("project-media").getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Internal row parser
function formatDbProject(row: unknown): PortfolioProject {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    title: String(r.title || ""),
    slug: String(r.slug || ""),
    category: String(r.category || ""),
    status: (r.status as ProjectStatus) || "Personal Project",
    short_description: String(r.short_description || ""),
    overview: String(r.overview || ""),
    problem_solved: r.problem_solved ? String(r.problem_solved) : null,
    objectives: r.objectives ? String(r.objectives) : null,
    solution: r.solution ? String(r.solution) : null,
    technologies: Array.isArray(r.technologies) ? (r.technologies as string[]) : [],
    key_features: Array.isArray(r.key_features) ? (r.key_features as string[]) : [],
    architecture_description: r.architecture_description
      ? String(r.architecture_description)
      : null,
    architecture_data: (r.architecture_data as ArchitectureData) || null,
    implementation_details: r.implementation_details ? String(r.implementation_details) : null,
    cicd_details: r.cicd_details ? String(r.cicd_details) : null,
    security_details: r.security_details ? String(r.security_details) : null,
    challenges: r.challenges ? String(r.challenges) : null,
    results: r.results ? String(r.results) : null,
    repository_url: r.repository_url ? String(r.repository_url) : null,
    live_demo_url: r.live_demo_url ? String(r.live_demo_url) : null,
    cover_image_url: r.cover_image_url ? String(r.cover_image_url) : null,
    screenshots: Array.isArray(r.screenshots) ? (r.screenshots as string[]) : [],
    deployment_environment: r.deployment_environment ? String(r.deployment_environment) : null,
    started_at: r.started_at ? String(r.started_at) : null,
    updated_at_date: r.updated_at_date ? String(r.updated_at_date) : null,
    is_featured: Boolean(r.is_featured),
    is_published: Boolean(r.is_published),
    display_order: Number(r.display_order ?? 0),
    created_at: String(r.created_at || new Date().toISOString()),
    updated_at: String(r.updated_at || new Date().toISOString()),
  };
}
