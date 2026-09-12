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
  details: unknown;
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
