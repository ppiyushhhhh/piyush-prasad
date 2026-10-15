import { useState, useEffect } from "react";
import { Sliders, Shield, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { RateLimitConfig } from "@/lib/rate-limiter.server";

interface EditRateLimitConfigDialogProps {
  config: RateLimitConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: {
    id: RateLimitConfig["id"];
    max_requests: number;
    window_seconds: number;
    enabled: boolean;
  }) => Promise<void>;
}

export function EditRateLimitConfigDialog({
  config,
  isOpen,
  onClose,
  onSave,
}: EditRateLimitConfigDialogProps) {
  const [maxRequests, setMaxRequests] = useState<number>(60);
  const [windowSeconds, setWindowSeconds] = useState<number>(60);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setMaxRequests(config.max_requests);
      setWindowSeconds(config.window_seconds);
      setEnabled(config.enabled);
      setConfirmed(false);
      setError(null);
    }
  }, [config, isOpen]);

  if (!config) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) {
      setError("Please check the confirmation box before saving rate limit changes.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        id: config!.id,
        max_requests: Number(maxRequests),
        window_seconds: Number(windowSeconds),
        enabled,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to update configuration.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const effectiveRate = Math.round((maxRequests / (windowSeconds / 60)) * 10) / 10;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md bg-white border-[#E5E5DF] text-carbon shadow-xl rounded-sm p-6">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center border border-cobalt/30 bg-cobalt/5 text-cobalt">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="mono text-sm font-bold uppercase tracking-wider text-carbon">
                Configure Rule // {config.name}
              </DialogTitle>
              <DialogDescription className="mono text-[10px] uppercase text-muted-foreground tracking-widest">
                Tier: {config.id} &bull; Target: {config.endpoint_pattern}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-sm border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="mono block text-xs font-semibold uppercase tracking-wider text-carbon mb-1">
                Max Requests Allowed
              </label>
              <input
                type="number"
                min={1}
                max={50000}
                required
                value={maxRequests}
                onChange={(e) => setMaxRequests(parseInt(e.target.value) || 1)}
                className="w-full rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs font-mono text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
              />
              <p className="mono text-[10px] text-muted-foreground mt-1">
                Permitted requests within the time window before HTTP 429 is enforced.
              </p>
            </div>

            <div>
              <label className="mono block text-xs font-semibold uppercase tracking-wider text-carbon mb-1">
                Time Window (Seconds)
              </label>
              <input
                type="number"
                min={1}
                max={86400}
                required
                value={windowSeconds}
                onChange={(e) => setWindowSeconds(parseInt(e.target.value) || 1)}
                className="w-full rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs font-mono text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
              />
              <p className="mono text-[10px] text-muted-foreground mt-1">
                Sliding window duration (e.g. 60 = 1 minute, 300 = 5 minutes, 3600 = 1 hour).
              </p>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="mono text-xs font-bold text-carbon">Tier Protection Status</span>
                  <p className="mono text-[10px] text-muted-foreground">
                    Enable or bypass throttling for this specific tier
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`mono px-3 py-1 text-[11px] font-bold rounded-xs transition-colors ${
                    enabled
                      ? "bg-emerald-600 text-white"
                      : "bg-[#E5E5DF] text-muted-foreground hover:bg-carbon/20"
                  }`}
                >
                  {enabled ? "ACTIVE" : "BYPASSED"}
                </button>
              </div>
            </div>

            {/* Calculated Rate Preview */}
            <div className="flex items-center justify-between border-t border-dashed border-[#E5E5DF] pt-2 text-xs">
              <span className="mono text-[11px] text-muted-foreground">Effective Throughput:</span>
              <span className="mono text-[11px] font-bold text-cobalt">
                {effectiveRate} requests / minute
              </span>
            </div>

            {/* Admin Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded-xs border-[#E5E5DF] text-cobalt focus:ring-cobalt"
              />
              <span className="text-[11px] text-muted-foreground leading-tight select-none">
                I confirm that updating these rate limits directly affects live production traffic.
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
              type="submit"
              disabled={isSubmitting || !confirmed}
              className="mono flex items-center gap-1.5 rounded-sm bg-cobalt px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  Apply Limits
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
