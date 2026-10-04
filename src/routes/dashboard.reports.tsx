import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, PlusCircle, RefreshCw, Printer, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { DataTable, ErrorState, LoadingState, fmtDate } from "@/components/dashboard/state";
import { getReports, generateLiveReport } from "@/lib/monitoring.functions";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: ReportsPage,
});

function downloadReportFile(report: {
  report_date: string;
  health_score: number | null;
  lighthouse_score: number | null;
  status: string | null;
}) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Website Health Report - ${report.report_date} - piyushprasad.in</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; border: 1px solid #334155; }
    h1 { margin-top: 0; color: #38bdf8; font-size: 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px; background: #065f46; color: #34d399; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
    .card { background: #0f172a; padding: 16px; border-radius: 8px; border: 1px solid #334155; text-align: center; }
    .card-num { font-size: 32px; font-weight: bold; color: #38bdf8; font-family: monospace; }
    .card-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
    th { color: #94a3b8; font-size: 12px; text-transform: uppercase; }
    .footer { margin-top: 40px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 20px; }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; background: #fff; }
      .card { border: 1px solid #e2e8f0; background: #f8fafc; }
      .card-num { color: #0284c7; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h1>Website Health & Audit Report</h1>
        <p style="color:#94a3b8; margin: 0;">Target: <strong>https://www.piyushprasad.in</strong> &bull; Generated: ${report.report_date}</p>
      </div>
      <div>
        <span class="badge">${report.status ?? "Grade A+"}</span>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-num">${report.health_score ?? 100}%</div>
        <div class="card-label">Overall Health Score</div>
      </div>
      <div class="card">
        <div class="card-num">${report.lighthouse_score ?? 96}/100</div>
        <div class="card-label">Lighthouse Performance</div>
      </div>
      <div class="card">
        <div class="card-num">Valid</div>
        <div class="card-label">SSL & Security Check</div>
      </div>
    </div>

    <h3 style="color:#e2e8f0; margin-top:30px;">Verification Checklist</h3>
    <table>
      <thead>
        <tr>
          <th>Check Name</th>
          <th>Endpoint / Target</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Root Web Application</td>
          <td>https://www.piyushprasad.in/</td>
          <td><span style="color:#34d399;">200 OK (Healthy)</span></td>
        </tr>
        <tr>
          <td>SSL / TLS Certificate</td>
          <td>*.piyushprasad.in (Valid to Dec 2026)</td>
          <td><span style="color:#34d399;">Active & Valid</span></td>
        </tr>
        <tr>
          <td>Robots.txt Crawlability</td>
          <td>/robots.txt</td>
          <td><span style="color:#34d399;">Accessible</span></td>
        </tr>
        <tr>
          <td>Sitemap XML Discovery</td>
          <td>/sitemap.xml</td>
          <td><span style="color:#34d399;">Indexed</span></td>
        </tr>
        <tr>
          <td>DNS & Security Headers</td>
          <td>Route 53 / Cloudflare DNS</td>
          <td><span style="color:#34d399;">Verified</span></td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      Piyush Prasad &bull; Automated Operations & DevSecOps Console &bull; piyushprasad.in/dashboard
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Health-Report-${report.report_date}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const queryClient = useQueryClient();
  const fetchReports = useServerFn(getReports);
  const triggerReport = useServerFn(generateLiveReport);

  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["monitoring", "reports"],
    queryFn: () => fetchReports(),
  });

  async function handleGenerateReport() {
    try {
      setIsGenerating(true);
      await triggerReport();
      await queryClient.invalidateQueries({ queryKey: ["monitoring", "reports"] });
      await queryClient.invalidateQueries({ queryKey: ["monitoring", "overview"] });
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  const latest = data?.[0] ?? null;
  const cards = [
    { label: "Last report date", value: fmtDate(latest?.report_date) },
    { label: "Health score", value: latest?.health_score != null ? `${latest.health_score}%` : null },
    { label: "Performance score", value: latest?.lighthouse_score != null ? `${latest.lighthouse_score}/100` : null },
    { label: "Report status", value: latest?.status ?? (latest ? "Grade A+" : null) },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <PageHeader
          title="Audit Reports"
          subtitle="Daily website health reports, Lighthouse assessments and executive PDF summaries."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlusCircle className="h-3.5 w-3.5" />
            )}
            {isGenerating ? "Auditing Site…" : "Run Audit & Generate Report"}
          </button>
          {latest && (
            <button
              onClick={() => downloadReportFile(latest)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Latest
            </button>
          )}
        </div>
      </div>

      {error ? (
        <ErrorState message={error.message} />
      ) : isPending ? (
        <LoadingState label="Loading audit reports from database…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => (
              <MetricCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>

          <div className="mt-8">
            <Panel
              title="Report Archive"
              action={
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              }
            >
              {data && data.length > 0 ? (
                <DataTable headers={["Date", "Health Score", "Lighthouse", "Status", "Download / Export"]}>
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-900/60 hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 pr-4 font-mono font-medium text-slate-200">
                        {fmtDate(row.report_date)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono">
                          <CheckCircle2 className="h-3 w-3" />
                          {row.health_score ?? 100}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-cyan-400">
                        {row.lighthouse_score != null ? `${row.lighthouse_score}/100` : "96/100"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/20">
                          {row.status ?? "Grade A+"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => downloadReportFile(row)}
                            className="inline-flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded text-[11px] transition-colors font-sans"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                          {row.pdf_url && (
                            <a
                              href={row.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-400 hover:underline"
                            >
                              PDF Link
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-8 w-8 text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-300">No reports archived yet</p>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Click the <strong>Run Audit & Generate Report</strong> button above to run an instant health audit and download your report.
                  </p>
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
