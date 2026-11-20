import { Network, Info } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { ArchitectureDiagram } from "@/components/portfolio/ArchitectureDiagram";

interface ProjectArchitectureSectionProps {
  project: PortfolioProject;
}

export function ProjectArchitectureSection({ project }: ProjectArchitectureSectionProps) {
  if (!project.architecture_data && !project.architecture_description) return null;

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
          <ArchitectureDiagram data={project.architecture_data} />
        </div>
      )}
    </section>
  );
}
