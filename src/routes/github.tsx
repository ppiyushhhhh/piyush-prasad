import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Github,
  Star,
  GitFork,
  GitBranch,
  Search,
  ExternalLink,
  ArrowUpRight,
  Calendar,
  Clock,
  Activity,
  Layers,
  Terminal,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  Users,
  BookOpen,
  MapPin,
  Building,
  CheckCircle2,
} from "lucide-react";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { GH_USER, GITHUB, SITE_URL } from "@/lib/site";
import {
  fetchGitHubProfile,
  fetchGitHubRepos,
  fetchGitHubCommit,
  formatRelativeTime,
  formatDateMonthYear,
  LANGUAGE_COLORS,
  type GitHubRepo,
} from "@/lib/github";

export const Route = createFileRoute("/github")({
  head: () => ({
    meta: [
      { title: "GitHub Repositories & Open Source | Piyush Prasad" },
      {
        name: "description",
        content:
          "Explore public repositories, automated CI/CD pipelines, AWS infrastructure scripts, and DevSecOps tooling by Piyush Prasad on GitHub.",
      },
      { property: "og:title", content: "GitHub Repositories & Open Source | Piyush Prasad" },
      {
        property: "og:description",
        content:
          "Explore public repositories, automated CI/CD pipelines, AWS infrastructure scripts, and DevSecOps tooling by Piyush Prasad on GitHub.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/github` },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GitHub Repositories & Open Source | Piyush Prasad" },
      {
        name: "twitter:description",
        content:
          "Explore public repositories, automated CI/CD pipelines, AWS infrastructure scripts, and DevSecOps tooling by Piyush Prasad on GitHub.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/github` }],
  }),
  component: DedicatedGithubPage,
});

type SortOption = "updated" | "stars" | "name" | "created";

function RepoCardItem({ repo }: { repo: GitHubRepo }) {
  const { data: commit } = useQuery({
    queryKey: ["commit", repo.name],
    queryFn: () => fetchGitHubCommit(repo.name, GH_USER),
    staleTime: 60 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] ?? "#06b6d4") : "#94a3b8";

  return (
    <article className="group flex flex-col justify-between border border-border bg-white p-6 transition-all duration-300 hover:border-cobalt hover:shadow-sm">
      <div>
        {/* Card Header: Branch & Visibility Badges */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] text-cobalt flex items-center gap-1 font-semibold">
              <GitBranch className="h-3 w-3" />
              {repo.default_branch || "main"}
            </span>
            <span className="border border-border bg-[#FAF9F6] px-1.5 py-0.5 text-[9px] font-mono text-carbon/60 uppercase">
              Public
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-carbon/60 font-mono">
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1 text-amber-600 font-semibold" title="Stars">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {repo.stargazers_count}
              </span>
            )}
            {repo.forks_count > 0 && (
              <span className="flex items-center gap-1" title="Forks">
                <GitFork className="h-3.5 w-3.5 text-carbon/50" />
                {repo.forks_count}
              </span>
            )}
          </div>
        </div>

        {/* Repository Name */}
        <div className="mt-3">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="group/title inline-flex items-center gap-1.5 font-bold text-lg text-carbon tracking-tight hover:text-cobalt transition-colors"
          >
            <span className="break-all">{repo.name}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 opacity-40 transition-transform group-hover/title:opacity-100 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 text-cobalt" />
          </a>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-carbon/75 line-clamp-3">
          {repo.description ||
            "Cloud infrastructure automation scripts, templates, and CI/CD configuration."}
        </p>

        {/* Topics / Tags */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="mono border border-border bg-[#FAF9F6] px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-carbon/70 group-hover:border-cobalt/30 transition-colors"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Commit */}
      <div className="mt-6 pt-4 border-t border-border">
        {/* Language & Dates */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-carbon/60 mb-3">
          {repo.language ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
              <span className="text-carbon/90 font-medium">{repo.language}</span>
            </span>
          ) : (
            <span className="text-carbon/50">Markdown / Config</span>
          )}

          <span
            className="flex items-center gap-1 text-[10px] text-muted-foreground"
            title="Last pushed"
          >
            <Clock className="h-3 w-3" />
            Pushed {formatRelativeTime(repo.pushed_at || repo.updated_at)}
          </span>
        </div>

        {/* Latest Commit Snippet */}
        {commit ? (
          <div className="border border-border bg-[#FAF9F6] p-2.5 mb-4">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-foreground font-mono font-semibold mb-1">
              <span className="flex items-center gap-1 text-cobalt">
                <Activity className="h-2.5 w-2.5" />
                Latest Commit
              </span>
              <span>{formatRelativeTime(commit.commit.author.date)}</span>
            </div>
            <p className="text-xs font-mono text-carbon/90 line-clamp-1 leading-snug">
              {commit.commit.message.split("\n")[0]}
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-carbon/50">
              <a
                href={commit.html_url ?? `${repo.html_url}/commit/${commit.sha}`}
                target="_blank"
                rel="noreferrer"
                className="text-cobalt hover:underline font-bold"
              >
                {commit.sha.slice(0, 7)}
              </a>
              <span className="text-[9px] text-carbon/50">by {commit.commit.author.name}</span>
            </div>
          </div>
        ) : (
          <div className="mono text-[10px] text-carbon/50 py-1 mb-4 flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-carbon/40" />
            Created {formatDateMonthYear(repo.created_at)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 mono inline-flex items-center justify-center gap-2 border border-carbon bg-white px-3 py-2 text-[11px] font-semibold text-carbon transition-all hover:border-cobalt hover:bg-cobalt hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            <span>VIEW REPOSITORY</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>

          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noreferrer"
              className="mono inline-flex items-center justify-center border border-border bg-[#FAF9F6] p-2 text-carbon/75 transition-all hover:border-cobalt hover:bg-white hover:text-cobalt"
              title={`Visit live URL: ${repo.homepage}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function DedicatedGithubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");

  // Fetch Profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["github-profile", GH_USER],
    queryFn: () => fetchGitHubProfile(GH_USER),
    staleTime: 30 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch Repositories
  const {
    data: repos,
    isLoading: isReposLoading,
    error: reposError,
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

  // Extract all available languages
  const availableLanguages = useMemo(() => {
    if (!repos) return [];
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

  // Filter & Sort Repositories
  const filteredAndSortedRepos = useMemo(() => {
    if (!repos) return [];

    let list = repos.filter((repo) => {
      // Language filter
      if (selectedLanguage !== "all" && repo.language !== selectedLanguage) {
        return false;
      }

      // Search query filter (matches name, description, or topics)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = repo.name.toLowerCase().includes(query);
        const matchDesc = (repo.description ?? "").toLowerCase().includes(query);
        const matchTopic = (repo.topics ?? []).some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchTopic) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "stars") {
        return (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // default: updated / pushed_at
      const dateA = new Date(a.pushed_at || a.updated_at).getTime();
      const dateB = new Date(b.pushed_at || b.updated_at).getTime();
      return dateB - dateA;
    });

    return list;
  }, [repos, searchQuery, selectedLanguage, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSortBy("updated");
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-carbon selection:bg-cobalt selection:text-white">
      <CustomCursor />
      <Navigation />

      <main className="relative z-10 pt-24 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Section Breadcrumb Eyebrow */}
          <div className="mono mb-4 flex items-center gap-3 text-[11px] font-medium text-carbon/60">
            <span className="inline-flex items-center gap-1.5 font-bold text-cobalt">
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
              OPEN SOURCE &amp; CODE
            </span>
            <span className="text-carbon/30">/</span>
            <span className="tracking-[0.16em] text-carbon/80">GITHUB DASHBOARD</span>
            <span className="ml-3 h-px flex-1 bg-border" />
          </div>

          {/* Profile Overview Card */}
          <div className="border border-border bg-white p-6 sm:p-8 md:p-10 shadow-2xs mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* User Bio & Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden border border-border bg-[#FAF9F6]">
                  <img
                    src={profile?.avatar_url || `https://github.com/${GH_USER}.png`}
                    alt={profile?.name || "Piyush Prasad"}
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                    title="Active on GitHub"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-carbon">
                      {profile?.name || "Piyush Prasad"}
                    </h1>
                    <span className="mono border border-border bg-[#FAF9F6] px-2.5 py-0.5 text-xs font-semibold text-cobalt">
                      @{profile?.login || GH_USER}
                    </span>
                  </div>

                  <p className="mt-2.5 max-w-2xl text-sm sm:text-base leading-relaxed text-carbon/75">
                    {profile?.bio ||
                      "Cloud & DevOps Engineer specializing in AWS cloud infrastructure, Linux server administration, Docker containerization, and CI/CD pipelines."}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
                    {profile?.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-cobalt" />
                        {profile.location}
                      </span>
                    )}
                    {profile?.company && (
                      <span className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-cobalt" />
                        {profile.company}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-cobalt" />
                      Member since{" "}
                      {formatDateMonthYear(profile?.created_at || "2022-04-10T12:00:00Z")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Counters & CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8 shrink-0">
                <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
                  <div className="border border-border bg-[#FAF9F6] p-3 text-center min-w-[90px]">
                    <div className="mono text-[10px] text-muted-foreground uppercase">Repos</div>
                    <div className="text-xl sm:text-2xl font-bold text-carbon">
                      {profile?.public_repos ?? repos?.length ?? 6}
                    </div>
                  </div>
                  <div className="border border-border bg-[#FAF9F6] p-3 text-center min-w-[90px]">
                    <div className="mono text-[10px] text-muted-foreground uppercase">
                      Followers
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-carbon">
                      {profile?.followers ?? 12}
                    </div>
                  </div>
                  <div className="border border-border bg-[#FAF9F6] p-3 text-center min-w-[90px]">
                    <div className="mono text-[10px] text-muted-foreground uppercase">
                      Following
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-carbon">
                      {profile?.following ?? 14}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <a
                    href="https://github.com/ppiyushhhhh?tab=repositories"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial mono inline-flex items-center justify-center gap-2 bg-cobalt px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-carbon hover:shadow-sm"
                  >
                    <Github className="h-4 w-4" />
                    <span>Explore All Projects on GitHub</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="mono inline-flex items-center justify-center gap-1.5 border border-border bg-white px-3 py-2.5 text-xs text-carbon/75 hover:border-cobalt hover:text-cobalt transition-colors"
                    title="Refresh data from GitHub REST API"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-cobalt" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="border border-border bg-white p-5 sm:p-6 mb-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-carbon/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repositories by name, description, or topic..."
                  className="w-full border border-border bg-[#FAF9F6] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-carbon placeholder:text-carbon/40 focus:border-cobalt focus:bg-white focus:outline-hidden transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mono text-[10px] text-muted-foreground hover:text-carbon uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="mono text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5 text-cobalt" />
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="border border-border bg-[#FAF9F6] px-3 py-2 text-xs font-mono font-medium text-carbon focus:border-cobalt focus:outline-hidden cursor-pointer"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="stars">Most Stars</option>
                  <option value="name">Repository Name (A–Z)</option>
                  <option value="created">Date Created (Newest)</option>
                </select>
              </div>
            </div>

            {/* Language Filter Pills */}
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
              <span className="mono text-[11px] text-muted-foreground font-semibold uppercase mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3 text-cobalt" />
                Language:
              </span>

              <button
                type="button"
                onClick={() => setSelectedLanguage("all")}
                className={`mono px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  selectedLanguage === "all"
                    ? "bg-cobalt text-white shadow-2xs"
                    : "bg-[#FAF9F6] border border-border text-carbon/75 hover:border-cobalt hover:text-cobalt"
                }`}
              >
                All ({repos?.length ?? 0})
              </button>

              {availableLanguages.map((lang) => {
                const count = (repos ?? []).filter((r) => r.language === lang).length;
                const dotColor = LANGUAGE_COLORS[lang] ?? "#06b6d4";
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguage(lang)}
                    className={`mono inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      selectedLanguage === lang
                        ? "bg-cobalt text-white shadow-2xs"
                        : "bg-[#FAF9F6] border border-border text-carbon/75 hover:border-cobalt hover:text-cobalt"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: selectedLanguage === lang ? "#ffffff" : dotColor }}
                    />
                    <span>{lang}</span>
                    <span className="opacity-70 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Counter & API Status */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-carbon">
                Showing {filteredAndSortedRepos.length} of {repos?.length ?? 0} repositories
              </span>
              {(searchQuery || selectedLanguage !== "all") && (
                <button onClick={resetFilters} className="text-cobalt hover:underline text-[11px]">
                  (Reset filters)
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live REST API Ingestion
              </span>
              {dataUpdatedAt > 0 && (
                <span className="text-carbon/50">
                  Synced {formatRelativeTime(new Date(dataUpdatedAt).toISOString())}
                </span>
              )}
            </div>
          </div>

          {/* Loading Skeletons */}
          {isReposLoading && !repos && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="border border-border bg-white p-6 animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-carbon/10" />
                    <div className="h-4 w-12 bg-carbon/10" />
                  </div>
                  <div className="h-6 w-3/4 bg-carbon/10" />
                  <div className="h-14 w-full bg-carbon/5" />
                  <div className="h-8 w-full bg-carbon/5" />
                  <div className="h-9 w-full bg-carbon/10" />
                </div>
              ))}
            </div>
          )}

          {/* Error Notice */}
          {reposError && (
            <div className="mono border border-rose-300 bg-rose-50 p-6 text-xs text-rose-800 mb-8">
              {(reposError as Error).message} — displaying cached repository snapshots.
            </div>
          )}

          {/* Repository Cards Grid */}
          {filteredAndSortedRepos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedRepos.map((repo) => (
                <RepoCardItem key={repo.id} repo={repo} />
              ))}
            </div>
          ) : (
            !isReposLoading && (
              <div className="border border-border bg-white p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-[#FAF9F6] text-cobalt mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-carbon">No matching repositories found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  No repositories matched your search query &ldquo;{searchQuery}&rdquo; or selected
                  language filter.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mono inline-flex items-center gap-2 bg-cobalt px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-carbon"
                  >
                    RESET ALL FILTERS
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
      <CommandPalette />
      <AskPiyushAI />
    </div>
  );
}
