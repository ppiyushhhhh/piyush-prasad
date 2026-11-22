import { Link } from "@tanstack/react-router";
import { Github, ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { STATUS_STYLES } from "@/lib/portfolio-projects";
import { resolveLogo } from "@/lib/tech-logo-registry";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectCardProps {
  project: PortfolioProject;
  className?: string;
}

/**
 * Unified ProjectCard Component
 *
 * Used across the home page (/), projects index (/projects), and related project sections.
 * Features a compact 120px branded logo header, balanced 2-line title, 3-line description,
 * uniform tech chips with hover/tap tooltip, and anchored bottom footer.
 */
export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  const statusConfig = STATUS_STYLES[project.status] || STATUS_STYLES["Personal Project"];

  // Resolve top 4 technology logos for the branded fallback banner
  const bannerLogos = project.technologies
    .map((tech) => ({ tech, logo: resolveLogo(tech) }))
    .filter((item): item is { tech: string; logo: NonNullable<typeof item.logo> } => item.logo !== null)
    .slice(0, 4);

  // Maximum of 3 chips in primary row so they never wrap into multiple rows, with +N displaying remainder
  const maxPrimaryChips = 3;
  const displayTechs = project.technologies.slice(0, maxPrimaryChips);
  const remainingTechs = project.technologies.slice(maxPrimaryChips);

  return (
    <article
      className={`group relative flex flex-col justify-between h-full overflow-hidden rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt/60 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col flex-1">
        {/* Top Media / Logo Area (Fixed 120px height) */}
        <div className="relative h-[120px] w-full overflow-hidden border-b border-[#E5E5DF] dark:border-white/10 bg-[#FAF9F6] dark:bg-neutral-950 shrink-0 flex flex-col justify-between p-3.5">
          {project.cover_image_url ? (
            <>
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="relative flex items-center justify-end w-full z-10">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border shadow-2xs backdrop-blur-md ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Header Row: Category label on left, Status Pill on right (guaranteed zero overlap) */}
              <div className="flex items-center justify-between w-full z-10">
                <span className="mono text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {project.category}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border shadow-2xs backdrop-blur-md ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>

              {/* Center: Row of up to 4 Tech Logos in crisp tiles centered */}
              <div className="flex items-center justify-center gap-2.5 pb-1">
                {bannerLogos.length > 0 ? (
                  bannerLogos.map(({ tech, logo }) => (
                    <div
                      key={tech}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-1.5 shadow-2xs transition-transform group-hover:scale-105"
                      title={logo.label}
                    >
                      <img
                        src={logo.src}
                        alt={logo.label}
                        className="h-full w-full object-contain pointer-events-none"
                        loading="lazy"
                      />
                    </div>
                  ))
                ) : (
                  <div className="mono text-xs font-bold text-cobalt uppercase tracking-widest">
                    {project.category}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Category Subtitle */}
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-cobalt block mb-1">
              {project.category}
            </span>

            {/* Title (2 lines allowed, wrapped cleanly, line-clamp-2 prevents overflowing 3 lines) */}
            <h3 className="text-base font-bold text-carbon dark:text-white line-clamp-2 leading-snug group-hover:text-cobalt transition-colors min-h-[2.5rem]">
              <Link to="/projects/$slug" params={{ slug: project.slug }}>
                {project.title}
              </Link>
            </h3>

            {/* Three-line Description */}
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3 min-h-[3.75rem]">
              {project.short_description}
            </p>
          </div>

          {/* Tech Chips with Tiny Logos (Single row, uniform height, hover/tap popover for +N) */}
          <div className="mt-4 flex items-center gap-1.5 flex-nowrap overflow-hidden h-[26px]">
            {displayTechs.map((tech) => {
              const logo = resolveLogo(tech);
              return (
                <span
                  key={tech}
                  className="mono inline-flex items-center gap-1.5 rounded-md border border-[#E5E5DF] dark:border-white/10 bg-[#FAF9F6] dark:bg-neutral-950 px-2 h-[26px] text-[10px] font-medium text-carbon/80 dark:text-neutral-300 shrink-0"
                >
                  {logo && (
                    <img
                      src={logo.src}
                      alt={logo.label}
                      className="h-3 w-3 object-contain shrink-0"
                      loading="lazy"
                    />
                  )}
                  <span>{tech}</span>
                </span>
              );
            })}
            {remainingTechs.length > 0 && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="mono inline-flex items-center justify-center rounded-md border border-[#E5E5DF] dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 px-2 h-[26px] text-[10px] font-semibold text-muted-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors shrink-0"
                      aria-label={`View ${remainingTechs.length} more technologies`}
                    >
                      +{remainingTechs.length}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="p-3 bg-white dark:bg-neutral-900 text-carbon dark:text-white border border-[#E5E5DF] dark:border-white/10 shadow-lg rounded-lg max-w-[280px]"
                  >
                    <div className="mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Additional Technologies ({remainingTechs.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {remainingTechs.map((tech) => {
                        const logo = resolveLogo(tech);
                        return (
                          <span
                            key={tech}
                            className="mono inline-flex items-center gap-1 rounded border border-[#E5E5DF] dark:border-white/10 bg-[#FAF9F6] dark:bg-neutral-950 px-1.5 py-0.5 text-[9px] font-medium text-carbon/80 dark:text-neutral-300"
                          >
                            {logo && (
                              <img
                                src={logo.src}
                                alt={logo.label}
                                className="h-2.5 w-2.5 object-contain shrink-0"
                                loading="lazy"
                              />
                            )}
                            <span>{tech}</span>
                          </span>
                        );
                      })}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer - Anchored to bottom */}
      <div className="flex items-center justify-between border-t border-[#E5E5DF]/80 dark:border-white/10 bg-[#FAF9F6]/50 dark:bg-neutral-950/40 px-5 py-3 text-xs mt-auto">
        {/* GitHub Link */}
        {project.repository_url ? (
          <a
            href={project.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 text-carbon/70 dark:text-neutral-300 hover:text-cobalt hover:border-cobalt transition-colors shadow-2xs"
            title={`View ${project.title} on GitHub`}
            aria-label={`View ${project.title} on GitHub`}
          >
            <Github className="h-4 w-4" />
          </a>
        ) : (
          <div className="h-8 w-8" />
        )}

        {/* View Case Study CTA */}
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="mono inline-flex items-center gap-1.5 text-[11px] font-bold text-cobalt hover:text-blue-700 transition-colors uppercase tracking-wider group/link"
        >
          <span>VIEW CASE STUDY</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
