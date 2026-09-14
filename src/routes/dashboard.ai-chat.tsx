import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDateTime } from "@/components/dashboard/state";
import { getChatActivity } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/ai-chat")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AiChatPage,
});

function AiChatPage() {
  const fetchActivity = useServerFn(getChatActivity);
  const { data, isPending, error } = useQuery({
    queryKey: ["monitoring", "chat"],
    queryFn: () => fetchActivity(),
  });

  const total = data?.length ?? null;
  const errors = data?.filter((r) => r.error_code).length ?? null;
  const rateLimits = data?.filter((r) => r.error_code === "rate_limited").length ?? null;
  const latencies = data?.map((r) => r.latency_ms).filter((v): v is number => v != null) ?? [];
  const avgLatency = latencies.length
    ? `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)} ms`
    : null;

  const cards: { label: string; value?: string | number | null }[] = [
    { label: "Total requests", value: total },
    { label: "Errors", value: errors },
    { label: "Rate limits hit", value: rateLimits },
    { label: "Average latency", value: avgLatency },
  ];

  return (
    <>
      <PageHeader title="AI Chat" subtitle="Usage and reliability of the portfolio assistant." />
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
            <Panel title="Recent activity">
              {data && data.length > 0 ? (
                <DataTable headers={["When", "Event", "Messages", "Latency", "Error"]}>
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-900">
                      <td className="py-2 pr-4">{fmtDateTime(row.occurred_at)}</td>
                      <td className="py-2 pr-4">{row.event_type}</td>
                      <td className="py-2 pr-4">{row.message_count ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {row.latency_ms != null ? `${row.latency_ms} ms` : "—"}
                      </td>
                      <td className="py-2 pr-4">{row.error_code ?? "—"}</td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState description="No chat activity recorded yet." />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
