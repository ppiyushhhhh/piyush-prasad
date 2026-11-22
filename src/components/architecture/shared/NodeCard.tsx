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
import { NODE_WIDTH, NODE_HEIGHT } from "./layout";
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
  className = "",
}: NodeCardProps) {
  const Icon = getNodeCategoryIcon(node.category);
  const entranceDelay = `${index * 40}ms`;
  const isHighlighted = isSelected || isFocused || isJourneyActive;

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
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
        animationDelay: entranceDelay,
      }}
      className={`group relative flex flex-col justify-center p-3 text-left rounded-xl border select-none transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt overflow-hidden ${
        isJourneyActive
          ? "border-cobalt ring-2 ring-cobalt/40 bg-white dark:bg-[#121316] shadow-xl -translate-y-1 z-30"
          : isHighlighted
            ? "border-cobalt ring-2 ring-cobalt/25 bg-white dark:bg-[#121316] shadow-md -translate-y-0.5 z-20"
            : "border-[#E2E0D8] dark:border-white/10 bg-white dark:bg-[#121316] hover:border-cobalt/60 hover:shadow-xs z-10"
      } ${isDimmed ? "opacity-25 grayscale-[30%]" : "opacity-100"} ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {/* 32x32 Logo Tile */}
        <div className="relative shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-stone-50 dark:bg-neutral-800 border border-border/60">
          <NodeLogo
            tech={node.tech}
            provider={node.provider}
            fallbackIcon={Icon}
            size="sm"
            alt={node.name}
          />
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

        {/* Title, Status & Tech */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-[11.5px] font-bold text-carbon dark:text-white leading-tight line-clamp-2 break-words group-hover:text-cobalt transition-colors">
              {node.name}
            </h4>
            {/* Live Status Dot */}
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              {node.verification === "code" && (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-emerald-500/30"
                  title="Verified in code"
                />
              )}
              <div className="relative flex items-center justify-center">
                {shouldAnimate && (
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                )}
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-emerald-500/30"
                  title={`Status: ${node.status || "operational"}`}
                />
              </div>
            </div>
          </div>

          {/* Tech Badge (wraps to 2 lines, no ellipsis) */}
          <span
            className="mono text-[9.5px] text-cobalt font-semibold block line-clamp-2 break-words leading-tight mt-1"
            title={node.tech}
          >
            {node.tech}
          </span>
        </div>
      </div>
    </div>
  );
}
