import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, Clock, RefreshCw, ExternalLink, GitBranch, GitCommit } from "lucide-react";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDateTime } from "@/components/dashboard/state";
import { getDeployments } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/cicd")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: CicdPage,
});

function CicdPage() {
  const fetchDeployments = useServerFn(getDeployments);
  const { data, isPending, error, isRefetching, refetch } = useQuery({
    queryKey: ["monitoring", "deployments"],
    queryFn: () => fetchDeployments(),
  });

  const [filter, setFilter] = useState<"all" | "success" | "failure">("all");

  const latest = data?.[0] ?? null;
  const total = data?.length ?? 0;
  const successCount = data?.filter((d) => d.conclusion === "success").length ?? 0;
  const failedCount =
    data?.filter((d) => d.conclusion && d.conclusion !== "success" && d.conclusion !== "completed")
      .length ?? 0;
  const successRate = total > 0 ? `${Math.round((successCount / total) * 100)}%` : "—";

  const filteredData = data?.filter((d) => {
    if (filter === "success") return d.conclusion === "success";
    if (filter === "failure") return d.conclusion && d.conclusion !== "success";
    return true;
  });

  const cards = [
    { label: "Total pipeline runs", value: total > 0 ? total : null, hint: "Fetched live from GitHub" },
    { label: "Successful runs", value: successCount, hint: `Success rate: ${successRate}` },
    { label: "Failed runs", value: failedCount, hint: "Requires attention" },
    { label: "Latest execution", value: latest?.workflow_name ?? null, hint: fmtDateTime(latest?.occurred_at) ?? undefined },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <PageHeader
          title="CI/CD & Pipelines"
          subtitle="Real-time pipeline runs, security scans and deployment automation."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isPending}
            className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-emerald-400" : ""}`} />
            Refresh
          </button>
          <a
            href="https://github.com/ppiyushhhhh/piyush-prasad/actions"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            GitHub Actions
          </a>
        </div>
      </div>

      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState label="Fetching live pipelines from GitHub repo…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => (
              <MetricCard key={c.label} label={c.label} value={c.value} hint={c.hint} />
            ))}
          </div>

          <div className="mt-8">
            <Panel
              title="Pipeline Runs History"
              action={
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilter("all")}
                    className={`rounded px-2.5 py-1 transition-colors ${
                      filter === "all"
                        ? "bg-slate-800 text-slate-100 font-medium"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All ({total})
                  </button>
                  <button
                    onClick={() => setFilter("success")}
                    className={`rounded px-2.5 py-1 transition-colors ${
                      filter === "success"
                        ? "bg-emerald-950/80 text-emerald-300 font-medium border border-emerald-800/60"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Passed ({successCount})
                  </button>
                  <button
                    onClick={() => setFilter("failure")}
                    className={`rounded px-2.5 py-1 transition-colors ${
                      filter === "failure"
                        ? "bg-rose-950/80 text-rose-300 font-medium border border-rose-800/60"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Failed ({failedCount})
                  </button>
                </div>
              }
            >
              {filteredData && filteredData.length > 0 ? (
                <DataTable
                  headers={["Status", "Workflow Name", "Executed At", "Provider", "Commit", "Duration", "Actions"]}
                >
                  {filteredData.map((row) => {
                    const isSuccess = row.conclusion === "success";
                    const isFailure = row.conclusion === "failure" || row.conclusion === "timed_out";
                    const isPending = row.status === "in_progress" || row.status === "queued";

                    return (
                      <tr key={row.id} className="border-b border-slate-900/60 hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 pr-4">
                          <span className="inline-flex items-center gap-1.5">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" />
                                Success
                              </span>
                            ) : isFailure ? (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400 border border-rose-500/20">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
                                <Clock className="h-3 w-3 animate-spin" />
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                                {row.conclusion ?? row.status ?? "Unknown"}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 font-semibold text-slate-200">
                          {row.workflow_name ?? "Run"}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-400 font-mono text-[11px]">
                          {fmtDateTime(row.occurred_at) ?? "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-400 text-[11px]">
                          {row.provider ?? "GitHub Actions"}
                        </td>
                        <td className="py-2.5 pr-4">
                          {row.commit_sha ? (
                            <a
                              href={`https://github.com/ppiyushhhhh/piyush-prasad/commit/${row.commit_sha}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline"
                            >
                              <GitCommit className="h-3 w-3" />
                              {row.commit_sha.slice(0, 7)}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-400 text-[11px]">
                          {row.duration_seconds != null ? `${row.duration_seconds}s` : "—"}
                        </td>
                        <td className="py-2.5 pr-4">
                          {row.url ? (
                            <a
                              href={row.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-white underline underline-offset-2 text-[11px]"
                            >
                              View Logs
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </DataTable>
              ) : (
                <EmptyState
                  title="No pipeline runs found"
                  description="No GitHub workflow runs match the selected filter. Try switching filters or triggering a workflow."
                />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
