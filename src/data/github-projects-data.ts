/**
 * Verified Project Details for Real GitHub Repositories.
 *
 * All data in this file is strictly verified from Piyush Prasad's actual GitHub repositories,
 * documentation, and production deployments. No fictitious information or unverified metrics.
 */

export interface VerifiedProjectDetails {
  repoName: string;
  category: "aws" | "cicd" | "devsecops" | "docker" | "automation" | "general";
  categoryLabel: string;
  overview: string;
  problemSolved: string;
  technologies: string[];
  keyFeatures: string[];
  architecture: string;
  deployment: string;
  liveDemoUrl?: string;
  liveDemoLabel?: string;
}

export const VERIFIED_PROJECT_DETAILS: Record<string, VerifiedProjectDetails> = {
  "Kamlesh-Prasad": {
    repoName: "Kamlesh-Prasad",
    category: "cicd",
    categoryLabel: "CI/CD & Cloud Infrastructure",
    overview:
      "Production web application and portfolio deployment architecture engineered for zero-downtime releases, global CDN caching, and automated HTTPS.",
    problemSolved:
      "Eliminates manual SSH deployments, eliminates downtime during website updates, and mitigates edge latency and web security vulnerabilities with automated certificate lifecycles.",
    technologies: [
      "AWS EC2 (Ubuntu 24.04 LTS)",
      "GitHub Actions",
      "Nginx Reverse Proxy",
      "Cloudflare CDN & DNS",
      "Let's Encrypt SSL",
      "SPF / DKIM / DMARC",
      "SSH Key Auth",
      "TypeScript",
    ],
    keyFeatures: [
      "Automated push-to-deploy continuous delivery pipeline with GitHub Actions",
      "Zero-downtime Nginx reload upon release tag push",
      "Cloudflare CDN edge caching with TLS 1.3 encryption and DDoS protection",
      "Domain and DNS administration with ResellerClub and Cloudflare",
      "Configured enterprise email security records (SPF, DKIM, DMARC)",
    ],
    architecture:
      "Client Browser → Cloudflare Global Edge CDN → AWS EC2 Security Group (Ports 80/443) → Nginx Reverse Proxy with TLS termination → Node.js application process supervisor.",
    deployment:
      "Hosted on AWS EC2 (Ubuntu 24.04 LTS in ap-south-1). Production releases are triggered by GitHub Actions runner executing SSH deployment scripts.",
    liveDemoUrl: "https://kamleshprasad.com",
    liveDemoLabel: "kamleshprasad.com",
  },

  onixmall: {
    repoName: "onixmall",
    category: "devsecops",
    categoryLabel: "DevSecOps & Observability",
    overview:
      "Production-hardened AWS EC2 infrastructure stack equipped with Prometheus metric scraping, Grafana observability dashboards, Trivy vulnerability scanning, and strict UFW firewall policies.",
    problemSolved:
      "Addresses unmonitored production server health, unpatched CVE vulnerabilities in operating system packages, and open unmonitored network attack surfaces on public cloud instances.",
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
    keyFeatures: [
      "Continuous automated Trivy vulnerability scanning for OS packages and container layers",
      "Prometheus time-series collection of CPU, RAM, disk I/O, and network metrics",
      "Grafana dashboards visualising real-time host resource utilisation and alert triggers",
      "UFW firewall policy enforcing default-deny ingress with rate-limited SSH",
      "Automated SSL certificate renewal daemon managed via systemd timers",
    ],
    architecture:
      "Ingress → AWS EC2 Security Group → Linux UFW Firewall → Nginx Web Server. Prometheus server periodically scrapes Node Exporter on localhost:9100, providing telemetry to Grafana.",
    deployment:
      "Automated shell provisioning scripts run on AWS EC2 Ubuntu LTS server instances to enforce hardening benchmarks and observability collectors.",
  },

  "sentinel-cloud-view": {
    repoName: "sentinel-cloud-view",
    category: "docker",
    categoryLabel: "Docker & Infrastructure Monitoring",
    overview:
      "CloudOps Sentinel: Full-stack infrastructure monitoring dashboard providing real-time server fleet metrics, Docker container lifecycle status, and automated backup routines.",
    problemSolved:
      "Consolidates fragmented command-line monitoring tools into an authenticated web-based operational cockpit for rapid incident identification and recovery.",
    technologies: [
      "React",
      "Node.js",
      "Express",
      "Docker",
      "SQLite",
      "PM2 Process Supervisor",
      "Nginx",
      "Trivy",
      "GitHub Actions",
    ],
    keyFeatures: [
      "Real-time server cluster metric telemetry and storage volume consumption graphs",
      "Docker container fleet health monitoring and restart management",
      "Automated scheduled SQLite database retention and pre-cleanup SQL dumps",
      "Role-based authenticated administrative login protecting monitoring endpoints",
      "Trivy CVE scan report ingestion and vulnerability trend charts",
    ],
    architecture:
      "React dashboard client → Role-gated Node.js REST API → Linux /proc telemetry & Docker Engine socket (/var/run/docker.sock) → Local SQLite persistent store.",
    deployment:
      "Deployed on AWS EC2 under PM2 process supervision behind an Nginx reverse proxy with automated continuous integration checks.",
  },

  "piyush-prasad": {
    repoName: "piyush-prasad",
    category: "aws",
    categoryLabel: "Cloud Platform & Observability",
    overview:
      "Personal CloudOps engineering portfolio and operational dashboard (PP·OPS) featuring live endpoint health diagnostics, atomic rate limiting, and Supabase integration.",
    problemSolved:
      "Provides verifiable proof of cloud engineering capability through live TLS 1.3 socket testing, persistent database admin telemetry, and AI knowledge retrieval.",
    technologies: [
      "React 19",
      "TanStack Start",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS",
      "Cloudflare Workers",
      "Google Gemini AI API",
    ],
    keyFeatures: [
      "Real-time TLS 1.3 certificate inspection and DNS health probing",
      "Distributed IP rate limiter using atomic PostgreSQL row-level locks",
      "Supabase database retention policies with pre-deletion SQL backups",
      "Verified Credly digital credentials sync with automatic profile badge ingestion",
      "Ask Piyush AI assistant trained on portfolio content using Google Gemini API",
    ],
    architecture:
      "Cloudflare Workers global edge → TanStack Start server functions → Supabase PostgreSQL database + Google Gemini AI REST API.",
    deployment:
      "Continuous deployment via Cloudflare Pages and GitHub Actions with automated TypeScript verification and asset bundling.",
    liveDemoUrl: "https://piyushprasad.in/dashboard",
    liveDemoLabel: "piyushprasad.in/dashboard",
  },

  "devsecops-pipeline-scripts": {
    repoName: "devsecops-pipeline-scripts",
    category: "automation",
    categoryLabel: "DevSecOps & Automation",
    overview:
      "Curated library of production-tested Shell and Python automation scripts for container scanning, policy enforcement, pre-commit secret detection, and CI/CD quality gates.",
    problemSolved:
      "Prevents secrets leakage, misconfigured container permissions, and unpatched CVEs from advancing into production deployment pipelines.",
    technologies: [
      "Bash / Shell",
      "Python 3",
      "Trivy",
      "Docker",
      "Git Hooks",
      "GitHub Actions",
      "Linux CLI",
    ],
    keyFeatures: [
      "Automated exit-code gating on HIGH/CRITICAL severity vulnerabilities in CI/CD",
      "Git pre-commit hooks to block exposed API keys and sensitive credentials",
      "Automated generation of vulnerability reports in Markdown and JSON formats",
      "Docker image layer security analysis and minimal base-image recommendations",
    ],
    architecture:
      "Integrated into GitHub Actions workflow execution pipelines and local developer Git hooks before code merge and container push.",
    deployment:
      "Modular, version-controlled scripts executed within standard Linux/macOS runner environments.",
  },

  "aws-infrastructure-templates": {
    repoName: "aws-infrastructure-templates",
    category: "aws",
    categoryLabel: "AWS & Infrastructure as Code",
    overview:
      "Modular CloudFormation and Terraform infrastructure-as-code templates for reproducible AWS VPC network topologies, EC2 servers, and automated backup routines.",
    problemSolved:
      "Eliminates manual cloud configuration drift and human error by codifying infrastructure according to the AWS Well-Architected Framework.",
    technologies: [
      "AWS CloudFormation",
      "Terraform",
      "AWS EC2",
      "AWS VPC",
      "AWS S3",
      "AWS IAM",
      "Python",
    ],
    keyFeatures: [
      "Multi-Availability Zone VPC templates with public and private subnets",
      "Least-privilege IAM policies and security group port declarations",
      "Automated EBS volume snapshot retention policies",
      "UserData cloud-init scripts for automated Ubuntu server configuration",
    ],
    architecture:
      "Declarative YAML/HCL templates provisioning AWS VPC, Internet Gateway, Route Tables, NAT, Security Groups, and EC2 instances.",
    deployment:
      "Provisioned via AWS CLI (aws cloudformation deploy) or Terraform CLI targeting AWS region ap-south-1.",
  },
};

