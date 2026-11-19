import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Info,
  Server,
  Database,
  Globe,
  Shield,
  Cpu,
  Layers,
  HardDrive,
  Activity,
  Bot,
  Terminal,
  FileCode,
  Image as ImageIcon,
} from "lucide-react";
import type {
  ArchitectureDiagramData,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureViewMode,
  ArchitectureCategory,
} from "@/lib/architecture-diagrams";
import { CATEGORY_COLORS } from "@/lib/architecture-diagrams";
import { exportDiagramAsSvg, exportDiagramAsPng } from "@/lib/architecture-export";
import { toast } from "sonner";

interface ArchitectureCanvasProps {
  data: ArchitectureDiagramData;
  viewMode: ArchitectureViewMode;
  selectedNode: ArchitectureNode | null;
  onSelectNode: (node: ArchitectureNode | null) => void;
  isEditable?: boolean;
  onUpdateNodes?: (nodes: ArchitectureNode[]) => void;
  className?: string;
}

const NODE_WIDTH = 210;
const NODE_HEIGHT = 135;

export function ArchitectureCanvas({
  data,
  viewMode,
  selectedNode,
  onSelectNode,
  isEditable = false,
  onUpdateNodes,
  className = "",
}: ArchitectureCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(data.viewport?.zoom || 0.95);
  const [pan, setPan] = useState({ x: data.viewport?.x || 20, y: data.viewport?.y || 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute filtered nodes based on active viewMode
  const isNodeActiveInView = useCallback(
    (node: ArchitectureNode): boolean => {
      switch (viewMode) {
        case "topology":
          return true;
        case "network":
          return ["client", "dns", "cdn", "networking", "compute", "application"].includes(
            node.category,
          );
        case "security":
          return (
            ["security", "dns"].includes(node.category) ||
            (node.security_controls && node.security_controls.length > 0)
          );
        case "infrastructure":
          return ["compute", "database", "storage", "cdn", "networking"].includes(node.category);
        case "deployment":
          return ["cicd", "compute", "client", "security"].includes(node.category);
        default:
          return true;
      }
    },
    [viewMode],
  );

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.5));
  const handleReset = () => {
    setZoom(data.viewport?.zoom || 0.95);
    setPan({ x: data.viewport?.x || 20, y: data.viewport?.y || 20 });
  };

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + zoomFactor, 0.5), 2.0);
      return Number(next.toFixed(2));
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current && (e.target as HTMLElement).tagName !== "svg") {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNodeId && isEditable && onUpdateNodes) {
      // Reposition node with snap-to-grid (20px)
      const rawX = (e.clientX - pan.x) / zoom - dragOffset.x;
      const rawY = (e.clientY - pan.y) / zoom - dragOffset.y;
      const snapX = Math.round(rawX / 20) * 20;
      const snapY = Math.round(rawY / 20) * 20;

      const updated = data.nodes.map((n) =>
        n.id === draggingNodeId ? { ...n, x: Math.max(0, snapX), y: Math.max(0, snapY) } : n,
      );
      onUpdateNodes(updated);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Start dragging a node in edit mode
  const handleNodeDragStart = (e: React.MouseEvent, node: ArchitectureNode) => {
    if (!isEditable) return;
    e.stopPropagation();
    setDraggingNodeId(node.id);
    setDragOffset({
      x: (e.clientX - pan.x) / zoom - node.x,
      y: (e.clientY - pan.y) / zoom - node.y,
    });
  };

  // Category Icon resolver
  const getNodeIcon = (category: ArchitectureCategory) => {
    switch (category) {
      case "client":
        return Globe;
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

  // Export handlers
  const handleExportSvg = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      await exportDiagramAsSvg(containerRef.current, "infrastructure-architecture");
      toast.success("Vector SVG diagram exported successfully");
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      await exportDiagramAsPng(containerRef.current, "infrastructure-architecture");
      toast.success("High-resolution PNG diagram exported successfully");
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Compute SVG bezier paths for edges
  const edgePaths = useMemo(() => {
    return data.edges.map((edge) => {
      const source = data.nodes.find((n) => n.id === edge.source);
      const target = data.nodes.find((n) => n.id === edge.target);

      if (!source || !target) return null;

      // Calculate anchor connection points
      const dx = target.x - source.x;
      const dy = target.y - source.y;

      let startX: number;
      let startY: number;
      let endX: number;
      let endY: number;

      // Target is primarily to the right
      if (dx >= 140) {
        startX = source.x + NODE_WIDTH;
        startY = source.y + NODE_HEIGHT / 2;
        endX = target.x;
        endY = target.y + NODE_HEIGHT / 2;
      }
      // Target is stacked vertically below or above
      else if (Math.abs(dx) < 140 && dy > 40) {
        startX = source.x + NODE_WIDTH / 2;
        startY = source.y + NODE_HEIGHT;
        endX = target.x + NODE_WIDTH / 2;
        endY = target.y;
      }
      // Target is to the left
      else if (dx <= -140) {
        startX = source.x;
        startY = source.y + NODE_HEIGHT / 2;
        endX = target.x + NODE_WIDTH;
        endY = target.y + NODE_HEIGHT / 2;
      } else {
        startX = source.x + NODE_WIDTH / 2;
        startY = source.y + NODE_HEIGHT;
        endX = target.x + NODE_WIDTH / 2;
        endY = target.y;
      }

      // Bezier control points
      const controlDist = Math.max(Math.abs(endX - startX) * 0.5, 40);
      const pathData =
        dx >= 140 || dx <= -140
          ? `M ${startX} ${startY} C ${startX + (dx >= 0 ? controlDist : -controlDist)} ${startY}, ${endX - (dx >= 0 ? controlDist : -controlDist)} ${endY}, ${endX} ${endY}`
          : `M ${startX} ${startY} C ${startX} ${startY + 40}, ${endX} ${endY - 40}, ${endX} ${endY}`;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      const isAnimated = viewMode === "network" || edge.animated;
      const isHighlighted =
        selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);

      return {
        edge,
        pathData,
        midX,
        midY,
        isAnimated,
        isHighlighted,
        sourceCategory: source.category,
        targetCategory: target.category,
      };
    });
  }, [data.edges, data.nodes, selectedNode, viewMode]);

  return (
    <div
      className={`relative select-none rounded-lg border border-border bg-[#FAF9F6] dark:bg-[#0E0F12] overflow-hidden transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-white dark:bg-[#121316] p-4" : className
      }`}
    >
      {/* Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* View Mode Status Indicator */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xs">
          <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
            MODE: {viewMode.toUpperCase()}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="mono text-[10px] text-muted-foreground border-l border-border pl-2">
            {data.nodes.length} Nodes &bull; {data.edges.length} Connections
          </span>
        </div>

        {/* Viewport Zoom & Export Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-md border border-border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xs">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer"
            title="Zoom Out (Scroll Down)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="mono min-w-10 text-center text-[10px] font-semibold text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer"
            title="Zoom In (Scroll Up)"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer"
            title="Reset Viewport Position"
            aria-label="Reset Viewport"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Export SVG */}
          <button
            type="button"
            onClick={handleExportSvg}
            disabled={isExporting}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer inline-flex items-center gap-1"
            title="Export as Vector SVG"
            aria-label="Export SVG"
          >
            <FileCode className="h-3.5 w-3.5 text-cobalt" />
            <span className="mono text-[9px] font-bold uppercase hidden sm:inline">SVG</span>
          </button>

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExporting}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer inline-flex items-center gap-1"
            title="Export as High-Resolution PNG"
            aria-label="Export PNG"
          >
            <ImageIcon className="h-3.5 w-3.5 text-cobalt" />
            <span className="mono text-[9px] font-bold uppercase hidden sm:inline">PNG</span>
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Pan/Zoom Surface */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative h-[620px] w-full overflow-hidden ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 71, 255, 0.12) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Transformed Stage */}
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG Vector Connections Layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "3000px", height: "2000px", overflow: "visible" }}
          >
            <defs>
              {/* Directional Marker Arrow: Default */}
              <marker
                id="arch-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#0047FF" />
              </marker>

              {/* Directional Marker Arrow: Active / Highlighted */}
              <marker
                id="arch-arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#0047FF" />
              </marker>
            </defs>

            {/* Connection Paths */}
            {edgePaths.map((item) => {
              if (!item) return null;
              const { edge, pathData, midX, midY, isAnimated, isHighlighted } = item;

              return (
                <g key={edge.id} className="transition-opacity duration-200">
                  {/* Subtle background glow for selected edge */}
                  {isHighlighted && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#0047FF"
                      strokeWidth="6"
                      strokeOpacity="0.2"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Main Vector Connection Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isHighlighted ? "#0047FF" : "#94A3B8"}
                    strokeWidth={isHighlighted ? "2.5" : "1.8"}
                    strokeDasharray={isAnimated ? "6 4" : undefined}
                    strokeLinecap="round"
                    markerEnd={isHighlighted ? "url(#arch-arrow-active)" : "url(#arch-arrow)"}
                    className={isAnimated ? "animate-pulse" : ""}
                  />

                  {/* Protocol Badge Pill */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-42"
                      y="-10"
                      width="84"
                      height="20"
                      rx="4"
                      fill={isHighlighted ? "#0047FF" : "#FAF9F6"}
                      stroke={isHighlighted ? "#0047FF" : "#E2E8F0"}
                      strokeWidth="1"
                      className="transition-colors shadow-2xs"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="monospace"
                      fill={isHighlighted ? "#FFFFFF" : "#0047FF"}
                    >
                      {edge.protocol || edge.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* HTML Interactive Node Cards */}
          <div className="absolute inset-0 pointer-events-auto">
            {data.nodes.map((node) => {
              const Icon = getNodeIcon(node.category);
              const isSelected = selectedNode?.id === node.id;
              const isActiveInView = isNodeActiveInView(node);
              const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.compute;

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  onMouseDown={(e) => handleNodeDragStart(e, node)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: `${NODE_WIDTH}px`,
                    minHeight: `${NODE_HEIGHT}px`,
                  }}
                  className={`absolute rounded-lg border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-cobalt ring-3 ring-cobalt/25 bg-white dark:bg-neutral-900 shadow-md z-30 -translate-y-1"
                      : "border-border bg-white dark:bg-neutral-900 hover:border-cobalt/70 hover:shadow-sm z-10"
                  } ${!isActiveInView ? "opacity-35 grayscale" : "opacity-100"}`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${colors.badge}`}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {node.category}
                      </span>
                      {node.port && (
                        <span className="mono text-[8px] font-semibold text-cobalt px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50">
                          {node.port}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-carbon dark:text-white line-clamp-1 leading-snug">
                      {node.name}
                    </h4>

                    <span className="mono text-[10px] text-cobalt font-semibold block mt-0.5 truncate">
                      {node.tech}
                    </span>

                    <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>
                  </div>

                  {/* Card Footer Status */}
                  <div className="pt-2 mt-2 border-t border-border/70 flex items-center justify-between">
                    <span className="mono text-[8px] text-muted-foreground truncate max-w-[120px]">
                      {node.provider.split("(")[0]}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-cobalt font-semibold">
                      <span>Inspect</span>
                      <Info className="h-2.5 w-2.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
