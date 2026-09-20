import { z } from "zod";

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

const TABLE = {
  health: "website_health_checks",
  performance: "performance_history",
  report: "health_reports",
  deployment: "deployment_history",
  chat: "chat_activity",
} as const;

export async function writeMonitoringEvents(events: MonitoringEvent[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const written: string[] = [];

  for (const event of events) {
    const { kind, ...row } = event;
    const { error } = await supabaseAdmin.from(TABLE[kind]).insert(row as never);
    if (error) throw new Error(`Could not store ${kind} event: ${error.message}`);
    written.push(kind);
  }

  return written;
}
