import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { adminBootstrapNeeded, claimAdmin } from "@/lib/admin-bootstrap.functions";

export const Route = createFileRoute("/dashboard/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Piyush Prasad" },
      { name: "description", content: "Create an account for the monitoring dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bootstrap, setBootstrap] = useState(false);
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/dashboard/login`,
      },
    });

    if (signUpError) {
      setBusy(false);
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      setBusy(false);
      setNotice(
        "Account created. Check your email and confirm the address, then sign in from the login page.",
      );
      return;
    }

    if (bootstrap) {
      try {
        await claimAdmin();
        setBusy(false);
        void navigate({ to: "/dashboard" });
        return;
      } catch {
        // Another admin was created first; continue as a normal user.
      }
    }

    setBusy(false);
    setNotice("Account created successfully. You can sign in now.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-200">
      <div className="w-full max-w-sm">
        <p className="font-mono text-sm font-semibold text-slate-100">PP · OPS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">
          {bootstrap
            ? "No admin exists yet. The first account created here becomes the admin."
            : "New accounts are standard users until an admin grants access."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Full name" id="fullName">
            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Email" id="email">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Password" id="password">
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Confirm password" id="confirm">
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </Field>

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
            Create account
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-slate-500">
          <Link to="/dashboard/login" className="hover:text-slate-300">
            ← Back to login
          </Link>
          <Link to="/" className="hover:text-slate-300">
            Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600";

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
