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
import { spawn, spawnSync } from "node:child_process";
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

const CONTACT = {
  email: "piyush@piyushprasad.in",
  phone: "+91 9324236673",
  linkedin: "https://linkedin.com/in/ppiyushhhh",
  linkedinLabel: "linkedin.com/in/ppiyushhhh",
  github: "https://github.com/ppiyushhhhh",
  githubLabel: "github.com/ppiyushhhhh",
};

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
  data.git = collectGitInfo();
  return data;
}

function collectGitInfo() {
  const env = process.env;
  const repository = env.GITHUB_REPOSITORY || null;
  const branch = env.GITHUB_REF_NAME || null;
  const workflow = env.GITHUB_WORKFLOW || null;
  const runId = env.GITHUB_RUN_ID || null;
  const server = env.GITHUB_SERVER_URL || "https://github.com";
  const actor = env.GITHUB_ACTOR || null;
  const event = env.GITHUB_EVENT_NAME || null;
  const repoUrl = repository ? `${server}/${repository}` : null;
  const runUrl = repository && runId ? `${repoUrl}/actions/runs/${runId}` : null;

  let commitHash = env.GITHUB_SHA ? env.GITHUB_SHA.slice(0, 7) : null;
  let commitAuthor = null;
  let commitDate = null;
  let commitMessage = null;
  try {
    const r = spawnSync(
      "git",
      ["log", "-1", "--pretty=format:%h%x1f%an%x1f%ad%x1f%s", "--date=iso-strict"],
      { encoding: "utf8" },
    );
    if (r.status === 0 && r.stdout) {
      const [h, an, ad, s] = r.stdout.split("\x1f");
      if (h) commitHash = h;
      commitAuthor = an || null;
      commitDate = ad || null;
      commitMessage = s || null;
    }
  } catch {
    // git absent — leave nulls
  }
  return {
    repository, branch, workflow, runId, runUrl, repoUrl, actor, event,
    commitHash, commitAuthor, commitDate, commitMessage,
  };
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
// PDF rendering — strict 2-page executive dashboard
// ============================================================

const PAGE = { w: 595.28, h: 841.89 };
const MARGIN = 36;
const REPORT_VERSION = "2.1";

function statusColor(ok) {
  return ok ? COLORS.good : COLORS.bad;
}

function scoreCatColor(v) {
  if (v == null) return COLORS.muted;
  if (v >= 90) return COLORS.good;
  if (v >= 70) return COLORS.warn;
  return COLORS.bad;
}

function truncate(str, max) {
  if (str == null) return "—";
  const s = String(str);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

const LOGO_PATH = path.join(__dirname, "assets", "logo.png");
const LOGO_EXISTS = fs.existsSync(LOGO_PATH);

function drawHeader(doc, data) {
  const x = MARGIN;
  const y = MARGIN;
  const w = PAGE.w - MARGIN * 2;

  // Logo sits inside a fixed 44x44 slot so it never pushes the header rule
  // (at y+50) and cannot affect the 2-page layout regardless of source size.
  const LOGO_SLOT = 44;
  const LOGO_MAX = 36; // rendered size — leaves 4px top/left padding within the slot
  const LOGO_PAD_X = 2;
  const LOGO_PAD_Y = 4;
  if (LOGO_EXISTS) {
    doc.save();
    doc.rect(x, y, LOGO_SLOT, LOGO_SLOT).clip();
    doc.image(LOGO_PATH, x + LOGO_PAD_X, y + LOGO_PAD_Y, {
      fit: [LOGO_MAX, LOGO_MAX], align: "center", valign: "center",
    });
    doc.restore();
  } else {
    doc.roundedRect(x + LOGO_PAD_X, y + LOGO_PAD_Y, LOGO_MAX, LOGO_MAX, 8).fill(COLORS.navy);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(14)
      .text("PP", x + LOGO_PAD_X, y + LOGO_PAD_Y + 10, { width: LOGO_MAX, align: "center" });
  }

  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(12)
    .text(BRAND, x + 52, y + 4);
  doc.fillColor(COLORS.cobalt).font("Helvetica").fontSize(9)
    .text(data.url, x + 52, y + 20, { link: data.url, underline: true, width: w - 200 });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8)
    .text(BRAND_TAGLINE, x + 52, y + 32);


  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7.5)
    .text("REPORT GENERATED", x, y + 4, { width: w, align: "right", characterSpacing: 0.6 });
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(9.5)
    .text(data.generatedAt.toUTCString(), x, y + 16, { width: w, align: "right" });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8)
    .text(`Version ${REPORT_VERSION}`, x, y + 30, { width: w, align: "right" });

  doc.strokeColor(COLORS.line).lineWidth(0.7)
    .moveTo(x, y + 50).lineTo(x + w, y + 50).stroke();

  return y + 62;
}

