/**
 * Production-Ready Distributed Rate Limiting Engine
 *
 * Capabilities:
 * 1. Multi-tier atomic storage:
 *    - Tier 1: Upstash / Redis (if configured via UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN or REDIS_URL)
 *    - Tier 2: Supabase PostgreSQL atomic stored procedure (public.consume_rate_limit)
 *    - Tier 3: Resilient in-memory sliding bucket fallback (fail-safe protection)
 * 2. Secure client identification:
 *    - Trusted reverse-proxy headers (cf-connecting-ip, x-real-ip, x-forwarded-for leftmost)
 *    - User identity binding: authenticated callers are rate-limited by user_id to prevent IP-rotation evasion
 * 3. Configurable endpoint tiers:
 *    - Auth (/dashboard/login, /api/auth)
 *    - Sensitive (/api/contact, /api/chat)
 *    - General APIs (/api/*, /_server)
 *    - Global fallback
 * 4. Production standard HTTP 429 headers:
 *    - Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 * 5. Asynchronous violation audit logging to public.rate_limit_events
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface RateLimitConfig {
  id: "global" | "api" | "sensitive" | "auth";
  name: string;
  description: string;
  endpoint_pattern: string;
  max_requests: number;
  window_seconds: number;
  enabled: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
  retryAfter: number; // Seconds until window reset
  rule: string;
  clientIdentifier: string;
  storageBackend: "redis" | "postgres" | "memory";
}

export interface ClientIdentity {
  identifier: string;
  ip: string;
  userId?: string | null;
}

// Default in-memory fallbacks if database configs haven't been seeded or loaded
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  global: {
    id: "global",
    name: "Global Master Limit",
    description: "Fallback protection across all incoming requests and routes",
    endpoint_pattern: "*",
    max_requests: 120,
    window_seconds: 60,
    enabled: true,
  },
  api: {
    id: "api",
    name: "General API Endpoints",
    description: "Standard REST endpoints and background ingestion routes (/api/*)",
    endpoint_pattern: "/api/*",
    max_requests: 60,
    window_seconds: 60,
    enabled: true,
  },
  sensitive: {
    id: "sensitive",
    name: "Sensitive Operations",
    description: "Compute/AI intensive APIs and outbound contact mailers (/api/contact, /api/chat)",
    endpoint_pattern: "/api/contact,/api/chat",
    max_requests: 15,
    window_seconds: 60,
    enabled: true,
  },
  auth: {
    id: "auth",
    name: "Authentication Endpoints",
    description: "Console sign-in, session verification, and password updates (/dashboard/login, /api/auth)",
    endpoint_pattern: "/dashboard/login,/api/auth/*",
    max_requests: 10,
    window_seconds: 60,
    enabled: true,
  },
};

// In-memory config cache with 15-second TTL
let cachedConfigs: Record<string, RateLimitConfig> = { ...DEFAULT_CONFIGS };
let configCacheExpiresAt = 0;

// In-memory fallback sliding window buckets
interface MemoryBucket {
  count: number;
  resetAtMs: number;
}
const memoryBuckets = new Map<string, MemoryBucket>();
const MAX_MEMORY_BUCKETS = 10000;

// Prune expired memory buckets periodically
function pruneMemoryBuckets() {
  const now = Date.now();
  if (memoryBuckets.size > MAX_MEMORY_BUCKETS) {
    memoryBuckets.clear();
    return;
  }
  for (const [key, bucket] of memoryBuckets.entries()) {
    if (bucket.resetAtMs <= now) {
      memoryBuckets.delete(key);
    }
  }
}

/**
 * Safely extracts client IP address and authenticated user identifier.
 * Prioritizes trusted cloud provider headers over arbitrary spoofable headers.
 */
