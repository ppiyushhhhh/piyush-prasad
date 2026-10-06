import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-side functions for Database Administration Console.
 *
 * SECURITY GUARANTEES:
 * 1. Executes strictly on the server; the service-role key never leaks to client bundles.
 * 2. Authenticates the caller using their Supabase JWT bearer token via getRequest().
 * 3. Enforces that the caller has the 'admin' role in public.user_roles.
 * 4. Passwords are never retrieved, stored in plaintext, or included in logs/audit trails.
 * 5. Privileged administrative mutations (user creation, password update, role change, deletion)
 *    are recorded in public.admin_audit_log.
 */

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "kB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const num = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${num} ${sizes[i]}`;
}

export interface DbTableStat {
  name: string;
  displayName: string;
  description: string;
  rowCount: number;
  lastUpdated: string | null;
  totalBytes?: number;
  totalPretty?: string;
  tablePretty?: string;
  indexPretty?: string;
}

export interface TableStorageDetail {
  tableName: string;
  displayName: string;
  rowCount: number;
  totalBytes: number;
  totalPretty: string;
  tablePretty: string;
  indexPretty: string;
  percentOfDb: number;
}

export interface DatabaseOverviewData {
  status: "connected" | "degraded" | "error";
  statusMessage: string;
  latencyMs: number;
  provider: string;
  totalUsers: number;
  activeUsers: number;
  totalTables: number;
  totalRecords: number;
  tableStats: DbTableStat[];
  recentActivityCount: number;
  lastUpdated: string;
  serviceRoleConfigured: boolean;
  // Storage Metrics
  storageUsedBytes: number;
  storageUsedPretty: string;
  storageQuotaBytes: number;
  storageQuotaPretty: string;
  storagePercent: number;
  storageStatus: "optimal" | "warning" | "critical";
  tableStorageBreakdown: TableStorageDetail[];
  storageTelemetrySource: "postgresql_disk" | "estimated";
  // Retention & Backups Telemetry
  retentionDays: number;
  lastBackupAt: string | null;
  lastBackupType: string | null;
  totalBackupsCount: number;
}

export interface DatabaseBackupRecord {
  id: string;
  created_at: string;
  backup_date: string;
  backup_time: string;
  filename: string;
  file_size_bytes: number;
  file_size_pretty: string;
  status: "SUCCESS" | "FAILED";
  backup_type: string;
  tables_included: string[];
  total_records: number;
  pruned_records_count: number;
  deleted_at: string | null;
  error_message?: string | null;
  storage_bucket?: string;
  storage_path?: string | null;
  metadata?: Record<string, any> | null;
}

export interface MonthlyBackupReportRecord {
  id: string;
  month: number;
  month_name: string;
  year: number;
  total_backups: number;
  successful_backups: number;
  failed_backups: number;
  success_percentage: number;
  total_backup_size_bytes: number;
  total_backup_size_pretty: string;
  deleted_backups_count: number;
  report_generated_date: string;
  report_status: "SUCCESS" | "PARTIAL" | "FAILED";
  report_file_url?: string | null;
  summary_data: {
    dailyBackups?: Array<{
      date: string;
      formattedDate: string;
      status: "SUCCESS" | "FAILED";
      filename: string;
      sizePretty: string;
      deleted: boolean;
      error?: string | null;
    }>;
    failedBackupsList?: Array<{
      date: string;
      formattedDate: string;
      filename: string;
      reason: string;
    }>;
    deletedBackupSizeBytes?: number;
    deletedBackupSizePretty?: string;
    textReport?: string;
  };
  created_at: string;
}

export interface BackupResultResponse {
  backupId: string;
  backupDate: string;
  backupTime: string;
  filename: string;
  backupType: string;
  createdAt: string;
  tablesIncluded: string[];
  totalRecordsBackedUp: number;
  totalRecordsPruned: number;
  fileSizePretty: string;
  status: "SUCCESS" | "FAILED";
  backupTag?: "MANUAL" | "AUTOMATIC";
  errorMessage?: string | null;
  emailSent: boolean;
  emailRecipient: string;
  emailDetails?: {
    subject: string;
    headline: string;
    messageText: string;
    htmlContent?: string;
  };
  userAccountsPreserved: boolean;
  downloadPayload?: {
    backupId: string;
    generatedAt: string;
    backupType: string;
    tables?: Record<string, any[]>;
    sqlContent?: string;
    signedUrl?: string;
    filename?: string;
  };
}

export interface AdminUserRecord {
  id: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  lastSignInAt: string | null;
  status: "active" | "disabled" | "unconfirmed";
  bannedUntil?: string | null;
  metadata?: Record<string, any>;
}

export interface TableQueryResponse {
  tableName: string;
  rows: Record<string, any>[];
  totalCount: number;
  columns: string[];
  page: number;
  pageSize: number;
  tableSizePretty?: string;
  indexSizePretty?: string;
}

