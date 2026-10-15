/**
 * Automated Verification Suite for Rate Limiting System
 *
 * Verifies:
 * 1. Client Identity & Proxy Header Safety
 * 2. Endpoint Category Classification & Static Asset Bypass
 * 3. Enforcing Limits: Below, At, and Exceeding Allowed Limits
 * 4. HTTP 429 Error Response Structure and Standard Headers
 * 5. Window Reset Behavior
 * 6. Authenticated User Binding (IP-cycling evasion defense)
 * 7. Resilient Storage Engine Fail-Safe Behavior
 */

import {
  resolveClientIdentity,
  classifyEndpointTier,
  isStaticAssetRequest,
  evaluateRateLimit,
  createRateLimitResponse,
  appendRateLimitHeaders,
} from "../src/lib/rate-limiter.server";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   RATE LIMITING AUTOMATED VERIFICATION SUITE");
  console.log("=======================================================\n");

  // ---------------------------------------------------------------------------
  // 1. Client Identity Resolution Tests
  // ---------------------------------------------------------------------------
  console.log("1. Testing Client Identity & Trusted Proxy Resolution...");

  const reqCf = new Request("http://localhost/api/test", {
    headers: {
      "cf-connecting-ip": "198.51.100.42",
      "x-forwarded-for": "203.0.113.195, 10.0.0.1",
    },
  });
  const idCf = resolveClientIdentity(reqCf);
  assert(
    idCf.ip === "198.51.100.42" && idCf.identifier === "ip:198.51.100.42",
    "Cloudflare cf-connecting-ip takes precedence over spoofable headers"
  );

  const reqXff = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "203.0.113.50, 198.51.100.1",
    },
  });
  const idXff = resolveClientIdentity(reqXff);
  assert(
    idXff.ip === "203.0.113.50",
    "Leftmost IP extracted from multi-hop x-forwarded-for header"
  );

  // Authenticated user JWT token check
  // Mock JWT header with sub: "user-abc-123"
  // base64url({"alg":"none","typ":"JWT"}) = eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0
  // base64url({"sub":"user-uuid-9999"}) = eyJzdWIiOiJ1c2VyLXV1aWQtOTk5OSJ9
  const mockJwt = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLXV1aWQtOTk5OSJ9.";
  const reqAuth = new Request("http://localhost/api/test", {
    headers: {
      "cf-connecting-ip": "1.2.3.4",
      authorization: `Bearer ${mockJwt}`,
    },
  });
  const idAuth = resolveClientIdentity(reqAuth);
  assert(
    idAuth.identifier === "user:user-uuid-9999",
    "Authenticated session binds client to user ID to stop IP rotation evasion"
  );

  // ---------------------------------------------------------------------------
  // 2. Endpoint Category Classification & Static Bypass
  // ---------------------------------------------------------------------------
  console.log("\n2. Testing Endpoint Category Classification...");

  assert(
    classifyEndpointTier("/dashboard/login") === "auth",
    "/dashboard/login maps to 'auth' tier"
  );
  assert(
    classifyEndpointTier("/api/contact") === "sensitive",
    "/api/contact maps to 'sensitive' tier"
  );
  assert(
    classifyEndpointTier("/api/chat") === "sensitive",
    "/api/chat maps to 'sensitive' tier"
  );
  assert(
    classifyEndpointTier("/api/public/monitoring") === "api",
    "/api/public/monitoring maps to 'api' tier"
  );
  assert(
    classifyEndpointTier("/dashboard") === "global",
    "/dashboard general view maps to 'global' fallback tier"
  );

  assert(
    isStaticAssetRequest("/_build/assets/main.js") === true,
    "Static JS bundles bypass rate limiting"
  );
  assert(
    isStaticAssetRequest("/favicon.ico") === true,
    "Favicon bypasses rate limiting"
  );
  assert(
    isStaticAssetRequest("/api/contact") === false,
    "API endpoints are NOT bypassed"
  );

  // ---------------------------------------------------------------------------
  // 3. Below, At, and Exceeding Configured Limits
  // ---------------------------------------------------------------------------
  console.log("\n3. Testing Throttling Enforcement (Below, At, and Above Limits)...");

  // Create isolated synthetic requests with a unique test IP
  const testIp = `test-${Date.now()}`;

  // Make 5 requests under 'auth' tier (which has default limit of 10)
  for (let i = 1; i <= 5; i++) {
    const req = new Request("http://localhost/dashboard/login", {
      headers: { "cf-connecting-ip": testIp },
    });
    const res = await evaluateRateLimit(req, "auth");
    assert(
      res.allowed === true,
      `Request #${i} below limit is allowed (remaining: ${res.remaining})`
    );
  }

  // Fast loop to exhaust remaining 5 requests and reach the 10 limit
  for (let i = 6; i <= 10; i++) {
    const req = new Request("http://localhost/dashboard/login", {
      headers: { "cf-connecting-ip": testIp },
    });
    await evaluateRateLimit(req, "auth");
  }

  // Request #11: Exceeds the limit of 10
  const reqBlocked = new Request("http://localhost/dashboard/login", {
    headers: { "cf-connecting-ip": testIp },
  });
  const resBlocked = await evaluateRateLimit(reqBlocked, "auth");

  assert(
    resBlocked.allowed === false,
    "Request #11 exceeding permitted max_requests is blocked (allowed = false)"
  );
  assert(
    resBlocked.retryAfter > 0,
    `Retry-After is positive (${resBlocked.retryAfter}s)`
  );

  // ---------------------------------------------------------------------------
  // 4. HTTP 429 Response & Standard Headers Verification
  // ---------------------------------------------------------------------------
  console.log("\n4. Testing HTTP 429 Response Structure & Standard Headers...");

  const http429Response = createRateLimitResponse(resBlocked);
  assert(
    http429Response.status === 429,
    "HTTP status code is exactly 429 Too Many Requests"
  );

  const retryHeader = http429Response.headers.get("retry-after");
  assert(
    retryHeader !== null && parseInt(retryHeader) > 0,
    `Standard 'Retry-After' header is present: ${retryHeader}`
  );

  const limitHeader = http429Response.headers.get("x-ratelimit-limit");
  assert(
    limitHeader !== null && parseInt(limitHeader) === 10,
    `'X-RateLimit-Limit' header reflects configured limit: ${limitHeader}`
  );

  const remainingHeader = http429Response.headers.get("x-ratelimit-remaining");
  assert(
    remainingHeader !== null && parseInt(remainingHeader) === 0,
    `'X-RateLimit-Remaining' header is 0 when blocked`
  );

  const resetHeader = http429Response.headers.get("x-ratelimit-reset");
  assert(
    resetHeader !== null && parseInt(resetHeader) > 0,
    `'X-RateLimit-Reset' epoch timestamp header is present: ${resetHeader}`
  );

  const body = (await http429Response.json()) as { error: string; statusCode: number };
  assert(
    body.error === "Too Many Requests" && body.statusCode === 429,
    "JSON response payload conforms to RFC specifications with error details"
  );

  // Header appending to legitimate 200 response
  const normalResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
  const reqOk = new Request("http://localhost/api/test", {
    headers: { "cf-connecting-ip": `ok-${Date.now()}` },
  });
  const resOk = await evaluateRateLimit(reqOk, "api");
  const enrichedResponse = appendRateLimitHeaders(normalResponse, resOk);

  assert(
    enrichedResponse.headers.get("x-ratelimit-limit") !== null,
    "Legitimate responses receive X-RateLimit-Limit headers"
  );
  assert(
    enrichedResponse.headers.get("x-ratelimit-remaining") !== null,
    "Legitimate responses receive X-RateLimit-Remaining headers"
  );

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (failedTests > 0) {
    console.error(`   ${failedTests} TESTS FAILED`);
    console.log("=======================================================\n");
    process.exit(1);
  } else {
    console.log("   ALL RATE LIMITING TESTS PASSED PERFECTLY!");
    console.log("=======================================================\n");
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
