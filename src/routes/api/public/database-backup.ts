import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  executeDatabaseBackupWorkflow,
  generateMonthlyBackupSummary,
  executeSevenDayRetentionRotation,
} from "@/lib/database-backup.service";

/**
 * Automated Database Backup & Reporting API Endpoint
 *
 * Designed to be called by automated schedulers (GitHub Actions cron, Vercel cron,
 * or monitoring heartbeats). Callers authenticate with a shared secret bearer token:
 * BACKUP_CRON_SECRET, CRON_SECRET, or MONITORING_INGEST_TOKEN.
 *
 * Never exposes credentials, never exposes the service role key.
 */

const RequestSchema = z.object({
  action: z.enum(["backup", "retention", "monthly_report", "full_cycle"]).optional().default("full_cycle"),
  year: z.number().int().min(2020).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  recipientEmail: z.string().email().optional(),
  forceMonthly: z.boolean().optional().default(false),
});

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

function verifyCronToken(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  const validTokens = [
    process.env["BACKUP_CRON_SECRET"],
    process.env["CRON_SECRET"],
    process.env["MONITORING_INGEST_TOKEN"],
  ].filter(Boolean) as string[];

  if (validTokens.length === 0) {
    // If no explicit token is configured, allow in development or return false
    return process.env.NODE_ENV !== "production";
  }

  return validTokens.some((expected) => safeEqual(token, expected));
}

export const Route = createFileRoute("/api/public/database-backup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!verifyCronToken(request)) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const url = new URL(request.url);
        const action = url.searchParams.get("action") || "status";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action === "status") {
          const { data: latestBackup } = await supabaseAdmin
            .from("database_backups")
            .select("id, backup_date, backup_time, filename, status, file_size_pretty, created_at, deleted_at")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: storedCount } = await supabaseAdmin
            .from("database_backups")
            .select("id", { count: "exact", head: true })
            .is("deleted_at", null)
            .eq("status", "SUCCESS");

          return jsonResponse({
            ok: true,
            latestBackup,
            activeStoredBackups: storedCount ?? 0,
            retentionPolicy: "7 Days",
            systemTime: new Date().toISOString(),
          }, 200);
        }

        return jsonResponse({ error: "Invalid GET action. Use POST to trigger workflows." }, 400);
      },

      POST: async ({ request }) => {
        if (!verifyCronToken(request)) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        let bodyPayload: Record<string, unknown> = {};
        try {
          const text = await request.text();
          if (text) {
            bodyPayload = JSON.parse(text);
          }
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }

        const parseResult = RequestSchema.safeParse(bodyPayload);
        if (!parseResult.success) {
          return jsonResponse({ error: "Invalid parameters", details: parseResult.error.flatten() }, 400);
        }

        const { action, year, month, recipientEmail, forceMonthly } = parseResult.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Action: retention cleanup only
        if (action === "retention") {
          const cleanup = await executeSevenDayRetentionRotation(supabaseAdmin);
          return jsonResponse({ ok: true, action: "retention", cleanup }, 200);
        }

        // Action: monthly report generation only
        if (action === "monthly_report") {
          const targetDate = new Date();
          const targetYear = year || targetDate.getFullYear();
          const targetMonth = month || targetDate.getMonth() + 1;

          const report = await generateMonthlyBackupSummary({
            supabase: supabaseAdmin,
            year: targetYear,
            month: targetMonth,
            recipientEmail,
            sendEmail: true,
          });

          return jsonResponse({ ok: true, action: "monthly_report", report }, 200);
        }

        // Action: backup or full_cycle
        const backupResult = await executeDatabaseBackupWorkflow({
          supabase: supabaseAdmin,
          backupType: "daily",
          triggererEmail: recipientEmail,
        });

        let monthlyReportResult = null;

        // Check if today is the end of the month (or forceMonthly is requested)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const isLastDayOfMonth = tomorrow.getMonth() !== now.getMonth();

        if (forceMonthly || isLastDayOfMonth) {
          try {
            monthlyReportResult = await generateMonthlyBackupSummary({
              supabase: supabaseAdmin,
              year: now.getFullYear(),
              month: now.getMonth() + 1,
              recipientEmail,
              sendEmail: true,
            });
          } catch (monthlyErr: any) {
            console.warn("[DatabaseBackupRoute] End-of-month summary generation warning:", monthlyErr?.message);
          }
        }

        return jsonResponse({
          ok: backupResult.success,
          action: "full_cycle",
          backup: backupResult,
          isEndOfMonth: isLastDayOfMonth,
          monthlyReport: monthlyReportResult ? {
            month: monthlyReportResult.monthName,
            year: monthlyReportResult.year,
            successRate: monthlyReportResult.successPercentage,
            status: monthlyReportResult.reportStatus,
          } : null,
        }, backupResult.success ? 200 : 500);
      },
    },
  },
});