export interface AuditLogRecord {
  id: string;
  admin_user_id: string | null;
  admin_email: string | null;
  action: string;
  target_user_id: string | null;
  target_table: string | null;
  target_record_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

// Whitelisted application tables to prevent arbitrary table querying
export const SUPPORTED_TABLES = [
  {
    name: "website_health_checks",
    displayName: "Website Health Checks",
    description: "Automated HTTP, SSL, DNS, and availability monitoring logs.",
  },
  {
    name: "performance_history",
    displayName: "Performance History",
    description: "Core Web Vitals, Lighthouse metrics, and performance scores.",
  },
  {
    name: "deployment_history",
    displayName: "Deployment History",
    description: "CI/CD execution records, commit SHAs, and workflow statuses.",
  },
  {
    name: "chat_activity",
    displayName: "AI Chat Activity",
    description: "AI bot interaction latency, message counts, and telemetry (no raw chat content).",
  },
  {
    name: "health_reports",
    displayName: "Health Reports",
    description: "Periodic executive summary audits, scores, and status ratings.",
  },
  {
    name: "user_roles",
    displayName: "User Roles & Permissions",
    description: "Application RBAC mapping linking authenticated user IDs to roles.",
  },
  {
    name: "admin_audit_log",
    displayName: "Admin Audit Log",
    description: "Trace log of administrative security events and database operations.",
  },
] as const;

export type SupportedTableName = (typeof SUPPORTED_TABLES)[number]["name"];

/**
 * Returns a Supabase service-role admin client if configured, or null.
 */
function getAdminClient() {
  const url = process.env["SUPABASE_URL"];
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !serviceKey) return null;

  return createClient<Database>(url, serviceKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Extracts and verifies the calling user from the Bearer token in request headers.
 */
async function authenticateCaller() {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Bearer token is required.");
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new Error("Unauthorized: Bearer token is empty.");
  }

  const url = process.env["SUPABASE_URL"];
  const pubKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !pubKey) {
    throw new Error("Missing Supabase configuration in server environment.");
  }

  // Create client with caller's token to verify identity
  const userClient = createClient<Database>(url, pubKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Unauthorized: Invalid or expired session. Please sign in again.");
  }

  return { user, userClient, token };
}

/**
 * Enforces admin authorization.
 * Checks whether user has 'admin' in user_roles.
 * If zero admins exist in user_roles (initial bootstrap), automatically claims first user as admin.
 */
async function verifyAdminCaller() {
  const { user, userClient, token } = await authenticateCaller();
  const adminClient = getAdminClient();
  const db: any = adminClient ?? userClient;

  // Check user role
  const { data: roleRow, error: roleError } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError && roleError.code !== "PGRST116") {
    console.error("[DatabaseAdmin] Role verification query failed:", roleError.message);
  }

  const isAdmin = roleRow?.role === "admin";

  if (!isAdmin) {
    // Check if ANY admin exists in user_roles
    let count: number | null = null;
    let countError: any = null;
    try {
      const res = await db
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      count = res.count;
      countError = res.error;
    } catch (e) {
      countError = e;
    }

    if (!countError && (count === 0 || count === null)) {
      // Bootstrap: First authenticated user claims admin role
      console.log(`[DatabaseAdmin] Bootstrap: Claiming admin role for first user ${user.email} (${user.id})`);
      try {
        await db.from("user_roles").insert({
          user_id: user.id,
          role: "admin",
        });
      } catch (insertError: any) {
        console.warn("[DatabaseAdmin] Bootstrap role insert warning:", insertError?.message);
      }

      await logAuditEntry({
        adminUserId: user.id,
        adminEmail: user.email ?? "admin",
        action: "bootstrap_admin_claimed",
        details: { note: "First authenticated user automatically claimed initial admin role." },
        db,
      });
      return { user, adminClient, userClient, db, token };
    }

    throw new Error("Forbidden: Administrator privileges required to access Database Administration.");
  }

  return { user, adminClient, userClient, db, token };
}

/**
 * Records an entry into admin_audit_log if the table exists.
 */
async function logAuditEntry({
  adminUserId,
  adminEmail,
  action,
  targetUserId,
  targetTable,
  targetRecordId,
  details,
  db,
}: {
  adminUserId?: string | null;
  adminEmail?: string | null;
  action: string;
  targetUserId?: string | null;
  targetTable?: string | null;
  targetRecordId?: string | null;
  details?: Record<string, any> | null;
  db: any;
}) {
  try {
    await db.from("admin_audit_log").insert({
      admin_user_id: adminUserId ?? null,
      admin_email: adminEmail ?? null,
      action,
      target_user_id: targetUserId ?? null,
      target_table: targetTable ?? null,
      target_record_id: targetRecordId ?? null,
      details: details ?? {},
    });
  } catch (err) {
    console.warn("[DatabaseAdmin] Failed to write to admin_audit_log (table may need migration):", err);
  }
}

// ---------------------------------------------------------------------------
// 1. DATABASE OVERVIEW SERVER FUNCTION
// ---------------------------------------------------------------------------

