import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import {
  ArrowUpRight,
  Github,
  ExternalLink,
  Maximize2,
  Terminal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import cicdPipelineImg from "@/assets/projects/cicd-pipeline-pro.jpg";
import devsecopsImg from "@/assets/projects/devsecops-monitoring-pro.jpg";
import cloudopsSentinelImg from "@/assets/projects/cloudops-sentinel-pro.jpg";
import cloudopsObservabilityImg from "@/assets/projects/cloudops-observability-pro.jpg";

export interface ProjectItem {
  idx: string;
  title: string;
  subtitle: string;
  year: string;
  body: string;
  tech: string[];
  link: { label: string; href: string } | null;
  repo: { label: string; href: string } | null;
  image: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    idx: "01",
    title: "DevOps CI/CD Pipeline",
    subtitle: "AWS · Nginx · Cloudflare · GitHub Actions",
    year: "2025",
    image: cicdPipelineImg,
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
    image: devsecopsImg,
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
    image: cloudopsSentinelImg,
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
    image: cloudopsObservabilityImg,
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
      className="group/img relative w-full cursor-zoom-in overflow-hidden rounded-lg border border-white/10 bg-[#12141A] shadow-xl transition-all duration-300 hover:border-cobalt/50 hover:shadow-[0_12px_32px_-8px_rgba(26,75,255,0.25)] focus:outline-hidden focus:ring-2 focus:ring-cobalt/50"
      title="Click to view high-resolution preview"
    >
      {/* Sleek Browser/Console Shell Header */}
      <div className="flex h-8 items-center justify-between border-b border-white/10 bg-[#161821] px-3">
        {/* Terminal Window Controls */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/80 inline-block" />
        </div>

        {/* Monospace Path Bar */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#0F1015] border border-white/5 text-[10px] font-mono text-white/70">
          <Terminal className="h-2.5 w-2.5 text-cobalt" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            spec://{project.idx}·{project.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}
          </span>
        </div>

        {/* Preview Status Pill */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">LIVE</span>
        </div>
      </div>

      {/* High-Resolution Screenshot Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0A0B0E]">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover/img:scale-[1.03]"
        />

        {/* Ambient Subtle Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 transition-opacity duration-300 group-hover/img:opacity-20" />

        {/* Interactive Hover Zoom Pill */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xs border border-white/25 bg-carbon/90 px-2.5 py-1 text-[11px] font-mono text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover/img:opacity-100 shadow-md">
          <Maximize2 className="h-3 w-3 text-cobalt" />
          <span>Inspect Fullscreen</span>
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
        <div className="relative mx-auto mt-12 sm:mt-16 max-w-5xl xl:max-w-6xl">
          {PROJECTS.map((project, i) => {
            const isLast = i === PROJECTS.length - 1;
            // z-index increments with each card so subsequent cards cleanly overlap previous ones
            const zIndex = (i + 1) * 10;

            return (
              <div
                key={project.idx}
                className="sticky transition-all duration-300 ease-out"
                style={{
                  // The offset increment matches the tab strip height exactly, ensuring zero text clipping
                  top: `calc(var(--stack-base-top, 4.75rem) + (${i} * var(--stack-step, 46px)))`,
                  zIndex,
                  // Margin bottom provides scroll travel for each card to stack before scrolling continues
                  marginBottom: isLast ? "0px" : "clamp(160px, 28vh, 320px)",
                }}
              >
                <motion.article
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-white shadow-[0_12px_36px_-6px_rgba(18,19,22,0.08),0_2px_8px_-2px_rgba(18,19,22,0.04)] transition-all duration-300 hover:border-cobalt/60 hover:shadow-[0_20px_50px_-10px_rgba(26,75,255,0.12),0_4px_16px_-4px_rgba(18,19,22,0.06)]"
                >
                  {/* Top Indexed Tab Strip (Fixed height ensures exact matching with stacking step offset) */}
                  <div className="flex h-[38px] md:h-[46px] items-center justify-between border-b border-border bg-[#FAF9F6] px-4 sm:px-6 transition-colors group-hover:bg-[#F5F4EE]">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="mono font-bold text-cobalt tracking-wider text-[11px] sm:text-xs shrink-0">
                        PROJECT // {project.idx}
                      </span>
                      <span className="text-border shrink-0">|</span>
                      <span className="mono text-[10px] sm:text-[11px] font-semibold text-carbon/85 uppercase tracking-wide truncate">
                        {project.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                      <span className="mono text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                        {project.year}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>

                  {/* Main Card Body (Equal-height split layout: Left Details / Right Visual) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[440px] sm:min-h-[460px] lg:min-h-[480px]">
                    {/* Left Column: Details & Actions */}
                    <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between p-6 sm:p-7 md:p-8 bg-white">
                      <div>
                        {/* Meta Category Eyebrow */}
                        <div className="mono text-[11px] text-cobalt font-semibold uppercase tracking-wider">
                          {project.subtitle}
                        </div>

                        {/* Title */}
                        <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-carbon group-hover:text-cobalt transition-colors">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-carbon/80">
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
                      <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-border pt-4">
                        {project.link && (
                          <a
                            href={project.link.href}
                            target={project.link.href.startsWith("http") ? "_blank" : undefined}
                            rel={project.link.href.startsWith("http") ? "noreferrer" : undefined}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cobalt hover:underline"
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
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-carbon/75 hover:text-cobalt transition-colors"
                          >
                            <Github className="h-3.5 w-3.5" />
                            <span className="truncate">{project.repo.label}</span>
                            <ArrowUpRight className="h-3 w-3 shrink-0 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Architectural Visual / Image Preview Console */}
                    <div className="lg:col-span-6 xl:col-span-6 border-t lg:border-t-0 lg:border-l border-border bg-[#0E1015] p-4 sm:p-6 lg:p-7 flex flex-col justify-center items-center overflow-hidden">
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
