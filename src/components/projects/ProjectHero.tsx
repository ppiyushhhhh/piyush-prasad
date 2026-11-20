import { Github, ExternalLink, Share2, Check } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { STATUS_STYLES } from "@/lib/portfolio-projects";
import { resolveLogo } from "@/lib/tech-logo-registry";

interface ProjectHeroProps {
  project: PortfolioProject;
  copiedLink: boolean;
  onCopyLink: () => void;
}

export function ProjectHero({ project, copiedLink, onCopyLink }: ProjectHeroProps) {
  const statusConfig = STATUS_STYLES[project.status] || STATUS_STYLES["Personal Project"];

  // Top logos for hero showcase
  const heroLogos = project.technologies
    .map((tech) => ({ tech, logo: resolveLogo(tech) }))
    .filter((item): item is { tech: string; logo: NonNullable<typeof item.logo> } => item.logo !== null)
    .slice(0, 6);

  return (
    <div className="border-b border-[#E5E5DF] dark:border-white/10 pb-10">
      {/* Category & Status Pill */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="mono text-xs font-bold uppercase tracking-widest text-cobalt">
          {project.category}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border shadow-2xs ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
          {statusConfig.label}
        </span>
        {project.deployment_environment && (
          <span className="mono text-xs text-muted-foreground">
            &bull; {project.deployment_environment}
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-carbon dark:text-white leading-tight">
        {project.title}
      </h1>

      {/* Short Technical Description */}
      <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-4xl leading-relaxed">
        {project.short_description}
      </p>

      {/* Hero Technology Logos & Action Links */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-[#E5E5DF]/70 dark:border-white/5">
        {/* Tech Stack Logos Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
            Stack:
          </span>
          {heroLogos.map(({ tech, logo }) => (
            <div
              key={tech}
              className="flex items-center gap-1.5 rounded-lg border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 px-2.5 py-1.5 shadow-2xs"
              title={logo.label}
            >
              <img
                src={logo.src}
                alt={logo.label}
                className="h-4 w-4 object-contain shrink-0"
                loading="lazy"
              />
              <span className="mono text-xs font-medium text-carbon dark:text-neutral-200">
                {tech}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono inline-flex items-center gap-2 rounded-md border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-2 text-xs font-semibold text-carbon dark:text-white hover:border-cobalt hover:text-cobalt transition-colors shadow-2xs"
              aria-label={`View ${project.title} repository on GitHub`}
            >
              <Github className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>
          )}

          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono inline-flex items-center gap-2 rounded-md bg-cobalt px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
              aria-label={`Open live demonstration for ${project.title}`}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Live Demonstration</span>
            </a>
          )}

          <button
            type="button"
            onClick={onCopyLink}
            className="mono inline-flex items-center gap-1.5 rounded-md border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-carbon dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
            title="Share case study"
            aria-label="Share case study link"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