export const getDatabaseOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<DatabaseOverviewData> => {
    const { user, adminClient, db } = await verifyAdminCaller();
    const serviceRoleConfigured = Boolean(adminClient);

    const startPing = Date.now();
    let status: DatabaseOverviewData["status"] = "connected";
    let statusMessage = "Supabase PostgreSQL operational";
    let latencyMs = 0;

    try {
      const { error: pingError } = await db.from("user_roles").select("id").limit(1);
      latencyMs = Date.now() - startPing;
      if (pingError) {
        status = "degraded";
        statusMessage = `Database query warning: ${pingError.message}`;
      }
    } catch (err) {
      latencyMs = Date.now() - startPing;
      status = "error";
      statusMessage = (err as Error).message ?? "Connection timeout";
    }

    // Collect counts for each application table in parallel
    const tableStatPromises = SUPPORTED_TABLES.map(async (table): Promise<DbTableStat> => {
      try {
        const { count, error } = await db
          .from(table.name as any)
          .select("id", { count: "exact", head: true });

        // Query the most recent record timestamp if possible
        let lastUpdated: string | null = null;
        try {
          const sortCol =
            table.name === "website_health_checks"
              ? "checked_at"
              : table.name === "performance_history"
                ? "measured_at"
                : table.name === "deployment_history" || table.name === "chat_activity"
                  ? "occurred_at"
                  : table.name === "health_reports"
                    ? "report_date"
                    : "created_at";

          const { data: latest } = await db
            .from(table.name as any)
            .select(sortCol)
            .order(sortCol, { ascending: false })
            .limit(1);

          if (latest && latest[0] && (latest[0] as any)[sortCol]) {
            lastUpdated = String((latest[0] as any)[sortCol]);
          }
        } catch {
          // ignore timestamp query failures
        }

        return {
          name: table.name,
          displayName: table.displayName,
          description: table.description,
          rowCount: error ? 0 : (count ?? 0),
          lastUpdated,
        };
      } catch {
        return {
          name: table.name,
          displayName: table.displayName,
          description: table.description,
          rowCount: 0,
          lastUpdated: null,
        };
      }
    });

    const tableStats: DbTableStat[] = await Promise.all(tableStatPromises);
    const totalRecords = tableStats.reduce((acc, curr) => acc + curr.rowCount, 0);

    // Get user counts
    let totalUsers = 0;
    let activeUsers = 0;

    if (adminClient) {
      try {
        const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (!usersError && usersData?.users) {
          totalUsers = usersData.users.length;
          activeUsers = usersData.users.filter((u) => !u.banned_until).length;
        }
      } catch (err) {
        console.warn("[DatabaseAdmin] Failed to list users with adminClient:", err);
      }
    } else {
      // Fallback: estimate from user_roles
      const rolesStat = tableStats.find((t) => t.name === "user_roles");
      totalUsers = rolesStat?.rowCount ?? 1;
      activeUsers = totalUsers;
    }

    // Get recent activity count in last 24h
    let recentActivityCount = 0;
    try {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await db
        .from("admin_audit_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since24h);
      recentActivityCount = count ?? 0;
    } catch {
      recentActivityCount = 0;
    }

    // Query actual PostgreSQL database storage via RPC
    const FREE_TIER_QUOTA_BYTES = 500 * 1024 * 1024; // 500 MB Supabase Free Tier quota
    let storageUsedBytes = 0;
    let storageUsedPretty = "0 B";
    let storageTelemetrySource: "postgresql_disk" | "estimated" = "estimated";
    const tableSizeMap = new Map<
      string,
      { totalBytes: number; totalPretty: string; tablePretty: string; indexPretty: string }
    >();

    try {
      const { data: rpcData, error: rpcError } = await db.rpc("get_db_storage_usage");
      if (!rpcError && rpcData && typeof rpcData === "object") {
        const payload = rpcData as {
          database_size_bytes?: number;
          database_size_pretty?: string;
          table_sizes?: Array<{
            table_name: string;
            total_bytes: number;
            total_pretty: string;
            table_bytes: number;
            table_pretty: string;
            index_bytes: number;
            index_pretty: string;
          }>;
        };

        if (payload.database_size_bytes) {
          storageUsedBytes = Number(payload.database_size_bytes);
          storageUsedPretty = String(payload.database_size_pretty || formatBytes(storageUsedBytes));
          storageTelemetrySource = "postgresql_disk";

          if (Array.isArray(payload.table_sizes)) {
            payload.table_sizes.forEach((t) => {
              tableSizeMap.set(t.table_name, {
                totalBytes: Number(t.total_bytes || 0),
                totalPretty: String(t.total_pretty || formatBytes(Number(t.total_bytes || 0))),
                tablePretty: String(t.table_pretty || "—"),
                indexPretty: String(t.index_pretty || "—"),
              });
            });
          }
        }
      }
    } catch (err) {
      console.warn("[DatabaseAdmin] get_db_storage_usage RPC call warning:", err);
    }

    // If RPC was not available, estimate based on row counts & base system catalog overhead
    if (storageUsedBytes === 0) {
      // Base system catalogs, schemas, auth overhead is ~8 MB in a standard Supabase database
      let estimatedAppBytes = 8 * 1024 * 1024;

      tableStats.forEach((t) => {
        const rowMultiplier =
          t.name === "website_health_checks"
            ? 520
            : t.name === "performance_history"
              ? 480
              : t.name === "deployment_history"
                ? 380
                : t.name === "chat_activity"
                  ? 220
                  : t.name === "health_reports"
                    ? 300
                    : 200;

        const tableBytes = Math.max(16384, t.rowCount * rowMultiplier);
        const indexBytes = Math.max(16384, Math.round(t.rowCount * 80));
        const total = tableBytes + indexBytes;

        estimatedAppBytes += total;
        tableSizeMap.set(t.name, {
          totalBytes: total,
          totalPretty: formatBytes(total),
          tablePretty: formatBytes(tableBytes),
          indexPretty: formatBytes(indexBytes),
        });
      });

      storageUsedBytes = estimatedAppBytes;
      storageUsedPretty = formatBytes(storageUsedBytes);
      storageTelemetrySource = "estimated";
    }

    // Attach sizes to table stats
    tableStats.forEach((t) => {
      const sizeInfo = tableSizeMap.get(t.name);
      if (sizeInfo) {
        t.totalBytes = sizeInfo.totalBytes;
        t.totalPretty = sizeInfo.totalPretty;
        t.tablePretty = sizeInfo.tablePretty;
        t.indexPretty = sizeInfo.indexPretty;
      } else {
        t.totalBytes = 16384;
        t.totalPretty = "16 kB";
        t.tablePretty = "8 kB";
        t.indexPretty = "8 kB";
      }
    });

    const storagePercent = Math.min(
      100,
      Math.round((storageUsedBytes / FREE_TIER_QUOTA_BYTES) * 10000) / 100,
    );

    const storageStatus: DatabaseOverviewData["storageStatus"] =
      storagePercent >= 90 ? "critical" : storagePercent >= 75 ? "warning" : "optimal";

    const tableStorageBreakdown: TableStorageDetail[] = tableStats.map((t) => ({
      tableName: t.name,
      displayName: t.displayName,
      rowCount: t.rowCount,
      totalBytes: t.totalBytes ?? 0,
      totalPretty: t.totalPretty ?? "0 B",
      tablePretty: t.tablePretty ?? "0 B",
      indexPretty: t.indexPretty ?? "0 B",
      percentOfDb:
        storageUsedBytes > 0
          ? Math.round(((t.totalBytes ?? 0) / storageUsedBytes) * 1000) / 10
          : 0,
    }));

    // Query last backup record & total backups
    let lastBackupAt: string | null = null;
    let lastBackupType: string | null = null;
    let totalBackupsCount = 0;
    try {
      const { data: bData, count: bCount } = await db
        .from("database_backups")
        .select("created_at, backup_type", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(1);

      totalBackupsCount = bCount ?? 0;
      if (bData && bData[0]) {
        lastBackupAt = bData[0].created_at;
        lastBackupType = bData[0].backup_type;
      }
    } catch {
      // ignore
    }

    // Auto-scheduled 7-day retention: if last prune was > 24 hours ago, trigger in background
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const shouldRunAutoPrune = !lastBackupAt || new Date(lastBackupAt).getTime() < oneDayAgo;

    if (shouldRunAutoPrune) {
      import("./database-backup.service")
        .then(({ executeDatabaseBackupWorkflow }) =>
          executeDatabaseBackupWorkflow({
            supabase: db,
            backupType: "daily",
            triggererEmail: "system-retention@piyushprasad.in",
          }),
        )
        .catch((e: any) =>
          console.warn("[DatabaseAdmin] Scheduled daily backup background warning:", e?.message),
        );
    }

    return {
      status,
      statusMessage,
      latencyMs,
      provider: "Supabase Hosted Postgres (AWS / Cloud)",
      totalUsers,
      activeUsers,
      totalTables: SUPPORTED_TABLES.length,
      totalRecords,
      tableStats,
      recentActivityCount,
      lastUpdated: new Date().toISOString(),
      serviceRoleConfigured,
      storageUsedBytes,
      storageUsedPretty,
      storageQuotaBytes: FREE_TIER_QUOTA_BYTES,
      storageQuotaPretty: "500 MB",
      storagePercent,
      storageStatus,
      tableStorageBreakdown,
      storageTelemetrySource,
      retentionDays: 7,
      lastBackupAt,
      lastBackupType,
      totalBackupsCount,
    };
  },
);

// ---------------------------------------------------------------------------
// 2. APPLICATION DATABASE TABLES SERVER FUNCTION
// ---------------------------------------------------------------------------

export const getTableRecords = createServerFn({ method: "POST" })
  .validator(
    (data: {
      tableName: string;
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => data,
  )
  .handler(async ({ data }): Promise<TableQueryResponse> => {
    const { tableName, page = 1, pageSize = 25, search = "", sortBy, sortOrder = "desc" } = data;
    const { db } = await verifyAdminCaller();

    const isWhitelisted = SUPPORTED_TABLES.some((t) => t.name === tableName);
    if (!isWhitelisted) {
      throw new Error(`Unauthorized table request: '${tableName}' is not an application table.`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = db.from(tableName).select("*", { count: "exact" });

    // Determine default sort column if not explicitly given
    const effectiveSortBy =
      sortBy ||
      (tableName === "website_health_checks"
        ? "checked_at"
        : tableName === "performance_history"
          ? "measured_at"
          : tableName === "deployment_history" || tableName === "chat_activity"
            ? "occurred_at"
            : tableName === "health_reports"
              ? "report_date"
              : "created_at");

    if (effectiveSortBy) {
      query = query.order(effectiveSortBy, { ascending: sortOrder === "asc" });
    }

    // Apply pagination range
    query = query.range(from, to);

    const { data: resultData, count, error } = await query;

    if (error) {
      throw new Error(`Failed to query table '${tableName}': ${error.message}`);
    }

    const rows = (resultData ?? []) as unknown as Record<string, any>[];

    // Detect columns dynamically from rows or standard schema
    const columnSet = new Set<string>();
    rows.forEach((row) => {
      Object.keys(row).forEach((col) => columnSet.add(col));
    });

    // Provide default fallback columns if table is currently empty
    if (columnSet.size === 0) {
      if (tableName === "website_health_checks") {
        ["id", "checked_at", "url", "http_status", "response_time_ms", "health_score"].forEach((c) =>
          columnSet.add(c),
        );
      } else if (tableName === "performance_history") {
        ["id", "measured_at", "url", "performance", "accessibility", "best_practices", "seo"].forEach((c) =>
          columnSet.add(c),
        );
      } else if (tableName === "deployment_history") {
        ["id", "occurred_at", "workflow_name", "status", "conclusion", "commit_sha", "duration_seconds"].forEach((c) =>
          columnSet.add(c),
        );
      } else if (tableName === "chat_activity") {
        ["id", "occurred_at", "event_type", "message_count", "latency_ms", "error_code"].forEach((c) =>
          columnSet.add(c),
        );
      } else if (tableName === "health_reports") {
        ["id", "report_date", "health_score", "lighthouse_score", "status", "created_at"].forEach((c) =>
          columnSet.add(c),
        );
      } else if (tableName === "user_roles") {
        ["id", "user_id", "role", "created_at"].forEach((c) => columnSet.add(c));
      } else if (tableName === "admin_audit_log") {
        ["id", "created_at", "action", "admin_email", "target_user_id", "target_table", "details"].forEach((c) =>
          columnSet.add(c),
        );
      }
    }

    // Filter rows by search term if search query is provided
    let filteredRows = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filteredRows = rows.filter((row) => {
        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "object") {
            return JSON.stringify(val).toLowerCase().includes(q);
          }
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Determine table storage size
    let tableSizePretty: string | undefined;
    let indexSizePretty: string | undefined;
    try {
      const { data: rpcData } = await db.rpc("get_db_storage_usage");
      if (rpcData && typeof rpcData === "object" && Array.isArray((rpcData as any).table_sizes)) {
        const found = ((rpcData as any).table_sizes as any[]).find(
          (t) => t.table_name === tableName,
        );
        if (found) {
          tableSizePretty = found.total_pretty;
          indexSizePretty = found.index_pretty;
        }
      }
    } catch {
      // non-fatal
    }

    if (!tableSizePretty) {
      const rowMultiplier =
        tableName === "website_health_checks"
          ? 520
          : tableName === "performance_history"
            ? 480
            : tableName === "deployment_history"
              ? 380
              : tableName === "chat_activity"
                ? 220
                : tableName === "health_reports"
                  ? 300
                  : 200;
      const countVal = count ?? filteredRows.length;
      const total = Math.max(16384, countVal * rowMultiplier);
      const idxBytes = Math.max(16384, Math.round(countVal * 80));
      tableSizePretty = formatBytes(total + idxBytes);
      indexSizePretty = formatBytes(idxBytes);
    }

    return {
      tableName,
      rows: filteredRows,
      totalCount: count ?? filteredRows.length,
      columns: Array.from(columnSet),
      page,
      pageSize,
      tableSizePretty,
      indexSizePretty,
    };
  });

// ---------------------------------------------------------------------------
// 3. USER MANAGEMENT SERVER FUNCTIONS
// ---------------------------------------------------------------------------

export const getAdminUsers = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ users: AdminUserRecord[]; serviceRoleConfigured: boolean }> => {
    const { adminClient, db } = await verifyAdminCaller();

    // Query roles mapping
    const { data: rolesData, error: rolesError } = await db.from("user_roles").select("*");
    if (rolesError) {
      console.warn("[DatabaseAdmin] Could not read user_roles:", rolesError.message);
    }
    const rolesMap = new Map<string, "admin" | "user">();
    (rolesData ?? []).forEach((r: any) => {
      rolesMap.set(r.user_id, r.role);
    });

    if (!adminClient) {
      // If service role is not yet configured, return users inferred from user_roles
      const fallbackUsers: AdminUserRecord[] = (rolesData ?? []).map((r: any) => ({
        id: r.user_id,
        email: `user-${r.user_id.slice(0, 8)}@system`,
        role: r.role,
        createdAt: r.created_at,
        lastSignInAt: null,
        status: "active",
      }));

      return { users: fallbackUsers, serviceRoleConfigured: false };
    }

    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authError) {
      throw new Error(`Failed to retrieve Supabase Auth users: ${authError.message}`);
    }

    const now = new Date();
    const users: AdminUserRecord[] = (authData.users ?? []).map((u) => {
      let status: AdminUserRecord["status"] = "active";
      if (u.banned_until && new Date(u.banned_until) > now) {
        status = "disabled";
      } else if (!u.email_confirmed_at) {
        status = "unconfirmed";
      }

      return {
        id: u.id,
        email: u.email ?? "no-email@registered",
        role: rolesMap.get(u.id) ?? "user",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        status,
        bannedUntil: u.banned_until,
        metadata: u.user_metadata,
      };
    });

    return { users, serviceRoleConfigured: true };
  },
);

export const createAdminUser = createServerFn({ method: "POST" })
  .validator(
    (data: {
      email: string;
      password: string;
      role: "admin" | "user";
    }) => data,
  )
  .handler(async ({ data }): Promise<{ success: boolean; user: AdminUserRecord }> => {
    const { email, password, role } = data;
    const { user: currentAdmin, adminClient, db } = await verifyAdminCaller();

    if (!adminClient) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required in server .env to create users.");
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      throw new Error("Please provide a valid email address.");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // Call Supabase Admin Auth API to create user
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
    });

    if (createError || !created?.user) {
      throw new Error(`Failed to create user: ${createError?.message ?? "Unknown error"}`);
    }

    const newUserId = created.user.id;

    // Assign role in public.user_roles
    const { error: roleError } = await db.from("user_roles").upsert({
      user_id: newUserId,
      role: role === "admin" ? "admin" : "user",
    });

    if (roleError) {
      console.error("[DatabaseAdmin] Failed to assign role in user_roles:", roleError.message);
    }

    // Audit log
    await logAuditEntry({
      adminUserId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: "user_created",
      targetUserId: newUserId,
      details: { email: trimmedEmail, role },
      db,
    });

    return {
      success: true,
      user: {
        id: newUserId,
        email: trimmedEmail,
        role: role === "admin" ? "admin" : "user",
        createdAt: created.user.created_at,
        lastSignInAt: null,
        status: "active",
      },
    };
  });

export const changeUserPassword = createServerFn({ method: "POST" })
  .validator(
    (data: {
      targetUserId: string;
      newPassword: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    const { targetUserId, newPassword } = data;
    const { user: currentAdmin, adminClient, db } = await verifyAdminCaller();

    if (!adminClient) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required in server .env to change user passwords.");
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    // Update password via Supabase Auth Admin API (never logged or saved in plaintext)
    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }

    // Audit log (password is strictly omitted)
    await logAuditEntry({
      adminUserId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: "user_password_changed",
      targetUserId,
      details: { note: "Password updated by administrator via Admin API" },
      db,
    });

    return {
      success: true,
      message: "Password updated successfully.",
    };
  });

export const changeUserRole = createServerFn({ method: "POST" })
  .validator(
    (data: {
      targetUserId: string;
      newRole: "admin" | "user";
    }) => data,
  )
  .handler(async ({ data }): Promise<{ success: boolean; newRole: "admin" | "user" }> => {
    const { targetUserId, newRole } = data;
    const { user: currentAdmin, db } = await verifyAdminCaller();

    // Prevent demoting self if caller is the only admin
    if (targetUserId === currentAdmin.id && newRole !== "admin") {
      const { count } = await db
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");

      if (count !== null && count <= 1) {
        throw new Error("Cannot demote your own account: you are the sole administrator.");
      }
    }

    const { error } = await db.from("user_roles").upsert({
      user_id: targetUserId,
      role: newRole,
    });

    if (error) {
      throw new Error(`Failed to change role: ${error.message}`);
    }

    await logAuditEntry({
      adminUserId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: "user_role_changed",
      targetUserId,
      details: { newRole },
      db,
    });

    return { success: true, newRole };
  });

export const toggleUserStatus = createServerFn({ method: "POST" })
  .validator(
    (data: {
      targetUserId: string;
      disable: boolean;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ success: boolean; status: "disabled" | "active" }> => {
    const { targetUserId, disable } = data;
    const { user: currentAdmin, adminClient, db } = await verifyAdminCaller();

    if (!adminClient) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required in server .env to disable/enable users.");
    }

    if (targetUserId === currentAdmin.id && disable) {
      throw new Error("Cannot disable your own active administrator account.");
    }

    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: disable ? "876000h" : "none", // 100 years or unban
    });

    if (error) {
      throw new Error(`Failed to update account status: ${error.message}`);
    }

    await logAuditEntry({
      adminUserId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: disable ? "user_disabled" : "user_enabled",
      targetUserId,
      details: { disabled: disable },
      db,
    });

    return {
      success: true,
      status: disable ? "disabled" : "active",
    };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .validator(
    (data: {
      targetUserId: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    const { targetUserId } = data;
    const { user: currentAdmin, adminClient, db } = await verifyAdminCaller();

    if (!adminClient) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required in server .env to delete users.");
    }

    if (targetUserId === currentAdmin.id) {
      throw new Error("Cannot delete your own active administrator account.");
    }

    // Delete user in Supabase Auth
    const { error } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    // Clean up role
    await db.from("user_roles").delete().eq("user_id", targetUserId);

    await logAuditEntry({
      adminUserId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: "user_deleted",
      targetUserId,
      details: { note: "User permanently deleted by administrator" },
      db,
    });

    return {
      success: true,
      message: "User deleted successfully.",
    };
  });

// ---------------------------------------------------------------------------
// 4. DATABASE ACTIVITY / AUDIT LOG SERVER FUNCTION
// ---------------------------------------------------------------------------

export const getAuditLogs = createServerFn({ method: "POST" })
  .validator(
    (data: {
      page?: number;
      pageSize?: number;
      actionFilter?: string;
      search?: string;
    }) => data,
  )
  .handler(
    async ({
      data,
    }): Promise<{ logs: AuditLogRecord[]; totalCount: number; page: number; pageSize: number }> => {
      const { page = 1, pageSize = 25, actionFilter = "", search = "" } = data;
      const { db } = await verifyAdminCaller();

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      try {
        let query = db
          .from("admin_audit_log")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (actionFilter) {
          query = query.eq("action", actionFilter);
        }

        if (search.trim()) {
          const q = search.trim();
          query = query.or(`action.ilike.%${q}%,admin_email.ilike.%${q}%,target_table.ilike.%${q}%`);
        }

        query = query.range(from, to);

        const { data: resultData, count, error } = await query;

        if (error) {
          console.warn("[DatabaseAdmin] Query admin_audit_log failed:", error.message);
          return { logs: [], totalCount: 0, page, pageSize };
        }

        return {
          logs: (resultData ?? []) as unknown as AuditLogRecord[],
          totalCount: count ?? 0,
          page,
          pageSize,
        };
      } catch {
        return { logs: [], totalCount: 0, page, pageSize };
      }
    },
  );

// ---------------------------------------------------------------------------
// 5. DATABASE BACKUP, 7-DAY RETENTION & MONTHLY REPORTING SERVER FUNCTIONS
// ---------------------------------------------------------------------------

export const PRUNABLE_RETENTION_TABLES = [
  { name: "website_health_checks", timeCol: "checked_at", displayName: "Website Health Checks" },
  { name: "performance_history", timeCol: "measured_at", displayName: "Performance History" },
  { name: "deployment_history", timeCol: "occurred_at", displayName: "Deployment History" },
  { name: "chat_activity", timeCol: "occurred_at", displayName: "AI Chat Activity" },
  { name: "health_reports", timeCol: "created_at", displayName: "Health Reports" },
  { name: "admin_audit_log", timeCol: "created_at", displayName: "Admin Audit Log" },
];

// Manual Database Backup Server Function
export const createManualBackup = createServerFn({ method: "POST" }).handler(
  async (): Promise<BackupResultResponse> => {
    const { user, db } = await verifyAdminCaller();
    const { executeDatabaseBackupWorkflow } = await import("./database-backup.service");

    const result = await executeDatabaseBackupWorkflow({
      supabase: db,
      backupType: "manual",
      triggererEmail: user.email || "admin@piyushprasad.in",
    });

    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email || "admin",
      action: "database.backup.created",
      targetTable: "database_backups",
      details: {
        backupId: result.backupId,
        filename: result.filename,
        fileSizePretty: result.fileSizePretty,
        status: result.status,
        totalRecords: result.totalRecords,
        tablesIncluded: result.tablesIncluded,
        notificationSent: result.notificationSent,
      },
      db,
    });

    return {
      backupId: result.backupId,
      backupDate: result.backupDate,
      backupTime: result.backupTime,
      filename: result.filename,
      backupType: "manual",
      createdAt: new Date().toISOString(),
      tablesIncluded: result.tablesIncluded,
      totalRecordsBackedUp: result.totalRecords,
      totalRecordsPruned: result.prunedCount,
      fileSizePretty: result.fileSizePretty,
      status: result.status,
      backupTag: "MANUAL",
      errorMessage: result.errorMessage,
      emailSent: result.notificationSent,
      emailRecipient: result.notificationRecipient,
      emailDetails: result.emailDetails,
      userAccountsPreserved: true,
      downloadPayload: {
        backupId: result.backupId,
        generatedAt: new Date().toISOString(),
        backupType: "manual",
        filename: result.filename,
        sqlContent: result.sqlContent,
      },
    };
  },
);

