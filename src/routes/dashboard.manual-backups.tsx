import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  HardDrive,
  Loader2,
  Shield,
  ShieldAlert,
  Download,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getManualBackupsList,
  createManualBackup,
  getBackupDownloadData,
  checkAutomationBackupStatus,
  runAutomationDiagnosticTest,
  type ManualDatabaseBackupRecord,
  type AutomationBackupStatusResponse,
  type AutomationDiagnosticResult,
} from "@/lib/database-admin.functions";
import { ManualBackupsManager } from "@/components/dashboard/database/ManualBackupsManager";

export const Route = createFileRoute("/dashboard/manual-backups")({
  head: () => ({
    meta: [
      { title: "Manual Database Backups — PP · OPS Monitoring" },
      {
        name: "description",
        content: "Take on-demand database snapshots, inspect manual backup history, and check automated backup status.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ManualBackupsPage,
});

function ManualBackupsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Data state
  const [manualBackups, setManualBackups] = useState<ManualDatabaseBackupRecord[]>([]);
  const [automationStatus, setAutomationStatus] = useState<AutomationBackupStatusResponse | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<AutomationDiagnosticResult | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isTakingBackup, setIsTakingBackup] = useState(false);
  const [isTestingAutomation, setIsTestingAutomation] = useState(false);

  // Server functions
  const fetchManualBackups = useServerFn(getManualBackupsList);
  const runCreateBackup = useServerFn(createManualBackup);
  const fetchBackupDownload = useServerFn(getBackupDownloadData);
  const fetchAutomationStatus = useServerFn(checkAutomationBackupStatus);
  const runDiagTest = useServerFn(runAutomationDiagnosticTest);

  // 1. Verify caller admin role on mount
  useEffect(() => {
    let isMounted = true;
    async function checkRole() {
      try {
        setAuthChecking(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (isMounted) {
            setIsAdmin(false);
            setAuthChecking(false);
          }
          return;
        }

        // Query user_roles for current user
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (isMounted) {
          if (roleRow?.role === "admin") {
            setIsAdmin(true);
          } else {
            // Check if 0 admins exist (bootstrap initial admin access)
            const { count } = await supabase
              .from("user_roles")
              .select("id", { count: "exact", head: true })
              .eq("role", "admin");

            setIsAdmin(count === 0 || count === null);
          }
          setAuthChecking(false);
        }
      } catch (err) {
        console.error("Auth role check error:", err);
        if (isMounted) {
          setIsAdmin(true); // Let server function enforce strictly
          setAuthChecking(false);
        }
      }
    }

    checkRole();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load manual backups
  const loadManualBackups = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);
        const res = await fetchManualBackups();
        setManualBackups(res);
      } catch (err) {
        console.error("Failed to load manual backups:", err);
        if (!silent) {
          toast.error("Could not load manual backups: " + (err as Error).message);
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [fetchManualBackups],
  );

  // 3. Load automation status
  const loadAutomationStatus = useCallback(async () => {
    try {
      const res = await fetchAutomationStatus();
      setAutomationStatus(res);
    } catch (err) {
      console.warn("Could not check automation status:", err);
    }
  }, [fetchAutomationStatus]);

  useEffect(() => {
    if (isAdmin) {
      loadManualBackups();
      loadAutomationStatus();
    }
  }, [isAdmin, loadManualBackups, loadAutomationStatus]);

  // Handler: Take manual backup snapshot
  async function handleTakeManualBackup() {
    try {
      setIsTakingBackup(true);
      toast.info("Generating manual database snapshot…");
      const res = await runCreateBackup();

      // Trigger Web3Forms email fallback from client if server SMTP was not active
      if (!res.emailSent) {
        try {
          const web3Key =
            import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ||
            "752a0c12-46b4-4eec-8ad7-e82e229e3e43";
          if (web3Key && res.emailRecipient) {
            const formData = new FormData();
            formData.append("access_key", web3Key);
            formData.append("from_name", "PP·OPS Database Engine [MANUAL]");
            formData.append(
              "subject",
              res.emailDetails?.subject ||
                `[PP·OPS Database] Manual Database Backup Completed [MANUAL] — ${res.backupDate}`,
            );
            formData.append(
              "message",
              res.emailDetails?.messageText ||
                `PP·OPS DATABASE BACKUP NOTIFICATION [MANUAL]\nFilename: ${res.filename}\nRecords: ${res.totalRecordsBackedUp}\nSize: ${res.fileSizePretty}\nTime: ${res.backupDate} ${res.backupTime}`,
            );

            await fetch("https://api.web3forms.com/submit", {
              method: "POST",
              body: formData,
            }).catch(() => {});
          }
        } catch (notifErr) {
          console.warn("Operational notification client dispatch error:", notifErr);
        }
      }

      toast.success(
        `Manual backup "${res.filename}" generated (${res.fileSizePretty}, ${res.totalRecordsBackedUp} records)! Alert sent to ${res.emailRecipient}.`,
      );

      // Re-fetch manual backups so the new record appears immediately on the page!
      await loadManualBackups(true);
    } catch (err) {
      console.error("Manual backup error:", err);
      toast.error("Failed to generate manual backup: " + (err as Error).message);
    } finally {
      setIsTakingBackup(false);
    }
  }

  // Handler: Run automation diagnostics & test run
  async function handleTestAutomation() {
    try {
      setIsTestingAutomation(true);
      toast.info("Testing automated backup pipeline and checking health…");
      const res = await runDiagTest();
      setDiagnosticResult(res);

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }

      await loadAutomationStatus();
    } catch (err) {
      console.error("Automation test error:", err);
      toast.error("Failed to run automation diagnostics: " + (err as Error).message);
    } finally {
      setIsTestingAutomation(false);
    }
  }

  // Handler: Download backup file
  async function handleDownloadBackup(backupId: string) {
    try {
      toast.info("Retrieving backup download payload…");
      const res = await fetchBackupDownload({ data: { backupId } });
      const downloadPayload = res as {
        signedUrl?: string;
        sqlContent?: string;
        filename?: string;
        backupData?: unknown;
      };

      if (downloadPayload.signedUrl) {
        window.open(downloadPayload.signedUrl, "_blank");
        toast.success("Download started via secure signed URL!");
        return;
      }

      if (downloadPayload.sqlContent) {
        const blob = new Blob([downloadPayload.sqlContent], { type: "application/sql" });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = url;
        downloadAnchor.download = downloadPayload.filename || `database-backup-${backupId.slice(0, 8)}.sql`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast.success("PostgreSQL SQL backup downloaded successfully!");
        return;
      }

      if (downloadPayload.backupData) {
        const jsonStr = JSON.stringify(downloadPayload.backupData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = url;
        downloadAnchor.download = downloadPayload.filename || `database-backup-${backupId.slice(0, 8)}.json`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast.success("Backup downloaded successfully!");
        return;
      }

      throw new Error("No download payload received from storage.");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download backup: " + (err as Error).message);
    }
  }

  // Authentication Loading Screen
  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground mono text-xs gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cobalt" />
        <span>Verifying administrator permissions…</span>
      </div>
    );
  }

  // Access Wall
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center text-carbon">
        <div className="max-w-md w-full rounded-sm border border-[#E5E5DF] bg-white p-8 shadow-md">
          <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-sm bg-rose-50 border border-rose-200 text-rose-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-carbon">Administrator Role Required</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            The Manual Backups Console is restricted to authenticated accounts with verified{" "}
            <code className="mono text-cobalt bg-cobalt/10 px-1 py-0.5 rounded-sm">admin</code> privileges.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#121316] border border-[#121316] py-2.5 text-xs font-semibold text-white hover:bg-black transition-colors"
            >
              Return to Monitoring Overview
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E5E5DF] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-cobalt/10 border border-cobalt/20 text-cobalt">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-carbon">
                Manual Database Backups
              </h1>
              <span className="rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] mono text-emerald-700 border border-emerald-200 font-semibold">
                ON-DEMAND
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create on-demand database snapshots, inspect the manual backup ledger, and monitor automated daily schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Component */}
      <ManualBackupsManager
        manualBackups={manualBackups}
        automationStatus={automationStatus}
        isLoading={isLoading}
        isTakingBackup={isTakingBackup}
        isTestingAutomation={isTestingAutomation}
        onTakeManualBackup={handleTakeManualBackup}
        onRefresh={() => {
          loadManualBackups();
          loadAutomationStatus();
        }}
        onDownloadBackup={handleDownloadBackup}
        onTestAutomation={handleTestAutomation}
        diagnosticResult={diagnosticResult}
      />
    </div>
  );
}
