import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — Piyush Prasad" },
      { name: "description", content: "Set a new password for your dashboard account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(Boolean(data.session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(
        updateError.message.toLowerCase().includes("session")
          ? "This reset link has expired. Request a new one from the login page."
          : updateError.message,
      );
      return;
    }

    setNotice("Password updated. Redirecting to sign in…");
    await supabase.auth.signOut();
    setTimeout(() => void navigate({ to: "/dashboard/login" }), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-200">
      <div className="w-full max-w-sm">
        <p className="font-mono text-sm font-semibold text-slate-100">PP · OPS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Set a new password</h1>

        {ready === false ? (
          <>
            <p className="mt-2 text-sm text-slate-500">
              This reset link is invalid or has expired. Request a new password reset email from the
              login page.
            </p>
            <Link
              to="/dashboard/login"
              className="mt-8 inline-block text-xs uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
            >
              ← Back to login
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">
              Choose a new password for your dashboard account.
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="text-[10px] uppercase tracking-[0.18em] text-slate-500"
                >
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm"
                  className="text-[10px] uppercase tracking-[0.18em] text-slate-500"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                Update password
              </button>
            </form>

            <Link
              to="/dashboard/login"
              className="mt-8 inline-block text-xs uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
            >
              ← Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
