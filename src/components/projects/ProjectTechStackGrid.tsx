import { Layers } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { resolveLogo } from "@/lib/tech-logo-registry";

interface ProjectTechStackGridProps {
  project: PortfolioProject;
}

export function ProjectTechStackGrid({ project }: ProjectTechStackGridProps) {
  if (!project.technologies || project.technologies.length === 0) return null;

  return (
    <section id="technologies" className="space-y-4 scroll-mt-24">
      <div className="flex items-center gap-2 mb-2">
        <span className="mono text-[11px] font-bold uppercase tracking-widest text-cobalt">
          Tech Stack
        </span>
        <span className="h-1 w-1 rounded-full bg-cobalt" />
        <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white">
          Technologies &amp; Cloud Services
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {project.technologies.map((tech) => {
          const logo = resolveLogo(tech);
          return (
            <div
              key={tech}
              className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt/50 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E5DF] bg-white p-1.5 shadow-2xs">
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
              <div className="min-w-0">
                <span className="text-xs font-bold text-carbon dark:text-white block truncate">
                  {tech}
                </span>
                <span className="mono text-[10px] text-muted-foreground block truncate">
                  {logo ? logo.label : "Verified Component"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
