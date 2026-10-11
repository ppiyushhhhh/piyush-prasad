import { useState, useMemo } from "react";
import {
  ShieldCheck,
  HardDrive,
  Download,
  Trash2,
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
  TrendingUp,
  AlertCircle,
  BarChart3,
  CalendarRange,
  Database as DatabaseIcon,
  ChevronRight,
  Send,
} from "lucide-react";
import type {
  DatabaseBackupRecord,
  MonthlyBackupReportRecord,
} from "@/lib/database-admin.functions";

interface DatabaseBackupsProps {
  backups: DatabaseBackupRecord[];
  monthlyReports: MonthlyBackupReportRecord[];
  isLoading: boolean;
  isCreatingBackup: boolean;
  isPruning: boolean;
  isMonthlyReportsLoading?: boolean;
  onTakeManualBackup: () => void;
  onRunRetentionPrune: () => void;
  onDownloadBackup: (backupId: string) => void;
  onGenerateMonthlyReport: (year: number, month: number, sendEmail: boolean) => Promise<any>;
  onRefresh: () => void;
}

export function DatabaseBackups({
  backups,
  monthlyReports,
  isLoading,
  isCreatingBackup,
  isPruning,
  isMonthlyReportsLoading = false,
  onTakeManualBackup,
  onRunRetentionPrune,
  onDownloadBackup,
  onGenerateMonthlyReport,
  onRefresh,
}: DatabaseBackupsProps) {
  const [selectedBackupForModal, setSelectedBackupForModal] =
    useState<DatabaseBackupRecord | null>(null);
  const [showPruneConfirmDialog, setShowPruneConfirmDialog] = useState(false);
  const [selectedMonthlyReport, setSelectedMonthlyReport] =
    useState<MonthlyBackupReportRecord | null>(null);
  const [isGeneratingMonthly, setIsGeneratingMonthly] = useState(false);

  // Compute key dashboard metrics
  const successfulBackups = useMemo(
    () => backups.filter((b) => b.status === "SUCCESS"),
    [backups],
  );

  const failedBackups = useMemo(
    () => backups.filter((b) => b.status === "FAILED"),
    [backups],
  );

  const storedBackups = useMemo(
    () => backups.filter((b) => b.status === "SUCCESS" && !b.deleted_at),
    [backups],
  );

  const lastSuccessfulBackup = useMemo(() => {
    return successfulBackups.length > 0 ? successfulBackups[0] : null;
  }, [successfulBackups]);

  const latestBackupAttempt = useMemo(() => {
    return backups.length > 0 ? backups[0] : null;
  }, [backups]);

  const totalStoredBytes = useMemo(() => {
    return storedBackups.reduce((acc, b) => acc + (b.file_size_bytes || 0), 0);
  }, [storedBackups]);

  // Format total stored bytes
  const totalStoredPretty = useMemo(() => {
    if (totalStoredBytes <= 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(totalStoredBytes) / Math.log(k));
    const num = parseFloat((totalStoredBytes / Math.pow(k, i)).toFixed(1));
    return `${num} ${sizes[i]}`;
  }, [totalStoredBytes]);

  const manualBackupsCount = useMemo(
    () => backups.filter((b) => b.backup_type === "manual" || (b.metadata as any)?.backupTypeTag === "MANUAL").length,
    [backups],
  );

  const automaticBackupsCount = useMemo(
    () => backups.length - manualBackupsCount,
    [backups, manualBackupsCount],
  );

  // Calculate current month's on-the-fly statistics if no stored report yet
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;

  const currentMonthStats = useMemo(() => {
    const currentMonthRecords = backups.filter((b) => {
      const d = new Date(b.created_at);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonthNum;
    });

    const total = currentMonthRecords.length;
    const success = currentMonthRecords.filter((b) => b.status === "SUCCESS").length;
    const failed = currentMonthRecords.filter((b) => b.status === "FAILED").length;
    const rate = total > 0 ? parseFloat(((success / total) * 100).toFixed(2)) : 100;

    return { total, success, failed, rate, records: currentMonthRecords };
  }, [backups, currentYear, currentMonthNum]);

  // Active Monthly Report for display
  const activeReport = useMemo(() => {
    if (selectedMonthlyReport) return selectedMonthlyReport;
    if (monthlyReports.length > 0) return monthlyReports[0];
    return null;
  }, [selectedMonthlyReport, monthlyReports]);

  async function handleTriggerMonthlyGenerate(sendEmail = false) {
    try {
      setIsGeneratingMonthly(true);
      const res = await onGenerateMonthlyReport(currentYear, currentMonthNum, sendEmail);
      if (res) {
        setSelectedMonthlyReport(res);
      }
    } finally {
      setIsGeneratingMonthly(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Retention & Backup Policy Hero Panel */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 space-y-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-sm border bg-cobalt/10 border-cobalt/20 text-cobalt">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-carbon tracking-tight">
                  Supabase Database Backup &amp; 7-Day Retention System
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Operational
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs mono text-cobalt bg-cobalt/10 border border-cobalt/20">
                  <Lock className="h-3 w-3" /> Private Storage
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Automated daily PostgreSQL SQL backups to private Supabase Storage, rolling 7-day retention rotation, and immutable backup history.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6] transition-colors disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-cobalt" : ""}`} />
              Refresh
            </button>

            {/* Manual Backup Button */}
            <button
              onClick={onTakeManualBackup}
              disabled={isCreatingBackup || isPruning}
              className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt hover:bg-cobalt/90 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              <Download className={`h-3.5 w-3.5 ${isCreatingBackup ? "animate-bounce" : ""}`} />
              {isCreatingBackup ? "Capturing SQL Dump…" : "Take Manual Backup"}
            </button>

            {/* Run 7-Day Cleanup Now */}
            <button
              onClick={() => setShowPruneConfirmDialog(true)}
              disabled={isCreatingBackup || isPruning}
              className="inline-flex items-center gap-1.5 rounded-sm border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-semibold text-amber-800 transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-amber-600" />
              {isPruning ? "Evaluating Retention…" : "Run 7-Day Cleanup"}
            </button>
          </div>
        </div>

        {/* 6 Key Operational Telemetry KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 text-xs mono">
          {/* Card 1: Last Successful Backup */}
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-between font-sans">
              <span>Last Successful Backup</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-emerald-700 truncate">
              {lastSuccessfulBackup
                ? new Date(lastSuccessfulBackup.created_at).toLocaleDateString()
                : "None recorded"}
            </div>
            <p className="text-[11px] text-muted-foreground font-sans truncate">
              {lastSuccessfulBackup
                ? `${lastSuccessfulBackup.filename} (${lastSuccessfulBackup.file_size_pretty})`
                : "Pending daily run"}
            </p>
          </div>

          {/* Card 2: Next Scheduled Backup */}
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-between font-sans">
              <span>Next Scheduled Backup</span>
              <Clock className="h-3.5 w-3.5 text-cobalt" />
            </div>
            <div className="text-sm font-bold text-carbon">
              Daily 02:00 UTC
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Every 24 Hours (Automated)
            </p>
          </div>

          {/* Card 3: Current Backup Status */}
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-between font-sans">
              <span>Current Backup Status</span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-carbon flex items-center gap-1.5">
              {latestBackupAttempt?.status === "FAILED" ? (
                <span className="text-rose-700 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-rose-600" /> Alerting
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Healthy
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              {latestBackupAttempt?.status === "FAILED"
                ? "Recent backup attempt failed"
                : "All systems nominal"}
            </p>
          </div>

          {/* Card 4: Stored Backups in Storage */}
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-between font-sans">
              <span>Stored in Supabase</span>
              <DatabaseIcon className="h-3.5 w-3.5 text-cobalt" />
            </div>
            <div className="text-sm font-bold text-carbon">
              {storedBackups.length} Files
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Within 7-day retention window
            </p>
          </div>

          {/* Card 5: Storage Used */}
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-between font-sans">
              <span>Storage Used</span>
              <Layers className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="text-sm font-bold text-carbon">
              {totalStoredPretty}
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Bucket: database-backups
            </p>
          </div>

          {/* Card 6: Retention Period */}
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center justify-between font-sans">
              <span>Retention Period</span>
              <Calendar className="h-3.5 w-3.5 text-cobalt" />
            </div>
            <div className="text-sm font-bold text-carbon">
              7 Days Rolling
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Older files pruned automatically
            </p>
          </div>
        </div>
      </div>

      {/* 2. Monthly Backup Reports & Statistics Panel */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E5E5DF]">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cobalt" />
              <h3 className="text-base font-bold text-carbon">
                Monthly Backup Statistics &amp; Summaries
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              End-of-month aggregated reports evaluating every backup attempt, success percentage, and physical storage rotation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerMonthlyGenerate(false)}
              disabled={isGeneratingMonthly}
              className="inline-flex items-center gap-1.5 rounded-sm border border-cobalt/30 bg-cobalt/10 hover:bg-cobalt/20 px-3 py-1.5 text-xs font-semibold text-cobalt transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingMonthly ? "animate-spin" : ""}`} />
              Generate Current Month Summary
            </button>
          </div>
        </div>

        {/* Month Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Current Month Active Pill */}
          <button
            onClick={() => setSelectedMonthlyReport(null)}
            className={`px-3 py-1.5 rounded-sm text-xs mono font-medium transition-all ${
              selectedMonthlyReport === null
                ? "bg-cobalt text-white shadow-2xs font-bold"
                : "border border-[#E5E5DF] bg-white text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
            }`}
          >
            October 2026 (Live Current)
          </button>

          {/* Stored Reports from Database */}
          {monthlyReports.map((r) => (
            <button
              key={`${r.year}-${r.month}`}
              onClick={() => setSelectedMonthlyReport(r)}
              className={`px-3 py-1.5 rounded-sm text-xs mono font-medium transition-all ${
                selectedMonthlyReport?.id === r.id
                  ? "bg-cobalt text-white shadow-2xs font-bold"
                  : "border border-[#E5E5DF] bg-white text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
              }`}
            >
              {r.month_name} {r.year} ({r.success_percentage}%)
            </button>
          ))}
        </div>

        {/* Monthly Summary Card Presentation */}
        <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
            <div>
              <div className="text-[11px] mono uppercase tracking-wider text-cobalt font-semibold">
                Backup Reports → {activeReport ? `${activeReport.month_name} ${activeReport.year}` : `October 2026`}
              </div>
              <h4 className="text-xl font-bold text-carbon mt-1">
                {activeReport ? `${activeReport.month_name} ${activeReport.year}` : `October 2026`} Backup Report
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-sm text-xs mono font-bold uppercase bg-emerald-50 border border-emerald-200 text-emerald-700">
                Result: {activeReport ? activeReport.report_status : (currentMonthStats.failed === 0 ? "SUCCESS" : "PARTIAL")}
              </span>
            </div>
          </div>

          {/* 4 Primary Highlight Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mono text-center">
            <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
              <div className="text-2xl font-black text-carbon">
                {activeReport ? activeReport.total_backups : currentMonthStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-sans mt-1">
                Scheduled
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
              <div className="text-2xl font-black text-emerald-700">
                {activeReport ? activeReport.successful_backups : currentMonthStats.success}
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-sans mt-1">
                Successful
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
              <div className="text-2xl font-black text-rose-700">
                {activeReport ? activeReport.failed_backups : currentMonthStats.failed}
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-sans mt-1">
                Failed
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
              <div className="text-2xl font-black text-cobalt">
                {activeReport ? `${activeReport.success_percentage}%` : `${currentMonthStats.rate}%`}
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-sans mt-1">
                Success Rate
              </div>
            </div>
          </div>

          {/* Storage & Retention Policy Details */}
          <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 space-y-2 text-xs shadow-2xs">
            <h5 className="font-semibold text-carbon uppercase tracking-wider text-[11px] mono">
              Storage &amp; Retention Statistics
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 mono">
              <div className="p-3 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF]">
                <span className="text-muted-foreground text-[10px] block uppercase font-sans">Backups Created</span>
                <span className="text-carbon font-bold text-sm">
                  {activeReport ? activeReport.total_backup_size_pretty : totalStoredPretty}
                </span>
              </div>
              <div className="p-3 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF]">
                <span className="text-muted-foreground text-[10px] block uppercase font-sans">Automatically Deleted (7-day rotation)</span>
                <span className="text-amber-700 font-bold text-sm">
                  {activeReport ? `${activeReport.deleted_backups_count} Backups` : `${backups.filter(b => b.deleted_at).length} Backups`}
                </span>
              </div>
              <div className="p-3 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF]">
                <span className="text-muted-foreground text-[10px] block uppercase font-sans">Retention Policy</span>
                <span className="text-cobalt font-bold text-sm">
                  7 Days Continuous
                </span>
              </div>
            </div>
          </div>

          {/* Failed Backups Alert Section (If any) */}
          {((activeReport && activeReport.failed_backups > 0) || currentMonthStats.failed > 0) && (
            <div className="rounded-sm border border-rose-200 bg-rose-50 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                Failed Backups
              </div>
              <div className="divide-y divide-rose-200 mono text-[11px]">
                {backups
                  .filter((b) => b.status === "FAILED")
                  .map((b) => (
                    <div key={b.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-rose-800 font-bold">
                        {new Date(b.created_at).toLocaleDateString()} — FAILED
                      </span>
                      <span className="text-muted-foreground font-sans">
                        Reason: {b.error_message || "Database connection timeout"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Report Footer Information */}
          <div className="pt-2 border-t border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground mono gap-2">
            <div>
              Report Generated:{" "}
              <span className="text-carbon font-semibold">
                {activeReport
                  ? new Date(activeReport.report_generated_date).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </span>
            </div>
            <div>
              Data Source: <span className="text-cobalt">public.database_backups</span> (History preserved after storage deletion)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Backup History Table */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#E5E5DF]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-carbon flex items-center gap-2">
                <Layers className="h-4 w-4 text-cobalt" />
                Complete Backup History &amp; Rotation Logs ({backups.length})
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] mono font-bold bg-cobalt/10 text-cobalt border border-cobalt/20">
                <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                MANUAL: {manualBackupsCount}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                AUTOMATIC: {automaticBackupsCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Historical records remain permanently available for auditing and monthly reports even after the physical backup file is pruned from storage.
            </p>
          </div>
        </div>

        {backups.length > 0 ? (
          <div className="rounded-sm border border-[#E5E5DF] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs mono">
                <thead>
                  <tr className="border-b border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground text-[10px] font-sans uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Backup Date &amp; Time</th>
                    <th className="py-3 px-3 font-semibold">Type / Tag</th>
                    <th className="py-3 px-3 font-semibold">Filename</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold text-right">Size</th>
                    <th className="py-3 px-4 font-semibold">Storage &amp; Retention</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF]">
                  {backups.map((b) => {
                    const isPruned = Boolean(b.deleted_at);
                    const isSuccess = b.status === "SUCCESS";
                    const isManual = b.backup_type === "manual" || (b.metadata as any)?.backupTypeTag === "MANUAL";

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-[#FAF9F6]/80 transition-colors"
                      >
                        <td className="py-3 px-4 text-carbon">
                          <div className="font-semibold text-carbon">
                            {new Date(b.created_at).toLocaleDateString()}{" "}
                            <span className="text-muted-foreground text-[11px]">
                              {b.backup_time || new Date(b.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                            {b.id}
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {isManual ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[10px] font-bold mono tracking-wider bg-cobalt/10 text-cobalt border border-cobalt/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                              MANUAL
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[10px] font-bold mono tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              AUTOMATIC
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-carbon font-semibold truncate max-w-[220px]">
                          {b.filename || `database-backup-${b.created_at.slice(0, 10)}.sql`}
                        </td>

                        <td className="py-3 px-3">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mono">
                              <CheckCircle2 className="h-3 w-3" /> SUCCESS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 mono">
                              <AlertCircle className="h-3 w-3" /> FAILED
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right text-carbon font-bold">
                          {b.file_size_pretty}
                        </td>

                        <td className="py-3 px-4 font-sans">
                          {isPruned ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="h-2 w-2 rounded-full bg-neutral-400" />
                              Pruned (7-day rotation)
                            </span>
                          ) : isSuccess ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                              Stored in Supabase (Private)
                            </span>
                          ) : (
                            <span className="text-xs text-rose-700 font-mono truncate max-w-[200px] block" title={b.error_message || "Error"}>
                              Error: {b.error_message || "Execution error"}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Manual Download Button */}
                            <button
                              onClick={() => onDownloadBackup(b.id)}
                              disabled={isPruned || !isSuccess}
                              className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                isPruned || !isSuccess
                                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                  : "border border-cobalt/30 bg-cobalt/10 hover:bg-cobalt text-cobalt hover:text-white shadow-2xs"
                              }`}
                              title={
                                isPruned
                                  ? "Backup file was deleted after 7-day retention period. History record preserved."
                                  : !isSuccess
                                  ? "Backup attempt failed; no archive file generated."
                                  : "Download PostgreSQL SQL Backup Archive"
                              }
                            >
                              <Download className="h-3 w-3" />
                              Download SQL
                            </button>

                            {/* Inspect Details Button */}
                            <button
                              onClick={() => setSelectedBackupForModal(b)}
                              className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] hover:bg-[#FAF9F6] px-2 py-1 text-[11px] text-muted-foreground hover:text-carbon transition-colors"
                              title="Inspect Full History Record"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-[#E5E5DF] bg-[#FAF9F6] p-8 text-center space-y-3">
            <HardDrive className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold text-carbon">
              No Backups Recorded Yet
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Backups run automatically every 24 hours at 02:00 UTC, or you can capture a manual backup snapshot right now.
            </p>
            <button
              onClick={onTakeManualBackup}
              disabled={isCreatingBackup}
              className="inline-flex items-center gap-2 rounded-sm bg-cobalt hover:bg-cobalt/90 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              Take First Manual Backup
            </button>
          </div>
        )}
      </div>

      {/* 4. Confirm 7-Day Cleanup Modal Dialog */}
      {showPruneConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-sm bg-amber-50 border border-amber-200 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-carbon">
                  Execute 7-Day Retention Rotation
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Continuous Rolling Backup Rotation Policy
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-4 space-y-2 text-xs text-muted-foreground leading-relaxed font-sans">
              <p className="font-semibold text-carbon">
                Rotation Policy Guarantees:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                <li>Backups created within the last 7 days are strictly protected and never deleted.</li>
                <li>Backups older than 7 days will be pruned from the private Supabase Storage bucket.</li>
                <li>History records remain permanently saved in the database for monthly audits and reporting.</li>
                <li>A recent backup will NEVER be deleted if any new backup failed.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPruneConfirmDialog(false)}
                className="px-4 py-2 rounded-sm border border-[#E5E5DF] bg-white text-xs font-semibold text-carbon hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPruneConfirmDialog(false);
                  onRunRetentionPrune();
                }}
                className="px-4 py-2 rounded-sm bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white transition-colors mono"
              >
                Confirm &amp; Run Rotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Backup History Details Inspector Modal */}
      {selectedBackupForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-xl w-full max-h-[85vh] rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-xl flex flex-col space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5E5DF]">
              <div>
                <h3 className="text-base font-semibold text-carbon flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-cobalt" />
                  Backup History Record
                </h3>
                <p className="text-xs text-muted-foreground mono mt-0.5">
                  ID: {selectedBackupForModal.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedBackupForModal(null)}
                className="rounded-sm p-1 text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs mono pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Backup Filename</span>
                  <span className="text-carbon font-bold truncate block">
                    {selectedBackupForModal.filename}
                  </span>
                </div>
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Status</span>
                  <span className={`font-bold ${selectedBackupForModal.status === "SUCCESS" ? "text-emerald-700" : "text-rose-700"}`}>
                    {selectedBackupForModal.status}
                  </span>
                </div>
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Execution Mode / Tag</span>
                  <span className="font-bold flex items-center gap-1.5 mt-0.5">
                    {selectedBackupForModal.backup_type === "manual" || (selectedBackupForModal.metadata as any)?.backupTypeTag === "MANUAL" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[10px] mono font-bold bg-cobalt/10 text-cobalt border border-cobalt/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-cobalt" /> MANUAL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[10px] mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> AUTOMATIC
                      </span>
                    )}
                  </span>
                </div>
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Created Timestamp</span>
                  <span className="text-carbon font-bold">
                    {new Date(selectedBackupForModal.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Storage Size</span>
                  <span className="text-carbon font-bold">
                    {selectedBackupForModal.file_size_pretty}
                  </span>
                </div>
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Storage Bucket</span>
                  <span className="text-carbon">
                    {selectedBackupForModal.storage_bucket || "database-backups"} (Private)
                  </span>
                </div>
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Retention State</span>
                  <span className={selectedBackupForModal.deleted_at ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                    {selectedBackupForModal.deleted_at
                      ? `Pruned on ${new Date(selectedBackupForModal.deleted_at).toLocaleDateString()}`
                      : "Currently Active in Storage"}
                  </span>
                </div>
              </div>

              {selectedBackupForModal.error_message && (
                <div className="rounded-sm border border-rose-200 bg-rose-50 p-3 space-y-1">
                  <span className="text-[10px] text-rose-700 uppercase font-semibold block font-sans">
                    Failure Error Detail
                  </span>
                  <p className="text-rose-800 mono text-xs">
                    {selectedBackupForModal.error_message}
                  </p>
                </div>
              )}

              {selectedBackupForModal.tables_included && selectedBackupForModal.tables_included.length > 0 && (
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3 space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block font-sans">
                    Tables Included in SQL Dump
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBackupForModal.tables_included.map((tbl) => (
                      <span
                        key={tbl}
                        className="px-2 py-0.5 rounded-sm bg-white text-carbon text-[10px] border border-[#E5E5DF] mono"
                      >
                        {tbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBackupForModal.metadata && (
                <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block font-sans">
                    Execution Metadata
                  </span>
                  <pre className="text-[11px] text-carbon overflow-x-auto p-2 bg-white border border-[#E5E5DF] rounded-sm mono">
                    {JSON.stringify(selectedBackupForModal.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between">
              {selectedBackupForModal.status === "SUCCESS" && !selectedBackupForModal.deleted_at ? (
                <button
                  onClick={() => {
                    onDownloadBackup(selectedBackupForModal.id);
                    setSelectedBackupForModal(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt hover:bg-cobalt/90 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download SQL File
                </button>
              ) : (
                <span className="text-xs text-muted-foreground font-sans">
                  {selectedBackupForModal.deleted_at
                    ? "Physical file pruned after 7-day rotation period"
                    : "No file generated for failed backup"}
                </span>
              )}
              <button
                onClick={() => setSelectedBackupForModal(null)}
                className="px-4 py-2 rounded-sm bg-[#121316] text-xs font-semibold text-white hover:bg-black transition-colors"
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
