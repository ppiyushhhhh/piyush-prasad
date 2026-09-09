import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { adminBootstrapNeeded, claimAdmin } from "@/lib/admin-bootstrap.functions";

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
  const [bootstrap, setBootstrap] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { session, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    void adminBootstrapNeeded()
      .then((r) => active && setBootstrap(r.needed))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

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

    if (bootstrap) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard/login` },
      });
      if (signUpError) {
        setBusy(false);
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setBusy(false);
        setNotice(
          "Account created. Check your email and confirm the address, then sign in here to finish setup.",
        );
        setBootstrap(false);
        return;
      }
      try {
        await claimAdmin();
        setBusy(false);
        void navigate({ to: "/dashboard" });
      } catch (err) {
        setBusy(false);
        setError(err instanceof Error ? err.message : "Could not grant admin access.");
      }
      return;
    }

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


  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-200">
      <div className="w-full max-w-sm">
        <p className="font-mono text-sm font-semibold text-slate-100">PP · OPS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {bootstrap ? "Create admin account" : "Admin sign in"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {bootstrap
            ? "No admin account exists yet. The first account created here becomes the admin."
            : "Private monitoring console. Authorised access only."}
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
              autoComplete={bootstrap ? "new-password" : "current-password"}
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
            {bootstrap ? "Create admin account" : "Sign in"}
          </button>
        </form>


        <Link
          to="/"
          className="mt-8 inline-block text-xs uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
        >
          ← Back to portfolio
        </Link>
      </div>
    </div>
  );
}
