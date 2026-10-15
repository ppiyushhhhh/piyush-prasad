/**
 * Rate Limiter Adapter & Backward-Compatibility Layer
 *
 * Connects legacy API endpoints to the production distributed rate limiting engine
 * in src/lib/rate-limiter.server.ts.
 */

import {
  resolveClientIdentity,
  evaluateRateLimit,
  type RateLimitResult,
} from "./rate-limiter.server";

export function getClientKey(request: Request): string {
  const identity = resolveClientIdentity(request);
  return identity.identifier;
}

/**
 * Async rate limit verification with distributed multi-tier atomic backing
 */
export async function checkRateLimitAsync(
  request: Request,
  tier: "auth" | "sensitive" | "api" | "global" = "sensitive"
): Promise<RateLimitResult> {
  return await evaluateRateLimit(request, tier);
}

/**
 * Synchronous compatibility fallback for legacy call signatures
 */
type Bucket = { count: number; resetAt: number };
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;
const MAX_BUCKETS = 5000;
const memoryBuckets = new Map<string, Bucket>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (memoryBuckets.size > MAX_BUCKETS) memoryBuckets.clear();
    memoryBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}