export function resolveClientIdentity(request: Request): ClientIdentity {
  const headers = request.headers;

  // 1. Cloudflare Connecting IP (most trustworthy when hosted behind Cloudflare)
  let ip = headers.get("cf-connecting-ip")?.trim();

  // 2. Standard X-Real-IP
  if (!ip) {
    ip = headers.get("x-real-ip")?.trim();
  }

  // 3. X-Forwarded-For (take client IP - the leftmost address)
  if (!ip) {
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const parts = xff.split(",").map((p) => p.trim());
      if (parts[0]) {
        ip = parts[0];
      }
    }
  }

  // 4. Default fallback
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    ip = ip || "127.0.0.1";
  }

  // Sanitize IP format
  ip = ip.replace(/[^\d.a-fA-F:]/g, "");

  // 5. Check if request carries an authenticated Supabase user bearer token
  let userId: string | null = null;
  const authHeader = headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const parts = token.split(".");
      if (parts.length === 3) {
        // Fast-decode JWT payload safely without full verification to extract 'sub'
        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = Buffer.from(payloadBase64, "base64").toString("utf8");
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed.sub === "string" && parsed.sub.length > 0) {
          userId = parsed.sub;
        }
      }
    } catch {
      // Ignore JWT decode errors; fall back to IP identifier
    }
  }

  // If user is authenticated, use user ID as primary identifier so they cannot bypass limits by rotating IPs
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;

  return { identifier, ip, userId };
}

/**
 * Classifies an incoming request URL into an endpoint tier:
 * 'auth' | 'sensitive' | 'api' | 'global'
 */
export function classifyEndpointTier(pathname: string): "auth" | "sensitive" | "api" | "global" {
  const path = pathname.toLowerCase();

  // Auth endpoints: login attempts, auth tokens
  if (
    path.startsWith("/dashboard/login") ||
    path.startsWith("/api/auth") ||
    path.includes("reset-password") ||
    path.includes("update-password")
  ) {
    return "auth";
  }

  // Sensitive compute / AI / email endpoints
  if (
    path.startsWith("/api/contact") ||
    path.startsWith("/api/chat") ||
    path.includes("manual-backup")
  ) {
    return "sensitive";
  }

  // General API routes & server RPCs
  if (
    path.startsWith("/api/") ||
    path.startsWith("/_server")
  ) {
    return "api";
  }

  // Global default
  return "global";
}

/**
 * Checks if the request is for a static asset that should bypass rate limiting
 */
export function isStaticAssetRequest(pathname: string): boolean {
  return (
    pathname.startsWith("/_build/") ||
    pathname.startsWith("/assets/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf") ||
    pathname.endsWith(".map") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

/**
 * Loads rate limit configuration from Supabase or returns in-memory cached copy
 */
export async function getRateLimitConfigs(): Promise<Record<string, RateLimitConfig>> {
  const now = Date.now();
  if (now < configCacheExpiresAt && Object.keys(cachedConfigs).length > 0) {
    return cachedConfigs;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("rate_limit_configs")
      .select("*");

    if (!error && data && data.length > 0) {
      const map: Record<string, RateLimitConfig> = { ...DEFAULT_CONFIGS };
      for (const row of data) {
        map[row.id] = {
          id: row.id as RateLimitConfig["id"],
          name: row.name,
          description: row.description,
          endpoint_pattern: row.endpoint_pattern,
          max_requests: Number(row.max_requests),
          window_seconds: Number(row.window_seconds),
          enabled: Boolean(row.enabled),
        };
      }
      cachedConfigs = map;
      configCacheExpiresAt = now + 15_000; // Cache for 15 seconds
      return cachedConfigs;
    }
  } catch (err) {
    console.warn("[RateLimiter] Config fetch failed, using fallback:", (err as Error).message);
  }

  configCacheExpiresAt = now + 5_000;
  return cachedConfigs;
}

/**
 * Invalidate configuration cache (called by admin after updating settings)
 */
export function invalidateRateLimitConfigCache() {
  configCacheExpiresAt = 0;
}

/**
 * Upstash Redis Rate Limiting (Atomic REST execution)
 */
async function consumeUpstashRedis(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; count: number; retryAfter: number } | null> {
  const restUrl = process.env["UPSTASH_REDIS_REST_URL"];
  const restToken = process.env["UPSTASH_REDIS_REST_TOKEN"];

  if (!restUrl || !restToken) return null;

  try {
    const redisKey = `ratelimit:${key}`;
    const url = `${restUrl.replace(/\/$/, "")}/pipeline`;

    // Multi-exec pipeline: INCR and EXPIRE (with NX)
    const pipeline = [
      ["INCR", redisKey],
      ["TTL", redisKey],
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
      signal: AbortSignal.timeout(1500),
    });

    if (!response.ok) return null;

    const results = (await response.json()) as Array<{ result?: unknown; error?: string }>;
    const currentCount = Number(results[0]?.result ?? 1);
    let ttl = Number(results[1]?.result ?? -1);

    // If key has no expiration yet, set it to windowSeconds
    if (ttl === -1 || currentCount === 1) {
      await fetch(`${restUrl.replace(/\/$/, "")}/expire/${encodeURIComponent(redisKey)}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${restToken}` },
      });
      ttl = windowSeconds;
    }

    const allowed = currentCount <= maxRequests;
    const retryAfter = allowed ? 0 : Math.max(1, ttl);

    return { allowed, count: currentCount, retryAfter };
  } catch (err) {
    console.warn("[RateLimiter] Upstash Redis request error:", (err as Error).message);
    return null;
  }
}