// 7-Day Retention Cleanup & Rotation Server Function
export const runRetentionPrune = createServerFn({ method: "POST" }).handler(
  async (): Promise<BackupResultResponse> => {
    const { user, db } = await verifyAdminCaller();
    const { executeSevenDayRetentionRotation } = await import("./database-backup.service");

    const rotationResult = await executeSevenDayRetentionRotation(db);

    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email || "admin",
      action: "database.retention.pruned",
      targetTable: "database_backups",
      details: {
        deletedCount: rotationResult.deletedCount,
        deletedFilenames: rotationResult.deletedFilenames,
      },
      db,
    });

    const now = new Date();
    const yearStr = now.getFullYear().toString();
    const monthStr = String(now.getMonth() + 1).padStart(2, "0");
    const dayStr = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
    const timeStr = now.toTimeString().split(" ")[0];

    return {
      backupId: `prune-${Date.now()}`,
      backupDate: dateStr,
      backupTime: timeStr,
      filename: `rotation-${dateStr}.log`,
      backupType: "auto_prune_7d",
      createdAt: now.toISOString(),
      tablesIncluded: PRUNABLE_RETENTION_TABLES.map((t) => t.name),
      totalRecordsBackedUp: 0,
      totalRecordsPruned: rotationResult.deletedCount,
      fileSizePretty: "0 B",
      status: "SUCCESS",
      errorMessage: null,
      emailSent: false,
      emailRecipient: user.email || "admin@piyushprasad.in",
      userAccountsPreserved: true,
    };
  },
);

