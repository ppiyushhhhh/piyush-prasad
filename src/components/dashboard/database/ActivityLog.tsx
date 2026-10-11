import { useState } from "react";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileJson,
  UserPlus,
  KeyRound,
  Shield,
  Ban,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import type { AuditLogRecord } from "@/lib/database-admin.functions";
import { RecordDetailsDialog } from "./RecordDetailsDialog";

interface ActivityLogProps {
  logs: AuditLogRecord[];
  totalCount: number;
  isLoading: boolean;
  page: number;
  pageSize: number;
  actionFilter: string;
  search: string;
  onPageChange: (newPage: number) => void;
  onActionFilterChange: (action: string) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
}

export function ActivityLog({
  logs,
  totalCount,
  isLoading,
  page,
  pageSize,
  actionFilter,
  search,
  onPageChange,
  onActionFilterChange,
  onSearchChange,
  onRefresh,
}: ActivityLogProps) {
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLogRecord | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function getActionBadge(action: string) {
    if (action.includes("created")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[11px] font-sans font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
          <UserPlus className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("password")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[11px] font-sans font-semibold bg-amber-50 border border-amber-200 text-amber-800">
          <KeyRound className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("role")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[11px] font-sans font-semibold bg-purple-50 border border-purple-200 text-purple-800">
          <Shield className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("disabled") || action.includes("deleted")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[11px] font-sans font-semibold bg-rose-50 border border-rose-200 text-rose-800">
          <Ban className="h-3 w-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[11px] font-sans font-medium bg-[#FAF9F6] border border-[#E5E5DF] text-carbon">
        <Activity className="h-3 w-3 text-cobalt" />
        {action}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-carbon flex items-center gap-2">
            <Activity className="h-4 w-4 text-cobalt" />
            Database & Administrative Audit Trail
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable audit logging tracking user modifications, authentication lifecycle, and administrative events.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-mono font-medium text-carbon hover:bg-[#FAF9F6] transition-colors disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-cobalt" : ""}`} />
          Refresh Activity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search audit trail by action, admin email, or target…"
            className="w-full rounded-sm border border-[#E5E5DF] bg-white pl-9 pr-3.5 py-1.5 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none font-mono shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => onActionFilterChange(e.target.value)}
            className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs text-carbon focus:border-cobalt focus:outline-none font-mono shadow-2xs"
          >
            <option value="">All Actions</option>
            <option value="user_created">User Created</option>
            <option value="user_password_changed">Password Changed</option>
            <option value="user_role_changed">Role Changed</option>
            <option value="user_disabled">User Disabled</option>
            <option value="user_enabled">User Enabled</option>
            <option value="user_deleted">User Deleted</option>
            <option value="bootstrap_admin_claimed">Bootstrap Admin</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5DF] bg-[#FAF9F6] text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono font-semibold">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Target Identity / Table</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DF] font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-sans">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-cobalt mb-2" />
                    Loading audit trail…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-sans">
                    <div className="text-sm font-semibold text-carbon">No activity logged yet</div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Administrative mutations such as creating users, changing passwords, or adjusting roles will automatically appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-sans font-medium text-carbon">
                          {log.admin_email ?? "System / Service"}
                        </div>
                        {log.admin_user_id && (
                          <div className="text-[10px] text-muted-foreground truncate max-w-[130px]" title={log.admin_user_id}>
                            {log.admin_user_id.slice(0, 14)}…
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.target_user_id ? (
                          <div>
                            <span className="font-sans text-[11px] text-muted-foreground">User ID: </span>
                            <span className="text-carbon font-semibold">{log.target_user_id.slice(0, 14)}…</span>
                          </div>
                        ) : log.target_table ? (
                          <div>
                            <span className="font-sans text-[11px] text-muted-foreground">Table: </span>
                            <span className="text-cobalt font-semibold">{log.target_table}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-[11px] text-muted-foreground font-sans">
                        {log.details ? (
                          <span>{JSON.stringify(log.details)}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogForDetails(log)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-[#FAF9F6] text-muted-foreground hover:text-cobalt transition-colors font-sans text-[11px]"
                          title="Inspect audit event"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-[#E5E5DF] px-4 py-3 bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="font-mono text-[11px]">
            Page <span className="text-carbon font-semibold">{page}</span> of{" "}
            <span className="text-carbon font-semibold">{totalPages}</span> ({totalCount} logged events)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1 text-xs text-carbon hover:bg-[#FAF9F6] disabled:opacity-40 transition-colors shadow-2xs font-mono"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1 text-xs text-carbon hover:bg-[#FAF9F6] disabled:opacity-40 transition-colors shadow-2xs font-mono"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <RecordDetailsDialog
        isOpen={Boolean(selectedLogForDetails)}
        onClose={() => setSelectedLogForDetails(null)}
        title={`Audit Event: ${selectedLogForDetails?.action ?? "Log Details"}`}
        data={selectedLogForDetails as any}
      />
    </div>
  );
}