function drawFooter(doc, data, pageNum, total) {
  const y = PAGE.h - 28;
  const w = PAGE.w - MARGIN * 2;

  // Contact row (clickable) above the footer rule
  const cy = y - 18;
  doc.font("Helvetica").fontSize(7.5);
  const items = [
    { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { label: CONTACT.linkedinLabel, href: CONTACT.linkedin },
    { label: CONTACT.githubLabel, href: CONTACT.github },
  ];
  const sep = "  ·  ";
  const sepW = doc.widthOfString(sep);
  const totalW = items.reduce((s, it) => s + doc.widthOfString(it.label), 0)
    + sepW * (items.length - 1);
  let cx = MARGIN + (w - totalW) / 2;
  items.forEach((it, i) => {
    const tw = doc.widthOfString(it.label);
    doc.fillColor(COLORS.cobalt)
      .text(it.label, cx, cy, { link: it.href, underline: true, width: tw + 2, lineBreak: false });
    cx += tw;
    if (i < items.length - 1) {
      doc.fillColor(COLORS.muted)
        .text(sep, cx, cy, { width: sepW + 2, lineBreak: false, link: null, underline: false });
      cx += sepW;
    }
  });


  doc.strokeColor(COLORS.line).lineWidth(0.5)
    .moveTo(MARGIN, y - 6).lineTo(PAGE.w - MARGIN, y - 6).stroke();
  const repo = data.git?.repoUrl ? ` · ${data.git.repoUrl}` : "";
  doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
    .text(
      `Generated automatically by GitHub Actions · ${data.url}${repo} · ${data.generatedAt.toISOString()}`,
      MARGIN, y, { width: w, align: "left", lineBreak: false, ellipsis: true },
    );
  doc.text(`Page ${pageNum} of ${total}`, MARGIN, y, {
    width: w, align: "right", lineBreak: false,
  });
}

function sectionTitle(doc, title, x, y, w) {
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(COLORS.navy)
    .text(title.toUpperCase(), x, y, { width: w, characterSpacing: 0.8 });
  doc.strokeColor(COLORS.cobalt).lineWidth(1.4)
    .moveTo(x, y + 14).lineTo(x + 26, y + 14).stroke();
  return y + 22;
}

function drawInfoStrip(doc, items, x, y, w) {
  const h = 26;
  doc.roundedRect(x, y, w, h, 6).fill(COLORS.bg);
  const cellW = w / items.length;
  items.forEach((it, i) => {
    const cx = x + i * cellW;
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7).text(
      it.label.toUpperCase(), cx + 10, y + 5,
      { width: cellW - 20, characterSpacing: 0.5 },
    );
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(9).text(
      truncate(it.value, 34), cx + 10, y + 14,
      { width: cellW - 20, ellipsis: true },
    );
    if (i > 0) {
      doc.strokeColor(COLORS.line).lineWidth(0.5)
        .moveTo(cx, y + 5).lineTo(cx, y + h - 5).stroke();
    }
  });
  return y + h;
}

function drawScoreBadge(doc, data, x, y, w, h) {
  const s = data.healthScore;
  const scoreColor = s.value >= 90 ? COLORS.good : s.value >= 70 ? COLORS.warn : COLORS.bad;
  doc.roundedRect(x, y, w, h, 8).fill(COLORS.bg);
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7.5)
    .text("OVERALL HEALTH SCORE", x, y + 12,
      { width: w, align: "center", characterSpacing: 0.6 });
  const cx = x + w / 2;
  const cy = y + h / 2 + 4;
  doc.circle(cx, cy, 32).fill("#FFFFFF");
  doc.circle(cx, cy, 32).lineWidth(2).strokeColor(scoreColor).stroke();
  doc.fillColor(scoreColor).font("Helvetica-Bold").fontSize(24)
    .text(`${s.value}`, x, cy - 13, { width: w, align: "center" });
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(10)
    .text(s.grade, x, y + h - 18, { width: w, align: "center" });
}

