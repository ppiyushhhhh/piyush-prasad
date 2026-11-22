import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FolderGit2,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Server,
  Terminal,
  Shield,
  Layers,
  CheckCircle2,
  ExternalLink,
  Github,
  X,
  RefreshCw,
} from "lucide-react";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import {
  fetchPublishedProjects,
  PROJECT_CATEGORIES,
  type PortfolioProject,
  type ProjectStatus,
} from "@/lib/portfolio-projects";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Engineering Projects & Technical Case Studies | Piyush Prasad" },
      {
        name: "description",
        content:
          "Explore real-world cloud engineering projects, CI/CD pipelines, AWS architectures, DevSecOps implementations, and Docker monitoring systems by Piyush Prasad.",
      },
      {
        property: "og:title",
        content: "Engineering Projects & Technical Case Studies | Piyush Prasad",
      },
      {
        property: "og:description",
        content:
          "Explore real-world cloud engineering projects, CI/CD pipelines, AWS architectures, DevSecOps implementations, and Docker monitoring systems by Piyush Prasad.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/projects` },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Engineering Projects & Technical Case Studies | Piyush Prasad",
      },
      {
        name: "twitter:description",
        content:
          "Explore real-world cloud engineering projects, CI/CD pipelines, AWS architectures, DevSecOps implementations, and Docker monitoring systems by Piyush Prasad.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/projects` }],
  }),

  component: ProjectsIndexPage,
});

function ProjectsIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "order" | "title">("featured");

  const {
    data: projects = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-projects-public"],
    queryFn: fetchPublishedProjects,
    staleTime: 10 * 60_000,
  });

  // Extract all unique technology tags across projects
  const allTechnologies = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.technologies.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = project.title.toLowerCase().includes(q);
          const matchesDesc = project.short_description.toLowerCase().includes(q);
          const matchesCategory = project.category.toLowerCase().includes(q);
          const matchesTech = project.technologies.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesTech) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "all" && project.category !== selectedCategory) {
          return false;
        }

        // Tech filter
        if (selectedTech !== "all" && !project.technologies.includes(selectedTech)) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "all" && project.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "featured") {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return a.display_order - b.display_order;
        }
        if (sortBy === "order") {
          return a.display_order - b.display_order;
        }
        return a.title.localeCompare(b.title);
      });
  }, [projects, searchQuery, selectedCategory, selectedTech, selectedStatus, sortBy]);

  const featuredProjects = useMemo(() => projects.filter((p) => p.is_featured), [projects]);

  return (
    <div className="relative min-h-screen bg-background text-text selection:bg-accent selection:text-text-on-accent">
      <CustomCursor />
      <Navigation />

      <main className="relative z-10 pt-28 pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Header Introduction */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="mono text-[11px] font-bold uppercase tracking-widest text-accent">
                Engineering Showcase
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="mono text-[11px] text-muted-foreground">
                Verified Architectures & Deployments
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text">
              Engineering Projects & Case Studies
            </h1>

            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              Explore in-depth technical case studies detailing production AWS cloud deployments,
              zero-downtime CI/CD delivery pipelines, Trivy DevSecOps controls, Docker observability
              stacks, and Infrastructure as Code.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="font-semibold text-text">
                  {projects.filter((p) => p.status === "Production").length} Production Deployments
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 shadow-2xs">
                <FolderGit2 className="h-4 w-4 text-accent" />
                <span className="font-semibold text-text">
                  {projects.length} Documented Systems
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 shadow-2xs">
                <Shield className="h-4 w-4 text-warning" />
                <span className="font-semibold text-text">
                  100% Real Repositories
                </span>
              </div>
            </div>
          </div>

          {/* Search, Filter & Controls Bar */}
          <div className="mt-10 rounded-xl border border-border bg-surface p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5">
              {/* Search Bar */}
              <div className="relative sm:col-span-2 md:col-span-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, technology, or keywords..."
                  className="w-full rounded-md border border-border bg-surface-muted pl-10 pr-9 py-2 text-xs focus:border-accent focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-text"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by project category"
                  className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-xs focus:border-accent focus:outline-hidden"
                >
                  <option value="all">All Categories ({projects.length})</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="md:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Filter by project status"
                  className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-xs focus:border-accent focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="Production">Production</option>
                  <option value="UAT">UAT</option>
                  <option value="Personal Project">Personal Project</option>
                  <option value="Development">Development</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "featured" | "order" | "title")}
                  aria-label="Sort projects"
                  className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-xs focus:border-accent focus:outline-hidden"
                >
                  <option value="featured">Featured First</option>
                  <option value="order">Curated Order</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills (Quick-Select) */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/70">
              <span className="mono text-[10px] font-bold text-muted-foreground mr-1 uppercase">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`mono rounded-full px-3 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-accent text-text-on-accent font-bold"
                    : "border border-border bg-surface-muted text-text/80 hover:border-accent"
                }`}
              >
                All ({projects.length})
              </button>
              {PROJECT_CATEGORIES.map((cat) => {
                const count = projects.filter((p) => p.category === cat).length;
                if (count === 0) return null;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? "all" : cat)}
                    className={`mono rounded-full px-3 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-accent text-text-on-accent font-bold"
                        : "border border-border bg-surface-muted text-text/80 hover:border-accent"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary & Refresh Button */}
          <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <strong className="text-text">{filteredProjects.length}</strong> of{" "}
              {projects.length} projects
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mono inline-flex items-center gap-1.5 text-xs text-accent hover:underline disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
              <span>Refresh Projects</span>
            </button>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-xl border border-dashed border-border bg-surface p-12 text-center">
              <FolderGit2 className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-bold text-text">
                No matching engineering projects
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your search query, clearing filters, or switching categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedTech("all");
                  setSelectedStatus("all");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-3 py-1.5 text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CommandPalette />
      <AskPiyushAI />
    </div>
  );
}
