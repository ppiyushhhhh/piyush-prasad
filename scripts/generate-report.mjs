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
// PDF rendering — 2-page executive layout
// ============================================================

const PAGE = { w: 595.28, h: 841.89 };
const MARGIN = 36;

function statusColor(ok) {
  return ok ? COLORS.good : COLORS.bad;
}

function scoreCatColor(v) {
  if (v == null) return COLORS.muted;
  if (v >= 90) return COLORS.good;
  if (v >= 70) return COLORS.warn;
  return COLORS.bad;
}

function drawHeader(doc, data) {
  const x = MARGIN;
  const y = MARGIN;
  const w = PAGE.w - MARGIN * 2;

  doc.roundedRect(x, y, 44, 44, 8).fill(COLORS.navy);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(16)
    .text("PP", x, y + 14, { width: 44, align: "center" });

  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13)
    .text(BRAND, x + 56, y + 4);
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9)
    .text("IT Operations | DevOps | Cloud", x + 56, y + 20);
  doc.fillColor(COLORS.cobalt).font("Helvetica").fontSize(9)
    .text(data.url, x + 56, y + 33);

  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8)
    .text("REPORT GENERATED", x, y + 4, { width: w, align: "right" });
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(10)
    .text(data.generatedAt.toUTCString(), x, y + 16, { width: w, align: "right" });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8)
    .text("Daily Website Health Report", x, y + 32, { width: w, align: "right" });

  doc.strokeColor(COLORS.line).lineWidth(0.7)
    .moveTo(x, y + 56).lineTo(x + w, y + 56).stroke();

  return y + 68;
}

function drawFooter(doc, data, pageNum, total) {
  const y = PAGE.h - 28;
  doc.strokeColor(COLORS.line).lineWidth(0.5)
    .moveTo(MARGIN, y - 6).lineTo(PAGE.w - MARGIN, y - 6).stroke();
  doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
    .text(`Generated automatically by GitHub Actions  ·  Portfolio: ${data.url}`,
      MARGIN, y, { width: PAGE.w - MARGIN * 2, align: "left" });
  doc.text(`Page ${pageNum} of ${total}`, MARGIN, y, {
    width: PAGE.w - MARGIN * 2, align: "right",
  });
}

function sectionTitle(doc, title, x, y, w) {
  doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.navy)
    .text(title.toUpperCase(), x, y, { width: w, characterSpacing: 0.8 });
  doc.strokeColor(COLORS.cobalt).lineWidth(1.2)
    .moveTo(x, y + 14).lineTo(x + 28, y + 14).stroke();
  return y + 22;
}

function drawScoreBadge(doc, data, x, y, w, h) {
  const s = data.healthScore;
  const scoreColor = s.value >= 90 ? COLORS.good : s.value >= 70 ? COLORS.warn : COLORS.bad;
  doc.roundedRect(x, y, w, h, 8).fill(COLORS.bg);
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8)
    .text("OVERALL HEALTH SCORE", x, y + 12, { width: w, align: "center", characterSpacing: 0.6 });
  const cx = x + w / 2;
  const cy = y + h / 2 + 6;
  doc.circle(cx, cy, 34).fill("#FFFFFF");
  doc.circle(cx, cy, 34).lineWidth(2).strokeColor(scoreColor).stroke();
  doc.fillColor(scoreColor).font("Helvetica-Bold").fontSize(26)
    .text(`${s.value}`, x, cy - 14, { width: w, align: "center" });
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(11)
    .text(s.grade, x, y + h - 20, { width: w, align: "center" });
}

function drawSummaryCard(doc, label, value, x, y, w, h, color) {
  doc.roundedRect(x, y, w, h, 6).fill(COLORS.bg);
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7.5)
    .text(label.toUpperCase(), x + 10, y + 9, { width: w - 20, characterSpacing: 0.5 });
  doc.fillColor(color || COLORS.ink).font("Helvetica-Bold").fontSize(12)
    .text(String(value), x + 10, y + 24, { width: w - 20, ellipsis: true, height: h - 28 });
}

function drawSummaryGrid(doc, cards, x, y, w) {
  const cols = 3;
  const gap = 8;
  const cardW = (w - gap * (cols - 1)) / cols;
  const cardH = 48;
  cards.forEach((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    drawSummaryCard(doc, c.label, c.value,
      x + col * (cardW + gap), y + row * (cardH + gap),
      cardW, cardH, c.color);
  });
  const rows = Math.ceil(cards.length / cols);
  return y + rows * cardH + (rows - 1) * gap;
}

