/**
 * Site Hosts & Multi-Domain Configuration Helper
 *
 * Provides host detection, path rewriting, redirect generation, and security headers
 * for separating the public portfolio (piyushprasad.in) and the admin console (admin.piyushprasad.in).
 */

export const ADMIN_HOST = process.env.ADMIN_HOST || "admin.piyushprasad.in";
export const PUBLIC_HOST = process.env.PUBLIC_HOST || "piyushprasad.in";

/**
 * Valid dashboard sub-paths that exist in the operations console.
 */
export const DASHBOARD_SUBPATHS = [
  "messages",
  "health",
  "performance",
  "github",
  "cicd",
  "ai-chat",
  "reports",
  "credly-badges",
  "projects",
  "architectures",
  "database",
  "manual-backups",
  "rate-limiting",
  "settings",
  "login",
] as const;

export type DashboardSubpath = (typeof DASHBOARD_SUBPATHS)[number];

/**
 * Extracts and normalizes the request hostname from headers or request objects.
 * Prioritizes x-forwarded-host (set by Cloudflare / Vercel Edge proxies), falling back to host.
 * Strips any trailing port numbers and converts to lowercase.
 */
export function extractHost(requestOrHeadersOrHost: Request | Headers | Record<string, string | undefined> | string): string {
  if (typeof requestOrHeadersOrHost === "string") {
    return requestOrHeadersOrHost.split(":")[0].trim().toLowerCase();
  }

  let forwardedHost: string | null | undefined = null;
  let hostHeader: string | null | undefined = null;

  if (requestOrHeadersOrHost instanceof Request) {
    forwardedHost = requestOrHeadersOrHost.headers.get("x-forwarded-host");
    hostHeader = requestOrHeadersOrHost.headers.get("host");
  } else if (typeof (requestOrHeadersOrHost as Headers).get === "function") {
    forwardedHost = (requestOrHeadersOrHost as Headers).get("x-forwarded-host");
    hostHeader = (requestOrHeadersOrHost as Headers).get("host");
  } else if (typeof requestOrHeadersOrHost === "object" && requestOrHeadersOrHost !== null) {
    const record = requestOrHeadersOrHost as Record<string, string | undefined>;
    forwardedHost = record["x-forwarded-host"] || record["X-Forwarded-Host"];
    hostHeader = record["host"] || record["Host"];
  }

  const rawHost = forwardedHost?.split(",")[0] || hostHeader || "";
  return rawHost.split(":")[0].trim().toLowerCase();
}

/**
 * Checks if the request is targeting the admin subdomain (admin.piyushprasad.in).
 */
export function isAdminHost(hostOrRequest: string | Request | Headers | Record<string, string | undefined>): boolean {
  const host = extractHost(hostOrRequest);
  return host === ADMIN_HOST.toLowerCase();
}

/**
 * Checks if the request is targeting the primary public site (piyushprasad.in or www.piyushprasad.in).
 */
export function isPublicHost(hostOrRequest: string | Request | Headers | Record<string, string | undefined>): boolean {
  const host = extractHost(hostOrRequest);
  return host === PUBLIC_HOST.toLowerCase() || host === `www.${PUBLIC_HOST.toLowerCase()}`;
}

/**
 * Checks if the request is on a development or preview host (localhost, 127.0.0.1, or *.vercel.app).
 * These hosts bypass custom routing rules so /dashboard works for local testing and branch previews.
 */
export function isLocalOrPreview(hostOrRequest: string | Request | Headers | Record<string, string | undefined>): boolean {
  const host = extractHost(hostOrRequest);
  if (!host) return false;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".vercel.app")
  );
}

/**
 * Determines how an incoming URL path on admin.piyushprasad.in should be resolved.
 */
export function resolveAdminHostPath(pathname: string): {
  rewrittenPath: string;
  shouldRedirectToRoot: boolean;
  isStaticOrApi: boolean;
} {
  // Normalize path (ensure leading slash, strip duplicate slashes)
  const normalized = "/" + pathname.replace(/^\/+/, "");

  // API, RPC, asset and internal routes bypass dashboard rewriting
  if (
    normalized.startsWith("/_server") ||
    normalized.startsWith("/api/") ||
    normalized.startsWith("/assets/") ||
    normalized.startsWith("/tech-logos/") ||
    normalized === "/favicon.ico" ||
    normalized === "/robots.txt" ||
    normalized === "/sitemap.xml"
  ) {
    return {
      rewrittenPath: normalized,
      shouldRedirectToRoot: false,
      isStaticOrApi: true,
    };
  }

  // Root on admin host opens dashboard
  if (normalized === "/" || normalized === "") {
    return {
      rewrittenPath: "/dashboard",
      shouldRedirectToRoot: false,
      isStaticOrApi: false,
    };
  }

  // If already prefixed with /dashboard, keep it as-is
  if (normalized === "/dashboard" || normalized.startsWith("/dashboard/")) {
    return {
      rewrittenPath: normalized,
      shouldRedirectToRoot: false,
      isStaticOrApi: false,
    };
  }

  // Extract the top-level segment (e.g. "projects" from "/projects" or "/projects/details")
  const segments = normalized.split("/").filter(Boolean);
  const firstSegment = segments[0] as DashboardSubpath;

  // Recognized dashboard subpath -> rewrite to /dashboard/<subpath>
  if (DASHBOARD_SUBPATHS.includes(firstSegment)) {
    const remainder = segments.slice(1).join("/");
    const rewritten = remainder
      ? `/dashboard/${firstSegment}/${remainder}`
      : `/dashboard/${firstSegment}`;
    return {
      rewrittenPath: rewritten,
      shouldRedirectToRoot: false,
      isStaticOrApi: false,
    };
  }

  // Public-only paths that don't belong on admin host redirect to /
  return {
    rewrittenPath: "/dashboard",
    shouldRedirectToRoot: true,
    isStaticOrApi: false,
  };
}

/**
 * Builds the 301 redirect target URL from the public host to the admin subdomain.
 * Preserves the sub-path and search query string while stripping the /dashboard prefix.
 * Example: https://piyushprasad.in/dashboard/projects?sort=date -> https://admin.piyushprasad.in/projects?sort=date
 */
export function getPublicToAdminRedirectUrl(url: URL, adminHost = ADMIN_HOST): string {
  const pathname = url.pathname;
  let adminPath = "/";

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    adminPath = "/";
  } else if (pathname.startsWith("/dashboard/")) {
    adminPath = "/" + pathname.slice("/dashboard/".length);
  }

  const search = url.search || "";
  const hash = url.hash || "";
  return `https://${adminHost}${adminPath}${search}${hash}`;
}

/**
 * Returns strict security headers required on all admin subdomain responses.
 */
export function getAdminSecurityHeaders(): Record<string, string> {
  return {
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
  };
}

/**
 * Appends admin security headers to an existing Response object.
 */
export function applyAdminSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const secHeaders = getAdminSecurityHeaders();
  for (const [key, val] of Object.entries(secHeaders)) {
    headers.set(key, val);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
