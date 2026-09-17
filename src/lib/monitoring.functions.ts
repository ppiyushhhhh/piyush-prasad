import { createServerFn } from "@tanstack/react-start";

/**
 * Read-only monitoring data for the internal dashboard.
 *
 * The monitoring tables stay locked down by RLS (admin-only SELECT). The
 * browser never queries them directly; these server functions read them with
 * the service-role client, which never leaves the server bundle.
 */

export type HealthCheck = {
  id: string;
  checked_at: string;
  url: string;
  http_status: number | null;
  response_time_ms: number | null;
  ssl_valid: boolean | null;
  ssl_expires_at: string | null;
  dns_ok: boolean | null;
  robots_ok: boolean | null;
  sitemap_ok: boolean | null;
  favicon_ok: boolean | null;
  health_score: number | null;
  details: Record<string, string | number | boolean | null> | null;
};

export type PerformanceRow = {
  id: string;
  measured_at: string;
  url: string;
  performance: number | null;
  accessibility: number | null;
  best_practices: number | null;
  seo: number | null;
};

export type DeploymentRow = {
  id: string;
  occurred_at: string;
  provider: string | null;
  workflow_name: string | null;
  status: string | null;
  conclusion: string | null;
  commit_sha: string | null;
  duration_seconds: number | null;
  url: string | null;
};

export type ChatActivityRow = {
  id: string;
  occurred_at: string;
  event_type: string;
  message_count: number | null;
  latency_ms: number | null;
  error_code: string | null;
};

export type ReportRow = {
  id: string;
  report_date: string;
  health_score: number | null;
  lighthouse_score: number | null;
  status: string | null;
  pdf_url: string | null;
  created_at: string;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

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
  const db = await admin();
  const { data: existing } = await db
    .from("website_health_checks")
    .select("*")
    .order("checked_at", { ascending: false })
    .limit(1);

  const latest = (existing?.[0] as HealthCheck) ?? null;
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

  const row = {
    url: base + "/",
    checked_at: new Date().toISOString(),
    http_status: root.status,
    response_time_ms: root.ms,
    // HTTPS handshake succeeded if the request completed over https.
    ssl_valid: root.status !== null ? true : null,
    dns_ok: root.status !== null,
    robots_ok: robots.ok,
    sitemap_ok: sitemap.ok,
    favicon_ok: favicon.ok,
    health_score: score,
  };

  const { data, error } = await db
    .from("website_health_checks")
    .insert(row as never)
    .select("*")
    .limit(1);
  if (error) {
    console.error("[monitoring] live check insert failed:", error.message);
    return latest;
  }
  return ((data?.[0] as HealthCheck) ?? latest) as HealthCheck | null;
}

export const getHealthChecks = createServerFn({ method: "GET" }).handler(
  async (): Promise<HealthCheck[]> => {
    const db = await admin();
    const { data, error } = await db
      .from("website_health_checks")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []) as HealthCheck[];
  },
);

export const getPerformanceHistory = createServerFn({ method: "GET" }).handler(
  async (): Promise<PerformanceRow[]> => {
    const db = await admin();
    const { data, error } = await db
      .from("performance_history")
      .select("*")
      .order("measured_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []) as PerformanceRow[];
  },
);

export const getDeployments = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeploymentRow[]> => {
    const db = await admin();
    const { data, error } = await db
      .from("deployment_history")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []) as DeploymentRow[];
  },
);

export const getChatActivity = createServerFn({ method: "GET" }).handler(
  async (): Promise<ChatActivityRow[]> => {
    const db = await admin();
    // Only telemetry columns are stored; message contents are never persisted.
    const { data, error } = await db
      .from("chat_activity")
      .select("id, occurred_at, event_type, message_count, latency_ms, error_code")
      .order("occurred_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as ChatActivityRow[];
  },
);

export const getReports = createServerFn({ method: "GET" }).handler(
  async (): Promise<ReportRow[]> => {
    const db = await admin();
    const { data, error } = await db
      .from("health_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []) as ReportRow[];
  },
);

export type OverviewData = {
  health: HealthCheck | null;
  performance: PerformanceRow | null;
  deployment: DeploymentRow | null;
  report: ReportRow | null;
  chatCount24h: number | null;
};

export const getOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<OverviewData> => {
    const db = await admin();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [health, performance, deployment, report, chat] = await Promise.all([
      db.from("website_health_checks").select("*").order("checked_at", { ascending: false }).limit(1),
      db.from("performance_history").select("*").order("measured_at", { ascending: false }).limit(1),
      db.from("deployment_history").select("*").order("occurred_at", { ascending: false }).limit(1),
      db.from("health_reports").select("*").order("report_date", { ascending: false }).limit(1),
      db
        .from("chat_activity")
        .select("id", { count: "exact", head: true })
        .gte("occurred_at", since),
    ]);

    const firstError =
      health.error || performance.error || deployment.error || report.error || chat.error;
    if (firstError) throw new Error(firstError.message);

    return {
      health: (health.data?.[0] as HealthCheck) ?? null,
      performance: (performance.data?.[0] as PerformanceRow) ?? null,
      deployment: (deployment.data?.[0] as DeploymentRow) ?? null,
      report: (report.data?.[0] as ReportRow) ?? null,
      chatCount24h: chat.count ?? null,
    };
  },
);
