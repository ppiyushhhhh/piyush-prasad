import { firestore } from "@/integrations/firebase/client";
import { firestoreAdmin } from "@/integrations/firebase/admin.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import type {
  ChatActivityRow,
  DeploymentRow,
  HealthCheck,
  OverviewData,
  PerformanceRow,
  ReportRow,
} from "@/lib/monitoring.types";

const COLLECTION = {
  health: "website_health_checks",
  performance: "performance_history",
  report: "health_reports",
  deployment: "deployment_history",
  chat: "chat_activity",
} as const;

type MonitoringWriteEvent =
  | { kind: "health"; row: Omit<HealthCheck, "id"> }
  | { kind: "performance"; row: Omit<PerformanceRow, "id"> }
  | { kind: "report"; row: Omit<ReportRow, "id" | "created_at"> & Partial<Pick<ReportRow, "created_at">> }
  | { kind: "deployment"; row: Omit<DeploymentRow, "id"> }
  | { kind: "chat"; row: Omit<ChatActivityRow, "id"> };

function toIsoString(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "object" && value && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function normalizeIso(value: unknown, fallback = new Date().toISOString()): string {
  return toIsoString(value) ?? fallback;
}

function normalizeDate(value: unknown, fallback = new Date().toISOString().slice(0, 10)): string {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asHealthCheck(id: string, data: unknown): HealthCheck {
  const row = asRecord(data);
  return {
    id,
    checked_at: normalizeIso(row["checked_at"]),
    url: typeof row["url"] === "string" ? row["url"] : "",
    http_status: typeof row["http_status"] === "number" ? row["http_status"] : null,
    response_time_ms:
      typeof row["response_time_ms"] === "number" ? row["response_time_ms"] : null,
    ssl_valid: typeof row["ssl_valid"] === "boolean" ? row["ssl_valid"] : null,
    ssl_expires_at: toIsoString(row["ssl_expires_at"]),
    dns_ok: typeof row["dns_ok"] === "boolean" ? row["dns_ok"] : null,
    robots_ok: typeof row["robots_ok"] === "boolean" ? row["robots_ok"] : null,
    sitemap_ok: typeof row["sitemap_ok"] === "boolean" ? row["sitemap_ok"] : null,
    favicon_ok: typeof row["favicon_ok"] === "boolean" ? row["favicon_ok"] : null,
    health_score: typeof row["health_score"] === "number" ? row["health_score"] : null,
    details:
      row["details"] && typeof row["details"] === "object"
        ? (row["details"] as Record<string, unknown>)
        : null,
  };
}

function asPerformanceRow(id: string, data: unknown): PerformanceRow {
  const row = asRecord(data);
  return {
    id,
    measured_at: normalizeIso(row["measured_at"]),
    url: typeof row["url"] === "string" ? row["url"] : "",
    performance: typeof row["performance"] === "number" ? row["performance"] : null,
    accessibility: typeof row["accessibility"] === "number" ? row["accessibility"] : null,
    best_practices: typeof row["best_practices"] === "number" ? row["best_practices"] : null,
    seo: typeof row["seo"] === "number" ? row["seo"] : null,
    details:
      row["details"] && typeof row["details"] === "object"
        ? (row["details"] as Record<string, unknown>)
        : null,
  };
}

function asDeploymentRow(id: string, data: unknown): DeploymentRow {
  const row = asRecord(data);
  return {
    id,
    occurred_at: normalizeIso(row["occurred_at"]),
    provider: typeof row["provider"] === "string" ? row["provider"] : null,
    workflow_name: typeof row["workflow_name"] === "string" ? row["workflow_name"] : null,
    status: typeof row["status"] === "string" ? row["status"] : null,
    conclusion: typeof row["conclusion"] === "string" ? row["conclusion"] : null,
    commit_sha: typeof row["commit_sha"] === "string" ? row["commit_sha"] : null,
    duration_seconds:
      typeof row["duration_seconds"] === "number" ? row["duration_seconds"] : null,
    url: typeof row["url"] === "string" ? row["url"] : null,
  };
}

function asChatActivityRow(id: string, data: unknown): ChatActivityRow {
  const row = asRecord(data);
  return {
    id,
    occurred_at: normalizeIso(row["occurred_at"]),
    event_type: typeof row["event_type"] === "string" ? row["event_type"] : "unknown",
    message_count: typeof row["message_count"] === "number" ? row["message_count"] : null,
    latency_ms: typeof row["latency_ms"] === "number" ? row["latency_ms"] : null,
    error_code: typeof row["error_code"] === "string" ? row["error_code"] : null,
  };
}

function asReportRow(id: string, data: unknown): ReportRow {
  const row = asRecord(data);
  return {
    id,
    report_date: normalizeDate(row["report_date"]),
    health_score: typeof row["health_score"] === "number" ? row["health_score"] : null,
    lighthouse_score: typeof row["lighthouse_score"] === "number" ? row["lighthouse_score"] : null,
    status: typeof row["status"] === "string" ? row["status"] : null,
    pdf_url: typeof row["pdf_url"] === "string" ? row["pdf_url"] : null,
    created_at: normalizeIso(row["created_at"]),
  };
}

async function withFallback<T>(
  label: string,
  firestoreTask: () => Promise<T>,
  supabaseTask: () => Promise<T>,
): Promise<T> {
  try {
    return await firestoreTask();
  } catch (error) {
    console.error(
      `[monitoring] Firestore ${label} failed; falling back to Supabase:`,
      (error as Error).message,
    );
    return supabaseTask();
  }
}

async function listHealthChecksFirestore(limitCount: number): Promise<HealthCheck[]> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION.health), orderBy("checked_at", "desc"), limit(limitCount)),
  );
  return snapshot.docs.map((doc) => asHealthCheck(doc.id, doc.data()));
}