function drawSummaryCard(doc, label, value, x, y, w, h, color) {
  doc.roundedRect(x, y, w, h, 6).fill(COLORS.bg);
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7)
    .text(label.toUpperCase(), x + 10, y + 8,
      { width: w - 20, characterSpacing: 0.5 });
  doc.fillColor(color || COLORS.ink).font("Helvetica-Bold").fontSize(11)
    .text(truncate(value, 22), x + 10, y + 21,
      { width: w - 20, ellipsis: true, height: h - 24 });
}

function drawLighthouseCard(doc, label, score, x, y, w, h) {
  const color = scoreCatColor(score);
  doc.roundedRect(x, y, w, h, 6).fill(COLORS.bg);
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7.5)
    .text(label.toUpperCase(), x, y + 8,
      { width: w, align: "center", characterSpacing: 0.5 });
  doc.fillColor(color).font("Helvetica-Bold").fontSize(22)
    .text(score == null ? "—" : `${score}`, x, y + 20,
      { width: w, align: "center" });
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
  const rowH = 20;
  rows.forEach((r, i) => {
    if (i % 2 === 0) doc.rect(x, y, w, rowH).fill(COLORS.bg);
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
      .text(r[0], x + 12, y + 6, { width: w * 0.55 - 12 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(r[2] || COLORS.ink)
      .text(truncate(r[1], 40), x + w * 0.55, y + 6,
        { width: w * 0.45 - 12, align: "right", ellipsis: true });
    y += rowH;
  });
  return y;
}

function drawInfoCard(doc, title, rows, x, y, w) {
  const rowH = 18;
  const headerH = 22;
  const h = headerH + rows.length * rowH + 8;
  doc.roundedRect(x, y, w, h, 6).fill(COLORS.bg);
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COLORS.navy)
    .text(title.toUpperCase(), x + 12, y + 8,
      { width: w - 24, characterSpacing: 0.6 });
  doc.strokeColor(COLORS.line).lineWidth(0.5)
    .moveTo(x + 12, y + headerH).lineTo(x + w - 12, y + headerH).stroke();
  let ry = y + headerH + 4;
  rows.forEach(([label, value, color]) => {
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.muted)
      .text(label, x + 12, ry, { width: w * 0.4 - 12 });
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(color || COLORS.ink)
      .text(truncate(value, 38), x + w * 0.4, ry,
        { width: w * 0.6 - 12, ellipsis: true });
    ry += rowH;
  });
  return y + h;
}

