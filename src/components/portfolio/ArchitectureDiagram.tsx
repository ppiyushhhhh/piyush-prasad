import { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Server,
  Shield,
  Layers,
  Database,
  Globe,
  Activity,
  Cpu,
  ArrowRight,
  Info,
  X,
  Lock,
} from "lucide-react";
import type { ArchitectureData, ArchitectureComponent } from "@/lib/portfolio-projects";

interface ArchitectureDiagramProps {
  data: ArchitectureData;
  className?: string;
}

export function ArchitectureDiagram({ data, className = "" }: ArchitectureDiagramProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<ArchitectureComponent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoom(1);

  const getComponentIcon = (type: ArchitectureComponent["type"]) => {
    switch (type) {
      case "edge":
      case "network":
        return Globe;
      case "security":
        return Shield;
      case "compute":
        return Server;
      case "database":
      case "storage":
        return Database;
      case "observability":
        return Activity;
      case "cicd":
        return Cpu;
      default:
        return Layers;
    }
  };

  const getComponentBadgeColor = (type: ArchitectureComponent["type"]) => {
    switch (type) {
      case "edge":
      case "network":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "security":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "compute":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      case "database":
      case "storage":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      case "observability":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
      case "cicd":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800";
    }
  };

  return (
    <div
      className={`relative overflow-hidden border border-border bg-[#FAF9F6] dark:bg-neutral-950/50 shadow-2xs transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 rounded-lg p-6 bg-white dark:bg-neutral-950 shadow-2xl"
          : "rounded-md p-5 md:p-6"
      } ${className}`}
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
              System Architecture
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt animate-pulse" />
          </div>
          <h4 className="text-base font-bold text-carbon dark:text-white">
            {data.title || "Infrastructure & Traffic Flow"}
          </h4>
          {data.summary && <p className="mt-0.5 text-xs text-muted-foreground">{data.summary}</p>}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-white dark:bg-neutral-900 p-1 shadow-2xs">
          <button
            type="button"
            onClick={handleZoomOut}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors"
            title="Zoom Out"
            aria-label="Zoom out architecture diagram"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="mono min-w-10 text-center text-[10px] font-semibold text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors"
            title="Zoom In"
            aria-label="Zoom in architecture diagram"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors"
            title="Reset Zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <div className="h-3 w-px bg-border mx-0.5" />
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "View diagram full screen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative mt-6 min-h-[360px] overflow-x-auto overflow-y-hidden pb-4">
        {/* Desktop Interactive Flow */}
        <div
          className="hidden md:flex flex-col items-center justify-center transition-transform duration-150 origin-top min-w-[700px] py-4"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Sequential Nodes Layout with Protocol Connections */}
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 w-full max-w-5xl">
            {data.components.map((comp, idx) => {
              const Icon = getComponentIcon(comp.type);
              const isSelected = selectedNode?.id === comp.id;
              const conn = data.connections.find((c) => c.from === comp.id);

              return (
                <div key={comp.id} className="flex items-center gap-4 lg:gap-6 my-2">
                  {/* Node Box */}
                  <button
                    type="button"
                    onClick={() => setSelectedNode(comp)}
                    className={`group relative flex flex-col items-start w-[180px] p-3.5 text-left rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cobalt ring-2 ring-cobalt/20 bg-white dark:bg-neutral-900 shadow-md -translate-y-1"
                        : "border-border bg-white dark:bg-neutral-900 hover:border-cobalt/60 hover:shadow-xs hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${getComponentBadgeColor(
                          comp.type,
                        )}`}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {comp.type}
                      </span>
                      {comp.port && (
                        <span className="mono text-[9px] font-medium text-muted-foreground">
                          {comp.port}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-carbon dark:text-white line-clamp-1 group-hover:text-cobalt transition-colors">
                      {comp.name}
                    </span>

                    <span className="mono text-[10px] text-cobalt font-medium mt-0.5">
                      {comp.tech}
                    </span>

                    <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">
                      {comp.description}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-cobalt opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Inspect node</span>
                      <Info className="h-2.5 w-2.5" />
                    </div>
                  </button>

                  {/* Flow Arrow & Protocol Label */}
                  {idx < data.components.length - 1 && (
                    <div className="flex flex-col items-center justify-center -mx-1 text-center">
                      {conn?.label && (
                        <span className="mono text-[9px] font-medium text-muted-foreground max-w-[90px] truncate mb-0.5">
                          {conn.label}
                        </span>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <div className="w-4 lg:w-6 h-px bg-border" />
                        <ArrowRight className="h-3.5 w-3.5 text-cobalt -ml-1 shrink-0" />
                      </div>
                      {conn?.protocol && (
                        <span className="mono text-[8px] text-cobalt font-bold tracking-tight mt-0.5">
                          {conn.protocol}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Static Fallback List Flow */}
        <div className="md:hidden flex flex-col space-y-3 py-2">
          {data.components.map((comp, idx) => {
            const Icon = getComponentIcon(comp.type);
            const conn = data.connections.find((c) => c.from === comp.id);
            const isSelected = selectedNode?.id === comp.id;

            return (
              <div key={comp.id} className="flex flex-col">
                <div
                  onClick={() => setSelectedNode(comp)}
                  className={`p-3.5 rounded-lg border bg-white dark:bg-neutral-900 transition-all ${
                    isSelected ? "border-cobalt ring-1 ring-cobalt" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${getComponentBadgeColor(
                        comp.type,
                      )}`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {comp.type}
                    </span>
                    {comp.port && (
                      <span className="mono text-[9px] text-muted-foreground font-medium">
                        {comp.port}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-carbon dark:text-white">{comp.name}</h5>
                  <p className="mono text-[10px] text-cobalt font-medium">{comp.tech}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{comp.description}</p>
                </div>

                {idx < data.components.length - 1 && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 text-muted-foreground">
                    <span className="mono text-[9px] text-cobalt font-semibold">
                      {conn?.protocol || "TCP/IP"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-cobalt rotate-90" />
                    {conn?.label && (
                      <span className="text-[9px] text-muted-foreground">{conn.label}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector Drawer / Card */}
      {selectedNode && (
        <div className="mt-4 border-t border-border/80 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="rounded-lg border border-cobalt/30 bg-blue-50/50 dark:bg-blue-950/20 p-4 relative">
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-carbon hover:bg-neutral-200/50 transition-colors"
              aria-label="Close component details"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${getComponentBadgeColor(
                  selectedNode.type,
                )}`}
              >
                {selectedNode.type}
              </span>
              <span className="text-sm font-bold text-carbon dark:text-white">
                {selectedNode.name}
              </span>
              <span className="mono text-xs font-semibold text-cobalt">({selectedNode.tech})</span>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
              {selectedNode.description}
            </p>

            {selectedNode.details && (
              <div className="mt-2 text-xs bg-white dark:bg-neutral-900 border border-border rounded p-2.5 text-muted-foreground">
                <span className="font-semibold text-carbon dark:text-white block mb-0.5">
                  Technical Specifications:
                </span>
                {selectedNode.details}
              </div>
            )}

            {selectedNode.port && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3 text-cobalt" />
                <span>Port mapping / firewall boundary: </span>
                <span className="mono font-semibold text-carbon dark:text-white">
                  {selectedNode.port}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
