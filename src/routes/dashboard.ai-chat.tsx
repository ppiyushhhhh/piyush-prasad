import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, Sparkles, Clock, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDateTime } from "@/components/dashboard/state";
import { getChatActivity } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/ai-chat")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AiChatPage,
});

function AiChatPage() {
  const queryClient = useQueryClient();
  const fetchActivity = useServerFn(getChatActivity);
  const { data, isPending, error, isRefetching, refetch } = useQuery({
    queryKey: ["monitoring", "chat"],
    queryFn: () => fetchActivity(),
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  async function handleSendTest(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      setTestResponse(null);
      const start = Date.now();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: inputMessage.trim() }],
        }),
      });
      const json = await res.json();
      const duration = Date.now() - start;
      setTestLatency(duration);

      if (res.ok && json.reply) {
        setTestResponse(json.reply);
      } else {
        setTestResponse(`Error: ${json.error ?? "Failed to get reply"}`);
      }

      setInputMessage("");
      // Refresh telemetry table so the new interaction appears immediately
      await queryClient.invalidateQueries({ queryKey: ["monitoring", "chat"] });
      await queryClient.invalidateQueries({ queryKey: ["monitoring", "overview"] });
    } catch (err) {
      setTestResponse(`Network Error: ${(err as Error).message}`);
    } finally {
      setIsSending(false);
    }
  }

  const total = data?.length ?? 0;
  const errors = data?.filter((r) => r.error_code).length ?? 0;
  const rateLimits = data?.filter((r) => r.error_code === "429" || r.event_type === "rate_limited").length ?? 0;
  const latencies = data?.map((r) => r.latency_ms).filter((v): v is number => v != null) ?? [];
  const avgLatency = latencies.length
    ? `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)} ms`
    : "—";

  const cards = [
    { label: "Total requests logged", value: total > 0 ? total : null, hint: "Captured via /api/chat" },
    { label: "Average latency", value: avgLatency, hint: "Google Gemini response time" },
    { label: "Errors count", value: errors, hint: errors === 0 ? "100% Reliability" : `${errors} failed` },
    { label: "Rate limits hit", value: rateLimits, hint: "429 responses triggered" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <PageHeader
          title="AI Assistant Analytics"
          subtitle="Real-time telemetry, latency benchmarking and chat assistant health."
        />
        <button
          onClick={() => refetch()}
          disabled={isRefetching || isPending}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-cobalt hover:text-cobalt disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-cobalt" : "text-muted-foreground"}`} />
          Refresh Activity
        </button>
      </div>

      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState label="Loading AI chat telemetry…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => (
              <MetricCard key={c.label} label={c.label} value={c.value} hint={c.hint} />
            ))}
          </div>

          {/* Interactive AI Chat Live Simulator */}
          <div className="mt-8">
            <Panel title="Live AI Chat Diagnostic Console">
              <div className="max-w-2xl">
                <p className="text-xs text-muted-foreground mb-4">
                  Send a live test message to your portfolio AI chatbot to verify API responsiveness and record real telemetry into your Supabase database:
                </p>
                <form onSubmit={handleSendTest} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask something (e.g. 'What are Piyush\'s DevOps skills?')"
                    className="flex-1 rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] px-3.5 py-2 text-xs text-carbon placeholder:text-muted-foreground/60 focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSending ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {isSending ? "Sending…" : "Test Bot"}
                  </button>
                </form>

                {testResponse && (
                  <div className="mt-4 rounded-sm border border-[#E5E5DF] bg-[#FAF9F6]/60 p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2 border-b border-[#E5E5DF] pb-1.5">
                      <span className="font-semibold text-cobalt flex items-center gap-1">
                        <Bot className="h-3.5 w-3.5" />
                        AI Assistant Reply
                      </span>
                      {testLatency != null && (
                        <span className="font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-emerald-600" />
                          Latency: {testLatency} ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-carbon whitespace-pre-wrap leading-relaxed font-sans">
                      {testResponse}
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          </div>

          <div className="mt-8">
            <Panel title="Recent Chat Activity Logs">
              {data && data.length > 0 ? (
                <DataTable headers={["When", "Event Type", "Message Count", "Response Latency", "Status / Error"]}>
                  {data.map((row) => {
                    const isError = Boolean(row.error_code);
                    return (
                      <tr key={row.id} className="border-b border-[#E5E5DF]/60 hover:bg-[#FAF9F6]/60 transition-colors">
                        <td className="py-2.5 pr-4 text-carbon font-mono text-[11px]">
                          {fmtDateTime(row.occurred_at)}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="inline-flex items-center gap-1.5 rounded-sm bg-white border border-[#E5E5DF] px-2 py-0.5 text-[10px] font-semibold text-carbon mono">
                            <Sparkles className="h-3 w-3 text-cobalt" />
                            {row.event_type}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-carbon">
                          {row.message_count ?? "—"}
                        </td>
                        <td className="py-2.5 pr-4 font-mono">
                          {row.latency_ms != null ? (
                            <span className={row.latency_ms < 1500 ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                              {row.latency_ms} ms
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          {isError ? (
                            <span className="inline-flex items-center gap-1 text-rose-600 text-[11px] font-semibold">
                              <AlertTriangle className="h-3 w-3" />
                              Error {row.error_code}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                              <CheckCircle2 className="h-3 w-3" />
                              OK 200
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </DataTable>
              ) : (
                <EmptyState
                  title="No chat activity logged yet"
                  description="Use the Test Bot input above or send a message to the AI chat on your homepage (piyushprasad.in) to generate live telemetry."
                />
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