function generatePdf(data, outPath) {
  return new Promise((resolve, reject) => {
    // Page margins are set to 0 so absolutely-positioned text near page
    // edges (footer at y ≈ 814) does not trigger PDFKit's auto-pagination.
    // Our own MARGIN constant governs the visible layout.
    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    const contentW = PAGE.w - MARGIN * 2;
    const genDate = data.generatedAt.toISOString().slice(0, 10);
    const genTime = data.generatedAt.toISOString().slice(11, 19) + " UTC";

    // ============ PAGE 1 — Overview ============
    let y = drawHeader(doc, data);

    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(19)
      .text("Daily Website Health Report", MARGIN, y);
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10)
      .text("Portfolio Monitoring Report", MARGIN, y + 24);
    y += 46;

    y = drawInfoStrip(doc, [
      { label: "URL", value: data.url.replace(/^https?:\/\//, "") },
      { label: "Date", value: genDate },
      { label: "Time", value: genTime },
      { label: "Version", value: REPORT_VERSION },
    ], MARGIN, y, contentW) + 16;

    y = sectionTitle(doc, "Executive Summary", MARGIN, y, contentW);

    const badgeW = 160;
    const badgeH = 130;
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

    y = sectionTitle(doc, "Lighthouse Summary", MARGIN, y, contentW);
    if (data.lighthouse.ok) {
      y = drawLighthouseGrid(doc, data.lighthouse, MARGIN, y, contentW);
    } else {
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
        .text(`Lighthouse audit unavailable: ${data.lighthouse.error || "unknown"}`,
          MARGIN, y, { width: contentW });
    }

    drawFooter(doc, data, 1, 2);

    // ============ PAGE 2 — Diagnostics ============
    doc.addPage();
    y = drawHeader(doc, data);

    y = sectionTitle(doc, "Performance Metrics", MARGIN, y, contentW);
    const lh = data.lighthouse;
    const perfRows = [
      ["First Contentful Paint", lh.ok ? (lh.metrics.fcp ?? "N/A") : "N/A"],
      ["Largest Contentful Paint", lh.ok ? (lh.metrics.lcp ?? "N/A") : "N/A"],
      ["Total Blocking Time", lh.ok ? (lh.metrics.tbt ?? "N/A") : "N/A"],
      ["Cumulative Layout Shift", lh.ok ? (lh.metrics.cls ?? "N/A") : "N/A"],
      ["Speed Index", lh.ok ? (lh.metrics.speedIndex ?? "N/A") : "N/A"],
    ];
    y = drawMetricsTable(doc, perfRows, MARGIN, y, contentW) + 16;

    // GitHub + Deployment (side by side). Hide entirely if no data at all.
    const g = data.git || {};
    const hasGit = !!(g.repository || g.commitHash || g.commitMessage);
    const hasDeploy = !!(g.workflow || g.runId || g.actor);
    if (hasGit || hasDeploy) {
      const colGap = 12;
      const colW = (contentW - colGap) / 2;
      const titleY = y;
      if (hasGit) sectionTitle(doc, "GitHub Information", MARGIN, titleY, colW);
      if (hasDeploy) sectionTitle(doc, "Deployment", MARGIN + colW + colGap, titleY, colW);
      y = titleY + 22;

      let leftEnd = y;
      let rightEnd = y;
      if (hasGit) {
        const gitRows = [
          ["Repository", g.repository || "—"],
          ["Branch", g.branch || "—"],
          ["Commit", g.commitHash || "—"],
          ["Message", g.commitMessage || "—"],
          ["Author", g.commitAuthor || g.actor || "—"],
          ["Committed", g.commitDate || "—"],
        ];
        leftEnd = drawInfoCard(doc, "Repository", gitRows, MARGIN, y, colW);
      }
      if (hasDeploy) {
        const deployRows = [
          ["Status", "Success", COLORS.good],
          ["Workflow", g.workflow || "—"],
          ["Event", g.event || "—"],
          ["Run ID", g.runId || "—"],
          ["Triggered By", g.actor || "—"],
          ["Generated At", data.generatedAt.toISOString()],
        ];
        rightEnd = drawInfoCard(doc, "Pipeline", deployRows,
          MARGIN + colW + colGap, y, colW);
      }
      y = Math.max(leftEnd, rightEnd) + 16;
    }

    if (data.recommendations && data.recommendations.length > 0) {
      y = sectionTitle(doc, "Recommendations", MARGIN, y, contentW);
      const maxRecY = PAGE.h - 60;
      const recs = data.recommendations.slice(0, 8);
      for (const r of recs) {
        if (y + 14 > maxRecY) break;
        doc.circle(MARGIN + 4, y + 5, 1.8).fill(COLORS.cobalt);
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.ink)
          .text(truncate(r, 130), MARGIN + 14, y,
            { width: contentW - 14, height: 12, ellipsis: true, lineBreak: false });
        y += 14;
      }
    }

    drawFooter(doc, data, 2, 2);

    // Assert exactly 2 pages before finalising.
    const range = doc.bufferedPageRange();
    if (range.count !== 2) {
      doc.end();
      reject(new Error(
        `PDF layout assertion failed: expected exactly 2 pages, got ${range.count}. ` +
        `A section overflowed page height or a blank page was added.`,
      ));
      return;
    }

    doc.end();
    stream.on("finish", () => {
      try {
        const buf = fs.readFileSync(outPath);
        const text = buf.toString("latin1");
        const pageMatches = text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || [];
        if (pageMatches.length !== 2) {
          reject(new Error(
            `PDF post-write assertion failed: expected 2 pages in ${outPath}, ` +
            `found ${pageMatches.length}.`,
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
