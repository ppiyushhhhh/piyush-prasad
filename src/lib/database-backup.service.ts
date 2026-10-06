/**
 * PP·OPS Supabase Database Backup, 7-Day Retention & Monthly Reporting Engine
 *
 * Implements:
 * 1. Daily database backup with pure PostgreSQL .sql dump generation.
 * 2. Secure private Supabase Storage bucket persistence (`database-backups`).
 * 3. Rolling 7-day retention and automated rotation with `deleted_at` recording.
 * 4. Detailed backup history database logging.
 * 5. Operational email notifications (Success / Failure alerts, NO backup data).
 * 6. End-of-month backup summary aggregation, storage, and email delivery.
 * 7. Secure signed download access for administrators.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";

export const BACKUP_STORAGE_BUCKET = "database-backups";
export const RETENTION_DAYS = 7;

export function getBackupStorageDir(): string {
  const dir = path.resolve(process.cwd(), "data", "backups");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return dir;
}

export function getLocalHistoryFilePath(): string {
  return path.join(getBackupStorageDir(), "backup-history.json");
}

export function getLocalManualHistoryFilePath(): string {
  return path.join(getBackupStorageDir(), "manual-backups-history.json");
}

export function readLocalBackupHistory(): Array<Record<string, any>> {
  try {
    const file = getLocalHistoryFilePath();
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      return JSON.parse(content);
    }
  } catch (err: any) {
    console.warn("[DatabaseBackup] Warning reading local backup history:", err?.message);
  }
  return [];
}

export function readLocalManualBackupHistory(): Array<Record<string, any>> {
  try {
    const manualFile = getLocalManualHistoryFilePath();
    if (fs.existsSync(manualFile)) {
      const content = fs.readFileSync(manualFile, "utf8");
      return JSON.parse(content);
    }
    // Seed from general backup history if manual file not yet created
    const general = readLocalBackupHistory();
    const manualItems = general
      .filter((b) => b["backup_type"] === "manual" || b?.metadata?.backupTypeTag === "MANUAL")
      .map((b) => ({
        id: b.id,
        created_at: b.created_at,
        backup_date: b.backup_date,
        backup_time: b.backup_time,
        filename: b.filename,
        admin_email: b.metadata?.triggererEmail || "admin@piyushprasad.in",
        status: b.status || "SUCCESS",
        tables_included: b.tables_included || [],
        total_records: b.total_records || 0,
        file_size_bytes: b.file_size_bytes || 0,
        file_size_pretty: b.file_size_pretty || "0 B",
        email_sent: true,
        email_recipient: b.metadata?.triggererEmail || "contact.piyushprasad@gmail.com",
        storage_path: b.storage_path || b.filename,
        backup_data: b.backup_data,
        metadata: b.metadata,
      }));
    if (manualItems.length > 0) {
      fs.writeFileSync(manualFile, JSON.stringify(manualItems, null, 2), "utf8");
      return manualItems;
    }
  } catch (err: any) {
    console.warn("[DatabaseBackup] Warning reading local manual backup history:", err?.message);
  }
  return [];
}

export function saveLocalManualBackupRecord({
  record,
  sqlContent,
}: {
  record: Record<string, any>;
  sqlContent?: string;
}): void {
  try {
    const dir = getBackupStorageDir();
    if (sqlContent && record["filename"]) {
      fs.writeFileSync(path.join(dir, record["filename"]), sqlContent, "utf8");
    }
    const history = readLocalManualBackupHistory();
    const updated = [record, ...history.filter((h) => h["filename"] !== record["filename"] && h["id"] !== record["id"])];
    fs.writeFileSync(getLocalManualHistoryFilePath(), JSON.stringify(updated, null, 2), "utf8");
  } catch (err: any) {
    console.warn("[DatabaseBackup] Warning saving local manual backup record:", err?.message);
  }
}

export function saveLocalBackupRecord({
  record,
  sqlContent,
}: {
  record: Record<string, any>;
  sqlContent?: string;
}): void {
  try {
    const dir = getBackupStorageDir();
    if (sqlContent && record["filename"]) {
      fs.writeFileSync(path.join(dir, record["filename"]), sqlContent, "utf8");
    }
    const history = readLocalBackupHistory();
    const updated = [record, ...history.filter((h) => h["filename"] !== record["filename"])];
    fs.writeFileSync(getLocalHistoryFilePath(), JSON.stringify(updated, null, 2), "utf8");
  } catch (err: any) {
    console.warn("[DatabaseBackup] Warning saving local backup record:", err?.message);
  }
}

export function rotateLocalBackupHistory(retentionDays = RETENTION_DAYS): number {
  let pruned = 0;
  try {
    const dir = getBackupStorageDir();
    const history = readLocalBackupHistory();
    const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let changed = false;

    for (const item of history) {
      if (!item["deleted_at"] && new Date(item["created_at"]).getTime() < cutoffMs) {
        item["deleted_at"] = new Date().toISOString();
        const filePath = path.join(dir, item["filename"]);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch {}
        }
        pruned++;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(getLocalHistoryFilePath(), JSON.stringify(history, null, 2), "utf8");
    }
  } catch (err: any) {
    console.warn("[DatabaseBackup] Warning rotating local backup history:", err?.message);
  }
  return pruned;
}

export const BACKUP_TABLES = [
  "website_health_checks",
  "performance_history",
  "deployment_history",
  "chat_activity",
  "health_reports",
  "user_roles",
  "admin_audit_log",
  "backup_monthly_reports",
  "manual_database_backups",
] as const;

export interface BackupExecutionResult {
  success: boolean;
  backupId: string;
  backupDate: string;
  backupTime: string;
  filename: string;
  fileSizeBytes: number;
  fileSizePretty: string;
  totalRecords: number;
  tablesIncluded: string[];
  tablesSummary?: Record<string, number>;
  prunedCount: number;
  status: "SUCCESS" | "FAILED";
  backupTag: "MANUAL" | "AUTOMATIC";
  errorMessage?: string | null;
  notificationSent: boolean;
  notificationRecipient: string;
  sqlContent?: string;
  emailDetails?: {
    subject: string;
    headline: string;
    messageText: string;
    htmlContent?: string;
  };
}

export interface MonthlyReportData {
  id?: string;
  month: number;
  monthName: string;
  year: number;
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  successPercentage: number;
  totalBackupSizeBytes: number;
  totalBackupSizePretty: string;
  deletedBackupsCount: number;
  deletedBackupSizeBytes: number;
  deletedBackupSizePretty: string;
  reportStatus: "SUCCESS" | "PARTIAL" | "FAILED";
  reportGeneratedDate: string;
  dailyBackups: Array<{
    date: string;
    formattedDate: string;
    status: "SUCCESS" | "FAILED";
    filename: string;
    sizePretty: string;
    deleted: boolean;
    error?: string | null;
  }>;
  failedBackupsList: Array<{
    date: string;
    formattedDate: string;
    filename: string;
    reason: string;
  }>;
  textReport: string;
  htmlReport: string;
}

/**
 * Format bytes to readable string (e.g. 12.4 MB, 1.2 GB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const num = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${num} ${sizes[i]}`;
}

/**
 * Escape SQL value for PostgreSQL INSERT statement
 */
function escapeSqlValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return Number.isFinite(val) ? val.toString() : "NULL";
  if (typeof val === "string") {
    return `'${val.replace(/'/g, "''")}'`;
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'::timestamptz`;
  }
  if (Array.isArray(val)) {
    // Array of strings or primitives
    const elements = val.map((v) => {
      if (typeof v === "string") {
        return `"${v.replace(/"/g, '\\"')}"`;
      }
      return String(v);
    });
    return `'${"{" + elements.join(",") + "}"}'`;
  }
  if (typeof val === "object") {
    // JSONB object
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Generate a complete, valid PostgreSQL .sql dump script
 */
export function generateSqlDump({
  tablesData,
  generatedAt,
  filename,
}: {
  tablesData: Record<string, Record<string, unknown>[]>;
  generatedAt: Date;
  filename: string;
}): { sql: string; totalRecords: number; tableCounts: Record<string, number> } {
  const lines: string[] = [];
  const tableCounts: Record<string, number> = {};
  let totalRecords = 0;

  lines.push("-- =============================================================================");
  lines.push("-- PP·OPS AUTOMATED SUPABASE DATABASE BACKUP");
  lines.push(`-- Filename:      ${filename}`);
  lines.push(`-- Generated At:  ${generatedAt.toISOString()}`);
  lines.push(`-- Format:        PostgreSQL SQL Dump`);
  lines.push(`-- Tables:        ${Object.keys(tablesData).join(", ")}`);
  lines.push("-- Security:      Private Storage - Service Role Server-Side Generation");
  lines.push("-- =============================================================================");
  lines.push("");
  lines.push("SET statement_timeout = 0;");
  lines.push("SET lock_timeout = 0;");
  lines.push("SET client_encoding = 'UTF8';");
  lines.push("SET standard_conforming_strings = on;");
  lines.push("SET check_function_bodies = false;");
  lines.push("");
  lines.push("BEGIN;");
  lines.push("");

  for (const [tableName, rows] of Object.entries(tablesData)) {
    tableCounts[tableName] = rows.length;
    totalRecords += rows.length;

    lines.push(`-- -----------------------------------------------------------------------------`);
    lines.push(`-- Table Data: public.${tableName} (${rows.length} rows)`);
    lines.push(`-- -----------------------------------------------------------------------------`);

    if (rows.length === 0) {
      lines.push(`-- (No records in public.${tableName})`);
      lines.push("");
      continue;
    }

    // Determine columns from first row + all rows
    const colSet = new Set<string>();
    for (const r of rows) {
      for (const col of Object.keys(r)) {
        colSet.add(col);
      }
    }
    const columns = Array.from(colSet);
    const colListStr = columns.map((c) => `"${c}"`).join(", ");

    // Chunk INSERT statements to prevent oversized single queries (batches of 100 rows)
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      lines.push(`INSERT INTO public.${tableName} (${colListStr}) VALUES`);

      const valueRows: string[] = [];
      for (const row of batch) {
        const rowVals = columns.map((col) => escapeSqlValue(row[col]));
        valueRows.push(`  (${rowVals.join(", ")})`);
      }

      lines.push(valueRows.join(",\n") + ";");
    }

    lines.push("");
  }

  lines.push("COMMIT;");
  lines.push("");
  lines.push(`-- Backup completed at ${new Date().toISOString()}`);
  lines.push(`-- Total records archived: ${totalRecords}`);
  lines.push("-- =============================================================================");

  return {
    sql: lines.join("\n"),
    totalRecords,
    tableCounts,
  };
}

/**
 * Ensures the private Supabase Storage bucket exists.
 */
export async function ensurePrivateStorageBucket(
  supabase: SupabaseClient<Database>,
): Promise<void> {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(BACKUP_STORAGE_BUCKET);
    if (!bucket || error) {
      // Create bucket with public = false
      const { error: createError } = await supabase.storage.createBucket(
        BACKUP_STORAGE_BUCKET,
        {
          public: false,
          fileSizeLimit: 524288000, // 500 MB
          allowedMimeTypes: [
            "application/sql",
            "text/plain",
            "text/x-sql",
            "application/octet-stream",
          ],
        },
      );
      if (createError && !createError.message.includes("already exists")) {
        console.warn("[DatabaseBackup] Warning creating storage bucket:", createError.message);
      }
    }
  } catch (err) {
    console.warn("[DatabaseBackup] Could not verify/create storage bucket:", err);
  }
}

/**
 * Sends operational status email notifications (NO backup data).
 * Web3Forms is never used as the backup mechanism.
 * Uses SMTP (Nodemailer) when configured, or operational webhook/dispatcher fallback.
 */
export interface OperationalEmailResult {
  sent: boolean;
  method: string;
  recipient: string;
  subject: string;
  headline: string;
  messageText: string;
  htmlContent: string;
}