/**
 * Supabase PostgreSQL Atomic Rate Limiting (public.consume_rate_limit)
 */
async function consumePostgres(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; count: number; retryAfter: number; resetAt: number } | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error || !data || data.length === 0) {
      console.warn("[RateLimiter] Supabase RPC consume_rate_limit error:", error?.message);
      return null;
    }

    const row = data[0];
    const resetDate = new Date(row.reset_at);
    const resetEpoch = Math.floor(resetDate.getTime() / 1000);

    return {
      allowed: Boolean(row.allowed),
      count: Number(row.current_count),
      retryAfter: Number(row.retry_after_seconds),
      resetAt: resetEpoch,
    };
  } catch (err) {
    console.warn("[RateLimiter] PostgreSQL consume error:", (err as Error).message);
    return null;
  }
}

/**
 * In-Memory Resilient Fallback Rate Limiting
 */
function consumeMemory(
  key: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; count: number; retryAfter: number; resetAt: number } {
  pruneMemoryBuckets();
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAtMs <= now) {
    const resetAtMs = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAtMs });
    return {
      allowed: true,
      count: 1,
      retryAfter: 0,
      resetAt: Math.floor(resetAtMs / 1000),
    };
  }

  bucket.count += 1;
  const allowed = bucket.count <= maxRequests;
  const retryAfter = allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAtMs - now) / 1000));

  return {
    allowed,
    count: bucket.count,
    retryAfter,
    resetAt: Math.floor(bucket.resetAtMs / 1000),
  };
}

/**
 * Asynchronously logs rate limit violation or sampled traffic event to database
 */
async function recordRateLimitEvent(event: {
  clientIdentifier: string;
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  actionTaken: "blocked" | "allowed";
  ruleName: string;
  requestCount: number;
  limitMax: number;
  windowSeconds: number;
  userAgent?: string | null;
}) {
  try {
    await supabaseAdmin.from("rate_limit_events").insert({
      client_identifier: event.clientIdentifier,
      endpoint: event.endpoint,
      http_method: event.httpMethod,
      status_code: event.statusCode,
      action_taken: event.actionTaken,
      rule_name: event.ruleName,
      request_count: event.requestCount,
      limit_max: event.limitMax,
      window_seconds: event.windowSeconds,
      user_agent: event.userAgent ? event.userAgent.slice(0, 500) : null,
    });
  } catch (err) {
    console.error("[RateLimiter] Failed to write event log:", (err as Error).message);
  }
}

/**
 * Main evaluation function: check if an incoming request is allowed.
 */
