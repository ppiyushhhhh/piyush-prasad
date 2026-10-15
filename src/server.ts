import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
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

      const url = new URL(request.url);
      const isStatic = isStaticAssetRequest(url.pathname);

      // Evaluate server-side rate limits on non-static requests
      let rateLimitResult = null;
      if (!isStatic) {
        try {
          rateLimitResult = await evaluateRateLimit(request);
          if (!rateLimitResult.allowed) {
            return createRateLimitResponse(rateLimitResult);
          }
        } catch (rlError) {
          // Resilient fail-open: do not crash application if rate limiter encounters an unexpected internal error
          console.error("[RateLimiter Middleware Error]:", rlError);
        }
      }

      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const response = await normalizeCatastrophicSsrResponse(rawResponse);

      // Append rate limit headers if evaluated
      if (rateLimitResult && response.status < 500) {
        return appendRateLimitHeaders(response, rateLimitResult);
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

