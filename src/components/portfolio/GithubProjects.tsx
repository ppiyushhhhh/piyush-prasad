import { useQuery } from "@tanstack/react-query";
import {
  Github,
  ArrowUpRight,
  RefreshCw,
  FolderGit2,
} from "lucide-react";

import { ProjectCard } from "./ProjectCard";
import {
  fetchPublishedProjects,
  INITIAL_PORTFOLIO_PROJECTS,
  type PortfolioProject,
} from "@/lib/portfolio-projects";
import { PROJECTS_URL } from "@/lib/site";

export function GithubProjects() {
  // Fetch published engineering projects
  const {
    data: projects = INITIAL_PORTFOLIO_PROJECTS,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<PortfolioProject[]>({
    queryKey: ["portfolio-projects-home"],
    queryFn: fetchPublishedProjects,
    staleTime: 10 * 60_000,
  });

  // Top 3 featured projects for home page
  const featuredProjects = (
    projects.filter((p: PortfolioProject) => p.is_featured).length >= 3
      ? projects.filter((p: PortfolioProject) => p.is_featured)
      : projects
  ).slice(0, 3);

  return (
    <section
      id="projects"
      className="relative border-b border-border bg-surface-muted py-12 md:py-16 scroll-mt-20 dark:bg-[#121316] dark:border-white/10"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Section Header - 12-Column Grid */}
        <div className="mb-8 md:mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
          {/* Left Column (7 cols): Label line + Headline */}
          <div className="lg:col-span-7 flex flex-col justify-end">
            {/* Category Eyebrow / Number */}
            <div className="mono mb-4 flex items-center gap-3 text-[11px] font-medium text-carbon/60 dark:text-white/60">
              <span className="font-bold text-cobalt">01</span>
              <span className="text-carbon/30 dark:text-white/30">/</span>
              <span className="tracking-[0.16em] text-carbon/80 dark:text-white/80">FEATURED PROJECTS</span>
              <span className="ml-3 h-px flex-1 bg-border dark:bg-white/10" />
            </div>

            {/* Main Section Heading */}
            <h2 className="display text-[32px] sm:text-[44px] md:text-[52px] lg:text-[56px] text-carbon dark:text-white tracking-tight leading-[1.08]">
              Building, Automating &amp; Securing Infrastructure
            </h2>
          </div>

          {/* Right Column (5 cols): Description paragraph + Buttons row (bottom-aligned to headline) */}
          <div className="lg:col-span-5 flex flex-col justify-end gap-5">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              Production cloud architectures, CI/CD deployment pipelines, DevSecOps controls, and infrastructure automation.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/ppiyushhhhh?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="mono inline-flex items-center gap-2 border border-carbon bg-white px-5 py-2.5 text-xs font-semibold text-carbon transition-all hover:border-cobalt hover:bg-cobalt hover:text-white shadow-2xs dark:border-white/20 dark:bg-[#18191D] dark:text-white dark:hover:bg-cobalt cursor-pointer"
              >
                <Github className="h-4 w-4" />
                <span>GitHub Profile</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mono inline-flex items-center justify-center border border-border bg-white p-2.5 text-carbon/75 hover:border-cobalt hover:text-cobalt transition-colors shadow-2xs dark:border-white/10 dark:bg-[#18191D] dark:text-white/80 cursor-pointer"
                title="Refresh project telemetry"
                aria-label="Refresh project telemetry"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-cobalt" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && !projects.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-white dark:bg-[#18191D] p-6 animate-pulse space-y-4 shadow-2xs h-full"
              >
                <div className="h-[120px] w-full bg-carbon/5 dark:bg-white/5 rounded-lg" />
                <div className="h-5 w-2/3 bg-carbon/10 dark:bg-white/10" />
                <div className="h-10 w-full bg-carbon/5 dark:bg-white/5" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-carbon/10 dark:bg-white/10" />
                  <div className="h-5 w-20 bg-carbon/10 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3 Featured Projects Grid using unified ProjectCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {featuredProjects.map((project: PortfolioProject) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* "View All Projects" Prominent CTA Bar */}
        <div className="mt-8 pt-6 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FolderGit2 className="h-4 w-4 text-cobalt" />
            <span>
              Showing <strong className="text-carbon dark:text-white font-semibold">{featuredProjects.length}</strong> featured case studies from{" "}
              <strong className="text-carbon dark:text-white font-semibold">{projects.length}</strong> production implementations.
            </span>
          </div>

          <a
            href={PROJECTS_URL}
            className="mono inline-flex items-center gap-2 border border-carbon bg-carbon px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-cobalt hover:border-cobalt shadow-2xs dark:bg-white dark:text-carbon dark:hover:bg-cobalt dark:hover:text-white cursor-pointer"
          >
            <span>VIEW ALL ENGINEERING PROJECTS &amp; CASE STUDIES</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
