import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { ErrorState, LoadingState, boolLabel, fmtDateTime } from "@/components/dashboard/state";
import { getOverview } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: Overview,
});

function Overview() {
  const fetchOverview = useServerFn(getOverview);
  const { data, isPending, error } = useQuery({
    queryKey: ["monitoring", "overview"],
    queryFn: () => fetchOverview(),
  });

  const health = data?.health ?? null;
  const perf = data?.performance ?? null;

  const cards: { label: string; value?: string | number | null; hint?: string }[] = [
    { label: "Website status", value: health?.http_status ?? null },
    {
      label: "HTTP response time",
      value: health?.response_time_ms != null ? `${health.response_time_ms} ms` : null,
    },
    { label: "SSL status", value: boolLabel(health?.ssl_valid) },
    { label: "SSL expiry", value: fmtDateTime(health?.ssl_expires_at) },
    { label: "DNS status", value: boolLabel(health?.dns_ok) },
    { label: "Lighthouse performance", value: perf?.performance ?? null },
    { label: "SEO score", value: perf?.seo ?? null },
    { label: "Accessibility score", value: perf?.accessibility ?? null },
    { label: "Last health check", value: fmtDateTime(health?.checked_at) },
    { label: "Overall health score", value: health?.health_score ?? null },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Live status of piyushprasad.in across availability, security and performance."
      />
      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((c) => (
              <MetricCard key={c.label} label={c.label} value={c.value} hint={c.hint} />
            ))}
          </div>
          <div className="mt-8">
            <Panel title="Monitoring status">
              {health || perf || data?.deployment || data?.report ? (
                <dl className="grid gap-4 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="uppercase tracking-[0.14em] text-slate-500">Monitored URL</dt>
                    <dd className="mt-1 font-mono text-slate-300">{health?.url ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.14em] text-slate-500">Last deployment</dt>
                    <dd className="mt-1 font-mono text-slate-300">
                      {data?.deployment
                        ? `${data.deployment.workflow_name ?? "workflow"} · ${data.deployment.conclusion ?? data.deployment.status ?? "—"}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.14em] text-slate-500">Latest report</dt>
                    <dd className="mt-1 font-mono text-slate-300">
                      {data?.report?.report_date ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.14em] text-slate-500">
                      Chat requests (24h)
                    </dt>
                    <dd className="mt-1 font-mono text-slate-300">{data?.chatCount24h ?? 0}</dd>
                  </div>
                </dl>
              ) : (
                <EmptyState description="No monitoring data yet. Once health checks and Lighthouse runs start writing results, these cards fill in automatically." />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
