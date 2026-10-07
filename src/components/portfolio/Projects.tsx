import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { ArrowUpRight, Github, ExternalLink, ShieldCheck, Terminal, Server, Layers } from "lucide-react";

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
    body:
      "Full-stack DevOps monitoring and operations dashboard deployed on AWS EC2 behind a login gate. Delivers live server metrics, Docker status, CI/CD deployment tracking, Trivy vulnerability monitoring, incident and alert management, activity logs, and automated PDF reporting. Backed by SQLite persistence with scheduled cron backups, served via Nginx reverse proxy with PM2 process management and GitHub Actions CI/CD.",
    tech: ["React", "Node.js", "Express", "SQLite", "PM2", "Nginx", "Trivy", "GitHub Actions"],
    link: null,
    repo: {
      label: "github.com/ppiyushhhhh/sentinel-cloud-view",
      href: "https://github.com/ppiyushhhhh/sentinel-cloud-view",
    },
  },
];

function ProjectVisual({ project }: { project: ProjectItem }) {
  if (project.image) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-[#F3F3ED]">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
        />
      </div>
    );
  }

  // Editorial Architectural Schematic Visual
  return (
    <div className="relative aspect-[16/8.5] w-full overflow-hidden border-b border-border bg-[#F5F4EE] p-5 sm:p-6 transition-colors duration-300 group-hover:bg-[#F2F1EA]">
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
        </div>

        {/* Bottom Technical Status Line */}
        <div className="flex items-center justify-between text-[10px] text-carbon/60 border-t border-border/70 pt-2 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Infrastructure Verified
          </span>
          <span className="text-cobalt">Production Stack</span>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="projects" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="01"
          label="FEATURED PROJECTS"
          title="Things I've Built"
          description="Production systems and deployment pipelines engineered for high availability, automated continuous integration, and proactive observability."
        />

        {/* Clean Editorial Project Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <motion.article
              key={project.idx}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="group flex flex-col border border-border bg-white transition-all duration-300 hover:border-cobalt hover:shadow-sm"
            >
              {/* Card Visual Header */}
              <ProjectVisual project={project} />

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                {/* Meta Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="mono text-cobalt font-bold tracking-wider text-[11px]">
                    PROJECT // {project.idx}
                  </span>
                  <span className="mono text-muted-foreground text-[10px]">
                    {project.year}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-carbon group-hover:text-cobalt transition-colors">
                  {project.title}
                </h3>
                <p className="mono mt-1 text-[11px] text-muted-foreground font-medium">
                  {project.subtitle}
                </p>

                {/* Description */}
                <p className="mt-4 text-sm leading-relaxed text-carbon/80">
                  {project.body}
                </p>

                {/* Tech Tags */}
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="mono border border-border bg-[#FAF9F6] px-2.5 py-1 text-[10px] text-carbon/80 transition-colors group-hover:border-border/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Card Links */}
                <div className="mt-8 flex flex-col gap-2.5 border-t border-border pt-5 mt-auto">
                  {project.link && (
                    <a
                      href={project.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cobalt transition-all hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      <span>View Live: {project.link.label}</span>
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
                      <ArrowUpRight className="h-3 w-3 shrink-0 ml-auto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
