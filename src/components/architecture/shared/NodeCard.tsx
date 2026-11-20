import React from "react";
import {
  Server,
  Shield,
  Layers,
  Database,
  Globe,
  Activity,
  Cpu,
  HardDrive,
  Terminal,
  Bot,
} from "lucide-react";
import type { UnifiedNode } from "./layout";
import type { ArchitectureCategory } from "@/lib/architecture-diagrams";
import { NodeLogo } from "../NodeLogo";

interface NodeCardProps {
  node: UnifiedNode;
  index?: number;
  isSelected?: boolean;
  isFocused?: boolean;
  isDimmed?: boolean;
  isJourneyActive?: boolean;
  shouldAnimate?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  actionLabel?: string;
  className?: string;
}

export function getNodeCategoryIcon(category: ArchitectureCategory) {
  switch (category) {
    case "client":
    case "dns":
    case "cdn":
    case "networking":
      return Globe;
    case "security":
      return Shield;
    case "compute":
      return Server;
    case "application":
      return Cpu;
    case "database":
      return Database;
    case "storage":
      return HardDrive;
    case "monitoring":
      return Activity;
    case "cicd":
      return Terminal;
    case "ai":
      return Bot;
    default:
      return Layers;
  }
}

export function NodeCard({
  node,
  index = 0,
  isSelected = false,
  isFocused = false,
  isDimmed = false,
  isJourneyActive = false,
  shouldAnimate = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  actionLabel = "Inspect →",
  className = "",
}: NodeCardProps) {
  const Icon = getNodeCategoryIcon(node.category);
  const isHighlighted = isSelected || isFocused || isJourneyActive;

  // Staggered entrance delay: 60ms * index
  const entranceDelay = `${Math.min(index * 60, 600)}ms`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${node.name} (${node.tech})`}
      aria-pressed={isSelected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        animationDelay: entranceDelay,
      }}
      className={`group relative flex flex-col justify-between w-[220px] min-h-[125px] p-3 text-left rounded-xl border select-none transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
        isJourneyActive
          ? "border-cobalt ring-2 ring-cobalt/35 bg-white dark:bg-[#121316] shadow-lg -translate-y-1.5 z-30"
          : isHighlighted
            ? "border-cobalt ring-2 ring-cobalt/20 bg-white dark:bg-[#121316] shadow-md -translate-y-1 z-20"
            : "border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-[#121316] hover:border-cobalt/60 hover:shadow-xs hover:-translate-y-0.5 z-10"
      } ${isDimmed ? "opacity-25 grayscale-[30%]" : "opacity-100"} ${className}`}
    >
      <div>
        {/* Top Header: Logo Tile + Title + Live Status Dot */}
        <div className="flex items-start gap-2.5">
          <div
            className={`relative shrink-0 rounded-lg transition-transform duration-300 ${
              isJourneyActive ? "scale-105" : "group-hover:scale-102"
            }`}
          >
            <NodeLogo
              tech={node.tech}
              provider={node.provider}
              fallbackIcon={Icon}
              size="md"
              alt={node.name}
            />
            {/* Subtle breathing glow around logo tile when animated */}
            {shouldAnimate && (
              <span
                className={`absolute inset-0 rounded-lg pointer-events-none transition-opacity ${
                  isJourneyActive
                    ? "ring-2 ring-cobalt/40 shadow-xs opacity-100"
                    : "opacity-0 group-hover:opacity-100 ring-1 ring-cobalt/20"
                }`}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <h4 className="text-[12px] font-bold text-carbon dark:text-white leading-tight line-clamp-2 group-hover:text-cobalt transition-colors">
                {node.name}
              </h4>
              {/* Status Dot with Soft Pulse Ring */}
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                {shouldAnimate && (
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                )}
                <span
                  className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-emerald-500/30"
                  title={`Status: ${node.status || "operational"}`}
                />
              </div>
            </div>

            <span className="mono text-[10px] text-cobalt font-semibold block truncate mt-0.5" title={node.tech}>
              {node.tech}
            </span>
          </div>
        </div>

        {/* Node Description (2 lines without cutting off words) */}
        <p className="mt-2 text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
          {node.description}
        </p>
      </div>

      {/* Card Footer with Anti-Overflow Port Pill & Action Link */}
      <div className="mt-2.5 pt-2 border-t border-[#E5E5DF]/70 dark:border-white/5 flex flex-wrap items-center justify-between gap-1.5 text-[9px] min-w-0">
        <div className="flex items-center gap-1 min-w-0 shrink-0">
          {node.port ? (
            <span
              className="mono font-semibold text-cobalt px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 max-w-[110px] truncate"
              title={`Port ${node.port}`}
            >
              Port {node.port}
            </span>
          ) : node.metricLabel ? (
            <span
              className="mono text-muted-foreground text-[8.5px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-neutral-800/60 border border-stone-200/60 dark:border-white/5 max-w-[110px] truncate"
              title={`${node.metricLabel} (illustrative)`}
            >
              {node.metricLabel}
            </span>
          ) : (
            <span className="mono text-muted-foreground uppercase text-[8px] tracking-wider">
              {node.category}
            </span>
          )}
        </div>

        <span className="text-cobalt font-semibold group-hover:underline inline-flex items-center gap-0.5 shrink-0 ml-auto">
          {actionLabel}
        </span>
      </div>
    </div>
  );
}
