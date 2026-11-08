import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  ExternalLink,
  Star,
  GitFork,
  GitBranch,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Terminal,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderGit2,
  Code2,
} from "lucide-react";

import { SectionHeader } from "./SectionHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GH_USER } from "@/lib/site";
import {
  fetchGitHubRepos,
  formatRelativeTime,
  LANGUAGE_COLORS,
  type GitHubRepo,
} from "@/lib/github";
import { VERIFIED_PROJECT_DETAILS, type VerifiedProjectDetails } from "@/data/github-projects-data";

type DomainFilter = "all" | "aws" | "cicd" | "devsecops" | "docker" | "automation";

const DOMAIN_FILTERS: { id: DomainFilter; label: string }[] = [
  { id: "all", label: "All Repositories" },
  { id: "aws", label: "AWS & Cloud" },
  { id: "cicd", label: "CI/CD & Pipelines" },
  { id: "devsecops", label: "DevSecOps & Trivy" },
  { id: "docker", label: "Docker & Monitoring" },
  { id: "automation", label: "Automation & Linux" },
];

const INITIAL_PROJECT_LIMIT = 6;

export function GithubProjects() {
  const [selectedFilter, setSelectedFilter] = useState<DomainFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const [activeModalRepo, setActiveModalRepo] = useState<{
    repo: GitHubRepo;
    details?: VerifiedProjectDetails;
  } | null>(null);

  // Fetch real repositories from GitHub REST API
  const {
    data: repos,
    isLoading,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["github-repos", GH_USER],
    queryFn: () => fetchGitHubRepos(GH_USER),
    staleTime: 30 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Filter repositories by domain
  const filteredRepos = useMemo(() => {
    if (!repos) return [];

    return repos.filter((r) => {
      if (selectedFilter === "all") return true;

      const details = VERIFIED_PROJECT_DETAILS[r.name];
      if (details) {
        if (
          selectedFilter === "aws" &&
          (details.category === "aws" || details.technologies.some((t) => t.includes("AWS")))
        ) {
          return true;
        }
        if (
          selectedFilter === "cicd" &&
          (details.category === "cicd" ||
            details.technologies.some((t) => t.includes("CI/CD") || t.includes("GitHub Actions")))
        ) {
          return true;
        }
        if (
          selectedFilter === "devsecops" &&
          (details.category === "devsecops" ||
            details.technologies.some((t) => t.includes("Trivy") || t.includes("DevSecOps")))
        ) {
          return true;
        }
        if (
          selectedFilter === "docker" &&
          (details.category === "docker" ||
            details.technologies.some((t) => t.includes("Docker") || t.includes("Monitoring")))
        ) {
          return true;
        }
        if (
          selectedFilter === "automation" &&
          (details.category === "automation" ||
            details.technologies.some(
              (t) => t.includes("Shell") || t.includes("Python") || t.includes("Linux"),
            ))
        ) {
          return true;
        }
      }

      // Fallback heuristics
      const name = r.name.toLowerCase();
      const desc = (r.description ?? "").toLowerCase();
      const topics = (r.topics ?? []).join(" ").toLowerCase();

      if (selectedFilter === "aws") {
        return (
          name.includes("aws") ||
          desc.includes("aws") ||
          topics.includes("aws") ||
          topics.includes("ec2")
        );
      }
      if (selectedFilter === "cicd") {
        return (
          name.includes("pipeline") ||
          desc.includes("ci/cd") ||
          desc.includes("github actions") ||
          topics.includes("cicd")
        );
      }
      if (selectedFilter === "devsecops") {
        return (
          name.includes("sec") ||
          desc.includes("trivy") ||
          desc.includes("security") ||
          topics.includes("security")
        );
      }
      if (selectedFilter === "docker") {
        return (
          name.includes("sentinel") ||
          desc.includes("docker") ||
          desc.includes("monitoring") ||
          topics.includes("docker")
        );
      }
      if (selectedFilter === "automation") {
        return (
          r.language === "Shell" ||
          r.language === "Python" ||
          desc.includes("script") ||
          desc.includes("automation")
        );
      }

      return true;
    });
  }, [repos, selectedFilter]);

  // Sliced projects according to View More state (6 by default)
  const visibleProjects = useMemo(() => {
    return showAll ? filteredRepos : filteredRepos.slice(0, INITIAL_PROJECT_LIMIT);
  }, [filteredRepos, showAll]);

  const hasMoreProjects = filteredRepos.length > INITIAL_PROJECT_LIMIT;

  const handleFilterChange = (filter: DomainFilter) => {
    setSelectedFilter(filter);
    setShowAll(false);
  };

  const handleToggleViewMore = () => {
    if (showAll) {
      setShowAll(false);
      const el = document.getElementById("projects");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setShowAll(true);
    }
  };

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
            label="GITHUB PROJECTS"
            title="Building, Automating & Securing Infrastructure"
            description="Real-world infrastructure automation, cloud architectures, CI/CD deployment pipelines, and security-hardened open source repositories on GitHub."
          />

          {/* Action CTA */}
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/ppiyushhhhh?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="mono inline-flex items-center gap-2 border border-carbon bg-white px-5 py-2.5 text-xs font-semibold text-carbon transition-all hover:border-cobalt hover:bg-cobalt hover:text-white shadow-2xs dark:border-white/20 dark:bg-[#18191D] dark:text-white dark:hover:bg-cobalt"
            >
              <Github className="h-4 w-4" />
              <span>Explore All Projects on GitHub</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mono inline-flex items-center justify-center border border-border bg-white p-2.5 text-carbon/75 hover:border-cobalt hover:text-cobalt transition-colors shadow-2xs dark:border-white/10 dark:bg-[#18191D] dark:text-white/80 cursor-pointer"
              title="Refresh repository telemetry from GitHub REST API"
              aria-label="Refresh repository data"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-cobalt" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar & Counter Readout */}
        <div className="mb-8 border-b border-border dark:border-white/10 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {DOMAIN_FILTERS.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`mono px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-cobalt text-white shadow-2xs"
                      : "bg-white border border-border text-carbon/75 hover:border-cobalt hover:text-cobalt dark:bg-[#18191D] dark:border-white/10 dark:text-white/80 dark:hover:border-cobalt dark:hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mono text-xs text-muted-foreground flex items-center gap-2 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-carbon/80 dark:text-white/80 font-semibold">
              Showing {visibleProjects.length} of {filteredRepos.length} Projects
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && !repos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="border border-border bg-white dark:bg-[#18191D] dark:border-white/10 p-6 animate-pulse space-y-4 shadow-2xs"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-carbon/10 dark:bg-white/10" />
                  <div className="h-4 w-12 bg-carbon/10 dark:bg-white/10" />
                </div>
                <div className="h-6 w-3/4 bg-carbon/10 dark:bg-white/10" />
                <div className="h-14 w-full bg-carbon/5 dark:bg-white/5" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-carbon/10 dark:bg-white/10" />
                  <div className="h-5 w-20 bg-carbon/10 dark:bg-white/10" />
                </div>
                <div className="h-9 w-full bg-carbon/10 dark:bg-white/10 pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="mono border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 p-4 text-xs text-amber-900 dark:text-amber-200 mb-6 flex items-center justify-between">
            <span>
              Displaying cached repository snapshots — GitHub REST API rate-safe fallback mode
              active.
            </span>
            <a
              href="https://github.com/ppiyushhhhh?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="underline font-semibold hover:text-cobalt ml-2"
            >
              View on GitHub
            </a>
          </div>
        )}

        {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        {visibleProjects.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {visibleProjects.map((repo, i) => {
                  const details = VERIFIED_PROJECT_DETAILS[repo.name];
                  const langColor = repo.language
                    ? (LANGUAGE_COLORS[repo.language] ?? "#06b6d4")
                    : "#94a3b8";

                  const tags = details?.technologies
                    ? details.technologies.slice(0, 4)
                    : repo.topics && repo.topics.length > 0
                      ? repo.topics.slice(0, 4)
                      : [repo.language || "DevOps", "Cloud", "Linux"];

                  const demoUrl = details?.liveDemoUrl || repo.homepage;

                  return (
                    <motion.article
                      key={repo.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.28, delay: i < 6 ? i * 0.04 : 0 }}
                      className="group relative flex flex-col justify-between border border-border bg-white p-6 sm:p-7 shadow-2xs transition-all duration-300 hover:border-cobalt hover:-translate-y-1 hover:shadow-xs dark:bg-[#18191D] dark:border-white/10 dark:hover:border-cobalt/70"
                    >
                      <div className="flex flex-col flex-1">
                        {/* Card Top: Branch, Public, Stars & Forks */}
                        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-border/70 dark:border-white/10">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="mono text-[10px] text-cobalt flex items-center gap-1 font-semibold shrink-0">
                              <GitBranch className="h-3 w-3" />
                              {repo.default_branch || "main"}
                            </span>
                            <span className="border border-border bg-[#FAF9F6] px-1.5 py-0.5 text-[9px] font-mono text-carbon/70 uppercase font-medium dark:bg-white/5 dark:border-white/10 dark:text-white/70">
                              Public
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
                            {repo.stargazers_count > 0 && (
                              <span
                                className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold"
                                title="GitHub Stars"
                              >
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                {repo.stargazers_count}
                              </span>
                            )}
                            {repo.forks_count > 0 && (
                              <span
                                className="flex items-center gap-1 text-carbon/60 dark:text-white/60"
                                title="Forks"
                              >
                                <GitFork className="h-3.5 w-3.5" />
                                {repo.forks_count}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Category Eyebrow */}
                        <div className="mt-3.5 mono text-[10px] text-cobalt font-semibold uppercase tracking-wider truncate">
                          {details?.categoryLabel || "Open Source Repository"}
                        </div>

                        {/* Project Name */}
                        <h3 className="mt-1 text-lg sm:text-xl font-bold text-carbon dark:text-white tracking-tight group-hover:text-cobalt transition-colors">
                          <button
                            type="button"
                            onClick={() => setActiveModalRepo({ repo, details })}
                            className="text-left font-bold hover:underline cursor-pointer focus:outline-hidden w-full truncate block"
                            title={`View details for ${repo.name}`}
                          >
                            {repo.name}
                          </button>
                        </h3>

                        {/* Short Project Description */}
                        <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-carbon/75 dark:text-white/75 line-clamp-2 min-h-[38px]">
                          {repo.description ||
                            details?.overview ||
                            "Cloud infrastructure automation, configuration templates, and DevOps pipeline scripts."}
                        </p>

                        {/* Technology Stack Badges */}
                        <div className="mt-4 flex flex-wrap gap-1.5 min-h-[28px] items-start">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="mono border border-border bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-medium text-carbon/75 transition-colors group-hover:border-cobalt/30 dark:bg-white/5 dark:border-white/10 dark:text-white/75"
                            >
                              #{tag.replace(/^#/, "")}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer: Aligned Metadata & Actions */}
                      <div className="mt-6 pt-4 border-t border-border dark:border-white/10">
                        {/* Language & Relative Update Time */}
                        <div className="flex items-center justify-between text-xs font-mono text-carbon/60 dark:text-white/60 mb-3.5">
                          {repo.language ? (
                            <span className="flex items-center gap-1.5 text-carbon/80 dark:text-white/80 font-medium text-[11px]">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: langColor }}
                              />
                              {repo.language}
                            </span>
                          ) : (
                            <span className="text-[11px] text-carbon/50 dark:text-white/50">
                              IaC / Config
                            </span>
                          )}

                          <span
                            className="mono text-[10px] text-muted-foreground flex items-center gap-1"
                            title="Last updated"
                          >
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(repo.pushed_at || repo.updated_at)}
                          </span>
                        </div>

                        {/* Bottom Action Buttons (Uniform across all cards) */}
                        <div className="flex items-center gap-2">
                          {/* GitHub Repository Link */}
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 mono inline-flex items-center justify-center gap-1.5 border border-carbon bg-white px-3 py-2 text-xs font-semibold text-carbon hover:border-cobalt hover:bg-cobalt hover:text-white transition-all dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-cobalt dark:hover:border-cobalt"
                            title={`Open ${repo.name} on GitHub`}
                          >
                            <Github className="h-3.5 w-3.5" />
                            <span>GitHub</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </a>

                          {/* Live Demo Link (If available) */}
                          {demoUrl ? (
                            <a
                              href={demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 mono inline-flex items-center justify-center gap-1.5 border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-colors dark:bg-emerald-950/40 dark:border-emerald-700/60 dark:text-emerald-300"
                              title={`Open live deployment at ${demoUrl}`}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>Live Demo</span>
                            </a>
                          ) : (
                            /* Architecture Details trigger if no demo URL */
                            <button
                              type="button"
                              onClick={() => setActiveModalRepo({ repo, details })}
                              className="mono inline-flex items-center justify-center gap-1 border border-border bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-carbon/80 hover:border-cobalt hover:bg-white hover:text-cobalt transition-colors dark:bg-white/5 dark:border-white/10 dark:text-white/80 cursor-pointer"
                              title="Inspect architecture blueprint"
                            >
                              <Code2 className="h-3.5 w-3.5" />
                              <span>Details</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* View More / Show Less Button & Expansion Controls */}
            {hasMoreProjects && (
              <div className="mt-12 flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleViewMore}
                  className="mono group inline-flex items-center gap-2.5 border border-carbon bg-white px-7 py-3 text-xs font-semibold text-carbon transition-all duration-300 hover:border-cobalt hover:bg-cobalt hover:text-white shadow-2xs dark:border-white/20 dark:bg-[#18191D] dark:text-white dark:hover:bg-cobalt cursor-pointer"
                  aria-expanded={showAll}
                >
                  <span>
                    {showAll
                      ? "Show Less"
                      : `View More Projects (${filteredRepos.length - INITIAL_PROJECT_LIMIT} more)`}
                  </span>
                  {showAll ? (
                    <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                  ) : (
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  )}
                </button>

                <span className="mono text-[11px] text-muted-foreground">
                  Showing {visibleProjects.length} of {filteredRepos.length} Projects
                </span>
              </div>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="border border-border bg-white dark:bg-[#18191D] dark:border-white/10 p-12 text-center shadow-2xs">
              <FolderGit2 className="mx-auto h-10 w-10 text-cobalt mb-3 opacity-60" />
              <h4 className="text-lg font-bold text-carbon dark:text-white">
                No projects found in this category
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Try selecting &ldquo;All Repositories&rdquo; to view Piyush&apos;s full open source
                collection.
              </p>
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className="mt-4 mono inline-flex items-center gap-2 bg-cobalt px-5 py-2 text-xs font-semibold text-white hover:bg-carbon transition-colors cursor-pointer"
              >
                VIEW ALL PROJECTS
              </button>
            </div>
          )
        )}
      </div>

      {/* Project Details Modal (Radix Dialog) */}
      <Dialog open={!!activeModalRepo} onOpenChange={(open) => !open && setActiveModalRepo(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#18191D] p-6 sm:p-8 border border-border dark:border-white/10 sm:rounded-none shadow-xl">
          {activeModalRepo && (
            <div>
              <DialogHeader className="text-left space-y-1.5 pb-4 border-b border-border dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono text-[10px] text-cobalt font-bold uppercase tracking-wider border border-cobalt/30 bg-cobalt/10 px-2 py-0.5">
                    {activeModalRepo.details?.categoryLabel || "Verified GitHub Project"}
                  </span>
                  <span className="mono text-[10px] text-carbon/60 dark:text-white/60 font-semibold border border-border dark:border-white/10 bg-[#FAF9F6] dark:bg-white/5 px-2 py-0.5">
                    <GitBranch className="inline h-2.5 w-2.5 mr-1" />
                    {activeModalRepo.repo.default_branch || "main"}
                  </span>
                  {activeModalRepo.repo.language && (
                    <span className="mono text-[10px] text-carbon/70 dark:text-white/70 font-semibold border border-border dark:border-white/10 bg-[#FAF9F6] dark:bg-white/5 px-2 py-0.5">
                      {activeModalRepo.repo.language}
                    </span>
                  )}
                </div>

                <DialogTitle className="text-2xl sm:text-3xl font-bold text-carbon dark:text-white tracking-tight">
                  {activeModalRepo.repo.name}
                </DialogTitle>

                <DialogDescription className="text-xs sm:text-sm text-carbon/75 dark:text-white/75 font-sans leading-relaxed">
                  {activeModalRepo.details?.overview ||
                    activeModalRepo.repo.description ||
                    "Cloud infrastructure automation and DevOps project."}
                </DialogDescription>
              </DialogHeader>

              {/* Modal Body: Verified Engineering Breakdown */}
              <div className="mt-6 space-y-6 text-sm text-carbon/85 dark:text-white/85">
                {/* Problem Solved */}
                {activeModalRepo.details?.problemSolved && (
                  <div>
                    <h4 className="mono text-xs font-bold text-cobalt uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-cobalt" />
                      Problem It Solves
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed text-carbon/80 dark:text-white/80 bg-[#FAF9F6] dark:bg-white/5 border border-border dark:border-white/10 p-3.5">
                      {activeModalRepo.details.problemSolved}
                    </p>
                  </div>
                )}

                {/* Key Features */}
                {activeModalRepo.details?.keyFeatures && (
                  <div>
                    <h4 className="mono text-xs font-bold text-cobalt uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-cobalt" />
                      Key Features &amp; Engineering Implementation
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm">
                      {activeModalRepo.details.keyFeatures.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <span className="text-cobalt font-bold shrink-0 mt-0.5">•</span>
                          <span className="text-carbon/85 dark:text-white/85">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Architecture & Workflow */}
                {activeModalRepo.details?.architecture && (
                  <div>
                    <h4 className="mono text-xs font-bold text-cobalt uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-cobalt" />
                      Architecture &amp; Workflow
                    </h4>
                    <div className="font-mono text-xs text-carbon/85 dark:text-white/85 bg-[#FAF9F6] dark:bg-white/5 border border-border dark:border-white/10 p-3.5 leading-relaxed">
                      {activeModalRepo.details.architecture}
                    </div>
                  </div>
                )}

                {/* Deployment Information */}
                {activeModalRepo.details?.deployment && (
                  <div>
                    <h4 className="mono text-xs font-bold text-cobalt uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Server className="h-4 w-4 text-cobalt" />
                      Deployment Environment
                    </h4>
                    <p className="text-xs sm:text-sm text-carbon/80 dark:text-white/80">
                      {activeModalRepo.details.deployment}
                    </p>
                  </div>
                )}

                {/* Technologies Stack Tags */}
                <div>
                  <h4 className="mono text-xs font-bold text-cobalt uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-cobalt" />
                    Technologies &amp; Tools Used
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      activeModalRepo.details?.technologies ||
                      activeModalRepo.repo.topics || [activeModalRepo.repo.language || "DevOps"]
                    ).map((tech) => (
                      <span
                        key={tech}
                        className="mono border border-border bg-[#FAF9F6] dark:bg-white/5 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-carbon dark:text-white"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="mt-8 pt-5 border-t border-border dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="mono text-[11px] text-muted-foreground flex items-center gap-3">
                  {activeModalRepo.repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {activeModalRepo.repo.stargazers_count} stars
                    </span>
                  )}
                  <span>
                    Updated{" "}
                    {formatRelativeTime(
                      activeModalRepo.repo.pushed_at || activeModalRepo.repo.updated_at,
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={activeModalRepo.repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mono inline-flex items-center gap-1.5 bg-cobalt px-4 py-2 text-xs font-semibold text-white hover:bg-carbon transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>VIEW ON GITHUB</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>

                  {(activeModalRepo.details?.liveDemoUrl || activeModalRepo.repo.homepage) && (
                    <a
                      href={activeModalRepo.details?.liveDemoUrl || activeModalRepo.repo.homepage!}
                      target="_blank"
                      rel="noreferrer"
                      className="mono inline-flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-700/60 dark:text-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>VISIT LIVE DEMO</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
