/**
 * Shared Single Source of Truth for Portfolio Content.
 *
 * This module is imported by both:
 * 1. Public frontend components (ExperienceTimeline, Projects, SkillsGrid, Certifications)
 * 2. Server-side AI knowledge service (portfolio-knowledge.server.ts)
 *
 * Any update here updates both the visible portfolio website and Ask Piyush AI's ground-truth
 * knowledge base without duplicating data or requiring prompt rewrites.
 */

import runtimeLogo from "@/assets/runtime-logo.png";
import packtLogo from "@/assets/packt-logo.jpg";
import googleLogo from "@/assets/google-logo.jpg";
import mibLogo from "@/assets/mib-logo.svg";
import canonicalLogo from "@/assets/canonical-logo.jpg";
import dockerLogo from "@/assets/docker-logo.jpg";
import githubLogo from "@/assets/github-logo.jpg";
import awsLogo from "@/assets/aws-logo.jpg";
import jkCollegeLogo from "@/assets/jk-college-logo.png";
import allenSwamiLogo from "@/assets/allen-swami-logo.jpg";
import tilakGlobalLogo from "@/assets/tilak-global-logo.png";

export interface DatePoint {
  year: number;
  month: number; // 1-12
}

/**
 * Formats a duration in months into a concise, professional LinkedIn-style string
 * Examples: '1 yr 11 mos', '1 yr 9 mos', '2 yrs 8 mos', '2 yrs', '3 yrs', '8 mos', '1 mo'
 */
export function formatLinkedInDuration(totalMonths: number): string {
  if (totalMonths <= 0) return "0 mos";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(years === 1 ? "1 yr" : `${years} yrs`);
  }
  if (months > 0) {
    parts.push(months === 1 ? "1 mo" : `${months} mos`);
  }
  return parts.join(" ");
}

/**
 * Calculates a dynamic, human-readable LinkedIn duration between a start date and an end date.
 * If endDate is omitted or set to 'PRESENT', uses the current system date dynamically.
 * When inclusive = true, both start and end months are included (standard LinkedIn convention).
 */
export function calculateExperienceDuration(
  start?: DatePoint,
  end?: DatePoint | "PRESENT",
  inclusive = true,
): string | null {
  if (!start || !start.year || !start.month) return null;
  const now = new Date();
  const endYear = !end || end === "PRESENT" ? now.getFullYear() : end.year;
  const endMonth = !end || end === "PRESENT" ? now.getMonth() + 1 : end.month;

  let totalMonths = (endYear - start.year) * 12 + (endMonth - start.month);
  if (inclusive) {
    totalMonths += 1;
  }
  if (totalMonths < 0) totalMonths = 0;

  return formatLinkedInDuration(totalMonths);
}

// ============================================================================
// 1. WORK EXPERIENCE
// ============================================================================

export interface Position {
  role: string;
  type: string;
  period: string;
  startDate?: DatePoint;
  endDate?: DatePoint | "PRESENT";
  inclusive?: boolean;
  isCurrent?: boolean;
  bullets: string[];
  skills?: string[];
}

export interface CompanyExperience {
  company: string;
  logo?: string | { url: string };
  url: string;
  location?: string;
  period: string;
  startDate?: DatePoint;
  endDate?: DatePoint | "PRESENT";
  inclusive?: boolean;
  showTotalExperience?: boolean;
  positions: Position[];
}

