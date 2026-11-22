import { Cpu, Shield } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { CaseStudySectionHeader } from "./CaseStudySectionHeader";

interface ProjectImplementationNotesProps {
  project: PortfolioProject;
}

export function ProjectImplementationNotes({ project }: ProjectImplementationNotesProps) {
  const hasContent =
    project.implementation_details || project.cicd_details || project.security_details;

  if (!hasContent) return null;

  return (
    <section id="implementation" className="space-y-6 scroll-mt-24">
      {/* Implementation Workflow */}
      {project.implementation_details && (
        <div className="space-y-4">
          <CaseStudySectionHeader
            label="05 / IMPLEMENTATION"
            title="Implementation Details & Workflow"
          />
          <div className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-2xs">
            <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {project.implementation_details}
            </p>
          </div>
        </div>
      )}

      {/* CI/CD & Security Cards Grid */}
      {(project.cicd_details || project.security_details) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {project.cicd_details && (
            <div
              id="cicd"
              className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-2xs scroll-mt-24 flex flex-col justify-start h-full"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-carbon dark:text-white uppercase tracking-wider">
                  CI/CD &amp; Automation Pipeline
                </h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line flex-1">
                {project.cicd_details}
              </p>
            </div>
          )}

          {project.security_details && (
            <div
              id="security"
              className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-2xs scroll-mt-24 flex flex-col justify-start h-full"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-carbon dark:text-white uppercase tracking-wider">
                  Security &amp; Hardening Controls
                </h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line flex-1">
                {project.security_details}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
