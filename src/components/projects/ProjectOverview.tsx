import { CheckCircle2, Target, Server } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { CaseStudySectionHeader } from "./CaseStudySectionHeader";

interface ProjectOverviewProps {
  project: PortfolioProject;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <section id="overview" className="space-y-6 scroll-mt-24">
      <CaseStudySectionHeader
        label="01 / OVERVIEW"
        title="Executive Overview & Context"
        className="pt-0"
      />

      <p className="text-sm md:text-base text-muted-foreground leading-relaxed -mt-2">
        {project.overview}
      </p>

      {/* Metadata Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs">
          <div className="flex items-center gap-2 text-cobalt mb-2">
            <Server className="h-4 w-4" />
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Deployment Target
            </span>
          </div>
          <span className="text-xs font-bold text-carbon dark:text-white block truncate">
            {project.deployment_environment || "Production Cloud"}
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs">
          <div className="flex items-center gap-2 text-cobalt mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Production Status
            </span>
          </div>
          <span className="text-xs font-bold text-carbon dark:text-white block truncate">
            {project.status} Verified
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-cobalt mb-2">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Primary Objective
            </span>
          </div>
          <span className="text-xs font-bold text-carbon dark:text-white block truncate">
            Automated &amp; Hardened
          </span>
        </div>
      </div>

      {/* Core Objectives if available */}
      {project.objectives && (
        <div id="objectives" className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-cobalt" />
            <h3 className="text-sm font-bold text-carbon dark:text-white uppercase tracking-wider">
              Project Objectives
            </h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {project.objectives}
          </p>
        </div>
      )}
    </section>
  );
}
