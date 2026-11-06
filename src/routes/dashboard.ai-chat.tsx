import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Layers,
  Database,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import {
  TelemetryMatrix,
  TelemetryCell,
  StatusTag,
  PageHeader,
  Panel,
  EmptyState,
} from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDateTime } from "@/components/dashboard/state";
import { getChatActivity } from "@/lib/monitoring.functions";
import {
  getAiKnowledgeTelemetry,
  refreshAiKnowledge,
  getAdminCustomKnowledge,
  saveAdminCustomKnowledge,
  deleteAdminCustomKnowledge,
  toggleCustomKnowledgePublish,
  type AdminCustomKnowledgeItem,
  type SaveCustomKnowledgeInput,
} from "@/lib/ai-knowledge.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/ai-chat")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AiChatPage,
});

function AiChatPage() {
  const queryClient = useQueryClient();

  // 1. Telemetry Query
  const fetchActivity = useServerFn(getChatActivity);
  const { data, isPending, error, isRefetching, refetch } = useQuery({
    queryKey: ["monitoring", "chat"],
    queryFn: () => fetchActivity(),
  });

  // 2. Knowledge Telemetry Query
  const fetchKnowledgeTelemetry = useServerFn(getAiKnowledgeTelemetry);
  const {
    data: knowledge,
    isPending: isKnowledgePending,
    refetch: refetchKnowledge,
  } = useQuery({
    queryKey: ["ai-knowledge", "telemetry"],
    queryFn: () => fetchKnowledgeTelemetry(),
    refetchInterval: 30000,
  });

  // 3. Custom Knowledge Items Query
  const fetchCustomKnowledge = useServerFn(getAdminCustomKnowledge);
  const { data: customFacts = [], refetch: refetchFacts } = useQuery({
    queryKey: ["ai-knowledge", "custom-facts"],
    queryFn: () => fetchCustomKnowledge(),
  });

  // 4. Force Knowledge Refresh Mutation
  const triggerRefreshKnowledge = useServerFn(refreshAiKnowledge);
  const refreshMutation = useMutation({
    mutationFn: () => triggerRefreshKnowledge(),
    onSuccess: (updated) => {
      toast.success(
        `AI Knowledge synchronized! ${updated.credlyBadgesCount} Credly badges and ${updated.customFactsCount} custom facts indexed.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["ai-knowledge"] });
    },
    onError: (err) => {
      toast.error(`Knowledge refresh failed: ${err.message}`);
    },
  });

  // 5. Custom Knowledge Mutations
  const triggerSaveFact = useServerFn(saveAdminCustomKnowledge);
  const saveFactMutation = useMutation({
    mutationFn: (input: SaveCustomKnowledgeInput) => triggerSaveFact({ data: input }),
    onSuccess: () => {
      toast.success("Portfolio knowledge item saved and synchronized with AI engine!");
      setIsModalOpen(false);
      setEditingFact(null);
      void queryClient.invalidateQueries({ queryKey: ["ai-knowledge"] });
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
  });

  const triggerDeleteFact = useServerFn(deleteAdminCustomKnowledge);
  const deleteFactMutation = useMutation({
    mutationFn: (id: string) => triggerDeleteFact({ data: id }),
    onSuccess: () => {
      toast.success("Fact removed from AI knowledge base.");
      setDeletingFact(null);
      void queryClient.invalidateQueries({ queryKey: ["ai-knowledge"] });
    },
    onError: (err) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });

  const triggerTogglePublish = useServerFn(toggleCustomKnowledgePublish);
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      triggerTogglePublish({ data: { id, is_published } }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.is_published
          ? "Item published: now accessible to Ask Piyush AI"
          : "Item unpublished: excluded from AI answers",
      );
      void queryClient.invalidateQueries({ queryKey: ["ai-knowledge"] });
    },
    onError: (err) => {
      toast.error(`Publish toggle failed: ${err.message}`);
    },
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFact, setEditingFact] = useState<AdminCustomKnowledgeItem | null>(null);
  const [deletingFact, setDeletingFact] = useState<AdminCustomKnowledgeItem | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState("Career");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPublished, setFormPublished] = useState(true);

  function handleOpenCreate() {
    setEditingFact(null);
    setFormCategory("Career");
    setFormTitle("");
    setFormContent("");
    setFormPublished(true);
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: AdminCustomKnowledgeItem) {
    setEditingFact(item);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormPublished(item.is_published);
    setIsModalOpen(true);
  }

  function handleSaveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    saveFactMutation.mutate({
      id: editingFact?.id,
      category: formCategory,
      title: formTitle,
      content: formContent,
      is_published: formPublished,
    });
  }

  // Diagnostic Test Bot State
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
  const rateLimits =
    data?.filter((r) => r.error_code === "429" || r.event_type === "rate_limited").length ?? 0;
  const latencies = data?.map((r) => r.latency_ms).filter((v): v is number => v != null) ?? [];
  const avgLatency = latencies.length
    ? `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)} ms`
    : "—";

  const cards = [
    {
      label: "Total requests logged",
      value: total > 0 ? total : null,
      hint: "Captured via /api/chat",
    },
    { label: "Average latency", value: avgLatency, hint: "Google Gemini response time" },
    {
      label: "Errors count",
      value: errors,
      hint: errors === 0 ? "100% Reliability" : `${errors} failed`,
    },
    { label: "Rate limits hit", value: rateLimits, hint: "429 responses triggered" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <PageHeader
          title="AI Assistant Analytics & Knowledge"
          subtitle="Real-time telemetry, live Credly knowledge indexing, and interactive diagnostic simulator."
        />
        <div className="flex items-center gap-2.5">
          <StatusTag status="optimal">GEMINI 2.5 FLASH PROXY</StatusTag>
          <button
            onClick={() => {
              void refetch();
              void refetchKnowledge();
              void refetchFacts();
            }}
            disabled={isRefetching || isPending}
            className="inline-flex items-center gap-2 border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-mono font-medium text-carbon hover:border-cobalt hover:text-cobalt disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-cobalt" : "text-muted-foreground"}`}
            />
            REFRESH
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState label="Loading AI chat telemetry…" />
      ) : (
        <>
          {/* Monolithic Telemetry Matrix */}
          <TelemetryMatrix columns={4}>
            {cards.map((c, i) => (
              <TelemetryCell
                key={c.label}
                index={i + 1}
                label={c.label}
                value={c.value}
                hint={c.hint}
                accent={i === 0 ? "cobalt" : i === 2 ? "emerald" : "default"}
              />
            ))}
          </TelemetryMatrix>

          {/* ----------------------------------------------------------- */}
          {/* SECTION: Centralized AI Knowledge Engine & Indexing Status */}
          {/* ----------------------------------------------------------- */}
          <div className="mt-8">
            <Panel
              title="Centralized AI Knowledge Status & Dynamic Index"
              action={
                <button
                  type="button"
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                  className="mono inline-flex items-center gap-1.5 border border-cobalt bg-cobalt/5 hover:bg-cobalt/15 px-3 py-1 text-[11px] font-bold text-cobalt transition-colors cursor-pointer disabled:opacity-50"
                  title="Flush server cache and re-index all Supabase records"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${refreshMutation.isPending ? "animate-spin" : ""}`}
                  />
                  <span>
                    {refreshMutation.isPending ? "SYNCHRONIZING..." : "FORCE KNOWLEDGE SYNC"}
                  </span>
                </button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* 1. Credly Digital Badges Index */}
                <div className="border border-border bg-[#FAF9F6] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="mono text-[10px] font-bold text-muted-foreground uppercase">
                      Credly Digital Badges
                    </span>
                    <Award className="h-4 w-4 text-cobalt" />
                  </div>
                  <div className="text-2xl font-bold text-carbon">
                    {knowledge?.credlyBadgesCount ?? 0}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>Live Supabase & Credly sync</span>
                  </div>
                </div>

                {/* 2. Custom Facts & FAQs */}
                <div className="border border-border bg-[#FAF9F6] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="mono text-[10px] font-bold text-muted-foreground uppercase">
                      Custom Facts & FAQs
                    </span>
                    <BookOpen className="h-4 w-4 text-cobalt" />
                  </div>
                  <div className="text-2xl font-bold text-carbon">
                    {knowledge?.customFactsCount ?? customFacts.length}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Direct admin-injected facts
                  </div>
                </div>

                {/* 3. Core Knowledge Base */}
                <div className="border border-border bg-[#FAF9F6] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="mono text-[10px] font-bold text-muted-foreground uppercase">
                      Core Portfolio Units
                    </span>
                    <Layers className="h-4 w-4 text-cobalt" />
                  </div>
                  <div className="text-2xl font-bold text-carbon">
                    {knowledge
                      ? (knowledge.projectsCount ?? 4) +
                        (knowledge.experiencesCount ?? 2) +
                        (knowledge.skillsCategoriesCount ?? 9) +
                        8
                      : "23"}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Projects, Roles, Skills & Education
                  </div>
                </div>

                {/* 4. Synchronization Status */}
                <div className="border border-border bg-[#FAF9F6] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="mono text-[10px] font-bold text-muted-foreground uppercase">
                      Knowledge State
                    </span>
                    <Database className="h-4 w-4 text-cobalt" />
                  </div>
                  <div className="text-base font-bold text-carbon flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="capitalize">{knowledge?.status ?? "synced"}</span>
                  </div>
                  <div className="mt-2 mono text-[10px] text-muted-foreground">
                    Cache Age: {knowledge?.cacheAgeSeconds ?? 0}s (60s TTL)
                  </div>
                </div>
              </div>

              <div className="border border-border/80 bg-white p-3.5 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-cobalt shrink-0" />
                  <span>
                    Ask Piyush AI automatically includes newly published Credly badges, edited
                    descriptions, and custom FAQs in real time without redeployment.
                  </span>
                </div>
                <span className="mono text-[10px] text-muted-foreground shrink-0">
                  Last Sync: {knowledge?.lastSync ? fmtDateTime(knowledge.lastSync) : "Just now"}
                </span>
              </div>
            </Panel>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* SECTION: Custom Knowledge & FAQs Manager */}
          {/* ----------------------------------------------------------- */}
          <div className="mt-8">
            <Panel
              title="Custom Knowledge & Portfolio FAQs"
              action={
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mono inline-flex items-center gap-1.5 border border-carbon bg-carbon text-white hover:bg-carbon/90 px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ADD CUSTOM FACT</span>
                </button>
              }
            >
              {customFacts.length > 0 ? (
                <DataTable headers={["Category", "Title", "Content Preview", "Status", "Actions"]}>
                  {customFacts.map((fact) => (
                    <tr
                      key={fact.id}
                      className="border-b border-[#E5E5DF]/60 hover:bg-[#FAF9F6]/60 transition-colors"
                    >
                      <td className="py-2.5 pr-4">
                        <span className="mono inline-flex items-center gap-1 border border-border bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-semibold text-carbon">
                          <Tag className="h-2.5 w-2.5 text-cobalt" />
                          {fact.category}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-semibold text-carbon text-xs">
                        {fact.title}
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground max-w-md truncate">
                        {fact.content}
                      </td>
                      <td className="py-2.5 pr-4">
                        <button
                          type="button"
                          onClick={() =>
                            togglePublishMutation.mutate({
                              id: fact.id,
                              is_published: !fact.is_published,
                            })
                          }
                          className={`mono inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                            fact.is_published
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {fact.is_published ? (
                            <>
                              <Eye className="h-2.5 w-2.5" />
                              <span>PUBLISHED</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-2.5 w-2.5" />
                              <span>DRAFT</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(fact)}
                            title="Edit custom knowledge item"
                            className="p-1 text-carbon/70 hover:text-cobalt transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingFact(fact)}
                            title="Delete custom knowledge item"
                            className="p-1 text-carbon/70 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState
                  title="No custom knowledge entries added yet"
                  description="Use the 'Add Custom Fact' button above to teach the chatbot specific FAQs, career availability, notice periods, or public information not covered by standard sections."
                />
              )}
            </Panel>
          </div>

          {/* Interactive AI Chat Live Simulator */}
          <div className="mt-8">
            <Panel title="Live AI Chat Diagnostic Console">
              <div className="max-w-2xl">
                <p className="text-xs text-muted-foreground mb-4">
                  Test questions against the updated dynamic knowledge base (e.g. Credly badges, AWS
                  credentials, or current employment at Runtime Solutions):
                </p>
                <form onSubmit={handleSendTest} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask something (e.g. 'What Credly badges does Piyush have?')"
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

          {/* Recent Chat Activity Logs */}
          <div className="mt-8">
            <Panel title="Recent Chat Activity Logs">
              {data && data.length > 0 ? (
                <DataTable
                  headers={[
                    "When",
                    "Event Type",
                    "Message Count",
                    "Response Latency",
                    "Status / Error",
                  ]}
                >
                  {data.map((row) => {
                    const isError = Boolean(row.error_code);
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-[#E5E5DF]/60 hover:bg-[#FAF9F6]/60 transition-colors"
                      >
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
                            <span
                              className={
                                row.latency_ms < 1500
                                  ? "text-emerald-700 font-semibold"
                                  : "text-amber-700 font-semibold"
                              }
                            >
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

      {/* ------------------------------------------------------------- */}
      {/* Create / Edit Custom Fact Modal */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 border border-border sm:rounded-none shadow-xl">
          <form onSubmit={handleSaveForm}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-bold text-carbon">
                {editingFact ? "Edit Portfolio Knowledge Item" : "Add Custom Knowledge Item / FAQ"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Teach the AI assistant specific portfolio facts, FAQs, career preferences, or
                availability details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mono text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full border border-border bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                >
                  <option value="Career">Career & Goals</option>
                  <option value="Availability">Availability & Notice Period</option>
                  <option value="Specialty">Technical Specialty</option>
                  <option value="FAQ">Frequently Asked Question</option>
                  <option value="General">General Portfolio Fact</option>
                </select>
              </div>

              <div>
                <label className="mono text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Title / Question *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. What is Piyush's availability for full-time roles?"
                  className="w-full border border-border bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mono text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Verified Fact / Answer *
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="e.g. Piyush is immediately available for full-time Cloud & DevOps engineer positions on-site in Mumbai or remote."
                  className="w-full border border-border bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="factPublished"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-cobalt focus:ring-cobalt"
                />
                <label
                  htmlFor="factPublished"
                  className="text-xs font-medium text-carbon cursor-pointer"
                >
                  Publish immediately (accessible to public AI assistant)
                </label>
              </div>
            </div>

            <DialogFooter className="mt-6 border-t border-border pt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mono border border-border bg-white px-4 py-2 text-xs font-semibold text-carbon hover:bg-[#FAF9F6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveFactMutation.isPending}
                className="mono border border-cobalt bg-cobalt px-4 py-2 text-xs font-semibold text-white hover:bg-cobalt/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saveFactMutation.isPending ? "Saving…" : "Save & Synchronize"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingFact} onOpenChange={(open) => !open && setDeletingFact(null)}>
        <AlertDialogContent className="bg-white border border-border sm:rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-carbon">
              Delete Knowledge Item?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete "{deletingFact?.title}"? It will no longer be available
              to the AI chatbot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="mono text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFact && deleteFactMutation.mutate(deletingFact.id)}
              className="mono text-xs bg-rose-600 hover:bg-rose-700 text-white border-none"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
