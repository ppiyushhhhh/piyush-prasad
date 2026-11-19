import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Star,
  GitFork,
  Clock,
  Calendar,
  Layers,
  Server,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Activity,
  Cpu,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { ArchitectureDiagram } from "@/components/portfolio/ArchitectureDiagram";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import {
  fetchProjectBySlug,
  fetchPublishedProjects,
  STATUS_STYLES,
  type PortfolioProject,
} from "@/lib/portfolio-projects";
import { fetchGitHubRepos, type GitHubRepo } from "@/lib/github";
import { GH_USER, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => {
    return {
      meta: [
        { title: `Case Study: ${params.slug} | Piyush Prasad` },
        {
          name: "description",
          content: `In-depth cloud engineering case study and technical architecture for ${params.slug} by Piyush Prasad.`,
        },
        { property: "og:type", content: "article" },
        { property: "og:title", content: `Case Study: ${params.slug} | Piyush Prasad` },
        {
          property: "og:description",
          content: `In-depth cloud engineering case study and technical architecture for ${params.slug} by Piyush Prasad.`,
        },
        { property: "og:url", content: `${SITE_URL}/projects/${params.slug}` },
        { property: "og:image", content: `${SITE_URL}/og-image.png` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/projects/${params.slug}` }],
    };
  },
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { slug } = useParams({ from: "/projects/$slug" });
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch target project
  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["portfolio-project", slug],
    queryFn: () => fetchProjectBySlug(slug),
    staleTime: 5 * 60_000,
  });

  // Fetch all projects for Prev/Next and Related navigation
  const { data: allProjects = [] } = useQuery({
    queryKey: ["portfolio-projects-public"],
    queryFn: fetchPublishedProjects,
    staleTime: 10 * 60_000,
  });

  // Fetch GitHub repos for live star/fork metadata
  const { data: gitHubRepos } = useQuery({
    queryKey: ["github-repos", GH_USER],
    queryFn: () => fetchGitHubRepos(GH_USER),
    staleTime: 30 * 60_000,
    retry: false,
  });

  // Match live GitHub repo if repository_url points to GitHub
  const liveRepo = useMemo<GitHubRepo | null>(() => {
    if (!project?.repository_url || !gitHubRepos) return null;
    const repoName = project.repository_url.split("/").pop()?.toLowerCase();
    return gitHubRepos.find((r) => r.name.toLowerCase() === repoName) || null;
  }, [project, gitHubRepos]);

  // Compute Prev and Next projects
  const { prevProject, nextProject } = useMemo(() => {
    const currentIndex = allProjects.findIndex((p) => p.slug === slug);
    if (currentIndex === -1) return { prevProject: null, nextProject: null };

    const prev = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
    const next = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
    return { prevProject: prev, nextProject: next };
  }, [allProjects, slug]);

  // Compute Related projects (same category or shared tech, excluding self)
  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return allProjects
      .filter((p) => p.slug !== project.slug)
      .filter(
        (p) =>
          p.category === project.category ||
          p.technologies.some((t) => project.technologies.includes(t)),
      )
      .slice(0, 3);
  }, [allProjects, project]);

  // Table of Contents definition dynamically filtered by available content
  const tocSections = useMemo(() => {
    if (!project) return [];
    const list: { id: string; label: string }[] = [{ id: "overview", label: "Overview" }];

    if (project.problem_solved) list.push({ id: "problem", label: "Problem Statement" });
    if (project.objectives) list.push({ id: "objectives", label: "Objectives" });
    if (project.solution) list.push({ id: "solution", label: "Solution Architecture" });
    if (project.technologies && project.technologies.length > 0)
      list.push({ id: "technologies", label: "Technologies Used" });
    if (project.architecture_description || project.architecture_data)
      list.push({ id: "architecture", label: "System Architecture" });
    if (project.implementation_details)
      list.push({ id: "implementation", label: "Implementation Workflow" });
    if (project.cicd_details) list.push({ id: "cicd", label: "CI/CD Pipeline" });
    if (project.security_details) list.push({ id: "security", label: "Security Controls" });
    if (project.challenges) list.push({ id: "challenges", label: "Challenges & Solutions" });
    if (project.results) list.push({ id: "results", label: "Results & Outcomes" });
    if (project.screenshots && project.screenshots.length > 0)
      list.push({ id: "screenshots", label: "Technical Artifacts" });
    if (project.repository_url) list.push({ id: "repository", label: "Repository & Code" });
    if (relatedProjects.length > 0) list.push({ id: "related", label: "Related Projects" });

    return list;
  }, [project, relatedProjects]);

  // Scroll spy observer for sticky TOC
  useEffect(() => {
    if (!project) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    tocSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [project, tocSections]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Case study link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[#FAF9F6] dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
        <Navigation />
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cobalt border-t-transparent" />
          <span className="mono text-xs text-muted-foreground">Loading case study...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="relative min-h-screen bg-[#FAF9F6] dark:bg-neutral-950 flex flex-col justify-between">
        <Navigation />
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-carbon dark:text-white">Project Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The project case study with slug{" "}
            <code className="mono font-semibold text-cobalt">"{slug}"</code> does not exist or has
            not been published yet.
          </p>
          <div className="mt-6">
            <Link
              to="/projects"
              className="mono inline-flex items-center gap-2 rounded-md bg-cobalt px-4 py-2 text-xs font-bold text-white hover:bg-cobalt/90 shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Projects</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusConfig = STATUS_STYLES[project.status] || STATUS_STYLES["Personal Project"];

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-carbon selection:bg-cobalt selection:text-white dark:bg-neutral-950 dark:text-neutral-100">
      <CustomCursor />
      <Navigation />

      <main className="relative z-10 pt-28 pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Breadcrumb Navigation */}
          <nav
            className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-cobalt transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <Link to="/projects" className="hover:text-cobalt transition-colors">
              Projects
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-carbon dark:text-white font-medium truncate max-w-[200px] md:max-w-md">
              {project.title}
            </span>
          </nav>

          {/* Project Title Header Banner */}
          <header className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-10 shadow-xs mb-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category */}
                <span className="mono rounded-sm border border-cobalt/30 bg-blue-50/60 dark:bg-blue-950/30 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cobalt">
                  {project.category}
                </span>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>

                {/* Featured Badge */}
                {project.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Featured Project
                  </span>
                )}
              </div>

              {/* Share & Copy Action */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="mono inline-flex items-center gap-1.5 rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-carbon/80 hover:border-cobalt hover:text-cobalt transition-colors"
                title="Copy case study link"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Share Case Study</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-carbon dark:text-white leading-tight">
              {project.title}
            </h1>

            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
              {project.short_description}
            </p>

            {/* Metadata Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-y-3 gap-x-6 border-t border-border/80 pt-6 text-xs text-muted-foreground">
              {project.deployment_environment && (
                <div className="flex items-center gap-1.5">
                  <Server className="h-4 w-4 text-cobalt" />
                  <span>Deployment:</span>
                  <span className="mono font-semibold text-carbon dark:text-white">
                    {project.deployment_environment}
                  </span>
                </div>
              )}

              {project.started_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Initiated:</span>
                  <span className="mono text-carbon dark:text-white">{project.started_at}</span>
                </div>
              )}

              {project.updated_at_date && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last Verified:</span>
                  <span className="mono text-carbon dark:text-white">
                    {project.updated_at_date}
                  </span>
                </div>
              )}

              {/* External CTAs */}
              <div className="ml-auto flex items-center gap-3">
                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-carbon hover:border-cobalt hover:text-cobalt transition-colors shadow-2xs"
                  >
                    <Github className="h-4 w-4" />
                    <span>View Repository</span>
                  </a>
                )}

                {project.live_demo_url && (
                  <a
                    href={project.live_demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-cobalt px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cobalt/90 transition-colors shadow-2xs"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Two-Column Layout: Sticky TOC + Detailed Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sticky Table of Contents (Desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 rounded-xl border border-border bg-white dark:bg-neutral-900 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/80">
                  <Layers className="h-4 w-4 text-cobalt" />
                  <span className="mono text-xs font-bold uppercase tracking-wider text-carbon dark:text-white">
                    Case Study Contents
                  </span>
                </div>
                <nav className="flex flex-col space-y-1" aria-label="Table of Contents">
                  {tocSections.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`text-xs py-1.5 px-2.5 rounded transition-colors text-left flex items-center justify-between ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/40 text-cobalt font-bold border-l-2 border-cobalt"
                            : "text-muted-foreground hover:text-carbon hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />}
                      </a>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-4 border-t border-border/80">
                  <Link
                    to="/projects"
                    className="mono inline-flex items-center gap-1 text-xs text-cobalt hover:underline font-semibold"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to all projects</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Case Study Detailed Sections */}
            <div className="lg:col-span-9 space-y-12">
              {/* Section 1: Overview */}
              <section id="overview" className="scroll-mt-28">
                <div className="flex items-center gap-2 mb-3">
                  <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                    01 // Executive Summary
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                  Project Overview
                </h2>
                <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {project.overview}
                </div>
              </section>

              {/* Section 2: Problem Statement */}
              {project.problem_solved && (
                <section id="problem" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      02 // Problem Space
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    The Problem Statement
                  </h2>
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 dark:bg-amber-950/20 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.problem_solved}
                  </div>
                </section>
              )}

              {/* Section 3: Objectives */}
              {project.objectives && (
                <section id="objectives" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      03 // Architectural Goals
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Key Objectives
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.objectives}
                  </div>
                </section>
              )}

              {/* Section 4: Solution */}
              {project.solution && (
                <section id="solution" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      04 // Engineering Approach
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    The Solution
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.solution}
                  </div>
                </section>
              )}

              {/* Section 5: Technologies Used */}
              {project.technologies.length > 0 && (
                <section id="technologies" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      05 // Technology Stack
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Technologies & Cloud Services
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <div
                          key={tech}
                          className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-[#FAF9F6] dark:bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-carbon dark:text-neutral-200 shadow-2xs hover:border-cobalt transition-colors"
                        >
                          <Terminal className="h-3 w-3 text-cobalt" />
                          <span>{tech}</span>
                        </div>
                      ))}
                    </div>

                    {project.key_features && project.key_features.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          Verified Key Capabilities
                        </h4>
                        <ul className="space-y-2 text-xs md:text-sm text-neutral-700 dark:text-neutral-300">
                          {project.key_features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Section 6: System Architecture Diagram */}
              {(project.architecture_data || project.architecture_description) && (
                <section id="architecture" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      06 // Technical Architecture
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Infrastructure & Traffic Topology
                  </h2>

                  {/* Architecture Diagram Visualization */}
                  {project.architecture_data ? (
                    <ArchitectureDiagram data={project.architecture_data} />
                  ) : null}

                  {project.architecture_description && (
                    <div className="mt-4 rounded-lg border border-border bg-white dark:bg-neutral-900 p-5 text-xs md:text-sm text-muted-foreground leading-relaxed">
                      <span className="mono text-xs font-bold text-carbon dark:text-white block mb-1">
                        Architecture Flow Description:
                      </span>
                      {project.architecture_description}
                    </div>
                  )}
                </section>
              )}

              {/* Section 7: Implementation Workflow */}
              {project.implementation_details && (
                <section id="implementation" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      07 // Implementation
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Implementation Workflow
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.implementation_details}
                  </div>
                </section>
              )}

              {/* Section 8: CI/CD Pipeline */}
              {project.cicd_details && (
                <section id="cicd" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      08 // Automation Pipeline
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    CI/CD Pipeline & Delivery Workflow
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.cicd_details}
                  </div>
                </section>
              )}

              {/* Section 9: Security Implementation */}
              {project.security_details && (
                <section id="security" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      09 // Security Architecture
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Security Controls & Vulnerability Mitigation
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.security_details}
                  </div>
                </section>
              )}

              {/* Section 10: Challenges & Troubleshooting */}
              {project.challenges && (
                <section id="challenges" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      10 // Troubleshooting
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Challenges & Troubleshooting
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.challenges}
                  </div>
                </section>
              )}

              {/* Section 11: Results & Outcomes */}
              {project.results && (
                <section id="results" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      11 // Verified Outcomes
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Results & Measurable Outcomes
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-xs text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {project.results}
                  </div>
                </section>
              )}

              {/* Section 12: Screenshots / Technical Evidence */}
              {project.screenshots && project.screenshots.length > 0 && (
                <section id="screenshots" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      12 // Visual Evidence
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    Screenshots & Technical Evidence
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.screenshots.map((shot, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-lg border border-border bg-white dark:bg-neutral-900 shadow-xs"
                      >
                        <img
                          src={shot}
                          alt={`${project.title} screenshot ${idx + 1}`}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 13: Repository & Live Stats */}
              {project.repository_url && (
                <section id="repository" className="scroll-mt-28">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      13 // Source Code
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-4">
                    GitHub Repository & Metadata
                  </h2>
                  <div className="rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-carbon dark:text-white">
                          <Github className="h-5 w-5 text-cobalt" />
                          <span>{project.repository_url.replace("https://github.com/", "")}</span>
                        </div>
                        {liveRepo?.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {liveRepo.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {liveRepo && (
                          <div className="flex items-center gap-3 mono text-xs text-muted-foreground border-r border-border pr-3">
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                              {liveRepo.stargazers_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="h-3.5 w-3.5 text-cobalt" />
                              {liveRepo.forks_count}
                            </span>
                          </div>
                        )}

                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono inline-flex items-center gap-1.5 rounded-md bg-carbon px-3 py-1.5 text-xs font-semibold text-white hover:bg-carbon/90 dark:bg-white dark:text-neutral-950 transition-colors"
                        >
                          <span>Open Repository</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <section id="related" className="scroll-mt-28 border-t border-border pt-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                      14 // Related Systems
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white mb-6">
                    Related Engineering Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedProjects.map((rel) => (
                      <ProjectCard key={rel.id} project={rel} />
                    ))}
                  </div>
                </section>
              )}

              {/* Prev / Next Project Navigation Bar */}
              <div className="border-t border-border pt-8 flex flex-wrap items-center justify-between gap-4">
                {prevProject ? (
                  <Link
                    to="/projects/$slug"
                    params={{ slug: prevProject.slug }}
                    className="group flex flex-col items-start p-3 rounded-lg border border-border bg-white dark:bg-neutral-900 hover:border-cobalt transition-colors max-w-xs"
                  >
                    <span className="mono text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                      <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                      Previous Project
                    </span>
                    <span className="text-xs font-bold text-carbon dark:text-white truncate w-full mt-1">
                      {prevProject.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextProject ? (
                  <Link
                    to="/projects/$slug"
                    params={{ slug: nextProject.slug }}
                    className="group flex flex-col items-end p-3 rounded-lg border border-border bg-white dark:bg-neutral-900 hover:border-cobalt transition-colors max-w-xs text-right"
                  >
                    <span className="mono text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                      Next Project
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="text-xs font-bold text-carbon dark:text-white truncate w-full mt-1">
                      {nextProject.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CommandPalette />
      <AskPiyushAI />
    </div>
  );
}
