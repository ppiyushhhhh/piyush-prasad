import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  FileText,
  Gauge,
  Github,
  Rocket,
  Settings,
} from "lucide-react";

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
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-800 px-4 py-6 md:flex">
          <Link to="/" className="mb-8 block px-2">
            <p className="font-mono text-sm font-semibold text-slate-100">PP · OPS</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Monitoring console
            </p>
          </Link>
          <nav className="flex-1 space-y-1">
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
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-800 px-4 py-3 md:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/dashboard" }}
                activeProps={{ className: "text-slate-100" }}
                className="whitespace-nowrap text-xs uppercase tracking-[0.14em] text-slate-500"
              >
                {label}
              </Link>
            ))}
          </div>
          <main className="px-5 py-8 md:px-10 md:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
