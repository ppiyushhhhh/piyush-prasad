import { useState, useEffect } from "react";
import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  FileText,
  Gauge,
  Github,
  Rocket,
  Settings,
  Database,
  LogOut,
  Shield,
  Loader2,
  Lock,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Monitoring Dashboard — Piyush Prasad" },
      { name: "description", content: "Internal DevOps monitoring dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: Gauge, exact: true },
  { to: "/dashboard/health", label: "Website Health", icon: Activity },
  { to: "/dashboard/performance", label: "Performance", icon: BarChart3 },
  { to: "/dashboard/github", label: "GitHub", icon: Github },
  { to: "/dashboard/cicd", label: "CI/CD", icon: Rocket },
  { to: "/dashboard/ai-chat", label: "AI Chat", icon: Bot },
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
  { to: "/dashboard/database", label: "Database", icon: Database },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function DashboardLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [session, setSession] = useState<Session | null | undefined>(undefined);

  // Subscribe to auth state
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/dashboard/login" });
  }

  // If on login page, render child directly without sidebar or guard
  if (pathname === "/dashboard/login") {
    return <Outlet />;
  }

  // Checking session loading state
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <span>Verifying admin authentication…</span>
      </div>
    );
  }

  // If not logged in, show access wall with redirect to login
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="max-w-md w-full rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center backdrop-blur shadow-2xl">
          <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Admin Authentication Required</h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            The DevOps monitoring console at <code className="font-mono text-cyan-400">/dashboard</code> is restricted to verified administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/dashboard/login"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-cyan-500 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Sign In to Console
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Return to Public Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated admin view
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-800 px-4 py-6 md:flex justify-between">
          <div>
            <Link to="/" className="mb-8 block px-2">
              <p className="font-mono text-sm font-semibold text-slate-100">PP · OPS</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Monitoring console
              </p>
            </Link>
            <nav className="space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/dashboard" }}
                  activeProps={{ className: "bg-slate-900 text-slate-100" }}
                  className="flex items-center gap-3 rounded px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User profile & Sign Out in sidebar footer */}
          <div className="border-t border-slate-800/80 pt-4 mt-6">
            <div className="px-2 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <Shield className="h-3 w-3" />
                <span>Admin Session</span>
              </div>
              <p className="truncate text-[11px] text-slate-400 font-mono mt-0.5" title={session.user.email}>
                {session.user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 rounded px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 flex flex-col min-h-screen">
          {/* Mobile Top Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 md:hidden">
            <span className="font-mono text-xs font-semibold text-slate-200">PP &bull; OPS</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                {session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-rose-400"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-800 px-4 py-2.5 md:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/dashboard" }}
                activeProps={{ className: "text-cyan-400 font-semibold" }}
                className="whitespace-nowrap text-xs uppercase tracking-[0.14em] text-slate-500"
              >
                {label}
              </Link>
            ))}
          </div>

          <main className="flex-1 px-5 py-8 md:px-10 md:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
