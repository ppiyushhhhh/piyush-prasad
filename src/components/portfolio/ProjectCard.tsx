import { Link } from "@tanstack/react-router";
import { Github, ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { STATUS_STYLES } from "@/lib/portfolio-projects";
import { resolveLogo } from "@/lib/tech-logo-registry";

interface ProjectCardProps {
  project: PortfolioProject;
  className?: string;
}

/**
 * Unified ProjectCard Component
 *
 * Used across the home page (/), projects index (/projects), and related project sections.
 * Features a 16:9 cover image with automatic fallback to a branded grid of authentic tech logos,
 * clean typography, tech chips with micro logos, and accessible actions.
 */
export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  const statusConfig = STATUS_STYLES[project.status] || STATUS_STYLES["Personal Project"];

  // Resolve top 4 technology logos for the branded fallback banner
  const bannerLogos = project.technologies
    .map((tech) => ({ tech, logo: resolveLogo(tech) }))
    .filter((item): item is { tech: string; logo: NonNullable<typeof item.logo> } => item.logo !== null)
    .slice(0, 4);

  // Top 4 technologies for chips
  const displayTechs = project.technologies.slice(0, 4);

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt/60 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div>
        {/* Cover Image (Fixed 16:9 ratio) */}
        <div className="relative aspect-video w-full overflow-hidden border-b border-[#E5E5DF] dark:border-white/10 bg-[#FAF9F6] dark:bg-neutral-950">
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(0, 71, 255, 0.08) 1px, transparent 1px)`,
                backgroundSize: "16px 16px",
              }}
            >
              {/* Row of up to 4 Tech Logos in crisp white tiles */}
              <div className="flex items-center gap-2.5 mb-2">
                {bannerLogos.length > 0 ? (
                  bannerLogos.map(({ tech, logo }) => (
                    <div
                      key={tech}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E5DF] bg-white p-1.5 shadow-2xs transition-transform group-hover:scale-105"
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

              <span className="mono text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {project.category}
              </span>
            </div>
          )}

          {/* Floating Status Pill */}
          <div className="absolute top-3 right-3 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border shadow-2xs pointer-events-auto backdrop-blur-md ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Category Subtitle */}
          <span className="mono text-[10px] font-bold uppercase tracking-wider text-cobalt block mb-1">
            {project.category}
          </span>

          {/* Title */}
          <h3 className="text-base font-bold text-carbon dark:text-white line-clamp-1 group-hover:text-cobalt transition-colors">
            <Link to="/projects/$slug" params={{ slug: project.slug }}>
              {project.title}
            </Link>
          </h3>

          {/* One-line / Two-line Description */}
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {project.short_description}
          </p>

          {/* Tech Chips with Tiny Logos */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {displayTechs.map((tech) => {
              const logo = resolveLogo(tech);
              return (
                <span
                  key={tech}
                  className="mono inline-flex items-center gap-1.5 rounded-md border border-[#E5E5DF] dark:border-white/10 bg-[#FAF9F6] dark:bg-neutral-950 px-2 py-1 text-[10px] font-medium text-carbon/80 dark:text-neutral-300"
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
            {project.technologies.length > 4 && (
              <span className="mono inline-flex items-center rounded-md border border-[#E5E5DF] dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-1 text-[9px] font-medium text-muted-foreground">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-[#E5E5DF]/80 dark:border-white/10 bg-[#FAF9F6]/50 dark:bg-neutral-950/40 px-5 py-3 text-xs">
        {/* GitHub Link */}
        {project.repository_url ? (
          <a
            href={project.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 text-carbon/70 dark:text-neutral-300 hover:text-cobalt hover:border-cobalt transition-colors"
            title={`View ${project.title} on GitHub`}
            aria-label={`View ${project.title} on GitHub`}
          >
            <Github className="h-3.5 w-3.5" />
          </a>
        ) : (
          <div className="h-7 w-7" />
        )}

        {/* View Case Study CTA */}
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="mono inline-flex items-center gap-1 text-[11px] font-bold text-cobalt hover:underline"
        >
          <span>View case study</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