export const EXPERIENCE_DATA: CompanyExperience[] = [
  {
    company: "Runtime Solutions",
    logo: runtimeLogo,
    url: "https://www.runtime-solutions.com/",
    location: "Andheri West, Maharashtra, India · On-site",
    period: "DEC 2024 — PRESENT",
    startDate: { year: 2024, month: 12 },
    endDate: "PRESENT",
    inclusive: true,
    showTotalExperience: true,
    positions: [
      {
        role: "Junior Cloud Engineer",
        type: "FULL-TIME",
        period: "SEP 2026 — PRESENT",
        startDate: { year: 2026, month: 9 },
        endDate: "PRESENT",
        inclusive: true,
        isCurrent: true,
        bullets: [
          "Administer Google Workspace for the organization: account creation, email configuration, groups, aliases and access permissions.",
          "Own domain registration, DNS records and hosting across five providers (JaguarPC, GoDaddy, ResellerClub, Tasjeel, SiteGround) for multiple client environments, including renewals and ongoing maintenance.",
          "Run Windows patching cycles end to end: apply patches, verify system status, and produce infrastructure and patching reports.",
        ],
        skills: [
          "User Account Management",
          "DNS Management",
          "Google Workspace",
          "Windows Patching",
          "Multi-Provider Hosting",
        ],
      },
      {
        role: "IT Support & Service Management",
        type: "FULL-TIME",
        period: "DEC 2024 — AUG 2026",
        startDate: { year: 2024, month: 12 },
        endDate: { year: 2026, month: 8 },
        inclusive: true,
        bullets: [
          "Manage daily IT service operations across multiple locations, handling ticket tracking, prioritization, and resolution while maintaining proper documentation to ensure timely support delivery and consistent service availability.",
          "Provide day-to-day technical support for hardware, software, network, and system access issues, and maintain IT asset records including device allocation and inventory tracking across teams to improve employee productivity.",
          "Collaborate with internal teams and vendors to resolve technical problems and reduce downtime, contributing to a more reliable and efficient IT environment.",
        ],
        skills: [
          "Service-Level Agreements (SLA)",
          "IT Asset Management (ITAM)",
          "Incident Resolution",
          "Hardware & System Support",
          "Vendor Coordination",
        ],
      },
    ],
  },
  {
    company: "Credence Infotech",
    logo: { url: "/credence-logo.webp" },
    url: "https://www.credenceinfotech.in/",
    location: "Mumbai, Maharashtra, India · On-site",
    period: "FEB 2022 — OCT 2024",
    startDate: { year: 2022, month: 2 },
    endDate: { year: 2024, month: 10 },
    inclusive: true,
    showTotalExperience: true,
    positions: [
      {
        role: "IT Service Management Consultant",
        type: "FULL-TIME",
        period: "FEB 2022 — OCT 2024",
        startDate: { year: 2022, month: 2 },
        endDate: { year: 2024, month: 10 },
        inclusive: true,
        bullets: [
          "Provided operational support for IT infrastructure, service management, and change management processes.",
          "Acted as a coordination point between technical teams and stakeholders to ensure smooth and efficient service delivery.",
          "Monitored service performance and maintained adherence to defined operational standards and client SLAs.",
          "Contributed to process improvement initiatives to enhance service efficiency and overall customer satisfaction.",
          "Provided operational support and consultation to improve IT service quality and system reliability.",
        ],
        skills: [
          "IT Service Management (ITSM)",
          "ITIL Methodologies",
          "Change Management",
          "SLA Adherence",
          "Service Delivery Coordination",
        ],
      },
    ],
  },
];

// ============================================================================
// 2. FEATURED PROJECTS
// ============================================================================

export interface ProjectItem {
  idx: string;
  title: string;
  subtitle: string;
  year: string;
  body: string;
  tech: string[];
  link: { label: string; href: string } | null;
  repo: { label: string; href: string } | null;
}

