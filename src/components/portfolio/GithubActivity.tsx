import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowUpRight,
  Github,
  Loader2,
  Plus,
  Minus,
  GitBranch,
  Star,
  GitFork,
  CheckCircle2,
  Code2,
  Terminal,
  Activity,
  Calendar,
} from "lucide-react";

import { SectionLabel } from "./SectionLabel";
import { GH_USER, GITHUB } from "@/lib/site";

/* ---------- GitHub Types & Caching ---------- */

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  stargazers_count?: number;
  forks_count?: number;
  topics?: string[];
  default_branch?: string;
};

type Commit = {
  sha: string;
  html_url?: string;
  commit: {
    message: string;
    author: { date: string; name?: string };
  };
};

const CACHE_VERSION = "v2";
const REQUEST_TIMEOUT_MS = 10_000;

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dockerfile: "#384d54",
  Go: "#00ADD8",
  Rust: "#dea584",
};

async function ghFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

const REPOS_TTL = 30 * 60_000; // 30 min fresh window
const COMMITS_TTL = 60 * 60_000; // 60 min fresh window
const CACHE_MAX_AGE = 7 * 24 * 60 * 60_000; // 7 day hard expiry

type CacheEntry<T> = { t: number; v: T };

function lsRead<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`gh:${CACHE_VERSION}:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed.t !== "number") return null;
    if (Date.now() - parsed.t > CACHE_MAX_AGE) return null;
    return parsed;
  } catch {
    return null;
  }
}

function lsWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `gh:${CACHE_VERSION}:${key}`,
      JSON.stringify({ t: Date.now(), v: value } satisfies CacheEntry<T>),
    );
  } catch {
    /* quota / private mode — ignore */
  }
}

async function fetchRepos(): Promise<Repo[]> {
  let res: Response;
  try {
    res = await ghFetch(
      `https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=12`,
    );
  } catch {
    const cached = lsRead<Repo[]>("repos");
    if (cached) return cached.v;
    throw new Error("Could not reach GitHub right now.");
  }
  if (!res.ok) {
    const cached = lsRead<Repo[]>("repos");
    if (cached) return cached.v;
    const rateLimited =
      res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0";
    throw new Error(
      rateLimited || res.status === 429
        ? "GitHub API rate limit reached — activity will refresh shortly."
        : "GitHub activity is temporarily unavailable.",
    );
  }
  const data = (await res.json()) as Repo[];
  const filtered = Array.isArray(data)
    ? data.filter((r) => !r.fork).slice(0, 10)
    : [];
  lsWrite("repos", filtered);
  return filtered;
}

async function fetchLatestCommit(repo: string): Promise<Commit | null> {
  try {
    const res = await ghFetch(
      `https://api.github.com/repos/${GH_USER}/${repo}/commits?per_page=1`,
    );
    if (!res.ok) {
      const cached = lsRead<Commit | null>(`commit:${repo}`);
      return cached ? cached.v : null;
    }
    const data = (await res.json()) as any[];
    const latest = Array.isArray(data) && data[0]
      ? {
          sha: data[0].sha,
          html_url: data[0].html_url,
          commit: {
            message: data[0].commit?.message ?? "Update repository",
            author: {
              date: data[0].commit?.author?.date ?? new Date().toISOString(),
              name: data[0].commit?.author?.name ?? GH_USER,
            },
          },
        }
      : null;
    lsWrite(`commit:${repo}`, latest);
    return latest;
  } catch {
    const cached = lsRead<Commit | null>(`commit:${repo}`);
    return cached ? cached.v : null;
  }
}

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const day = 86400000;
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (diff < day) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < day * 2) return "yesterday";
  if (diff < day * 30) return `${Math.floor(diff / day)}d ago`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))}mo ago`;
  return `${Math.floor(diff / (day * 365))}y ago`;
}

/* ---------- Repository Card Component ---------- */

function RepoCard({ repo }: { repo: Repo }) {
  const { data: commit } = useQuery({
    queryKey: ["commit", repo.name],
    queryFn: () => fetchLatestCommit(repo.name),
    staleTime: COMMITS_TTL,
    gcTime: CACHE_MAX_AGE,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] ?? "#06b6d4" : "#94a3b8";

  // Derive contextual topic tags if not present
  const tags =
    repo.topics && repo.topics.length > 0
      ? repo.topics.slice(0, 3)
      : repo.name.toLowerCase().includes("pipeline") || repo.name.toLowerCase().includes("sentinel")
      ? ["devops", "ci-cd", "cloud"]
      : repo.name.toLowerCase().includes("aws") || repo.name.toLowerCase().includes("onix")
      ? ["aws", "monitoring", "linux"]
      : ["open-source", repo.language?.toLowerCase() ?? "devops"];

  return (
    <div className="group flex flex-col justify-between border border-border bg-white p-6 transition-all duration-300 hover:border-cobalt hover:shadow-2xs">
      <div>
        {/* Header: Repo Name & External Link */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] text-cobalt flex items-center gap-1 font-semibold">
                <GitBranch className="h-3 w-3" />
                {repo.default_branch ?? "main"}
              </span>
              <span className="border border-border bg-[#FAF9F6] px-1.5 py-0.5 text-[9px] font-mono text-carbon/60 uppercase">
                Public
              </span>
            </div>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 block font-bold text-base text-carbon tracking-tight group-hover:text-cobalt transition-colors truncate"
            >
              {repo.name}
            </a>
          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`View ${repo.name} on GitHub`}
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-carbon/60 transition-all group-hover:border-cobalt group-hover:bg-cobalt group-hover:text-white"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-carbon/75 line-clamp-2">
          {repo.description || "Cloud infrastructure automation, configuration templates, and DevOps pipeline scripts."}
        </p>

        {/* Topic Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="mono border border-border bg-[#FAF9F6] px-2 py-0.5 text-[9px] font-medium text-carbon/70 group-hover:border-cobalt/30 transition-colors"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Latest Commit & Metrics */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-[11px] text-carbon/60 mb-2">
          <span className="mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
            <Activity className="h-3 w-3 text-cobalt" />
            Latest Commit
          </span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                <span className="text-carbon/80">{repo.language}</span>
              </span>
            )}
            {(repo.stargazers_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-carbon/70">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                {repo.stargazers_count}
              </span>
            )}
            {(repo.forks_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-carbon/70">
                <GitFork className="h-3 w-3" />
                {repo.forks_count}
              </span>
            )}
          </div>
        </div>

        {commit ? (
          <div className="border border-border bg-[#FAF9F6] p-2.5">
            <p className="text-xs font-mono text-carbon/90 line-clamp-1 leading-snug">
              {commit.commit.message.split("\n")[0]}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-carbon/50">
              <a
                href={commit.html_url ?? `${repo.html_url}/commit/${commit.sha}`}
                target="_blank"
                rel="noreferrer"
                className="text-cobalt hover:underline font-bold"
              >
                {commit.sha.slice(0, 7)}
              </a>
              <span>{relTime(commit.commit.author.date)}</span>
            </div>
          </div>
        ) : (
          <div className="mono text-[10px] text-carbon/50 py-1">
            Pushed {relTime(repo.pushed_at)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Main GitHub Activity Section ---------- */

export function GithubActivity() {
  const [showAll, setShowAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "devops" | "web">("all");

  const { data, isLoading, error, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["repos", GH_USER],
    queryFn: fetchRepos,
    staleTime: REPOS_TTL,
    gcTime: CACHE_MAX_AGE,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const showError = !!error && !data;
  const showStaleNotice = !!error && !!data;

  // Filter repos
  const filteredRepos = (data ?? []).filter((r) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "devops") {
      const name = r.name.toLowerCase();
      const desc = (r.description ?? "").toLowerCase();
      return (
        name.includes("devops") ||
        name.includes("sentinel") ||
        name.includes("pipeline") ||
        name.includes("aws") ||
        desc.includes("devops") ||
        desc.includes("docker") ||
        desc.includes("nginx") ||
        r.language === "Shell" ||
        r.language === "Python"
      );
    }
    if (activeFilter === "web") {
      return (
        r.language === "TypeScript" ||
        r.language === "JavaScript" ||
        r.language === "HTML"
      );
    }
    return true;
  });

  const visibleRepos = showAll ? filteredRepos : filteredRepos.slice(0, 4);
  const hasMore = filteredRepos.length > 4;

  return (
    <section id="github" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <div className="mono mb-4 flex items-center gap-3 text-[11px] font-medium text-carbon/60">
            <span className="inline-flex items-center gap-1.5 font-bold text-cobalt">
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
              05
            </span>
            <span className="text-carbon/30">/</span>
            <span className="tracking-[0.16em] text-carbon/80">GITHUB ACTIVITY</span>
            <span className="ml-3 h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="display text-[32px] sm:text-[44px] md:text-[56px] text-carbon tracking-tight">
                Live Commits &amp; Telemetry
              </h2>
              <p className="mt-3 max-w-xl text-sm md:text-base leading-relaxed text-muted-foreground font-sans">
                Real-time feed of active GitHub repositories, automation scripts, and continuous integration workflows synchronized via the GitHub REST API.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="mono inline-flex items-center gap-2 border border-carbon bg-white px-4 py-2 text-xs font-semibold text-carbon transition-all hover:border-cobalt hover:bg-cobalt hover:text-white"
              >
                <Github className="h-4 w-4" />
                github.com/{GH_USER}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

              <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-50 px-3 py-2 text-[11px] font-mono text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                API v3 Connected
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`mono px-3 py-1.5 text-[11px] font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-cobalt text-white shadow-2xs"
                  : "bg-white border border-border text-carbon/70 hover:border-cobalt hover:text-cobalt"
              }`}
            >
              All Repositories ({data?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveFilter("devops")}
              className={`mono px-3 py-1.5 text-[11px] font-semibold transition-all ${
                activeFilter === "devops"
                  ? "bg-cobalt text-white shadow-2xs"
                  : "bg-white border border-border text-carbon/70 hover:border-cobalt hover:text-cobalt"
              }`}
            >
              DevOps &amp; Cloud
            </button>
            <button
              onClick={() => setActiveFilter("web")}
              className={`mono px-3 py-1.5 text-[11px] font-semibold transition-all ${
                activeFilter === "web"
                  ? "bg-cobalt text-white shadow-2xs"
                  : "bg-white border border-border text-carbon/70 hover:border-cobalt hover:text-cobalt"
              }`}
            >
              TypeScript &amp; Web
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-carbon/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3178c6]" /> TypeScript
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#89e051]" /> Shell
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3572A5]" /> Python
            </span>
          </div>
        </div>

        {/* States: Loading, Error, Stale */}
        {isLoading && !data && (
          <div className="mono flex items-center justify-center gap-3 border border-border bg-white p-12 text-xs text-carbon/70">
            <Loader2 className="h-5 w-5 animate-spin text-cobalt" />
            Querying GitHub API for latest repository commits…
          </div>
        )}

        {showError && (
          <div className="mono border border-rose-300 bg-rose-50 p-6 text-xs text-rose-800">
            {(error as Error).message} — view full commit activity directly on{" "}
            <a href={GITHUB} target="_blank" rel="noreferrer" className="underline font-bold">
              GitHub
            </a>.
          </div>
        )}

        {showStaleNotice && (
          <div className="mono mb-4 flex items-center gap-2 border border-border bg-white px-4 py-2 text-[10px] text-carbon/70">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            Displaying cached activity snapshot — live GitHub API rate limited.
          </div>
        )}

        {/* Repositories Grid */}
        {data && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {visibleRepos.map((r) => (
                <RepoCard key={r.id} repo={r} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-start">
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="mono inline-flex items-center gap-2 border border-carbon bg-white px-5 py-2.5 text-[11px] tracking-[0.14em] font-semibold text-carbon transition-all hover:border-cobalt hover:bg-cobalt hover:text-white"
                >
                  {showAll ? (
                    <>
                      SHOW LESS REPOSITORIES <Minus className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      VIEW ALL REPOSITORIES ({filteredRepos.length}) <Plus className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {dataUpdatedAt > 0 && (
              <div className="mono mt-6 flex flex-wrap items-center justify-between gap-2 text-[10px] text-carbon/50 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  {isFetching && <Loader2 className="h-3 w-3 animate-spin text-cobalt" />}
                  <span>{isFetching ? "Revalidating GitHub cache…" : `Cache updated ${relTime(new Date(dataUpdatedAt).toISOString())}`}</span>
                </div>
                <span>REST API Ingestion &bull; 60 req/hr rate-safe</span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
