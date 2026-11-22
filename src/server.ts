import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { logStagingDiagnostics } from "./lib/staging.guard";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import {
  evaluateRateLimit,
  createRateLimitResponse,
  appendRateLimitHeaders,
  isStaticAssetRequest,
} from "./lib/rate-limiter.server";
import {
  extractHost,
  isAdminHost,
  isPublicHost,
  resolveAdminHostPath,
  getPublicToAdminRedirectUrl,
  applyAdminSecurityHeaders,
  getAdminSecurityHeaders,
  ADMIN_HOST,
} from "./lib/site-hosts";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    logStagingDiagnostics();
    const url = new URL(request.url);
    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const host = extractHost(hostHeader);
    const isPublic = isPublicHost(host);
    const isAdmin = isAdminHost(host);

    try {
      if (env && typeof env === "object") {
        try {
          process.env = process.env || {};
          for (const [key, val] of Object.entries(env)) {
            if (typeof val === "string" && !process.env[key]) {
              process.env[key] = val;
            }
          }
        } catch {
          // ignore read-only process.env in locked runtimes
        }
      }

      // 1. Host-aware rule for public host: 301 redirect all /dashboard/* requests to admin subdomain
      if (isPublic && (url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/"))) {
        const targetUrl = getPublicToAdminRedirectUrl(url);
        return Response.redirect(targetUrl, 301);
      }

      // 2. Host-aware rules for admin host
      let effectiveRequest = request;
      if (isAdmin) {
        // Handle CORS preflight for admin subdomain
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              ...getAdminSecurityHeaders(),
              "Access-Control-Allow-Origin": `https://${ADMIN_HOST}`,
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization, x-requested-with",
              "Access-Control-Allow-Credentials": "true",
              "Access-Control-Max-Age": "86400",
            },
          });
        }

        // Dedicated strict robots.txt for admin subdomain
        if (url.pathname === "/robots.txt") {
          return new Response("User-agent: *\nDisallow: /\n", {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              ...getAdminSecurityHeaders(),
            },
          });
        }

        // Resolve admin host path (rewrite subpaths to internal /dashboard/* or redirect non-admin paths to root)
        const resolution = resolveAdminHostPath(url.pathname);
        if (resolution.shouldRedirectToRoot) {
          return Response.redirect(`https://${ADMIN_HOST}/`, 302);
        }

        if (resolution.rewrittenPath !== url.pathname) {
          const rewrittenUrl = new URL(request.url);
          rewrittenUrl.pathname = resolution.rewrittenPath;
          try {
            effectiveRequest = new Request(rewrittenUrl.toString(), request);
          } catch {
            effectiveRequest = new Request(rewrittenUrl.toString(), {
              method: request.method,
              headers: request.headers,
              body: request.body,
              // @ts-expect-error Node fetch duplex support
              duplex: "half",
            });
          }
        }
      }

      const effectiveUrl = new URL(effectiveRequest.url);
      const isStatic = isStaticAssetRequest(effectiveUrl.pathname);

      // Evaluate server-side rate limits on non-static requests
      let rateLimitResult = null;
      if (!isStatic) {
        try {
          rateLimitResult = await evaluateRateLimit(effectiveRequest);
          if (!rateLimitResult.allowed) {
            let rateLimitResponse = createRateLimitResponse(rateLimitResult);
            if (isAdmin) {
              rateLimitResponse = applyAdminSecurityHeaders(rateLimitResponse);
            }
            return rateLimitResponse;
          }
        } catch (rlError) {
          // Resilient fail-open: do not crash application if rate limiter encounters an unexpected internal error
          console.error("[RateLimiter Middleware Error]:", rlError);
        }
      }

      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(effectiveRequest, env, ctx);
      let response = await normalizeCatastrophicSsrResponse(rawResponse);

      // Append rate limit headers if evaluated
      if (rateLimitResult && response.status < 500) {
        response = appendRateLimitHeaders(response, rateLimitResult);
      }

      // Apply strict security headers on all responses served from admin host
      if (isAdmin) {
        response = applyAdminSecurityHeaders(response);
      }

      return response;
    } catch (error) {
      console.error(error);
      const headers: Record<string, string> = { "content-type": "text/html; charset=utf-8" };
      if (isAdmin) {
        Object.assign(headers, getAdminSecurityHeaders());
      }
      return new Response(renderErrorPage(), {
        status: 500,
        headers,
      });
    }
  },
};

