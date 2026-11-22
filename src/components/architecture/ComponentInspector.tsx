import {
  X,
  Shield,
  Layers,
  Server,
  Database,
  Globe,
  Cpu,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HardDrive,
  Activity,
  Bot,
  Terminal,
  FolderGit2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type {
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureCategory,
} from "@/lib/architecture-diagrams";
import { CATEGORY_COLORS } from "@/lib/architecture-diagrams";
import { NodeLogo } from "./NodeLogo";

interface ComponentInspectorProps {
  node: ArchitectureNode | null;
  edge?: ArchitectureEdge | null;
  edges: ArchitectureEdge[];
  allNodes: ArchitectureNode[];
  onClose: () => void;
  onSelectNode: (node: ArchitectureNode) => void;
  isIsolated?: boolean;
  onToggleIsolateRelated?: () => void;
  className?: string;
}

export function ComponentInspector({
  node,
  edge,
  edges,
  allNodes,
  onClose,
  onSelectNode,
  isIsolated = false,
  onToggleIsolateRelated,
  className = "",
}: ComponentInspectorProps) {
  if (!node && !edge) return null;

  const getNodeIcon = (category: ArchitectureCategory) => {
    switch (category) {
      case "client":
      case "dns":
      case "cdn":
      case "networking":
        return Globe;
      case "compute":
        return Server;
      case "application":
        return Cpu;
      case "database":
        return Database;
      case "storage":
        return HardDrive;
      case "security":
        return Shield;
      case "monitoring":
        return Activity;
      case "cicd":
        return Terminal;
      case "ai":
        return Bot;
      default:
        return Layers;
    }
  };

  // If inspecting an edge
  if (!node && edge) {
    const sourceNode = allNodes.find((n) => n.id === edge.source);
    const targetNode = allNodes.find((n) => n.id === edge.target);

    return (
      <div
        className={`flex flex-col h-full bg-white dark:bg-[#121316] border-l border-border/80 shadow-lg overflow-y-auto animate-in slide-in-from-right-4 duration-200 ${className}`}
        role="region"
        aria-label={`Connection details for ${edge.label || edge.protocol}`}
      >
        <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-2 mb-0.5 md:hidden" />
        <div className="flex items-start justify-between p-5 border-b border-border bg-surface-muted dark:bg-neutral-900/40 gap-3">
          <div>
            <span className="mono inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-accent/30 bg-accent-soft text-cobalt">
              LAYER: {edge.category.toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-carbon dark:text-white leading-tight mt-1.5">
              {edge.label || edge.protocol}
            </h3>
            {edge.protocol && (
              <p className="mono text-xs text-cobalt font-semibold mt-0.5">
                Protocol: {edge.protocol}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer shrink-0"
            aria-label="Close connection inspector"
            title="Close Inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-carbon dark:text-neutral-200">
          <div className="space-y-1.5">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              CONNECTION SUMMARY
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {edge.description || `Active traffic route connecting ${sourceNode?.name || edge.source} to ${targetNode?.name || edge.target}.`}
            </p>
          </div>

          <div className="space-y-2">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              ENDPOINTS
            </span>
            {sourceNode && (
              <button
                type="button"
                onClick={() => onSelectNode(sourceNode)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface-muted dark:bg-neutral-900/50 hover:border-cobalt text-left transition-colors cursor-pointer group"
              >
                <div>
                  <span className="mono text-[9px] text-muted-foreground block">SOURCE ORIGIN</span>
                  <span className="font-bold text-xs text-carbon dark:text-white group-hover:text-cobalt">
                    {sourceNode.name}
                  </span>
                  <span className="mono text-[10px] text-cobalt block">{sourceNode.tech}</span>
                </div>
                <span className="mono text-[9px] text-cobalt font-bold">INSPECT &rarr;</span>
              </button>
            )}

            <div className="flex justify-center text-muted-foreground py-0.5">
              <ArrowRight className="h-4 w-4 text-cobalt" />
            </div>

            {targetNode && (
              <button
                type="button"
                onClick={() => onSelectNode(targetNode)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface-muted dark:bg-neutral-900/50 hover:border-cobalt text-left transition-colors cursor-pointer group"
              >
                <div>
                  <span className="mono text-[9px] text-muted-foreground block">TARGET DESTINATION</span>
                  <span className="font-bold text-xs text-carbon dark:text-white group-hover:text-cobalt">
                    {targetNode.name}
                  </span>
                  <span className="mono text-[10px] text-cobalt block">{targetNode.tech}</span>
                </div>
                <span className="mono text-[9px] text-cobalt font-bold">INSPECT &rarr;</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2 rounded border border-border bg-surface-muted dark:bg-neutral-900/50">
              <span className="mono text-[9px] text-muted-foreground block">DIRECTION</span>
              <span className="mono font-semibold text-[11px] text-carbon dark:text-white uppercase">
                {edge.direction || "directional"}
              </span>
            </div>
            <div className="p-2 rounded border border-border bg-surface-muted dark:bg-neutral-900/50">
              <span className="mono text-[9px] text-muted-foreground block">FLOW MODE</span>
              <span className="mono font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
                Live Active Flow
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Node Inspection View
  if (!node) return null;

  const colorConfig = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.compute;
  const inboundEdges = edges.filter((e) => e.target === node.id);
  const outboundEdges = edges.filter((e) => e.source === node.id);
  const IconComponent = getNodeIcon(node.category);
  const upstreamNodes = allNodes.filter((n) => inboundEdges.some((e) => e.source === n.id));
  const downstreamNodes = allNodes.filter((n) => outboundEdges.some((e) => e.target === n.id));

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-[#121316] border-l border-border/80 shadow-lg overflow-y-auto animate-in slide-in-from-right-4 duration-200 ${className}`}
      role="region"
      aria-label={`Component details for ${node.name}`}
    >
      <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-2 mb-0.5 md:hidden" />

      {/* Top Header */}
      <div className="flex items-start justify-between p-5 border-b border-border bg-surface-muted dark:bg-neutral-900/40 gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <NodeLogo
            tech={node.tech}
            provider={node.provider}
            fallbackIcon={IconComponent}
            size="lg"
            alt={node.name}
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colorConfig.badge}`}
              >
                <IconComponent className="h-3 w-3" />
                {node.category.toUpperCase()}
              </span>
              {node.status && (
                <span className="mono inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {node.status.toUpperCase()}
                </span>
              )}
              {node.verification && (
                <span
                  className={`mono inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                    node.verification === "code"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      node.verification === "code" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {node.verification === "code" ? "Verified in code" : "From project docs"}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-carbon dark:text-white leading-tight truncate">
              {node.name}
            </h3>
            <p className="mono text-xs text-cobalt font-semibold truncate">{node.tech}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-muted-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer shrink-0"
          aria-label="Close component inspector"
          title="Close Inspector"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Action: Isolate Connected Services */}
      {onToggleIsolateRelated && (
        <div className="px-5 py-2.5 bg-neutral-100/70 dark:bg-neutral-800/50 border-b border-border flex items-center justify-between gap-2">
          <span className="mono text-[10px] text-muted-foreground font-semibold">
            TOPOLOGY FOCUS
          </span>
          <button
            type="button"
            onClick={onToggleIsolateRelated}
            className={`mono text-[10.5px] font-bold px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              isIsolated
                ? "bg-cobalt text-white shadow-xs"
                : "border border-border bg-white dark:bg-neutral-900 text-carbon dark:text-neutral-200 hover:border-cobalt hover:text-cobalt"
            }`}
            title="Focus solely on this component and its immediate dependencies"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isIsolated ? "bg-white animate-pulse" : "bg-cobalt"}`} />
            {isIsolated ? "Show All Components" : "Show Related Components"}
          </button>
        </div>
      )}

      {/* Main Content Details */}
      <div className="p-5 space-y-6 text-xs text-carbon dark:text-neutral-200">
        {/* Node Overview Card */}
        <div className="space-y-2">
          <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            ROLE &amp; FUNCTION
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">{node.description}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2 rounded border border-border bg-surface-muted dark:bg-neutral-900/50">
              <span className="mono text-[9px] text-muted-foreground block">PROVIDER</span>
              <span className="mono font-semibold text-[11px] text-carbon dark:text-white truncate block">
                {node.provider}
              </span>
            </div>
            <div className="p-2 rounded border border-border bg-surface-muted dark:bg-neutral-900/50">
              <span className="mono text-[9px] text-muted-foreground block">REGION / ZONE</span>
              <span className="mono font-semibold text-[11px] text-carbon dark:text-white truncate block">
                {node.region || "Global Multi-Region"}
              </span>
            </div>
          </div>
          {node.port && (
            <div className="p-2 rounded border border-border bg-surface-muted dark:bg-neutral-900/50">
              <span className="mono text-[9px] text-muted-foreground block">ACTIVE PORTS</span>
              <span className="mono font-bold text-[11px] text-cobalt">{node.port}</span>
            </div>
          )}
        </div>

        {/* Technical Responsibilities */}
        {node.responsibilities && node.responsibilities.length > 0 && (
          <div className="space-y-2">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              PRIMARY RESPONSIBILITIES
            </span>
            <ul className="space-y-1.5">
              {node.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Configuration Specs */}
        {node.configuration && node.configuration.length > 0 && (
          <div className="space-y-2">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              TECHNICAL CONFIGURATION
            </span>
            <div className="border border-border bg-surface-muted dark:bg-neutral-900/80 rounded p-2.5 font-mono text-[11px] space-y-1">
              {node.configuration.map((cfg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cobalt font-bold">&bull;</span>
                  <span className="text-carbon dark:text-neutral-300">{cfg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Repository Evidence */}
        {node.evidence && node.evidence.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                VERIFIED REPOSITORY EVIDENCE
              </span>
              <span className="mono text-[9px] text-muted-foreground font-semibold">
                {node.evidence.length} {node.evidence.length === 1 ? "source" : "sources"}
              </span>
            </div>
            <div className="border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-md p-2.5 space-y-1.5">
              {node.evidence.map((ev, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <code className="mono text-[10.5px] text-carbon dark:text-neutral-200 break-all bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 font-semibold">
                    {ev}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Controls */}
        {node.security_controls && node.security_controls.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <Shield className="h-3.5 w-3.5" />
              <span className="mono text-[10px] font-bold uppercase tracking-widest">
                SECURITY CONTROLS &amp; DEFENSE
              </span>
            </div>
            <ul className="space-y-1.5 border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 rounded p-3 text-[11px]">
              {node.security_controls.map((sec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Lock className="h-3 w-3 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug text-carbon dark:text-neutral-300">{sec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Data Flow Protocols & Network Details */}
        <div className="space-y-2">
          <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
            <span>DATA FLOW SPECIFICATION</span>
            <Activity className="h-3 w-3 text-cobalt" />
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded border border-border bg-surface-muted dark:bg-neutral-900/50">
              <span className="mono text-[9px] text-muted-foreground block">INGRESS PROTOCOLS</span>
              <span className="mono font-semibold text-[11px] text-carbon dark:text-white">
                {inboundEdges.length > 0
                  ? Array.from(new Set(inboundEdges.map((e) => e.protocol || "HTTP"))).join(", ")
                  : "Origin / Edge Entry"}
              </span>
            </div>
            <div className="p-2 rounded border border-border bg-surface-muted dark:bg-neutral-900/50">
              <span className="mono text-[9px] text-muted-foreground block">EGRESS DISPATCH</span>
              <span className="mono font-semibold text-[11px] text-carbon dark:text-white">
                {outboundEdges.length > 0
                  ? Array.from(new Set(outboundEdges.map((e) => e.protocol || "TCP"))).join(", ")
                  : "Terminal Sink / Store"}
              </span>
            </div>
          </div>
        </div>

        {/* Runtime Dependencies & Prerequisites */}
        {(upstreamNodes.length > 0 || downstreamNodes.length > 0) && (
          <div className="space-y-2">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              DEPENDENCIES &amp; RUNTIME PREREQUISITES
            </span>
            <div className="border border-border bg-surface-muted dark:bg-neutral-900/50 rounded-lg p-3 space-y-2.5">
              {downstreamNodes.length > 0 && (
                <div>
                  <span className="mono text-[9px] font-bold text-cobalt block mb-1">
                    REQUIRED DOWNSTREAM SERVICES ({downstreamNodes.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {downstreamNodes.map((dep) => (
                      <button
                        key={dep.id}
                        type="button"
                        onClick={() => onSelectNode(dep)}
                        className="mono text-[9.5px] px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-border hover:border-cobalt text-carbon dark:text-neutral-200 cursor-pointer transition-colors"
                      >
                        {dep.name} &bull; <span className="text-muted-foreground">{dep.tech}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {upstreamNodes.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <span className="mono text-[9px] font-bold text-muted-foreground block mb-1">
                    TRIGGERED / CALLED BY ({upstreamNodes.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {upstreamNodes.map((up) => (
                      <button
                        key={up.id}
                        type="button"
                        onClick={() => onSelectNode(up)}
                        className="mono text-[9.5px] px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-border hover:border-cobalt text-carbon dark:text-neutral-200 cursor-pointer transition-colors"
                      >
                        {up.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inbound Connections */}
        <div className="space-y-2">
          <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
            <span>INBOUND TRAFFIC ({inboundEdges.length})</span>
            <ArrowLeft className="h-3 w-3 text-cobalt" />
          </span>
          {inboundEdges.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">
              No direct inbound ingress connections (Ingress Origin).
            </p>
          ) : (
            <div className="space-y-1.5">
              {inboundEdges.map((edge) => {
                const sourceNode = allNodes.find((n) => n.id === edge.source);
                if (!sourceNode) return null;
                return (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => onSelectNode(sourceNode)}
                    className="w-full flex items-center justify-between p-2 rounded border border-border hover:border-cobalt bg-white dark:bg-neutral-900 text-left transition-colors cursor-pointer group"
                  >
                    <div>
                      <span className="mono font-semibold text-[11px] text-carbon dark:text-white group-hover:text-cobalt block">
                        {sourceNode.name}
                      </span>
                      <span className="mono text-[9px] text-muted-foreground">
                        {edge.label} &bull; {edge.protocol}
                      </span>
                    </div>
                    <span className="mono text-[9px] text-cobalt font-bold group-hover:translate-x-0.5 transition-transform">
                      VIEW &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Outbound Connections */}
        <div className="space-y-2">
          <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
            <span>OUTBOUND FORWARDING ({outboundEdges.length})</span>
            <ArrowRight className="h-3 w-3 text-cobalt" />
          </span>
          {outboundEdges.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">
              No outbound egress connections (Terminal Persistence / Ingress Boundary).
            </p>
          ) : (
            <div className="space-y-1.5">
              {outboundEdges.map((edge) => {
                const targetNode = allNodes.find((n) => n.id === edge.target);
                if (!targetNode) return null;
                return (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => onSelectNode(targetNode)}
                    className="w-full flex items-center justify-between p-2 rounded border border-border hover:border-cobalt bg-white dark:bg-neutral-900 text-left transition-colors cursor-pointer group"
                  >
                    <div>
                      <span className="mono font-semibold text-[11px] text-carbon dark:text-white group-hover:text-cobalt block">
                        {targetNode.name}
                      </span>
                      <span className="mono text-[9px] text-muted-foreground">
                        {edge.label} &bull; {edge.protocol}
                      </span>
                    </div>
                    <span className="mono text-[9px] text-cobalt font-bold group-hover:translate-x-0.5 transition-transform">
                      VIEW &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Associated Project / External Link */}
        {node.project_association && (
          <div className="pt-2 border-t border-border">
            <Link
              to="/projects/$slug"
              params={{ slug: node.project_association }}
              className="mono inline-flex items-center gap-1.5 w-full justify-center p-2.5 rounded bg-carbon hover:bg-cobalt text-white font-semibold text-[11px] tracking-wider transition-colors"
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>EXPLORE CASE STUDY &amp; REPO</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
