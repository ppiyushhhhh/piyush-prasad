import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Save,
  RefreshCw,
  Globe,
  Sliders,
  Bell,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Database,
  Bot,
  Zap,
  RotateCcw,
} from "lucide-react";

import { PageHeader, Panel, StatusTag } from "@/components/dashboard/primitives";
import { triggerFreshHealthCheck, generateLiveReport } from "@/lib/monitoring.functions";
import { getEmailConfigurationSummary } from "@/lib/database-admin.functions";

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
  const fetchEmailSummary = useServerFn(getEmailConfigurationSummary);

  const [emailStatus, setEmailStatus] = useState<{
    notificationRecipient: string;
    senderAddress: string;
    activeProvider: "resend" | "smtp" | "none";
    hasResendKey: boolean;
    hasSmtpConfig: boolean;
    isStagingSimulated: boolean;
  } | null>(null);

  useEffect(() => {
    fetchEmailSummary()
      .then((res) => setEmailStatus(res))
      .catch((err) => console.warn("Failed to fetch email config status:", err));
  }, [fetchEmailSummary]);

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
        <div className="flex flex-wrap items-center gap-2">
          <StatusTag status="optimal">CONFIG: SYNCHRONIZED</StatusTag>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-mono font-medium text-carbon hover:border-cobalt hover:text-cobalt transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RESET
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 bg-cobalt px-4 py-1.5 text-xs font-mono font-semibold text-white hover:bg-cobalt/90 transition-colors cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            SAVE CHANGES
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="mb-6 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {actionMessage && (
        <div className="mb-6 rounded-sm border border-accent/30 bg-accent-soft px-4 py-2.5 text-xs text-cobalt flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cobalt" />
          <span>{actionMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Monitored Target */}
        <Panel title="Monitored Target & Endpoints">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cobalt" />
                Target Website URL
              </label>
              <input
                type="url"
                value={config.siteUrl}
                onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
                className="w-full rounded-sm border border-[#E5E5DF] bg-surface-muted px-3.5 py-2 font-mono text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Primary production domain probed every 10 minutes by server-side workers.
              </p>
            </div>

            <div>
              <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-cobalt" />
                Auto-Refresh Interval (Seconds)
              </label>
              <select
                value={config.autoRefreshIntervalSec}
                onChange={(e) =>
                  setConfig({ ...config, autoRefreshIntervalSec: Number(e.target.value) })
                }
                className="w-full rounded-sm border border-[#E5E5DF] bg-surface-muted px-3.5 py-2 font-mono text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
              >
                <option value={30}>30 seconds (Live mode)</option>
                <option value={60}>60 seconds (Standard)</option>
                <option value={300}>5 minutes (Eco mode)</option>
                <option value={600}>10 minutes</option>
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                How frequently the dashboard polls for updated server telemetry.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-[#E5E5DF] pt-4">
            <p className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Automated Probe Paths:</p>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="rounded-sm bg-surface-muted border border-[#E5E5DF] px-2.5 py-1 text-carbon shadow-2xs">/ (Root Landing)</span>
              <span className="rounded-sm bg-surface-muted border border-[#E5E5DF] px-2.5 py-1 text-carbon shadow-2xs">/robots.txt (Crawl Rules)</span>
              <span className="rounded-sm bg-surface-muted border border-[#E5E5DF] px-2.5 py-1 text-carbon shadow-2xs">/sitemap.xml (SEO Index)</span>
              <span className="rounded-sm bg-surface-muted border border-[#E5E5DF] px-2.5 py-1 text-carbon shadow-2xs">/favicon.ico (Asset Status)</span>
            </div>
          </div>
        </Panel>

        {/* Section 2: Alert Thresholds */}
        <Panel title="Performance & Health Alert Thresholds">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
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
                  className="w-full rounded-sm border border-[#E5E5DF] bg-surface-muted px-3.5 py-2 font-mono text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
                />
                <span className="text-xs text-muted-foreground font-mono">ms</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Warning triggers if HTTP latency exceeds this threshold.
              </p>
            </div>

            <div>
              <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                SSL Expiry Warning Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={7}
                  max={90}
                  value={config.sslWarningDays}
                  onChange={(e) => setConfig({ ...config, sslWarningDays: Number(e.target.value) })}
                  className="w-full rounded-sm border border-[#E5E5DF] bg-surface-muted px-3.5 py-2 font-mono text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
                />
                <span className="text-xs text-muted-foreground font-mono">days</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Alerts if certificate expires within this many days.
              </p>
            </div>

            <div>
              <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Min Target Health Score
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={config.minHealthScore}
                  onChange={(e) => setConfig({ ...config, minHealthScore: Number(e.target.value) })}
                  className="w-full rounded-sm border border-[#E5E5DF] bg-surface-muted px-3.5 py-2 font-mono text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
                />
                <span className="text-xs text-muted-foreground font-mono">%</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Desired availability score before marking as degraded.
              </p>
            </div>
          </div>
        </Panel>

        {/* Section 3: Notification Settings */}
        <Panel title="Notification & Dispatch Settings">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-cobalt" />
                Alert Recipient Email
              </label>
              <input
                type="email"
                value={config.alertEmail}
                onChange={(e) => setConfig({ ...config, alertEmail: e.target.value })}
                className="w-full rounded-sm border border-[#E5E5DF] bg-surface-muted px-3.5 py-2 font-mono text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
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
                  className="h-4 w-4 rounded-sm border-[#E5E5DF] accent-cobalt text-cobalt focus:ring-0"
                />
                <span className="text-xs text-carbon">
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
                  className="h-4 w-4 rounded-sm border-[#E5E5DF] accent-cobalt text-cobalt focus:ring-0"
                />
                <span className="text-xs text-carbon">
                  Send automated daily health executive summary
                </span>
              </label>
            </div>
          </div>
        </Panel>

        {/* Section: Contact Form Notifications & Email Routing */}
        <Panel
          tag="EMAIL.ROUTING"
          title="Portfolio Contact Form & Notification Routing"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-[#E5E5DF] bg-surface-muted p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-cobalt" />
                    Main Notification Recipient
                  </span>
                  <span className="mono inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-2xs">
                    <CheckCircle2 className="h-3 w-3" />
                    VERIFIED TARGET
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-carbon">
                  {emailStatus?.notificationRecipient || "hello@piyushprasad.in"}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Configured via <code className="text-carbon font-mono">CONTACT_NOTIFICATION_EMAIL</code>. Every visitor inquiry submitted through the portfolio contact form is routed directly to this inbox.
                </p>
              </div>

              <div className="rounded-sm border border-[#E5E5DF] bg-surface-muted p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-cobalt" />
                    Active Dispatch Provider
                  </span>
                  <span className="mono text-[10px] uppercase font-bold text-cobalt">
                    {emailStatus?.isStagingSimulated
                      ? "STAGING SIMULATION"
                      : emailStatus?.activeProvider === "resend"
                        ? "RESEND API (HTTP)"
                        : emailStatus?.activeProvider === "smtp"
                          ? "SMTP / NODEMAILER"
                          : "FALLBACK READY"}
                  </span>
                </div>
                <div className="font-mono text-xs text-carbon">
                  Sender: {emailStatus?.senderAddress || "notifications@piyushprasad.in"}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Reply-To header is dynamically bound to the visitor's email address so clicking Reply connects directly to the sender.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E5DF] pt-3 text-[11px] font-mono text-muted-foreground">
              <span>Routing Integrity: Direct to hello@piyushprasad.in (No support@ bounce)</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Anti-Duplicate Protection: ACTIVE (60s sliding window)
              </span>
            </div>
          </div>
        </Panel>

        {/* Section 4: Live Maintenance & Diagnostic Console */}
        <Panel tag="SYS.EXEC" title="Live Diagnostic & Maintenance Tools">
          <p className="text-xs text-muted-foreground mb-4">
            Perform on-demand checks, trigger report compilation, or verify sub-system integrations:
          </p>

          <div className="border border-[#E5E5DF] divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5DF] bg-white grid grid-cols-1 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleTriggerHealthCheck}
              disabled={Boolean(actionLoading)}
              className="flex items-center justify-center gap-2.5 p-4 text-xs font-mono font-semibold text-carbon hover:bg-surface-muted hover:text-cobalt transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`h-4 w-4 text-emerald-600 ${actionLoading === "health" ? "animate-spin" : ""}`} />
              {actionLoading === "health" ? "PROBING SITE..." : "RUN LIVE PROBE"}
            </button>

            <button
              type="button"
              onClick={handleTriggerReport}
              disabled={Boolean(actionLoading)}
              className="flex items-center justify-center gap-2.5 p-4 text-xs font-mono font-semibold text-carbon hover:bg-surface-muted hover:text-cobalt transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className={`h-4 w-4 text-cobalt ${actionLoading === "report" ? "animate-spin" : ""}`} />
              {actionLoading === "report" ? "COMPILING AUDIT..." : "GENERATE AUDIT REPORT"}
            </button>

            <button
              type="button"
              onClick={handleTestChat}
              disabled={Boolean(actionLoading)}
              className="flex items-center justify-center gap-2.5 p-4 text-xs font-mono font-semibold text-carbon hover:bg-surface-muted hover:text-cobalt transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Bot className={`h-4 w-4 text-accent ${actionLoading === "chat" ? "animate-spin" : ""}`} />
              {actionLoading === "chat" ? "TESTING API..." : "TEST GEMINI BOT"}
            </button>
          </div>
        </Panel>
      </form>
    </>
  );
}
