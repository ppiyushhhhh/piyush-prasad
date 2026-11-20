import {
  Globe,
  Server,
  Database,
  Shield,
  HardDrive,
  Activity,
  Bot,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import type { ArchitectureCategory, ArchitectureViewMode } from "@/lib/architecture-diagrams";
import { CATEGORY_COLORS } from "@/lib/architecture-diagrams";

interface ArchitectureLegendProps {
  className?: string;
}

export function ArchitectureLegend({ className = "" }: ArchitectureLegendProps) {
  const categories: { cat: ArchitectureCategory; label: string; icon: typeof Globe }[] = [
    { cat: "client", label: "Client / Browser", icon: Globe },
    { cat: "dns", label: "DNS / Ingress", icon: Globe },
    { cat: "cdn", label: "Edge CDN", icon: Globe },
    { cat: "compute", label: "Compute / Serverless", icon: Server },
    { cat: "application", label: "Application Runtime", icon: Cpu },
    { cat: "database", label: "Database / Persistence", icon: Database },
    { cat: "security", label: "Security & Firewall", icon: Shield },
    { cat: "monitoring", label: "Telemetry & Metrics", icon: Activity },
    { cat: "cicd", label: "CI/CD & Automation", icon: Terminal },
    { cat: "ai", label: "AI & Inference", icon: Bot },
  ];

  return (
    <div
      className={`border border-border/80 bg-white dark:bg-[#121316] rounded-md p-4 text-xs ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
          Architecture System Legend
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-cobalt animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {categories.map(({ cat, label, icon: Icon }) => {
          const colors = CATEGORY_COLORS[cat];
          return (
            <div
              key={cat}
              className="flex items-center gap-2 p-1.5 rounded border border-border/60 bg-[#FAF9F6] dark:bg-neutral-900/40"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded border ${colors.border} ${colors.bg}`}
              >
                <Icon className={`h-3 w-3 ${colors.text}`} />
              </div>
              <div className="truncate">
                <span className="mono text-[9px] uppercase font-bold text-carbon dark:text-neutral-200 block truncate">
                  {label}
                </span>
                <span className="mono text-[8px] text-muted-foreground block truncate">
                  {cat.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mono font-semibold text-carbon dark:text-neutral-300">
            Connection Layers:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#1A4BFF]" />
            <span className="mono text-[10px] text-carbon/80 dark:text-neutral-200">Network Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#059669]" />
            <span className="mono text-[10px] text-carbon/80 dark:text-neutral-200">Data &amp; Persistence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D97706]" />
            <span className="mono text-[10px] text-carbon/80 dark:text-neutral-200">Security &amp; Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
            <span className="mono text-[10px] text-carbon/80 dark:text-neutral-200">CI/CD &amp; Deployment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#EA580C]" />
            <span className="mono text-[10px] text-carbon/80 dark:text-neutral-200">Telemetry &amp; Metrics</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="mono font-semibold text-carbon dark:text-neutral-300">
            Audit Source:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="mono text-[10px] text-carbon/80 dark:text-neutral-200">
              Verified in code (100% evidence)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="mono text-[10px] text-carbon/80 dark:text-neutral-200">
              From project docs
            </span>
          </div>
        </div>

        <div className="mono text-[10px] text-muted-foreground">
          Click any component to inspect technical specifications, ports, and security controls.
        </div>
      </div>
    </div>
  );
}