function drawLighthouseCard(doc, label, score, x, y, w, h) {
  const color = scoreCatColor(score);
  doc.roundedRect(x, y, w, h, 6).fill(COLORS.bg);
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7.5)
    .text(label.toUpperCase(), x, y + 8, { width: w, align: "center", characterSpacing: 0.5 });
  doc.fillColor(color).font("Helvetica-Bold").fontSize(22)
    .text(score == null ? "—" : `${score}`, x, y + 20, { width: w, align: "center" });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7)
    .text("/ 100", x, y + 46, { width: w, align: "center" });
}

function drawLighthouseGrid(doc, lh, x, y, w) {
  const cols = 4;
  const gap = 8;
  const cardW = (w - gap * (cols - 1)) / cols;
  const cardH = 62;
  const items = [
    ["Performance", lh.ok ? lh.scores.performance : null],
    ["Accessibility", lh.ok ? lh.scores.accessibility : null],
    ["Best Practices", lh.ok ? lh.scores.bestPractices : null],
    ["SEO", lh.ok ? lh.scores.seo : null],
  ];
  items.forEach(([label, s], i) => {
    drawLighthouseCard(doc, label, s, x + i * (cardW + gap), y, cardW, cardH);
  });
  return y + cardH;
}

function drawMetricsTable(doc, rows, x, y, w) {
  const rowH = 22;
  rows.forEach((r, i) => {
    if (i % 2 === 0) doc.rect(x, y, w, rowH).fill(COLORS.bg);
    doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.muted)
      .text(r[0], x + 12, y + 7, { width: w * 0.5 - 12 });
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(r[2] || COLORS.ink)
      .text(String(r[1]), x + w * 0.5, y + 7, { width: w * 0.5 - 12, align: "right" });
    y += rowH;
  });
  return y;
}

