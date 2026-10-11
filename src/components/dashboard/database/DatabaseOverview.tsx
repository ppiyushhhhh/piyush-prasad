import {
  Users,
  Database,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
  HardDrive,
  Info,
  PieChart,
} from "lucide-react";
import type { DatabaseOverviewData } from "@/lib/database-admin.functions";
import { formatBytes } from "@/lib/database-admin.functions";

interface DatabaseOverviewProps {
  overview: DatabaseOverviewData;
  onSelectTable: (tableName: string) => void;
  onGoToUsers: () => void;
  onGoToActivity: () => void;
  onGoToBackups?: () => void;
  onTakeManualBackup?: () => void;
}

export function DatabaseOverview({
  overview,
  onSelectTable,
  onGoToUsers,
  onGoToActivity,
  onGoToBackups,
  onTakeManualBackup,
}: DatabaseOverviewProps) {
  const isHealthy = overview.status === "connected";
  const availableBytes = Math.max(0, overview.storageQuotaBytes - overview.storageUsedBytes);
  const availablePretty = formatBytes(availableBytes);

  const storageStatusBadge =
    overview.storageStatus === "critical" ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle className="h-3 w-3" /> Critical (&gt;90%)
      </span>
    ) : overview.storageStatus === "warning" ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="h-3 w-3" /> Warning (&gt;75%)
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Optimal
      </span>
    );

  const storageBarColor =
    overview.storageStatus === "critical"
      ? "bg-rose-600"
      : overview.storageStatus === "warning"
        ? "bg-amber-500"
        : "bg-cobalt";

  return (
    <div className="space-y-8">
      {/* 5 Top Overview Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Database Storage Used */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase tracking-[0.18em] text-cobalt font-semibold flex items-center gap-1.5 mono">
              <HardDrive className="h-3.5 w-3.5" />
              Database Storage
            </span>
            {storageStatusBadge}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="mono text-3xl font-bold text-carbon">
              {overview.storageUsedPretty}
            </span>
            <span className="text-xs text-muted-foreground mono">
              / {overview.storageQuotaPretty}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground mono">
              <strong className="text-carbon font-bold">{overview.storagePercent}%</strong> consumed
            </span>
            <span className="text-[11px] text-muted-foreground mono">
              {availablePretty} free
            </span>
          </div>
        </div>

        {/* Card 2: Application Users */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mono">
              Application Users
            </span>
            <Users className="h-4 w-4 text-cobalt" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="mono text-3xl font-bold text-carbon">
              {overview.totalUsers}
            </span>
            <span className="text-xs text-emerald-700 font-semibold mono">
              {overview.activeUsers} active
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Auth & RBAC roles</span>
            <button
              onClick={onGoToUsers}
              className="text-cobalt hover:text-cobalt/80 font-semibold inline-flex items-center gap-1 transition-colors mono text-[11px]"
            >
              Manage &rarr;
            </button>
          </p>
        </div>

        {/* Card 3: Database Tables */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mono">
              Monitored Tables
            </span>
            <Layers className="h-4 w-4 text-cobalt" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="mono text-3xl font-bold text-carbon">
              {overview.totalTables}
            </span>
            <span className="text-xs text-muted-foreground mono">core schemas</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Health, performance, CI/CD & chat
          </p>
        </div>

        {/* Card 4: Total Records */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mono">
              Total Records
            </span>
            <Database className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="mono text-3xl font-bold text-carbon">
              {overview.totalRecords.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground mono">rows stored</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Across monitored relations
          </p>
        </div>

        {/* Card 5: Recent Activity */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mono">
              Audit Logs (24h)
            </span>
            <Activity className="h-4 w-4 text-amber-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="mono text-3xl font-bold text-carbon">
              {overview.recentActivityCount}
            </span>
            <span className="text-xs text-muted-foreground mono">admin ops</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Audit trail</span>
            <button
              onClick={onGoToActivity}
              className="text-cobalt hover:text-cobalt/80 font-semibold inline-flex items-center gap-1 transition-colors mono text-[11px]"
            >
              Logs &rarr;
            </button>
          </p>
        </div>
      </div>

      {/* DEDICATED DATABASE STORAGE & DISK CAPACITY PANEL */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-cobalt/10 border border-cobalt/20 text-cobalt">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-carbon">
                  Database Storage &amp; Disk Capacity
                </h3>
                {storageStatusBadge}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Physical disk usage across relations, indexes, and catalogs measured against the Supabase Free Tier 500 MB quota.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs mono bg-cobalt/10 border border-cobalt/20 text-cobalt font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              7-Day Retention Active
            </span>

            {overview.storageTelemetrySource === "postgresql_disk" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                PostgreSQL Engine Telemetry (Live)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs mono bg-[#FAF9F6] border border-[#E5E5DF] text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-cobalt" />
                Estimated Schema Telemetry
              </span>
            )}

            {onGoToBackups && (
              <button
                onClick={onGoToBackups}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-semibold text-cobalt hover:text-white hover:bg-cobalt border border-cobalt/30 transition-colors mono"
              >
                Backups &amp; Retention &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Quota Gauge */}
        <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="mono text-sm font-semibold text-carbon">
                Storage Used: <span className="text-cobalt font-bold">{overview.storageUsedPretty}</span>
              </span>
              <span className="text-neutral-400">•</span>
              <span className="mono text-muted-foreground">
                Quota: <strong className="text-carbon">{overview.storageQuotaPretty}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 mono">
              <span className="text-muted-foreground">Available:</span>
              <span className="text-emerald-700 font-bold">{availablePretty}</span>
              <span className="text-muted-foreground">({(100 - overview.storagePercent).toFixed(1)}% free)</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative h-3 w-full rounded-full bg-neutral-200 border border-[#E5E5DF] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${storageBarColor}`}
              style={{ width: `${Math.max(1.5, Math.min(100, overview.storagePercent))}%` }}
            />
          </div>

          {/* Micro stat summary tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                PostgreSQL Consumed
              </div>
              <div className="mt-1 mono text-lg font-bold text-carbon">
                {overview.storageUsedPretty}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Tables, TOAST &amp; Indexes
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Supabase Quota
              </div>
              <div className="mt-1 mono text-lg font-bold text-carbon">
                {overview.storageQuotaPretty}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Free Tier Database Cap
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Remaining Headroom
              </div>
              <div className="mt-1 mono text-lg font-bold text-emerald-700">
                {availablePretty}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Safe operating capacity
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                <span>7-Day Retention</span>
                <span className="text-[9px] font-bold text-cobalt mono">ACTIVE</span>
              </div>
              <div className="mt-1 mono text-lg font-bold text-cobalt">
                Auto-Prune
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Pre-backup + User safe
              </div>
            </div>
          </div>
        </div>

        {/* Per-Table Storage Breakdown Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-cobalt" />
              <h4 className="text-sm font-semibold text-carbon">
                Storage Breakdown by Table
              </h4>
            </div>
            <span className="text-xs text-muted-foreground mono">
              {overview.tableStorageBreakdown.length} monitored schemas
            </span>
          </div>

          <div className="rounded-sm border border-[#E5E5DF] overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground mono text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">Table</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Rows</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Table Data</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Index Footprint</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total Disk</th>
                    <th className="py-2.5 px-4 font-semibold min-w-[120px]">Share of DB</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF]">
                  {overview.tableStorageBreakdown.map((row) => (
                    <tr
                      key={row.tableName}
                      className="hover:bg-[#FAF9F6]/80 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-medium text-carbon">
                        <div className="font-semibold text-carbon">{row.displayName}</div>
                        <div className="mono text-[10px] text-muted-foreground">{row.tableName}</div>
                      </td>
                      <td className="py-2.5 px-3 mono text-carbon text-right">
                        {row.rowCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 mono text-muted-foreground text-right">
                        {row.tablePretty}
                      </td>
                      <td className="py-2.5 px-3 mono text-muted-foreground text-right">
                        {row.indexPretty}
                      </td>
                      <td className="py-2.5 px-3 mono font-semibold text-cobalt text-right">
                        {row.totalPretty}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-[#FAF9F6] border border-[#E5E5DF] rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full bg-cobalt rounded-full"
                              style={{ width: `${Math.min(100, Math.max(4, row.percentOfDb))}%` }}
                            />
                          </div>
                          <span className="mono text-[11px] text-muted-foreground shrink-0">
                            {row.percentOfDb}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => onSelectTable(row.tableName)}
                          className="text-xs font-semibold text-cobalt hover:text-cobalt/80 inline-flex items-center gap-1 transition-colors mono"
                        >
                          Browse &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Database Connection & Health Panel */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-sm border ${
                isHealthy
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-carbon">
                  PostgreSQL Database Engine
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-xs font-semibold mono ${
                    isHealthy
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      : "bg-rose-50 border border-rose-200 text-rose-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isHealthy ? "bg-emerald-600 animate-pulse" : "bg-rose-600"
                    }`}
                  />
                  {isHealthy ? "Operational" : "Degraded"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{overview.provider}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs mono">
            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-muted-foreground flex items-center gap-2 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-cobalt" />
              <span>Ping: <strong className="text-carbon">{overview.latencyMs} ms</strong></span>
            </div>
            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-muted-foreground flex items-center gap-2 shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Checked: {new Date(overview.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Connection status detail notes */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs text-muted-foreground">
          <div>
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Connection Architecture
            </div>
            <p className="text-carbon leading-relaxed">
              Authenticated PostgREST gateway with pooled connection pooler and security-definer functions.
            </p>
          </div>

          <div>
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Authorization &amp; RLS
            </div>
            <p className="text-carbon leading-relaxed">
              Row-Level Security active on all tables. Queries verified server-side with caller role evaluation.
            </p>
          </div>

          <div>
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Service Role Status
            </div>
            <p className="leading-relaxed">
              {overview.serviceRoleConfigured ? (
                <span className="text-emerald-700 flex items-center gap-1 mono font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Service-Role Key Configured
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1 mono font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Publishable Key Mode (Read &amp; RLS)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Application Tables Summary Grid */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF] mb-6">
          <div>
            <h3 className="text-base font-semibold text-carbon flex items-center gap-2">
              <Layers className="h-5 w-5 text-cobalt" />
              Application Database Tables
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live record counts and physical storage footprints across monitored tables in Supabase.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.tableStats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-4 hover:border-cobalt/40 transition-colors flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-carbon">{stat.displayName}</h4>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="px-2 py-0.5 rounded-sm text-xs mono font-bold bg-cobalt/10 text-cobalt border border-cobalt/20">
                      {stat.rowCount.toLocaleString()} rows
                    </span>
                    {stat.totalPretty && (
                      <span className="text-[10px] mono text-muted-foreground">
                        {stat.totalPretty}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mono text-[10px] text-muted-foreground mt-0.5">{stat.name}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {stat.description}
                </p>

                {stat.tablePretty && (
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] mono text-muted-foreground">
                    <span>Data: <strong className="text-carbon">{stat.tablePretty}</strong></span>
                    <span>•</span>
                    <span>Index: <strong className="text-carbon">{stat.indexPretty}</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E5DF] flex items-center justify-between">
                <div className="text-[10px] text-muted-foreground mono">
                  {stat.lastUpdated
                    ? `Updated ${new Date(stat.lastUpdated).toLocaleDateString()}`
                    : "No records yet"}
                </div>
                <button
                  onClick={() => onSelectTable(stat.name)}
                  className="text-xs font-semibold text-cobalt hover:text-cobalt/80 inline-flex items-center gap-1 transition-colors mono"
                >
                  Browse Table <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
