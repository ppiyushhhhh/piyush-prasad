import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDate } from "@/components/dashboard/state";
import { getReports } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const fetchReports = useServerFn(getReports);
  const { data, isPending, error } = useQuery({
    queryKey: ["monitoring", "reports"],
    queryFn: () => fetchReports(),
  });

  const latest = data?.[0] ?? null;
  const cards: { label: string; value?: string | number | null }[] = [
    { label: "Last report date", value: fmtDate(latest?.report_date) },
    { label: "Health score", value: latest?.health_score ?? null },
    { label: "Performance score", value: latest?.lighthouse_score ?? null },
    { label: "Report status", value: latest?.status ?? null },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Daily website health reports and their delivery status."
      />
      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => (
              <MetricCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
          <div className="mt-8">
            <Panel title="Report archive">
              {data && data.length > 0 ? (
                <DataTable headers={["Date", "Health", "Lighthouse", "Status", "PDF"]}>
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-900">
                      <td className="py-2 pr-4">{fmtDate(row.report_date)}</td>
                      <td className="py-2 pr-4">{row.health_score ?? "—"}</td>
                      <td className="py-2 pr-4">{row.lighthouse_score ?? "—"}</td>
                      <td className="py-2 pr-4">{row.status ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {row.pdf_url ? (
                          <a
                            href={row.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState description="No reports stored yet. Generated PDF reports will be listed here." />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
