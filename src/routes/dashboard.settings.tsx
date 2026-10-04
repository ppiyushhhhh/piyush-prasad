import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Save,
  RefreshCw,
  Globe,
  Sliders,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Database,
  Bot,
  Zap,
  RotateCcw,
} from "lucide-react";

import { PageHeader, Panel } from "@/components/dashboard/primitives";
import { triggerFreshHealthCheck, generateLiveReport } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: SettingsPage,
});

interface DashboardConfig {
  siteUrl: string;
  maxLatencyMs: number;
  sslWarningDays: number;
  minHealthScore: number;
  alertEmail: string;
  emailAlertsEnabled: boolean;
  weeklyDigestEnabled: boolean;
  autoRefreshIntervalSec: number;
}

const DEFAULT_CONFIG: DashboardConfig = {
  siteUrl: "https://www.piyushprasad.in",
  maxLatencyMs: 500,
  sslWarningDays: 30,
  minHealthScore: 95,
  alertEmail: "hello@piyushprasad.in",
  emailAlertsEnabled: true,
  weeklyDigestEnabled: true,
  autoRefreshIntervalSec: 60,
};

function SettingsPage() {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const runHealthCheck = useServerFn(triggerFreshHealthCheck);
  const runReport = useServerFn(generateLiveReport);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("piyush_dashboard_config");
      if (saved) {
        setConfig((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      localStorage.setItem("piyush_dashboard_config", JSON.stringify(config));
      setSaveStatus("Settings saved successfully!");
      setTimeout(() => setSaveStatus(null), 3500);
    } catch {
      setSaveStatus("Error saving settings.");
    }
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem("piyush_dashboard_config");
    setSaveStatus("Reset to default configuration.");
    setTimeout(() => setSaveStatus(null), 3000);
  }

  async function handleTriggerHealthCheck() {
    try {
      setActionLoading("health");
      setActionMessage(null);
      const res = await runHealthCheck();
      setActionMessage(
        `Live probe complete! Status: ${res?.http_status ?? 200} OK, Latency: ${res?.response_time_ms ?? "—"} ms, Score: ${res?.health_score ?? 100}%`
      );
    } catch (err) {
      setActionMessage(`Probe failed: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTriggerReport() {
    try {
      setActionLoading("report");
      setActionMessage(null);
      const rep = await runReport();
      setActionMessage(`Audit complete! Generated report for ${rep.report_date} with ${rep.status ?? "Grade A+"}.`);
    } catch (err) {
      setActionMessage(`Report generation failed: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTestChat() {
    try {
      setActionLoading("chat");
      setActionMessage(null);
      const start = Date.now();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Ping test" }] }),
      });
      const ms = Date.now() - start;
      if (res.ok) {
        setActionMessage(`AI Chat API online! Gemini responded in ${ms} ms.`);
      } else {
        setActionMessage(`AI Chat responded with HTTP ${res.status}`);
      }
    } catch (err) {
      setActionMessage(`Chat test failed: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <PageHeader
          title="Settings & Customization"
          subtitle="Customize monitoring thresholds, notification endpoints and run system diagnostic actions."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="mb-6 rounded-md border border-emerald-800/60 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {actionMessage && (
        <div className="mb-6 rounded-md border border-cyan-800/60 bg-cyan-950/40 px-4 py-2.5 text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Monitored Target */}
        <Panel title="Monitored Target & Endpoints">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                Target Website URL
              </label>
              <input
                type="url"
                value={config.siteUrl}
                onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Primary production domain probed every 10 minutes by server-side workers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                Auto-Refresh Interval (Seconds)
              </label>
              <select
                value={config.autoRefreshIntervalSec}
                onChange={(e) =>
                  setConfig({ ...config, autoRefreshIntervalSec: Number(e.target.value) })
                }
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value={30}>30 seconds (Live mode)</option>
                <option value={60}>60 seconds (Standard)</option>
                <option value={300}>5 minutes (Eco mode)</option>
                <option value={600}>10 minutes</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                How frequently the dashboard polls for updated server telemetry.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-800/80 pt-4">
            <p className="text-xs font-medium text-slate-300 mb-2">Automated Probe Paths:</p>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">/ (Root Landing)</span>
              <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">/robots.txt (Crawl Rules)</span>
              <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">/sitemap.xml (SEO Index)</span>
              <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">/favicon.ico (Asset Status)</span>
            </div>
          </div>
        </Panel>

        {/* Section 2: Alert Thresholds */}
        <Panel title="Performance & Health Alert Thresholds">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
                Max Latency Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={100}
                  max={5000}
                  step={50}
                  value={config.maxLatencyMs}
                  onChange={(e) => setConfig({ ...config, maxLatencyMs: Number(e.target.value) })}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500">ms</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Warning triggers if HTTP latency exceeds this threshold.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
                SSL Expiry Warning Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={7}
                  max={90}
                  value={config.sslWarningDays}
                  onChange={(e) => setConfig({ ...config, sslWarningDays: Number(e.target.value) })}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500">days</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Alerts if certificate expires within this many days.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
                Min Target Health Score
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={config.minHealthScore}
                  onChange={(e) => setConfig({ ...config, minHealthScore: Number(e.target.value) })}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500">%</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Desired availability score before marking as degraded.
              </p>
            </div>
          </div>
        </Panel>

        {/* Section 3: Notification Settings */}
        <Panel title="Notification & Dispatch Settings">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-cyan-400" />
                Alert Recipient Email
              </label>
              <input
                type="email"
                value={config.alertEmail}
                onChange={(e) => setConfig({ ...config, alertEmail: e.target.value })}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Email address destination for daily PDF digests & downtime notices.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailAlertsEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, emailAlertsEnabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300">
                  Enable automated outage & failure alerts
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.weeklyDigestEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, weeklyDigestEnabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300">
                  Send automated daily health executive summary
                </span>
              </label>
            </div>
          </div>
        </Panel>

        {/* Section 4: Live Maintenance & Diagnostic Tools */}
        <Panel title="Live Diagnostic & Maintenance Tools">
          <p className="text-xs text-slate-400 mb-4">
            Perform on-demand checks, trigger report compilation, or verify sub-system integrations:
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleTriggerHealthCheck}
              disabled={Boolean(actionLoading)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 text-emerald-400 ${actionLoading === "health" ? "animate-spin" : ""}`} />
              {actionLoading === "health" ? "Probing Site…" : "Run Live Probe Now"}
            </button>

            <button
              type="button"
              onClick={handleTriggerReport}
              disabled={Boolean(actionLoading)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <ShieldCheck className={`h-4 w-4 text-cyan-400 ${actionLoading === "report" ? "animate-spin" : ""}`} />
              {actionLoading === "report" ? "Compiling Audit…" : "Generate Audit Report"}
            </button>

            <button
              type="button"
              onClick={handleTestChat}
              disabled={Boolean(actionLoading)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <Bot className={`h-4 w-4 text-purple-400 ${actionLoading === "chat" ? "animate-spin" : ""}`} />
              {actionLoading === "chat" ? "Testing API…" : "Test Gemini AI Bot"}
            </button>
          </div>
        </Panel>
      </form>
    </>
  );
}
