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
      <DialogContent className="max-w-md bg-white border-[#E5E5DF] text-carbon shadow-xl rounded-sm">
        <DialogHeader className="border-b border-[#E5E5DF] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-cobalt/10 border border-cobalt/20 text-cobalt shadow-2xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-carbon">
                Add Application User
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Create a verified authentication account with assigned application role.
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
          <div>
            <label className="block text-xs font-mono font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@domain.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-sm border border-[#E5E5DF] bg-white pl-9 pr-3.5 py-2 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none font-mono normal-case shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
              Initial Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-sm border border-[#E5E5DF] bg-white pl-9 pr-9 py-2 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none font-mono normal-case shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-carbon"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground font-sans">
              Passwords are sent securely to the Supabase Admin Auth API and never stored in plaintext.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cobalt" />
              Authorization Role
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-sm border cursor-pointer transition-colors ${
                  role === "user"
                    ? "border-cobalt bg-cobalt/5 text-carbon shadow-2xs"
                    : "border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground hover:border-[#D5D5CF]"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                  className="mt-0.5 text-cobalt focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-carbon">Standard User</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    Standard authenticated access
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-sm border cursor-pointer transition-colors ${
                  role === "admin"
                    ? "border-purple-600 bg-purple-50 text-carbon shadow-2xs"
                    : "border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground hover:border-[#D5D5CF]"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                  className="mt-0.5 text-purple-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-purple-800">Administrator</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    Full console & database control
                  </div>
                </div>
              </label>
            </div>
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
              className="inline-flex items-center gap-1.5 rounded-sm bg-cobalt px-4 py-2 text-xs font-semibold text-white hover:bg-cobalt/90 disabled:opacity-50 transition-colors shadow-2xs"
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
