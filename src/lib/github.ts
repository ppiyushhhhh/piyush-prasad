/**
 * GitHub API Client, Types, Caching, and Fallbacks.
 *
 * Provides shared, rate-safe data retrieval for the dedicated GitHub page,
 * the homepage activity stream, and admin monitoring telemetry.
 */

import { GH_USER, GITHUB, SITE_URL } from "./site";

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  default_branch: string;
}

export interface GitHubCommit {
  sha: string;
  html_url?: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dockerfile: "#384d54",
  Go: "#00ADD8",
  Rust: "#dea584",
  HCL: "#844FBA",
};

const CACHE_VERSION = "v3";
const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_MAX_AGE = 7 * 24 * 60 * 60_000; // 7 days

type CacheEntry<T> = { t: number; v: T };

export function lsRead<T>(key: string): CacheEntry<T> | null {
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

export function lsWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `gh:${CACHE_VERSION}:${key}`,
      JSON.stringify({ t: Date.now(), v: value } satisfies CacheEntry<T>),
    );
  } catch {
    // Quota exceeded or private browsing
  }
}

async function ghFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

/**
 * Fallback GitHub profile data when network is unavailable or rate-limited.
 */
export const FALLBACK_PROFILE: GitHubUser = {
  login: GH_USER,
  id: 108392134,
  avatar_url: `https://github.com/${GH_USER}.png`,
  html_url: GITHUB,
  name: "Piyush Prasad",
  company: "Runtime Solutions",
  blog: SITE_URL,
  location: "Navi Mumbai, Maharashtra, India",
  email: "hello@piyushprasad.in",
  bio: "Cloud & DevOps Engineer | AWS · Linux · Docker · CI/CD Pipelines · DevSecOps · Terraform",
  public_repos: 6,
  public_gists: 2,
  followers: 12,
  following: 14,
  created_at: "2022-04-10T12:00:00Z",
  updated_at: new Date().toISOString(),
};

/**
 * Fallback verified repositories list when network is unavailable or rate-limited.
 */
export const FALLBACK_REPOS: GitHubRepo[] = [
  {
    id: 101,
    name: "Kamlesh-Prasad",
    full_name: `${GH_USER}/Kamlesh-Prasad`,
    html_url: `https://github.com/${GH_USER}/Kamlesh-Prasad`,
    description:
      "Automated CI/CD deployment pipeline for production web application on AWS EC2, Nginx reverse proxy, Cloudflare edge, and GitHub Actions.",
    fork: false,
    created_at: "2025-01-15T08:30:00Z",
    updated_at: "2025-02-10T14:20:00Z",
    pushed_at: "2025-02-10T14:20:00Z",
    homepage: "https://kamleshprasad.com",
    size: 2450,
    stargazers_count: 2,
    watchers_count: 2,
    language: "TypeScript",
    forks_count: 0,
    open_issues_count: 0,
    topics: ["aws", "ec2", "nginx", "cloudflare", "github-actions", "cicd"],
    default_branch: "main",
  },
  {
    id: 102,
    name: "onixmall",
    full_name: `${GH_USER}/onixmall`,
    html_url: `https://github.com/${GH_USER}/onixmall`,
    description:
      "Production AWS EC2 infrastructure deployment with Prometheus, Grafana observability telemetry, Trivy vulnerability scanning, and UFW firewall hardening.",
    fork: false,
    created_at: "2026-01-20T11:15:00Z",
    updated_at: "2026-03-01T16:45:00Z",
    pushed_at: "2026-03-01T16:45:00Z",
    homepage: null,
    size: 4120,
    stargazers_count: 1,
    watchers_count: 1,
    language: "Shell",
    forks_count: 0,
    open_issues_count: 0,
    topics: ["aws", "ec2", "devops", "prometheus", "grafana", "trivy", "security"],
    default_branch: "main",
  },
  {
    id: 103,
    name: "sentinel-cloud-view",
    full_name: `${GH_USER}/sentinel-cloud-view`,
    html_url: `https://github.com/${GH_USER}/sentinel-cloud-view`,
    description:
      "CloudOps Sentinel: Full-stack infrastructure monitoring dashboard deployed on AWS EC2 with Docker container fleet telemetry and incident alerting.",
    fork: false,
    created_at: "2026-02-05T09:00:00Z",
    updated_at: "2026-04-12T18:30:00Z",
    pushed_at: "2026-04-12T18:30:00Z",
    homepage: null,
    size: 5890,
    stargazers_count: 2,
    watchers_count: 2,
    language: "JavaScript",
    forks_count: 0,
    open_issues_count: 0,
    topics: ["devops", "monitoring", "docker", "pm2", "nginx", "sqlite"],
    default_branch: "main",
  },
  {
    id: 104,
    name: "piyush-prasad",
    full_name: `${GH_USER}/piyush-prasad`,
    html_url: `https://github.com/${GH_USER}/piyush-prasad`,
    description:
      "Personal engineering portfolio and CloudOps observability platform built with React 19, TanStack Start, Supabase, and Tailwind CSS.",
    fork: false,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-04-20T21:00:00Z",
    pushed_at: "2026-04-20T21:00:00Z",
    homepage: SITE_URL,
    size: 7800,
    stargazers_count: 3,
    watchers_count: 3,
    language: "TypeScript",
    forks_count: 1,
    open_issues_count: 0,
    topics: ["react", "tanstack", "supabase", "tailwindcss", "devops", "cloud"],
    default_branch: "main",
  },
  {
    id: 105,
    name: "devsecops-pipeline-scripts",
    full_name: `${GH_USER}/devsecops-pipeline-scripts`,
    html_url: `https://github.com/${GH_USER}/devsecops-pipeline-scripts`,
    description:
      "Production-ready Shell and Python scripts for automated security scanning, container image verification, and CI/CD policy enforcement.",
    fork: false,
    created_at: "2025-11-04T14:10:00Z",
    updated_at: "2026-02-18T10:15:00Z",
    pushed_at: "2026-02-18T10:15:00Z",
    homepage: null,
    size: 1320,
    stargazers_count: 1,
    watchers_count: 1,
    language: "Shell",
    forks_count: 0,
    open_issues_count: 0,
    topics: ["devsecops", "trivy", "bash", "security", "ci-cd"],
    default_branch: "main",
  },
  {
    id: 106,
    name: "aws-infrastructure-templates",
    full_name: `${GH_USER}/aws-infrastructure-templates`,
    html_url: `https://github.com/${GH_USER}/aws-infrastructure-templates`,
    description:
      "Modular CloudFormation and infrastructure templates for secure AWS EC2, VPC networking, and automated backup routines.",
    fork: false,
    created_at: "2025-08-12T16:00:00Z",
    updated_at: "2026-01-25T13:40:00Z",
    pushed_at: "2026-01-25T13:40:00Z",
    homepage: null,
    size: 2100,
    stargazers_count: 1,
    watchers_count: 1,
    language: "Python",
    forks_count: 0,
    open_issues_count: 0,
    topics: ["aws", "cloudformation", "infrastructure", "python", "automation"],
    default_branch: "main",
  },
];

