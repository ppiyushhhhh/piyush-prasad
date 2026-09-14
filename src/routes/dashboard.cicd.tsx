import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDateTime } from "@/components/dashboard/state";
import { getDeployments } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/cicd")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: CicdPage,
});

function CicdPage() {
  const fetchDeployments = useServerFn(getDeployments);
  const { data, isPending, error } = useQuery({
    queryKey: ["monitoring", "deployments"],
    queryFn: () => fetchDeployments(),
  });

  const latest = data?.[0] ?? null;
  const success = data?.filter((d) => d.conclusion === "success").length ?? null;
  const failed = data?.filter((d) => d.conclusion && d.conclusion !== "success").length ?? null;

  const cards: { label: string; value?: string | number | null }[] = [
    { label: "Latest deployment", value: latest?.workflow_name ?? null },
    { label: "Status", value: latest?.status ?? null },
    { label: "Conclusion", value: latest?.conclusion ?? null },
    { label: "Successful workflows", value: success },
    { label: "Failed workflows", value: failed },
    { label: "Last execution", value: fmtDateTime(latest?.occurred_at) },
  ];

  return (
    <>
      <PageHeader title="CI/CD" subtitle="Pipeline runs, security scans and deployments." />
      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <MetricCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
          <div className="mt-8">
            <Panel title="Recent runs">
              {data && data.length > 0 ? (
                <DataTable
                  headers={["When", "Workflow", "Provider", "Conclusion", "Commit", "Duration"]}
                >
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-900">
                      <td className="py-2 pr-4">{fmtDateTime(row.occurred_at)}</td>
                      <td className="py-2 pr-4">
                        {row.url ? (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            {row.workflow_name ?? "run"}
                          </a>
                        ) : (
                          (row.workflow_name ?? "—")
                        )}
                      </td>
                      <td className="py-2 pr-4">{row.provider ?? "—"}</td>
                      <td className="py-2 pr-4">{row.conclusion ?? row.status ?? "—"}</td>
                      <td className="py-2 pr-4">{row.commit_sha?.slice(0, 7) ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {row.duration_seconds != null ? `${row.duration_seconds}s` : "—"}
                      </td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState description="No pipeline data yet. Workflow runs will be listed here once results are collected." />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
