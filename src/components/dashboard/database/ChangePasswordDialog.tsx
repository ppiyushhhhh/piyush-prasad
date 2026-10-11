import { useState } from "react";
import { KeyRound, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AdminUserRecord } from "@/lib/database-admin.functions";

interface ChangePasswordDialogProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetUserId: string, newPassword: string) => Promise<void>;
}

export function ChangePasswordDialog({
  user,
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(user!.id, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      setError((err as Error).message ?? "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setError(null);
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md bg-white border-[#E5E5DF] text-carbon shadow-xl rounded-sm">
        <DialogHeader className="border-b border-[#E5E5DF] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-carbon">
                Change User Password
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set a new password for <span className="font-mono text-cobalt font-semibold">{user.email}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-sm border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-3 text-xs text-muted-foreground font-mono">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans font-semibold mb-1">
              Target User Identity
            </div>
            <div className="text-carbon font-semibold">{user.email}</div>
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">ID: {user.id}</div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-sm border border-[#E5E5DF] bg-white pl-9 pr-9 py-2 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none font-mono normal-case shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-carbon cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-sm border border-[#E5E5DF] bg-white pl-9 pr-3.5 py-2 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none font-mono normal-case shadow-2xs"
              />
            </div>
          </div>

          <div className="rounded-sm border border-cobalt/20 bg-cobalt/5 p-2.5 text-[11px] text-cobalt flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-cobalt shrink-0 mt-0.5" />
            <span>
              The existing password is never retrieved or displayed. The new password hash is updated directly via Supabase Auth Admin API.
            </span>
          </div>

          <DialogFooter className="pt-3 border-t border-[#E5E5DF] mt-6 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="rounded-sm border border-[#E5E5DF] bg-white px-4 py-2 text-xs font-mono font-medium text-carbon hover:bg-[#FAF9F6] disabled:opacity-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-sm bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating Password…
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  Update Password
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