export const PROJECTS: ProjectItem[] = [
  {
    idx: "01",
    title: "DevOps CI/CD Pipeline",
    subtitle: "AWS · Nginx · Cloudflare · GitHub Actions",
    year: "2025",
    body: "Designed and implemented an automated CI/CD pipeline using GitHub Actions to orchestrate zero-downtime deployment. Deployed on AWS EC2 (Ubuntu), configured Nginx reverse proxy with SSL, routed domains via Cloudflare CDN edge, and hardened email delivery with SPF, DKIM, and DMARC.",
    tech: ["CI/CD", "AWS EC2", "Nginx", "Cloudflare", "GitHub Actions", "SSH Auth"],
    link: { label: "kamleshprasad.com", href: "https://kamleshprasad.com" },
    repo: {
      label: "github.com/ppiyushhhhh/Kamlesh-Prasad",
      href: "https://github.com/ppiyushhhhh/Kamlesh-Prasad",
    },
  },
  {
    idx: "02",
    title: "Production AWS EC2 + DevSecOps",
    subtitle: "Monitoring · Security · Prometheus · Grafana",
    year: "2026",
    body: "Architected a production-grade infrastructure stack on AWS EC2 with automated HTTPS via Certbot SSL. Implemented server hardening with UFW Firewall, rate limiting, and DDoS defense. Built a real-time observability telemetry stack with Prometheus, Grafana, Node Exporter, and automated Trivy vulnerability scanning.",
    tech: ["Prometheus", "Grafana", "Node Exporter", "Trivy", "UFW", "Certbot"],
    link: null,
    repo: {
      label: "github.com/ppiyushhhhh/onixmall",
      href: "https://github.com/ppiyushhhhh/onixmall",
    },
  },
  {
    idx: "03",
    title: "CloudOps Sentinel",
    subtitle: "React · Node.js · SQLite · Nginx · PM2",
    year: "2026",
    body: "Full-stack DevOps monitoring and operations dashboard deployed on AWS EC2 behind a role-gated login. Delivers real-time server cluster metrics, Docker container fleet status, CI/CD deployment tracking, Trivy vulnerability monitoring, incident alerting, and scheduled automated SQLite backups.",
    tech: ["React", "Node.js", "Express", "SQLite", "PM2", "Nginx", "Trivy", "GitHub Actions"],
    link: null,
    repo: {
      label: "github.com/ppiyushhhhh/sentinel-cloud-view",
      href: "https://github.com/ppiyushhhhh/sentinel-cloud-view",
    },
  },
  {
    idx: "04",
    title: "CloudOps Observability Platform",
    subtitle: "TanStack Start · Supabase · PostgreSQL · DevSecOps",
    year: "2026",
    body: "Engineered an enterprise-grade private cloud observability and database administration console (PP·OPS) monitoring live production endpoints. Features native TLS 1.3 socket inspection, distributed multi-tier rate limiting with atomic PostgreSQL row-level locks, automated 7-day database retention with pre-deletion SQL archives, and executive health auditing.",
    tech: ["TanStack Start", "React 19", "Supabase", "PostgreSQL", "Rate Limiter", "TLS 1.3"],
    link: { label: "piyushprasad.in/dashboard", href: "/dashboard" },
    repo: {
      label: "github.com/ppiyushhhhh/piyush-prasad",
      href: "https://github.com/ppiyushhhhh/piyush-prasad",
    },
  },
];

// ============================================================================
// 3. TECHNICAL SKILLS & PRIORITY STACKS
// ============================================================================

export interface PriorityTech {
  name: string;
  category: string;
  detail: string;
}

export const PRIORITY_TECHS: PriorityTech[] = [
  { name: "AWS", category: "Cloud Infrastructure", detail: "EC2 · S3 · IAM · Networking" },
  { name: "Linux", category: "Operating System", detail: "Ubuntu LTS · CLI · Administration" },
  { name: "Docker", category: "Containers", detail: "Containerization · Isolation" },
  { name: "Kubernetes", category: "Orchestration", detail: "Workloads · Deployments" },
  { name: "GitHub Actions", category: "CI/CD Automation", detail: "Automated Workflows · Runners" },
  { name: "Nginx", category: "Web & Reverse Proxy", detail: "Reverse Proxy · SSL Termination" },
  { name: "MySQL", category: "Relational Database", detail: "Data Persistence · Queries" },
  {
    name: "Prometheus",
    category: "Metrics Collection",
    detail: "Time-Series TSDB · Node Exporter",
  },
  { name: "Grafana", category: "Observability", detail: "Dashboards · Alerting" },
  { name: "Terraform", category: "IaC", detail: "Infrastructure as Code" },
  { name: "Git", category: "Version Control", detail: "Branching · SSH Keys · VCS" },
  { name: "Trivy", category: "DevSecOps", detail: "Vulnerability & Secret Scans" },
];

export interface SkillCategoryData {
  label: string;
  tags: string[];
}

