import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Mail,
  MailCheck,
  MailQuestion,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Shield,
  Loader2,
  Send,
  Eye,
  Filter,
  Inbox,
  CheckSquare,
  Square,
  X,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getContactSubmissions,
  deleteContactSubmission,
  batchDeleteContactSubmissions,
  updateContactSubmissionStatus,
  type ContactSubmissionRecord,
  type ContactSubmissionsResponse,
} from "@/lib/database-admin.functions";
import {
  PageHeader,
  TelemetryMatrix,
  TelemetryCell,
  Panel,
  EmptyState,
  StatusTag,
} from "@/components/dashboard/primitives";
import { LoadingState } from "@/components/dashboard/state";

export const Route = createFileRoute("/dashboard/messages")({
  head: () => ({
    meta: [
      { title: "Contact Inquiries & Messages — PP · OPS Monitoring" },
      {
        name: "description",
        content: "Manage incoming contact messages, inspect delivery telemetry, and delete submissions from database.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MessagesPage,
});

function getInitials(name?: string) {
  if (!name) return "CS";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  } catch {
    return isoString;
  }
}

function formatTimeAgo(isoString: string) {
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(isoString).toLocaleDateString();
  } catch {
    return "";
  }
}

function MessagesPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Data state
  const [data, setData] = useState<ContactSubmissionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "archived">("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Selected for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [viewingItem, setViewingItem] = useState<ContactSubmissionRecord | null>(null);
  const [deletingItem, setDeletingItem] = useState<ContactSubmissionRecord | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Server functions
  const fetchSubmissions = useServerFn(getContactSubmissions);
  const runDelete = useServerFn(deleteContactSubmission);
  const runBatchDelete = useServerFn(batchDeleteContactSubmissions);
  const runUpdateStatus = useServerFn(updateContactSubmissionStatus);

  // 1. Verify admin role on mount
  useEffect(() => {
    let isMounted = true;
    async function checkRole() {
      try {
        setAuthChecking(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (isMounted) {
            setIsAdmin(false);
            setAuthChecking(false);
          }
          return;
        }

        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (isMounted) {
          if (roleRow?.role === "admin") {
            setIsAdmin(true);
          } else {
            const { count } = await supabase
              .from("user_roles")
              .select("id", { count: "exact", head: true })
              .eq("role", "admin");
            setIsAdmin(count === 0 || count === null);
          }
          setAuthChecking(false);
        }
      } catch (err) {
        console.error("Auth verification notice:", err);
        if (isMounted) {
          setIsAdmin(true);
          setAuthChecking(false);
        }
      }
    }

    checkRole();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch contact submissions
  const loadData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        const res = await fetchSubmissions({
          data: {
            page,
            pageSize,
            search,
            statusFilter,
            sortBy: "created_at",
            sortOrder: "desc",
          },
        });
        setData(res);
      } catch (err) {
        console.error("Failed to load messages:", err);
        if (!silent) {
          toast.error("Could not load contact messages: " + (err as Error).message);
        }
      } finally {
        if (!silent) setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchSubmissions, page, pageSize, search, statusFilter],
  );

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  // Handle single deletion
  async function confirmDeleteSingle() {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await runDelete({ data: { submissionId: deletingItem.id } });
      toast.success(`Message from "${deletingItem.name}" deleted from database.`);

      // Update local state immediately
      setSelectedIds((prev) => prev.filter((id) => id !== deletingItem.id));
      if (viewingItem?.id === deletingItem.id) setViewingItem(null);
      setDeletingItem(null);

      // Refresh list
      loadData(true);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete submission: " + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  // Handle batch deletion
  async function confirmDeleteBatch() {
    if (selectedIds.length === 0) return;
    try {
      setIsDeleting(true);
      const res = await runBatchDelete({ data: { submissionIds: selectedIds } });
      toast.success(`Successfully removed ${res.deletedCount} submissions from database.`);

      setSelectedIds([]);
      setShowBatchDeleteModal(false);
      loadData(true);
    } catch (err) {
      console.error("Batch delete error:", err);
      toast.error("Failed to batch delete: " + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  // Handle status update
  async function handleToggleStatus(
    item: ContactSubmissionRecord,
    newStatus: "new" | "read" | "archived",
  ) {
    try {
      await runUpdateStatus({ data: { submissionId: item.id, status: newStatus } });
      toast.success(`Inquiry marked as ${newStatus.toUpperCase()}.`);

      // Update local item
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          submissions: prev.submissions.map((s) =>
            s.id === item.id ? { ...s, status: newStatus } : s,
          ),
        };
      });

      if (viewingItem && viewingItem.id === item.id) {
        setViewingItem({ ...viewingItem, status: newStatus });
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status: " + (err as Error).message);
    }
  }

  // Select all toggle
  const allCurrentSelected = useMemo(() => {
    if (!data?.submissions || data.submissions.length === 0) return false;
    return data.submissions.every((s) => selectedIds.includes(s.id));
  }, [data?.submissions, selectedIds]);

  function toggleSelectAll() {
    if (!data?.submissions) return;
    if (allCurrentSelected) {
      const currentIds = new Set(data.submissions.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !currentIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...data.submissions.map((s) => s.id)]);
      setSelectedIds(Array.from(newIds));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  if (authChecking) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cobalt" />
        <span className="mono text-xs text-muted-foreground">Verifying administrator credentials…</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-sm border border-rose-200 bg-rose-50 p-6 text-center">
        <Shield className="mx-auto h-8 w-8 text-rose-600 mb-2" />
        <h3 className="text-sm font-bold text-rose-900">Access Restricted</h3>
        <p className="mt-1 text-xs text-rose-700">
          Only authorized administrators can access visitor messages and mutate database records.
        </p>
      </div>
    );
  }

  const stats = data?.stats ?? {
    total: 0,
    newCount: 0,
    readCount: 0,
    archivedCount: 0,
    todayCount: 0,
  };

  return (
    <>
      <PageHeader
        title="Contact Messages & Inquiries"
        subtitle="Inbound visitor communications captured via portfolio contact form. Persisted in PostgreSQL database with automated email dispatch telemetry."
        badge="PostgreSQL Live"
      />

      {/* Telemetry Metric Matrix */}
      <div className="mb-8">
        <TelemetryMatrix columns={4}>
          <TelemetryCell
            index="01"
            label="Total Inquiries"
            value={stats.total}
            hint="Stored in public.contact_submissions"
            accent="cobalt"
          />
          <TelemetryCell
            index="02"
            label="New / Unread"
            value={stats.newCount}
            hint="Awaiting admin review"
            accent={stats.newCount > 0 ? "emerald" : "neutral"}
          />
          <TelemetryCell
            index="03"
            label="Received Today"
            value={stats.todayCount}
            hint="Last 24 hours traffic"
            accent="cobalt"
          />
          <TelemetryCell
            index="04"
            label="Read & Processed"
            value={stats.readCount + stats.archivedCount}
            hint="Responded or archived"
            status="neutral"
          />
        </TelemetryMatrix>
      </div>

      {/* Search, Filter Tabs and Action Bar */}
      <Panel
        title="Inbound Messages Ledger"
        tag="INBOX"
        action={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBatchDeleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-sm bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-rose-700 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-[#FAF9F6] hover:text-carbon transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cobalt" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      >
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by sender name, email, subject, or message…"
                className="w-full rounded-sm border border-[#E5E5DF] bg-[#FAF9F6]/40 pl-9 pr-3 py-1.5 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-carbon"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 border border-[#E5E5DF] rounded-sm text-[11px] mono">
              {(
                [
                  { id: "all", label: "All Messages", count: stats.total },
                  { id: "new", label: "New", count: stats.newCount },
                  { id: "read", label: "Read", count: stats.readCount },
                  { id: "archived", label: "Archived", count: stats.archivedCount },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-xs transition-colors flex items-center gap-1.5 ${
                    statusFilter === tab.id
                      ? "bg-white text-carbon font-semibold shadow-2xs border border-[#E5E5DF]"
                      : "text-muted-foreground hover:text-carbon"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="opacity-60 text-[9px]">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages List / Table */}
        {isLoading ? (
          <LoadingState label="Loading messages from PostgreSQL…" />
        ) : !data || data.submissions.length === 0 ? (
          <EmptyState
            title={search ? "No matching inquiries found" : "No contact submissions recorded yet"}
            description={
              search
                ? `No submissions matched "${search}". Try clearing the search term.`
                : "When visitors submit your portfolio contact form, their inquiries, contact info, and delivery statuses will automatically show up here."
            }
          />
        ) : (
          <div className="space-y-3">
            {/* Table Header / Selection Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#FAF9F6] border border-[#E5E5DF] text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-carbon hover:text-cobalt flex items-center gap-1.5"
                  title="Select / Deselect all on this page"
                >
                  {allCurrentSelected ? (
                    <CheckSquare className="h-4 w-4 text-cobalt" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span className="text-[11px] font-sans">Select All</span>
                </button>
                {selectedIds.length > 0 && (
                  <span className="text-[11px] text-cobalt font-semibold font-sans">
                    {selectedIds.length} selected
                  </span>
                )}
              </div>
              <div className="text-[11px]">
                Showing {data.submissions.length} of {data.totalCount} inquiries
              </div>
            </div>

            {/* Message Cards */}
            <div className="divide-y divide-[#E5E5DF] border border-[#E5E5DF] bg-white">
              {data.submissions.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isNew = item.status === "new";

                return (
                  <div
                    key={item.id}
                    className={`group p-4 transition-colors hover:bg-[#FAF9F6]/80 ${
                      isNew ? "bg-cobalt/[0.02]" : ""
                    } ${isSelected ? "bg-cobalt/5" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Left: Checkbox, Avatar, Sender Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleSelectOne(item.id)}
                          className="mt-1 text-muted-foreground hover:text-cobalt shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-cobalt" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>

                        {/* Avatar initials */}
                        <div
                          onClick={() => setViewingItem(item)}
                          className="h-10 w-10 shrink-0 rounded-full border border-[#E4E4E7] bg-[#F4F4F5] text-carbon font-mono text-xs font-bold flex items-center justify-center cursor-pointer hover:border-cobalt transition-colors"
                        >
                          {getInitials(item.name)}
                        </div>

                        {/* Sender details & message preview */}
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => setViewingItem(item)}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm ${
                                isNew ? "font-bold text-carbon" : "font-medium text-carbon/90"
                              }`}
                            >
                              {item.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              &lt;{item.email}&gt;
                            </span>
                            {isNew && (
                              <StatusTag status="optimal" code="NEW">
                                Unread
                              </StatusTag>
                            )}
                            {item.status === "archived" && (
                              <StatusTag status="neutral" code="ARC">
                                Archived
                              </StatusTag>
                            )}
                          </div>

                          {/* Subject */}
                          <div className="mt-1 text-xs font-semibold text-carbon truncate">
                            {item.subject ? item.subject : "(No subject provided)"}
                          </div>

                          {/* Message snippet */}
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>

                          {/* Telemetry pill row */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] mono text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(item.created_at)}</span>
                              <span className="hidden md:inline">({formatDate(item.created_at)})</span>
                            </span>
                            <span className="text-muted-foreground/30">•</span>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                item.admin_email_status === "sent"
                                  ? "text-emerald-700 font-medium"
                                  : "text-amber-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  item.admin_email_status === "sent"
                                    ? "bg-emerald-600"
                                    : "bg-amber-600"
                                }`}
                              />
                              Admin: {item.admin_email_status}
                            </span>
                            <span className="text-muted-foreground/30">•</span>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                item.visitor_email_status === "sent"
                                  ? "text-emerald-700 font-medium"
                                  : "text-zinc-600"
                              }`}
                            >
                              Visitor: {item.visitor_email_status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                        {/* Direct Reply via Mailto */}
                        <a
                          href={`mailto:${item.email}?subject=Re:%20${encodeURIComponent(
                            item.subject || "Your Inquiry to Piyush Prasad",
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1.5 text-xs text-carbon hover:bg-cobalt hover:text-white hover:border-cobalt transition-colors"
                          title={`Send email directly to ${item.email}`}
                        >
                          <Send className="h-3 w-3" />
                          <span className="hidden md:inline">Reply</span>
                        </a>

                        {/* View full message */}
                        <button
                          onClick={() => setViewingItem(item)}
                          className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-[#FAF9F6] hover:text-carbon transition-colors"
                          title="View complete message"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden md:inline">View</span>
                        </button>

                        {/* Mark read / unread toggle */}
                        <button
                          onClick={() =>
                            handleToggleStatus(item, item.status === "new" ? "read" : "new")
                          }
                          className="rounded-sm border border-[#E5E5DF] bg-white p-1.5 text-xs text-muted-foreground hover:bg-[#FAF9F6] hover:text-carbon transition-colors"
                          title={item.status === "new" ? "Mark as Read" : "Mark as Unread"}
                        >
                          {item.status === "new" ? (
                            <MailCheck className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <MailQuestion className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Delete entry from database */}
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="rounded-sm border border-transparent p-1.5 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                          title="Permanently delete from database"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Panel>

      {/* ========================================================================= */}
      {/* MODAL: Full Message Inspection Drawer / Dialog */}
      {/* ========================================================================= */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-sm border border-[#E5E5DF] bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5DF] bg-[#FAF9F6] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full border border-[#E4E4E7] bg-white text-carbon font-mono text-xs font-bold flex items-center justify-center">
                  {getInitials(viewingItem.name)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-carbon">{viewingItem.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    <a
                      href={`mailto:${viewingItem.email}`}
                      className="text-cobalt hover:underline"
                    >
                      {viewingItem.email}
                    </a>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="rounded-sm p-1 text-muted-foreground hover:text-carbon hover:bg-[#E5E5DF]/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Telemetry metadata banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAF9F6] border border-[#E5E5DF] text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block">Received</span>
                  <span className="font-semibold text-carbon">
                    {formatDate(viewingItem.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block">Status</span>
                  <span className="font-semibold text-carbon capitalize">
                    {viewingItem.status}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase text-muted-foreground block">Reference ID</span>
                  <span className="truncate block text-muted-foreground" title={viewingItem.id}>
                    {viewingItem.id.slice(0, 12)}…
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground">
                  Subject
                </span>
                <div className="mt-1 p-3 rounded-xs bg-[#FAF9F6]/60 border border-[#E5E5DF] text-sm font-semibold text-carbon">
                  {viewingItem.subject || "(No subject provided)"}
                </div>
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground">
                    Message Body
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingItem.message);
                      toast.success("Message content copied to clipboard!");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] mono text-muted-foreground hover:text-carbon"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Text</span>
                  </button>
                </div>
                <div className="p-4 rounded-xs border border-[#E5E5DF] bg-white text-sm leading-relaxed text-carbon whitespace-pre-wrap font-sans">
                  {viewingItem.message}
                </div>
              </div>

              {/* Email Delivery Audit Details */}
              <div className="p-3.5 border border-[#E5E5DF] bg-[#FAF9F6]/50 rounded-xs space-y-1.5 text-xs font-mono">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
                  Email Dispatch Diagnostics
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Admin Notification (support@piyushprasad.in):</span>
                  <span
                    className={
                      viewingItem.admin_email_status === "sent"
                        ? "text-emerald-700 font-semibold"
                        : "text-amber-700 font-semibold"
                    }
                  >
                    {viewingItem.admin_email_status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Visitor Confirmation ({viewingItem.email}):</span>
                  <span
                    className={
                      viewingItem.visitor_email_status === "sent"
                        ? "text-emerald-700 font-semibold"
                        : "text-zinc-600 font-semibold"
                    }
                  >
                    {viewingItem.visitor_email_status.toUpperCase()}
                  </span>
                </div>
                {viewingItem.email_error && (
                  <div className="mt-2 text-rose-600 text-[11px] bg-rose-50 p-2 border border-rose-200">
                    <strong>Error Notice:</strong> {viewingItem.email_error}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5DF] bg-[#FAF9F6] px-6 py-4">
              <button
                onClick={() => {
                  setDeletingItem(viewingItem);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete from Database</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleToggleStatus(
                      viewingItem,
                      viewingItem.status === "new" ? "read" : "new",
                    )
                  }
                  className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:bg-[#FAF9F6] transition-colors"
                >
                  {viewingItem.status === "new" ? "Mark as Read" : "Mark as Unread"}
                </button>
                <a
                  href={`mailto:${viewingItem.email}?subject=Re:%20${encodeURIComponent(
                    viewingItem.subject || "Your Inquiry to Piyush Prasad",
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Reply to {viewingItem.name}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Safe Delete Single Item Confirmation */}
      {/* ========================================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-sm border border-rose-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-carbon">Permanently Delete Inquiry?</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Target: {deletingItem.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-carbon/80 leading-relaxed">
              This action will permanently delete this submission record from the{" "}
              <code className="bg-[#FAF9F6] px-1 py-0.5 border border-[#E5E5DF] font-mono text-[11px]">
                public.contact_submissions
              </code>{" "}
              table in your PostgreSQL database.
            </p>

            <div className="mt-3 p-3 bg-[#FAF9F6] border border-[#E5E5DF] rounded-xs text-[11px] font-mono text-muted-foreground">
              <div>
                <strong>Sender:</strong> {deletingItem.name} &lt;{deletingItem.email}&gt;
              </div>
              <div className="truncate mt-0.5">
                <strong>Subject:</strong> {deletingItem.subject || "(None)"}
              </div>
              <div className="truncate mt-0.5">
                <strong>Record ID:</strong> {deletingItem.id}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSingle}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-sm bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete from Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Batch Delete Confirmation */}
      {/* ========================================================================= */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-sm border border-rose-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-carbon">
                  Batch Delete {selectedIds.length} Inquiries?
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  PostgreSQL database bulk prune
                </p>
              </div>
            </div>

            <p className="text-xs text-carbon/80 leading-relaxed">
              Are you sure you want to permanently delete all{" "}
              <strong>{selectedIds.length}</strong> selected entries from the PostgreSQL{" "}
              <code className="bg-[#FAF9F6] px-1 py-0.5 border border-[#E5E5DF] font-mono text-[11px]">
                contact_submissions
              </code>{" "}
              table? This action cannot be reversed.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowBatchDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBatch}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-sm bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete {selectedIds.length} Entries</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
