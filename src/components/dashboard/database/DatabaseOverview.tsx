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
} from "lucide-react";
import type { DatabaseOverviewData } from "@/lib/database-admin.functions";

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

  return (
    <div className="space-y-8">
      {/* 4 Overview Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Application Users */}
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
            <span>Auth accounts & RBAC roles</span>
            <button
              onClick={onGoToUsers}
              className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Manage &rarr;
            </button>
          </p>
        </div>

        {/* Card 2: Database Tables */}
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
            Health, performance, deployments, CI/CD, chat & roles
          </p>
        </div>

        {/* Card 3: Total Records */}
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
            Across all monitored database relations
          </p>
        </div>

        {/* Card 4: Recent Activity */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Recent Activity (24h)
            </span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">
              {overview.recentActivityCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">admin operations</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Audit trail & security events</span>
            <button
              onClick={onGoToActivity}
              className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Audit Log &rarr;
            </button>
          </p>
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
              Authorization & RLS
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
                  Publishable Key Mode (Read & RLS)
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
              Live record counts and telemetry timestamps across all monitored tables in Supabase.
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
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                    {stat.rowCount.toLocaleString()}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">{stat.name}</div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {stat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850 border-slate-800/60 flex items-center justify-between">
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
