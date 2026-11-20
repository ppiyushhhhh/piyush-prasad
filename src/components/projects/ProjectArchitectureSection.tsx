import { Network, Info, ArrowRight, Layers, Maximize2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { ArchitectureDiagram } from "@/components/portfolio/ArchitectureDiagram";
import { PROJECT_ARCHITECTURE_SLUGS } from "@/lib/project-architectures";

interface ProjectArchitectureSectionProps {
  project: PortfolioProject;
}

export function ProjectArchitectureSection({ project }: ProjectArchitectureSectionProps) {
  if (!project.architecture_data && !project.architecture_description) return null;

  const diagramSlug = PROJECT_ARCHITECTURE_SLUGS[project.slug];

  return (
    <section id="architecture" className="space-y-6 scroll-mt-24">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="mono text-[11px] font-bold uppercase tracking-widest text-cobalt">
            Architecture
          </span>
          <span className="h-1 w-1 rounded-full bg-cobalt" />
          <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white">
            System Topology &amp; Traffic Flow
          </h2>
        </div>

        {project.architecture_description && (
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            {project.architecture_description}
          </p>
        )}
      </div>

      {/* Interactive Architecture Diagram (Full Width) */}
      {project.architecture_data && (
        <div className="w-full">
          <ArchitectureDiagram
            data={project.architecture_data}
            diagramSlug={diagramSlug}
          />
        </div>
      )}

      {/* Deep-Dive Card Linking to Full Architecture Explorer */}
      {diagramSlug && (
        <div className="p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt text-white shrink-0 shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-carbon dark:text-white">
                Inspect Detailed Cloud &amp; Security Architecture
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore full multi-layer topology, live active ports, security controls, and verified repository evidence in the Architecture Explorer.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/architecture"
              search={{ diagram: diagramSlug, workspace: "fullscreen" }}
              className="mono inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cobalt text-white text-xs font-bold hover:bg-cobalt/90 transition-colors shadow-xs"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>OPEN FULL SCREEN</span>
            </Link>
            <Link
              to="/architecture"
              search={{ diagram: diagramSlug }}
              className="mono inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white dark:bg-neutral-900 text-carbon dark:text-neutral-200 text-xs font-bold hover:border-cobalt hover:text-cobalt transition-colors shadow-xs"
            >
              <span>EXPLORE TOPOLOGY</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
