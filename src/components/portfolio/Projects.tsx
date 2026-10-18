import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import {
  ArrowUpRight,
  Github,
  ExternalLink,
  Maximize2,
  ShieldCheck,
  Terminal,
  Server,
  Layers,
  Database,
  Globe,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import cicdPipelineImg from "@/assets/projects/cicd-pipeline.jpg";
import devsecopsImg from "@/assets/projects/devsecops-monitoring.jpg";
import cloudopsSentinelImg from "@/assets/projects/cloudops-sentinel.jpg";

export interface ProjectItem {
  idx: string;
  title: string;
  subtitle: string;
  year: string;
  body: string;
  tech: string[];
  link: { label: string; href: string } | null;
  repo: { label: string; href: string } | null;
  image?: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    idx: "01",
    title: "DevOps CI/CD Pipeline",
    subtitle: "AWS · Nginx · Cloudflare · GitHub Actions",
    year: "2025",
    image: cicdPipelineImg,
    body:
      "Designed and implemented a full CI/CD pipeline using GitHub Actions to automate deployment of a React application. Deployed on AWS EC2 (Ubuntu), configured Nginx as a reverse proxy. Managed domain routing with Cloudflare and implemented secure domain-based email via SPF, DKIM, and DMARC.",
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
    image: devsecopsImg,
    body:
      "Deployed a production-grade React + Node.js application on AWS EC2 using Nginx reverse proxy with HTTPS via Certbot SSL. Implemented server hardening: UFW Firewall, rate limiting, and DDoS protection. Built a full monitoring stack with Prometheus, Grafana, and Node Exporter. Integrated Trivy vulnerability scanning in CI/CD.",
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
    image: cloudopsSentinelImg,
    body:
      "Full-stack DevOps monitoring and operations dashboard deployed on AWS EC2 behind a login gate. Delivers live server metrics, Docker status, CI/CD deployment tracking, Trivy vulnerability monitoring, incident and alert management, activity logs, and automated PDF reporting. Backed by SQLite persistence with scheduled cron backups, served via Nginx reverse proxy with PM2 process management and GitHub Actions CI/CD.",
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

function ProjectVisual({
  project,
  onOpenPreview,
}: {
  project: ProjectItem;
  onOpenPreview: (project: ProjectItem) => void;
}) {
  if (project.image) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenPreview(project)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenPreview(project);
          }
        }}
        className="group/img relative h-64 sm:h-72 lg:h-full min-h-[220px] w-full cursor-zoom-in overflow-hidden bg-[#14151a] focus:outline-hidden focus:ring-2 focus:ring-cobalt/50"
        title="Click to view full preview"
      >
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover/img:scale-105"
        />

        {/* Ambient subtle vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover/img:opacity-40" />

        {/* Floating Spec Tags */}
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-xs border border-white/20 bg-carbon/80 px-2 py-0.5 text-[10px] font-mono font-medium text-white backdrop-blur-xs shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SPEC // {project.idx}</span>
        </div>

        <div className="pointer-events-none absolute top-3 right-3 rounded-xs border border-white/20 bg-carbon/80 px-2 py-0.5 text-[9px] font-mono text-white/90 backdrop-blur-xs shadow-xs">
          {project.year}
        </div>

        {/* Hover zoom indicator */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xs border border-white/25 bg-carbon/85 px-2.5 py-1 text-[11px] font-mono text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover/img:opacity-100 shadow-md">
          <Maximize2 className="h-3 w-3 text-cobalt" />
          <span>Preview</span>
        </div>
      </div>
    );
  }

  // Editorial Architectural Schematic Visual
  return (
    <div className="relative h-64 sm:h-72 lg:h-full min-h-[220px] w-full overflow-hidden bg-[#F5F4EE] p-5 sm:p-6 transition-colors duration-300 group-hover:bg-[#F2F1EA] flex flex-col justify-between">
      {/* Schematic Grid Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#121316 1px, transparent 1px), linear-gradient(90deg, #121316 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex h-full flex-col justify-between">
        {/* Top Header of Schematic */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] font-bold text-cobalt tracking-wider">
              SPEC // ARCHITECTURE
            </span>
            <span className="text-border">|</span>
            <span className="mono text-[9px] text-muted-foreground uppercase">
              {project.idx} · {project.year}
            </span>
          </div>
          <div className="mono text-[9px] rounded-xs border border-border bg-white px-2 py-0.5 text-carbon/70 font-medium">
            LIVE INFRA
          </div>
        </div>

        {/* Center Architectural Node Flow */}
        <div className="my-auto py-2">
          {project.idx === "01" && (
            <div className="flex items-center justify-between gap-1 sm:gap-2 text-center text-xs">
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">VCS</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">GitHub Actions</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">HOST</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">AWS EC2</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">PROXY</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">Nginx + SSL</div>
              </div>
            </div>
          )}

          {project.idx === "02" && (
            <div className="flex items-center justify-between gap-1 sm:gap-2 text-center text-xs">
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">SECURITY</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">Trivy + UFW</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">METRICS</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">Prometheus</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">DASHBOARD</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">Grafana</div>
              </div>
            </div>
          )}

          {project.idx === "03" && (
            <div className="flex items-center justify-between gap-1 sm:gap-2 text-center text-xs">
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">CORE</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">Sentinel React</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">DAEMON</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">Node.js / PM2</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">STORAGE</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">SQLite Cron</div>
              </div>
            </div>
          )}

          {project.idx === "04" && (
            <div className="flex items-center justify-between gap-1 sm:gap-2 text-center text-xs">
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">EDGE</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">Anycast CDN</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">ENGINE</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">TanStack SSR</div>
              </div>
              <span className="mono text-cobalt text-[10px]">→</span>
              <div className="flex-1 rounded border border-border bg-white p-2 shadow-2xs transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="mono text-[9px] text-muted-foreground">CLUSTER</div>
                <div className="font-semibold text-carbon text-[11px] sm:text-xs">PostgreSQL RLS</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Technical Status Line */}
        <div className="flex items-center justify-between text-[10px] text-carbon/60 border-t border-border/70 pt-2 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Infrastructure Verified
          </span>
          <span className="text-cobalt font-medium">Production Stack</span>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const shouldReduceMotion = useReducedMotion();
  const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);

  return (
    <section id="projects" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="01"
          label="FEATURED PROJECTS & EXPERTISE"
          title="Things I've Built"
          description="Production systems and deployment pipelines engineered for high availability, automated continuous integration, and proactive observability."
        />

        {/* Sticky Stacking Cards Container */}
        <div className="relative mx-auto mt-12 sm:mt-16 max-w-5xl">
          {PROJECTS.map((project, i) => {
            const isLast = i === PROJECTS.length - 1;
            // z-index increments with each card so that subsequent cards slide cleanly OVER previous ones
            const zIndex = (i + 1) * 10;

            return (
              <div
                key={project.idx}
                className="sticky transition-all duration-300 ease-out"
                style={{
                  // Responsive sticky top offset: staggered so earlier cards' top index strips peek out neatly
                  // Mobile: 4.25rem (~68px) + i * 20px
                  // Desktop: 5.25rem (~84px) + i * 28px
                  top: `calc(var(--stack-base-top, 5.25rem) + ${i * 28}px)`,
                  zIndex,
                  // Margin bottom provides scroll travel for each card to slide upward before the next stacks
                  marginBottom: isLast ? "0px" : "clamp(140px, 26vh, 280px)",
                }}
              >
                <motion.article
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-white shadow-[0_12px_36px_-6px_rgba(18,19,22,0.08),0_2px_8px_-2px_rgba(18,19,22,0.04)] transition-all duration-300 hover:border-cobalt/60 hover:shadow-[0_20px_50px_-10px_rgba(26,75,255,0.12),0_4px_16px_-4px_rgba(18,19,22,0.06)]"
                >
                  {/* Top Indexed Tab Strip (Peeks out when cards stack on top) */}
                  <div className="flex items-center justify-between border-b border-border bg-[#FAF9F6] px-5 py-2.5 sm:px-7 sm:py-3 transition-colors group-hover:bg-[#F6F5EE]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="mono font-bold text-cobalt tracking-wider text-[11px] shrink-0">
                        PROJECT // {project.idx}
                      </span>
                      <span className="text-border shrink-0">|</span>
                      <span className="mono text-[10px] font-semibold text-carbon/80 uppercase tracking-wide truncate">
                        {project.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                      <span className="mono text-[10px] text-muted-foreground font-medium">
                        {project.year}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>

                  {/* Main Card Body (Split layout: Left Details / Right Visual) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0">
                    {/* Left Column: Details & Actions */}
                    <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 md:p-8">
                      <div>
                        {/* Meta Category Eyebrow */}
                        <div className="mono text-[11px] text-cobalt font-medium uppercase tracking-wider">
                          {project.subtitle}
                        </div>

                        {/* Title */}
                        <h3 className="mt-2 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-carbon group-hover:text-cobalt transition-colors">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="mt-4 text-sm sm:text-base leading-relaxed text-carbon/80">
                          {project.body}
                        </p>

                        {/* Tech Stack Badges */}
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="mono border border-border bg-[#FAF9F6] px-2.5 py-1 text-[10px] text-carbon/80 transition-colors group-hover:border-border/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Action Links */}
                      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-4">
                        {project.link && (
                          <a
                            href={project.link.href}
                            target={project.link.href.startsWith("http") ? "_blank" : undefined}
                            rel={project.link.href.startsWith("http") ? "noreferrer" : undefined}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-cobalt hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Visit Live ({project.link.label})</span>
                          </a>
                        )}

                        {project.repo && (
                          <a
                            href={project.repo.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-mono text-carbon/75 hover:text-cobalt transition-colors"
                          >
                            <Github className="h-3.5 w-3.5" />
                            <span className="truncate">{project.repo.label}</span>
                            <ArrowUpRight className="h-3 w-3 shrink-0 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Architectural Visual / Image Preview */}
                    <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-border bg-[#F5F4EE] flex flex-col justify-center overflow-hidden">
                      <ProjectVisual project={project} onOpenPreview={setPreviewProject} />
                    </div>
                  </div>
                </motion.article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Image Preview Lightbox Dialog */}
      <Dialog open={!!previewProject} onOpenChange={(open) => !open && setPreviewProject(null)}>
        {previewProject && (
          <DialogContent className="max-w-4xl p-0 overflow-hidden border-border bg-white sm:rounded-lg">
            {previewProject.image && (
              <div className="relative aspect-[16/9] w-full bg-[#121316] overflow-hidden border-b border-border">
                <img
                  src={previewProject.image}
                  alt={previewProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mono text-xs text-cobalt font-bold">
                  <span>PROJECT // {previewProject.idx}</span>
                  <span className="text-border">·</span>
                  <span className="text-muted-foreground">{previewProject.year}</span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-carbon">
                  {previewProject.title}
                </DialogTitle>
                <DialogDescription className="mono text-xs text-muted-foreground">
                  {previewProject.subtitle}
                </DialogDescription>
              </DialogHeader>

              <p className="mt-4 text-sm leading-relaxed text-carbon/80">
                {previewProject.body}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {previewProject.tech.map((t) => (
                  <span
                    key={t}
                    className="mono border border-border bg-[#FAF9F6] px-2.5 py-1 text-[10px] text-carbon/80"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {(previewProject.link || previewProject.repo) && (
                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4">
                  {previewProject.link && (
                    <a
                      href={previewProject.link.href}
                      target={previewProject.link.href.startsWith("http") ? "_blank" : undefined}
                      rel={previewProject.link.href.startsWith("http") ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cobalt hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Visit Live ({previewProject.link.label})</span>
                    </a>
                  )}
                  {previewProject.repo && (
                    <a
                      href={previewProject.repo.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-mono text-carbon/80 hover:text-cobalt"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>{previewProject.repo.label}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
