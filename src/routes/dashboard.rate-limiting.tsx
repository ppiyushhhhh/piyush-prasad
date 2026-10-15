import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Trash2,
  Lock,
  Layers,
  Database,
  Server,
  Zap,
  Power,
  AlertTriangle,
  Loader2,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PageHeader,
  Panel,
  TelemetryMatrix,
  TelemetryCell,
  StatusTag,
} from "@/components/dashboard/primitives";
import {
  getRateLimitingDashboardData,
  updateRateLimitConfig,
  toggleGlobalRateLimiting,
  resetRateLimitStatistics,
  type RateLimitMetricSummary,
} from "@/lib/rate-limiting-admin.functions";
import type { RateLimitConfig } from "@/lib/rate-limiter.server";
import { RateLimitCharts } from "@/components/dashboard/ratelimiting/RateLimitCharts";
import { RateLimitRecentViolationsTable } from "@/components/dashboard/ratelimiting/RateLimitRecentViolationsTable";
import { EditRateLimitConfigDialog } from "@/components/dashboard/ratelimiting/EditRateLimitConfigDialog";
import { ResetStatsDialog } from "@/components/dashboard/ratelimiting/ResetStatsDialog";

export const Route = createFileRoute("/dashboard/rate-limiting")({
  head: () => ({
    meta: [
      { title: "Rate Limiting & Abuse Defense — PP · OPS Monitoring" },
      {
        name: "description",
        content: "Production distributed rate limiting, traffic throttling rules, and live abuse metrics.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RateLimitingDashboardPage,
});

function RateLimitingDashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Telemetry data state
  const [data, setData] = useState<RateLimitMetricSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Dialog states
  const [editingConfig, setEditingConfig] = useState<RateLimitConfig | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Server functions
  const fetchData = useServerFn(getRateLimitingDashboardData);
  const runUpdateConfig = useServerFn(updateRateLimitConfig);
  const runToggleMaster = useServerFn(toggleGlobalRateLimiting);
  const runResetStats = useServerFn(resetRateLimitStatistics);

  // 1. Verify caller admin role on mount
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

        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (isMounted) {
          if (roleRow?.role === "admin") {
            setIsAdmin(true);
          } else {
            // Check if 0 admins exist (bootstrap first admin)
            const { count } = await supabase
              .from("user_roles")
              .select("id", { count: "exact", head: true })
              .eq("role", "admin");

            setIsAdmin(count === 0 || count === null);
          }
          setAuthChecking(false);
        }
      } catch (err) {
        console.error("Auth role check error:", err);
        if (isMounted) {
          setIsAdmin(true);
          setAuthChecking(false);
        }
      }
    }

    checkRole();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch rate limiting metrics
  const loadMetrics = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setRefreshing(true);
        const res = await fetchData();
        setData(res);
      } catch (err) {
        console.error("Failed to load rate limiting metrics:", err);
        toast.error("Failed to fetch rate limiting metrics.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchData]
  );

  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
    }
  }, [isAdmin, loadMetrics]);

  // 3. Auto-refresh interval (30 seconds)
  useEffect(() => {
    if (!autoRefresh || !isAdmin) return;
    const interval = setInterval(() => {
      loadMetrics(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin, loadMetrics]);

  // Master switch toggle handler
  async function handleToggleMaster() {
    if (!data) return;
    const newState = data.status !== "enabled";
    try {
      setRefreshing(true);
      await runToggleMaster({ data: { enabled: newState } });
      toast.success(
        newState
          ? "Rate limiting enforcement enabled globally."
          : "Rate limiting enforcement has been disabled globally."
      );
      await loadMetrics(true);
    } catch (err) {
      toast.error((err as Error).message || "Failed to toggle rate limiting status.");
    } finally {
      setRefreshing(false);
    }
  }

  // Update rule config handler
  async function handleSaveConfig(updated: {
    id: RateLimitConfig["id"];
    max_requests: number;
    window_seconds: number;
    enabled: boolean;
  }) {
    try {
      await runUpdateConfig({ data: updated });
      toast.success(`Rule '${updated.id}' updated successfully.`);
      await loadMetrics(true);
    } catch (err) {
      toast.error((err as Error).message || "Failed to update rule configuration.");
      throw err;
    }
  }

  // Reset statistics handler
  async function handleConfirmReset() {
    try {
      await runResetStats();
      toast.success("All rate limit counters and violation history have been reset.");
      await loadMetrics(true);
    } catch (err) {
      toast.error((err as Error).message || "Failed to reset rate limiting statistics.");
      throw err;
    }
  }

  // Auth checking indicator
  if (authChecking) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cobalt" />
        <span className="mono text-xs text-muted-foreground">
          Verifying security authorizations…
        </span>
      </div>
    );
  }

  // Access denied state
  if (isAdmin === false) {
    return (
      <div className="rounded-sm border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
        <ShieldAlert className="mx-auto h-8 w-8 text-rose-600 mb-2" />
        <h3 className="mono text-sm font-bold uppercase tracking-wider">
          Access Restricted: Admin Required
        </h3>
        <p className="mt-1 text-xs text-rose-700">
          Only verified administrators are authorized to access rate limiting controls and security policies.
        </p>
      </div>
    );
  }

  const isEnabled = data?.status === "enabled";

  return (
    <div className="space-y-6">
      {/* 1. Header with Title */}
      <PageHeader
        title="Rate Limiting & Abuse Defense"
        subtitle="Production distributed request throttling, endpoint rate limit rules, and real-time security violation metrics."
        badge="WAF // RL"
      />

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5DF] pb-4">
        <div className="flex items-center gap-2">
          <StatusTag status={isEnabled ? "optimal" : "critical"}>
            {isEnabled ? "RATE LIMITING ACTIVE" : "RATE LIMITING DISABLED"}
          </StatusTag>
          <span className="text-muted-foreground/40">•</span>
          <span className="mono text-[10px] uppercase text-muted-foreground">
            {data?.activeStorageBackend === "redis"
              ? "Upstash Redis"
              : data?.activeStorageBackend === "postgres"
                ? "PostgreSQL Atomic Store"
                : "In-Memory Fallback"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Refresh Toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`mono flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
              autoRefresh
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? "bg-emerald-600 animate-pulse" : "bg-muted-foreground"}`}
            />
            <span>30s Auto-Sync</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={() => loadMetrics(false)}
            disabled={refreshing}
            className="mono flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-semibold text-carbon shadow-2xs hover:border-cobalt hover:text-cobalt active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-cobalt" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Reset Stats Button */}
          <button
            type="button"
            onClick={() => setIsResetOpen(true)}
            className="mono flex items-center gap-1.5 rounded-sm border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Counters</span>
          </button>

          {/* Master Enable/Disable Toggle */}
          <button
            type="button"
            onClick={handleToggleMaster}
            disabled={refreshing}
            className={`mono flex items-center gap-2 rounded-sm px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-all active:scale-95 ${
              isEnabled
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{isEnabled ? "Disable Protection" : "Enable Protection"}</span>
          </button>
        </div>
      </div>


      {/* 2. System Status & Storage Backend Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-sm border border-[#E5E5DF] bg-white p-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <StatusTag status={isEnabled ? "optimal" : "critical"}>
            {isEnabled ? "RATE LIMITING ACTIVE" : "RATE LIMITING DISABLED"}
          </StatusTag>

          <span className="hidden sm:inline-block text-[#E5E5DF]">|</span>

          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Server className="h-3.5 w-3.5 text-cobalt" />
            <span>Store:</span>
            <span className="font-semibold text-carbon">
              {data?.activeStorageBackend === "redis"
                ? "Upstash Redis Cluster (Atomic REST)"
                : data?.activeStorageBackend === "postgres"
                  ? "Supabase PostgreSQL (Atomic Stored Procedure)"
                  : "In-Memory Fail-Safe Fallback"}
            </span>
          </div>
        </div>

        <div className="mono flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Server-Side Enforced</span>
          <span>&bull;</span>
          <span>Distributed Multi-Process Safe</span>
        </div>
      </div>

      {/* 3. Primary Telemetry Matrix */}
      <TelemetryMatrix columns={4}>
        <TelemetryCell
          index={1}
          label="Protection Status"
          value={isEnabled ? "ENFORCING" : "BYPASS"}
          hint={isEnabled ? "All endpoint rules active" : "Throttling bypassed globally"}
          accent={isEnabled ? "emerald" : "rose"}
        />
        <TelemetryCell
          index={2}
          label="Total Inspected Traffic"
          value={data ? data.totalRequests.toLocaleString() : "—"}
          hint="Aggregate HTTP requests tracked"
          accent="cobalt"
        />
        <TelemetryCell
          index={3}
          label="Blocked Violations"
          value={data ? data.blockedRequests.toLocaleString() : "—"}
          hint={`Block rate: ${data?.blockRatePercent ?? 0}%`}
          accent={data && data.blockedRequests > 0 ? "rose" : "optimal"}
        />
        <TelemetryCell
          index={4}
          label="Violations (Last 24h)"
          value={data ? data.violations24h.toLocaleString() : "—"}
          hint="HTTP 429 rate limit triggers"
          accent={data && data.violations24h > 0 ? "amber" : "optimal"}
        />
      </TelemetryMatrix>

      {/* 4. Traffic Charts Section */}
      <Panel
        title="Traffic Analytics // Allowed vs. Blocked Requests"
        tag="ANALYTICS"
      >
        {data && data.chartData.length > 0 ? (
          <RateLimitCharts data={data.chartData} />
        ) : (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground font-mono">
            Loading traffic analytics…
          </div>
        )}
      </Panel>

      {/* 5. Rate Limit Configuration Tiers Matrix */}
      <Panel
        title="Endpoint Rate Limit Rules & Tiers"
        tag="SECURITY RULES"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#E5E5DF] bg-[#FAF9F6] text-[10px] uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="px-3 py-2.5 font-bold">Tier / Rule Name</th>
                <th className="px-3 py-2.5 font-bold">Endpoints Covered</th>
                <th className="px-3 py-2.5 font-bold text-center">Permitted Limit</th>
                <th className="px-3 py-2.5 font-bold text-center">Time Window</th>
                <th className="px-3 py-2.5 font-bold text-center">Throughput</th>
                <th className="px-3 py-2.5 font-bold text-center">Tier Status</th>
                <th className="px-3 py-2.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DF]">
              {data?.configs.map((config) => {
                const effectiveRate =
                  Math.round((config.max_requests / (config.window_seconds / 60)) * 10) / 10;

                return (
                  <tr key={config.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-bold text-carbon text-xs">{config.name}</div>
                      <div className="text-[10px] text-muted-foreground">{config.description}</div>
                    </td>
                    <td className="px-3 py-3 text-carbon font-semibold">
                      <code className="rounded-xs bg-[#FAF9F6] border border-[#E5E5DF] px-1.5 py-0.5 text-[11px] text-cobalt">
                        {config.endpoint_pattern}
                      </code>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-carbon">
                      {config.max_requests} req
                    </td>
                    <td className="px-3 py-3 text-center text-muted-foreground">
                      {config.window_seconds}s ({Math.round(config.window_seconds / 60)}m)
                    </td>
                    <td className="px-3 py-3 text-center text-cobalt font-semibold">
                      {effectiveRate} / min
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                          config.enabled
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-[#FAF9F6] text-muted-foreground border border-[#E5E5DF]"
                        }`}
                      >
                        {config.enabled ? "ACTIVE" : "BYPASSED"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingConfig(config)}
                        className="mono inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1 text-xs font-semibold text-carbon hover:border-cobalt hover:text-cobalt shadow-2xs transition-colors"
                      >
                        <Sliders className="h-3 w-3" />
                        <span>Configure</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 6. Recent Blocked Requests Audit Log */}
      <Panel
        title="Recent Rate Limit Violations Audit Log"
        tag="AUDIT STREAM"
      >
        <RateLimitRecentViolationsTable violations={data?.recentViolations ?? []} />
      </Panel>

      {/* 7. Dialogs */}
      <EditRateLimitConfigDialog
        config={editingConfig}
        isOpen={Boolean(editingConfig)}
        onClose={() => setEditingConfig(null)}
        onSave={handleSaveConfig}
      />

      <ResetStatsDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
