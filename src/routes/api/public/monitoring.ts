import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Monitoring ingestion endpoint.
 *
 * Called by the GitHub Actions jobs (daily health report, CI/CD) to persist
 * results into the monitoring tables. Callers authenticate with a shared
 * bearer token (MONITORING_INGEST_TOKEN); the token is compared in constant
 * time and never echoed back. Rows are written with the service-role client,
 * so the admin-only RLS policies on these tables stay untouched.
 */

const HealthSchema = z.object({
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
  health_score: z.number().int().nullable().optional(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
});

const PerformanceSchema = z.object({
  kind: z.literal("performance"),
  url: z.string().url(),
  measured_at: z.string().optional(),
  performance: z.number().int().nullable().optional(),
  accessibility: z.number().int().nullable().optional(),
  best_practices: z.number().int().nullable().optional(),
  seo: z.number().int().nullable().optional(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
});

const ReportSchema = z.object({
  kind: z.literal("report"),
  report_date: z.string(),
  health_score: z.number().int().nullable().optional(),
  lighthouse_score: z.number().int().nullable().optional(),
  status: z.string().nullable().optional(),
  pdf_url: z.string().nullable().optional(),
});

const DeploymentSchema = z.object({
  kind: z.literal("deployment"),
  occurred_at: z.string().optional(),
  provider: z.string().nullable().optional(),
  workflow_name: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  conclusion: z.string().nullable().optional(),
  commit_sha: z.string().nullable().optional(),
  duration_seconds: z.number().int().nullable().optional(),
  url: z.string().nullable().optional(),
});

const BodySchema = z.object({
  events: z
    .array(
      z.discriminatedUnion("kind", [
        HealthSchema,
        PerformanceSchema,
        ReportSchema,
        DeploymentSchema,
      ]),
    )
    .min(1)
    .max(20),
});

const TABLE = {
  health: "website_health_checks",
  performance: "performance_history",
  report: "health_reports",
  deployment: "deployment_history",
} as const;

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/monitoring")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["MONITORING_INGEST_TOKEN"];
        if (!expected) return json({ error: "Ingestion is not configured." }, 503);

        const header = request.headers.get("authorization") ?? "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : "";
        if (!token || !safeEqual(token, expected)) {
          return json({ error: "Unauthorized" }, 401);
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid JSON body." }, 400);
        }

        const parsed = BodySchema.safeParse(payload);
        if (!parsed.success) return json({ error: "Invalid payload." }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const written: string[] = [];
        for (const event of parsed.data.events) {
          const { kind, ...row } = event;
          const { error } = await supabaseAdmin
            .from(TABLE[kind])
            // Row shapes are validated per-kind above.
            .insert(row as never);
          if (error) {
            console.error(`[monitoring] failed to write ${kind}:`, error.message);
            return json({ error: `Could not store ${kind} event.` }, 500);
          }
          written.push(kind);
        }

        return json({ ok: true, written }, 200);
      },
    },
  },
});
