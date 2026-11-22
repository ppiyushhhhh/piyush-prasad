import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { PROJECT_ARCHITECTURES } from "./project-architectures";

export type ArchitectureCategory =
  | "client"
  | "dns"
  | "cdn"
  | "networking"
  | "compute"
  | "application"
  | "database"
  | "storage"
  | "security"
  | "monitoring"
  | "cicd"
  | "ai";

export type ArchitectureViewMode =
  | "topology"
  | "request_flow"
  | "dns_network"
  | "security"
  | "deployment"
  | "data_flow"
  | "network"
  | "infrastructure";

export interface ArchitectureSection {
  id: string;
  title: string;
  description: string;
  nodeIds?: string[];
  isDocker?: boolean;
}

export interface ArchitectureNode {
  id: string;
  name: string;
  category: ArchitectureCategory;
  tech: string;
  provider: string;
  description: string;
  responsibilities: string[];
  configuration: string[];
  region?: string;
  security_controls: string[];
  documentation_url?: string;
  project_association?: string;
  x: number;
  y: number;
  status?: "operational" | "active" | "verified" | "secured";
  port?: string;
  sectionId?: string;
  layer?:
    | "client"
    | "edge"
    | "compute"
    | "persistence"
    | "security"
    | "observability"
    | "cicd"
    | "networking";
  verification?: "code" | "documented";
  evidence?: string[];
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  protocol: string;
  direction: "directional" | "bidirectional";
  description: string;
  category: "network" | "data" | "security" | "deployment" | "telemetry";
  animated?: boolean;
  secondary?: boolean;
  step?: number;
}

export interface ArchitectureDiagramData {
  version: number;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  journey?: string[];
  sections?: ArchitectureSection[];
}

export interface ArchitectureDiagram {
  id: string;
  project_id?: string | null;
  title: string;
  slug: string;
  description: string;
  architecture_type: string;
  diagram_data: ArchitectureDiagramData;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ArchitectureDiagramInput {
  project_id?: string | null;
  title: string;
  slug: string;
  description: string;
  architecture_type?: string;
  diagram_data: ArchitectureDiagramData;
  is_published?: boolean;
  display_order?: number;
}

export const CATEGORY_COLORS: Record<
  ArchitectureCategory,
  { bg: string; text: string; border: string; badge: string; dot: string }
> = {
  client: {
    bg: "bg-slate-50 dark:bg-slate-900/50",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  },
  dns: {
    bg: "bg-accent-soft dark:bg-accent-soft",
    text: "text-accent dark:text-accent",
    border: "border-accent/40 dark:border-accent/40",
    badge: "bg-accent-soft text-accent border-accent/30",
    dot: "bg-accent",
  },
  cdn: {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-300 dark:border-cyan-800",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    dot: "bg-cyan-600",
  },
  networking: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-300 dark:border-sky-800",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    dot: "bg-sky-600",
  },
  compute: {
    bg: "bg-accent-soft dark:bg-accent-soft",
    text: "text-accent dark:text-accent",
    border: "border-accent/40 dark:border-accent/40",
    badge: "bg-accent-soft text-accent border-accent/30",
    dot: "bg-accent",
  },
  application: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-300 dark:border-violet-800",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    dot: "bg-violet-600",
  },
  database: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
  },
  storage: {
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-300 dark:border-teal-800",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
    dot: "bg-teal-600",
  },
  security: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-600",
  },
  monitoring: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-600",
  },
  cicd: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-800",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    dot: "bg-rose-600",
  },
  ai: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    border: "border-fuchsia-300 dark:border-fuchsia-800",
    badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    dot: "bg-fuchsia-600",
  },
};

/**
 * Verified Initial Architecture Topologies
 * Sourced directly from Piyush Prasad's GitHub repositories,
 * verified CloudArchitectureMatrix data, and production deployments.
 */
