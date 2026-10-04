import { useState, useEffect } from "react";
import { Shield, ShieldAlert, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AdminUserRecord } from "@/lib/database-admin.functions";

interface ChangeRoleDialogProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetUserId: string, newRole: "admin" | "user") => Promise<void>;
}

export function ChangeRoleDialog({
  user,
  isOpen,
  onClose,
  onSubmit,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedRole === user!.role) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(user!.id, selectedRole);
      onClose();
    } catch (err) {
      setError((err as Error).message ?? "Failed to update role.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/80 text-purple-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-100">
                Change User Role
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Update permissions for <span className="font-mono text-cyan-400">{user.email}</span>
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
          <div className="grid grid-cols-1 gap-3">
            <label
              className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                selectedRole === "user"
                  ? "border-cyan-600 bg-cyan-950/20 text-slate-100"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="user"
                checked={selectedRole === "user"}
                onChange={() => setSelectedRole("user")}
                className="mt-0.5 text-cyan-500 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200">Standard User</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Cannot access database administration or privileged monitoring endpoints.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                selectedRole === "admin"
                  ? "border-purple-600 bg-purple-950/20 text-slate-100"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="admin"
                checked={selectedRole === "admin"}
                onChange={() => setSelectedRole("admin")}
                className="mt-0.5 text-purple-500 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Administrator
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Full control over application tables, user management, and system activity logs.
                </div>
              </div>
            </label>
          </div>

          {selectedRole === "admin" && user.role !== "admin" && (
            <div className="rounded-md border border-purple-900/60 bg-purple-950/20 p-2.5 text-[11px] text-purple-300 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                Caution: Granting the Administrator role enables access to all confidential database tables, user records, and privileged functions.
              </span>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-800 mt-6 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedRole === user.role}
              className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating Role…
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  Save Role Change
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
