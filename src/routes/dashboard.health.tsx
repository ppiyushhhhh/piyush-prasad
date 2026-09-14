import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import {
  DataTable,
  ErrorState,
  LoadingState,
  boolLabel,
  fmtDateTime,
} from "@/components/dashboard/state";
import { getHealthChecks } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/health")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: HealthPage,
});

function HealthPage() {
  const fetchChecks = useServerFn(getHealthChecks);
  const { data, isPending, error } = useQuery({
    queryKey: ["monitoring", "health"],
    queryFn: () => fetchChecks(),
  });

  const latest = data?.[0] ?? null;
  const cards: { label: string; value?: string | number | null }[] = [
    { label: "HTTP status", value: latest?.http_status ?? null },
    {
      label: "Response time",
      value: latest?.response_time_ms != null ? `${latest.response_time_ms} ms` : null,
    },
    { label: "SSL certificate", value: boolLabel(latest?.ssl_valid) },
    { label: "SSL expiry", value: fmtDateTime(latest?.ssl_expires_at) },
    { label: "DNS", value: boolLabel(latest?.dns_ok) },
    { label: "robots.txt", value: boolLabel(latest?.robots_ok) },
    { label: "sitemap.xml", value: boolLabel(latest?.sitemap_ok) },
    { label: "favicon", value: boolLabel(latest?.favicon_ok) },
    { label: "Overall health", value: latest?.health_score ?? null },
  ];

  return (
    <>
      <PageHeader
        title="Website Health"
        subtitle="Availability, TLS, DNS and crawlability checks for the public site."
      />
      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <MetricCard
                key={c.label}
                label={c.label}
                value={c.value}
                hint={latest ? (fmtDateTime(latest.checked_at) ?? undefined) : undefined}
              />
            ))}
          </div>
          <div className="mt-8">
            <Panel title="Check history">
              {data && data.length > 0 ? (
                <DataTable headers={["Checked at", "URL", "Status", "Response", "SSL", "Score"]}>
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-900">
                      <td className="py-2 pr-4">{fmtDateTime(row.checked_at)}</td>
                      <td className="py-2 pr-4">{row.url}</td>
                      <td className="py-2 pr-4">{row.http_status ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {row.response_time_ms != null ? `${row.response_time_ms} ms` : "—"}
                      </td>
                      <td className="py-2 pr-4">{boolLabel(row.ssl_valid) ?? "—"}</td>
                      <td className="py-2 pr-4">{row.health_score ?? "—"}</td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState description="No health checks recorded yet. Each completed check will appear here with its timestamp and result." />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
