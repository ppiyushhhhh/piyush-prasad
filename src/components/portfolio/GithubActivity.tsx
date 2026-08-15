import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Github, Loader2 } from "lucide-react";

import { SectionLabel } from "./SectionLabel";
import { GH_USER, GITHUB } from "@/lib/site";

/* ---------- GitHub Activity ---------- */

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
};
type Commit = { sha: string; commit: { message: string; author: { date: string } } };

const CACHE_VERSION = "v1";
const REQUEST_TIMEOUT_MS = 10_000;

/** GitHub's public REST API — unauthenticated, read-only. No token is ever
 * shipped to the browser. Failures fall back to the localStorage cache. */
async function ghFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
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
    res = await ghFetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=6`);
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
        ? "GitHub rate limit reached — activity will refresh shortly."
        : "GitHub activity is temporarily unavailable.",
    );
  }
  const data = (await res.json()) as Repo[];
  const filtered = Array.isArray(data) ? data.filter((r) => !r.fork).slice(0, 6) : [];
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
    const data = (await res.json()) as Commit[];
    const latest = Array.isArray(data) ? (data[0] ?? null) : null;
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
  if (diff < day) return "today";
  if (diff < day * 2) return "yesterday";
  if (diff < day * 30) return `${Math.floor(diff / day)}d ago`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))}mo ago`;
  return `${Math.floor(diff / (day * 365))}y ago`;
}

function RepoCard({ repo }: { repo: Repo }) {
  const { data: commit } = useQuery({
    queryKey: ["commit", repo.name],
    queryFn: () => fetchLatestCommit(repo.name),
    staleTime: COMMITS_TTL,
    gcTime: CACHE_MAX_AGE,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col border border-[#D1D1CB] bg-white/50 p-6 transition-colors hover:border-cobalt"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="mono text-[13px] font-medium group-hover:text-cobalt">{repo.name}</div>
        <ArrowUpRight className="h-4 w-4 text-carbon/40 transition-all group-hover:text-cobalt group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      {repo.language && (
        <div className="mono mt-3 flex items-center gap-2 text-[10px] text-carbon/70">
          <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
          {repo.language}
        </div>
      )}
      {repo.description && (
        <p className="mt-3 text-sm text-carbon/80">{repo.description}</p>
      )}
      <div className="mt-auto pt-6">
        <div className="mono text-[10px] text-carbon/60">LATEST COMMIT</div>
        {commit ? (
          <>
            <div className="mt-2 line-clamp-2 text-sm text-carbon/85">{commit.commit.message.split("\n")[0]}</div>
            <div className="mono mt-2 flex items-center gap-3 text-[10px] text-carbon/60">
              <span className="text-cobalt">{commit.sha.slice(0, 7)}</span>
              <span>{relTime(commit.commit.author.date)}</span>
            </div>
          </>
        ) : (
          <div className="mono mt-2 text-[10px] text-carbon/50">
            {relTime(repo.pushed_at)} · pushed
          </div>
        )}
      </div>
    </a>
  );
}

export function GithubActivity() {
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
  return (
    <section id="github" className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="005" label="GITHUB ACTIVITY" />
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="display text-[40px] leading-[0.9] sm:text-[48px] md:text-[72px]">
            LIVE
            <br />
            <span className="text-cobalt">COMMITS</span>
          </h2>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="mono inline-flex items-center gap-2 border border-[#D1D1CB] px-4 py-2 text-[11px] hover:border-cobalt hover:text-cobalt"
          >
            <Github className="h-3.5 w-3.5" />
            @{GH_USER}
          </a>
        </div>
        {isLoading && !data && (
          <div className="mono flex items-center gap-3 text-[11px] text-carbon/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching repositories…
          </div>
        )}
        {showError && (
          <div className="mono border border-[#D1D1CB] p-6 text-[11px] text-carbon/70">
            {(error as Error).message} — try again later or view directly on GitHub.
          </div>
        )}
        {showStaleNotice && (
          <div className="mono mb-4 flex items-center gap-2 border border-[#D1D1CB] px-4 py-2 text-[10px] text-carbon/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
            Showing cached activity — GitHub API unavailable.
          </div>
        )}
        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.map((r) => (
                <RepoCard key={r.id} repo={r} />
              ))}
            </div>
            {dataUpdatedAt > 0 && (
              <div className="mono mt-6 flex items-center gap-2 text-[10px] text-carbon/50">
                {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                {isFetching ? "Revalidating…" : `Updated ${relTime(new Date(dataUpdatedAt).toISOString())}`}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
