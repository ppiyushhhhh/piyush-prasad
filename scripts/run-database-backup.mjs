#!/usr/bin/env node

/**
 * PP·OPS Database Backup & Retention Automated Runner
 *
 * Runs daily via GitHub Actions or system cron.
 * 1. Creates a clean PostgreSQL .sql backup archive of required application tables.
 * 2. Uploads the backup file to a private Supabase Storage bucket (`database-backups`).
 * 3. Records detailed execution history in public.database_backups.
 * 4. Prunes backups older than 7 days from Supabase Storage and marks deleted_at.
 * 5. Dispatches operational status email notifications (Success / Failed, NO backup payload).
 * 6. At month end (or with --monthly flag), generates, stores, and emails the monthly summary.
 */

import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// Parse CLI flags
const args = process.argv.slice(2);
const isManual = args.includes("--manual");
const isMonthlyOnly = args.includes("--monthly");
const isSimulateFail = args.includes("--test-fail");
const forceMonthMatch = args.find((a) => a.startsWith("--month="))?.split("=")[1];
const forceYearMatch = args.find((a) => a.startsWith("--year="))?.split("=")[1];

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BACKUP_STORAGE_BUCKET = "database-backups";
const RETENTION_DAYS = 7;
const BACKUP_TABLES = [
  "website_health_checks",
  "performance_history",
  "deployment_history",
  "chat_activity",
  "health_reports",
  "user_roles",
  "admin_audit_log",
  "backup_monthly_reports",
];

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const num = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${num} ${sizes[i]}`;
}

function escapeSqlValue(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return Number.isFinite(val) ? val.toString() : "NULL";
  if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
  if (val instanceof Date) return `'${val.toISOString()}'::timestamptz`;
  if (Array.isArray(val)) {
    const elements = val.map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '\\"')}"` : String(v)));
    return `'${"{" + elements.join(",") + "}"}'`;
  }
  if (typeof val === "object") {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function ensurePrivateBucket() {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(BACKUP_STORAGE_BUCKET);
    if (!bucket || error) {
      await supabase.storage.createBucket(BACKUP_STORAGE_BUCKET, {
        public: false,
        fileSizeLimit: 524288000,
        allowedMimeTypes: ["application/sql", "text/plain", "text/x-sql", "application/octet-stream"],
      });
      console.log(`🔒 Created private Supabase Storage bucket: "${BACKUP_STORAGE_BUCKET}"`);
    }
  } catch (err) {
    console.warn("⚠️ Warning verifying/creating bucket:", err.message);
  }
}

async function sendOperationalEmail({ subject, headline, status, backupDateTime, backupSize, errorMessage }) {
  const recipient = process.env.REPORT_TO || process.env.ALERT_TO || "admin@piyushprasad.in";
  const isSuccess = status === "SUCCESS";

  const messageText = [
    `PP·OPS Database Administration Notification`,
    `============================================`,
    headline,
    ``,
    `Backup Date/Time: ${backupDateTime}`,
    `Status:          ${status}`,
    `Backup Size:     ${backupSize || "0 B"}`,
    ...(errorMessage ? [`Error Message:   ${errorMessage}`] : []),
    ``,
    `Storage Policy:   Private Supabase Storage Bucket (database-backups)`,
    `Retention Policy: 7-Day Rolling Rotation`,
    `Security:         Supabase Service Role (Server-Side Execution)`,
  ].join("\n");

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const fromEmail = process.env.REPORT_FROM || smtpUser || "ops@piyushprasad.in";

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
        text: messageText,
      });
      console.log(`📧 Operational email delivered via SMTP to: ${recipient}`);
      return true;
    } catch (err) {
      console.warn("⚠️ SMTP alert delivery warning:", err.message);
    }
  }

  // Fallback operational alert via Web3Forms (ONLY text status, NEVER backup data)
  const web3FormsKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (web3FormsKey) {
    try {
      const payload = new FormData();
      payload.append("access_key", web3FormsKey);
      payload.append("from_name", "PP·OPS Database Engine");
      payload.append("subject", subject);
      payload.append("name", "Database Operational Notification");
      payload.append("email", recipient);
      payload.append("message", messageText);

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      });
      if (res.ok) {
        console.log(`📧 Operational status notification delivered via notification gateway to: ${recipient}`);
        return true;
      }
    } catch (wErr) {
      console.warn("⚠️ Notification gateway warning:", wErr.message);
    }
  }

  return false;
}

