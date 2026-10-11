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
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 text-carbon selection:bg-cobalt selection:text-white">
      {/* Background subtle grid pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#121316 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="group inline-flex flex-col items-center gap-3 transition-opacity hover:opacity-90"
            title="Return to public portfolio"
          >
            <div className="flex h-14 w-14 items-center justify-center border border-carbon/15 bg-white shadow-xs transition-colors group-hover:border-cobalt">
              <img
                src="/pp-logo.png"
                alt="Piyush Prasad"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.innerHTML =
                      '<span class="mono font-bold text-cobalt text-base">PP</span>';
                  }
                }}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold tracking-tight text-carbon">
                Piyush Prasad
              </span>
              <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
                Cloud & DevOps Console
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white shadow-xs overflow-hidden">
          {/* Top Cobalt Hairline */}
          <div className="h-0.5 w-full bg-cobalt" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-4 mb-6">
              <div>
                <h1 className="mono text-xs font-bold uppercase tracking-wider text-carbon">
                  Admin Gateway
                </h1>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Privileged infrastructure &amp; database access
                </p>
              </div>
              <div className="flex items-center gap-1.5 mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero-Trust</span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-sm border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@piyushprasad.in"
                    className="w-full rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] pl-10 pr-3.5 py-2 text-xs text-carbon placeholder:text-muted-foreground/60 focus:border-cobalt focus:bg-white focus:outline-none transition-colors mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                  Security Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] pl-10 pr-10 py-2 text-xs text-carbon placeholder:text-muted-foreground/60 focus:border-cobalt focus:bg-white focus:outline-none transition-colors mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-carbon transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-sm bg-cobalt py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Authorize Session</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Notice Bar */}
          <div className="border-t border-[#E5E5DF] bg-[#FAF9F6] px-6 py-3 text-[10px] text-muted-foreground mono flex items-center justify-between">
            <span>TLS 1.3 • Supabase RBAC</span>
            <span>Region: ap-south-1</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-carbon transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Portfolio (piyushprasad.in)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

