import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, AlertCircle, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — PP · OPS Monitoring" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSetupHint, setShowSetupHint] = useState(false);

  // If already logged in, redirect to /dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/dashboard" });
      }
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setShowSetupHint(true);
        return;
      }

      if (data.session) {
        // Successfully authenticated!
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setErrorMessage((err as Error).message ?? "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 mb-3 shadow-lg shadow-cyan-950/20">
            <Terminal className="h-6 w-6" />
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-slate-100">PP · OPS</h1>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">
            Monitoring Console &bull; Admin Access
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur shadow-2xl">
          <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            <Lock className="h-4 w-4 text-cyan-400" />
            <span>Admin Authentication</span>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-lg border border-rose-900/60 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@piyushprasad.in"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-10 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Credentials…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Setup Hint Accordion */}
          {showSetupHint && (
            <div className="mt-6 rounded-md border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">First-time login setup?</p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                1. Create an admin user in your <strong>Supabase Dashboard &rarr; Authentication &rarr; Users</strong>.
                <br />
                2. Make sure <strong>Auto Confirm User</strong> is enabled.
                <br />
                3. Use those credentials above to log in.
              </p>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Public Portfolio (piyushprasad.in)
          </Link>
        </div>
      </div>
    </div>
  );
}
