import { AlertTriangle, Lightbulb } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";

interface ProjectProblemSolutionProps {
  project: PortfolioProject;
}

export function ProjectProblemSolution({ project }: ProjectProblemSolutionProps) {
  if (!project.problem_solved && !project.solution) return null;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Statement Card */}
        {project.problem_solved && (
          <div
            id="problem"
            className="rounded-xl border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 p-6 shadow-2xs scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <span className="mono text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  The Problem
                </span>
                <h3 className="text-base font-bold text-carbon dark:text-white">
                  Challenges &amp; Pain Points
                </h3>
              </div>
            </div>
            <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {project.problem_solved}
            </p>
          </div>
        )}

        {/* Engineered Solution Card */}
        {project.solution && (
          <div
            id="solution"
            className="rounded-xl border border-blue-200/80 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20 p-6 shadow-2xs scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-cobalt">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                  The Solution
                </span>
                <h3 className="text-base font-bold text-carbon dark:text-white">
                  Engineered Implementation
                </h3>
              </div>
            </div>
            <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {project.solution}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