export const SKILL_CATEGORIES_DATA: SkillCategoryData[] = [
  {
    label: "Cloud & Infrastructure",
    tags: ["AWS EC2", "AWS S3", "AWS IAM", "Cloudflare", "DNS Routing"],
  },
  {
    label: "Operating Systems & Linux",
    tags: ["Linux (Ubuntu)", "Server Administration", "Bash Scripting", "Systemd Services"],
  },
  {
    label: "Containers & Orchestration",
    tags: ["Docker", "Docker Compose", "Kubernetes", "Container Hardening"],
  },
  {
    label: "CI/CD & Version Control",
    tags: ["GitHub Actions", "Pipeline Automation", "Continuous Deployment", "SSH Auth", "Git"],
  },
  {
    label: "Web Servers & Reverse Proxy",
    tags: ["Nginx", "Reverse Proxy", "Load Balancing", "PM2 Process Manager"],
  },
  {
    label: "Observability & Metrics",
    tags: ["Prometheus", "Grafana", "Node Exporter", "Server Health Telemetry"],
  },
  {
    label: "Security & DevSecOps",
    tags: [
      "Trivy Vulnerability Scan",
      "UFW Firewall",
      "Certbot SSL/HTTPS",
      "Rate Limiting",
      "DKIM/SPF/DMARC",
    ],
  },
  {
    label: "Databases & Runtimes",
    tags: ["MySQL", "SQLite", "Node.js", "Express"],
  },
  {
    label: "ITSM & Operations",
    tags: [
      "ManageEngine ServiceDesk Plus",
      "ITIL Practices",
      "SLA Management",
      "Incident Management",
    ],
  },
];

// ============================================================================
// 4. ACADEMIC EDUCATION & COURSE CERTIFICATES
// ============================================================================

export interface CertItem {
  name: string;
  issuer: string;
  url?: string;
  logo?: string;
}

export const CERTS_DATA: CertItem[] = [
  {
    name: "Foundation Course on AI Readiness — Google & YouTube",
    issuer: "Ministry of Information and Broadcasting",
    logo: mibLogo,
    url: "/certificates/ai-readiness.pdf",
  },
  {
    name: "DevOps Complete Course Specialization",
    issuer: "Packt (Coursera)",
    url: "https://www.coursera.org/account/accomplishments/specialization/592LMXYN7KZK",
    logo: packtLogo,
  },
  {
    name: "Google AI Essentials Specialization",
    issuer: "Google (Coursera)",
    logo: googleLogo,
    url: "https://www.coursera.org/account/accomplishments/specialization/EZS8GLRIG535",
  },
  {
    name: "Ubuntu Linux Professional Certificate",
    issuer: "Canonical",
    logo: canonicalLogo,
    url: "https://www.linkedin.com/learning/certificates/9d7f2b805f126a9612c6b1be485f14f90d4362bb9f0c6875bcb7702bc1274dbf",
  },
  {
    name: "Docker Foundations Professional Certificate",
    issuer: "Docker, Inc",
    logo: dockerLogo,
    url: "https://www.linkedin.com/learning/certificates/3f8f006fe458d2f993ddba0bd0f3c357f3caf92a5e15bad0718a01e1709241e0",
  },
  {
    name: "Career Essentials in GitHub Professional Certificate",
    issuer: "GitHub",
    logo: githubLogo,
    url: "https://www.linkedin.com/learning/certificates/9a7cce8c73b57d5e8629e5ac94a454a78c5fda6957c901ca4854a7c93e13a3e7",
  },
  {
    name: "AWS Knowledge: Cloud Essentials — Training Badge",
    issuer: "Amazon Web Services",
    logo: awsLogo,
    url: "https://www.credly.com/badges/1d7245e6-ebba-4b7b-970f-ad1d214a1c91/linked_in_profile",
  },
  {
    name: "DNS",
    issuer: "Packt",
    logo: packtLogo,
    url: "https://www.coursera.org/account/accomplishments/verify/JJJLW2JGJZBS",
  },
];

export interface EducationItem {
  period: string;
  degree: string;
  school: string;
  extra: string;
  logo?: string;
}

export const EDUCATION_DATA: EducationItem[] = [
  {
    period: "Jan 2022 — Mar 2025",
    degree: "Bachelor of Commerce (B.Com)",
    school: "Tilak Education Society's J.K. College of Science & Commerce",
    extra: "University of Mumbai",
    logo: jkCollegeLogo,
  },
  {
    period: "Aug 2019 — Jun 2021",
    degree: "Higher Secondary (Commerce)",
    school: "Allen Swami Vivekanand Junior College",
    extra: "MSSBHS",
    logo: allenSwamiLogo,
  },
  {
    period: "Jun 2008 — Mar 2019",
    degree: "Secondary School",
    school: "Tilak Education Society's Tilak Global School",
    extra: "MSSBHS",
    logo: tilakGlobalLogo,
  },
];
