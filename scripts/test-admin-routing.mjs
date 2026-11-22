import test from "node:test";
import assert from "node:assert/strict";
import {
  extractHost,
  isAdminHost,
  isPublicHost,
  isLocalOrPreview,
  resolveAdminHostPath,
  getPublicToAdminRedirectUrl,
  getAdminSecurityHeaders,
  applyAdminSecurityHeaders,
  ADMIN_HOST,
  PUBLIC_HOST,
} from "../src/lib/site-hosts.ts";

test("Admin Subdomain Routing & Security Suite", async (t) => {
  await t.test("1. Public domain redirects /dashboard to admin root (301)", () => {
    const url1 = new URL("https://piyushprasad.in/dashboard");
    const redirect1 = getPublicToAdminRedirectUrl(url1);
    assert.equal(redirect1, "https://admin.piyushprasad.in/");

    const url2 = new URL("https://www.piyushprasad.in/dashboard/");
    const redirect2 = getPublicToAdminRedirectUrl(url2);
    assert.equal(redirect2, "https://admin.piyushprasad.in/");
  });

  await t.test("2. Public domain preserves sub-paths, search params, and hash (301)", () => {
    const url = new URL("https://piyushprasad.in/dashboard/projects?status=active&sort=desc#section-2");
    const redirect = getPublicToAdminRedirectUrl(url);
    assert.equal(
      redirect,
      "https://admin.piyushprasad.in/projects?status=active&sort=desc#section-2"
    );
  });

  await t.test("3. Admin host root path rewrites to internal /dashboard", () => {
    const res = resolveAdminHostPath("/");
    assert.equal(res.rewrittenPath, "/dashboard");
    assert.equal(res.shouldRedirectToRoot, false);
    assert.equal(res.isStaticOrApi, false);
  });

  await t.test("4. Admin host subpaths rewrite to internal /dashboard/<subpath>", () => {
    const subpaths = [
      ["/projects", "/dashboard/projects"],
      ["/database", "/dashboard/database"],
      ["/login", "/dashboard/login"],
      ["/messages", "/dashboard/messages"],
      ["/health", "/dashboard/health"],
      ["/performance", "/dashboard/performance"],
      ["/github", "/dashboard/github"],
      ["/cicd", "/dashboard/cicd"],
      ["/ai-chat", "/dashboard/ai-chat"],
      ["/reports", "/dashboard/reports"],
      ["/credly-badges", "/dashboard/credly-badges"],
      ["/architectures", "/dashboard/architectures"],
      ["/manual-backups", "/dashboard/manual-backups"],
      ["/rate-limiting", "/dashboard/rate-limiting"],
      ["/settings", "/dashboard/settings"],
    ];

    for (const [input, expected] of subpaths) {
      const res = resolveAdminHostPath(input);
      assert.equal(res.rewrittenPath, expected, `Mismatch for ${input}`);
      assert.equal(res.shouldRedirectToRoot, false);
    }
  });

  await t.test("5. Public-only pages on admin host are flagged for redirect to root", () => {
    const publicPages = ["/about", "/contact", "/blog", "/experience", "/skills", "/unknown-route"];
    for (const path of publicPages) {
      const res = resolveAdminHostPath(path);
      assert.equal(
        res.shouldRedirectToRoot,
        true,
        `Expected ${path} on admin host to redirect to root`
      );
    }
  });

  await t.test("6. Static assets and APIs on admin host are preserved without rewrite", () => {
    const apiAndAssets = [
      "/_server/rpc-call",
      "/api/health",
      "/assets/index.css",
      "/tech-logos/react.svg",
      "/favicon.ico",
      "/robots.txt",
    ];
    for (const path of apiAndAssets) {
      const res = resolveAdminHostPath(path);
      assert.equal(res.rewrittenPath, path);
      assert.equal(res.shouldRedirectToRoot, false);
      assert.equal(res.isStaticOrApi, true);
    }
  });

  await t.test("7. Strict admin security headers are verified", () => {
    const secHeaders = getAdminSecurityHeaders();
    assert.equal(secHeaders["X-Robots-Tag"], "noindex, nofollow, noarchive");
    assert.match(secHeaders["Cache-Control"], /no-store/);
    assert.match(secHeaders["Strict-Transport-Security"], /max-age=31536000/);
    assert.equal(secHeaders["X-Frame-Options"], "DENY");
    assert.equal(secHeaders["Referrer-Policy"], "same-origin");
    assert.equal(secHeaders["X-Content-Type-Options"], "nosniff");

    const baseResponse = new Response("admin page body", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
    const secured = applyAdminSecurityHeaders(baseResponse);
    assert.equal(secured.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
    assert.equal(secured.headers.get("X-Frame-Options"), "DENY");
    assert.equal(secured.headers.get("X-Content-Type-Options"), "nosniff");
    assert.match(secured.headers.get("Cache-Control") ?? "", /no-store/);
    assert.equal(secured.headers.get("Referrer-Policy"), "same-origin");
  });

  await t.test("8. Host extract correctly handles reverse-proxy x-forwarded-host chain", () => {
    const req = new Request("http://internal:3000/", {
      headers: {
        host: "internal:3000",
        "x-forwarded-host": "admin.piyushprasad.in:443, edge.vercel.com",
      },
    });
    const host = extractHost(req);
    assert.equal(host, "admin.piyushprasad.in");
    assert.equal(isAdminHost(host), true);
    assert.equal(isPublicHost(host), false);
  });

  await t.test("9. Simulated public and admin request routing", () => {
    // Simulated public host request to /dashboard
    const publicReq = new Request("https://piyushprasad.in/dashboard/database?tab=metrics", {
      headers: { host: "piyushprasad.in" },
    });
    const publicHost = extractHost(publicReq);
    assert.equal(isPublicHost(publicHost), true);
    const targetUrl = getPublicToAdminRedirectUrl(new URL(publicReq.url));
    assert.equal(targetUrl, "https://admin.piyushprasad.in/database?tab=metrics");

    // Simulated admin host request to /
    const adminReq = new Request("https://admin.piyushprasad.in/", {
      headers: { host: "admin.piyushprasad.in" },
    });
    const adminHost = extractHost(adminReq);
    assert.equal(isAdminHost(adminHost), true);
    const adminResolution = resolveAdminHostPath(new URL(adminReq.url).pathname);
    assert.equal(adminResolution.rewrittenPath, "/dashboard");
    assert.equal(adminResolution.shouldRedirectToRoot, false);

    // Simulated admin host request to public page (/about)
    const adminAboutReq = new Request("https://admin.piyushprasad.in/about", {
      headers: { host: "admin.piyushprasad.in" },
    });
    const adminAboutResolution = resolveAdminHostPath(new URL(adminAboutReq.url).pathname);
    assert.equal(adminAboutResolution.shouldRedirectToRoot, true);
  });
});
