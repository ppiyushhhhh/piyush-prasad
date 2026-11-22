import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";

import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectTableOfContents } from "@/components/projects/ProjectTableOfContents";
import { ProjectOverview } from "@/components/projects/ProjectOverview";
import { ProjectProblemSolution } from "@/components/projects/ProjectProblemSolution";
import { ProjectKeyFeatures } from "@/components/projects/ProjectKeyFeatures";
import { ProjectArchitectureSection } from "@/components/projects/ProjectArchitectureSection";
import { ProjectImplementationNotes } from "@/components/projects/ProjectImplementationNotes";
import { ProjectTechStackGrid } from "@/components/projects/ProjectTechStackGrid";
import { ProjectResultsNextSteps } from "@/components/projects/ProjectResultsNextSteps";

import {
  fetchProjectBySlug,
  fetchPublishedProjects,
  INITIAL_PORTFOLIO_PROJECTS,
} from "@/lib/portfolio-projects";
import { SITE_URL } from "@/lib/site";

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
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: `Case Study: ${params.slug} | Piyush Prasad`,
        },
        {
          name: "twitter:description",
          content: `In-depth cloud engineering case study and technical architecture for ${params.slug} by Piyush Prasad.`,
        },
        { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
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
    initialData: () => INITIAL_PORTFOLIO_PROJECTS.find((p) => p.slug.toLowerCase() === slug.toLowerCase()),
    staleTime: 5 * 60_000,
  });

  // Fetch all projects for Prev/Next and Related navigation
  const { data: allProjects = [] } = useQuery({
    queryKey: ["portfolio-projects-public"],
    queryFn: fetchPublishedProjects,
    staleTime: 10 * 60_000,
  });

  // Compute Prev and Next projects
  const { prevProject, nextProject } = useMemo(() => {
    const currentIndex = allProjects.findIndex((p) => p.slug === slug);
    if (currentIndex === -1) return { prevProject: null, nextProject: null };

    const prev = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
    const next = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
    return { prevProject: prev, nextProject: next };
  }, [allProjects, slug]);

  // Compute Related projects
  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return allProjects
      .filter((p) => p.slug !== project.slug)
      .filter(
        (p) =>
          p.category === project.category ||
          p.technologies.some((t) => project.technologies.includes(t))
      )
      .slice(0, 3);
  }, [allProjects, project]);

  // Table of Contents definition dynamically filtered by available content
  const tocSections = useMemo(() => {
    if (!project) return [];
    const list: { id: string; label: string }[] = [{ id: "overview", label: "Overview" }];

    if (project.problem_solved || project.solution)
      list.push({ id: "problem", label: "Problem & Solution" });
    if (project.key_features && project.key_features.length > 0)
      list.push({ id: "features", label: "Key Features" });
    if (project.architecture_data || project.architecture_description)
      list.push({ id: "architecture", label: "System Architecture" });
    if (project.implementation_details || project.cicd_details || project.security_details)
      list.push({ id: "implementation", label: "Implementation & CI/CD" });
    if (project.technologies && project.technologies.length > 0)
      list.push({ id: "technologies", label: "Tech Stack" });
    if (project.results) list.push({ id: "results", label: "Outcomes & Results" });
    if (project.screenshots && project.screenshots.length > 0)
      list.push({ id: "screenshots", label: "Artifacts" });
    if (relatedProjects.length > 0) list.push({ id: "related", label: "Related Projects" });

    return list;
  }, [project, relatedProjects]);

  // Scroll spy observer for sticky TOC
  useEffect(() => {
    if (!project || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
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

  // Structured Data (JSON-LD) for SEO
  const jsonLd = useMemo(() => {
    if (!project) return null;
    return {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: project.title,
      description: project.short_description,
      author: {
        "@type": "Person",
        name: "Piyush Prasad",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Person",
        name: "Piyush Prasad",
      },
      url: `${SITE_URL}/projects/${project.slug}`,
      datePublished: project.created_at,
      dateModified: project.updated_at,
      keywords: project.technologies.join(", "),
    };
  }, [project]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Navigation />
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="mono text-xs text-muted-foreground">Loading case study...</span>
        </div>
      </div>
    );
  }

  if (!project || error) {
    return (
      <div className="relative min-h-screen bg-background flex flex-col justify-between">
        <Navigation />
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-warning mb-4" />
          <h1 className="text-2xl font-bold text-text">Project Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The project case study with slug{" "}
            <code className="mono font-semibold text-accent">"{slug}"</code> does not exist or has
            not been published yet.
          </p>
          <div className="mt-6">
            <Link
              to="/projects"
              className="mono inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-bold text-text-on-accent hover:bg-accent-hover shadow-sm"
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

  return (
    <div className="relative min-h-screen bg-background text-text selection:bg-accent selection:text-text-on-accent">
      <CustomCursor />
      <Navigation />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <main className="relative z-10 pt-28 pb-24">
        <div className="mx-auto max-w-[1280px] px-6">
          {/* Breadcrumb Navigation */}
          <nav
            className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <Link to="/projects" className="hover:text-accent transition-colors">
              Projects
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-text font-medium truncate max-w-[240px]">
              {project.title}
            </span>
          </nav>

          {/* Project Hero Section */}
          <ProjectHero
            project={project}
            copiedLink={copiedLink}
            onCopyLink={handleCopyLink}
          />

          {/* Mobile / Tablet Horizontal Scroll-Spy Bar (< 1024px) */}
          <div className="lg:hidden sticky top-[64px] z-20 -mx-6 px-6 py-2.5 bg-background/95 backdrop-blur-md border-b border-border overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {tocSections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`mono text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shrink-0 ${isActive
                    ? "bg-accent text-text-on-accent font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-text bg-surface border border-border"
                    }`}
                >
                  {section.label}
                </a>
              );
            })}
          </div>

          {/* Main Case Study Body with Desktop Sticky Sidebar */}
          <div className="mt-10 flex flex-col lg:flex-row gap-10 items-start">
            {/* Main Content Column */}
            <div className="w-full flex-1 min-w-0 space-y-12">
              {/* 1. Overview */}
              <ProjectOverview project={project} />

              {/* 2. Problem & Solution */}
              <ProjectProblemSolution project={project} />

              {/* 3. Key Features */}
              <ProjectKeyFeatures project={project} />

              {/* 4. Full-width Architecture Diagram */}
              <ProjectArchitectureSection project={project} />

              {/* 5. Implementation Notes & CI/CD */}
              <ProjectImplementationNotes project={project} />

              {/* 6. Tech Stack Grid */}
              <ProjectTechStackGrid project={project} />

              {/* 7. Results, Artifacts, Prev/Next & Related Projects */}
              <ProjectResultsNextSteps
                project={project}
                prevProject={prevProject}
                nextProject={nextProject}
                relatedProjects={relatedProjects}
              />
            </div>

            {/* Desktop Sticky Table of Contents */}
            <ProjectTableOfContents
              sections={tocSections}
              activeSection={activeSection}
            />
          </div>
        </div>
      </main>

      <Footer />
      <CommandPalette />
      <AskPiyushAI />
    </div>
  );
}
