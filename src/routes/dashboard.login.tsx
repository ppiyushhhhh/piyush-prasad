import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Piyush Prasad" },
      { name: "description", content: "Sign in to the private monitoring dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { session, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !session) return;
    if (isAdmin) void navigate({ to: "/dashboard" });
    else
      setError(
        "Signed in, but this account does not have admin access to the monitoring dashboard.",
      );
  }, [loading, session, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setBusy(false);
      const msg = signInError.message.toLowerCase();
      if (msg.includes("invalid login credentials")) {
        setError("Incorrect email or password. No account matches these details.");
      } else if (msg.includes("confirm")) {
        setError("This email address has not been confirmed yet. Check your inbox first.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid ?? "")
      .eq("role", "admin")
      .maybeSingle();
    setBusy(false);

    if (!roleRow) {
      setError(
        "Signed in, but this account does not have admin access to the monitoring dashboard.",
      );
      return;
    }
    void navigate({ to: "/dashboard" });
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/dashboard/reset-password`,
    });
    setBusy(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("If an account exists for that email, a password reset link is on its way.");
  }

  if (forgot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-200">
        <div className="w-full max-w-sm">
          <p className="font-mono text-sm font-semibold text-slate-100">PP · OPS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your registered email and we will send a reset link.
          </p>

          <form onSubmit={onReset} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="text-[10px] uppercase tracking-[0.18em] text-slate-500"
              >
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
              />
            </div>

            {error ? (
              <p role="alert" className="text-xs text-red-400">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="text-xs text-emerald-400">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Send reset link
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setForgot(false);
              setError(null);
              setNotice(null);
            }}
            className="mt-8 text-xs uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-200">
      <div className="w-full max-w-sm">
        <p className="font-mono text-sm font-semibold text-slate-100">PP · OPS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Private monitoring console. Authorised access only.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-[10px] uppercase tracking-[0.18em] text-slate-500"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p role="status" className="text-xs text-emerald-400">
              {notice}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Sign in
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-slate-500">
          <button
            type="button"
            onClick={() => {
              setForgot(true);
              setError(null);
              setNotice(null);
            }}
            className="hover:text-slate-300"
          >
            Forgot password?
          </button>
          <Link to="/" className="hover:text-slate-300">
            ← Back to portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
