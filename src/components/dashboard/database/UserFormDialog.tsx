import { useState } from "react";
import { UserPlus, Mail, Lock, Eye, EyeOff, Shield, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string; role: "admin" | "user" }) => Promise<void>;
}

export function UserFormDialog({ isOpen, onClose, onSubmit }: UserFormDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ email: trimmedEmail, password, role });
      setEmail("");
      setPassword("");
      setRole("user");
      onClose();
    } catch (err) {
      setError((err as Error).message ?? "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setError(null);
      setEmail("");
      setPassword("");
      setRole("user");
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-100">
                Add Application User
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Create a verified authentication account with assigned application role.
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
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@domain.com"
                className="w-full rounded-md border border-slate-800 bg-slate-950 pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
              Initial Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <p className="mt-1 text-[11px] text-slate-500">
              Passwords are sent securely to the Supabase Admin Auth API and never stored in plaintext.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              Authorization Role
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  role === "user"
                    ? "border-cyan-600 bg-cyan-950/20 text-slate-100"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                  className="mt-0.5 text-cyan-500 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Standard User</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Standard authenticated access
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  role === "admin"
                    ? "border-purple-600 bg-purple-950/20 text-slate-100"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                  className="mt-0.5 text-purple-500 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-purple-300">Administrator</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Full console & database control
                  </div>
                </div>
              </label>
            </div>
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
              className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating Account…
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  Create User
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
