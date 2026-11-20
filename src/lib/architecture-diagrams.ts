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
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-600",
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
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-800",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-600",
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
      "Production cloud infrastructure and zero-downtime deployment pipeline for kamleshprasad.com. Features automated GitHub Actions runners, SSH key deployment scripts, AWS EC2 Ubuntu host, Nginx reverse proxy, and Cloudflare CDN.",
    architecture_type: "AWS & CI/CD Pipeline",
    display_order: 6,
    is_published: true,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2026-11-19T00:00:00Z",
    diagram_data: {
      version: 1,
      viewport: { x: 0, y: 0, zoom: 0.95 },
      journey: [
        "node-visitor",
        "node-kamlesh-dns",
        "node-cloudflare",
        "node-nginx",
        "node-nodeapp",
      ],
      sections: [
        {
          id: "sec-kamlesh-ingress",
          title: "01. Ingress & Domain Resolution",
          description: "Handles visitor DNS resolution and web traffic ingress.",
          nodeIds: ["node-visitor", "node-kamlesh-dns"],
        },
        {
          id: "sec-kamlesh-perimeter",
          title: "02. Perimeter & Security",
          description: "Terminates HTTPS, enforces firewalls, and mitigates unauthorized access.",
          nodeIds: ["node-cloudflare", "node-nginx", "node-firewall"],
        },
        {
          id: "sec-kamlesh-compute",
          title: "03. Application Compute",
          description: "Executes backend business logic and maintains process clustering.",
          nodeIds: ["node-nodeapp", "node-pm2"],
        },
        {
          id: "sec-kamlesh-storage",
          title: "04. Data Storage & Persistence",
          description: "Persists transactional records and application uploads.",
          nodeIds: ["node-postgres", "node-storage"],
        },
        {
          id: "sec-kamlesh-cicd",
          title: "05. CI/CD & Deployment",
          description: "Automates linting, testing, and continuous zero-downtime deployment.",
          nodeIds: ["node-dev", "node-repo", "node-actions", "node-deploy-script"],
        },
      ],
      nodes: [
        {
          id: "node-dev",
          name: "Developer Workstation",
          category: "client",
          tech: "Git CLI / VS Code",
          provider: "Local Machine",
          description: "Engineer creates feature branch, tags release, and pushes to remote Git.",
          responsibilities: [
            "Enforces local pre-commit linting",
            "Creates signed Git release tags",
            "Pushes commits to GitHub repository",
          ],
          configuration: ["Git SSH authentication", "GPG commit signing"],
          region: "Local Development",
          security_controls: ["SSH key passphrase", "Zero local secret check-ins"],
          x: 40,
          y: 80,
          status: "active",
          layer: "cicd",
        },
        {
          id: "node-repo",
          name: "GitHub Repository",
          category: "cicd",
          tech: "GitHub Enterprise Cloud",
          provider: "GitHub",
          description:
            "Central version control repository hosting source code and deployment workflows.",
          responsibilities: [
            "Triggers CI/CD workflow upon release tag creation",
            "Enforces branch protection on main",
            "Stores encrypted repository deployment secrets",
          ],
          configuration: ["Automated webhook triggers", "Protected main branch"],
          region: "GitHub Cloud",
          security_controls: ["Encrypted repository secrets", "2FA contributor enforcement"],
          x: 270,
          y: 80,
          status: "verified",
          layer: "cicd",
        },
        {
          id: "node-actions",
          name: "GitHub Actions Runner",
          category: "cicd",
          tech: "GitHub Actions Workflow",
          provider: "Ubuntu Runner",
          description:
            "Automated continuous delivery runner compiling production bundle and initiating SSH release.",
          responsibilities: [
            "Checks out repository with submodules",
            "Executes TypeScript typechecking and bundle build",
            "Initiates secure SSH deployment session to AWS EC2",
          ],
          configuration: [
            "Node.js 20.x runtime",
            "Automated dependency caching",
            "Frozen lockfile installation",
          ],
          region: "GitHub Cloud Runner",
          security_controls: ["Ephemeral runner environment", "Masked SSH secret credentials"],
          x: 500,
          y: 80,
          status: "operational",
          layer: "cicd",
        },
        {
          id: "node-ssh",
          name: "SSH Key Auth Gateway",
          category: "security",
          tech: "OpenSSH 9.6 / Ed25519",
          provider: "Linux SSH Daemon",
          description:
            "Cryptographically restricted SSH port accepting only authenticated runner deploy keys.",
          responsibilities: [
            "Authenticates GitHub Actions runner via Ed25519 public key",
            "Blocks password-based SSH authentication completely",
            "Restricts command execution scope to deploy script",
          ],
          configuration: [
            "PasswordAuthentication no",
            "PermitRootLogin no",
            "Port 22 with Fail2ban monitoring",
          ],
          region: "AWS EC2 Host",
          security_controls: [
            "Ed25519 256-bit public key authentication",
            "Strict non-root user permissions",
          ],
          x: 740,
          y: 80,
          status: "secured",
          port: "22",
          layer: "security",
        },
        {
          id: "node-ec2",
          name: "AWS EC2 Ubuntu Host",
          category: "compute",
          tech: "AWS EC2 / Ubuntu 24.04 LTS",
          provider: "AWS ap-south-1 (Mumbai)",
          description:
            "Virtual cloud compute instance hosting Nginx reverse proxy and Node.js supervisor.",
          responsibilities: [
            "Provides isolated compute, memory, and NVMe EBS storage",
            "Executes automated deployment bash scripts",
            "Hosts systemd timers for certbot SSL renewals",
          ],
          configuration: [
            "Ubuntu 24.04 LTS kernel 6.8",
            "AWS VPC Security Group restricting ingress",
            "EBS volume with daily snapshot schedule",
          ],
          region: "AWS Asia Pacific (Mumbai) ap-south-1",
          security_controls: [
            "AWS Security Group: ingress 80/443/22 only",
            "Unattended security upgrades enabled",
          ],
          x: 980,
          y: 80,
          status: "operational",
          layer: "compute",
        },
        {
          id: "node-nginx",
          name: "Nginx Reverse Proxy",
          category: "networking",
          tech: "Nginx 1.24 / Certbot",
          provider: "Nginx Open Source",
          description:
            "Reverse proxy terminating SSL, applying security headers, and proxying requests to PM2.",
          responsibilities: [
            "Terminates Let's Encrypt TLS 1.3 certificates",
            "Applies Gzip compression on text responses",
            "Performs zero-downtime reload upon deployment",
          ],
          configuration: [
            "proxy_pass http://127.0.0.1:3000",
            "Strict SSL ciphers with automated certbot renewals",
            "X-Frame-Options: SAMEORIGIN",
          ],
          region: "AWS EC2 Instance",
          security_controls: [
            "Certbot automated 90-day SSL renewal daemon",
            "Buffer overflow and client body size limits",
          ],
          x: 980,
          y: 280,
          status: "verified",
          port: "80, 443",
          layer: "networking",
        },
        {
          id: "node-nodeapp",
          name: "Node.js Application Runtime",
          category: "application",
          tech: "Node.js / PM2 Cluster",
          provider: "PM2 Process Supervisor",
          description:
            "Production application processes managed with zero-downtime reloads and memory watchdog.",
          responsibilities: [
            "Supervises web application instances",
            "Executes automatic restart on unhandled exception",
            "Performs rolling reload without dropping active sockets",
          ],
          configuration: [
            "PM2 cluster mode on localhost:3000",
            "Max memory restart threshold: 500MB",
            "Environment variables injected via PM2 ecosystem",
          ],
          region: "AWS EC2 Instance",
          security_controls: [
            "Localhost-only port binding (127.0.0.1:3000)",
            "Non-root system user (deployer)",
          ],
          x: 740,
          y: 280,
          status: "operational",
          port: "3000",
          layer: "compute",
        },
        {
          id: "node-cloudflare",
          name: "Cloudflare CDN & DNS Caching",
          category: "cdn",
          tech: "Cloudflare Global Anycast Edge",
          provider: "Cloudflare",
          description:
            "Edge caching static assets, providing DDoS protection, and routing DNS for kamleshprasad.com.",
          responsibilities: [
            "Caches static JavaScript, images, and fonts at edge",
            "Shields origin AWS EC2 IP address from public scanning",
            "Enforces TLS 1.3 encryption and HTTP/3 support",
          ],
          configuration: [
            "Full (Strict) SSL encryption mode",
            "Auto Minify (JS, CSS, HTML)",
            "Edge cache TTL: 4 hours",
          ],
          region: "Global Anycast Network",
          security_controls: [
            "Cloudflare WAF managed ruleset",
            "Origin server IP cloaked behind proxy",
          ],
          x: 500,
          y: 280,
          status: "verified",
          layer: "edge",
        },
        {
          id: "node-visitor",
          name: "Client Public Visitor",
          category: "client",
          tech: "Web Browser",
          provider: "Public Internet",
          description: "End user accessing kamleshprasad.in over encrypted HTTPS connection.",
          responsibilities: [
            "Initiates DNS lookup for kamleshprasad.in",
            "Receives cached content from Cloudflare Anycast edge",
          ],
          configuration: ["TLS 1.3 / HTTP/2 connection"],
          region: "Worldwide",
          security_controls: ["Encrypted payload transit"],
          x: 120,
          y: 280,
          status: "active",
          layer: "client",
        },
        {
          id: "node-kamlesh-dns",
          name: "Cloudflare Authoritative DNS",
          category: "dns",
          tech: "Cloudflare Anycast DNS",
          provider: "Cloudflare DNS",
          description:
            "Authoritative DNS resolution for kamleshprasad.in mapping incoming traffic to Cloudflare Anycast proxy.",
          responsibilities: [
            "Resolves kamleshprasad.in with global Anycast routing",
            "Protects origin IP address behind Cloudflare proxy",
            "Validates encrypted DNS-over-HTTPS (DoH) requests",
          ],
          configuration: [
            "Zone: kamleshprasad.in",
            "Record: A @ -> Cloudflare Anycast Proxy",
            "Record: CNAME www -> kamleshprasad.in",
            "Protocols: UDP Port 53 / DoH Port 443",
          ],
          region: "Global Anycast Edge",
          security_controls: [
            "Origin server IP cloaked behind proxy",
            "Cloudflare Layer 3/4 DDoS mitigation",
          ],
          x: 320,
          y: 280,
          status: "verified",
          port: "53, 443",
          layer: "edge",
        },
      ],
      edges: [
        {
          id: "e-dev-repo",
          source: "node-dev",
          target: "node-repo",
          label: "Git Tag Push",
          protocol: "Git SSH / Port 22",
          direction: "directional",
          description: "Developer pushes verified release tag to trigger automated build.",
          category: "deployment",
        },
        {
          id: "e-repo-actions",
          source: "node-repo",
          target: "node-actions",
          label: "Trigger CI Workflow",
          protocol: "GitHub Internal Event",
          direction: "directional",
          description: "GitHub Actions workflow spawned to compile and package release.",
          category: "deployment",
        },
        {
          id: "e-actions-ssh",
          source: "node-actions",
          target: "node-ssh",
          label: "SSH Deploy Script",
          protocol: "SSH Ed25519 / Port 22",
          direction: "directional",
          description: "Runner executes authenticated deployment commands on EC2 instance.",
          category: "deployment",
        },
        {
          id: "e-ssh-ec2",
          source: "node-ssh",
          target: "node-ec2",
          label: "System Execution",
          protocol: "Linux Local IPC",
          direction: "directional",
          description: "Deploy script updates code, rebuilds assets, and triggers PM2 reload.",
          category: "deployment",
        },
        {
          id: "e-ec2-nodeapp",
          source: "node-ec2",
          target: "node-nodeapp",
          label: "PM2 Process Reload",
          protocol: "Process Supervisor IPC",
          direction: "directional",
          description: "PM2 executes zero-downtime rolling reload of application worker.",
          category: "deployment",
        },
        {
          id: "e-nginx-nodeapp",
          source: "node-nginx",
          target: "node-nodeapp",
          label: "Reverse Proxy Pass",
          protocol: "HTTP / 127.0.0.1:3000",
          direction: "bidirectional",
          description: "Nginx forwards dynamic web requests to Node.js application process.",
          category: "network",
        },
        {
          id: "e-cloudflare-nginx",
          source: "node-cloudflare",
          target: "node-nginx",
          label: "Origin Request",
          protocol: "HTTPS / Port 443",
          direction: "directional",
          description: "Cloudflare forwards un-cached requests to origin Nginx server.",
          category: "network",
          animated: true,
        },
        {
          id: "e-visitor-dns",
          source: "node-visitor",
          target: "node-kamlesh-dns",
          label: "DNS Resolution",
          protocol: "DNS (UDP 53 / DoH)",
          direction: "directional",
          description: "Browser resolves kamleshprasad.in via Cloudflare authoritative Anycast nameservers.",
          category: "network",
          animated: true,
        },
        {
          id: "e-dns-cloudflare",
          source: "node-kamlesh-dns",
          target: "node-cloudflare",
          label: "Anycast Edge Route",
          protocol: "HTTPS / TLS 1.3",
          direction: "directional",
          description: "Resolved query reaches Cloudflare CDN edge proxy.",
          category: "network",
          animated: true,
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
      "Production-hardened AWS EC2 infrastructure stack equipped with Prometheus time-series metric collection, Grafana visualization dashboards, Trivy vulnerability auditing, and strict UFW firewall policies.",
    architecture_type: "DevSecOps & Observability",
    display_order: 7,
    is_published: true,
    created_at: "2024-04-10T00:00:00Z",
    updated_at: "2026-11-19T00:00:00Z",
    diagram_data: {
      version: 1,
      viewport: { x: 0, y: 0, zoom: 0.95 },
      sections: [
        {
          id: "sec-ingress",
          title: "01. Ingress & Domain Resolution",
          description: "Handles customer traffic ingress and authoritative DNS resolution.",
          nodeIds: ["node-ingress", "node-onixmall-dns"],
        },
        {
          id: "sec-perimeter",
          title: "02. Perimeter & Host Defense",
          description: "Protects host perimeter with stateful packet filtering and automated IP brute-force bans.",
          nodeIds: ["node-ufw", "node-fail2ban"],
        },
        {
          id: "sec-runtime",
          title: "03. Application Runtime",
          description: "Hardened reverse proxy and unprivileged application runtime executing business logic.",
          nodeIds: ["node-nginx-hardened", "node-app-hardened"],
        },
        {
          id: "sec-telemetry",
          title: "04. Telemetry & Observability",
          description: "Host metric scraping, time-series storage, and visual operational health dashboards.",
          nodeIds: ["node-node-exporter", "node-prometheus", "node-grafana"],
        },
        {
          id: "sec-audit",
          title: "05. Security Audit & Gates",
          description: "Automated vulnerability scanner auditing dependencies and OS packages for known CVEs.",
          nodeIds: ["node-trivy"],
        },
      ],
      nodes: [
        {
          id: "node-ingress",
          name: "Public Internet Ingress",
          category: "client",
          tech: "TCP/IP Network Traffic",
          provider: "Internet Gateway",
          description: "Inbound public traffic attempting connection to host server.",
          responsibilities: ["Transmits HTTP, HTTPS, and SSH packets towards AWS VPC"],
          configuration: ["IPv4 / IPv6 network routing"],
          region: "Public Internet",
          security_controls: ["AWS VPC Network Access Control Lists (NACL)"],
          x: 40,
          y: 80,
          status: "active",
          layer: "client",
        },
        {
          id: "node-onixmall-dns",
          name: "DNS Resolution Gateway",
          category: "dns",
          tech: "Authoritative Cloud DNS",
          provider: "Cloud DNS / Route 53",
          description:
            "Resolves public domain name to AWS EC2 Elastic IP address with encrypted TLS handshake routing.",
          responsibilities: [
            "Maps domain hostname to AWS Elastic IP",
            "Directs incoming HTTP/HTTPS traffic to network firewall",
            "Supports DNS-over-HTTPS (DoH)",
          ],
          configuration: [
            "Record: A @ -> AWS EC2 Elastic IP",
            "Record: CNAME www -> @",
            "Protocols: UDP Port 53 / DoH Port 443",
          ],
          region: "AWS Global Edge",
          security_controls: ["DNSSEC validation", "DDoS mitigation at Anycast layer"],
          x: 180,
          y: 80,
          status: "verified",
          port: "53, 443",
          layer: "edge",
        },
        {
          id: "node-ufw",
          name: "Linux UFW & iptables Firewall",
          category: "security",
          tech: "UFW / iptables Netfilter",
          provider: "Linux Kernel Netfilter",
          description:
            "Host-level stateful packet firewall enforcing strict default-deny inbound policy.",
          responsibilities: [
            "Drops all unsolicited ingress packets by default",
            "Permits incoming traffic only on Ports 80, 443, and secured SSH",
            "Blocks Prometheus and Node Exporter ports from external internet",
          ],
          configuration: [
            "ufw default deny incoming",
            "ufw default allow outgoing",
            "Rate-limited SSH rule",
          ],
          region: "AWS EC2 Host Kernel",
          security_controls: [
            "Default-deny ingress packet policy",
            "SYN flood rate-limiting via net.ipv4.tcp_syncookies",
          ],
          x: 270,
          y: 80,
          status: "secured",
          layer: "security",
        },
        {
          id: "node-nginx-hardened",
          name: "Nginx Hardened Web Server",
          category: "networking",
          tech: "Nginx 1.24 / Certbot SSL",
          provider: "Nginx",
          description:
            "Hardened web server with security headers, buffer overflow limits, and TLS 1.3.",
          responsibilities: [
            "Terminates Let's Encrypt TLS certificates",
            "Applies Content-Security-Policy and HSTS security headers",
            "Disallows direct access to hidden files and internal scripts",
          ],
          configuration: [
            "client_body_buffer_size 128k",
            "server_tokens off",
            "ssl_protocols TLSv1.2 TLSv1.3",
          ],
          region: "AWS EC2 Host",
          security_controls: [
            "Automated systemd certbot SSL renewal daemon",
            "Disabled obsolete SSL/TLS ciphers",
          ],
          x: 500,
          y: 80,
          status: "verified",
          port: "80, 443",
          layer: "networking",
        },
        {
          id: "node-app-hardened",
          name: "Hardened Application",
          category: "application",
          tech: "Node.js Web Application",
          provider: "Isolated Linux User",
          description:
            "Application running under dedicated non-root user with minimal POSIX capabilities.",
          responsibilities: [
            "Serves application business logic",
            "Operates without sudo/root filesystem privileges",
          ],
          configuration: ["Dedicated unprivileged system user", "Restricted directory permissions"],
          region: "AWS EC2 Host",
          security_controls: [
            "Least-privilege filesystem execution",
            "Isolated application logging",
          ],
          x: 740,
          y: 80,
          status: "operational",
          layer: "compute",
        },
        {
          id: "node-node-exporter",
          name: "Prometheus Node Exporter",
          category: "monitoring",
          tech: "Node Exporter 1.7",
          provider: "Prometheus Ecosystem",
          description:
            "Host metrics collector scraping CPU, RAM, disk I/O, and network socket statistics.",
          responsibilities: [
            "Reads /proc and /sys filesystem counters",
            "Exposes metrics endpoint on localhost:9100",
            "Never exposes telemetry port to public internet",
          ],
          configuration: [
            "Bound to 127.0.0.1:9100 only",
            "Collectors: cpu, meminfo, diskstats, netdev",
          ],
          region: "AWS EC2 Host (Localhost)",
          security_controls: [
            "Localhost binding prevents unauthorized metric exposure",
            "UFW blocks external port 9100",
          ],
          x: 980,
          y: 80,
          status: "verified",
          port: "9100",
          layer: "observability",
        },
        {
          id: "node-prometheus",
          name: "Prometheus Time-Series DB",
          category: "monitoring",
          tech: "Prometheus TSDB 2.50",
          provider: "Prometheus Daemon",
          description:
            "Time-series database collecting metrics at 15s intervals with 15-day retention policy.",
          responsibilities: [
            "Scrapes Node Exporter metrics every 15 seconds",
            "Stores time-series data with compression",
            "Evaluates alerting rules for high CPU/RAM thresholds",
          ],
          configuration: [
            "scrape_interval: 15s",
            "storage.tsdb.retention.time: 15d",
            "Bound to localhost:9090",
          ],
          region: "AWS EC2 Host",
          security_controls: [
            "Access restricted to localhost or SSH tunnel",
            "Automated memory retention ceiling prevents OOM",
          ],
          x: 980,
          y: 280,
          status: "operational",
          port: "9090",
          layer: "observability",
        },
        {
          id: "node-grafana",
          name: "Grafana Observability Dashboards",
          category: "monitoring",
          tech: "Grafana 10 / PromQL",
          provider: "Grafana Labs",
          description:
            "Interactive operational dashboards visualizing host health, memory curves, and alert states.",
          responsibilities: [
            "Executes PromQL queries against Prometheus TSDB",
            "Renders real-time CPU, RAM, and network utilization graphs",
            "Triggers visual alerts when disk usage exceeds 85%",
          ],
          configuration: [
            "Provisioned Prometheus datasource",
            "Custom host metrics dashboard JSON",
            "Role-based dashboard admin authentication",
          ],
          region: "AWS EC2 Host",
          security_controls: [
            "Admin password encrypted with bcrypt",
            "Protected behind reverse proxy or private tunnel",
          ],
          x: 740,
          y: 280,
          status: "operational",
          port: "3000",
          layer: "observability",
        },
        {
          id: "node-trivy",
          name: "Trivy Vulnerability Scanner",
          category: "security",
          tech: "Trivy CLI / Scheduled Daemon",
          provider: "Aqua Security",
          description:
            "Automated security scanner auditing installed OS packages and dependencies for CVEs.",
          responsibilities: [
            "Scans Debian/Ubuntu system packages daily",
            "Generates formatted Markdown and JSON vulnerability reports",
            "Flags High and Critical CVEs requiring patch updates",
          ],
          configuration: [
            "Daily systemd timer execution",
            "Severity threshold: HIGH,CRITICAL",
            "Offline vulnerability database cache",
          ],
          region: "AWS EC2 Host",
          security_controls: ["Read-only audit execution", "Automated alert report generation"],
          x: 500,
          y: 280,
          status: "verified",
          layer: "security",
        },
        {
          id: "node-fail2ban",
          name: "Fail2ban Intrusion Defense",
          category: "security",
          tech: "Fail2ban Daemon",
          provider: "Linux Security",
          description:
            "Monitors authentication log files and dynamically injects iptables drop rules against brute-force attacks.",
          responsibilities: [
            "Parses /var/log/auth.log for repeated SSH failures",
            "Bans offending IP addresses for 24 hours after 5 failures",
            "Protects server from automated credential stuffing bots",
          ],
          configuration: ["bantime = 86400", "findtime = 600", "maxretry = 5"],
          region: "AWS EC2 Host",
          security_controls: [
            "Dynamic iptables firewall rule injection",
            "Protects SSH administrative port",
          ],
          x: 270,
          y: 280,
          status: "secured",
          layer: "security",
        },
      ],
      edges: [
        {
          id: "e-ingress-dns",
          source: "node-ingress",
          target: "node-onixmall-dns",
          label: "DNS Query",
          protocol: "DNS (UDP 53 / DoH)",
          direction: "directional",
          description: "Incoming user traffic performs DNS lookup to resolve public server IP.",
          category: "network",
          animated: true,
        },
        {
          id: "e-dns-ufw",
          source: "node-onixmall-dns",
          target: "node-ufw",
          label: "Inbound Packets",
          protocol: "TCP/IP",
          direction: "directional",
          description: "Resolved traffic reaches host firewall and is evaluated by UFW default-deny policy.",
          category: "security",
          animated: true,
        },
        {
          id: "e-ufw-nginx",
          source: "node-ufw",
          target: "node-nginx-hardened",
          label: "Permitted Web Ports",
          protocol: "TCP 80, 443",
          direction: "directional",
          description: "Filtered traffic on allowed web ports delivered to Nginx.",
          category: "security",
        },
        {
          id: "e-nginx-app",
          source: "node-nginx-hardened",
          target: "node-app-hardened",
          label: "Reverse Proxy",
          protocol: "Localhost HTTP",
          direction: "bidirectional",
          description: "Nginx forwards requests to unprivileged application process.",
          category: "network",
        },
        {
          id: "e-prom-exporter",
          source: "node-prometheus",
          target: "node-node-exporter",
          label: "Periodic Scrape",
          protocol: "HTTP 127.0.0.1:9100",
          direction: "directional",
          description: "Prometheus scrapes host metric counters every 15 seconds.",
          category: "telemetry",
          animated: true,
        },
        {
          id: "e-grafana-prom",
          source: "node-grafana",
          target: "node-prometheus",
          label: "PromQL Queries",
          protocol: "HTTP 127.0.0.1:9090",
          direction: "bidirectional",
          description: "Grafana executes PromQL queries to render visual dashboard graphs.",
          category: "telemetry",
        },
        {
          id: "e-trivy-app",
          source: "node-trivy",
          target: "node-app-hardened",
          label: "Vulnerability Audit",
          protocol: "Filesystem Scan",
          direction: "directional",
          description: "Trivy inspects dependencies and system packages for known CVEs.",
          category: "security",
        },
        {
          id: "e-fail2ban-ufw",
          source: "node-fail2ban",
          target: "node-ufw",
          label: "Inject Drop Rule",
          protocol: "Netfilter Rule",
          direction: "directional",
          description: "Fail2ban injects dynamic drop rules for repeat authentication failures.",
          category: "security",
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
    updated_at: "2026-11-19T00:00:00Z",
    diagram_data: {
      version: 1,
      viewport: { x: 0, y: 0, zoom: 0.95 },
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
            "Bot token kept in server-side environment secrets",
          ],
          x: 270,
          y: 180,
          status: "verified",
          layer: "edge",
        },
        {
          id: "node-cf-worker",
          name: "Cloudflare Worker Webhook",
          category: "compute",
          tech: "Cloudflare Workers (V8 Isolates)",
          provider: "Cloudflare Global Edge",
          description:
            "Serverless JavaScript/TypeScript runtime handling webhook requests in sub-5ms cold-start time.",
          responsibilities: [
            "Validates webhook secret token on every request",
            "Checks idempotency using update_id to prevent duplicate execution",
            "Coordinates AI model query and dispatches reply to Telegram",
          ],
          configuration: [
            "V8 Isolate lightweight execution",
            "Wrangler deployment with encrypted environment bindings",
            "Sub-5ms execution startup worldwide",
          ],
          region: "Global Anycast Edge (300+ Cities)",
          security_controls: [
            "X-Telegram-Bot-Api-Secret-Token verification",
            "Idempotency cache preventing repeat message processing",
            "No long-running server attack surface",
          ],
          x: 500,
          y: 180,
          status: "operational",
          layer: "compute",
        },
        {
          id: "node-auth-idempotency",
          name: "Auth & Idempotency Layer",
          category: "security",
          tech: "Crypto Token / KV Dedup",
          provider: "Cloudflare Worker Runtime",
          description:
            "Verifies incoming webhook authenticity and guarantees exactly-once message processing.",
          responsibilities: [
            "Performs constant-time string comparison on secret tokens",
            "Discards unauthorized HTTP requests immediately with HTTP 403",
            "Deduplicates retransmitted update_id entries",
          ],
          configuration: [
            "Constant-time crypto.subtle comparison",
            "In-memory / D1 update_id tracking",
          ],
          region: "Cloudflare Edge",
          security_controls: [
            "Constant-time token validation prevents timing attacks",
            "Zero bot token exposure in client code",
          ],
          x: 740,
          y: 80,
          status: "secured",
          layer: "security",
        },
        {
          id: "node-gemini-primary",
          name: "Google Gemini Primary AI",
          category: "ai",
          tech: "Gemini 1.5 Flash API",
          provider: "Google AI Cloud",
          description:
            "Primary high-reasoning multimodal language model generating conversational responses.",
          responsibilities: [
            "Processes incoming natural language prompt",
            "Maintains conversational context and user intent",
            "Returns response payload formatted with Telegram MarkdownV2",
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
          x: 980,
          y: 80,
          status: "operational",
          layer: "compute",
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
          x: 980,
          y: 280,
          status: "operational",
          layer: "compute",
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
          x: 740,
          y: 280,
          status: "verified",
          layer: "persistence",
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
          description: "Telegram user sends text message or bot command.",
          category: "network",
          animated: true,
        },
        {
          id: "e-tgapi-worker",
          source: "node-tg-api",
          target: "node-cf-worker",
          label: "POST Webhook JSON",
          protocol: "HTTPS / TLS 1.3",
          direction: "directional",
          description: "Telegram Bot API delivers encrypted webhook payload to Cloudflare Worker.",
          category: "network",
          animated: true,
        },
        {
          id: "e-worker-auth",
          source: "node-cf-worker",
          target: "node-auth-idempotency",
          label: "Validate Secret Header",
          protocol: "Internal Runtime Check",
          direction: "directional",
          description: "Worker verifies secret_token and update_id before executing logic.",
          category: "security",
        },
        {
          id: "e-auth-gemini",
          source: "node-auth-idempotency",
          target: "node-gemini-primary",
          label: "Primary Prompt Dispatch",
          protocol: "HTTPS REST / JSON",
          direction: "bidirectional",
          description: "Dispatches conversational prompt to Google Gemini API.",
          category: "data",
          animated: true,
        },
        {
          id: "e-worker-fallback",
          source: "node-cf-worker",
          target: "node-cf-ai-fallback",
          label: "Fallback on Error / Timeout",
          protocol: "Internal Edge Binding",
          direction: "bidirectional",
          description: "Circuit breaker triggers Llama 3 edge fallback if Gemini API fails.",
          category: "data",
        },
        {
          id: "e-worker-d1",
          source: "node-cf-worker",
          target: "node-d1-db",
          label: "Log Session & Telemetry",
          protocol: "D1 Prepared SQL",
          direction: "bidirectional",
          description: "Stores session history and operational metrics into Cloudflare D1.",
          category: "data",
        },
        {
          id: "e-worker-tgapi-reply",
          source: "node-cf-worker",
          target: "node-tg-api",
          label: "sendMessage Response",
          protocol: "HTTPS REST",
          direction: "directional",
          description: "Worker delivers generated response back to Telegram user.",
          category: "network",
        },
      ],
    },
  },
];

/**
 * Format a raw database record into an ArchitectureDiagram object.
 */
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
