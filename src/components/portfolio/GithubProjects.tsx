import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Github,
  ArrowUpRight,
  RefreshCw,
  Network,
  FolderGit2,
} from "lucide-react";

import { SectionHeader } from "./SectionHeader";
import { ProjectCard } from "./ProjectCard";
import {
  fetchPublishedProjects,
  INITIAL_PORTFOLIO_PROJECTS,
  type PortfolioProject,
} from "@/lib/portfolio-projects";

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
      className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28 scroll-mt-20 dark:bg-[#121316] dark:border-white/10"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <SectionHeader
            n="01"
            label="FEATURED PROJECTS"
            title="Building, Automating & Securing Infrastructure"
            description="Production cloud architectures, CI/CD deployment pipelines, DevSecOps controls, and infrastructure automation."
          />

          {/* Quick Action Navigation */}
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <Link
              to="/architecture"
              className="mono inline-flex items-center gap-2 border border-cobalt bg-cobalt px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-700 shadow-2xs"
            >
              <Network className="h-4 w-4" />
              <span>Architecture Explorer</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href="https://github.com/ppiyushhhhh?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="mono inline-flex items-center gap-2 border border-carbon bg-white px-5 py-2.5 text-xs font-semibold text-carbon transition-all hover:border-cobalt hover:bg-cobalt hover:text-white shadow-2xs dark:border-white/20 dark:bg-[#18191D] dark:text-white dark:hover:bg-cobalt"
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

        {/* Loading Skeletons */}
        {isLoading && !projects.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-white dark:bg-[#18191D] p-6 animate-pulse space-y-4 shadow-2xs"
              >
                <div className="aspect-video w-full bg-carbon/5 dark:bg-white/5 rounded-lg" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project: PortfolioProject) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* "View All Projects" Prominent CTA Bar */}
        <div className="mt-12 pt-8 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FolderGit2 className="h-4 w-4 text-cobalt" />
            <span>
              Showing <strong>3</strong> featured case studies from <strong>{projects.length}</strong> production implementations.
            </span>
          </div>

          <Link
            to="/projects"
            className="mono inline-flex items-center gap-2 border border-carbon bg-carbon px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-cobalt hover:border-cobalt shadow-2xs dark:bg-white dark:text-carbon dark:hover:bg-cobalt dark:hover:text-white"
          >
            <span>View All Engineering Projects &amp; Case Studies</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
