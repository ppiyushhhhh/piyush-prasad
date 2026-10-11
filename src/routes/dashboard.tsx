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
  HardDrive,
  LogOut,
  Shield,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Console — Piyush Prasad" },
      { name: "description", content: "Privileged operations console and infrastructure monitoring." },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Operations Console — Piyush Prasad" },
      { property: "og:description", content: "Privileged operations console and infrastructure monitoring." },
      { property: "og:url", content: "https://www.piyushprasad.in/dashboard" },
      { property: "og:image", content: "https://www.piyushprasad.in/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Operations Console — Piyush Prasad" },
      { name: "twitter:description", content: "Privileged operations console and infrastructure monitoring." },
      { name: "twitter:image", content: "https://www.piyushprasad.in/og-image.png" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: Gauge, exact: true },
  { to: "/dashboard/messages", label: "Messages", icon: Mail },
  { to: "/dashboard/health", label: "Website Health", icon: Activity },
  { to: "/dashboard/performance", label: "Performance", icon: BarChart3 },
  { to: "/dashboard/github", label: "GitHub", icon: Github },
  { to: "/dashboard/cicd", label: "CI/CD", icon: Rocket },
  { to: "/dashboard/ai-chat", label: "AI Chat", icon: Bot },
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
  { to: "/dashboard/database", label: "Database", icon: Database },
  { to: "/dashboard/manual-backups", label: "Manual Backups", icon: HardDrive },
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
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-muted-foreground font-mono text-xs gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cobalt" />
        <span>Verifying admin authentication…</span>
      </div>
    );
  }

  // If not logged in, show access wall with redirect to login
  if (!session) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 text-carbon">
        <div className="max-w-md w-full rounded-sm border border-[#E5E5DF] bg-white p-8 text-center shadow-sm overflow-hidden">
          <div className="h-0.5 w-full bg-cobalt -mt-8 -mx-8 mb-8" />
          <div className="flex h-14 w-14 items-center justify-center border border-carbon/15 bg-white shadow-xs mx-auto mb-4">
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
          <h2 className="text-base font-bold tracking-tight text-carbon">
            Piyush Prasad &bull; Operations Console
          </h2>
          <p className="mt-1 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Privileged Administrator Gateway
          </p>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Access to telemetry probes, production pipelines, and database infrastructure is restricted to verified administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/dashboard/login"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-cobalt py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Sign In to Console
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center py-2 text-xs text-muted-foreground hover:text-carbon transition-colors"
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
    <div className="min-h-screen bg-[#FAF9F6] text-carbon selection:bg-cobalt selection:text-white">
      <div className="mx-auto flex max-w-[1440px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#E5E5DF] bg-white px-4 py-6 md:flex justify-between">
          <div>
            <Link to="/" className="mb-8 flex items-center gap-3 px-2 transition-opacity hover:opacity-90">
              <div className="flex h-9 w-9 items-center justify-center border border-carbon/15 bg-white shadow-2xs">
                <img
                  src="/pp-logo.png"
                  alt="PP"
                  className="h-6 w-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML =
                        '<span class="mono font-bold text-cobalt text-[12px]">PP</span>';
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold tracking-tight text-carbon">PP · OPS</span>
                <span className="mono text-[9px] text-muted-foreground tracking-widest">
                  MONITORING CONSOLE
                </span>
              </div>
            </Link>
            <nav className="space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/dashboard" }}
                  activeProps={{ className: "bg-cobalt text-white font-semibold shadow-2xs" }}
                  className="flex items-center gap-3 rounded-sm px-3 py-2 text-xs font-medium text-carbon/75 transition-colors hover:bg-[#FAF9F6] hover:text-cobalt"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User profile & Sign Out in sidebar footer */}
          <div className="border-t border-[#E5E5DF] pt-4 mt-6">
            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-2.5 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <Shield className="h-3 w-3" />
                <span>Admin Session</span>
              </div>
              <p className="truncate text-[11px] text-muted-foreground font-mono mt-0.5" title={session.user.email}>
                {session.user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 rounded-sm border border-transparent px-3 py-1.5 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 flex flex-col min-h-screen">
          {/* Mobile Top Navigation */}
          <div className="flex items-center justify-between border-b border-[#E5E5DF] bg-white px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center border border-carbon/15 bg-white text-cobalt font-mono text-xs font-bold shadow-2xs">
                PP
              </div>
              <span className="mono text-xs font-bold text-carbon">PP · OPS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                {session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-rose-600"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto border-b border-[#E5E5DF] bg-[#FAF9F6] px-4 py-2.5 md:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/dashboard" }}
                activeProps={{ className: "text-cobalt font-bold border-b-2 border-cobalt pb-0.5" }}
                className="whitespace-nowrap mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-carbon"
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