function generatePdf(data, outPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    const contentW = PAGE.w - MARGIN * 2;

    // ============ PAGE 1 ============
    let y = drawHeader(doc, data);

    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(20)
      .text("Daily Website Health Report", MARGIN, y);
    y += 26;

    y = sectionTitle(doc, "Executive Summary", MARGIN, y, contentW);
    doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.ink)
      .text(buildSummary(data), MARGIN, y, { width: contentW, lineGap: 2 });
    y = doc.y + 14;

    const badgeW = 170;
    const badgeH = 120;
    drawScoreBadge(doc, data, MARGIN, y, badgeW, badgeH);

    const rightX = MARGIN + badgeW + 12;
    const rightW = contentW - badgeW - 12;
    const topCards = [
      { label: "Website Status", value: data.http.ok ? "Online" : "Offline", color: statusColor(data.http.ok) },
      { label: "HTTP Status", value: `${data.http.status || "—"}`, color: statusColor(data.http.ok) },
      { label: "Response Time", value: `${data.http.responseTimeMs} ms`,
        color: data.http.responseTimeMs > 2000 ? COLORS.bad : data.http.responseTimeMs > 1000 ? COLORS.warn : COLORS.good },
      { label: "SSL Status", value: data.ssl.ok ? "Valid" : "Invalid", color: statusColor(data.ssl.ok) },
      { label: "SSL Expiry", value: data.ssl.ok && data.ssl.daysRemaining != null ? `${data.ssl.daysRemaining} days` : "N/A",
        color: data.ssl.ok ? ((data.ssl.daysRemaining ?? 0) < 30 ? COLORS.warn : COLORS.good) : COLORS.bad },
      { label: "DNS Status", value: data.dns.ok ? "Resolved" : "Failed", color: statusColor(data.dns.ok) },
    ];
    const rCols = 3;
    const rGap = 6;
    const rCardW = (rightW - rGap * (rCols - 1)) / rCols;
    const rCardH = (badgeH - rGap) / 2;
    topCards.forEach((c, i) => {
      const col = i % rCols;
      const row = Math.floor(i / rCols);
      drawSummaryCard(doc, c.label, c.value,
        rightX + col * (rCardW + rGap),
        y + row * (rCardH + rGap),
        rCardW, rCardH, c.color);
    });
    y += badgeH + 18;

    y = sectionTitle(doc, "Lighthouse Scores", MARGIN, y, contentW);
    if (data.lighthouse.ok) {
      y = drawLighthouseGrid(doc, data.lighthouse, MARGIN, y, contentW) + 12;
    } else {
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
        .text(`Lighthouse audit unavailable: ${data.lighthouse.error || "unknown"}`,
          MARGIN, y, { width: contentW });
      y = doc.y + 12;
    }

    const anyAsset = data.assets.robots.ok || data.assets.sitemap.ok || data.assets.favicon.ok
      || data.assets.robots.status || data.assets.sitemap.status || data.assets.favicon.status;
    if (anyAsset) {
      y = sectionTitle(doc, "Asset Availability", MARGIN, y, contentW);
      const assetCards = [
        { label: "robots.txt", value: data.assets.robots.ok ? "Available" : "Missing", color: statusColor(data.assets.robots.ok) },
        { label: "sitemap.xml", value: data.assets.sitemap.ok ? "Available" : "Missing", color: statusColor(data.assets.sitemap.ok) },
        { label: "favicon.ico", value: data.assets.favicon.ok ? "Available" : "Missing", color: statusColor(data.assets.favicon.ok) },
      ];
      drawSummaryGrid(doc, assetCards, MARGIN, y, contentW);
    }

    drawFooter(doc, data, 1, 2);

    // ============ PAGE 2 ============
    doc.addPage();
    y = drawHeader(doc, data);

    y = sectionTitle(doc, "Website Performance Metrics", MARGIN, y, contentW);
    const lh = data.lighthouse;
    const perfRows = [
      ["First Contentful Paint", lh.ok ? (lh.metrics.fcp ?? "N/A") : "N/A"],
      ["Largest Contentful Paint", lh.ok ? (lh.metrics.lcp ?? "N/A") : "N/A"],
      ["Total Blocking Time", lh.ok ? (lh.metrics.tbt ?? "N/A") : "N/A"],
      ["Cumulative Layout Shift", lh.ok ? (lh.metrics.cls ?? "N/A") : "N/A"],
      ["Speed Index", lh.ok ? (lh.metrics.speedIndex ?? "N/A") : "N/A"],
      ["Server Response Time", `${data.http.responseTimeMs} ms`],
    ];
    y = drawMetricsTable(doc, perfRows, MARGIN, y, contentW) + 16;

    if (data.recommendations && data.recommendations.length > 0) {
      y = sectionTitle(doc, "Recommendations", MARGIN, y, contentW);
      const maxRecY = PAGE.h - 180;
      const recs = data.recommendations.slice(0, 8);
      for (const r of recs) {
        if (y > maxRecY) break;
        doc.circle(MARGIN + 4, y + 5, 1.8).fill(COLORS.cobalt);
        doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.ink)
          .text(r, MARGIN + 14, y, { width: contentW - 14, lineGap: 2 });
        y = doc.y + 6;
      }
      y += 6;
    }

    y = sectionTitle(doc, "System Information", MARGIN, y, contentW);
    const isHttps = (data.http.finalUrl || data.url).startsWith("https://");
    const sysRows = [
      ["Domain", data.domain],
      ["HTTPS", isHttps ? "Enabled" : "Disabled", isHttps ? COLORS.good : COLORS.bad],
      ["Generated At", data.generatedAt.toISOString()],
      ["Report Version", "2.0"],
    ];
    drawMetricsTable(doc, sysRows, MARGIN, y, contentW);

    drawFooter(doc, data, 2, 2);

    // Assert exactly 2 pages before finalising — catches layout overflow
    // (PDFKit auto-adds a page when content spills past page height) and any
    // stray addPage() calls that would produce blanks.
    const range = doc.bufferedPageRange();
    if (range.count !== 2) {
      doc.end();
      reject(new Error(
        `PDF layout assertion failed: expected exactly 2 pages, got ${range.count}. ` +
        `A section overflowed page height or a blank page was added. ` +
        `Reduce content in Recommendations / Performance / Summary or shrink card heights.`,
      ));
      return;
    }

    doc.end();
    stream.on("finish", () => {
      // Post-write verification: parse the emitted PDF and count /Type /Page
      // objects. Guards against silent PDFKit output changes.
      try {
        const buf = fs.readFileSync(outPath);
        const text = buf.toString("latin1");
        const pageMatches = text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || [];
        if (pageMatches.length !== 2) {
          reject(new Error(
            `PDF post-write assertion failed: expected 2 pages in ${outPath}, ` +
            `found ${pageMatches.length}. The file may contain blank or overflow pages.`,
          ));
          return;
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    stream.on("error", reject);
  });
}

function buildSummary(d) {
  const parts = [];
  parts.push(`${d.url} was ${d.http.ok ? "online" : "offline"} (HTTP ${d.http.status || "n/a"}) with a ${d.http.responseTimeMs} ms response time.`);
  if (d.ssl.ok) parts.push(`SSL is valid, expiring in ${d.ssl.daysRemaining} days (issuer: ${d.ssl.issuer}).`);
  else parts.push(`SSL check failed: ${d.ssl.error || "invalid certificate"}.`);
  if (d.lighthouse.ok) {
    const s = d.lighthouse.scores;
    parts.push(`Lighthouse — Perf ${s.performance ?? "n/a"}, A11y ${s.accessibility ?? "n/a"}, BP ${s.bestPractices ?? "n/a"}, SEO ${s.seo ?? "n/a"}.`);
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