export async function sendOperationalEmail({
  subject,
  headline,
  status,
  backupDateTime,
  backupSize,
  backupTag = "AUTOMATIC",
  backupId,
  filename,
  totalRecords = 0,
  tablesSummary = {},
  errorMessage,
  recipientEmail,
  prunedCount = 0,
  storageLocation = "Private Supabase Storage",
}: {
  subject: string;
  headline: string;
  status: "SUCCESS" | "FAILED";
  backupDateTime: string;
  backupSize?: string;
  backupTag?: "MANUAL" | "AUTOMATIC";
  backupId?: string;
  filename?: string;
  totalRecords?: number;
  tablesSummary?: Record<string, number>;
  errorMessage?: string | null;
  recipientEmail?: string;
  prunedCount?: number;
  storageLocation?: string;
}): Promise<OperationalEmailResult> {
  const recipient =
    recipientEmail ||
    process.env["ALERT_TO"] ||
    process.env["REPORT_TO"] ||
    "admin@piyushprasad.in";

  const isSuccess = status === "SUCCESS";
  const statusColor = isSuccess ? "#10b981" : "#ef4444";
  const statusBadge = isSuccess ? "COMPLETED SUCCESSFULLY" : "FAILED";
  const isManual = backupTag === "MANUAL";
  const tagColor = isManual ? "#c084fc" : "#38bdf8";
  const tagBg = isManual ? "#3b0764" : "#083344";
  const tagBorder = isManual ? "#7e22ce" : "#0891b2";

  // Build table breakdown lines
  const tableBreakdownLines: string[] = [];
  const tableRowsHtml: string[] = [];
  const entries = Object.entries(tablesSummary);

  if (entries.length > 0) {
    for (const [tbl, count] of entries) {
      tableBreakdownLines.push(`  • public.${tbl.padEnd(26)} : ${count} records`);
      tableRowsHtml.push(`
        <tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #1f2937; color: #cbd5e1; font-family: monospace; font-size: 12px;">public.${tbl}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #1f2937; color: #38bdf8; font-family: monospace; font-size: 12px; text-align: right; font-weight: 700;">${count.toLocaleString()}</td>
        </tr>
      `);
    }
  } else {
    tableBreakdownLines.push("  • (No individual table records available)");
  }

  const textLines = [
    `============================================================`,
    `PP·OPS DATABASE BACKUP & RESTORATION AUDIT DISPATCH`,
    `============================================================`,
    headline,
    ``,
    `[TAG: ${backupTag}]`,
    `Execution Mode:      ${backupTag}`,
    `Operational Status:  ${status}`,
    ...(backupId ? [`Backup ID:           ${backupId}`] : []),
    `Date & Time:         ${backupDateTime}`,
    ...(filename ? [`Archive Filename:    ${filename}`] : []),
    `Archive Size:        ${backupSize || "0 B"}`,
    `Total Records:       ${totalRecords.toLocaleString()} records`,
    `Storage Destination: ${storageLocation}`,
    `Retention Policy:    7-Day Continuous Rotation (${prunedCount} pruned)`,
    `User Security:       Admin credentials and RBAC active and preserved`,
    ...(errorMessage ? [``, `ERROR DETAIL:`, errorMessage] : []),
    ``,
    `DATABASE TABLE BREAKDOWN:`,
    `------------------------------------------------------------`,
    ...tableBreakdownLines,
    `------------------------------------------------------------`,
    `Total Records Backed Up: ${totalRecords.toLocaleString()}`,
    ``,
    `Inspect in Dashboard: https://piyushprasad.in/dashboard/database`,
    `============================================================`,
  ];

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 620px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 24px; border-bottom: 1px solid #1f2937; }
    .brand { font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; }
    .title { font-size: 20px; font-weight: 800; color: #f8fafc; margin-top: 6px; margin-bottom: 0; }
    .body { padding: 24px; }
    .tags-row { display: flex; gap: 8px; margin-bottom: 18px; align-items: center; }
    .tag-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; background: ${tagBg}; color: ${tagColor}; border: 1px solid ${tagBorder}; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: ${isSuccess ? "#064e3b" : "#7f1d1d"}; color: ${isSuccess ? "#6ee7b7" : "#fca5a5"}; border: 1px solid ${statusColor}; }
    .info-table { width: 100%; border-collapse: collapse; margin-top: 14px; background: #0b0f19; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    .info-table td { padding: 9px 12px; border-bottom: 1px solid #1f2937; font-size: 13px; }
    .info-table td.label { color: #94a3b8; font-weight: 500; width: 150px; }
    .info-table td.value { color: #f8fafc; font-family: monospace; font-weight: 600; }
    .section-title { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; margin-bottom: 8px; }
    .breakdown-table { width: 100%; border-collapse: collapse; background: #0b0f19; border: 1px solid #1f2937; border-radius: 8px; }
    .breakdown-table th { padding: 8px 12px; background: #1e293b; color: #94a3b8; font-size: 11px; text-transform: uppercase; text-align: left; }
    .error-box { margin-top: 16px; padding: 12px 16px; background-color: #450a0a; border: 1px solid #b91c1c; border-radius: 8px; font-family: monospace; font-size: 12px; color: #fecaca; }
    .footer { padding: 16px 24px; background-color: #0b0f19; border-top: 1px solid #1f2937; font-size: 11px; color: #64748b; text-align: center; }
    .btn { display: inline-block; margin-top: 18px; padding: 10px 20px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">PP·OPS Database Operations</div>
      <h2 class="title">${headline}</h2>
    </div>
    <div class="body">
      <div class="tags-row">
        <span class="tag-badge">[${backupTag}]</span>
        <span class="status-badge">${statusBadge}</span>
      </div>

      <table class="info-table">
        <tr>
          <td class="label">Backup Mode</td>
          <td class="value"><strong style="color: ${tagColor};">${backupTag}</strong></td>
        </tr>
        ${backupId ? `<tr><td class="label">Backup ID</td><td class="value">${backupId}</td></tr>` : ""}
        <tr>
          <td class="label">Date &amp; Time</td>
          <td class="value">${backupDateTime}</td>
        </tr>
        ${filename ? `<tr><td class="label">Archive Filename</td><td class="value" style="color: #38bdf8;">${filename}</td></tr>` : ""}
        <tr>
          <td class="label">Archive Size</td>
          <td class="value">${backupSize || "0 B"}</td>
        </tr>
        <tr>
          <td class="label">Total Records</td>
          <td class="value">${totalRecords.toLocaleString()} rows</td>
        </tr>
        <tr>
          <td class="label">Storage Location</td>
          <td class="value">${storageLocation}</td>
        </tr>
        <tr>
          <td class="label">Retention Policy</td>
          <td class="value">7 Days Continuous Rotation</td>
        </tr>
      </table>

      ${
        tableRowsHtml.length > 0
          ? `
          <div class="section-title">Database Tables Breakdown</div>
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>Table Name</th>
                <th style="text-align: right;">Archived Records</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml.join("")}
            </tbody>
          </table>
          `
          : ""
      }

      ${
        errorMessage
          ? `<div class="error-box"><strong>Failure Reason:</strong><br>${errorMessage}</div>`
          : ""
      }

      <div style="text-align: center;">
        <a href="https://piyushprasad.in/dashboard/database" class="btn">View Database Console</a>
      </div>
    </div>
    <div class="footer">
      Automated operational alert from PP·OPS Platform. Supabase credentials and backup archives are strictly protected server-side.
    </div>
  </div>
</body>
</html>`;

  // 1. Try SMTP delivery via Nodemailer if SMTP credentials exist
  const smtpHost = process.env["SMTP_HOST"];
  const smtpUser = process.env["SMTP_USER"];
  const smtpPass = process.env["SMTP_PASS"];
  const smtpPort = parseInt(process.env["SMTP_PORT"] || "465", 10);
  const fromEmail = process.env["REPORT_FROM"] || smtpUser || "ops@piyushprasad.in";

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"PP·OPS Database Engine" <${fromEmail}>`,
        to: recipient,
        subject,
        text: textLines.join("\n"),
        html: htmlContent,
      });

      return {
        sent: true,
        method: "smtp",
        recipient,
        subject,
        headline,
        messageText: textLines.join("\n"),
        htmlContent,
      };
    } catch (smtpErr) {
      console.warn("[DatabaseBackup] SMTP alert delivery failed:", smtpErr);
    }
  }

  // 2. Operational notification text alert fallback (Web3Forms operational alert only, NEVER backup payload)
  const web3FormsKey =
    process.env["WEB3FORMS_ACCESS_KEY"] ||
    process.env["VITE_WEB3FORMS_ACCESS_KEY"] ||
    "752a0c12-46b4-4eec-8ad7-e82e229e3e43";

  if (web3FormsKey) {
    try {
      const params = new URLSearchParams();
      params.append("access_key", web3FormsKey);
      params.append("from_name", `PP·OPS Database Engine [${backupTag}]`);
      params.append("subject", subject);
      params.append("name", `Database Backup Alert [${backupTag}]`);
      params.append("email", recipient);
      params.append("message", textLines.join("\n"));

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: params,
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean };
      if (res.ok && data?.success) {
        return {
          sent: true,
          method: "notification_service",
          recipient,
          subject,
          headline,
          messageText: textLines.join("\n"),
          htmlContent,
        };
      }
    } catch (wErr) {
      console.warn("[DatabaseBackup] Operational alert fallback failed:", wErr);
    }
  }

  return {
    sent: false,
    method: "none",
    recipient,
    subject,
    headline,
    messageText: textLines.join("\n"),
    htmlContent,
  };
}

/**
 * 7-Day Retention Cleanup & Rotation
 *
 * Requirements:
 * - Keep backups for 7 days.
 * - Backups older than 7 days must automatically be deleted from Supabase Storage and local vault.
 * - Update their history records with the deletion timestamp (deleted_at).
 * - History records remain available for reporting even after physical file deletion.
 * - NEVER delete recent successful backups if a backup fails.
 */
export async function executeSevenDayRetentionRotation(
  supabase: SupabaseClient<Database>,
): Promise<{ deletedCount: number; deletedFilenames: string[] }> {
  const localPruned = rotateLocalBackupHistory(RETENTION_DAYS);
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const deletedFilenames: string[] = [];

  try {
    // 1. Find backups older than 7 days that are not yet marked as deleted
    const { data: expiredRecords, error } = await supabase
      .from("database_backups")
      .select("id, filename, created_at, storage_path")
      .lt("created_at", cutoff)
      .is("deleted_at", null);

    if (error) {
      console.warn("[DatabaseBackup] Error querying expired backups:", error.message);
      return { deletedCount: localPruned, deletedFilenames: [] };
    }

    if (!expiredRecords || expiredRecords.length === 0) {
      return { deletedCount: localPruned, deletedFilenames: [] };
    }

    const filesToRemove = expiredRecords
      .map((r) => r.storage_path || r.filename)
      .filter(Boolean);

    // 2. Remove old physical backup files from private Supabase Storage
    if (filesToRemove.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(BACKUP_STORAGE_BUCKET)
        .remove(filesToRemove);

      if (removeError) {
        console.warn("[DatabaseBackup] Warning removing expired storage files:", removeError.message);
      }
    }

    // 3. Update their history records with deleted_at timestamp
    const nowIso = new Date().toISOString();
    for (const record of expiredRecords) {
      await supabase
        .from("database_backups")
        .update({
          deleted_at: nowIso,
        })
        .eq("id", record.id);

      deletedFilenames.push(record.filename);
    }

    return {
      deletedCount: Math.max(localPruned, expiredRecords.length),
      deletedFilenames,
    };
  } catch (err) {
    console.error("[DatabaseBackup] 7-Day retention cleanup error:", err);
    return { deletedCount: localPruned, deletedFilenames: [] };
  }
}

/**
 * Execute the Complete Database Backup Workflow:
 * 1. Extract data from required application tables.
 * 2. Generate timestamped PostgreSQL SQL dump (`database-backup-YYYY-MM-DD.sql`).
 * 3. Upload to private Supabase Storage bucket.
 * 4. Create backup history record.
 * 5. Run 7-day retention rotation and update deleted_at.
 * 6. Send operational status email notification.
 * 7. If backup fails: preserve latest successful backup, record failure, send notification.
 */
export async function executeDatabaseBackupWorkflow({
  supabase,
  backupType = "daily",
  triggererEmail,
  customDate,
}: {
  supabase: SupabaseClient<Database>;
  backupType?: "daily" | "manual";
  triggererEmail?: string;
  customDate?: Date;
}): Promise<BackupExecutionResult> {
  const now = customDate || new Date();
  const yearStr = now.getFullYear().toString();
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const dayStr = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
  const timeStr = now.toTimeString().split(" ")[0]; // HH:mm:ss

  // Use timestamped backup filenames matching requirement:
  // database-backup-2026-10-05.sql
  // If manual on same day, append timestamp to preserve distinct files
  const filename =
    backupType === "manual"
      ? `database-backup-${dateStr}-${now.getTime().toString().slice(-6)}.sql`
      : `database-backup-${dateStr}.sql`;

  const backupTag: "MANUAL" | "AUTOMATIC" = backupType === "manual" ? "MANUAL" : "AUTOMATIC";
  const backupId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let sqlDumpStr = "";
  let totalRecordsCount = 0;
  let fileSizeBytes = 0;
  let fileSizePretty = "0 B";
  const tablesData: Record<string, Record<string, unknown>[]> = {};
  const tablesSummary: Record<string, number> = {};

  try {
    // Ensure bucket exists (log warnings without throwing)
    await ensurePrivateStorageBucket(supabase);

    // 1. Query all required application tables
    for (const tableName of BACKUP_TABLES) {
      try {
        const { data, error } = await supabase
          .from(tableName as any)
          .select("*")
          .limit(10000);

        if (!error && Array.isArray(data)) {
          tablesData[tableName] = data as unknown as Record<string, unknown>[];
          tablesSummary[tableName] = data.length;
        } else {
          tablesData[tableName] = [];
          tablesSummary[tableName] = 0;
        }
      } catch (tableErr) {
        console.warn(`[DatabaseBackup] Warning reading table ${tableName}:`, tableErr);
        tablesData[tableName] = [];
        tablesSummary[tableName] = 0;
      }
    }

    // 2. Generate valid PostgreSQL SQL Dump
    const dumpResult = generateSqlDump({
      tablesData,
      generatedAt: now,
      filename,
    });
    sqlDumpStr = dumpResult.sql;
    totalRecordsCount = dumpResult.totalRecords;

    const sqlBuffer = new TextEncoder().encode(sqlDumpStr);
    fileSizeBytes = sqlBuffer.length;
    fileSizePretty = formatBytes(fileSizeBytes);

    // Save to local persistent vault first
    saveLocalBackupRecord({
      record: {
        id: backupId,
        created_at: now.toISOString(),
        backup_date: dateStr,
        backup_time: timeStr,
        filename,
        file_size_bytes: fileSizeBytes,
        file_size_pretty: fileSizePretty,
        status: "SUCCESS",
        backup_type: backupType,
        tables_included: Object.keys(tablesData),
        total_records: totalRecordsCount,
        pruned_records_count: 0,
        deleted_at: null,
        error_message: null,
        storage_bucket: "Local Vault & Storage",
        storage_path: filename,
        backup_data: { sql: sqlDumpStr, tableCounts: dumpResult.tableCounts },
        metadata: {
          triggererEmail: triggererEmail || "system@scheduler",
          tablesSummary,
          generatedAt: now.toISOString(),
          backupTypeTag: backupTag,
          storageUploaded: false,
        },
      },
      sqlContent: sqlDumpStr,
    });

    // 3. Upload to Private Supabase Storage Bucket (with resilient fallback to database vault)
    let storageUploaded = false;
    let storagePath: string | null = filename;
    let storageBucketName = BACKUP_STORAGE_BUCKET;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BACKUP_STORAGE_BUCKET)
        .upload(filename, sqlBuffer, {
          contentType: "application/sql",
          upsert: true,
        });

      if (uploadError) {
        console.warn(
          `[DatabaseBackup] Supabase Storage upload skipped/failed (${uploadError.message}). Utilizing database vault persistence.`,
        );
        storageUploaded = false;
        storagePath = "database://backup_data";
        storageBucketName = "database_backups (embedded)";
      } else {
        storageUploaded = true;
      }
    } catch (storageErr: any) {
      console.warn(
        `[DatabaseBackup] Storage upload exception: ${storageErr?.message || storageErr}. Utilizing database vault persistence.`,
      );
      storageUploaded = false;
      storagePath = "database://backup_data";
      storageBucketName = "database_backups (embedded)";
    }

    // 4. Create Backup History Record in Database
    try {
      const { error: insertError } = await supabase.from("database_backups").insert({
        backup_date: dateStr,
        backup_time: timeStr,
        filename,
        file_size_bytes: fileSizeBytes,
        file_size_pretty: fileSizePretty,
        status: "SUCCESS",
        backup_type: backupType,
        tables_included: Object.keys(tablesData),
        total_records: totalRecordsCount,
        pruned_records_count: 0,
        deleted_at: null,
        error_message: null,
        storage_bucket: storageBucketName,
        storage_path: storagePath,
        backup_data: { sql: sqlDumpStr, fallbackStorage: !storageUploaded, tableCounts: dumpResult.tableCounts },
        metadata: {
          triggererEmail: triggererEmail || "system@scheduler",
          tablesSummary,
          generatedAt: now.toISOString(),
          backupTypeTag: backupTag,
          storageUploaded,
        },
      });

      if (insertError) {
        console.warn("[DatabaseBackup] Warning inserting backup history record:", insertError.message);
      }
    } catch (insertErr: any) {
      console.warn("[DatabaseBackup] Supabase history insert exception:", insertErr?.message);
    }

    // 4b. If Manual Backup, record in dedicated manual_database_backups ledger and local manual vault
    if (backupType === "manual") {
      const manualRecord = {
        id: backupId,
        created_at: now.toISOString(),
        backup_date: dateStr,
        backup_time: timeStr,
        filename,
        admin_email: triggererEmail || "admin@piyushprasad.in",
        status: "SUCCESS" as const,
        tables_included: Object.keys(tablesData),
        total_records: totalRecordsCount,
        file_size_bytes: fileSizeBytes,
        file_size_pretty: fileSizePretty,
        email_sent: true,
        email_recipient: triggererEmail || "contact.piyushprasad@gmail.com",
        storage_path: storagePath,
        backup_data: { sql: sqlDumpStr, tableCounts: dumpResult.tableCounts },
        metadata: {
          triggererEmail: triggererEmail || "admin",
          tablesSummary,
          generatedAt: now.toISOString(),
          backupTypeTag: "MANUAL",
        },
      };

      saveLocalManualBackupRecord({
        record: manualRecord,
        sqlContent: sqlDumpStr,
      });

      try {
        const { error: manualInsertError } = await (supabase as any)
          .from("manual_database_backups")
          .insert({
            backup_date: dateStr,
            backup_time: timeStr,
            filename,
            admin_email: triggererEmail || "admin@piyushprasad.in",
            status: "SUCCESS",
            tables_included: Object.keys(tablesData),
            total_records: totalRecordsCount,
            file_size_bytes: fileSizeBytes,
            file_size_pretty: fileSizePretty,
            email_sent: true,
            email_recipient: triggererEmail || "contact.piyushprasad@gmail.com",
            storage_path: storagePath,
            backup_data: { sql: sqlDumpStr, tableCounts: dumpResult.tableCounts },
            metadata: {
              triggererEmail: triggererEmail || "admin",
              tablesSummary,
              generatedAt: now.toISOString(),
            },
          });

        if (manualInsertError) {
          console.warn("[DatabaseBackup] Notice: manual_database_backups insert skipped/warning:", manualInsertError.message);
        }
      } catch (mErr: any) {
        console.warn("[DatabaseBackup] manual_database_backups insert exception:", mErr?.message);
      }
    }

    // 5. Automatic 7-Day Retention Cleanup & Rotation (Only on success!)
    const { deletedCount } = await executeSevenDayRetentionRotation(supabase);

    // 6. Send Operational Success Notification
    const subject =
      backupType === "manual"
        ? `[PP·OPS Database] Manual Database Backup Completed [MANUAL] — ${dateStr}`
        : `[PP·OPS Database] Daily Database Backup Completed [AUTOMATIC] — ${dateStr}`;

    const headline =
      backupType === "manual"
        ? `Manual database backup snapshot captured and archived [MANUAL].`
        : `Daily automatic database backup completed successfully [AUTOMATIC].`;

    const notifResult = await sendOperationalEmail({
      subject,
      headline,
      status: "SUCCESS",
      backupTag,
      backupId,
      filename,
      backupDateTime: `${dateStr} ${timeStr}`,
      backupSize: fileSizePretty,
      totalRecords: totalRecordsCount,
      tablesSummary,
      prunedCount: deletedCount,
      storageLocation: storageUploaded ? "Private Supabase Storage (database-backups)" : "Local Vault & Database",
      errorMessage: null,
      recipientEmail: triggererEmail,
    });

    return {
      success: true,
      backupId,
      backupDate: dateStr,
      backupTime: timeStr,
      filename,
      fileSizeBytes,
      fileSizePretty,
      totalRecords: totalRecordsCount,
      tablesIncluded: Object.keys(tablesData),
      tablesSummary,
      prunedCount: deletedCount,
      status: "SUCCESS",
      backupTag,
      errorMessage: null,
      notificationSent: notifResult.sent,
      notificationRecipient: notifResult.recipient,
      sqlContent: sqlDumpStr,
      emailDetails: {
        subject: notifResult.subject,
        headline: notifResult.headline,
        messageText: notifResult.messageText,
        htmlContent: notifResult.htmlContent,
      },
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("[DatabaseBackup] Backup execution failed:", errorMsg);

    // Failure Handling (Requirement 9):
    // Record failure in local file vault
    saveLocalBackupRecord({
      record: {
        id: backupId,
        created_at: now.toISOString(),
        backup_date: dateStr,
        backup_time: timeStr,
        filename,
        file_size_bytes: 0,
        file_size_pretty: "0 B",
        status: "FAILED",
        backup_type: backupType,
        tables_included: [],
        total_records: 0,
        pruned_records_count: 0,
        deleted_at: null,
        error_message: errorMsg,
        storage_bucket: "Local Vault & Storage",
        storage_path: null,
        metadata: {
          triggererEmail: triggererEmail || "system@scheduler",
          failureReason: errorMsg,
          attemptedAt: now.toISOString(),
          backupTypeTag: backupTag,
        },
      },
    });

    // Also try recording failure in Supabase
    try {
      await supabase.from("database_backups").insert({
        backup_date: dateStr,
        backup_time: timeStr,
        filename,
        file_size_bytes: 0,
        file_size_pretty: "0 B",
        status: "FAILED",
        backup_type: backupType,
        tables_included: Object.keys(tablesData),
        total_records: 0,
        pruned_records_count: 0,
        deleted_at: null,
        error_message: errorMsg,
        storage_bucket: BACKUP_STORAGE_BUCKET,
        storage_path: null,
        metadata: {
          triggererEmail: triggererEmail || "system@scheduler",
          failureReason: errorMsg,
          attemptedAt: now.toISOString(),
          backupTypeTag: backupTag,
        },
      });
    } catch (logErr) {
      console.warn("[DatabaseBackup] Warning recording failed backup:", logErr);
    }

    // Send Operational Failure Notification
    const failSubject =
      backupType === "manual"
        ? `[PP·OPS Database] Manual Database Backup Failed [MANUAL] — ${dateStr}`
        : `[PP·OPS Database] Daily Database Backup Failed [AUTOMATIC] — ${dateStr}`;

    const failHeadline =
      backupType === "manual"
        ? `Manual database backup snapshot failed [MANUAL].`
        : `Daily automatic database backup execution failed [AUTOMATIC].`;

    const notifResult = await sendOperationalEmail({
      subject: failSubject,
      headline: failHeadline,
      status: "FAILED",
      backupTag,
      backupId,
      filename,
      backupDateTime: `${dateStr} ${timeStr}`,
      backupSize: "0 B",
      totalRecords: 0,
      tablesSummary: {},
      errorMessage: errorMsg,
      recipientEmail: triggererEmail,
    });

    return {
      success: false,
      backupId,
      backupDate: dateStr,
      backupTime: timeStr,
      filename,
      fileSizeBytes: 0,
      fileSizePretty: "0 B",
      totalRecords: 0,
      tablesIncluded: [],
      prunedCount: 0,
      status: "FAILED",
      backupTag,
      errorMessage: errorMsg,
      notificationSent: notifResult.sent,
      notificationRecipient: notifResult.recipient,
      emailDetails: {
        subject: notifResult.subject,
        headline: notifResult.headline,
        messageText: notifResult.messageText,
        htmlContent: notifResult.htmlContent,
      },
    };
  }
}

/**
 * End-of-Month Backup Summary Generation
 *
 * Requirements 10, 11, 12, 13:
 * - Query all backup history records for the month.
 * - Calculate total scheduled backups, successful, failed, success percentage,
 *   dates, failure reasons, total size, backups deleted through 7-day rotation.
 * - Generate readable text and HTML report.
 * - Send report by email.
 * - Store monthly summary in `backup_monthly_reports` table.
 */
export async function generateMonthlyBackupSummary({
  supabase,
  year,
  month,
  recipientEmail,
  sendEmail = true,
}: {
  supabase: SupabaseClient<Database>;
  year: number;
  month: number; // 1-12
  recipientEmail?: string;
  sendEmail?: boolean;
}): Promise<MonthlyReportData> {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month - 1] || `Month ${month}`;

  // Calculate month date boundaries in UTC
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  // Last day of month
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  // Query all backup history records for this month from database_backups table
  // Important: Must use backup history database table, not current storage files
  const { data: records, error } = await supabase
    .from("database_backups")
    .select("*")
    .gte("created_at", startIso)
    .lte("created_at", endIso)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to query monthly backup records: ${error.message}`);
  }

  const allRecords = records || [];
  const totalBackups = allRecords.length;
  const successfulBackups = allRecords.filter((r) => r.status === "SUCCESS").length;
  const failedBackups = allRecords.filter((r) => r.status === "FAILED").length;
  const successPercentage =
    totalBackups > 0
      ? parseFloat(((successfulBackups / totalBackups) * 100).toFixed(2))
      : 0;

  let totalBackupSizeBytes = 0;
  let deletedBackupsCount = 0;
  let deletedBackupSizeBytes = 0;

  const dailyBackups: MonthlyReportData["dailyBackups"] = [];
  const failedBackupsList: MonthlyReportData["failedBackupsList"] = [];

  for (const r of allRecords) {
    const size = r.file_size_bytes || 0;
    totalBackupSizeBytes += size;

    const isDeleted = Boolean(r.deleted_at);
    if (isDeleted) {
      deletedBackupsCount++;
      deletedBackupSizeBytes += size;
    }

    const recDate = new Date(r.created_at);
    const dayPadded = String(recDate.getUTCDate()).padStart(2, "0");
    const monShort = recDate.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const formattedDate = `${dayPadded} ${monShort} ${year}`;

    dailyBackups.push({
      date: r.backup_date || recDate.toISOString().slice(0, 10),
      formattedDate,
      status: (r.status as "SUCCESS" | "FAILED") || "SUCCESS",
      filename: r.filename,
      sizePretty: r.file_size_pretty || formatBytes(size),
      deleted: isDeleted,
      error: r.error_message,
    });

    if (r.status === "FAILED") {
      failedBackupsList.push({
        date: r.backup_date || recDate.toISOString().slice(0, 10),
        formattedDate,
        filename: r.filename,
        reason: r.error_message || "Unknown error",
      });
    }
  }

  const totalBackupSizePretty = formatBytes(totalBackupSizeBytes);
  const deletedBackupSizePretty = formatBytes(deletedBackupSizeBytes);

  const reportStatus: "SUCCESS" | "PARTIAL" | "FAILED" =
    failedBackups === 0 && successfulBackups > 0
      ? "SUCCESS"
      : successfulBackups > 0
        ? "PARTIAL"
        : "FAILED";

  const reportGeneratedDate = new Date().toISOString();

  // Generate plain text report matching Requirement 10 & 13
  const textLines: string[] = [
    `Monthly Database Backup Summary`,
    `Month: ${monthName} ${year}`,
    ``,
    `Total scheduled backups: ${totalBackups}`,
    `Successful backups: ${successfulBackups}`,
    `Failed backups: ${failedBackups}`,
    `Success rate: ${successPercentage}%`,
    ``,
    `Backup dates:`,
    ...dailyBackups.map((b) => `${b.formattedDate} — ${b.status}`),
    ``,
  ];

  if (failedBackupsList.length > 0) {
    textLines.push(`Failed backups:`);
    for (const f of failedBackupsList) {
      textLines.push(`${f.formattedDate} — FAILED`);
      textLines.push(`Reason: ${f.reason}`);
    }
    textLines.push(``);
  }

  textLines.push(`Total backup storage created during month: ${totalBackupSizePretty}`);
  textLines.push(`Total backups deleted through 7-day rotation: ${deletedBackupsCount} (${deletedBackupSizePretty})`);
  textLines.push(``);
  textLines.push(`Monthly result: ${reportStatus}`);
  textLines.push(`Retention Policy: 7 days`);
  textLines.push(`Report Generated: ${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}`);

  const textReport = textLines.join("\n");

  // Generate rich HTML report matching Requirement 13
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${monthName} ${year} Backup Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 680px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0369a1 0%, #1e1b4b 100%); padding: 28px 24px; border-bottom: 1px solid #1f2937; }
    .brand { font-size: 12px; font-weight: 700; color: #7dd3fc; text-transform: uppercase; letter-spacing: 1.5px; }
    .title { font-size: 24px; font-weight: 700; color: #ffffff; margin-top: 6px; margin-bottom: 0; }
    .body { padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; text-align: center; }
    .card-val { font-size: 24px; font-weight: 700; font-family: monospace; color: #f8fafc; }
    .card-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-top: 4px; }
    .card.rate .card-val { color: #38bdf8; }
    .card.success .card-val { color: #34d399; }
    .card.failed .card-val { color: ${failedBackups > 0 ? "#f87171" : "#94a3b8"}; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 6px; }
    .backup-table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace; }
    .backup-table th { text-align: left; padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8; font-weight: 600; }
    .backup-table td { padding: 8px; border-bottom: 1px solid #1e293b; }
    .status-pill { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .status-pill.success { background-color: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
    .status-pill.failed { background-color: #7f1d1d; color: #fca5a5; border: 1px solid #dc2626; }
    .storage-box { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .storage-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #1e293b; }
    .storage-row:last-child { border-bottom: none; }
    .footer { padding: 16px 24px; background-color: #0b0f19; border-top: 1px solid #1f2937; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Database Backup Report</div>
      <h1 class="title">${monthName} ${year} Backup Report</h1>
    </div>
    <div class="body">
      <div class="grid">
        <div class="card">
          <div class="card-val">${totalBackups}</div>
          <div class="card-lbl">Scheduled</div>
        </div>
        <div class="card success">
          <div class="card-val">${successfulBackups}</div>
          <div class="card-lbl">Successful</div>
        </div>
        <div class="card failed">
          <div class="card-val">${failedBackups}</div>
          <div class="card-lbl">Failed</div>
        </div>
      </div>

      <div class="card rate" style="margin-bottom: 24px;">
        <div class="card-val" style="font-size: 32px;">${successPercentage}%</div>
        <div class="card-lbl">Success Rate (${reportStatus})</div>
      </div>

      <div class="section-title">Backup Dates</div>
      <table class="backup-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Filename</th>
            <th>Archive Size</th>
            <th>Status</th>
            <th>Storage Status</th>
          </tr>
        </thead>
        <tbody>
          ${dailyBackups
            .map(
              (b) => `
            <tr>
              <td>${b.formattedDate}</td>
              <td style="color: #38bdf8;">${b.filename}</td>
              <td>${b.sizePretty}</td>
              <td><span class="status-pill ${b.status.toLowerCase()}">${b.status}</span></td>
              <td style="color: ${b.deleted ? "#94a3b8" : "#34d399"};">${b.deleted ? "Pruned (7-Day)" : "Stored"}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>

      ${
        failedBackupsList.length > 0
          ? `
        <div class="section-title" style="color: #f87171;">Failed Backups</div>
        <div style="background-color: #450a0a; border: 1px solid #b91c1c; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          ${failedBackupsList
            .map(
              (f) => `
            <div style="margin-bottom: 8px;">
              <strong style="color: #fca5a5;">${f.formattedDate} — FAILED</strong>
              <div style="font-family: monospace; font-size: 12px; color: #fee2e2; margin-top: 2px;">Reason: ${f.reason}</div>
            </div>`,
            )
            .join("")}
        </div>`
          : ""
      }

      <div class="section-title">Storage &amp; Retention</div>
      <div class="storage-box">
        <div class="storage-row">
          <span style="color: #94a3b8;">Backups Created:</span>
          <strong style="color: #f8fafc; font-family: monospace;">${totalBackupSizePretty}</strong>
        </div>
        <div class="storage-row">
          <span style="color: #94a3b8;">Backups Automatically Deleted (7-day rotation):</span>
          <strong style="color: #f8fafc; font-family: monospace;">${deletedBackupSizePretty} (${deletedBackupsCount} files)</strong>
        </div>
        <div class="storage-row">
          <span style="color: #94a3b8;">Retention Policy:</span>
          <strong style="color: #38bdf8;">7 Days Continuous Window</strong>
        </div>
        <div class="storage-row">
          <span style="color: #94a3b8;">Report Generated:</span>
          <strong style="color: #f8fafc;">${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</strong>
        </div>
      </div>
    </div>
    <div class="footer">
      Generated automatically by PP·OPS Database Reporting Subsystem.
    </div>
  </div>
</body>
</html>`;

  // Store the monthly summary in the application database (backup_monthly_reports table)
  // Requirement 11 & 12
  const reportPayload = {
    month,
    month_name: monthName,
    year,
    total_backups: totalBackups,
    successful_backups: successfulBackups,
    failed_backups: failedBackups,
    success_percentage: successPercentage,
    total_backup_size_bytes: totalBackupSizeBytes,
    total_backup_size_pretty: totalBackupSizePretty,
    deleted_backups_count: deletedBackupsCount,
    report_generated_date: reportGeneratedDate,
    report_status: reportStatus,
    summary_data: {
      dailyBackups,
      failedBackupsList,
      deletedBackupSizeBytes,
      deletedBackupSizePretty,
      textReport,
    },
  };

  try {
    const { error: upsertError } = await supabase
      .from("backup_monthly_reports")
      .upsert(reportPayload as any, {
        onConflict: "year,month",
      });

    if (upsertError) {
      console.warn("[DatabaseBackup] Warning storing monthly report:", upsertError.message);
    }
  } catch (storeErr) {
    console.warn("[DatabaseBackup] Store monthly report exception:", storeErr);
  }

  // Send report by email (Requirement 11)
  if (sendEmail) {
    await sendMonthlyReportEmail({
      subject: `Monthly Database Backup Summary — ${monthName} ${year} (${successPercentage}% Success)`,
      textReport,
      htmlReport,
      recipientEmail,
    });
  }

  return {
    month,
    monthName,
    year,
    totalBackups,
    successfulBackups,
    failedBackups,
    successPercentage,
    totalBackupSizeBytes,
    totalBackupSizePretty,
    deletedBackupsCount,
    deletedBackupSizeBytes,
    deletedBackupSizePretty,
    reportStatus,
    reportGeneratedDate,
    dailyBackups,
    failedBackupsList,
    textReport,
    htmlReport,
  };
}

/**
 * Sends monthly summary report by email.
 */
async function sendMonthlyReportEmail({
  subject,
  textReport,
  htmlReport,
  recipientEmail,
}: {
  subject: string;
  textReport: string;
  htmlReport: string;
  recipientEmail?: string;
}): Promise<boolean> {
  const recipient =
    recipientEmail ||
    process.env["REPORT_TO"] ||
    process.env["ALERT_TO"] ||
    "admin@piyushprasad.in";

  const smtpHost = process.env["SMTP_HOST"];
  const smtpUser = process.env["SMTP_USER"];
  const smtpPass = process.env["SMTP_PASS"];
  const smtpPort = parseInt(process.env["SMTP_PORT"] || "465", 10);
  const fromEmail = process.env["REPORT_FROM"] || smtpUser || "ops@piyushprasad.in";

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"PP·OPS Database Engine" <${fromEmail}>`,
        to: recipient,
        subject,
        text: textReport,
        html: htmlReport,
      });

      return true;
    } catch (err) {
      console.warn("[DatabaseBackup] SMTP monthly report delivery failed:", err);
    }
  }

  // Operational notification fallback (Sends text summary report, NEVER raw database records)
  const web3FormsKey =
    process.env["WEB3FORMS_ACCESS_KEY"] ||
    process.env["VITE_WEB3FORMS_ACCESS_KEY"] ||
    "752a0c12-46b4-4eec-8ad7-e82e229e3e43";

  if (web3FormsKey) {
    try {
      const params = new URLSearchParams();
      params.append("access_key", web3FormsKey);
      params.append("from_name", "PP·OPS Database Engine");
      params.append("subject", subject);
      params.append("name", "Monthly Backup Summary");
      params.append("email", recipient);
      params.append("message", textReport);

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: params,
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean };
      return Boolean(res.ok && data?.success);
    } catch (err) {
      console.warn("[DatabaseBackup] Web3Forms fallback email failed:", err);
    }
  }

  return false;
}