export const INITIAL_ARCHITECTURES: ArchitectureDiagram[] = [
  ...PROJECT_ARCHITECTURES,

  // ---------------------------------------------------------------------------
  // ARCHITECTURE B: AWS CI/CD DEPLOYMENT (KAMLESH-PRASAD)
  // ---------------------------------------------------------------------------
  {
    id: "arch-aws-cicd-kamlesh",
    project_id: null,
    title: "AWS EC2 Automated CI/CD & Nginx Architecture",
    slug: "kamlesh-prasad-cicd",
    description:
      "Production cloud infrastructure and zero-downtime deployment pipeline for kamleshprasad.in. Features automated GitHub Actions runners, AWS EC2 Ubuntu host with Nginx, Vercel serverless AI chat functions, Gemini API integration, and Cloudflare DNS/CDN.",
    architecture_type: "AWS & CI/CD Pipeline",
    display_order: 6,
    is_published: true,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2026-11-21T00:00:00Z",
    diagram_data: {
      version: 1,
      viewport: { x: 0, y: 0, zoom: 0.95 },
      journey: [
        "node-kamlesh-visitor",
        "node-kamlesh-cloudflare",
        "node-kamlesh-nginx",
        "node-kamlesh-vite",
        "node-kamlesh-vercel",
        "node-kamlesh-gemini",
      ],
      sections: [
        {
          id: "sec-kamlesh-ingress",
          title: "01. Ingress & Edge Proxy",
          description: "Handles visitor DNS resolution and Cloudflare Anycast edge caching.",
          nodeIds: ["node-kamlesh-visitor", "node-kamlesh-cloudflare"],
        },
        {
          id: "sec-kamlesh-compute",
          title: "02. Web Server & Compute",
          description: "Terminates HTTPS, serves static Vite SPA assets, and hosts EC2 runtime.",
          nodeIds: ["node-kamlesh-nginx", "node-kamlesh-vite"],
        },
        {
          id: "sec-kamlesh-ai",
          title: "03. Serverless AI Assistant",
          description: "Vercel edge function gateway querying Google Gemini API with fallback answers.",
          nodeIds: ["node-kamlesh-vercel", "node-kamlesh-gemini"],
        },
        {
          id: "sec-kamlesh-ops",
          title: "04. CI/CD & Operations",
          description: "Automated continuous delivery runner and daily server health alerts.",
          nodeIds: ["node-kamlesh-actions", "node-kamlesh-automation"],
        },
      ],
      nodes: [
        {
          id: "node-kamlesh-visitor",
          name: "Client Public Visitor",
          category: "client",
          tech: "Web Browser / HTTPS",
          provider: "Public Internet",
          description: "End user accessing kamleshprasad.in over encrypted HTTPS connection.",
          responsibilities: [
            "Initiates DNS lookup and HTTPS requests for kamleshprasad.in",
            "Receives cached static bundle from Cloudflare Anycast edge",
            "Invokes /api/chat endpoint for interactive portfolio AI inquiries",
          ],
          configuration: ["TLS 1.3 / HTTP/2 connection", "Encrypted payload transit"],
          region: "Worldwide",
          security_controls: ["Encrypted payload transit", "Browser CORS enforcement"],
          x: 40,
          y: 180,
          status: "active",
          layer: "client",
          sectionId: "sec-kamlesh-ingress",
          verification: "code",
          evidence: ["package.json", "src/App.tsx"],
        },
        {
          id: "node-kamlesh-cloudflare",
          name: "Cloudflare DNS & CDN",
          category: "dns",
          tech: "Cloudflare Anycast DNS & Edge",
          provider: "Cloudflare",
          description: "Authoritative Anycast DNS resolution, DDoS shielding, and global static asset caching.",
          responsibilities: [
            "Resolves kamleshprasad.in via global Anycast DNS nameservers",
            "Caches static JavaScript, images, and fonts at edge POPs",
            "Terminates edge TLS 1.3 and protects origin IP from direct scanning",
          ],
          configuration: [
            "Zone: kamleshprasad.in",
            "Full (Strict) SSL encryption mode",
            "Automatic DDoS mitigation at Anycast layer",
          ],
          region: "Global Anycast Edge",
          security_controls: ["Cloudflare WAF managed ruleset", "Origin server IP cloaked"],
          x: 280,
          y: 180,
          status: "verified",
          port: "53, 443",
          layer: "edge",
          sectionId: "sec-kamlesh-ingress",
          verification: "code",
          evidence: ["automation/alert-monitor.cjs"],
        },
        {
          id: "node-kamlesh-nginx",
          name: "Nginx Web Server & EC2",
          category: "networking",
          tech: "Nginx 1.24 / AWS EC2",
          provider: "AWS ap-south-1 (Mumbai)",
          description: "AWS EC2 Ubuntu host running Nginx web server serving production assets.",
          responsibilities: [
            "Terminates Let's Encrypt TLS certificates with automated Certbot renewals",
            "Serves compiled static production bundle from /var/www/html",
            "Applies Gzip compression and strict HTTP security headers",
          ],
          configuration: [
            "AWS EC2 Ubuntu 24.04 LTS instance",
            "Nginx static site root: /var/www/html",
            "Automated Certbot 90-day SSL renewal daemon",
          ],
          region: "AWS ap-south-1 (Mumbai)",
          security_controls: [
            "AWS Security Group: ingress 80/443/22 only",
            "Certbot TLS 1.3 automated certificate renewal",
          ],
          x: 520,
          y: 180,
          status: "verified",
          port: "80, 443",
          layer: "compute",
          sectionId: "sec-kamlesh-compute",
          verification: "code",
          evidence: [".github/workflows/deploy.yml", "automation/alert-monitor.cjs"],
        },
        {
          id: "node-kamlesh-vite",
          name: "Vite Single Page Application",
          category: "application",
          tech: "React 18 / Vite SPA",
          provider: "AWS EC2 Host",
          description: "High-performance client application built with React 18, Vite, and Tailwind CSS.",
          responsibilities: [
            "Renders interactive portfolio interface and responsive components",
            "Manages client-side navigation with React Router and TanStack Query",
            "Provides offline fallback answer bank when API is unreachable",
          ],
          configuration: ["Vite build target ES2022", "Tailwind CSS compilation", "Recharts visual analytics"],
          region: "AWS EC2 Static Storage",
          security_controls: ["Zero runtime secret leaks in client bundle", "Content Security Policy compliance"],
          x: 760,
          y: 180,
          status: "active",
          layer: "compute",
          sectionId: "sec-kamlesh-compute",
          verification: "code",
          evidence: ["package.json", "vite.config.ts", "src/App.tsx"],
        },
        {
          id: "node-kamlesh-vercel",
          name: "Vercel Edge Functions",
          category: "compute",
          tech: "Vercel Serverless / Edge",
          provider: "Vercel Edge Network",
          description: "Edge serverless function hosting /api/chat endpoint for portfolio AI chatbot.",
          responsibilities: [
            "Receives visitor chat prompts over HTTPS",
            "Formats system prompt with career context and rate-limits requests",
            "Invokes Google Gemini API with fallback model switching",
          ],
          configuration: ["Runtime: Edge / Node.js 20.x", "Route: /api/chat.ts", "vercel.json route rewrites"],
          region: "Vercel Global Edge",
          security_controls: ["Environment secret injection (GEMINI_API_KEY)", "Serverless ephemeral execution"],
          x: 280,
          y: 380,
          status: "operational",
          layer: "compute",
          sectionId: "sec-kamlesh-ai",
          verification: "code",
          evidence: ["vercel.json", "api/chat.ts"],
        },
        {
          id: "node-kamlesh-gemini",
          name: "Google Gemini AI Engine",
          category: "ai",
          tech: "Gemini 1.5 Flash API",
          provider: "Google AI Studio",
          description: "Large language model generating intelligent conversational responses about portfolio background.",
          responsibilities: [
            "Analyzes user inquiry with context-aware prompt template",
            "Streams conversational answer back to Vercel edge runtime",
            "Supports automated model failover on rate exhaustion",
          ],
          configuration: ["Model: gemini-1.5-flash", "Max output tokens: 1024", "Temperature: 0.7"],
          region: "Google Global Cloud",
          security_controls: ["Encrypted API key authentication", "Strict content moderation safety thresholds"],
          x: 520,
          y: 380,
          status: "verified",
          layer: "persistence",
          sectionId: "sec-kamlesh-ai",
          verification: "code",
          evidence: ["api/chat.ts", "src/components/ChatWidget.tsx"],
        },
        {
          id: "node-kamlesh-actions",
          name: "GitHub Actions CI/CD",
          category: "cicd",
          tech: "GitHub Actions Workflow",
          provider: "GitHub Enterprise Cloud",
          description: "Continuous deployment runner compiling Vite bundle and securely syncing to EC2 via SSH.",
          responsibilities: [
            "Checks out code and runs frozen lockfile dependency install",
            "Compiles optimized production build via Vite",
            "SCPs build output to EC2 and reloads Nginx via appleboy/ssh-action",
          ],
          configuration: [
            "Workflow: .github/workflows/deploy.yml",
            "Secrets: EC2_HOST, EC2_USERNAME, EC2_SSH_KEY",
            "Automated trigger on push to main branch",
          ],
          region: "GitHub Cloud Runner",
          security_controls: ["Masked SSH deployment credentials", "Ephemeral runner isolation"],
          x: 760,
          y: 380,
          status: "operational",
          layer: "cicd",
          sectionId: "sec-kamlesh-ops",
          verification: "code",
          evidence: [".github/workflows/deploy.yml"],
        },
        {
          id: "node-kamlesh-automation",
          name: "Health & Alert Automation",
          category: "monitoring",
          tech: "Nodemailer & PDFKit",
          provider: "EC2 Cron & Gmail SMTP",
          description: "Host automation daemon monitoring server health, SSL certificate validity, and mailing PDF reports.",
          responsibilities: [
            "Performs local HTTP health probes and certbot certificate expiry checks",
            "Creates server filesystem backup archives",
            "Generates formatted daily PDF report and dispatches via Nodemailer Gmail SMTP",
          ],
          configuration: [
            "Scripts: automation/alert-monitor.cjs, daily-report.cjs",
            "Nodemailer transport over secure Gmail SMTP (Port 465)",
            "Systemd / crontab scheduled execution",
          ],
          region: "AWS EC2 Host",
          security_controls: ["App password encryption for SMTP", "Local execution only"],
          x: 1000,
          y: 180,
          status: "verified",
          layer: "observability",
          sectionId: "sec-kamlesh-ops",
          verification: "code",
          evidence: ["automation/alert-monitor.cjs", "automation/daily-report.cjs", "automation/backup-server.cjs"],
        },
      ],
      edges: [
        {
          id: "e-kamlesh-visitor-cf",
          source: "node-kamlesh-visitor",
          target: "node-kamlesh-cloudflare",
          label: "HTTPS Web Ingress",
          protocol: "HTTPS / TLS 1.3",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Visitor initiates encrypted connection routed through Cloudflare Anycast edge.",
          step: 1,
        },
        {
          id: "e-kamlesh-cf-nginx",
          source: "node-kamlesh-cloudflare",
          target: "node-kamlesh-nginx",
          label: "Origin Request Route",
          protocol: "HTTPS / Port 443",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Cloudflare edge forwards uncached traffic to AWS EC2 origin Nginx server.",
          step: 2,
        },
        {
          id: "e-kamlesh-nginx-vite",
          source: "node-kamlesh-nginx",
          target: "node-kamlesh-vite",
          label: "Serve Static Assets",
          protocol: "Localhost / Disk VFS",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Nginx serves compiled React 18 / Vite production assets with gzip compression.",
          step: 3,
        },
        {
          id: "e-kamlesh-visitor-vercel",
          source: "node-kamlesh-visitor",
          target: "node-kamlesh-vercel",
          label: "AI Chat Endpoint",
          protocol: "HTTPS / POST /api/chat",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Visitor submits chat queries directly to Vercel edge serverless route.",
          step: 4,
        },
        {
          id: "e-kamlesh-vercel-gemini",
          source: "node-kamlesh-vercel",
          target: "node-kamlesh-gemini",
          label: "Gemini Model Prompt",
          protocol: "REST API / TLS 1.3",
          direction: "directional",
          category: "data",
          animated: true,
          description: "Vercel edge function queries Gemini 1.5 Flash API for streaming chat answers.",
          step: 5,
        },
        {
          id: "e-kamlesh-actions-nginx",
          source: "node-kamlesh-actions",
          target: "node-kamlesh-nginx",
          label: "SCP Dist & SSH Reload",
          protocol: "SSH Ed25519 / Port 22",
          direction: "directional",
          category: "deployment",
          animated: true,
          description: "GitHub Actions workflow deploys Vite build artifacts and restarts Nginx service.",
          step: 6,
        },
        {
          id: "e-kamlesh-auto-nginx",
          source: "node-kamlesh-automation",
          target: "node-kamlesh-nginx",
          label: "Health Check & Alert",
          protocol: "HTTP Localhost / SMTP",
          direction: "directional",
          category: "telemetry",
          animated: false,
          secondary: true,
          description: "Automation cron script monitors Nginx health and sends PDF email reports.",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // ARCHITECTURE C: DEVSECOPS & MONITORING (ONIXMALL)
  // ---------------------------------------------------------------------------
  {
    id: "arch-devsecops-onixmall",
    project_id: null,
    title: "DevSecOps Infrastructure & Observability Stack",
    slug: "onixmall-devsecops",
    description:
      "Production-hardened AWS EC2 infrastructure stack with Docker Compose multi-container services, Express REST backend, MongoDB database, Ansible configuration automation, Trivy vulnerability auditing, and GitHub Actions CI/CD.",
    architecture_type: "DevSecOps & Multi-Container Infrastructure",
    display_order: 7,
    is_published: true,
    created_at: "2024-04-10T00:00:00Z",
    updated_at: "2026-11-22T00:00:00Z",
    diagram_data: {
      version: 1,
      viewport: { x: 0, y: 0, zoom: 0.95 },
      journey: [
        "node-onix-client",
        "node-onix-nginx",
        "node-onix-vite",
        "node-onix-express",
        "node-onix-mongo",
      ],
      sections: [
        {
          id: "sec-onix-runtime",
          title: "Runtime",
          description: "End-to-end client traffic flow through Nginx and containerized application stack.",
          nodeIds: [
            "node-onix-client",
            "node-onix-nginx",
            "node-onix-vite",
            "node-onix-express",
            "node-onix-mongo",
          ],
        },
        {
          id: "sec-onix-docker",
          title: "Docker Compose",
          description: "Multi-container application runtime managing Frontend, Backend, and Database.",
          isDocker: true,
          nodeIds: ["node-onix-vite", "node-onix-express", "node-onix-mongo"],
        },
        {
          id: "sec-onix-delivery",
          title: "Delivery & Security",
          description: "Automated delivery pipeline, vulnerability scanning, and host configuration management.",
          nodeIds: [
            "node-onix-email",
            "node-onix-trivy",
            "node-onix-actions",
            "node-onix-ansible",
          ],
        },
      ],
      nodes: [
        {
          id: "node-onix-client",
          name: "Client Public Visitor",
          category: "client",
          tech: "Web Browser / HTTPS",
          provider: "Public Internet",
          description: "Mall visitors and store tenants accessing the OnixMall web platform over HTTPS.",
          responsibilities: [
            "Initiates secure HTTPS requests for mall directory and tenant portal",
            "Interacts with dynamic store directory and search interfaces",
          ],
          configuration: ["TLS 1.3 / HTTP/2 connection"],
          region: "Public Internet",
          security_controls: ["Encrypted payload transit", "Browser XSS mitigation"],
          x: 70,
          y: 86,
          status: "active",
          layer: "client",
          sectionId: "sec-onix-runtime",
          verification: "code",
          evidence: ["frontend/package.json", "frontend/src/App.tsx"],
        },
        {
          id: "node-onix-nginx",
          name: "Nginx Hardened Web Server",
          category: "networking",
          tech: "Nginx 1.24 / Certbot SSL",
          provider: "AWS EC2 ap-south-1a",
          description: "Hardened reverse proxy handling SSL termination and proxying traffic to Docker containers.",
          responsibilities: [
            "Terminates HTTPS on Port 443 with automated Let's Encrypt certificates",
            "Applies security headers and rate limits on public endpoints",
            "Proxies web requests to frontend container and API requests to backend",
          ],
          configuration: [
            "proxy_pass http://127.0.0.1:80",
            "proxy_set_header X-Real-IP, Host",
            "SSL cipher hardening with modern TLS suites",
          ],
          region: "AWS EC2 Host (ap-south-1a)",
          security_controls: ["Certbot automated SSL renewal", "Strict security headers"],
          x: 318,
          y: 86,
          status: "verified",
          port: "80, 443",
          layer: "compute",
          sectionId: "sec-onix-runtime",
          verification: "code",
          evidence: [".github/workflows/deploy.yml", "docker-compose.yml"],
        },
        {
          id: "node-onix-vite",
          name: "Frontend Web Application",
          category: "application",
          tech: "React 18 / Vite SPA",
          provider: "Docker Container (Frontend)",
          description: "Single-page tenant directory and mall navigation application built with React and Vite.",
          responsibilities: [
            "Renders responsive mall directory, floor plans, and tenant listings",
            "Executes client-side search and filtering via TanStack Query",
            "Submits tenant data updates to Express backend API",
          ],
          configuration: ["Vite build optimization", "Tailwind CSS styling", "Docker port 80:80"],
          region: "Docker Host Network",
          security_controls: ["Unprivileged container user", "CSP header compliance"],
          x: 566,
          y: 86,
          status: "active",
          layer: "compute",
          sectionId: "sec-onix-docker",
          verification: "code",
          evidence: ["frontend/package.json", "frontend/src/App.tsx"],
        },
        {
          id: "node-onix-express",
          name: "Express REST API Backend",
          category: "compute",
          tech: "Express 4.x / Node.js",
          provider: "Docker Container (Backend)",
          description: "REST API server handling store CRUD operations, tenant management, and rate limiting.",
          responsibilities: [
            "Provides RESTful endpoints for /api/malls and tenant directory",
            "Applies express-rate-limit to protect against brute force and API abuse",
            "Communicates with MongoDB through Mongoose ODM schemas",
          ],
          configuration: ["Express 4.x runtime", "CORS policy restriction", "Mongoose connection pool"],
          region: "Docker Container",
          security_controls: ["Rate limiting middleware", "Strict input validation"],
          x: 814,
          y: 86,
          status: "verified",
          port: "5000",
          layer: "compute",
          sectionId: "sec-onix-docker",
          verification: "code",
          evidence: ["backend/server.js", "backend/routes/mallRoutes.js"],
        },
        {
          id: "node-onix-mongo",
          name: "MongoDB Document Store",
          category: "database",
          tech: "MongoDB 7.0 Community",
          provider: "Docker Container (Database)",
          description: "Transactional document datastore persisting mall profiles, floor layouts, and tenant records.",
          responsibilities: [
            "Stores document schemas for malls, floors, stores, and categories",
            "Persists data to AWS EBS backed Docker volume",
            "Executes indexed queries for sub-10ms directory lookups",
          ],
          configuration: ["MongoDB 7.0 engine", "Port 27017 (internal network only)", "WiredTiger storage engine"],
          region: "Docker Volume (EBS gp3)",
          security_controls: ["No public port exposure (internal bridge only)", "Volume encryption at rest"],
          x: 1062,
          y: 86,
          status: "secured",
          port: "27017",
          layer: "persistence",
          sectionId: "sec-onix-docker",
          verification: "code",
          evidence: ["docker-compose.yml", "backend/config/db.js"],
        },
        {
          id: "node-onix-email",
          name: "DevOps Alert & PDF Reporter",
          category: "monitoring",
          tech: "Nodemailer / Gmail SMTP",
          provider: "Automated Host Cron",
          description: "Automated reporting utility compiling daily health metrics and dispatching PDF reports over SMTP.",
          responsibilities: [
            "Compiles frontend, backend, and database uptime and health",
            "Renders formatted daily PDF operational report",
            "Dispatches email alert via Nodemailer over secure Gmail SMTP",
          ],
          configuration: [
            "Script: scripts/daily-report.sh, scripts/trivy-cron.sh",
            "Transport: Gmail SMTP Port 465 TLS",
          ],
          region: "AWS EC2 Host",
          security_controls: ["App password encryption for SMTP", "Local execution only"],
          x: 70,
          y: 314,
          status: "verified",
          layer: "observability",
          sectionId: "sec-onix-delivery",
          verification: "code",
          evidence: ["scripts/daily-report.sh", "scripts/trivy-cron.sh"],
        },
        {
          id: "node-onix-trivy",
          name: "Trivy Security Scanner",
          category: "security",
          tech: "Trivy Vulnerability Gate",
          provider: "Security Gate",
          description: "Vulnerability scanning daemon auditing container images and gating CI.",
          responsibilities: [
            "Scans Docker container images and filesystem for High and Critical CVEs",
            "Enforces exit-code 1 vulnerability gate in CI pipeline",
            "Feeds vulnerability alerts to automated reporting daemon",
          ],
          configuration: [
            "Script: scripts/trivy-cron.sh, scripts/daily-report.sh",
            "Exit on Critical CVE severity in CI gates",
          ],
          region: "AWS EC2 Host",
          security_controls: ["Read-only vulnerability inspection", "Daily automated email delivery"],
          x: 318,
          y: 314,
          status: "secured",
          layer: "security",
          sectionId: "sec-onix-delivery",
          verification: "code",
          evidence: ["scripts/trivy-cron.sh", "scripts/daily-report.sh"],
        },
        {
          id: "node-onix-actions",
          name: "GitHub Actions CI/CD",
          category: "cicd",
          tech: "GitHub Actions Runner",
          provider: "GitHub Cloud",
          description: "Automated delivery pipeline building container images and deploying to EC2 host.",
          responsibilities: [
            "Runs unit tests and linting on pull requests",
            "Executes docker-deploy.yml to build and pull latest containers on EC2",
            "Performs zero-downtime rolling restart of container services",
          ],
          configuration: [
            "Workflows: docker-deploy.yml, test.yml, deploy.yml",
            "SSH key based host authentication",
          ],
          region: "GitHub Cloud Runner",
          security_controls: ["Masked deployment secrets", "Ephemeral execution"],
          x: 566,
          y: 314,
          status: "operational",
          layer: "cicd",
          sectionId: "sec-onix-delivery",
          verification: "code",
          evidence: [".github/workflows/docker-deploy.yml", ".github/workflows/test.yml"],
        },
        {
          id: "node-onix-ansible",
          name: "Ansible Control Host",
          category: "cicd",
          tech: "Ansible Playbooks",
          provider: "AWS EC2 ap-south-1c",
          description: "Configuration management node executing playbooks for automated host provisioning.",
          responsibilities: [
            "Executes idempotent playbooks for server hardening and package updates",
            "Automates Docker installation, firewall rules, and container environment setup",
            "Coordinates multi-instance configuration synchronization",
          ],
          configuration: [
            "Workflow: .github/workflows/ansible-deploy.yml",
            "Playbooks: playbooks/deploy.yml",
            "Inventory: hosts.ini (AWS EC2 instances)",
          ],
          region: "AWS EC2 (ap-south-1c)",
          security_controls: ["SSH key authentication", "Ansible Vault encrypted variables"],
          x: 814,
          y: 314,
          status: "verified",
          layer: "cicd",
          sectionId: "sec-onix-delivery",
          verification: "code",
          evidence: [".github/workflows/ansible-deploy.yml", "scripts/daily-report.sh"],
        },
      ],
      edges: [
        {
          id: "e-onix-client-nginx",
          source: "node-onix-client",
          target: "node-onix-nginx",
          label: "HTTPS Web Ingress",
          protocol: "HTTPS / TLS 1.3",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Client traffic terminates on hardened Nginx reverse proxy.",
          step: 1,
        },
        {
          id: "e-onix-nginx-vite",
          source: "node-onix-nginx",
          target: "node-onix-vite",
          label: "Frontend Proxy Pass",
          protocol: "HTTP / Port 80",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Nginx routes static web requests to React Vite frontend container.",
          step: 2,
        },
        {
          id: "e-onix-vite-express",
          source: "node-onix-vite",
          target: "node-onix-express",
          label: "REST API Requests",
          protocol: "HTTP /api/malls",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Frontend SPA dispatches mall queries and tenant actions to Express API.",
          step: 3,
        },
        {
          id: "e-onix-express-mongo",
          source: "node-onix-express",
          target: "node-onix-mongo",
          label: "Database CRUD Operations",
          protocol: "Mongoose ODM / Port 27017",
          direction: "bidirectional",
          category: "data",
          animated: true,
          description: "Express backend executes Mongoose document queries and persistence.",
          step: 4,
        },
        {
          id: "e-onix-actions-trivy",
          source: "node-onix-actions",
          target: "node-onix-trivy",
          label: "CI Vulnerability Gate",
          protocol: "Trivy Action / Exit 1",
          direction: "directional",
          category: "security",
          animated: true,
          description: "GitHub Actions pipeline gates build on High/Critical CVE security scan.",
          secondary: true,
          step: 5,
        },
        {
          id: "e-onix-actions-compose",
          source: "node-onix-actions",
          target: "sec-onix-docker",
          label: "SSH Compose Deploy",
          protocol: "docker-compose up -d --build",
          direction: "directional",
          category: "deployment",
          animated: true,
          description: "GitHub Actions deploys latest containers via docker-compose up -d --build.",
          secondary: true,
          step: 6,
        },
        {
          id: "e-onix-actions-ansible",
          source: "node-onix-actions",
          target: "node-onix-ansible",
          label: "Trigger Ansible CI",
          protocol: "ansible-deploy.yml",
          direction: "directional",
          category: "deployment",
          animated: true,
          description: "GitHub Actions pipeline triggers Ansible configuration management.",
          secondary: true,
          step: 7,
        },
        {
          id: "e-onix-ansible-compose",
          source: "node-onix-ansible",
          target: "sec-onix-docker",
          label: "Ansible Playbook Rollout",
          protocol: "ansible-playbook",
          direction: "directional",
          category: "deployment",
          animated: true,
          description: "Ansible control host executes deployment playbooks on EC2 app host.",
          secondary: true,
          step: 8,
        },
        {
          id: "e-onix-trivy-email",
          source: "node-onix-trivy",
          target: "node-onix-email",
          label: "Email Daily PDF Report",
          protocol: "Nodemailer / SMTP 465",
          direction: "directional",
          category: "telemetry",
          animated: false,
          secondary: true,
          description: "Trivy scanner forwards daily audit report to Nodemailer dispatch service.",
          step: 9,
        },
      ],
    },
  },
  // ---------------------------------------------------------------------------
  // ARCHITECTURE D: TELEGRAM AI AGENT (SERVERLESS WORKER & D1)
  // ---------------------------------------------------------------------------
  {
    id: "arch-telegram-ai-agent",
    project_id: null,
    title: "Telegram AI Agent Serverless Architecture",
    slug: "telegram-ai-agent",
    description:
      "High-concurrency serverless Telegram chatbot architecture running on Cloudflare Workers edge. Features webhook secret authentication, Google Gemini primary AI model, Cloudflare Workers AI fallback, and Cloudflare D1 serverless SQLite database.",
    architecture_type: "Serverless Edge & AI Fallback",
    display_order: 8,
    is_published: true,
    created_at: "2024-05-15T00:00:00Z",
    updated_at: "2026-11-21T00:00:00Z",
    diagram_data: {
      version: 1,
      viewport: { x: 0, y: 0, zoom: 0.95 },
      journey: [
        "node-tg-user",
        "node-tg-api",
        "node-cf-worker",
        "node-auth-idempotency",
        "node-gemini-primary",
        "node-d1-db",
      ],
      sections: [
        {
          id: "sec-gateway",
          title: "01. Ingress & Telegram Gateway",
          description: "Receives user chat messages and dispatches authenticated webhook events.",
          nodeIds: ["node-tg-user", "node-tg-api"],
        },
        {
          id: "sec-edge",
          title: "02. Edge Compute & Auth",
          description: "Sub-5ms serverless V8 isolate validating webhook authenticity and preventing duplicate execution.",
          nodeIds: ["node-cf-worker", "node-auth-idempotency"],
        },
        {
          id: "sec-ai",
          title: "03. AI Models & Failover",
          description: "Primary Google Gemini LLM with automated failover to Cloudflare Workers AI edge GPUs.",
          nodeIds: ["node-gemini-primary", "node-cf-ai-fallback"],
        },
        {
          id: "sec-data",
          title: "04. Persistence & State",
          description: "Distributed SQLite database maintaining session history and idempotency audit logs.",
          nodeIds: ["node-d1-db"],
        },
      ],
      nodes: [
        {
          id: "node-tg-user",
          name: "Telegram User",
          category: "client",
          tech: "Telegram App / MTProto",
          provider: "Telegram Client",
          description:
            "User sends message or command to bot from Telegram iOS, Android, or Desktop.",
          responsibilities: [
            "Sends chat queries and commands (/start, /ask, /help)",
            "Receives streamed or completed AI answers",
          ],
          configuration: ["MTProto encrypted transport protocol"],
          region: "Worldwide",
          security_controls: ["Telegram end-to-client MTProto encryption"],
          x: 40,
          y: 180,
          status: "active",
          layer: "client",
          sectionId: "sec-gateway",
          verification: "code",
          evidence: ["src/lib/portfolio-projects.ts", "package.json"],
        },
        {
          id: "node-tg-api",
          name: "Telegram Bot API Cloud",
          category: "application",
          tech: "Telegram Bot API Platform",
          provider: "Telegram Cloud",
          description:
            "Telegram infrastructure receiving user message and dispatching secure HTTP webhook.",
          responsibilities: [
            "Authenticates bot token against Telegram servers",
            "Dispatches POST JSON webhook to registered worker endpoint",
            "Retries webhook dispatch if worker response is non-200",
          ],
          configuration: [
            "Webhook registered over HTTPS with secret_token header",
            "JSON payload containing update_id and message object",
          ],
          region: "Telegram Cloud Infrastructure",
          security_controls: [
            "Webhook secret token authentication header (X-Telegram-Bot-Api-Secret-Token)",
            "IP allowlist validation for Telegram webhook ranges",
          ],
          x: 280,
          y: 180,
          status: "verified",
          port: "443",
          layer: "edge",
          sectionId: "sec-gateway",
          verification: "code",
          evidence: ["src/lib/portfolio-projects.ts"],
        },
        {
          id: "node-cf-worker",
          name: "Cloudflare Worker Edge",
          category: "compute",
          tech: "Cloudflare Workers (V8 Isolate)",
          provider: "Cloudflare Edge Network",
          description:
            "Sub-5ms cold start serverless compute handling webhook events, coordinating AI inference and DB writes.",
          responsibilities: [
            "Terminates incoming webhook with secret token verification",
            "Checks and records update_id for duplicate request prevention",
            "Routes prompt to primary Gemini API; falls back to Workers AI on timeout",
            "Dispatches sendMessage HTTPS payload back to Telegram Bot API",
          ],
          configuration: [
            "wrangler.toml configuration with compatibility_date 2024-04-01",
            "Bindings: D1 database (DB), Workers AI (AI), KV namespace",
            "Memory limit: 128MB, CPU execution time: 50ms",
          ],
          region: "Cloudflare 300+ Global Anycast Cities",
          security_controls: [
            "V8 isolate sandbox isolation (zero process or memory leak)",
            "Environment variables encrypted via wrangler secret put",
          ],
          x: 520,
          y: 180,
          status: "operational",
          layer: "compute",
          sectionId: "sec-edge",
          verification: "code",
          evidence: ["src/lib/portfolio-projects.ts"],
        },
        {
          id: "node-auth-idempotency",
          name: "Auth & Idempotency Layer",
          category: "security",
          tech: "SHA-256 HMAC & In-Memory KV",
          provider: "Cloudflare Edge",
          description:
            "Security and deduplication filter rejecting spoofed webhooks and duplicate message replays.",
          responsibilities: [
            "Validates X-Telegram-Bot-Api-Secret-Token header in constant time",
            "Maintains 5-minute sliding window cache of processed update_ids",
            "Rejects repeated webhook deliveries without re-triggering AI generation",
          ],
          configuration: [
            "Constant-time string comparison preventing timing attacks",
            "TTL: 300 seconds per update_id entry",
          ],
          region: "Worker Edge Memory Space",
          security_controls: [
            "Timing-safe header comparison",
            "Replay attack mitigation via update_id cache",
          ],
          x: 520,
          y: 380,
          status: "secured",
          layer: "security",
          sectionId: "sec-edge",
          verification: "code",
          evidence: ["src/lib/portfolio-projects.ts"],
        },
        {
          id: "node-gemini-primary",
          name: "Google Gemini 1.5 Flash",
          category: "ai",
          tech: "Gemini 1.5 Flash API",
          provider: "Google AI Studio / Vertex AI",
          description:
            "Primary multimodal AI model generating fast, context-aware conversational answers.",
          responsibilities: [
            "Processes incoming user chat prompt with custom system persona",
            "Returns structured response within 1.5 seconds average latency",
            "Handles markdown formatting matching Telegram message limitations",
          ],
          configuration: [
            "REST API HTTPS invocation",
            "Temperature: 0.7, topP: 0.95",
            "Max output tokens: 1024",
          ],
          region: "Google Cloud Multi-Region",
          security_controls: [
            "API key encrypted in Cloudflare Worker secret binding",
            "Automated timeout threshold (8 seconds)",
          ],
          x: 760,
          y: 180,
          status: "operational",
          layer: "compute",
          sectionId: "sec-ai",
          verification: "code",
          evidence: ["src/lib/portfolio-projects.ts"],
        },
        {
          id: "node-cf-ai-fallback",
          name: "Cloudflare Workers AI Fallback",
          category: "ai",
          tech: "Workers AI (@cf/meta/llama-3-8b-instruct)",
          provider: "Cloudflare Edge GPUs",
          description:
            "Edge AI model invoked automatically if primary Gemini API encounters quota limits or timeout.",
          responsibilities: [
            "Provides uninterrupted failover if Gemini API is unreachable",
            "Runs on Cloudflare global GPU hardware without egress latency",
            "Ensures 100% uptime for bot replies",
          ],
          configuration: [
            "@cf/meta/llama-3-8b-instruct model binding",
            "Zero network egress hop from Cloudflare Worker",
            "Deterministic fallback circuit breaker",
          ],
          region: "Cloudflare GPU POPs",
          security_controls: [
            "Native Cloudflare internal AI binding",
            "Zero external API keys required",
          ],
          x: 760,
          y: 380,
          status: "operational",
          layer: "compute",
          sectionId: "sec-ai",
          verification: "code",
          evidence: ["src/lib/portfolio-projects.ts"],
        },
        {
          id: "node-d1-db",
          name: "Cloudflare D1 SQLite Database",
          category: "database",
          tech: "Cloudflare D1 Serverless SQL",
          provider: "Cloudflare D1",
          description:
            "Distributed serverless SQLite database storing user preferences, chat sessions, and audit telemetry.",
          responsibilities: [
            "Persists user chat history and session context",
            "Records telemetry: latency, tokens used, and fallback triggers",
            "Stores processed update_id records for idempotency",
          ],
          configuration: [
            "SQL schema with prepared statements",
            "Automatic read replication across global locations",
            "Point-in-time recovery",
          ],
          region: "Cloudflare Storage Network",
          security_controls: [
            "Strict SQL parameterized queries prevent SQL injection",
            "Accessible exclusively via Worker internal binding",
          ],
          x: 1000,
          y: 180,
          status: "verified",
          layer: "persistence",
          sectionId: "sec-data",
          verification: "code",
          evidence: ["src/lib/portfolio-projects.ts"],
        },
      ],
      edges: [
        {
          id: "e-user-tgapi",
          source: "node-tg-user",
          target: "node-tg-api",
          label: "Send Telegram Message",
          protocol: "MTProto / Port 443",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Telegram user sends text message or bot command.",
          step: 1,
        },
        {
          id: "e-tgapi-worker",
          source: "node-tg-api",
          target: "node-cf-worker",
          label: "POST Webhook JSON",
          protocol: "HTTPS / TLS 1.3",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Telegram Bot API delivers encrypted webhook payload to Cloudflare Worker.",
          step: 2,
        },
        {
          id: "e-worker-auth",
          source: "node-cf-worker",
          target: "node-auth-idempotency",
          label: "Validate Secret Header",
          protocol: "Internal Runtime Check",
          direction: "directional",
          category: "security",
          animated: true,
          description: "Worker verifies secret_token and update_id before executing logic.",
          step: 3,
        },
        {
          id: "e-worker-gemini",
          source: "node-cf-worker",
          target: "node-gemini-primary",
          label: "Primary Prompt Dispatch",
          protocol: "HTTPS REST / JSON",
          direction: "bidirectional",
          category: "data",
          animated: true,
          description: "Dispatches conversational prompt to Google Gemini API.",
          step: 4,
        },
        {
          id: "e-worker-d1",
          source: "node-cf-worker",
          target: "node-d1-db",
          label: "Session & Telemetry Store",
          protocol: "D1 Prepared SQL",
          direction: "bidirectional",
          category: "data",
          animated: true,
          description: "Stores session history and operational metrics into Cloudflare D1.",
          step: 5,
        },
        {
          id: "e-worker-tgapi-reply",
          source: "node-cf-worker",
          target: "node-tg-api",
          label: "sendMessage Response",
          protocol: "HTTPS REST",
          direction: "directional",
          category: "network",
          animated: true,
          description: "Worker delivers generated response back to Telegram Bot API.",
          step: 6,
        },
        {
          id: "e-worker-fallback",
          source: "node-cf-worker",
          target: "node-cf-ai-fallback",
          label: "Fallback on Error / Timeout",
          protocol: "Internal Edge Binding",
          direction: "bidirectional",
          category: "data",
          animated: false,
          secondary: true,
          description: "Circuit breaker triggers Llama 3 edge fallback if Gemini API fails.",
        },
      ],
    },
  },
];

function formatDbDiagram(raw: unknown): ArchitectureDiagram {
  const row = raw as {
    id: string;
    project_id: string | null;
    title: string;
    slug: string;
    description: string | null;
    architecture_type: string | null;
    diagram_data: unknown;
    is_published: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
  };

  const data = row.diagram_data as Partial<ArchitectureDiagramData> | undefined;

  return {
    id: row.id,
    project_id: row.project_id,
    title: row.title,
    slug: row.slug,
    description: row.description || "",
    architecture_type: row.architecture_type || "cloud",
    diagram_data: {
      version: typeof data?.version === "number" ? data.version : 1,
      nodes: Array.isArray(data?.nodes)
        ? (data.nodes as ArchitectureNode[]).map((n) => ({
            ...n,
            sectionId: n.sectionId,
            verification: n.verification,
            evidence: Array.isArray(n.evidence) ? n.evidence : undefined,
          }))
        : [],
      edges: Array.isArray(data?.edges) ? (data.edges as ArchitectureEdge[]) : [],
      viewport: data?.viewport || { x: 0, y: 0, zoom: 1 },
      journey: Array.isArray(data?.journey) ? (data.journey as string[]) : [],
      sections: Array.isArray(data?.sections) ? (data.sections as ArchitectureSection[]) : undefined,
    },
    is_published: Boolean(row.is_published),
    display_order: Number(row.display_order ?? 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch all published architecture diagrams for public display.
 * Reads from Supabase if table exists; falls back to INITIAL_ARCHITECTURES seamlessly.
 */
export async function fetchPublishedArchitectures(): Promise<ArchitectureDiagram[]> {
  try {
    const { data, error } = await supabase
      .from("architecture_diagrams")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_ARCHITECTURES.filter((a) => a.is_published).sort(
        (a, b) => a.display_order - b.display_order,
      );
    }

    return (data as unknown[]).map(formatDbDiagram);
  } catch {
    return INITIAL_ARCHITECTURES.filter((a) => a.is_published).sort(
      (a, b) => a.display_order - b.display_order,
    );
  }
}

/**
 * Fetch a single architecture diagram by slug.
 */
export async function fetchArchitectureBySlug(slug: string): Promise<ArchitectureDiagram | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  try {
    const { data, error } = await supabase
      .from("architecture_diagrams")
      .select("*")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (error || !data) {
      const fallback = INITIAL_ARCHITECTURES.find((a) => a.slug.toLowerCase() === normalizedSlug);
      return fallback || null;
    }

    return formatDbDiagram(data);
  } catch {
    const fallback = INITIAL_ARCHITECTURES.find((a) => a.slug.toLowerCase() === normalizedSlug);
    return fallback || null;
  }
}

/**
 * Fetch all architecture diagrams for admin dashboard management (includes drafts).
 */
export async function fetchAllArchitecturesAdmin(): Promise<ArchitectureDiagram[]> {
  try {
    const { data, error } = await supabase
      .from("architecture_diagrams")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_ARCHITECTURES.sort((a, b) => a.display_order - b.display_order);
    }

    return (data as unknown[]).map(formatDbDiagram);
  } catch {
    return INITIAL_ARCHITECTURES.sort((a, b) => a.display_order - b.display_order);
  }
}

/**
 * Create a new architecture diagram (Admin only).
 */
export async function createArchitecture(
  input: ArchitectureDiagramInput,
): Promise<ArchitectureDiagram> {
  const insertPayload = {
    title: input.title,
    slug: input.slug.toLowerCase().trim(),
    description: input.description,
    architecture_type: input.architecture_type || "cloud",
    project_id: input.project_id || null,
    diagram_data: input.diagram_data as unknown as Json,
    is_published: input.is_published ?? true,
    display_order: input.display_order ?? 0,
  };

  const { data, error } = await supabase
    .from("architecture_diagrams")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create architecture: ${error.message}`);
  }

  return formatDbDiagram(data);
}

/**
 * Update an existing architecture diagram (Admin only).
 */
export async function updateArchitecture(
  id: string,
  input: Partial<ArchitectureDiagramInput>,
): Promise<ArchitectureDiagram> {
  const updatePayload: Database["public"]["Tables"]["architecture_diagrams"]["Update"] = {};

  if (input.title !== undefined) updatePayload.title = input.title;
  if (input.slug !== undefined) updatePayload.slug = input.slug.toLowerCase().trim();
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.architecture_type !== undefined)
    updatePayload.architecture_type = input.architecture_type;
  if (input.project_id !== undefined) updatePayload.project_id = input.project_id;
  if (input.diagram_data !== undefined)
    updatePayload.diagram_data = input.diagram_data as unknown as Json;
  if (input.is_published !== undefined) updatePayload.is_published = input.is_published;
  if (input.display_order !== undefined) updatePayload.display_order = input.display_order;

  const { data, error } = await supabase
    .from("architecture_diagrams")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update architecture: ${error.message}`);
  }

  return formatDbDiagram(data);
}

/**
 * Delete an architecture diagram (Admin only).
 */
export async function deleteArchitecture(id: string): Promise<void> {
  const { error } = await supabase.from("architecture_diagrams").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete architecture: ${error.message}`);
  }
}

/**
 * Toggle publication status of an architecture diagram (Admin only).
 */
export async function toggleArchitecturePublish(
  id: string,
  is_published: boolean,
): Promise<ArchitectureDiagram> {
  const { data, error } = await supabase
    .from("architecture_diagrams")
    .update({ is_published })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to toggle architecture publish status: ${error.message}`);
  }

  return formatDbDiagram(data);
}


/**
 * Synchronize built-in architectures into Supabase.
 * Upserts based on slug to preserve existing schema and avoid duplication.
 */
export async function syncBuiltInArchitectures(): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  for (const arch of INITIAL_ARCHITECTURES) {
    try {
      const { error } = await supabase.from("architecture_diagrams").upsert(
        {
          title: arch.title,
          slug: arch.slug.toLowerCase().trim(),
          description: arch.description,
          architecture_type: arch.architecture_type,
          project_id: arch.project_id,
          diagram_data: arch.diagram_data as unknown as Json,
          is_published: arch.is_published,
          display_order: arch.display_order,
        },
        { onConflict: "slug" }
      );
      if (error) {
        errors.push(`${arch.slug}: ${error.message}`);
      } else {
        synced++;
      }
    } catch (err: any) {
      errors.push(`${arch.slug}: ${err?.message || String(err)}`);
    }
  }

  return { synced, errors };
}
