#!/usr/bin/env node
/**
 * Daily Website Health Report
 * ---------------------------
 * Pulls uptime, latency, SSL, RUM and error data from the Datadog API,
 * generates a corporate-style PDF, and emails it via SMTP.
 *
 * Required env vars:
 *   DD_API_KEY               Datadog API key
 *   DD_APP_KEY               Datadog Application key
 *   DD_SITE                  e.g. us5.datadoghq.com (default)
 *   DD_RUM_APPLICATION_ID    RUM application ID (optional, for RUM queries)
 *   SITE_DOMAIN              e.g. piyushprasad.in
 *   SMTP_HOST                e.g. smtp.gmail.com
 *   SMTP_PORT                e.g. 465
 *   SMTP_USER                sender email / SMTP username
 *   SMTP_PASS                SMTP password / app password
 *   REPORT_TO                recipient email address
 *   REPORT_FROM              (optional) from address, defaults to SMTP_USER
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  DD_API_KEY,
  DD_APP_KEY,
  DD_SITE = "us5.datadoghq.com",
  DD_RUM_APPLICATION_ID,
  SITE_DOMAIN = "piyushprasad.in",
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  REPORT_TO = "hello@piyushprasad.in",
  REPORT_FROM,
  ALERT_TO,
  SKIP_EMAIL,
} = process.env;

const SITE_URL = `https://${SITE_DOMAIN}`;
const BRAND = "Piyush Prasad";
const BRAND_TAGLINE = "Automated Website Health Monitoring";

const DD_BASE = `https://api.${DD_SITE}/api`;
const NOW = Math.floor(Date.now() / 1000);
const FROM = NOW - 24 * 60 * 60; // last 24h

// -------- Colors / theme --------
const COLORS = {
  navy: "#0B1E3F",
  cobalt: "#1A4BFF",
  ink: "#111111",
  muted: "#666666",
  line: "#E5E7EB",
  bg: "#F7F8FA",
  good: "#0F9D58",
  warn: "#F4B400",
  bad: "#DB4437",
};

// -------- Datadog helpers --------
async function dd(path, params = {}) {
  const url = new URL(`${DD_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: {
      "DD-API-KEY": DD_API_KEY,
      "DD-APPLICATION-KEY": DD_APP_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Datadog ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function ddQueryMetric(query) {
  try {
    const data = await dd("/v1/query", { from: FROM, to: NOW, query });
    const series = data.series?.[0];
    if (!series?.pointlist?.length) return null;
    const values = series.pointlist.map((p) => p[1]).filter((v) => v != null);
    if (!values.length) return null;
    return {
      values,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      last: values[values.length - 1],
      series,
    };
  } catch (e) {
    console.warn(`metric query failed: ${query} -> ${e.message}`);
    return null;
  }
}

async function ddRumQuery(query, aggregations = ["count"], groupBy = []) {
  if (!DD_RUM_APPLICATION_ID) return null;
  try {
    const body = {
      data: {
        attributes: {
          from: new Date(FROM * 1000).toISOString(),
          to: new Date(NOW * 1000).toISOString(),
          query: `@application.id:${DD_RUM_APPLICATION_ID} ${query}`.trim(),
          compute: aggregations.map((a) => ({ aggregation: a })),
          group_by: groupBy.map((g) => ({ facet: g, limit: 5, sort: { aggregation: "count", order: "desc" } })),
        },
        type: "aggregate_request",
      },
    };
    const res = await fetch(`${DD_BASE}/v2/rum/analytics/aggregate`, {
      method: "POST",
      headers: {
        "DD-API-KEY": DD_API_KEY,
        "DD-APPLICATION-KEY": DD_APP_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return await res.json();
  } catch (e) {
    console.warn(`RUM query failed: ${e.message}`);
    return null;
  }
}

// -------- Collect data --------
async function collect() {
  console.log("Fetching Datadog data...");

  // Synthetic uptime / response time / SSL
  const [uptime, respAvg, respMin, respMax, sslDays] = await Promise.all([
    ddQueryMetric(`avg:synthetics.test_runs{status:success,type:api,subtype:http,url:*${SITE_DOMAIN}*}.as_count() / avg:synthetics.test_runs{type:api,subtype:http,url:*${SITE_DOMAIN}*}.as_count() * 100`),
    ddQueryMetric(`avg:synthetics.http.response.time{url:*${SITE_DOMAIN}*}`),
    ddQueryMetric(`min:synthetics.http.response.time{url:*${SITE_DOMAIN}*}`),
    ddQueryMetric(`max:synthetics.http.response.time{url:*${SITE_DOMAIN}*}`),
    ddQueryMetric(`min:synthetics.ssl.days_before_expiration{*}`),
  ]);

  const failedChecks = await ddQueryMetric(
    `sum:synthetics.test_runs{status:failure,url:*${SITE_DOMAIN}*}.as_count()`,
  );

  // RUM traffic + errors
  const [sessions, visitors, browsers, devices, countries, jsErrors, replays, lcp, inp, cls] = await Promise.all([
    ddRumQuery("@type:session", ["count"]),
    ddRumQuery("@type:session", [{ aggregation: "cardinality", metric: "@usr.id" }].map(() => "count")),
    ddRumQuery("@type:session", ["count"], ["@browser.name"]),
    ddRumQuery("@type:session", ["count"], ["@device.type"]),
    ddRumQuery("@type:session", ["count"], ["@geo.country"]),
    ddRumQuery("@type:error", ["count"]),
    ddRumQuery("@type:session @session.has_replay:true", ["count"]),
    ddRumQuery("@type:view", [{ aggregation: "avg", metric: "@view.largest_contentful_paint" }].map(() => "avg")),
    ddRumQuery("@type:view", ["avg"]),
    ddRumQuery("@type:view", ["avg"]),
  ]);

  const total = (r) => r?.data?.buckets?.[0]?.computes?.c0 ?? null;
  const groups = (r) =>
    (r?.data?.buckets ?? []).map((b) => ({
      key: Object.values(b.by ?? {})[0] ?? "unknown",
      value: b.computes?.c0 ?? 0,
    }));

  const data = {
    generatedAt: new Date(),
    domain: SITE_DOMAIN,
    availability: {
      uptime: uptime?.avg ?? null,
      failedChecks: failedChecks?.values?.reduce((a, b) => a + b, 0) ?? 0,
      homepageOk: uptime?.avg == null ? null : uptime.avg > 99,
    },
    performance: {
      avg: respAvg?.avg ?? null,
      min: respMin?.min ?? null,
      max: respMax?.max ?? null,
      trend: respAvg?.values ?? [],
    },
    security: {
      sslDays: sslDays?.last ?? null,
      sslOk: sslDays?.last != null ? sslDays.last > 15 : null,
    },
    traffic: {
      sessions: total(sessions),
      visitors: total(visitors),
      browsers: groups(browsers),
      devices: groups(devices),
      countries: groups(countries),
    },
    appHealth: {
      jsErrors: total(jsErrors),
      replays: total(replays),
      lcp: total(lcp),
      inp: total(inp),
      cls: total(cls),
    },
  };
  data.healthScore = computeHealthScore(data);
  return data;
}

function computeHealthScore(d) {
  let score = 100;
  if (d.availability.uptime != null && d.availability.uptime < 99.9) {
    score -= Math.min(40, (99.9 - d.availability.uptime) * 10);
  }
  if (d.availability.failedChecks > 0) score -= Math.min(15, d.availability.failedChecks * 2);
  if (d.performance.avg != null && d.performance.avg > 500) {
    score -= Math.min(20, (d.performance.avg - 500) / 50);
  }
  if (d.security.sslDays != null && d.security.sslDays < 30) score -= 10;
  if (d.appHealth.jsErrors) score -= Math.min(15, d.appHealth.jsErrors);
  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade =
    score >= 95 ? "Excellent" : score >= 85 ? "Healthy" : score >= 70 ? "Fair" : score >= 50 ? "At Risk" : "Critical";
  return { value: score, grade, summary: "Based on uptime, latency, SSL, and errors" };
}

// -------- PDF rendering --------
function fmt(v, suffix = "", digits = 2) {
  if (v == null || Number.isNaN(v)) return "N/A";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return `${n.toFixed(digits)}${suffix}`;
}
function fmtInt(v) {
  if (v == null) return "N/A";
  return Math.round(Number(v)).toLocaleString();
}

function buildSummary(d) {
  const parts = [];
  const up = d.availability.uptime;
  if (up != null) {
    parts.push(
      up >= 99.9
        ? `The site maintained excellent availability at ${up.toFixed(2)}% uptime over the last 24 hours.`
        : up >= 99
          ? `Availability was healthy at ${up.toFixed(2)}%, with minor variability worth monitoring.`
          : `Availability dipped to ${up.toFixed(2)}%, indicating incidents that require investigation.`,
    );
  }
  if (d.performance.avg != null) {
    parts.push(
      d.performance.avg < 500
        ? `Average response time was fast at ${Math.round(d.performance.avg)} ms.`
        : d.performance.avg < 1500
          ? `Average response time was acceptable at ${Math.round(d.performance.avg)} ms.`
          : `Average response time was elevated at ${Math.round(d.performance.avg)} ms and should be reviewed.`,
    );
  }
  if (d.security.sslDays != null) {
    parts.push(
      d.security.sslDays > 30
        ? `SSL certificate is healthy (${Math.floor(d.security.sslDays)} days until expiry).`
        : `SSL certificate expires in ${Math.floor(d.security.sslDays)} days — renewal window approaching.`,
    );
  }
  if (d.appHealth.jsErrors != null) {
    parts.push(
      d.appHealth.jsErrors === 0
        ? `No client-side JavaScript errors were reported.`
        : `${fmtInt(d.appHealth.jsErrors)} client-side errors were captured by RUM.`,
    );
  }
  if (d.traffic.sessions != null) {
    parts.push(`RUM recorded ${fmtInt(d.traffic.sessions)} sessions in the last 24 hours.`);
  }
  return parts.join(" ");
}

function renderPDF(data, outPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    // ---- Header band with brand monogram ----
    doc.rect(0, 0, doc.page.width, 110).fill(COLORS.navy);
    // Monogram badge
    doc.circle(85, 55, 26).fill(COLORS.cobalt);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(20)
      .text("PP", 65, 44, { width: 40, align: "center" });
    // Title block
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(20)
      .text("Daily Website Health Report", 130, 32);
    doc.font("Helvetica").fontSize(10).fillColor("#C7D2FE")
      .text(`${BRAND} · ${BRAND_TAGLINE}`, 130, 58);
    doc.font("Helvetica").fontSize(9).fillColor("#9CA8D6")
      .text(`${SITE_URL}  ·  ${data.generatedAt.toUTCString()}`, 130, 74);

    doc.fillColor(COLORS.ink);

    // ---- Health score hero card ----
    const score = data.healthScore;
    const scoreColor = score.value >= 90 ? COLORS.good : score.value >= 70 ? COLORS.warn : COLORS.bad;
    doc.roundedRect(50, 130, doc.page.width - 100, 70, 6).fill(COLORS.bg);
    doc.roundedRect(50, 130, 6, 70, 3).fill(scoreColor);
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9)
      .text("OVERALL HEALTH SCORE", 70, 142);
    doc.fillColor(scoreColor).font("Helvetica-Bold").fontSize(34)
      .text(`${score.value}`, 70, 156, { continued: true })
      .fillColor(COLORS.muted).fontSize(14).text("  / 100");
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(11)
      .text(score.grade, doc.page.width - 200, 148, { width: 140, align: "right" });
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9)
      .text(score.summary, doc.page.width - 260, 168, { width: 200, align: "right" });

    // ---- Meta table ----
    const metaY = 215;
    const meta = [
      ["Domain", SITE_URL],
      ["Hosting Provider", "Vercel"],
      ["Monitoring Platform", "Datadog (RUM + Synthetics)"],
      ["Report Generated", data.generatedAt.toISOString()],
    ];
    drawKvTable(doc, meta, 50, metaY, doc.page.width - 100);

    let y = metaY + meta.length * 22 + 20;

    // Executive summary
    y = section(doc, "Executive Summary", y);
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.ink)
      .text(buildSummary(data), 50, y, { width: doc.page.width - 100, lineGap: 3 });
    y = doc.y + 15;

    // Availability
    y = section(doc, "Availability", y);
    y = drawKvTable(
      doc,
      [
        ["Website Status", statusText(data.availability.uptime)],
        ["Uptime Percentage", fmt(data.availability.uptime, "%")],
        ["Downtime Incidents", fmtInt(data.availability.failedChecks)],
        ["Failed Checks (24h)", fmtInt(data.availability.failedChecks)],
        ["Homepage Availability", data.availability.homepageOk == null ? "N/A" : data.availability.homepageOk ? "Healthy" : "Degraded"],
      ],
      50,
      y,
      doc.page.width - 100,
    );
    y += 15;

    // Performance
    y = section(doc, "Performance", y);
    y = drawKvTable(
      doc,
      [
        ["Average Response Time", fmt(data.performance.avg, " ms", 0)],
        ["Fastest Response", fmt(data.performance.min, " ms", 0)],
        ["Slowest Response", fmt(data.performance.max, " ms", 0)],
      ],
      50,
      y,
      doc.page.width - 100,
    );
    if (data.performance.trend?.length) {
      y += 10;
      drawSparkline(doc, data.performance.trend, 50, y, doc.page.width - 100, 60);
      y += 70;
    }

    // Security
    y = section(doc, "Security", y);
    y = drawKvTable(
      doc,
      [
        ["SSL Certificate Status", data.security.sslOk == null ? "N/A" : data.security.sslOk ? "Valid" : "Renewal Due"],
        ["Days Until SSL Expiry", data.security.sslDays == null ? "N/A" : `${Math.floor(data.security.sslDays)} days`],
      ],
      50,
      y,
      doc.page.width - 100,
    );
    y += 15;

    if (y > doc.page.height - 200) {
      doc.addPage();
      y = 50;
    }

    // Traffic
    y = section(doc, "Traffic (RUM, last 24h)", y);
    y = drawKvTable(
      doc,
      [
        ["Total Sessions", fmtInt(data.traffic.sessions)],
        ["Unique Visitors", fmtInt(data.traffic.visitors)],
      ],
      50,
      y,
      doc.page.width - 100,
    );
    y += 10;
    y = drawList(doc, "Top Browsers", data.traffic.browsers, 50, y);
    y = drawList(doc, "Device Distribution", data.traffic.devices, 50, y);
    y = drawList(doc, "Top Countries", data.traffic.countries, 50, y);

    if (y > doc.page.height - 200) {
      doc.addPage();
      y = 50;
    }

    // App Health
    y = section(doc, "Application Health", y);
    drawKvTable(
      doc,
      [
        ["JavaScript Errors", fmtInt(data.appHealth.jsErrors)],
        ["Session Replays", fmtInt(data.appHealth.replays)],
        ["LCP (avg)", data.appHealth.lcp == null ? "N/A" : `${Math.round(data.appHealth.lcp)} ms`],
        ["INP (avg)", data.appHealth.inp == null ? "N/A" : `${Math.round(data.appHealth.inp)} ms`],
        ["CLS (avg)", data.appHealth.cls == null ? "N/A" : data.appHealth.cls.toFixed(3)],
      ],
      50,
      y,
      doc.page.width - 100,
    );

    // Page numbers + footer
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted).text(
        `${data.domain}  •  Generated by Datadog automated reporting  •  Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 35,
        { width: doc.page.width - 100, align: "center" },
      );
    }

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function statusText(uptime) {
  if (uptime == null) return "N/A";
  if (uptime >= 99.9) return "Operational";
  if (uptime >= 99) return "Minor Issues";
  return "Degraded";
}

function section(doc, title, y) {
  if (y > doc.page.height - 120) {
    doc.addPage();
    y = 50;
  }
  doc.rect(50, y, doc.page.width - 100, 24).fill(COLORS.cobalt);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(12)
    .text(title.toUpperCase(), 60, y + 7);
  doc.fillColor(COLORS.ink);
  return y + 34;
}

function drawKvTable(doc, rows, x, y, width) {
  const rowH = 22;
  rows.forEach((r, i) => {
    if (i % 2 === 0) {
      doc.rect(x, y + i * rowH, width, rowH).fill(COLORS.bg);
    }
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10)
      .text(r[0], x + 12, y + i * rowH + 6, { width: width * 0.5 });
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(10)
      .text(String(r[1]), x + width * 0.5, y + i * rowH + 6, { width: width * 0.5 - 12, align: "right" });
  });
  doc.strokeColor(COLORS.line).lineWidth(0.5)
    .rect(x, y, width, rows.length * rowH).stroke();
  return y + rows.length * rowH + 8;
}

function drawList(doc, title, items, x, y) {
  if (!items?.length) {
    doc.fillColor(COLORS.muted).font("Helvetica-Oblique").fontSize(10)
      .text(`${title}: no data`, x, y);
    return y + 16;
  }
  doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(11).text(title, x, y);
  y += 16;
  const total = items.reduce((a, b) => a + (b.value || 0), 0) || 1;
  items.slice(0, 5).forEach((it) => {
    const pct = ((it.value / total) * 100).toFixed(1);
    doc.fillColor(COLORS.ink).font("Helvetica").fontSize(10)
      .text(`${it.key}`, x + 10, y, { continued: true })
      .fillColor(COLORS.muted)
      .text(`   ${fmtInt(it.value)} (${pct}%)`);
    y += 14;
  });
  return y + 6;
}

function drawSparkline(doc, values, x, y, w, h) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  doc.rect(x, y, w, h).fill(COLORS.bg);
  doc.strokeColor(COLORS.cobalt).lineWidth(1.5);
  values.forEach((v, i) => {
    const px = x + (i / (values.length - 1 || 1)) * w;
    const py = y + h - ((v - min) / range) * (h - 10) - 5;
    if (i === 0) doc.moveTo(px, py);
    else doc.lineTo(px, py);
  });
  doc.stroke();
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8)
    .text(`Response time trend (min ${Math.round(min)}ms — max ${Math.round(max)}ms)`, x + 6, y + h - 12);
}

// -------- Email --------
async function sendEmail(pdfPath, data) {
  if (SKIP_EMAIL === "1" || !SMTP_HOST || !SMTP_USER || !SMTP_PASS || !REPORT_TO) {
    console.log("Skipping email (SMTP env not set or SKIP_EMAIL=1).");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: Number(SMTP_PORT || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const date = data.generatedAt.toISOString().slice(0, 10);
  await transporter.sendMail({
    from: REPORT_FROM || SMTP_USER,
    to: REPORT_TO,
    subject: `Daily Website Health Report — ${data.domain} — ${date}`,
    text: buildSummary(data),
    attachments: [{ filename: path.basename(pdfPath), path: pdfPath }],
  });
  console.log(`Email sent to ${REPORT_TO}`);
}

// -------- Main --------
(async () => {
  const data = await collect();
  const date = data.generatedAt.toISOString().slice(0, 10);
  const outDir = path.join(__dirname, "..", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `Daily-Website-Report-${date}.pdf`);
  await renderPDF(data, outPath);
  console.log(`PDF written: ${outPath}`);
  await sendEmail(outPath, data);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
