import { createFileRoute } from "@tanstack/react-router";

import {
  MonitoringBodySchema,
  writeMonitoringEvents,
} from "@/lib/monitoring-ingest.server";

/**
 * Monitoring ingestion endpoint.
 *
 * Called by the GitHub Actions jobs (daily health report, CI/CD) to persist
 * results into the monitoring tables. Callers authenticate with a shared
 * bearer token (MONITORING_INGEST_TOKEN); the token is compared in constant
 * time and never echoed back. Rows are written with the service-role client,
 * so the admin-only RLS policies on these tables stay untouched.
 */

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

        const parsed = MonitoringBodySchema.safeParse(payload);
        if (!parsed.success) return json({ error: "Invalid payload." }, 400);

        try {
          const written = await writeMonitoringEvents(parsed.data.events);
          return json({ ok: true, written }, 200);
        } catch (error) {
          console.error("[monitoring] ingestion write failed:", (error as Error).message);
          return json({ error: "Could not store monitoring events." }, 500);
        }
      },
    },
  },
});