async function listHealthChecksSupabase(limitCount: number): Promise<HealthCheck[]> {
  const { data, error } = await supabaseAdmin
    .from(COLLECTION.health)
    .select("*")
    .order("checked_at", { ascending: false })
    .limit(limitCount);
  if (error) throw new Error(error.message);
  return (data ?? []) as HealthCheck[];
}

async function listPerformanceFirestore(limitCount: number): Promise<PerformanceRow[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTION.performance),
      orderBy("measured_at", "desc"),
      limit(limitCount),
    ),
  );
  return snapshot.docs.map((doc) => asPerformanceRow(doc.id, doc.data()));
}

async function listPerformanceSupabase(limitCount: number): Promise<PerformanceRow[]> {
  const { data, error } = await supabaseAdmin
    .from(COLLECTION.performance)
    .select("*")
    .order("measured_at", { ascending: false })
    .limit(limitCount);
  if (error) throw new Error(error.message);
  return (data ?? []) as PerformanceRow[];
}

async function listDeploymentsFirestore(limitCount: number): Promise<DeploymentRow[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTION.deployment),
      orderBy("occurred_at", "desc"),
      limit(limitCount),
    ),
  );
  return snapshot.docs.map((doc) => asDeploymentRow(doc.id, doc.data()));
}

async function listDeploymentsSupabase(limitCount: number): Promise<DeploymentRow[]> {
  const { data, error } = await supabaseAdmin
    .from(COLLECTION.deployment)
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(limitCount);
  if (error) throw new Error(error.message);
  return (data ?? []) as DeploymentRow[];
}

async function listChatActivityFirestore(limitCount: number): Promise<ChatActivityRow[]> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION.chat), orderBy("occurred_at", "desc"), limit(limitCount)),
  );
  return snapshot.docs.map((doc) => asChatActivityRow(doc.id, doc.data()));
}

async function listChatActivitySupabase(limitCount: number): Promise<ChatActivityRow[]> {
  const { data, error } = await supabaseAdmin
    .from(COLLECTION.chat)
    .select("id, occurred_at, event_type, message_count, latency_ms, error_code")
    .order("occurred_at", { ascending: false })
    .limit(limitCount);
  if (error) throw new Error(error.message);
  return (data ?? []) as ChatActivityRow[];
}

async function listReportsFirestore(limitCount: number): Promise<ReportRow[]> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION.report), orderBy("report_date", "desc"), limit(limitCount)),
  );
  return snapshot.docs.map((doc) => asReportRow(doc.id, doc.data()));
}

async function listReportsSupabase(limitCount: number): Promise<ReportRow[]> {
  const { data, error } = await supabaseAdmin
    .from(COLLECTION.report)
    .select("*")
    .order("report_date", { ascending: false })
    .limit(limitCount);
  if (error) throw new Error(error.message);
  return (data ?? []) as ReportRow[];
}

async function getChatCountSinceFirestore(sinceIso: string): Promise<number> {
  const countSnapshot = await getCountFromServer(
    query(collection(firestore, COLLECTION.chat), where("occurred_at", ">=", sinceIso)),
  );
  return countSnapshot.data().count;
}

