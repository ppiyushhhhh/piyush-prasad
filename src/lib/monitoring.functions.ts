import { createServerFn } from "@tanstack/react-start";

import type {
  ChatActivityRow,
  DeploymentRow,
  HealthCheck,
  OverviewData,
  PerformanceRow,
  ReportRow,
} from "@/lib/monitoring.types";

/**
 * Read-only monitoring data for the internal dashboard.
 *
 * Primary storage is Firestore; Supabase is retained as a server-side fallback
 * during migration so dashboard behavior remains stable.
 */

/**
 * Probe the public site right now and store the result.
 *
 * Runs at most once every FRESH_MS; otherwise the stored row is reused so page
 * views don't hammer the site. Everything happens server-side.
 */
const FRESH_MS = 10 * 60 * 1000;
const SITE_URL = "https://www.piyushprasad.in";

async function probe(url: string): Promise<{ ok: boolean; status: number | null; ms: number }> {
  const started = Date.now();
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "piyush-monitor" } });
    return { ok: res.ok, status: res.status, ms: Date.now() - started };
  } catch {
    return { ok: false, status: null, ms: Date.now() - started };
  }
}

async function ensureFreshHealthCheck(): Promise<HealthCheck | null> {
  const { createHealthCheck, listHealthChecks } = await import("@/lib/monitoring-data.server");

  const existing = await listHealthChecks(1);
  const latest = existing[0] ?? null;
  if (latest && Date.now() - new Date(latest.checked_at).getTime() < FRESH_MS) return latest;

  const base = SITE_URL.replace(/\/$/, "");
  const [root, robots, sitemap, favicon] = await Promise.all([
    probe(base + "/"),
    probe(base + "/robots.txt"),
    probe(base + "/sitemap.xml"),
    probe(base + "/favicon.ico"),
  ]);

  const checks = [root.ok, root.ok, robots.ok, sitemap.ok, favicon.ok];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const row: Omit<HealthCheck, "id"> = {
    url: base + "/",
    checked_at: new Date().toISOString(),
    http_status: root.status,
    response_time_ms: root.ms,
    ssl_valid: root.status !== null ? true : null,
    ssl_expires_at: null,
    dns_ok: root.status !== null,
    robots_ok: robots.ok,
    sitemap_ok: sitemap.ok,
    favicon_ok: favicon.ok,
    health_score: score,
    details: null,
  };

  try {
    return await createHealthCheck(row);
  } catch (error) {
    console.error("[monitoring] live check insert failed:", (error as Error).message);
    return latest;
  }
}

export const getHealthChecks = createServerFn({ method: "GET" }).handler(
  async (): Promise<HealthCheck[]> => {
    await ensureFreshHealthCheck();
    const { listHealthChecks } = await import("@/lib/monitoring-data.server");
    return listHealthChecks(30);
  },
);

export const getPerformanceHistory = createServerFn({ method: "GET" }).handler(
  async (): Promise<PerformanceRow[]> => {
    const { listPerformanceHistory } = await import("@/lib/monitoring-data.server");
    return listPerformanceHistory(30);
  },
);

export const getDeployments = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeploymentRow[]> => {
    const { listDeployments } = await import("@/lib/monitoring-data.server");
    return listDeployments(30);
  },
);

export const getChatActivity = createServerFn({ method: "GET" }).handler(
  async (): Promise<ChatActivityRow[]> => {
    const { listChatActivity } = await import("@/lib/monitoring-data.server");
    return listChatActivity(50);
  },
);

export const getReports = createServerFn({ method: "GET" }).handler(
  async (): Promise<ReportRow[]> => {
    const { listReports } = await import("@/lib/monitoring-data.server");
    return listReports(30);
  },
);

export const getOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<OverviewData> => {
    await ensureFreshHealthCheck();
    const { getOverviewData } = await import("@/lib/monitoring-data.server");
    return getOverviewData();
  },
);
