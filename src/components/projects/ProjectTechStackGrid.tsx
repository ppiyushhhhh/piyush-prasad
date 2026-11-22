import { Layers } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { resolveLogo } from "@/lib/tech-logo-registry";
import { CaseStudySectionHeader } from "./CaseStudySectionHeader";

interface ProjectTechStackGridProps {
  project: PortfolioProject;
}

const TECH_CATEGORY_MAP: Record<string, string> = {
  "Next.js": "Frontend Framework",
  "React 19": "UI Component Library",
  "React": "UI Component Library",
  "TanStack Start": "Full-Stack Web Framework",
  "TanStack Router": "Type-Safe Routing",
  "TypeScript": "Type-Safe Programming",
  "Tailwind CSS": "Utility-First CSS",
  "Supabase": "Relational Database / BaaS",
  "PostgreSQL": "Relational Database",
  "Google Gemini": "Multimodal AI Inference",
  "Google Gemini AI API": "Multimodal AI Inference",
  "Gemini API": "Multimodal AI Inference",
  "Gemini 1.5 Flash": "Low-Latency AI Model",
  "Vercel": "Edge Serverless Platform",
  "Cloudflare": "Anycast DNS & CDN",
  "Cloudflare DNS": "Authoritative DNS & DNSSEC",
  "Cloudflare CDN": "Global Edge CDN Caching",
  "Cloudflare Workers": "Serverless Edge Workers",
  "AWS EC2": "Cloud Compute Instance",
  "AWS S3": "Object Storage",
  "Docker": "Container Engine",
  "Docker Compose": "Multi-Container Orchestration",
  "Kubernetes": "Container Orchestration",
  "GitHub Actions": "CI/CD Automation",
  "Terraform": "Infrastructure as Code",
  "Python": "Automation Language",
  "Node.js": "JavaScript Runtime",
  "Bash": "Shell Automation",
  "Bash / Shell": "Shell Scripting & Hardening",
  "Shell Scripting": "Shell Automation",
  "Linux Hardening": "CIS OS Hardening",
  "Nginx": "Reverse Proxy & Load Balancer",
  "Nginx Reverse Proxy": "Reverse Proxy & SSL Ingress",
  "Redis": "In-Memory Cache",
  "Resend": "Transactional Email API",
  "Nodemailer": "SMTP Relay Client",
  "Web3Forms": "Form Submission API",
  "Credly API": "Digital Credential API",
  "Let's Encrypt": "Automated TLS Certificates",
  "Let's Encrypt SSL": "Automated TLS Certificates",
  "SSL / TLS": "Transport Layer Security",
  "Certbot SSL": "Automated SSL Renewal",
  "Git Hooks": "Pre-Commit Code Quality",
  "Trivy": "Vulnerability Scanner",
  "Trivy Vulnerability Scanner": "Container & OS CVE Scanner",
  "SonarQube": "Static Code Analysis",
  "OWASP ZAP": "Dynamic Security Testing",
  "GitLab CI": "DevOps Pipeline",
  "Prometheus": "Time-Series Monitoring",
  "Grafana": "Observability Dashboard",
  "Node Exporter": "Host Hardware Metrics",
  "UFW Firewall": "Host Firewall Isolation",
  "SSH Key Auth": "Public-Key Authentication",
  "Ubuntu 24.04 LTS": "Hardened Linux OS",
  "SPF / DKIM / DMARC": "Email Deliverability Security",
};

export function getTechCategory(tech: string): string {
  if (TECH_CATEGORY_MAP[tech]) return TECH_CATEGORY_MAP[tech];
  const lower = tech.toLowerCase();
  for (const [key, val] of Object.entries(TECH_CATEGORY_MAP)) {
    if (lower.includes(key.toLowerCase())) return val;
  }
  return "Cloud & DevOps Stack";
}

export function ProjectTechStackGrid({ project }: ProjectTechStackGridProps) {
  if (!project.technologies || project.technologies.length === 0) return null;

  const count = project.technologies.length;
  // If count is 9 or divisible by 3 on desktop, use 3 columns; otherwise 4 columns
  const gridCols =
    count === 9 || count === 6 || count === 3
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section id="technologies" className="space-y-4 scroll-mt-24">
      <CaseStudySectionHeader
        label="06 / TECH STACK"
        title="Technologies &amp; Cloud Services"
      />

      <div className={`${gridCols} gap-3.5`}>
        {project.technologies.map((tech) => {
          const logo = resolveLogo(tech);
          const category = getTechCategory(tech);

          return (
            <div
              key={tech}
              className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt/50 transition-colors h-full"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-800 p-2 shadow-2xs">
                {logo ? (
                  <img
                    src={logo.src}
                    alt={logo.label}
                    className="h-full w-full object-contain pointer-events-none"
                    loading="lazy"
                  />
                ) : (
                  <Layers className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-carbon dark:text-white block truncate">
                  {tech}
                </span>
                <span className="mono text-[10px] text-muted-foreground block truncate mt-0.5">
                  {category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
