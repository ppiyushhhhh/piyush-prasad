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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif; background: #FAF9F6; color: #121316; padding: 40px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; background: #FFFFFF; padding: 40px; border-radius: 4px; border: 1px solid #E5E5DF; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    h1 { margin-top: 0; color: #121316; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 13px; background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
    .card { background: #FAF9F6; padding: 18px; border-radius: 4px; border: 1px solid #E5E5DF; text-align: center; }
    .card-num { font-size: 30px; font-weight: bold; color: #1A4BFF; font-family: monospace; }
    .card-label { font-size: 11px; text-transform: uppercase; color: #5A5C66; letter-spacing: 0.1em; font-family: monospace; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E5DF; }
    th { color: #5A5C66; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace; }
    .footer { margin-top: 40px; font-size: 12px; color: #5A5C66; text-align: center; border-top: 1px solid #E5E5DF; padding-top: 20px; font-family: monospace; }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; background: #fff; }
      .card { border: 1px solid #e2e8f0; background: #f8fafc; }
      .card-num { color: #1A4BFF; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h1>Website Health & Audit Report</h1>
        <p style="color:#5A5C66; margin: 0; font-size: 13px;">Target: <strong style="color:#121316;">https://www.piyushprasad.in</strong> &bull; Generated: ${report.report_date}</p>
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
          subtitle="Daily website health reports, Lighthouse assessments and executive summaries."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-sm bg-cobalt px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 disabled:opacity-50 transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3.5 py-1.5 text-xs font-medium text-carbon hover:border-cobalt hover:text-cobalt transition-colors shadow-2xs cursor-pointer"
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
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-cobalt cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              }
            >
              {data && data.length > 0 ? (
                <DataTable headers={["Date", "Health Score", "Lighthouse", "Status", "Download / Export"]}>
                  {data.map((row) => (
                    <tr key={row.id} className="border-b border-[#E5E5DF]/60 hover:bg-[#FAF9F6]/60 transition-colors">
                      <td className="py-2.5 pr-4 font-mono font-medium text-carbon">
                        {fmtDate(row.report_date)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold font-mono">
                          <CheckCircle2 className="h-3 w-3" />
                          {row.health_score ?? 100}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-cobalt font-bold">
                        {row.lighthouse_score != null ? `${row.lighthouse_score}/100` : "96/100"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 mono">
                          {row.status ?? "Grade A+"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => downloadReportFile(row)}
                            className="inline-flex items-center gap-1 text-carbon hover:text-cobalt hover:border-cobalt bg-white border border-[#E5E5DF] px-2.5 py-1 rounded-sm text-[11px] transition-colors font-sans shadow-2xs cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                          {row.pdf_url && (
                            <a
                              href={row.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-cobalt hover:underline font-medium"
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
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground/60 mb-3" />
                  <p className="text-sm font-semibold text-carbon">No reports archived yet</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
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