/**
 * Fetch public GitHub profile for a user with localStorage fallback.
 */
export async function fetchGitHubProfile(username: string = GH_USER): Promise<GitHubUser> {
  try {
    const res = await ghFetch(`https://api.github.com/users/${username}`);
    if (res.ok) {
      const data = (await res.json()) as GitHubUser;
      lsWrite(`user:${username}`, data);
      return data;
    }
  } catch {
    // Network / timeout
  }

  const cached = lsRead<GitHubUser>(`user:${username}`);
  if (cached) return cached.v;

  return FALLBACK_PROFILE;
}

/**
 * Fetch public repositories for a user with localStorage fallback.
 */
export async function fetchGitHubRepos(username: string = GH_USER): Promise<GitHubRepo[]> {
  try {
    const res = await ghFetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`,
    );
    if (res.ok) {
      const data = (await res.json()) as GitHubRepo[];
      if (Array.isArray(data) && data.length > 0) {
        // Exclude forks for primary portfolio showcase
        const nonFork = data.filter((r) => !r.fork);
        const list = nonFork.length > 0 ? nonFork : data;
        lsWrite(`repos:${username}`, list);
        return list;
      }
    }
  } catch {
    // Network / timeout
  }

  const cached = lsRead<GitHubRepo[]>(`repos:${username}`);
  if (cached && Array.isArray(cached.v) && cached.v.length > 0) {
    return cached.v;
  }

  return FALLBACK_REPOS;
}

interface RawCommitResponse {
  sha: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: {
      date?: string;
      name?: string;
    };
  };
}

/**
 * Fetch the latest commit for a specific repository.
 */
export async function fetchGitHubCommit(
  repoName: string,
  username: string = GH_USER,
): Promise<GitHubCommit | null> {
  try {
    const res = await ghFetch(
      `https://api.github.com/repos/${username}/${repoName}/commits?per_page=1`,
    );
    if (res.ok) {
      const data = (await res.json()) as RawCommitResponse[];
      if (Array.isArray(data) && data[0]) {
        const commit: GitHubCommit = {
          sha: data[0].sha,
          html_url: data[0].html_url,
          commit: {
            message: data[0].commit?.message ?? "Update repository",
            author: {
              date: data[0].commit?.author?.date ?? new Date().toISOString(),
              name: data[0].commit?.author?.name ?? username,
            },
          },
        };
        lsWrite(`commit:${username}:${repoName}`, commit);
        return commit;
      }
    }
  } catch {
    // Fallback to cache
  }

  const cached = lsRead<GitHubCommit | null>(`commit:${username}:${repoName}`);
  return cached ? cached.v : null;
}

/**
 * Format relative time (e.g. "2h ago", "3d ago", "2mo ago").
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return "recently";
  const d = new Date(isoString).getTime();
  const diff = Date.now() - d;
  const day = 86400000;
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (diff < day) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < day * 2) return "yesterday";
  if (diff < day * 30) return `${Math.floor(diff / day)}d ago`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))}mo ago`;
  return `${Math.floor(diff / (day * 365))}y ago`;
}

/**
 * Format date into "Month Year" (e.g. "Jan 2025").
 */
export function formatDateMonthYear(isoString: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}