async function run7DayRetentionRotation() {
  console.log("🧹 Evaluating 7-day retention rotation...");
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: expiredRecords, error } = await supabase
    .from("database_backups")
    .select("id, filename, created_at, storage_path")
    .lt("created_at", cutoff)
    .is("deleted_at", null);

  if (error) {
    console.warn("⚠️ Failed to query expired backups:", error.message);
    return 0;
  }

  if (!expiredRecords || expiredRecords.length === 0) {
    console.log("✅ No backups older than 7 days pending deletion.");
    return 0;
  }

  const filesToRemove = expiredRecords.map((r) => r.storage_path || r.filename).filter(Boolean);
  if (filesToRemove.length > 0) {
    const { error: rmErr } = await supabase.storage.from(BACKUP_STORAGE_BUCKET).remove(filesToRemove);
    if (rmErr) {
      console.warn("⚠️ Storage file deletion warning:", rmErr.message);
    } else {
      console.log(`🗑️ Deleted ${filesToRemove.length} expired physical backup file(s) from Supabase Storage:`, filesToRemove);
    }
  }

  const nowIso = new Date().toISOString();
  for (const r of expiredRecords) {
    await supabase.from("database_backups").update({ deleted_at: nowIso }).eq("id", r.id);
  }

  console.log(`✅ Updated ${expiredRecords.length} backup history records with deletion timestamp (deleted_at).`);
  return expiredRecords.length;
}

async function runMonthlyReport(targetYear, targetMonth) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = monthNames[targetMonth - 1] || `Month ${targetMonth}`;

  console.log(`📊 Generating Monthly Backup Summary for ${monthName} ${targetYear}...`);

  const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

  // Must query database_backups table, NOT current files in storage
  const { data: records, error } = await supabase
    .from("database_backups")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
      console.warn("⚠️ Note: Table 'public.database_backups' not yet applied to remote database.");
      console.warn("   Apply migration: supabase/migrations/20261005120000_supabase_backup_system.sql");
    } else {
      console.error("❌ Error querying monthly backup records:", error.message);
    }
  }

  const allRecords = (!error && records) ? records : [];
  const totalBackups = allRecords.length;
  const successfulBackups = allRecords.filter((r) => r.status === "SUCCESS").length;
  const failedBackups = allRecords.filter((r) => r.status === "FAILED").length;
  const successPercentage =
    totalBackups > 0 ? parseFloat(((successfulBackups / totalBackups) * 100).toFixed(2)) : 0;

  let totalSizeBytes = 0;
  let deletedCount = 0;
  let deletedBytes = 0;
  const dailyBackups = [];
  const failedBackupsList = [];

  for (const r of allRecords) {
    const size = r.file_size_bytes || 0;
    totalSizeBytes += size;
    const isDeleted = Boolean(r.deleted_at);
    if (isDeleted) {
      deletedCount++;
      deletedBytes += size;
    }

    const recDate = new Date(r.created_at);
    const dayPadded = String(recDate.getUTCDate()).padStart(2, "0");
    const monShort = recDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    const formattedDate = `${dayPadded} ${monShort} ${targetYear}`;

    dailyBackups.push({
      date: r.backup_date || recDate.toISOString().slice(0, 10),
      formattedDate,
      status: r.status || "SUCCESS",
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

  const totalSizePretty = formatBytes(totalSizeBytes);
  const deletedSizePretty = formatBytes(deletedBytes);
  const reportStatus =
    failedBackups === 0 && successfulBackups > 0
      ? "SUCCESS"
      : successfulBackups > 0
      ? "PARTIAL"
      : "FAILED";

  const textLines = [
    `Monthly Database Backup Summary`,
    `Month: ${monthName} ${targetYear}`,
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

  textLines.push(`Total backup storage created during month: ${totalSizePretty}`);
  textLines.push(`Total backups deleted through 7-day rotation: ${deletedCount} (${deletedSizePretty})`);
  textLines.push(``);
  textLines.push(`Monthly result: ${reportStatus}`);
  textLines.push(`Retention Policy: 7 days`);
  textLines.push(`Report Generated: ${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}`);

  const textReport = textLines.join("\n");
  console.log("\n" + textReport + "\n");

  // Save to backup_monthly_reports table
  const { error: upsertErr } = await supabase.from("backup_monthly_reports").upsert(
    {
      month: targetMonth,
      month_name: monthName,
      year: targetYear,
      total_backups: totalBackups,
      successful_backups: successfulBackups,
      failed_backups: failedBackups,
      success_percentage: successPercentage,
      total_backup_size_bytes: totalSizeBytes,
      total_backup_size_pretty: totalSizePretty,
      deleted_backups_count: deletedCount,
      report_generated_date: new Date().toISOString(),
      report_status: reportStatus,
      summary_data: {
        dailyBackups,
        failedBackupsList,
        deletedBackupSizeBytes: deletedBytes,
        deletedBackupSizePretty: deletedSizePretty,
        textReport,
      },
    },
    { onConflict: "year,month" }
  );

  if (upsertErr) {
    console.warn("⚠️ Warning persisting monthly report:", upsertErr.message);
  } else {
    console.log(`💾 Monthly report successfully stored in public.backup_monthly_reports.`);
  }

  // Dispatch monthly email
  const recipient = process.env.REPORT_TO || process.env.ALERT_TO || "admin@piyushprasad.in";
  const subject = `Monthly Database Backup Summary — ${monthName} ${targetYear} (${successPercentage}% Success)`;

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const fromEmail = process.env.REPORT_FROM || smtpUser || "ops@piyushprasad.in";

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
      });
      console.log(`📧 Monthly summary email sent to ${recipient}`);
    } catch (err) {
      console.warn("⚠️ SMTP monthly delivery warning:", err.message);
    }
  }

  return reportStatus;
}

