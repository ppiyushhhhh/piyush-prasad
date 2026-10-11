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
    <div className="space-y-6">
      {/* 1. MASTER STORAGE CAPACITY & RETENTION HUB */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-carbon/15 bg-white shadow-2xs shrink-0">
              <HardDrive className="h-5 w-5 text-cobalt" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-carbon">
                  Database Disk Footprint &amp; Quota
                </h2>
                {storageStatusBadge}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 mono">
                Physical disk allocation measured against the Supabase 500 MB capacity quota.
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
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live PostgreSQL Telemetry
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs mono bg-[#FAF9F6] border border-[#E5E5DF] text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-cobalt" />
                Estimated Telemetry
              </span>
            )}

            {onGoToBackups && (
              <button
                onClick={onGoToBackups}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-semibold text-cobalt hover:text-white hover:bg-cobalt border border-cobalt/30 transition-colors mono cursor-pointer"
              >
                Retention Rules &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Quota Gauge */}
        <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="mono text-sm font-semibold text-carbon">
                Allocated: <span className="text-cobalt font-bold">{overview.storageUsedPretty}</span>
              </span>
              <span className="text-neutral-400">•</span>
              <span className="mono text-muted-foreground">
                Tier Quota: <strong className="text-carbon">{overview.storageQuotaPretty}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 mono">
              <span className="text-muted-foreground">Headroom:</span>
              <span className="text-emerald-700 font-bold">{availablePretty}</span>
              <span className="text-muted-foreground">({(100 - overview.storagePercent).toFixed(1)}% free)</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative h-2.5 w-full rounded-full bg-neutral-200 border border-[#E5E5DF] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${storageBarColor}`}
              style={{ width: `${Math.max(1.5, Math.min(100, overview.storagePercent))}%` }}
            />
          </div>

          {/* Clean 4-Column Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Consumed Storage
              </div>
              <div className="mt-1 mono text-xl font-bold text-carbon">
                {overview.storageUsedPretty}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Tables, TOAST &amp; Indexes
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Free Tier Ceiling
              </div>
              <div className="mt-1 mono text-xl font-bold text-carbon">
                {overview.storageQuotaPretty}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Max PostgreSQL Quota
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Available Headroom
              </div>
              <div className="mt-1 mono text-xl font-bold text-emerald-700">
                {availablePretty}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Safe headroom remaining
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                <span>Auto-Rotation</span>
                <span className="text-[9px] font-bold text-cobalt mono">7 DAYS</span>
              </div>
              <div className="mt-1 mono text-xl font-bold text-cobalt">
                Continuous
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Automated pruning engine
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL TELEMETRY KPIS (3 Clean Cards) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Application Users */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mono">
                Application Accounts
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
            <p className="mt-1 text-xs text-muted-foreground">
              Authenticated identities and RBAC roles
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E5DF] flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground mono">Auth Management</span>
            <button
              onClick={onGoToUsers}
              className="text-cobalt hover:text-cobalt/80 font-semibold inline-flex items-center gap-1 transition-colors mono text-xs cursor-pointer"
            >
              Manage Users &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Monitored Tables */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mono">
                Monitored Relations
              </span>
              <Layers className="h-4 w-4 text-cobalt" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="mono text-3xl font-bold text-carbon">
                {overview.totalTables}
              </span>
              <span className="text-xs text-muted-foreground mono">schemas</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {overview.totalRecords.toLocaleString()} rows tracked across database
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E5DF] flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground mono">Core Schema</span>
            <span className="text-xs text-carbon font-semibold mono">Live &amp; Monitored</span>
          </div>
        </div>

        {/* Card 3: Recent Activity */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mono">
                Audit Trail (24h)
              </span>
              <Activity className="h-4 w-4 text-amber-700" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="mono text-3xl font-bold text-carbon">
                {overview.recentActivityCount}
              </span>
              <span className="text-xs text-muted-foreground mono">admin events</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Immutable mutations, auth events and backups
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E5DF] flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground mono">Audit Log</span>
            <button
              onClick={onGoToActivity}
              className="text-cobalt hover:text-cobalt/80 font-semibold inline-flex items-center gap-1 transition-colors mono text-xs cursor-pointer"
            >
              View Trail &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 3. APPLICATION RELATIONS STORAGE BREAKDOWN (The definitive table) */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#E5E5DF]">
          <div>
            <h3 className="text-base font-semibold text-carbon flex items-center gap-2">
              <PieChart className="h-4 w-4 text-cobalt" />
              Database Schemas &amp; Physical Footprint
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live record counts and physical disk usage per table relation.
            </p>
          </div>
          <span className="text-xs text-muted-foreground mono">
            {overview.tableStorageBreakdown.length} monitored relations
          </span>
        </div>

        <div className="rounded-sm border border-[#E5E5DF] overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground mono text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Relation</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Rows</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Table Payload</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Index Space</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Disk</th>
                  <th className="py-2.5 px-4 font-semibold min-w-[130px]">Database Share</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Inspect</th>
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
                    <td className="py-2.5 px-3 mono text-carbon text-right font-medium">
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
                        className="text-xs font-semibold text-cobalt hover:text-cobalt/80 inline-flex items-center gap-1 transition-colors mono cursor-pointer"
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

      {/* 4. POSTGRESQL ARCHITECTURE & SECURITY SPEC SHEET */}
      <div className="rounded-sm border border-[#E5E5DF] bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-carbon/15 bg-white text-carbon shadow-2xs shrink-0">
              <Server className="h-4 w-4 text-cobalt" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-carbon">
                  PostgreSQL Engine Architecture
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold mono bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Operational
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 mono">
                {overview.provider} &bull; AWS ap-south-1 &bull; Port 5432
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs mono">
            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-1 text-muted-foreground flex items-center gap-1.5 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-cobalt" />
              <span>Ping: <strong className="text-carbon">{overview.latencyMs} ms</strong></span>
            </div>
            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-1 text-muted-foreground flex items-center gap-1.5 shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Last Probe: {new Date(overview.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Architectural Specs Grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1">
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Gateway Architecture
            </div>
            <p className="text-carbon leading-relaxed">
              Authenticated PostgREST gateway with session connection pooler and security-definer execution.
            </p>
          </div>

          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1">
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Row-Level Security (RLS)
            </div>
            <p className="text-carbon leading-relaxed">
              Row-Level Security enforced on all tables. Non-admin write operations strictly blocked at database layer.
            </p>
          </div>

          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3.5 space-y-1">
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Service Role Authorization
            </div>
            <p className="leading-relaxed">
              {overview.serviceRoleConfigured ? (
                <span className="text-emerald-700 flex items-center gap-1 mono font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Service-Role Vault Active
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1 mono font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Publishable Key Mode
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