async function getChatCountSinceSupabase(sinceIso: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(COLLECTION.chat)
    .select("id", { count: "exact", head: true })
    .gte("occurred_at", sinceIso);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export function listHealthChecks(limitCount = 30) {
  return withFallback("health read", () => listHealthChecksFirestore(limitCount), () =>
    listHealthChecksSupabase(limitCount),
  );
}

export function listPerformanceHistory(limitCount = 30) {
  return withFallback("performance read", () => listPerformanceFirestore(limitCount), () =>
    listPerformanceSupabase(limitCount),
  );
}

export function listDeployments(limitCount = 30) {
  return withFallback("deployment read", () => listDeploymentsFirestore(limitCount), () =>
    listDeploymentsSupabase(limitCount),
  );
}

export function listChatActivity(limitCount = 50) {
  return withFallback("chat read", () => listChatActivityFirestore(limitCount), () =>
    listChatActivitySupabase(limitCount),
  );
}

export function listReports(limitCount = 30) {
  return withFallback("report read", () => listReportsFirestore(limitCount), () =>
    listReportsSupabase(limitCount),
  );
}

async function createHealthCheckFirestore(row: Omit<HealthCheck, "id">): Promise<HealthCheck> {
  const payload: Omit<HealthCheck, "id"> = {
    ...row,
    checked_at: normalizeIso(row.checked_at),
    ssl_expires_at: row.ssl_expires_at ? normalizeIso(row.ssl_expires_at) : null,
  };

  const ref = await firestoreAdmin.collection(COLLECTION.health).add(payload);
  return { id: ref.id, ...payload };
}

async function createHealthCheckSupabase(row: Omit<HealthCheck, "id">): Promise<HealthCheck> {
  const { data, error } = await supabaseAdmin
    .from(COLLECTION.health)
    .insert(row as never)
    .select("*")
    .limit(1);
  if (error) throw new Error(error.message);
  return ((data?.[0] as HealthCheck) ?? { id: "", ...row }) as HealthCheck;
}

export function createHealthCheck(row: Omit<HealthCheck, "id">) {
  return withFallback(
    "health write",
    () => createHealthCheckFirestore(row),
    () => createHealthCheckSupabase(row),
  );
}

async function writeMonitoringEventsFirestore(events: MonitoringWriteEvent[]) {
  const written: string[] = [];

  for (const event of events) {
    const now = new Date().toISOString();
    switch (event.kind) {
      case "health": {
        await firestoreAdmin.collection(COLLECTION.health).add({
          ...event.row,
          checked_at: normalizeIso(event.row.checked_at, now),
          ssl_expires_at: event.row.ssl_expires_at ? normalizeIso(event.row.ssl_expires_at) : null,
        });
        break;
      }
      case "performance": {
        await firestoreAdmin.collection(COLLECTION.performance).add({
          ...event.row,
          measured_at: normalizeIso(event.row.measured_at, now),
        });
        break;
      }
      case "report": {
        await firestoreAdmin.collection(COLLECTION.report).add({
          ...event.row,
          report_date: normalizeDate(event.row.report_date),
          created_at: normalizeIso(event.row.created_at, now),
        });
        break;
      }
      case "deployment": {
        await firestoreAdmin.collection(COLLECTION.deployment).add({
          ...event.row,
          occurred_at: normalizeIso(event.row.occurred_at, now),
        });
        break;
      }
      case "chat": {
        await firestoreAdmin.collection(COLLECTION.chat).add({
          ...event.row,
          occurred_at: normalizeIso(event.row.occurred_at, now),
        });
        break;
      }
    }
    written.push(event.kind);
  }

  return written;
}

async function writeMonitoringEventsSupabase(events: MonitoringWriteEvent[]) {
  const written: string[] = [];

  for (const event of events) {
    const { error } = await supabaseAdmin
      .from(COLLECTION[event.kind])
      .insert(event.row as never);
    if (error) throw new Error(`Could not store ${event.kind} event: ${error.message}`);
    written.push(event.kind);
  }

  return written;
}

export function writeMonitoringEventsWithFallback(events: MonitoringWriteEvent[]) {
  return withFallback(
    "event writes",
    () => writeMonitoringEventsFirestore(events),
    () => writeMonitoringEventsSupabase(events),
  );
}

export async function getOverviewData(): Promise<OverviewData> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [healthRows, performanceRows, deploymentRows, reportRows, chatCount] = await Promise.all([
    listHealthChecks(1),
    listPerformanceHistory(1),
    listDeployments(1),
    listReports(1),
    withFallback(
      "chat count",
      () => getChatCountSinceFirestore(since),
      () => getChatCountSinceSupabase(since),
    ),
  ]);

  return {
    health: healthRows[0] ?? null,
    performance: performanceRows[0] ?? null,
    deployment: deploymentRows[0] ?? null,
    report: reportRows[0] ?? null,
    chatCount24h: chatCount,
  };
}

export type { MonitoringWriteEvent };
