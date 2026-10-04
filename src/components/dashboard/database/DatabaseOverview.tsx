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
}

export function DatabaseOverview({
  overview,
  onSelectTable,
  onGoToUsers,
  onGoToActivity,
}: DatabaseOverviewProps) {
  const isHealthy = overview.status === "connected";
  const availableBytes = Math.max(0, overview.storageQuotaBytes - overview.storageUsedBytes);
  const availablePretty = formatBytes(availableBytes);

  const storageStatusBadge =
    overview.storageStatus === "critical" ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
        <AlertTriangle className="h-3 w-3" /> Critical (&gt;90%)
      </span>
    ) : overview.storageStatus === "warning" ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
        <AlertTriangle className="h-3 w-3" /> Warning (&gt;75%)
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
        <CheckCircle2 className="h-3 w-3" /> Optimal
      </span>
    );

  const storageBarColor =
    overview.storageStatus === "critical"
      ? "bg-rose-500"
      : overview.storageStatus === "warning"
        ? "bg-amber-500"
        : "bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400";

  return (
    <div className="space-y-8">
      {/* 5 Top Overview Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Database Storage Used */}
        <div className="rounded-lg border border-cyan-800/60 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-400 font-semibold flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              Database Storage
            </span>
            {storageStatusBadge}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">
              {overview.storageUsedPretty}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {overview.storageQuotaPretty}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              <strong className="text-cyan-300">{overview.storagePercent}%</strong> consumed
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {availablePretty} free
            </span>
          </div>
        </div>

        {/* Card 2: Application Users */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Application Users
            </span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">
              {overview.totalUsers}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {overview.activeUsers} active
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Auth & RBAC roles</span>
            <button
              onClick={onGoToUsers}
              className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Manage &rarr;
            </button>
          </p>
        </div>

        {/* Card 3: Database Tables */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Monitored Tables
            </span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">
              {overview.totalTables}
            </span>
            <span className="text-xs text-slate-400 font-mono">core schemas</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Health, performance, CI/CD & chat
          </p>
        </div>

        {/* Card 4: Total Records */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Total Records
            </span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">
              {overview.totalRecords.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">rows stored</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Across monitored relations
          </p>
        </div>

        {/* Card 5: Recent Activity */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Audit Logs (24h)
            </span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">
              {overview.recentActivityCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">admin ops</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Audit trail</span>
            <button
              onClick={onGoToActivity}
              className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Logs &rarr;
            </button>
          </p>
        </div>
      </div>

      {/* DEDICATED DATABASE STORAGE & DISK CAPACITY PANEL */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-cyan-950/60 border-cyan-800/80 text-cyan-400">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  Database Storage &amp; Disk Capacity
                </h3>
                {storageStatusBadge}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical disk usage across relations, indexes, and catalogs measured against the Supabase Free Tier 500 MB quota.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {overview.storageTelemetrySource === "postgresql_disk" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                PostgreSQL Engine Telemetry (Live)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-850 bg-slate-800/80 border border-slate-700 text-slate-300">
                <Info className="h-3.5 w-3.5 text-cyan-400" />
                Estimated Schema Telemetry
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Quota Gauge */}
        <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-slate-100">
                Storage Used: <span className="text-cyan-400">{overview.storageUsedPretty}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-400">
                Quota: <strong className="text-slate-200">{overview.storageQuotaPretty}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Available:</span>
              <span className="text-emerald-400 font-semibold">{availablePretty}</span>
              <span className="text-slate-500">({(100 - overview.storagePercent).toFixed(1)}% free)</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative h-4 w-full rounded-full bg-slate-900 border border-slate-800 p-0.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${storageBarColor}`}
              style={{ width: `${Math.max(1.5, Math.min(100, overview.storagePercent))}%` }}
            />
          </div>

          {/* Micro stat summary tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-md border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                PostgreSQL Consumed
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-100">
                {overview.storageUsedPretty}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Tables, TOAST &amp; Indexes
              </div>
            </div>

            <div className="rounded-md border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Supabase Quota
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-100">
                {overview.storageQuotaPretty}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Free Tier Database Cap
              </div>
            </div>

            <div className="rounded-md border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Remaining Headroom
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
                {availablePretty}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Safe operating capacity
              </div>
            </div>
          </div>
        </div>

        {/* Per-Table Storage Breakdown Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-slate-200">
                Storage Breakdown by Table
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {overview.tableStorageBreakdown.length} monitored schemas
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono text-[11px]">
                    <th className="py-2.5 px-4 font-semibold">Table</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Rows</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Table Data</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Index Footprint</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total Disk</th>
                    <th className="py-2.5 px-4 font-semibold min-w-[120px]">Share of DB</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {overview.tableStorageBreakdown.map((row) => (
                    <tr
                      key={row.tableName}
                      className="hover:bg-slate-850 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-200">
                        <div className="font-semibold text-slate-200">{row.displayName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{row.tableName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 text-right">
                        {row.rowCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-right">
                        {row.tablePretty}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-right">
                        {row.indexPretty}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-cyan-300 text-right">
                        {row.totalPretty}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(4, row.percentOfDb))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 shrink-0">
                            {row.percentOfDb}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => onSelectTable(row.tableName)}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
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
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isHealthy
                  ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-400"
                  : "bg-rose-950/60 border-rose-800/80 text-rose-400"
              }`}
            >
              <Server className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  PostgreSQL Database Engine
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isHealthy
                      ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                      : "bg-rose-950 border border-rose-800 text-rose-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isHealthy ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    }`}
                  />
                  {isHealthy ? "Operational" : "Degraded"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{overview.provider}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-slate-300 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ping: <strong className="text-slate-100">{overview.latencyMs} ms</strong></span>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-slate-300 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Checked: {new Date(overview.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Connection status detail notes */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs text-slate-400">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Connection Architecture
            </div>
            <p className="text-slate-300 leading-relaxed">
              Authenticated PostgREST gateway with pooled connection pooler and security-definer functions.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Authorization &amp; RLS
            </div>
            <p className="text-slate-300 leading-relaxed">
              Row-Level Security active on all tables. Queries verified server-side with caller role evaluation.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Service Role Status
            </div>
            <p className="leading-relaxed">
              {overview.serviceRoleConfigured ? (
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Service-Role Key Configured
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-mono">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Publishable Key Mode (Read &amp; RLS)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Application Tables Summary Grid */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              Application Database Tables
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live record counts and physical storage footprints across monitored tables in Supabase.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.tableStats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-lg border border-slate-800/90 bg-slate-950 p-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-slate-200">{stat.displayName}</h4>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {stat.rowCount.toLocaleString()} rows
                    </span>
                    {stat.totalPretty && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {stat.totalPretty}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">{stat.name}</div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {stat.description}
                </p>

                {stat.tablePretty && (
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span>Data: <strong className="text-slate-400">{stat.tablePretty}</strong></span>
                    <span>•</span>
                    <span>Index: <strong className="text-slate-400">{stat.indexPretty}</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="text-[10px] text-slate-500 font-mono">
                  {stat.lastUpdated
                    ? `Updated ${new Date(stat.lastUpdated).toLocaleDateString()}`
                    : "No records yet"}
                </div>
                <button
                  onClick={() => onSelectTable(stat.name)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
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