async function main() {
  console.log("=================================================================");
  console.log("PP·OPS AUTOMATED DATABASE BACKUP & RETENTION SYSTEM");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log("=================================================================");

  const now = new Date();
  const targetYear = forceYearMatch ? parseInt(forceYearMatch, 10) : now.getFullYear();
  const targetMonth = forceMonthMatch ? parseInt(forceMonthMatch, 10) : now.getMonth() + 1;

  if (isMonthlyOnly) {
    await runMonthlyReport(targetYear, targetMonth);
    process.exit(0);
  }

  await ensurePrivateBucket();

  const yearStr = now.getFullYear().toString();
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const dayStr = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
  const timeStr = now.toTimeString().split(" ")[0];

  const filename = isManual
    ? `database-backup-${dateStr}-${now.getTime().toString().slice(-6)}.sql`
    : `database-backup-${dateStr}.sql`;

  try {
    if (isSimulateFail) {
      throw new Error("Simulated failure for testing failure handling policy.");
    }

    console.log(`📦 Creating daily database backup: "${filename}"...`);
    const tablesData = {};
    let totalRecords = 0;

    for (const tableName of BACKUP_TABLES) {
      const { data, error } = await supabase.from(tableName).select("*").limit(10000);
      if (!error && Array.isArray(data)) {
        tablesData[tableName] = data;
        totalRecords += data.length;
        console.log(`  • public.${tableName}: ${data.length} records`);
      } else {
        tablesData[tableName] = [];
        console.log(`  • public.${tableName}: 0 records (empty or table not found)`);
      }
    }

    // Generate valid PostgreSQL SQL dump
    const lines = [
      "-- =============================================================================",
      "-- PP·OPS AUTOMATED SUPABASE DATABASE BACKUP",
      `-- Filename:      ${filename}`,
      `-- Generated At:  ${now.toISOString()}`,
      `-- Format:        PostgreSQL SQL Dump`,
      `-- Tables:        ${Object.keys(tablesData).join(", ")}`,
      "-- =============================================================================",
      "",
      "BEGIN;",
      "",
    ];

    for (const [tbl, rows] of Object.entries(tablesData)) {
      lines.push(`-- Table: public.${tbl} (${rows.length} rows)`);
      if (rows.length === 0) continue;

      const colSet = new Set();
      for (const r of rows) for (const c of Object.keys(r)) colSet.add(c);
      const cols = Array.from(colSet);
      const colStr = cols.map((c) => `"${c}"`).join(", ");

      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        lines.push(`INSERT INTO public.${tbl} (${colStr}) VALUES`);
        const valueRows = batch.map((r) => `  (${cols.map((c) => escapeSqlValue(r[c])).join(", ")})`);
        lines.push(valueRows.join(",\n") + ";");
      }
      lines.push("");
    }

    lines.push("COMMIT;");
    const sqlContent = lines.join("\n");
    const sqlBuffer = Buffer.from(sqlContent, "utf8");
    const fileSizePretty = formatBytes(sqlBuffer.length);

    console.log(`💾 SQL Archive Size: ${fileSizePretty}, Records: ${totalRecords}`);

    // Upload to private Supabase Storage bucket
    const { error: uploadErr } = await supabase.storage
      .from(BACKUP_STORAGE_BUCKET)
      .upload(filename, sqlBuffer, {
        contentType: "application/sql",
        upsert: true,
      });

    if (uploadErr) {
      throw new Error(`Upload to storage failed: ${uploadErr.message}`);
    }

    console.log(`☁️ Uploaded successfully to private Supabase Storage: "${filename}"`);

    // Insert backup history record
    const { error: insertErr } = await supabase.from("database_backups").insert({
      backup_date: dateStr,
      backup_time: timeStr,
      filename,
      file_size_bytes: sqlBuffer.length,
      file_size_pretty: fileSizePretty,
      status: "SUCCESS",
      backup_type: isManual ? "manual" : "daily",
      tables_included: Object.keys(tablesData),
      total_records: totalRecords,
      pruned_records_count: 0,
      deleted_at: null,
      error_message: null,
      storage_bucket: BACKUP_STORAGE_BUCKET,
      storage_path: filename,
      metadata: {
        runner: "scripts/run-database-backup.mjs",
        executedAt: now.toISOString(),
      },
    });

    if (insertErr) {
      console.warn("⚠️ Backup history insert warning:", insertErr.message);
    } else {
      console.log(`📝 Logged backup record in public.database_backups.`);
    }

    // Execute 7-day retention rotation
    await run7DayRetentionRotation();

    // Operational success email
    await sendOperationalEmail({
      subject: "Daily database backup completed successfully",
      headline: "Daily database backup completed successfully.",
      status: "SUCCESS",
      backupDateTime: `${dateStr} ${timeStr}`,
      backupSize: fileSizePretty,
      errorMessage: null,
    });

    // Check if end of month
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isEndOfMonth = tomorrow.getMonth() !== now.getMonth();

    if (isEndOfMonth || args.includes("--end-of-month")) {
      console.log("📅 End-of-month detected! Triggering monthly backup summary...");
      await runMonthlyReport(now.getFullYear(), now.getMonth() + 1);
    }

    console.log("🎉 Complete database backup workflow finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error(`❌ Backup failed: ${err.message}`);

    // Failure Handling (Requirement 9):
    // Record failure, DO NOT delete previous backups, keep latest valid backup, send notification
    try {
      await supabase.from("database_backups").insert({
        backup_date: dateStr,
        backup_time: timeStr,
        filename,
        file_size_bytes: 0,
        file_size_pretty: "0 B",
        status: "FAILED",
        backup_type: isManual ? "manual" : "daily",
        tables_included: [],
        total_records: 0,
        pruned_records_count: 0,
        deleted_at: null,
        error_message: err.message,
        storage_bucket: BACKUP_STORAGE_BUCKET,
        storage_path: null,
        metadata: {
          runner: "scripts/run-database-backup.mjs",
          failureReason: err.message,
          attemptedAt: now.toISOString(),
        },
      });
      console.log("📝 Logged failure record in public.database_backups.");
    } catch (logErr) {
      console.warn("⚠️ Warning recording failure in database:", logErr.message);
    }

    await sendOperationalEmail({
      subject: "Daily database backup failed",
      headline: "Daily database backup failed.",
      status: "FAILED",
      backupDateTime: `${dateStr} ${timeStr}`,
      backupSize: "0 B",
      errorMessage: err.message,
    });

    process.exit(1);
  }
}

main();
