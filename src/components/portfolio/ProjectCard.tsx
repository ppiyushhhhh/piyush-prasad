import { Link } from "@tanstack/react-router";
import {
  Github,
  ExternalLink,
  ArrowUpRight,
  Terminal,
  Server,
  Shield,
  Layers,
  Sparkles,
  Calendar,
} from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { STATUS_STYLES } from "@/lib/portfolio-projects";

interface ProjectCardProps {
  project: PortfolioProject;
  className?: string;
}

export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  const statusConfig = STATUS_STYLES[project.status] || STATUS_STYLES["Personal Project"];

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt/60 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div>
        {/* Cover Image or Graphic Banner */}
        <div className="relative h-48 w-full overflow-hidden border-b border-border bg-[#FAF9F6] dark:bg-neutral-950">
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-white dark:bg-neutral-900 shadow-xs mb-3 group-hover:border-cobalt/40 transition-colors">
                <Terminal className="h-6 w-6 text-cobalt" />
              </div>
              <span className="mono text-[11px] font-bold text-carbon/70 dark:text-neutral-300 uppercase tracking-widest line-clamp-1">
                {project.category}
              </span>
              <span className="mono text-[10px] text-muted-foreground mt-0.5">
                {project.deployment_environment || "CloudOps Engineering"}
              </span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
            {/* Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border shadow-xs pointer-events-auto backdrop-blur-xs ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>

            {/* Featured Badge */}
            {project.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 shadow-xs backdrop-blur-xs pointer-events-auto">
                <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Category */}
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-cobalt mb-1.5">
            {project.category}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-carbon dark:text-white line-clamp-2 group-hover:text-cobalt transition-colors">
            <Link to="/projects/$slug" params={{ slug: project.slug }}>
              {project.title}
            </Link>
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {project.short_description}
          </p>

          {/* Tech Stack Pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="mono inline-flex items-center rounded-sm border border-border bg-[#FAF9F6] dark:bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-carbon/80 dark:text-neutral-300"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 5 && (
              <span className="mono inline-flex items-center rounded-sm border border-border bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                +{project.technologies.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Action Links */}
      <div className="flex items-center justify-between border-t border-border/80 bg-[#FAF9F6]/50 dark:bg-neutral-950/40 px-5 py-3 text-xs">
        {/* Repo & Demo Icons */}
        <div className="flex items-center gap-2">
          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-7 w-7 rounded border border-border bg-white dark:bg-neutral-900 text-carbon/70 dark:text-neutral-300 hover:text-cobalt hover:border-cobalt transition-colors"
              title="View GitHub Repository"
              aria-label={`View GitHub repository for ${project.title}`}
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          )}
          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-7 w-7 rounded border border-border bg-white dark:bg-neutral-900 text-carbon/70 dark:text-neutral-300 hover:text-cobalt hover:border-cobalt transition-colors"
              title="Open Live Demonstration"
              aria-label={`Open live demonstration for ${project.title}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* View Case Study CTA */}
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="mono inline-flex items-center gap-1 text-[11px] font-bold text-cobalt hover:underline"
        >
          <span>Case Study</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
