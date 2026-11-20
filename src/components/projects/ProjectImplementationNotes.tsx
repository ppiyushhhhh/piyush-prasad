import { Terminal, Shield, Cpu } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";

interface ProjectImplementationNotesProps {
  project: PortfolioProject;
}

export function ProjectImplementationNotes({ project }: ProjectImplementationNotesProps) {
  const hasContent =
    project.implementation_details || project.cicd_details || project.security_details;

  if (!hasContent) return null;

  return (
    <section className="space-y-6">
      {/* Implementation Workflow */}
      {project.implementation_details && (
        <div id="implementation" className="space-y-3 scroll-mt-24">
          <div className="flex items-center gap-2">
            <span className="mono text-[11px] font-bold uppercase tracking-widest text-cobalt">
              Engineering Notes
            </span>
            <span className="h-1 w-1 rounded-full bg-cobalt" />
            <h3 className="text-lg md:text-xl font-bold text-carbon dark:text-white">
              Implementation Details &amp; Workflow
            </h3>
          </div>
          <div className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-5 shadow-2xs">
            <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {project.implementation_details}
            </p>
          </div>
        </div>
      )}

      {/* CI/CD & Security Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.cicd_details && (
          <div
            id="cicd"
            className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-5 shadow-2xs scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-carbon dark:text-white uppercase tracking-wider">
                CI/CD &amp; Automation Pipeline
              </h3>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {project.cicd_details}
            </p>
          </div>
        )}

        {project.security_details && (
          <div
            id="security"
            className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-5 shadow-2xs scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-carbon dark:text-white uppercase tracking-wider">
                Security &amp; Hardening Controls
              </h3>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {project.security_details}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