export async function evaluateRateLimit(
  request: Request,
  overrideTier?: "auth" | "sensitive" | "api" | "global"
): Promise<RateLimitResult> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Identify client
  const client = resolveClientIdentity(request);

  // 2. Classify endpoint
  const tier = overrideTier ?? classifyEndpointTier(pathname);

  // 3. Load configurations
  const configs = await getRateLimitConfigs();
  const ruleConfig = configs[tier] ?? configs["global"] ?? DEFAULT_CONFIGS.global;
  const globalConfig = configs["global"] ?? DEFAULT_CONFIGS.global;

  // 4. Check if rate limiting is globally disabled or tier is disabled
  if (!globalConfig.enabled || !ruleConfig.enabled) {
    return {
      allowed: true,
      limit: ruleConfig.max_requests,
      remaining: ruleConfig.max_requests,
      resetAt: Math.floor(Date.now() / 1000) + ruleConfig.window_seconds,
      retryAfter: 0,
      rule: tier,
      clientIdentifier: client.identifier,
      storageBackend: "memory",
    };
  }

  // Construct composite bucket key combining tier + client identifier
  const bucketKey = `${tier}:${client.identifier}`;
  const maxRequests = ruleConfig.max_requests;
  const windowSeconds = ruleConfig.window_seconds;

  let allowed = true;
  let count = 1;
  let retryAfter = 0;
  let resetAt = Math.floor(Date.now() / 1000) + windowSeconds;
  let storageBackend: "redis" | "postgres" | "memory" = "postgres";

  // Tier 1: Try Redis / Upstash
  const redisResult = await consumeUpstashRedis(bucketKey, maxRequests, windowSeconds);
  if (redisResult) {
    storageBackend = "redis";
    allowed = redisResult.allowed;
    count = redisResult.count;
    retryAfter = redisResult.retryAfter;
    resetAt = Math.floor(Date.now() / 1000) + (retryAfter || windowSeconds);
  } else {
    // Tier 2: Try PostgreSQL atomic stored procedure
    const pgResult = await consumePostgres(bucketKey, maxRequests, windowSeconds);
    if (pgResult) {
      storageBackend = "postgres";
      allowed = pgResult.allowed;
      count = pgResult.count;
      retryAfter = pgResult.retryAfter;
      resetAt = pgResult.resetAt;
    } else {
      // Tier 3: In-memory fallback
      storageBackend = "memory";
      const memResult = consumeMemory(bucketKey, maxRequests, windowSeconds);
      allowed = memResult.allowed;
      count = memResult.count;
      retryAfter = memResult.retryAfter;
      resetAt = memResult.resetAt;
    }
  }

  const remaining = Math.max(0, maxRequests - count);

  // 5. If blocked, log to audit log asynchronously
  if (!allowed) {
    const userAgent = request.headers.get("user-agent");
    recordRateLimitEvent({
      clientIdentifier: client.identifier,
      endpoint: pathname,
      httpMethod: request.method,
      statusCode: 429,
      actionTaken: "blocked",
      ruleName: tier,
      requestCount: count,
      limitMax: maxRequests,
      windowSeconds,
      userAgent,
    }).catch(() => {});
  }

  return {
    allowed,
    limit: maxRequests,
    remaining,
    resetAt,
    retryAfter,
    rule: tier,
    clientIdentifier: client.identifier,
    storageBackend,
  };
}

/**
 * Creates standard production HTTP 429 Too Many Requests response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Retry-After": String(result.retryAfter),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
    "Cache-Control": "no-store, no-cache, must-revalidate",
  });

  const body = {
    error: "Too Many Requests",
    message: `Rate limit exceeded for endpoint category '${result.rule}'. Please retry in ${result.retryAfter} second${result.retryAfter === 1 ? "" : "s"}.`,
    statusCode: 429,
    rule: result.rule,
    retryAfter: result.retryAfter,
    resetAt: result.resetAt,
  };

  return new Response(JSON.stringify(body), {
    status: 429,
    headers,
  });
}

/**
 * Appends standard rate limit headers to an outgoing Response
 */
export function appendRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("X-RateLimit-Limit", String(result.limit));
  newHeaders.set("X-RateLimit-Remaining", String(result.remaining));
  newHeaders.set("X-RateLimit-Reset", String(result.resetAt));
  if (!result.allowed) {
    newHeaders.set("Retry-After", String(result.retryAfter));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
