import { useState } from "react";
import {
  ShieldCheck,
  HardDrive,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Calendar,
  Layers,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  X,
  FileText,
} from "lucide-react";
import type { DatabaseBackupRecord } from "@/lib/database-admin.functions";

interface DatabaseBackupsProps {
  backups: DatabaseBackupRecord[];
  isLoading: boolean;
  isCreatingBackup: boolean;
  isPruning: boolean;
  onTakeManualBackup: () => void;
  onRunRetentionPrune: () => void;
  onDownloadBackup: (backupId: string) => void;
  onRefresh: () => void;
}

export function DatabaseBackups({
  backups,
  isLoading,
  isCreatingBackup,
  isPruning,
  onTakeManualBackup,
  onRunRetentionPrune,
  onDownloadBackup,
  onRefresh,
}: DatabaseBackupsProps) {
  const [selectedBackupForModal, setSelectedBackupForModal] =
    useState<DatabaseBackupRecord | null>(null);
  const [showPruneConfirmDialog, setShowPruneConfirmDialog] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Retention & Backup Policy Hero Panel */}
      <div className="rounded-lg border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-cyan-950/70 border-cyan-800/80 text-cyan-400">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  Automated 7-Day Retention &amp; Backup Policy
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Application telemetry older than 7 days is automatically backed up then pruned to keep database storage optimal. User accounts and RBAC roles are permanently preserved.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
              Refresh
            </button>

            {/* Manual Backup Button */}
            <button
              onClick={onTakeManualBackup}
              disabled={isCreatingBackup || isPruning}
              className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download className={`h-3.5 w-3.5 ${isCreatingBackup ? "animate-bounce" : ""}`} />
              {isCreatingBackup ? "Creating Backup…" : "Take Manual Backup"}
            </button>

            {/* Run Retention Prune Now */}
            <button
              onClick={() => setShowPruneConfirmDialog(true)}
              disabled={isCreatingBackup || isPruning}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-800/80 bg-amber-950/40 hover:bg-amber-950/80 px-3.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5 text-amber-400" />
              {isPruning ? "Pruning & Backing up…" : "Run 7-Day Cleanup Now"}
            </button>
          </div>
        </div>

        {/* 4 Pillars of Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1: Retention Window */}
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-4 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center justify-between">
              <span>Retention Window</span>
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="font-mono text-xl font-bold text-slate-100">
              7 Days
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Records older than 168 hours are marked for pre-backup and cleanup.
            </p>
          </div>

          {/* Card 2: Pre-Deletion Backup */}
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-4 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center justify-between">
              <span>Pre-Deletion Backup</span>
              <Download className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              Guaranteed
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Expired records are serialized into JSON archive before deletion.
            </p>
          </div>

          {/* Card 3: Protected Tables */}
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-4 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center justify-between">
              <span>Protected Entities</span>
              <Lock className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <div className="font-mono text-xl font-bold text-purple-400">
              Users &amp; Roles
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <code className="text-purple-300 font-mono text-[10px]">auth.users</code> &amp; <code className="text-purple-300 font-mono text-[10px]">user_roles</code> are strictly never pruned.
            </p>
          </div>

          {/* Card 4: Email Notifications */}
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-4 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center justify-between">
              <span>Email Alerts</span>
              <Mail className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="font-mono text-xl font-bold text-amber-400">
              Instant Dispatch
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Detailed audit summary email sent when backup &amp; prune completes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Backups Archive History Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Database Backups &amp; Prune Archives ({backups.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              History of manual snapshots and automated 7-day pre-deletion backup archives.
            </p>
          </div>
        </div>

        {backups.length > 0 ? (
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono text-[11px]">
                    <th className="py-2.5 px-4 font-semibold">Backup Date &amp; Time</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Records Backed Up</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Records Pruned</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Archive Size</th>
                    <th className="py-2.5 px-4 font-semibold">Safety Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                  {backups.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-850 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-slate-200">
                        <div className="font-semibold text-slate-200">
                          {new Date(b.created_at).toLocaleDateString()}{" "}
                          <span className="text-slate-400 text-[11px]">
                            {new Date(b.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                          {b.id}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {b.backup_type === "manual" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Manual Snapshot
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Auto 7-Day Prune
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-200 font-bold">
                        {b.total_records.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {b.pruned_records_count > 0 ? (
                          <span className="text-amber-400 font-semibold">
                            -{b.pruned_records_count.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                        {b.file_size_pretty}
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                          <CheckCircle2 className="h-3 w-3" /> Users Preserved
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onDownloadBackup(b.id)}
                            className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition-colors"
                            title="Download JSON Backup Archive"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>

                          <button
                            onClick={() => setSelectedBackupForModal(b)}
                            className="inline-flex items-center gap-1 rounded border border-slate-800 hover:bg-slate-800 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                            title="Inspect Backup Details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center space-y-3">
            <HardDrive className="h-8 w-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">
              No Backups Recorded Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Backups are created automatically every 24 hours during 7-day retention cleanup, or you can create one right now using the button below.
            </p>
            <button
              onClick={onTakeManualBackup}
              disabled={isCreatingBackup}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Take First Manual Backup
            </button>
          </div>
        )}
      </div>

      {/* 3. Confirm 7-Day Cleanup Modal Dialog */}
      {showPruneConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-xl border border-amber-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Run 7-Day Retention Cleanup
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm automated pre-backup &amp; data pruning
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>What will happen:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>A complete pre-backup JSON archive of expired records will be captured and saved.</li>
                <li>Records older than 7 days will be deleted from health checks, performance, deployments, and logs.</li>
                <li><strong className="text-emerald-400">User accounts and user roles will NEVER be deleted.</strong></li>
                <li>An executive summary notification email will be dispatched to your email address.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPruneConfirmDialog(false)}
                className="px-3.5 py-1.5 rounded-md border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPruneConfirmDialog(false);
                  onRunRetentionPrune();
                }}
                className="px-3.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-slate-950 transition-colors font-mono"
              >
                Confirm &amp; Run Cleanup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Backup Details Inspector Modal Dialog */}
      {selectedBackupForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-xl w-full max-h-[85vh] rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-cyan-400" />
                  Backup Archive Details
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedBackupForModal.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedBackupForModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-mono pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] text-slate-500 uppercase block">Created At</span>
                  <span className="text-slate-200 font-bold">
                    {new Date(selectedBackupForModal.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] text-slate-500 uppercase block">Archive Size</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedBackupForModal.file_size_pretty}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Records</span>
                  <span className="text-slate-200 font-bold">
                    {selectedBackupForModal.total_records.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] text-slate-500 uppercase block">Pruned Records</span>
                  <span className="text-amber-400 font-bold">
                    {selectedBackupForModal.pruned_records_count.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedBackupForModal.tables_included && (
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Tables Included in Archive
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBackupForModal.tables_included.map((tbl) => (
                      <span
                        key={tbl}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                      >
                        {tbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBackupForModal.metadata && (
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Execution Metadata
                  </span>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded">
                    {JSON.stringify(selectedBackupForModal.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onDownloadBackup(selectedBackupForModal.id);
                  setSelectedBackupForModal(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download JSON File
              </button>
              <button
                onClick={() => setSelectedBackupForModal(null)}
                className="px-3.5 py-1.5 rounded-md bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
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