// Get Backups History List
export const getDatabaseBackupsList = createServerFn({ method: "GET" }).handler(
  async (): Promise<DatabaseBackupRecord[]> => {
    const { db } = await verifyAdminCaller();
    const { readLocalBackupHistory } = await import("./database-backup.service");

    const localList = readLocalBackupHistory();
    let supabaseList: any[] = [];

    try {
      const { data, error } = await db
        .from("database_backups")
        .select(
          "id, created_at, backup_date, backup_time, filename, file_size_bytes, file_size_pretty, status, backup_type, tables_included, total_records, pruned_records_count, deleted_at, error_message, storage_bucket, storage_path, metadata",
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data)) {
        supabaseList = data;
      }
    } catch {
      // Supabase table query fallback
    }

    // Merge Supabase and Local Vault records (deduplicate by filename / id)
    const seen = new Set<string>();
    const merged: DatabaseBackupRecord[] = [];

    for (const item of [...supabaseList, ...localList]) {
      const key = item.filename || item.id;
      if (key && !seen.has(key)) {
        seen.add(key);
        merged.push(item as unknown as DatabaseBackupRecord);
      }
    }

    // Sort descending by created_at
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return merged;
  },
);

// Download specific backup payload from Supabase Storage or Local Vault
export const getBackupDownloadData = createServerFn({ method: "POST" })
  .validator((data: { backupId: string }) => data)
  .handler(async ({ data }) => {
    const { db } = await verifyAdminCaller();
    const { readLocalBackupHistory, getBackupStorageDir } = await import("./database-backup.service");

    // 1. Check local backup vault first
    const localRecords = readLocalBackupHistory();
    const localMatch = localRecords.find((r) => r.id === data.backupId || r.filename === data.backupId);

    if (localMatch) {
      if (localMatch.deleted_at) {
        throw new Error(
          `Backup file "${localMatch.filename}" was automatically pruned after 7 days per retention policy. History record remains available.`,
        );
      }
      const fs = await import("node:fs");
      const path = await import("node:path");
      const localFilePath = path.join(getBackupStorageDir(), localMatch.filename);
      if (fs.existsSync(localFilePath)) {
        const sqlContent = fs.readFileSync(localFilePath, "utf8");
        return {
          backupId: localMatch.id,
          filename: localMatch.filename,
          sqlContent,
        };
      }
      if (localMatch.backup_data?.sql) {
        return {
          backupId: localMatch.id,
          filename: localMatch.filename,
          sqlContent: localMatch.backup_data.sql,
        };
      }
    }

    // 2. Check Supabase
    try {
      const { data: records, error } = await db
        .from("database_backups")
        .select("id, created_at, filename, status, deleted_at, storage_path, backup_data")
        .eq("id", data.backupId)
        .limit(1);

      if (!error && records && records[0]) {
        const record = records[0];

        if (record.deleted_at) {
          throw new Error(
            `Backup file "${record.filename}" was automatically pruned after 7 days per retention policy. History record remains available.`,
          );
        }

        const fs = await import("node:fs");
        const path = await import("node:path");
        const localFilePath = path.join(getBackupStorageDir(), record.filename);
        if (fs.existsSync(localFilePath)) {
          const sqlContent = fs.readFileSync(localFilePath, "utf8");
          return {
            backupId: record.id,
            filename: record.filename,
            sqlContent,
          };
        }

        // Check if stored directly in database backup_data or path is database://backup_data
        if (
          record.storage_path === "database://backup_data" ||
          (record.backup_data && typeof record.backup_data === "object" && (record.backup_data as any).sql)
        ) {
          return {
            backupId: record.id,
            filename: record.filename,
            sqlContent: (record.backup_data as any).sql,
          };
        }

        const { BACKUP_STORAGE_BUCKET } = await import("./database-backup.service");

        // Attempt to generate signed download URL
        const filePath = record.storage_path || record.filename;
        const { data: signedData, error: signError } = await db.storage
          .from(BACKUP_STORAGE_BUCKET)
          .createSignedUrl(filePath, 300);

        if (!signError && signedData?.signedUrl) {
          return {
            backupId: record.id,
            filename: record.filename,
            signedUrl: signedData.signedUrl,
          };
        }
      }
    } catch (dbErr: any) {
      if (dbErr?.message?.includes("pruned")) throw dbErr;
    }

    throw new Error("Backup history record not found.");
  });

