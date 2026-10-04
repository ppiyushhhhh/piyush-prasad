import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
  type DatabaseOverviewData,
  type TableQueryResponse,
  type AdminUserRecord,
  type AuditLogRecord,
} from "@/lib/database-admin.functions";

import { DatabaseOverview } from "@/components/dashboard/database/DatabaseOverview";
import { DatabaseTableViewer } from "@/components/dashboard/database/DatabaseTableViewer";
import { UserManagement } from "@/components/dashboard/database/UserManagement";
import { ActivityLog } from "@/components/dashboard/database/ActivityLog";

export const Route = createFileRoute("/dashboard/database")({
  head: () => ({
    meta: [
      { title: "Database Administration — PP · OPS Monitoring" },
      { name: "description", content: "Database administration console, table inspection, and user management." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DatabaseAdminPage,
});

type AdminTab = "overview" | "tables" | "users" | "activity";

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
      if (activeTab === "activity") loadAuditLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin, activeTab, loadOverview, loadTableData, loadUsers, loadAuditLogs]);

  // Manual Refresh Handler
  function handleManualRefresh() {
    loadOverview();
    if (activeTab === "tables") loadTableData();
    if (activeTab === "users") loadUsers();
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

  // Switch to specific table in Tables tab
  function handleSelectTableFromOverview(tableName: string) {
    setActiveTableName(tableName);
    setTablePage(1);
    setActiveTab("tables");
  }

  // Checking Auth state
  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 font-mono text-xs gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <span>Verifying administrator permissions…</span>
      </div>
    );
  }

  // Access Denied Wall
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center text-slate-100">
        <div className="max-w-md w-full rounded-xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur shadow-2xl">
          <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Administrator Role Required</h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            The Database Administration Console is restricted to authenticated accounts with the verified{" "}
            <code className="font-mono text-cyan-400">admin</code> role.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-700 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 shadow-sm shadow-cyan-950/40">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                Database Administration
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor application data, users and database activity.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Status & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                overview?.status === "connected"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span>
              {overview?.status === "connected" ? "PostgreSQL Connected" : "Connecting…"}
            </span>
          </div>

          {/* Database Storage Badge */}
          {overview?.storageUsedPretty && (
            <div className="rounded-md border border-cyan-800/80 bg-slate-900/80 px-3 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                Storage: <strong className="text-cyan-300">{overview.storageUsedPretty}</strong>
                <span className="text-slate-500 ml-1">/ {overview.storageQuotaPretty}</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  overview.storageStatus === "critical"
                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                    : overview.storageStatus === "warning"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                }`}
              >
                {overview.storagePercent}%
              </span>
            </div>
          )}

          {lastUpdated && (
            <div className="rounded-md border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isOverviewLoading || isTableLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors shadow-sm"
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
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md transition-all border-b-2 font-semibold ${
            activeTab === "overview"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Database className="h-4 w-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("tables")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md transition-all border-b-2 font-semibold ${
            activeTab === "tables"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Layers className="h-4 w-4" />
          Tables
          {overview?.totalTables ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {overview.totalTables}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md transition-all border-b-2 font-semibold ${
            activeTab === "users"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Users className="h-4 w-4" />
          Users
          {overview?.totalUsers ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {overview.totalUsers}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md transition-all border-b-2 font-semibold ${
            activeTab === "activity"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Activity className="h-4 w-4" />
          Activity
          {overview?.recentActivityCount ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {overview.recentActivityCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "overview" && (
          isOverviewLoading && !overview ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono text-xs gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <span>Querying database engine & telemetry…</span>
            </div>
          ) : overview ? (
            <DatabaseOverview
              overview={overview}
              onSelectTable={handleSelectTableFromOverview}
              onGoToUsers={() => setActiveTab("users")}
              onGoToActivity={() => setActiveTab("activity")}
            />
          ) : (
            <div className="p-8 text-center text-slate-400">
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
