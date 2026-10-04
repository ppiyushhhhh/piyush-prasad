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
      <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-100">
                Change User Password
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Set a new password for <span className="font-mono text-cyan-400 font-semibold">{user.email}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400 font-mono">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-semibold mb-1">
              Target User Identity
            </div>
            <div className="text-slate-200">{user.email}</div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">ID: {user.id}</div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-md border border-slate-800 bg-slate-950 pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-md border border-slate-800 bg-slate-950 pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="rounded-md border border-cyan-950/80 bg-cyan-950/20 p-2.5 text-[11px] text-cyan-300 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              The existing password is never retrieved or displayed. The new password hash is updated directly via Supabase Auth Admin API.
            </span>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800 mt-6 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-sm"
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