// Get Monthly Backup Reports List
export const getMonthlyReportsList = createServerFn({ method: "GET" }).handler(
  async (): Promise<MonthlyBackupReportRecord[]> => {
    const { db } = await verifyAdminCaller();
    try {
      const { data, error } = await db
        .from("backup_monthly_reports")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(24);

      if (error) {
        console.warn("[DatabaseAdmin] Query backup_monthly_reports warning:", error.message);
        return [];
      }
      return (data ?? []) as unknown as MonthlyBackupReportRecord[];
    } catch {
      return [];
    }
  },
);

// Generate Monthly Report on demand
export const generateMonthlyReportFn = createServerFn({ method: "POST" })
  .validator((data: { year: number; month: number; sendEmail?: boolean }) => data)
  .handler(async ({ data }) => {
    const { user, db } = await verifyAdminCaller();
    const { generateMonthlyBackupSummary } = await import("./database-backup.service");

    const report = await generateMonthlyBackupSummary({
      supabase: db,
      year: data.year,
      month: data.month,
      recipientEmail: user.email || undefined,
      sendEmail: data.sendEmail ?? false,
    });

    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email || "admin",
      action: "database.monthly_report.generated",
      targetTable: "backup_monthly_reports",
      details: {
        year: data.year,
        month: data.month,
        totalBackups: report.totalBackups,
        successPercentage: report.successPercentage,
        status: report.reportStatus,
      },
      db,
    });

    return report;
  });

