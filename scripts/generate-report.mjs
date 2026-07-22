#!/usr/bin/env node
/**
 * Daily Website Health Report
 * ---------------------------------------------------
 * Collects uptime, HTTP status, response time, SSL, DNS, common asset
 * availability (robots.txt / sitemap.xml / favicon), and Lighthouse audit
 * scores for a site — then renders a professional PDF via PDFKit and emails
 * it with Nodemailer.
 *
 * Env vars:
 *   SITE_DOMAIN   e.g. piyushprasad.in           (required)
 *   SMTP_HOST     e.g. smtp.gmail.com            (required for email)
 *   SMTP_PORT     e.g. 465                       (required for email)
 *   SMTP_USER     SMTP username / sender         (required for email)
 *   SMTP_PASS     SMTP password / app password   (required for email)
 *   REPORT_TO     recipient email                (required for email)
 *   REPORT_FROM   optional, defaults to SMTP_USER
 *   ALERT_TO      optional, failure-alert email; falls back to REPORT_TO
 *   SKIP_EMAIL=1  generate PDF only, do not send
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import tls from "node:tls";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
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

const COLORS = {
  navy: "#0B1F3A",
  cobalt: "#1E4EE8",
  ink: "#0F172A",
  muted: "#5B6472",
  line: "#D8DEE7",
  bg: "#F5F7FB",
  good: "#16A34A",
  warn: "#D97706",
  bad: "#DC2626",
};

// ============================================================
// Collectors
// ============================================================

async function checkHttp(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "PortfolioHealthBot/1.0" },
    });
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      responseTimeMs: Date.now() - start,
      finalUrl: res.url,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      statusText: err.message || "Request failed",
      responseTimeMs: Date.now() - start,
      finalUrl: url,
      error: err.message,
    };
  }
}

async function checkAsset(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "PortfolioHealthBot/1.0" },
    });
    return { url, ok: res.ok, status: res.status };
  } catch (err) {
    return { url, ok: false, status: 0, error: err.message };
  }
}

async function checkDns(hostname) {
  try {
    const [a, aaaa] = await Promise.all([
      dns.resolve4(hostname).catch(() => []),
      dns.resolve6(hostname).catch(() => []),
    ]);
    return { ok: a.length > 0 || aaaa.length > 0, a, aaaa };
  } catch (err) {
    return { ok: false, a: [], aaaa: [], error: err.message };
  }
}

function checkSsl(hostname, port = 443) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port, servername: hostname, timeout: 10000 },
      () => {
        const cert = socket.getPeerCertificate();
        const authorized = socket.authorized;
        socket.end();
        if (!cert || !cert.valid_to) {
          resolve({ ok: false, error: "No certificate returned" });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const daysRemaining = Math.floor(
          (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        resolve({
          ok: authorized && daysRemaining > 0,
          authorized,
          issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown",
          subject: cert.subject?.CN || hostname,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysRemaining,
        });
      },
    );
    socket.on("error", (err) => resolve({ ok: false, error: err.message }));
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ ok: false, error: "TLS timeout" });
    });
  });
}

function runLighthouse(url) {
  return new Promise((resolve) => {
    const outFile = path.join(os.tmpdir(), `lh-${Date.now()}.json`);
    const args = [
      "-y",
      "lighthouse",
      url,
      "--quiet",
      "--output=json",
      `--output-path=${outFile}`,
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--preset=desktop",
      "--max-wait-for-load=45000",
    ];
    const child = spawn("npx", args, { stdio: "inherit" });
    child.on("error", (err) => resolve({ ok: false, error: err.message }));
    child.on("close", (code) => {
      if (code !== 0 || !fs.existsSync(outFile)) {
        resolve({ ok: false, error: `Lighthouse exited with code ${code}` });
        return;
      }
      try {
        const raw = JSON.parse(fs.readFileSync(outFile, "utf8"));
        fs.unlinkSync(outFile);
        const cat = raw.categories || {};
        const audits = raw.audits || {};
        const pct = (c) => (c?.score == null ? null : Math.round(c.score * 100));
        resolve({
          ok: true,
          scores: {
            performance: pct(cat.performance),
            accessibility: pct(cat.accessibility),
            bestPractices: pct(cat["best-practices"]),
            seo: pct(cat.seo),
          },
          metrics: {
            fcp: audits["first-contentful-paint"]?.displayValue ?? null,
            lcp: audits["largest-contentful-paint"]?.displayValue ?? null,
            tbt: audits["total-blocking-time"]?.displayValue ?? null,
            cls: audits["cumulative-layout-shift"]?.displayValue ?? null,
            speedIndex: audits["speed-index"]?.displayValue ?? null,
          },
        });
      } catch (err) {
        resolve({ ok: false, error: err.message });
      }
    });
  });
}

async function collectData() {
  console.log(`Collecting health data for ${SITE_URL}…`);
  const [http, dnsResult, ssl, robots, sitemap, favicon] = await Promise.all([
    checkHttp(SITE_URL),
    checkDns(SITE_DOMAIN),
    checkSsl(SITE_DOMAIN),
    checkAsset(`${SITE_URL}/robots.txt`),
    checkAsset(`${SITE_URL}/sitemap.xml`),
    checkAsset(`${SITE_URL}/favicon.ico`),
  ]);

  console.log("Running Lighthouse…");
  const lighthouse = await runLighthouse(SITE_URL);

  const data = {
    generatedAt: new Date(),
    domain: SITE_DOMAIN,
    url: SITE_URL,
    http,
    dns: dnsResult,
    ssl,
    assets: { robots, sitemap, favicon },
    lighthouse,
  };
  data.healthScore = computeHealthScore(data);
  data.recommendations = buildRecommendations(data);
  return data;
}

function computeHealthScore(d) {
  let score = 100;
  if (!d.http.ok) score -= 40;
  else if (d.http.responseTimeMs > 2000) score -= 15;
  else if (d.http.responseTimeMs > 1000) score -= 8;

  if (!d.ssl.ok) score -= 20;
  else if (d.ssl.daysRemaining != null && d.ssl.daysRemaining < 15) score -= 10;
  else if (d.ssl.daysRemaining != null && d.ssl.daysRemaining < 30) score -= 5;

  if (!d.dns.ok) score -= 10;
  if (!d.assets.robots.ok) score -= 3;
  if (!d.assets.sitemap.ok) score -= 3;
  if (!d.assets.favicon.ok) score -= 2;

  if (d.lighthouse.ok) {
    const s = d.lighthouse.scores;
    const penalty = (v) => (v == null ? 0 : Math.max(0, (90 - v) / 4));
    score -= penalty(s.performance);
    score -= penalty(s.accessibility) / 2;
    score -= penalty(s.bestPractices) / 2;
    score -= penalty(s.seo) / 2;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade =
    score >= 95 ? "Excellent" :
    score >= 85 ? "Healthy" :
    score >= 70 ? "Fair" :
    score >= 50 ? "At Risk" : "Critical";
  return { value: score, grade };
}

function buildRecommendations(d) {
  const recs = [];
  if (!d.http.ok) recs.push(`Site returned status ${d.http.status || "0"} — investigate hosting or DNS immediately.`);
  if (d.http.ok && d.http.responseTimeMs > 1500) recs.push(`Response time is ${d.http.responseTimeMs} ms; consider caching, CDN edge tuning, or reducing server work.`);
  if (d.ssl.ok && d.ssl.daysRemaining != null && d.ssl.daysRemaining < 30) recs.push(`SSL certificate expires in ${d.ssl.daysRemaining} days — schedule renewal.`);
  if (!d.ssl.ok) recs.push(`SSL check failed (${d.ssl.error || "invalid certificate"}); browsers may block visitors.`);
  if (!d.dns.ok) recs.push("DNS resolution failed — verify nameserver and A/AAAA records.");
  if (!d.assets.robots.ok) recs.push("robots.txt is missing or unreachable; add it at /robots.txt for crawler control.");
  if (!d.assets.sitemap.ok) recs.push("sitemap.xml is missing; publish one at /sitemap.xml to improve indexing.");
  if (!d.assets.favicon.ok) recs.push("favicon.ico is missing; add one for brand recognition in tabs and bookmarks.");
  if (d.lighthouse.ok) {
    const s = d.lighthouse.scores;
    if (s.performance != null && s.performance < 90) recs.push(`Lighthouse performance is ${s.performance}/100 — audit LCP, TBT and image sizes.`);
    if (s.accessibility != null && s.accessibility < 95) recs.push(`Accessibility is ${s.accessibility}/100 — review color contrast, ARIA labels and semantic landmarks.`);
    if (s.bestPractices != null && s.bestPractices < 95) recs.push(`Best Practices is ${s.bestPractices}/100 — check console errors and secure headers.`);
    if (s.seo != null && s.seo < 95) recs.push(`SEO is ${s.seo}/100 — verify meta tags, canonical links, and structured data.`);
  } else {
    recs.push(`Lighthouse audit did not run (${d.lighthouse.error || "unknown reason"}).`);
  }
  if (recs.length === 0) recs.push("All checks passed — no action required. Keep monitoring daily.");
  return recs;
}

// ============================================================
// PDF rendering
// ============================================================

function statusColor(ok) {
  return ok ? COLORS.good : COLORS.bad;
}

function section(doc, title, y) {
  if (y > doc.page.height - 120) {
    doc.addPage();
    y = 60;
  }
  doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.navy).text(title, 50, y);
  doc.strokeColor(COLORS.cobalt).lineWidth(1.5)
    .moveTo(50, y + 18).lineTo(120, y + 18).stroke();
  return y + 28;
}

function kvRow(doc, key, value, x, y, w, opts = {}) {
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted).text(key, x + 10, y + 6, { width: w * 0.4 - 10 });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(opts.color || COLORS.ink)
    .text(String(value), x + w * 0.4, y + 6, { width: w * 0.6 - 10, align: "left" });
  return y + 22;
}

function drawKvTable(doc, rows, x, y, w) {
  rows.forEach((r, i) => {
    if (i % 2 === 0) doc.rect(x, y, w, 22).fill(COLORS.bg);
    doc.fillColor(COLORS.ink);
    kvRow(doc, r[0], r[1], x, y, w, { color: r[2] });
    y += 22;
  });
  return y;
}

function generatePdf(data, outPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    // -------- Cover page --------
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FFFFFF");
    doc.rect(0, 0, doc.page.width, 260).fill(COLORS.navy);
    doc.circle(doc.page.width / 2, 110, 34).fill(COLORS.cobalt);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(24)
      .text("PP", 0, 96, { width: doc.page.width, align: "center" });
    doc.font("Helvetica-Bold").fontSize(26).fillColor("#FFFFFF")
      .text("Daily Website Health Report", 50, 170, { width: doc.page.width - 100, align: "center" });
    doc.font("Helvetica").fontSize(12).fillColor("#C7D2FE")
      .text(`${BRAND} · ${BRAND_TAGLINE}`, 50, 210, { width: doc.page.width - 100, align: "center" });
    doc.fillColor("#9CA8D6").fontSize(10)
      .text(data.url, 50, 232, { width: doc.page.width - 100, align: "center" });

    const s = data.healthScore;
    const scoreColor = s.value >= 90 ? COLORS.good : s.value >= 70 ? COLORS.warn : COLORS.bad;
    doc.roundedRect(120, 320, doc.page.width - 240, 130, 8).fill(COLORS.bg);
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10)
      .text("OVERALL HEALTH SCORE", 0, 340, { width: doc.page.width, align: "center" });
    doc.fillColor(scoreColor).font("Helvetica-Bold").fontSize(60)
      .text(`${s.value}`, 0, 358, { width: doc.page.width, align: "center" });
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(14)
      .text(s.grade, 0, 425, { width: doc.page.width, align: "center" });

    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10)
      .text(`Generated ${data.generatedAt.toUTCString()}`, 50, doc.page.height - 80, { width: doc.page.width - 100, align: "center" });

    // -------- Body page --------
    doc.addPage();
    let y = 50;

    // Executive summary
    y = section(doc, "Executive Summary", y);
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.ink)
      .text(buildSummary(data), 50, y, { width: doc.page.width - 100, lineGap: 3 });
    y = doc.y + 18;

    // Website status
    y = section(doc, "Website Status", y);
    const httpRows = [
      ["Website URL", data.url],
      ["Status", data.http.ok ? "Online" : "Offline", statusColor(data.http.ok)],
      ["HTTP Status Code", `${data.http.status} ${data.http.statusText || ""}`.trim(), statusColor(data.http.ok)],
      ["Response Time", `${data.http.responseTimeMs} ms`],
      ["Final URL", data.http.finalUrl || data.url],
      ["DNS Lookup", data.dns.ok ? `OK — A: ${data.dns.a.join(", ") || "none"}` : `Failed (${data.dns.error || "no records"})`, statusColor(data.dns.ok)],
      ["robots.txt", data.assets.robots.ok ? `Available (${data.assets.robots.status})` : `Missing (${data.assets.robots.status || "error"})`, statusColor(data.assets.robots.ok)],
      ["sitemap.xml", data.assets.sitemap.ok ? `Available (${data.assets.sitemap.status})` : `Missing (${data.assets.sitemap.status || "error"})`, statusColor(data.assets.sitemap.ok)],
      ["favicon.ico", data.assets.favicon.ok ? `Available (${data.assets.favicon.status})` : `Missing (${data.assets.favicon.status || "error"})`, statusColor(data.assets.favicon.ok)],
    ];
    y = drawKvTable(doc, httpRows, 50, y, doc.page.width - 100) + 15;

    // Performance
    y = section(doc, "Performance", y);
    const lh = data.lighthouse;
    const perfRows = [
      ["Response Time", `${data.http.responseTimeMs} ms`],
      ["First Contentful Paint", lh.ok ? lh.metrics.fcp ?? "N/A" : "N/A"],
      ["Largest Contentful Paint", lh.ok ? lh.metrics.lcp ?? "N/A" : "N/A"],
      ["Total Blocking Time", lh.ok ? lh.metrics.tbt ?? "N/A" : "N/A"],
      ["Cumulative Layout Shift", lh.ok ? lh.metrics.cls ?? "N/A" : "N/A"],
      ["Speed Index", lh.ok ? lh.metrics.speedIndex ?? "N/A" : "N/A"],
    ];
    y = drawKvTable(doc, perfRows, 50, y, doc.page.width - 100) + 15;

    // SSL
    y = section(doc, "SSL Certificate", y);
    const sslRows = data.ssl.ok
      ? [
          ["Valid", "Yes", COLORS.good],
          ["Issuer", data.ssl.issuer ?? "Unknown"],
          ["Subject", data.ssl.subject ?? data.domain],
          ["Valid From", data.ssl.validFrom ?? "N/A"],
          ["Expiry Date", data.ssl.validTo ?? "N/A"],
          ["Days Remaining", `${data.ssl.daysRemaining ?? "N/A"}`, (data.ssl.daysRemaining ?? 0) < 30 ? COLORS.warn : COLORS.good],
        ]
      : [
          ["Valid", "No", COLORS.bad],
          ["Error", data.ssl.error ?? "Unknown", COLORS.bad],
        ];
    y = drawKvTable(doc, sslRows, 50, y, doc.page.width - 100) + 15;

    // Lighthouse
    y = section(doc, "Lighthouse Scores", y);
    if (lh.ok) {
      const lhRows = [
        ["Performance", `${lh.scores.performance ?? "N/A"} / 100`, scoreCatColor(lh.scores.performance)],
        ["Accessibility", `${lh.scores.accessibility ?? "N/A"} / 100`, scoreCatColor(lh.scores.accessibility)],
        ["Best Practices", `${lh.scores.bestPractices ?? "N/A"} / 100`, scoreCatColor(lh.scores.bestPractices)],
        ["SEO", `${lh.scores.seo ?? "N/A"} / 100`, scoreCatColor(lh.scores.seo)],
      ];
      y = drawKvTable(doc, lhRows, 50, y, doc.page.width - 100) + 15;
    } else {
      doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted)
        .text(`Lighthouse did not run: ${lh.error || "unknown"}`, 50, y, { width: doc.page.width - 100 });
      y = doc.y + 15;
    }

    // Recommendations
    y = section(doc, "Recommendations", y);
    data.recommendations.forEach((r) => {
      if (y > doc.page.height - 90) {
        doc.addPage();
        y = 50;
      }
      doc.circle(56, y + 6, 2).fill(COLORS.cobalt);
      doc.font("Helvetica").fontSize(10).fillColor(COLORS.ink)
        .text(r, 66, y, { width: doc.page.width - 116, lineGap: 2 });
      y = doc.y + 8;
    });

    // Footer / page numbers
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.strokeColor(COLORS.line).lineWidth(0.5)
        .moveTo(50, doc.page.height - 45).lineTo(doc.page.width - 50, doc.page.height - 45).stroke();
      doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted).text(
        `${BRAND} · ${data.url}  ·  Generated ${data.generatedAt.toISOString()}  ·  Page ${i + 1} of ${range.count}`,
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

function scoreCatColor(v) {
  if (v == null) return COLORS.muted;
  if (v >= 90) return COLORS.good;
  if (v >= 70) return COLORS.warn;
  return COLORS.bad;
}

function buildSummary(d) {
  const parts = [];
  parts.push(`On ${d.generatedAt.toUTCString()}, ${d.url} was ${d.http.ok ? "online" : "offline"} (HTTP ${d.http.status || "n/a"}, ${d.http.responseTimeMs} ms).`);
  if (d.ssl.ok) parts.push(`SSL is valid and expires in ${d.ssl.daysRemaining} days (issued by ${d.ssl.issuer}).`);
  else parts.push(`SSL check failed: ${d.ssl.error || "invalid certificate"}.`);
  if (d.lighthouse.ok) {
    const s = d.lighthouse.scores;
    parts.push(`Lighthouse — Performance ${s.performance ?? "n/a"}, Accessibility ${s.accessibility ?? "n/a"}, Best Practices ${s.bestPractices ?? "n/a"}, SEO ${s.seo ?? "n/a"}.`);
  }
  parts.push(`Overall health score: ${d.healthScore.value}/100 (${d.healthScore.grade}).`);
  return parts.join(" ");
}

// ============================================================
// Email
// ============================================================

async function sendEmail(pdfPath, data) {
  if (SKIP_EMAIL) {
    console.log("SKIP_EMAIL set — skipping email send.");
    return;
  }
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP env vars missing — skipping email send.");
    return;
  }
  const port = Number(SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const date = data.generatedAt.toISOString().slice(0, 10);
  const body = `Hello Piyush,

Please find attached today's Website Health Report for ${data.url}.

This report contains uptime, response time, SSL status, DNS, asset availability, and Lighthouse audit scores.

Overall Health Score: ${data.healthScore.value}/100 (${data.healthScore.grade})

Regards,
Automated Monitoring System`;
  await transporter.sendMail({
    from: REPORT_FROM || SMTP_USER,
    to: REPORT_TO,
    subject: `Daily Website Health Report - ${date}`,
    text: body,
    attachments: [{ filename: path.basename(pdfPath), path: pdfPath }],
  });
  console.log(`Report emailed to ${REPORT_TO}`);
}

async function sendFailureAlert(err) {
  if (SKIP_EMAIL) return;
  const to = ALERT_TO || REPORT_TO;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !to) return;
  try {
    const port = Number(SMTP_PORT);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: REPORT_FROM || SMTP_USER,
      to,
      subject: `⚠️ Daily Website Health Report FAILED - ${SITE_DOMAIN}`,
      text: `The daily health report pipeline failed at ${new Date().toISOString()}.\n\n${err?.stack || err?.message || String(err)}`,
    });
  } catch (e) {
    console.error("Failed to send failure alert:", e);
  }
}

// ============================================================
// Main
// ============================================================

(async () => {
  try {
    const data = await collectData();
    const reportsDir = path.join(__dirname, "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    const date = data.generatedAt.toISOString().slice(0, 10);
    const pdfPath = path.join(reportsDir, `Daily-Website-Report-${date}.pdf`);
    await generatePdf(data, pdfPath);
    console.log(`PDF written to ${pdfPath}`);
    await sendEmail(pdfPath, data);
  } catch (err) {
    console.error(err);
    await sendFailureAlert(err);
    process.exit(1);
  }
})();
