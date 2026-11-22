import type { PortfolioProject } from "@/lib/portfolio-projects";
import { ArchitectureDiagram } from "@/components/portfolio/ArchitectureDiagram";
import { PROJECT_ARCHITECTURE_SLUGS } from "@/lib/project-architectures";
import { CaseStudySectionHeader } from "./CaseStudySectionHeader";

interface ProjectArchitectureSectionProps {
  project: PortfolioProject;
}

export function ProjectArchitectureSection({ project }: ProjectArchitectureSectionProps) {
  if (!project.architecture_data && !project.architecture_description) return null;

  const diagramSlug = PROJECT_ARCHITECTURE_SLUGS[project.slug];

  return (
    <section id="architecture" className="space-y-4 scroll-mt-24">
      <CaseStudySectionHeader
        label="04 / ARCHITECTURE"
        title="Live System Architecture & Topology"
        description={project.architecture_description || undefined}
      />

      {/* Interactive Architecture Diagram (Full Width) */}
      {(project.architecture_data || diagramSlug) && (
        <div className="w-full">
          <ArchitectureDiagram
            data={project.architecture_data || { components: [], connections: [] }}
            diagramSlug={diagramSlug}
          />
        </div>
      )}
    </section>
  );
}
