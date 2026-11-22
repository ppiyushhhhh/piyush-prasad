import { AlertTriangle, Lightbulb } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { CaseStudySectionHeader } from "./CaseStudySectionHeader";

interface ProjectProblemSolutionProps {
  project: PortfolioProject;
}

export function ProjectProblemSolution({ project }: ProjectProblemSolutionProps) {
  if (!project.problem_solved && !project.solution) return null;

  return (
    <section id="problem" className="space-y-4 scroll-mt-24">
      <CaseStudySectionHeader
        label="02 / CHALLENGE & SOLUTION"
        title="Problem Statement & Engineered Solution"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Problem Statement Card */}
        {project.problem_solved && (
          <div
            className="h-full rounded-xl border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 p-6 shadow-2xs flex flex-col justify-start"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <span className="mono text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 block">
                  The Problem
                </span>
                <h3 className="text-base font-bold text-carbon dark:text-white">
                  Challenges &amp; Pain Points
                </h3>
              </div>
            </div>
            <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line flex-1">
              {project.problem_solved}
            </p>
          </div>
        )}

        {/* Engineered Solution Card */}
        {project.solution && (
          <div
            id="solution"
            className="h-full rounded-xl border border-accent/30 bg-accent-soft/40 dark:border-accent/40 dark:bg-accent-soft p-6 shadow-2xs flex flex-col justify-start"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <span className="mono text-[10px] font-bold uppercase tracking-widest text-accent block">
                  The Solution
                </span>
                <h3 className="text-base font-bold text-text">
                  Engineered Implementation
                </h3>
              </div>
            </div>
            <p className="text-xs md:text-sm text-text-muted leading-relaxed whitespace-pre-line flex-1">
              {project.solution}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
