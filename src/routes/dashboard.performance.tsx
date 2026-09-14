import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDateTime } from "@/components/dashboard/state";
import { getPerformanceHistory } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/performance")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: PerformancePage,
});

function PerformancePage() {
  const fetchPerf = useServerFn(getPerformanceHistory);
  const { data, isPending, error } = useQuery({
    queryKey: ["monitoring", "performance"],
    queryFn: () => fetchPerf(),
  });

  const latest = data?.[0] ?? null;
  const scores: { label: string; value?: number | null }[] = [
    { label: "Performance", value: latest?.performance ?? null },
    { label: "Accessibility", value: latest?.accessibility ?? null },
    { label: "Best Practices", value: latest?.best_practices ?? null },
    { label: "SEO", value: latest?.seo ?? null },
  ];

  return (
    <>
      <PageHeader title="Performance" subtitle="Lighthouse scores and their trend over time." />
      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {scores.map((s) => (
              <MetricCard
                key={s.label}
                label={s.label}
                value={s.value}
                hint={latest ? (fmtDateTime(latest.measured_at) ?? undefined) : "Latest Lighthouse run"}
              />
            ))}
          </div>
          <div className="mt-8">
            <Panel title="Lighthouse history">
              {data && data.length > 0 ? (
                <DataTable
                  headers={["Measured at", "URL", "Perf", "A11y", "Best practices", "SEO"]}
                >
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-900">
                      <td className="py-2 pr-4">{fmtDateTime(row.measured_at)}</td>
                      <td className="py-2 pr-4">{row.url}</td>
                      <td className="py-2 pr-4">{row.performance ?? "—"}</td>
                      <td className="py-2 pr-4">{row.accessibility ?? "—"}</td>
                      <td className="py-2 pr-4">{row.best_practices ?? "—"}</td>
                      <td className="py-2 pr-4">{row.seo ?? "—"}</td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState
                  title="No performance history yet"
                  description="Results appear once Lighthouse runs are stored."
                />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
