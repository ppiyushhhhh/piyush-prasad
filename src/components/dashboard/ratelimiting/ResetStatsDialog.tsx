import { useState } from "react";
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ResetStatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ResetStatsDialog({
  isOpen,
  onClose,
  onConfirm,
}: ResetStatsDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    if (!confirmed) {
      setError("You must acknowledge the warning checkbox before proceeding.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm();
      setConfirmed(false);
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to reset rate limiting statistics.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md bg-white border-[#E5E5DF] text-carbon shadow-xl rounded-sm p-6">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center border border-rose-300 bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="mono text-sm font-bold uppercase tracking-wider text-carbon">
                Reset Rate Limit Counters
              </DialogTitle>
              <DialogDescription className="mono text-[10px] uppercase text-rose-600 tracking-widest font-semibold">
                Privileged Operation // Irreversible Action
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          {error && (
            <div className="rounded-sm border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-amber-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Data Truncation Warning:
            </p>
            <p className="text-[11px] leading-relaxed">
              Resetting statistics will instantly clear all active IP client buckets, flush throttling quotas, and truncate historical rate-limit violation logs.
            </p>
          </div>

          <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded-xs border-[#E5E5DF] text-rose-600 focus:ring-rose-500"
            />
            <span className="text-[11px] text-carbon font-medium leading-tight select-none">
              I understand that all active sliding window counters and violation logs will be permanently deleted.
            </span>
          </label>
        </div>

        <DialogFooter className="border-t border-[#E5E5DF] pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="mono rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] px-3.5 py-1.5 text-xs font-semibold text-carbon hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !confirmed}
            onClick={handleReset}
            className="mono flex items-center gap-1.5 rounded-sm bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Resetting…
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Confirm Reset
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
