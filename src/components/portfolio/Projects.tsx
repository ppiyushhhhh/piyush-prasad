import { SectionHeader } from "./SectionHeader";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";

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
    body:
      "Designed and implemented an automated CI/CD pipeline using GitHub Actions to orchestrate zero-downtime deployment. Deployed on AWS EC2 (Ubuntu), configured Nginx reverse proxy with SSL, routed domains via Cloudflare CDN edge, and hardened email delivery with SPF, DKIM, and DMARC.",
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
    body:
      "Architected a production-grade infrastructure stack on AWS EC2 with automated HTTPS via Certbot SSL. Implemented server hardening with UFW Firewall, rate limiting, and DDoS defense. Built a real-time observability telemetry stack with Prometheus, Grafana, Node Exporter, and automated Trivy vulnerability scanning.",
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
    body:
      "Full-stack DevOps monitoring and operations dashboard deployed on AWS EC2 behind a role-gated login. Delivers real-time server cluster metrics, Docker container fleet status, CI/CD deployment tracking, Trivy vulnerability monitoring, incident alerting, and scheduled automated SQLite backups.",
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
    body:
      "Engineered an enterprise-grade private cloud observability and database administration console (PP·OPS) monitoring live production endpoints. Features native TLS 1.3 socket inspection, distributed multi-tier rate limiting with atomic PostgreSQL row-level locks, automated 7-day database retention with pre-deletion SQL archives, and executive health auditing.",
    tech: ["TanStack Start", "React 19", "Supabase", "PostgreSQL", "Rate Limiter", "TLS 1.3"],
    link: { label: "piyushprasad.in/dashboard", href: "/dashboard" },
    repo: {
      label: "github.com/ppiyushhhhh/piyush-prasad",
      href: "https://github.com/ppiyushhhhh/piyush-prasad",
    },
  },
];

export function Projects() {
  return (
    <section id="projects" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10">
        <SectionHeader
          n="01"
          label="FEATURED PROJECTS & EXPERTISE"
          title="Things I've Built"
          description="Production systems and deployment pipelines engineered for high availability, automated continuous integration, and proactive observability."
        />

        {/* Sticky Stacking Cards Container */}
        <div className="relative mx-auto mt-12 sm:mt-16 max-w-4xl lg:max-w-5xl">
          {PROJECTS.map((project, i) => {
            const isLast = i === PROJECTS.length - 1;
            // z-index increments with each card so subsequent cards cleanly overlap previous ones
            const zIndex = (i + 1) * 10;

            return (
              <div
                key={project.idx}
                className="sticky transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{
                  top: "var(--stack-base-top, 5.25rem)",
                  zIndex,
                  // Margin bottom provides scroll travel for each card to be read before the next slides over
                  marginBottom: isLast ? "0px" : "clamp(260px, 38vh, 420px)",
                }}
              >
                <article className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-white shadow-[0_12px_36px_-6px_rgba(18,19,22,0.08),0_2px_8px_-2px_rgba(18,19,22,0.04)] transition-all duration-300 hover:border-cobalt/60 hover:shadow-[0_20px_50px_-10px_rgba(26,75,255,0.12),0_4px_16px_-4px_rgba(18,19,22,0.06)]">
                  {/* Top Indexed Tab Strip Header */}
                  <div className="flex h-[42px] sm:h-[48px] items-center justify-between border-b border-border bg-[#FAF9F6] px-5 sm:px-7 rounded-t-xl sm:rounded-t-2xl transition-colors group-hover:bg-[#F5F4EE]">
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <span className="mono font-bold text-cobalt tracking-wider text-[11px] sm:text-xs shrink-0">
                        PROJECT // {project.idx}
                      </span>
                      <span className="text-border shrink-0 select-none">|</span>
                      <span className="mono text-[10px] sm:text-[11px] font-semibold text-carbon/85 uppercase tracking-wide truncate">
                        {project.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                      <span className="mono text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                        {project.year}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Production System" />
                    </div>
                  </div>

                  {/* Main Card Content (Full-Width Presentation) */}
                  <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10 min-h-[380px] sm:min-h-[360px] md:min-h-[370px] bg-white rounded-b-xl sm:rounded-b-2xl">
                    <div>
                      {/* Meta Category Eyebrow */}
                      <div className="mono text-[11px] sm:text-xs text-cobalt font-semibold uppercase tracking-wider">
                        {project.subtitle}
                      </div>

                      {/* Title */}
                      <h3 className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-carbon group-hover:text-cobalt transition-colors">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-4 text-sm sm:text-base leading-relaxed text-carbon/80 max-w-4xl">
                        {project.body}
                      </p>

                      {/* Tech Stack Badges */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="mono border border-border bg-[#FAF9F6] px-3 py-1.5 text-[10px] sm:text-xs text-carbon/85 transition-colors group-hover:border-border/80 rounded-xs"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Action Links */}
                    <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-5">
                      {project.link && (
                        <a
                          href={project.link.href}
                          target={project.link.href.startsWith("http") ? "_blank" : undefined}
                          rel={project.link.href.startsWith("http") ? "noreferrer" : undefined}
                          className="inline-flex items-center gap-2 rounded-md bg-cobalt px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-cobalt/90 hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-cobalt/50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Visit Live ({project.link.label})</span>
                        </a>
                      )}

                      {project.repo && (
                        <a
                          href={project.repo.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-md border border-border bg-[#FAF9F6] px-4 py-2.5 text-xs sm:text-sm font-mono text-carbon/80 transition-all hover:border-cobalt/50 hover:bg-white hover:text-cobalt focus:outline-hidden focus:ring-2 focus:ring-cobalt/50"
                        >
                          <Github className="h-4 w-4" />
                          <span className="truncate">{project.repo.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
