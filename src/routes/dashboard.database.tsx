import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Database,
  Layers,
  Users,
  Activity,
  RefreshCw,
  Shield,
  ShieldAlert,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Archive,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getDatabaseOverview,
  getTableRecords,
  getAdminUsers,
  createAdminUser,
  changeUserPassword,
  changeUserRole,
  toggleUserStatus,
  deleteUserAccount,
  getAuditLogs,
  createManualBackup,
  runRetentionPrune,
  getDatabaseBackupsList,
  getBackupDownloadData,
  getMonthlyReportsList,
  generateMonthlyReportFn,
  type DatabaseOverviewData,
  type TableQueryResponse,
  type AdminUserRecord,
  type AuditLogRecord,
  type DatabaseBackupRecord,
  type MonthlyBackupReportRecord,
} from "@/lib/database-admin.functions";

import { DatabaseOverview } from "@/components/dashboard/database/DatabaseOverview";
import { DatabaseTableViewer } from "@/components/dashboard/database/DatabaseTableViewer";
import { UserManagement } from "@/components/dashboard/database/UserManagement";
import { ActivityLog } from "@/components/dashboard/database/ActivityLog";
import { DatabaseBackups } from "@/components/dashboard/database/DatabaseBackups";

export const Route = createFileRoute("/dashboard/database")({
  head: () => ({
    meta: [
      { title: "Database Administration — PP · OPS Monitoring" },
      { name: "description", content: "Database administration console, table inspection, automated 7-day retention, backups and user management." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DatabaseAdminPage,
});

type AdminTab = "overview" | "tables" | "users" | "backups" | "activity";

function DatabaseAdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Overview state
  const [overview, setOverview] = useState<DatabaseOverviewData | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Tables state
  const [activeTableName, setActiveTableName] = useState<string>("website_health_checks");
  const [tableData, setTableData] = useState<TableQueryResponse | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(25);
  const [tableSearch, setTableSearch] = useState("");
  const [tableSortBy, setTableSortBy] = useState<string | undefined>(undefined);
  const [tableSortOrder, setTableSortOrder] = useState<"asc" | "desc">("desc");

  // Users state
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [serviceRoleConfigured, setServiceRoleConfigured] = useState(true);

  // Activity state
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [auditTotalCount, setAuditTotalCount] = useState(0);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(25);
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  // Backups & Retention state
  const [backups, setBackups] = useState<DatabaseBackupRecord[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyBackupReportRecord[]>([]);
  const [isBackupsLoading, setIsBackupsLoading] = useState(false);
  const [isMonthlyReportsLoading, setIsMonthlyReportsLoading] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isPruning, setIsPruning] = useState(false);

  // Server functions
  const fetchOverview = useServerFn(getDatabaseOverview);
  const fetchTableRecords = useServerFn(getTableRecords);
  const fetchUsers = useServerFn(getAdminUsers);
  const runCreateUser = useServerFn(createAdminUser);
  const runChangePassword = useServerFn(changeUserPassword);
  const runChangeRole = useServerFn(changeUserRole);
  const runToggleStatus = useServerFn(toggleUserStatus);
  const runDeleteUser = useServerFn(deleteUserAccount);
  const fetchAudit = useServerFn(getAuditLogs);
  const fetchBackupsList = useServerFn(getDatabaseBackupsList);
  const runCreateManualBackup = useServerFn(createManualBackup);
  const runRetentionPruneFn = useServerFn(runRetentionPrune);
  const fetchBackupDownload = useServerFn(getBackupDownloadData);
  const fetchMonthlyReportsList = useServerFn(getMonthlyReportsList);
  const runGenerateMonthlyReport = useServerFn(generateMonthlyReportFn);

  // Verify caller's role on mount
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

        // Query user_roles for current user
        const { data: roleRow, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (isMounted) {
          // If roleRow exists and is admin, user is admin
          // Also if user_roles has 0 admins, bootstrap admin applies
          if (roleRow?.role === "admin") {
            setIsAdmin(true);
          } else {
            // Check if any admin exists in the system
            const { count } = await supabase
              .from("user_roles")
              .select("id", { count: "exact", head: true })
              .eq("role", "admin");

            // If 0 admins exist, the first authenticated user is granted bootstrap admin
            setIsAdmin(count === 0 || count === null);
          }
          setAuthChecking(false);
        }
      } catch (err) {
        console.error("Auth role check error:", err);
        if (isMounted) {
          setIsAdmin(true); // Let server function enforce strictly
          setAuthChecking(false);
        }
      }
    }

    checkRole();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch overview data
  const loadOverview = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsOverviewLoading(true);
        const res = await fetchOverview();
        setOverview(res);
        setServiceRoleConfigured(res.serviceRoleConfigured);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Failed to load overview:", err);
        if (!silent) {
          toast.error("Could not load database overview: " + (err as Error).message);
        }
      } finally {
        if (!silent) setIsOverviewLoading(false);
      }
    },
    [fetchOverview],
  );

  // Fetch table data
  const loadTableData = useCallback(async () => {
    try {
      setIsTableLoading(true);
      setTableError(null);
      const res = await fetchTableRecords({
        data: {
          tableName: activeTableName,
          page: tablePage,
          pageSize: tablePageSize,
          search: tableSearch,
          sortBy: tableSortBy,
          sortOrder: tableSortOrder,
        },
      });
      setTableData(res);
    } catch (err) {
      console.error("Failed to load table records:", err);
      setTableError((err as Error).message);
    } finally {
      setIsTableLoading(false);
    }
  }, [
    fetchTableRecords,
    activeTableName,
    tablePage,
    tablePageSize,
    tableSearch,
    tableSortBy,
    tableSortOrder,
  ]);

  // Fetch users list
  const loadUsers = useCallback(async () => {
    try {
      setIsUsersLoading(true);
      const res = await fetchUsers();
      setUsers(res.users);
      setServiceRoleConfigured(res.serviceRoleConfigured);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users: " + (err as Error).message);
    } finally {
      setIsUsersLoading(false);
    }
  }, [fetchUsers]);

  // Fetch activity log
  const loadAuditLogs = useCallback(async () => {
    try {
      setIsActivityLoading(true);
      const res = await fetchAudit({
        data: {
          page: auditPage,
          pageSize: auditPageSize,
          actionFilter: auditActionFilter,
          search: auditSearch,
        },
      });
      setAuditLogs(res.logs);
      setAuditTotalCount(res.totalCount);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsActivityLoading(false);
    }
  }, [fetchAudit, auditPage, auditPageSize, auditActionFilter, auditSearch]);

  // Fetch backups list
  const loadBackups = useCallback(async () => {
    try {
      setIsBackupsLoading(true);
      const res = await fetchBackupsList();
      setBackups(res);
    } catch (err) {
      console.error("Failed to load backups:", err);
      toast.error("Failed to load backups: " + (err as Error).message);
    } finally {
      setIsBackupsLoading(false);
    }
  }, [fetchBackupsList]);

  // Fetch monthly reports list
  const loadMonthlyReports = useCallback(async () => {
    try {
      setIsMonthlyReportsLoading(true);
      const res = await fetchMonthlyReportsList();
      setMonthlyReports(res);
    } catch (err) {
      console.warn("Failed to load monthly reports:", err);
    } finally {
      setIsMonthlyReportsLoading(false);
    }
  }, [fetchMonthlyReportsList]);

  // Initial load and tab switching
  useEffect(() => {
    if (isAdmin) {
      loadOverview();
    }
  }, [isAdmin, loadOverview]);

  useEffect(() => {
    if (isAdmin && activeTab === "tables") {
      loadTableData();
    }
  }, [isAdmin, activeTab, loadTableData]);

  useEffect(() => {
    if (isAdmin && activeTab === "users") {
      loadUsers();
    }
  }, [isAdmin, activeTab, loadUsers]);

  useEffect(() => {
    if (isAdmin && activeTab === "backups") {
      loadBackups();
      loadMonthlyReports();
    }
  }, [isAdmin, activeTab, loadBackups, loadMonthlyReports]);

  useEffect(() => {
    if (isAdmin && activeTab === "activity") {
      loadAuditLogs();
    }
  }, [isAdmin, activeTab, loadAuditLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      loadOverview(true);
      if (activeTab === "tables") loadTableData();
      if (activeTab === "users") loadUsers();
      if (activeTab === "backups") {
        loadBackups();
        loadMonthlyReports();
      }
      if (activeTab === "activity") loadAuditLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin, activeTab, loadOverview, loadTableData, loadUsers, loadBackups, loadMonthlyReports, loadAuditLogs]);

  // Manual Refresh Handler
  function handleManualRefresh() {
    loadOverview();
    if (activeTab === "tables") loadTableData();
    if (activeTab === "users") loadUsers();
    if (activeTab === "backups") loadBackups();
    if (activeTab === "activity") loadAuditLogs();
    toast.success("Database telemetry refreshed.");
  }

  // User Actions
  async function handleCreateUser(data: {
    email: string;
    password: string;
    role: "admin" | "user";
  }) {
    const res = await runCreateUser({ data });
    toast.success(`User ${res.user.email} created successfully.`);
    loadUsers();
    loadOverview(true);
  }

  async function handleChangePassword(targetUserId: string, newPassword: string) {
    await runChangePassword({ data: { targetUserId, newPassword } });
    toast.success("User password has been updated securely.");
    loadAuditLogs();
  }

  async function handleChangeRole(targetUserId: string, newRole: "admin" | "user") {
    await runChangeRole({ data: { targetUserId, newRole } });
    toast.success(`Role updated to ${newRole.toUpperCase()}.`);
    loadUsers();
    loadOverview(true);
  }

  async function handleToggleStatus(targetUserId: string, disable: boolean) {
    const res = await runToggleStatus({ data: { targetUserId, disable } });
    toast.success(
      disable ? "User account has been disabled." : "User account has been restored to active.",
    );
    loadUsers();
    loadOverview(true);
  }

  async function handleDeleteUser(targetUserId: string) {
    await runDeleteUser({ data: { targetUserId } });
    toast.success("User account was permanently deleted.");
    loadUsers();
    loadOverview(true);
  }

  // Backup & Retention Handlers
  async function handleTakeManualBackup() {
    try {
      setIsCreatingBackup(true);
      toast.info("Generating PostgreSQL database dump & uploading to storage vault…");
      const res = await runCreateManualBackup();

      if (res.status === "SUCCESS") {
        // If server did not send via SMTP, trigger client-side operational notification via Web3Forms
        if (!res.emailSent) {
          const web3Key =
            (import.meta.env["VITE_WEB3FORMS_ACCESS_KEY"] as string | undefined)?.trim() ||
            "752a0c12-46b4-4eec-8ad7-e82e229e3e43";

          if (web3Key) {
            try {
              const params = new URLSearchParams();
              params.append("access_key", web3Key);
              params.append("from_name", "PP·OPS Database Engine [MANUAL]");
              params.append(
                "subject",
                res.emailDetails?.subject ||
                  `[PP·OPS Database] Manual Database Backup Completed [MANUAL] — ${res.backupDate}`,
              );
              params.append("name", "Manual Database Backup Alert");
              params.append("email", res.emailRecipient || "admin@piyushprasad.in");
              params.append(
                "message",
                res.emailDetails?.messageText ||
                  [
                    "============================================================",
                    "PP·OPS MANUAL DATABASE BACKUP NOTIFICATION",
                    "============================================================",
                    "Operational Status: COMPLETED SUCCESSFULLY",
                    "Execution Mode:     MANUAL SNAPSHOT",
                    `Backup ID:          ${res.backupId}`,
                    `Date & Time:        ${res.backupDate} ${res.backupTime}`,
                    `Archive Filename:   ${res.filename}`,
                    `Archive Size:       ${res.fileSizePretty}`,
                    `Total Records:      ${res.totalRecordsBackedUp} records`,
                    "Storage:            Server Vault & Supabase",
                    "Retention:          7-Day Continuous Rotation",
                    `Recipient:          ${res.emailRecipient}`,
                    "============================================================",
                  ].join("\n"),
              );

              fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: params,
              })
                .then(async (r) => {
                  const d = await r.json().catch(() => ({}));
                  if (d?.success) {
                    toast.success(`Operational email delivered to ${res.emailRecipient}!`);
                  }
                })
                .catch((e) => console.warn("Client email trigger warning:", e));
            } catch (wErr) {
              console.warn("Client notification dispatch warning:", wErr);
            }
          }
        }

        toast.success(
          `Manual backup "${res.filename}" captured successfully (${res.fileSizePretty})! Operational email triggered to ${res.emailRecipient}.`,
          { duration: 6000 },
        );
      } else {
        toast.error(`Backup failed: ${res.errorMessage || "Unknown error"}`);
      }

      loadBackups();
      loadOverview(true);
      loadMonthlyReports();
    } catch (err) {
      console.error("Manual backup error:", err);
      toast.error("Failed to create manual backup: " + (err as Error).message);
    } finally {
      setIsCreatingBackup(false);
    }
  }

  async function handleRunRetentionPrune() {
    try {
      setIsPruning(true);
      toast.info("Evaluating 7-day rolling retention rotation…");
      const res = await runRetentionPruneFn();

      if (res.totalRecordsPruned === 0) {
        toast.info("All stored backups are within the 7-day retention window.");
      } else {
        toast.success(
          `Pruned ${res.totalRecordsPruned} physical backup file(s) older than 7 days. History records updated.`,
        );
      }

      loadBackups();
      loadOverview(true);
      loadMonthlyReports();
    } catch (err) {
      console.error("Retention prune error:", err);
      toast.error("Failed to run 7-day retention cleanup: " + (err as Error).message);
    } finally {
      setIsPruning(false);
    }
  }

  async function handleDownloadBackup(backupId: string) {
    try {
      toast.info("Retrieving secure backup download…");
      const res = await fetchBackupDownload({ data: { backupId } });
      const downloadPayload = res as {
        signedUrl?: string;
        sqlContent?: string;
        filename?: string;
        backupData?: unknown;
      };

      if (downloadPayload.signedUrl) {
        window.open(downloadPayload.signedUrl, "_blank");
        toast.success("Download started via secure signed URL!");
        return;
      }

      if (downloadPayload.sqlContent) {
        const blob = new Blob([downloadPayload.sqlContent], { type: "application/sql" });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = url;
        downloadAnchor.download = downloadPayload.filename || `database-backup-${backupId.slice(0, 8)}.sql`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast.success("PostgreSQL SQL backup downloaded successfully!");
        return;
      }

      if (downloadPayload.backupData) {
        const jsonStr = JSON.stringify(downloadPayload.backupData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = url;
        downloadAnchor.download = downloadPayload.filename || `database-backup-${backupId.slice(0, 8)}.json`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast.success("Backup downloaded successfully!");
        return;
      }

      throw new Error("No download payload received from storage.");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download backup: " + (err as Error).message);
    }
  }

  async function handleGenerateMonthlyReport(year: number, month: number, sendEmail: boolean) {
    try {
      toast.info(`Generating backup summary report for ${month}/${year}…`);
      const report = await runGenerateMonthlyReport({ data: { year, month, sendEmail } });
      toast.success(
        `Generated monthly summary: ${report.monthName} ${report.year} (${report.successPercentage}% success)!`,
      );
      loadMonthlyReports();
      return report;
    } catch (err) {
      console.error("Monthly report error:", err);
      toast.error("Failed to generate monthly report: " + (err as Error).message);
      return null;
    }
  }

  // Switch to specific table in Tables tab
  function handleSelectTableFromOverview(tableName: string) {
    setActiveTableName(tableName);
    setTablePage(1);
    setActiveTab("tables");
  }

  // Checking Auth state
  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground mono text-xs gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cobalt" />
        <span>Verifying administrator permissions…</span>
      </div>
    );
  }

  // Access Denied Wall
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center text-carbon">
        <div className="max-w-md w-full rounded-sm border border-[#E5E5DF] bg-white p-8 shadow-md">
          <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-sm bg-rose-50 border border-rose-200 text-rose-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-carbon">Administrator Role Required</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            The Database Administration Console is restricted to authenticated accounts with the verified{" "}
            <code className="mono text-cobalt bg-cobalt/10 px-1 py-0.5 rounded-sm">admin</code> role.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#121316] border border-[#121316] py-2.5 text-xs font-semibold text-white hover:bg-black transition-colors"
            >
              Return to Monitoring Overview
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E5E5DF] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-cobalt/10 border border-cobalt/20 text-cobalt">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-carbon">
                Database Administration
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor application data, users and database activity.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Status & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs mono text-carbon flex items-center gap-2 shadow-2xs">
            <span
              className={`h-2 w-2 rounded-full ${
                overview?.status === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <span>
              {overview?.status === "connected" ? "PostgreSQL Connected" : "Connecting…"}
            </span>
          </div>

          {/* Database Storage Badge */}
          {overview?.storageUsedPretty && (
            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs mono text-carbon flex items-center gap-2 shadow-2xs">
              <HardDrive className="h-3.5 w-3.5 text-cobalt" />
              <span>
                Storage: <strong className="text-carbon font-bold">{overview.storageUsedPretty}</strong>
                <span className="text-muted-foreground ml-1">/ {overview.storageQuotaPretty}</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm mono ${
                  overview.storageStatus === "critical"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : overview.storageStatus === "warning"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-cobalt/10 text-cobalt border border-cobalt/20"
                }`}
              >
                {overview.storagePercent}%
              </span>
            </div>
          )}

          {lastUpdated && (
            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs mono text-muted-foreground flex items-center gap-1.5 shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          )}

          {/* Header Action: Take Manual Backup */}
          <button
            onClick={() => handleTakeManualBackup()}
            disabled={isCreatingBackup || isPruning}
            className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cobalt/90 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
            title="Create manual backup snapshot of database tables"
          >
            {isCreatingBackup ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Take Manual Backup</span>
          </button>

          <Link
            to="/dashboard/manual-backups"
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-semibold text-carbon hover:bg-[#FAF9F6] transition-colors shadow-2xs cursor-pointer"
          >
            <HardDrive className="h-3.5 w-3.5 text-cobalt" />
            <span>Manual Backups Page</span>
          </Link>

          <button
            onClick={handleManualRefresh}
            disabled={isOverviewLoading || isTableLoading}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isOverviewLoading || isTableLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DF] overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-sm transition-all border-b-2 font-semibold ${
            activeTab === "overview"
              ? "border-cobalt text-cobalt bg-cobalt/5"
              : "border-transparent text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
          }`}
        >
          <Database className="h-4 w-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("tables")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-sm transition-all border-b-2 font-semibold ${
            activeTab === "tables"
              ? "border-cobalt text-cobalt bg-cobalt/5"
              : "border-transparent text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
          }`}
        >
          <Layers className="h-4 w-4" />
          Tables
          {overview?.totalTables ? (
            <span className="ml-1 px-1.5 py-0.5 rounded-sm text-[10px] bg-[#FAF9F6] border border-[#E5E5DF] text-carbon mono">
              {overview.totalTables}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-sm transition-all border-b-2 font-semibold ${
            activeTab === "users"
              ? "border-cobalt text-cobalt bg-cobalt/5"
              : "border-transparent text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
          }`}
        >
          <Users className="h-4 w-4" />
          Users
          {overview?.totalUsers ? (
            <span className="ml-1 px-1.5 py-0.5 rounded-sm text-[10px] bg-[#FAF9F6] border border-[#E5E5DF] text-carbon mono">
              {overview.totalUsers}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("backups")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-sm transition-all border-b-2 font-semibold ${
            activeTab === "backups"
              ? "border-cobalt text-cobalt bg-cobalt/5"
              : "border-transparent text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
          }`}
        >
          <Archive className="h-4 w-4" />
          Backups &amp; Retention
          {backups?.length ? (
            <span className="ml-1 px-1.5 py-0.5 rounded-sm text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 mono font-bold">
              {backups.length}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-sm transition-all border-b-2 font-semibold ${
            activeTab === "activity"
              ? "border-cobalt text-cobalt bg-cobalt/5"
              : "border-transparent text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6]"
          }`}
        >
          <Activity className="h-4 w-4" />
          Activity
          {overview?.recentActivityCount ? (
            <span className="ml-1 px-1.5 py-0.5 rounded-sm text-[10px] bg-[#FAF9F6] border border-[#E5E5DF] text-carbon mono">
              {overview.recentActivityCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "overview" && (
          isOverviewLoading && !overview ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground mono text-xs gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-cobalt" />
              <span>Querying database engine & telemetry…</span>
            </div>
          ) : overview ? (
            <DatabaseOverview
              overview={overview}
              onSelectTable={handleSelectTableFromOverview}
              onGoToUsers={() => setActiveTab("users")}
              onGoToActivity={() => setActiveTab("activity")}
              onGoToBackups={() => setActiveTab("backups")}
              onTakeManualBackup={() => handleTakeManualBackup()}
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Could not retrieve database overview telemetry.
            </div>
          )
        )}

        {activeTab === "tables" && (
          <DatabaseTableViewer
            tableStats={overview?.tableStats ?? []}
            activeTableName={activeTableName}
            onSelectTable={(name) => {
              setActiveTableName(name);
              setTablePage(1);
            }}
            tableData={tableData}
            isLoading={isTableLoading}
            error={tableError}
            page={tablePage}
            pageSize={tablePageSize}
            search={tableSearch}
            sortBy={tableSortBy}
            sortOrder={tableSortOrder}
            onPageChange={setTablePage}
            onPageSizeChange={(newSize) => {
              setTablePageSize(newSize);
              setTablePage(1);
            }}
            onSearchChange={setTableSearch}
            onSortChange={(col) => {
              if (tableSortBy === col) {
                setTableSortOrder(tableSortOrder === "asc" ? "desc" : "asc");
              } else {
                setTableSortBy(col);
                setTableSortOrder("desc");
              }
            }}
            onRefresh={loadTableData}
          />
        )}

        {activeTab === "users" && (
          <UserManagement
            users={users}
            isLoading={isUsersLoading}
            serviceRoleConfigured={serviceRoleConfigured}
            onRefresh={loadUsers}
            onCreateUser={handleCreateUser}
            onChangePassword={handleChangePassword}
            onChangeRole={handleChangeRole}
            onToggleStatus={handleToggleStatus}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === "backups" && (
          <DatabaseBackups
            backups={backups}
            monthlyReports={monthlyReports}
            isLoading={isBackupsLoading}
            isCreatingBackup={isCreatingBackup}
            isPruning={isPruning}
            isMonthlyReportsLoading={isMonthlyReportsLoading}
            onRefresh={() => {
              loadBackups();
              loadMonthlyReports();
            }}
            onTakeManualBackup={handleTakeManualBackup}
            onRunRetentionPrune={handleRunRetentionPrune}
            onDownloadBackup={handleDownloadBackup}
            onGenerateMonthlyReport={handleGenerateMonthlyReport}
          />
        )}

        {activeTab === "activity" && (
          <ActivityLog
            logs={auditLogs}
            totalCount={auditTotalCount}
            isLoading={isActivityLoading}
            page={auditPage}
            pageSize={auditPageSize}
            actionFilter={auditActionFilter}
            search={auditSearch}
            onPageChange={setAuditPage}
            onActionFilterChange={(act) => {
              setAuditActionFilter(act);
              setAuditPage(1);
            }}
            onSearchChange={(q) => {
              setAuditSearch(q);
              setAuditPage(1);
            }}
            onRefresh={loadAuditLogs}
          />
        )}
      </div>
    </div>
  );
}
