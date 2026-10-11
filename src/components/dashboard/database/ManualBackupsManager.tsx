import { useState, useMemo } from "react";
import {
  HardDrive,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Calendar,
  Layers,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  X,
  FileText,
  Activity,
  Zap,
  Search,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Database as DatabaseIcon,
  Sparkles,
} from "lucide-react";
import type {
  ManualDatabaseBackupRecord,
  AutomationBackupStatusResponse,
  AutomationDiagnosticResult,
} from "@/lib/database-admin.functions";
import { toast } from "sonner";

interface ManualBackupsManagerProps {
  manualBackups: ManualDatabaseBackupRecord[];
  automationStatus: AutomationBackupStatusResponse | null;
  isLoading: boolean;
  isTakingBackup: boolean;
  isTestingAutomation: boolean;
  onTakeManualBackup: () => void;
  onRefresh: () => void;
  onDownloadBackup: (backupId: string) => void;
  onTestAutomation: () => void;
  diagnosticResult: AutomationDiagnosticResult | null;
}

export function ManualBackupsManager({
  manualBackups,
  automationStatus,
  isLoading,
  isTakingBackup,
  isTestingAutomation,
  onTakeManualBackup,
  onRefresh,
  onDownloadBackup,
  onTestAutomation,
  diagnosticResult,
}: ManualBackupsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBackup, setSelectedBackup] = useState<ManualDatabaseBackupRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState(false);

  // Filter manual backups
  const filteredBackups = useMemo(() => {
    if (!searchQuery.trim()) return manualBackups;
    const q = searchQuery.toLowerCase().trim();
    return manualBackups.filter(
      (b) =>
        b.filename?.toLowerCase().includes(q) ||
        b.backup_date?.toLowerCase().includes(q) ||
        b.admin_email?.toLowerCase().includes(q) ||
        b.status?.toLowerCase().includes(q),
    );
  }, [manualBackups, searchQuery]);

  // Aggregate stats
  const totalSizeBytes = useMemo(() => {
    return manualBackups.reduce((acc, b) => acc + (b.file_size_bytes || 0), 0);
  }, [manualBackups]);

  const latestBackup = useMemo(() => {
    return manualBackups.length > 0 ? manualBackups[0] : null;
  }, [manualBackups]);

  const formatTotalSize = (bytes: number) => {
    if (bytes <= 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Executive Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Manual Backups */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Manual Snapshots
            </span>
            <div className="p-2 rounded-sm bg-cobalt/10 border border-cobalt/20 text-cobalt">
              <DatabaseIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="mono text-2xl font-bold text-carbon">
              {manualBackups.length}
            </span>
            <span className="text-xs text-muted-foreground font-medium mono">on-demand runs</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground mono">
            Total storage: {formatTotalSize(totalSizeBytes)}
          </p>
        </div>

        {/* Latest Snapshot */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Latest Manual Run
            </span>
            <div className="p-2 rounded-sm bg-cobalt/10 border border-cobalt/20 text-cobalt">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {latestBackup ? (
              <>
                <p className="mono text-xs font-semibold text-carbon truncate" title={latestBackup.filename}>
                  {latestBackup.filename}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground mono">
                  <span>{latestBackup.backup_date} {latestBackup.backup_time}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{latestBackup.file_size_pretty}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-2 mono">No manual backups yet</p>
            )}
          </div>
        </div>

        {/* Automation Status Badge */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Automated Backup Status
            </span>
            <div
              className={`p-2 rounded-sm border ${
                automationStatus?.status === "healthy"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : automationStatus?.status === "warning"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-cobalt/10 border-cobalt/20 text-cobalt"
              }`}
            >
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                automationStatus?.isWorking
                  ? "bg-emerald-600 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <span className="mono text-xs font-bold text-carbon">
              {automationStatus?.statusBadge || "CHECKING STATUS…"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate mono" title={automationStatus?.statusMessage}>
            {automationStatus?.scheduleTimeUtc || "Daily at 02:00 UTC"}
          </p>
        </div>

        {/* Email Notification Channel */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Email Notifications
            </span>
            <div className="p-2 rounded-sm bg-cobalt/10 border border-cobalt/20 text-cobalt">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Active in Both Modes</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground truncate" title={automationStatus?.emailNotificationTarget}>
              Target: <span className="mono text-carbon">contact.piyushprasad@gmail.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Automated Backup Verification & Health Diagnostic Card */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt/10 px-2.5 py-0.5 text-[10px] mono font-semibold text-cobalt border border-cobalt/20">
                <ShieldCheck className="h-3.5 w-3.5 text-cobalt" />
                AUTOMATION HEALTH MONITOR
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-emerald-700 font-medium">Daily Cron Active</span>
            </div>
            <h3 className="text-sm font-bold text-carbon">
              Scheduled Daily Database Backup Pipeline
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Automated backups run every day at <strong className="text-cobalt">02:00 UTC</strong> via GitHub Actions and the PP·OPS API. 
              {automationStatus?.lastRunAt ? (
                <> Last successful automated run completed on <strong className="text-carbon">{new Date(automationStatus.lastRunAt).toLocaleDateString()} at {new Date(automationStatus.lastRunAt).toLocaleTimeString()}</strong> ({automationStatus.lastRunSize}).</>
              ) : (
                <> Next run scheduled for 02:00 UTC.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onTestAutomation}
              disabled={isTestingAutomation}
              className="inline-flex items-center gap-2 rounded-sm bg-cobalt px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isTestingAutomation ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Testing Automation Run…</span>
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5" />
                  <span>Check Automation Status</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-2 text-xs font-semibold text-carbon hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            >
              <span>{showDiagnosticsDetail ? "Hide Details" : "View Pipeline Checks"}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Diagnostics Detail Checklist */}
        {showDiagnosticsDetail && automationStatus?.diagnostics && (
          <div className="mt-4 pt-4 border-t border-[#E5E5DF] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {automationStatus.diagnostics.map((diag, idx) => (
              <div
                key={idx}
                className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3 flex items-start gap-2.5"
              >
                <div className="p-1 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-carbon">{diag.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{diag.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Test Result Feedback Banner */}
        {diagnosticResult && (
          <div
            className={`mt-4 rounded-sm p-3 text-xs border ${
              diagnosticResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {diagnosticResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{diagnosticResult.message}</span>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              {diagnosticResult.checks.map((chk, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={chk.status === "pass" ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>•</span>
                  <span>{chk.title}: {chk.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Toolbar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename, date, or admin…"
            className="w-full rounded-sm border border-[#E5E5DF] bg-white pl-9 pr-3 py-1.5 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onTakeManualBackup()}
            disabled={isTakingBackup}
            className="inline-flex items-center gap-2 rounded-sm bg-cobalt px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isTakingBackup ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Taking Snapshot & Sending Alert…</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Take Manual Backup Now</span>
              </>
            )}
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6] transition-colors cursor-pointer shadow-2xs"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4. Dedicated Manual Database Backups Table */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white overflow-hidden shadow-2xs">
        <div className="border-b border-[#E5E5DF] px-5 py-3.5 flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4 text-cobalt" />
            <h3 className="mono text-xs font-semibold uppercase tracking-wider text-carbon">
              Manual Backups Ledger
            </h3>
            <span className="rounded-sm bg-cobalt/10 px-2 py-0.5 text-[10px] mono text-cobalt border border-cobalt/20 font-bold">
              {filteredBackups.length} snapshots
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground mono">
            Dedicated on-demand snapshots preserved in vault & Supabase
          </span>
        </div>

        {isLoading && manualBackups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground mono text-xs gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-cobalt" />
            <span>Loading manual backup records…</span>
          </div>
        ) : filteredBackups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF] flex items-center justify-center text-muted-foreground mb-3">
              <DatabaseIcon className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-carbon">No Manual Backups Found</h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              {searchQuery
                ? `No manual backup matches "${searchQuery}". Clear your search query to see all records.`
                : "No manual snapshots taken yet. Click 'Take Manual Backup Now' above to generate your first manual snapshot."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => onTakeManualBackup()}
                disabled={isTakingBackup}
                className="mt-4 inline-flex items-center gap-2 rounded-sm bg-cobalt px-4 py-2 text-xs font-semibold text-white hover:bg-cobalt/90 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Take First Manual Backup</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-[10px] uppercase tracking-wider text-muted-foreground border-b border-[#E5E5DF] mono">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-semibold">Filename</th>
                  <th className="py-3 px-4 font-semibold">Initiated By</th>
                  <th className="py-3 px-4 font-semibold">Tables &amp; Records</th>
                  <th className="py-3 px-4 font-semibold">Archive Size</th>
                  <th className="py-3 px-4 font-semibold">Email Trigger</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredBackups.map((bk) => (
                  <tr
                    key={bk.id || bk.filename}
                    className="hover:bg-[#FAF9F6]/80 transition-colors"
                  >
                    {/* Date & Time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-semibold text-carbon">
                            {bk.backup_date || new Date(bk.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-[11px] text-muted-foreground mono">
                            {bk.backup_time || new Date(bk.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Filename */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="mono text-carbon font-medium">
                          {bk.filename}
                        </span>
                        <button
                          onClick={() => copyToClipboard(bk.filename, bk.id)}
                          className="text-muted-foreground hover:text-carbon transition-colors p-1"
                          title="Copy filename"
                        >
                          {copiedId === bk.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Initiated By */}
                    <td className="py-3 px-4">
                      <span className="truncate text-muted-foreground mono text-[11px]" title={bk.admin_email}>
                        {bk.admin_email || "admin@piyushprasad.in"}
                      </span>
                    </td>

                    {/* Tables & Records */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="mono font-semibold text-carbon">
                          {bk.total_records} records
                        </span>
                        <span className="text-[10px] text-muted-foreground mono">
                          {bk.tables_included?.length || 8} tables backed up
                        </span>
                      </div>
                    </td>

                    {/* Archive Size */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="mono text-emerald-700 font-semibold">
                        {bk.file_size_pretty || "0 B"}
                      </span>
                    </td>

                    {/* Email Trigger Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {bk.email_sent ? (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 mono">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Email Dispatched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground mono">
                          Pending Dispatch
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] mono font-semibold uppercase tracking-wider border ${
                          bk.status === "SUCCESS"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}
                      >
                        {bk.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onDownloadBackup(bk.id || bk.filename)}
                          className="inline-flex items-center gap-1 rounded-sm border border-cobalt/30 bg-cobalt/5 px-2.5 py-1 text-[11px] font-semibold text-cobalt hover:bg-cobalt hover:text-white transition-colors cursor-pointer"
                          title="Download SQL snapshot"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => setSelectedBackup(bk)}
                          className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] bg-white px-2 py-1 text-[11px] font-semibold text-carbon hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                          title="View metadata and SQL preview"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal: Backup Snapshot Inspection */}
      {selectedBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-cobalt" />
                <h3 className="text-sm font-bold text-carbon">
                  Manual Snapshot Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedBackup(null)}
                className="text-muted-foreground hover:text-carbon p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-sm bg-[#FAF9F6] p-3 border border-[#E5E5DF]">
                <p className="mono text-[10px] uppercase text-muted-foreground font-semibold">Filename</p>
                <p className="mono text-carbon font-bold mt-0.5 truncate">
                  {selectedBackup.filename}
                </p>
              </div>

              <div className="rounded-sm bg-[#FAF9F6] p-3 border border-[#E5E5DF]">
                <p className="mono text-[10px] uppercase text-muted-foreground font-semibold">Created At</p>
                <p className="text-carbon mono mt-0.5">
                  {selectedBackup.backup_date} {selectedBackup.backup_time}
                </p>
              </div>

              <div className="rounded-sm bg-[#FAF9F6] p-3 border border-[#E5E5DF]">
                <p className="mono text-[10px] uppercase text-muted-foreground font-semibold">Admin Account</p>
                <p className="text-carbon mono mt-0.5 truncate">{selectedBackup.admin_email}</p>
              </div>

              <div className="rounded-sm bg-[#FAF9F6] p-3 border border-[#E5E5DF]">
                <p className="mono text-[10px] uppercase text-muted-foreground font-semibold">Archive Size</p>
                <p className="text-emerald-700 mono font-bold mt-0.5">
                  {selectedBackup.file_size_pretty} ({selectedBackup.total_records} records)
                </p>
              </div>
            </div>

            {/* Tables Included */}
            <div>
              <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                Included Application Tables
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(selectedBackup.tables_included || []).map((t) => (
                  <span
                    key={t}
                    className="rounded-sm bg-[#FAF9F6] px-2 py-0.5 text-[11px] mono text-carbon border border-[#E5E5DF]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* SQL Content Snippet Preview */}
            {selectedBackup.backup_data?.sql && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    SQL Archive Preview
                  </p>
                  <button
                    onClick={() => copyToClipboard(selectedBackup.backup_data.sql, "sql-modal")}
                    className="inline-flex items-center gap-1 text-[11px] text-cobalt hover:text-cobalt/80 transition-colors mono"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy SQL</span>
                  </button>
                </div>
                <pre className="max-h-48 overflow-y-auto rounded-sm bg-[#FAF9F6] p-3 mono text-[11px] text-carbon border border-[#E5E5DF]">
                  {selectedBackup.backup_data.sql.slice(0, 1500)}
                  {selectedBackup.backup_data.sql.length > 1500 && "\n\n-- [Truncated preview...]"}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5DF]">
              <button
                onClick={() => onDownloadBackup(selectedBackup.id || selectedBackup.filename)}
                className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt px-3.5 py-2 text-xs font-semibold text-white hover:bg-cobalt/90 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .sql File</span>
              </button>
              <button
                onClick={() => setSelectedBackup(null)}
                className="rounded-sm border border-[#E5E5DF] bg-[#121316] text-white px-3.5 py-2 text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
