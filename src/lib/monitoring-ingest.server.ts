import { z } from "zod";

import type {
  ChatActivityRow,
  DeploymentRow,
  HealthCheck,
  PerformanceRow,
  ReportRow,
} from "@/lib/monitoring.types";

export const HealthEventSchema = z.object({
  kind: z.literal("health"),
  url: z.string().url(),
  checked_at: z.string().optional(),
  http_status: z.number().int().nullable().optional(),
  response_time_ms: z.number().int().nullable().optional(),
  ssl_valid: z.boolean().nullable().optional(),
  ssl_expires_at: z.string().nullable().optional(),
  dns_ok: z.boolean().nullable().optional(),
  robots_ok: z.boolean().nullable().optional(),
  sitemap_ok: z.boolean().nullable().optional(),
  favicon_ok: z.boolean().nullable().optional(),
  health_score: z.number().int().min(0).max(100).nullable().optional(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const PerformanceEventSchema = z.object({
  kind: z.literal("performance"),
  url: z.string().url(),
  measured_at: z.string().optional(),
  performance: z.number().int().min(0).max(100).nullable().optional(),
  accessibility: z.number().int().min(0).max(100).nullable().optional(),
  best_practices: z.number().int().min(0).max(100).nullable().optional(),
  seo: z.number().int().min(0).max(100).nullable().optional(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const ReportEventSchema = z.object({
  kind: z.literal("report"),
  report_date: z.string(),
  health_score: z.number().int().min(0).max(100).nullable().optional(),
  lighthouse_score: z.number().int().min(0).max(100).nullable().optional(),
  status: z.string().nullable().optional(),
  pdf_url: z.string().url().nullable().optional(),
});

export const DeploymentEventSchema = z.object({
  kind: z.literal("deployment"),
  occurred_at: z.string().optional(),
  provider: z.string().nullable().optional(),
  workflow_name: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  conclusion: z.string().nullable().optional(),
  commit_sha: z.string().nullable().optional(),
  duration_seconds: z.number().int().nonnegative().nullable().optional(),
  url: z.string().url().nullable().optional(),
});

export const ChatEventSchema = z.object({
  kind: z.literal("chat"),
  occurred_at: z.string().optional(),
  event_type: z.enum(["reply", "error", "rate_limited"]),
  message_count: z.number().int().nonnegative().nullable().optional(),
  latency_ms: z.number().int().nonnegative().nullable().optional(),
  error_code: z.string().max(64).nullable().optional(),
});

export const MonitoringBodySchema = z.object({
  events: z
    .array(
      z.discriminatedUnion("kind", [
        HealthEventSchema,
        PerformanceEventSchema,
        ReportEventSchema,
        DeploymentEventSchema,
        ChatEventSchema,
      ]),
    )
    .min(1)
    .max(20),
});

export type MonitoringEvent = z.infer<typeof MonitoringBodySchema>["events"][number];

export async function writeMonitoringEvents(events: MonitoringEvent[]) {
  const { writeMonitoringEventsWithFallback } = await import("@/lib/monitoring-data.server");
  const now = new Date().toISOString();

  const rows = events.map((event) => {
    switch (event.kind) {
      case "health": {
        const row: Omit<HealthCheck, "id"> = {
          checked_at: event.checked_at ?? now,
          url: event.url,
          http_status: event.http_status ?? null,
          response_time_ms: event.response_time_ms ?? null,
          ssl_valid: event.ssl_valid ?? null,
          ssl_expires_at: event.ssl_expires_at ?? null,
          dns_ok: event.dns_ok ?? null,
          robots_ok: event.robots_ok ?? null,
          sitemap_ok: event.sitemap_ok ?? null,
          favicon_ok: event.favicon_ok ?? null,
          health_score: event.health_score ?? null,
          details: (event.details as Record<string, never> | null | undefined) ?? null,
        };
        return { kind: event.kind, row };
      }

      case "performance": {
        const row: Omit<PerformanceRow, "id"> = {
          measured_at: event.measured_at ?? now,
          url: event.url,
          performance: event.performance ?? null,
          accessibility: event.accessibility ?? null,
          best_practices: event.best_practices ?? null,
          seo: event.seo ?? null,
          details: (event.details as Record<string, never> | null | undefined) ?? null,
        };
        return { kind: event.kind, row };
      }

      case "report": {
        const row: Omit<ReportRow, "id"> = {
          report_date: event.report_date,
          health_score: event.health_score ?? null,
          lighthouse_score: event.lighthouse_score ?? null,
          status: event.status ?? null,
          pdf_url: event.pdf_url ?? null,
          created_at: now,
        };
        return { kind: event.kind, row };
      }

      case "deployment": {
        const row: Omit<DeploymentRow, "id"> = {
          occurred_at: event.occurred_at ?? now,
          provider: event.provider ?? null,
          workflow_name: event.workflow_name ?? null,
          status: event.status ?? null,
          conclusion: event.conclusion ?? null,
          commit_sha: event.commit_sha ?? null,
          duration_seconds: event.duration_seconds ?? null,
          url: event.url ?? null,
        };
        return { kind: event.kind, row };
      }

      case "chat": {
        const row: Omit<ChatActivityRow, "id"> = {
          occurred_at: event.occurred_at ?? now,
          event_type: event.event_type,
          message_count: event.message_count ?? null,
          latency_ms: event.latency_ms ?? null,
          error_code: event.error_code ?? null,
        };
        return { kind: event.kind, row };
      }
    }
  });

  return writeMonitoringEventsWithFallback(rows);
}
