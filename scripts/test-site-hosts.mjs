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
  ADMIN_HOST,
  PUBLIC_HOST,
} from "../src/lib/site-hosts.ts";

test("extractHost correctly parses various header formats and strips ports", () => {
  assert.equal(extractHost("admin.piyushprasad.in:443"), "admin.piyushprasad.in");
  assert.equal(extractHost("PIYUSHPRASAD.IN:3000"), "piyushprasad.in");
  assert.equal(extractHost("  localhost:5173  "), "localhost");

  // Request object with Host
  const req1 = new Request("http://localhost:3000/test", {
    headers: { host: "admin.piyushprasad.in:443" },
  });
  assert.equal(extractHost(req1), "admin.piyushprasad.in");

  // Request object with x-forwarded-host
  const req2 = new Request("http://localhost:3000/test", {
    headers: {
      host: "internal-proxy:8080",
      "x-forwarded-host": "admin.piyushprasad.in:443, edge-cdn.net",
    },
  });
  assert.equal(extractHost(req2), "admin.piyushprasad.in");

  // Headers object
  const headers = new Headers();
  headers.set("host", "piyushprasad.in");
  assert.equal(extractHost(headers), "piyushprasad.in");

  // Plain dictionary
  assert.equal(
    extractHost({ "x-forwarded-host": "test.piyushprasad.in" }),
    "test.piyushprasad.in"
  );
});

test("isAdminHost identifies admin subdomain correctly", () => {
  assert.equal(isAdminHost("admin.piyushprasad.in"), true);
  assert.equal(isAdminHost("admin.piyushprasad.in:443"), true);
  assert.equal(isAdminHost("ADMIN.PIYUSHPRASAD.IN"), true);
  assert.equal(isAdminHost("piyushprasad.in"), false);
  assert.equal(isAdminHost("www.piyushprasad.in"), false);
  assert.equal(isAdminHost("localhost"), false);
  assert.equal(isAdminHost("app.vercel.app"), false);
});

test("isPublicHost identifies public domain and www subdomain", () => {
  assert.equal(isPublicHost("piyushprasad.in"), true);
  assert.equal(isPublicHost("www.piyushprasad.in"), true);
  assert.equal(isPublicHost("PIYUSHPRASAD.IN:443"), true);
  assert.equal(isPublicHost("admin.piyushprasad.in"), false);
  assert.equal(isPublicHost("localhost"), false);
});

test("isLocalOrPreview matches dev and preview environments", () => {
  assert.equal(isLocalOrPreview("localhost"), true);
  assert.equal(isLocalOrPreview("localhost:3000"), true);
  assert.equal(isLocalOrPreview("127.0.0.1"), true);
  assert.equal(isLocalOrPreview("127.0.0.1:4173"), true);
  assert.equal(isLocalOrPreview("sub.localhost"), true);
  assert.equal(isLocalOrPreview("piyush-prasad-git-feat.vercel.app"), true);
  assert.equal(isLocalOrPreview("admin.piyushprasad.in"), false);
  assert.equal(isLocalOrPreview("piyushprasad.in"), false);
});

test("resolveAdminHostPath maps root and subpaths properly", () => {
  // Root -> /dashboard
  const root = resolveAdminHostPath("/");
  assert.equal(root.rewrittenPath, "/dashboard");
  assert.equal(root.shouldRedirectToRoot, false);
  assert.equal(root.isStaticOrApi, false);

  // Empty string -> /dashboard
  assert.equal(resolveAdminHostPath("").rewrittenPath, "/dashboard");

  // Recognized subpaths
  const projects = resolveAdminHostPath("/projects");
  assert.equal(projects.rewrittenPath, "/dashboard/projects");
  assert.equal(projects.shouldRedirectToRoot, false);

  const database = resolveAdminHostPath("/database");
  assert.equal(database.rewrittenPath, "/dashboard/database");
  assert.equal(database.shouldRedirectToRoot, false);

  const login = resolveAdminHostPath("/login");
  assert.equal(login.rewrittenPath, "/dashboard/login");
  assert.equal(login.shouldRedirectToRoot, false);

  const rateLimiting = resolveAdminHostPath("/rate-limiting");
  assert.equal(rateLimiting.rewrittenPath, "/dashboard/rate-limiting");
  assert.equal(rateLimiting.shouldRedirectToRoot, false);

  // Nested path under valid subpath
  const subNested = resolveAdminHostPath("/database/tables");
  assert.equal(subNested.rewrittenPath, "/dashboard/database/tables");
  assert.equal(subNested.shouldRedirectToRoot, false);

  // Already prefixed with /dashboard
  assert.equal(resolveAdminHostPath("/dashboard").rewrittenPath, "/dashboard");
  assert.equal(resolveAdminHostPath("/dashboard/health").rewrittenPath, "/dashboard/health");

  // APIs and assets bypass rewriting
  assert.equal(resolveAdminHostPath("/_server").isStaticOrApi, true);
  assert.equal(resolveAdminHostPath("/api/chat").isStaticOrApi, true);
  assert.equal(resolveAdminHostPath("/assets/app.js").isStaticOrApi, true);
  assert.equal(resolveAdminHostPath("/favicon.ico").isStaticOrApi, true);
  assert.equal(resolveAdminHostPath("/robots.txt").isStaticOrApi, true);

  // Non-dashboard public routes redirect to root
  const about = resolveAdminHostPath("/about");
  assert.equal(about.shouldRedirectToRoot, true);

  const resume = resolveAdminHostPath("/resume");
  assert.equal(resume.shouldRedirectToRoot, true);

  const architecture = resolveAdminHostPath("/architecture");
  assert.equal(architecture.shouldRedirectToRoot, true);

  const random = resolveAdminHostPath("/some-unknown-path");
  assert.equal(random.shouldRedirectToRoot, true);
});

test("getPublicToAdminRedirectUrl generates 301 target with stripped /dashboard and preserved query", () => {
  // /dashboard -> /
  const url1 = new URL("https://piyushprasad.in/dashboard");
  assert.equal(getPublicToAdminRedirectUrl(url1), "https://admin.piyushprasad.in/");

  // /dashboard/ -> /
  const url2 = new URL("https://piyushprasad.in/dashboard/");
  assert.equal(getPublicToAdminRedirectUrl(url2), "https://admin.piyushprasad.in/");

  // /dashboard/projects -> /projects
  const url3 = new URL("https://piyushprasad.in/dashboard/projects");
  assert.equal(getPublicToAdminRedirectUrl(url3), "https://admin.piyushprasad.in/projects");

  // Query string preserved
  const url4 = new URL("https://piyushprasad.in/dashboard/database?tab=backups&page=2");
  assert.equal(
    getPublicToAdminRedirectUrl(url4),
    "https://admin.piyushprasad.in/database?tab=backups&page=2"
  );

  // Hash preserved
  const url5 = new URL("https://piyushprasad.in/dashboard/health#ssl");
  assert.equal(getPublicToAdminRedirectUrl(url5), "https://admin.piyushprasad.in/health#ssl");
});

test("getAdminSecurityHeaders returns required security headers", () => {
  const headers = getAdminSecurityHeaders();
  assert.equal(headers["X-Robots-Tag"], "noindex, nofollow, noarchive");
  assert.match(headers["Cache-Control"], /no-store/);
  assert.match(headers["Strict-Transport-Security"], /max-age=31536000/);
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "same-origin");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
});
