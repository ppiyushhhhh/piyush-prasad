import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FileCode,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import type {
  ArchitectureDiagramData,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureViewMode,
} from "@/lib/architecture-diagrams";
import {
  exportDiagramAsSvg,
  exportDiagramAsAnimatedSvg,
  exportDiagramAsPng,
} from "@/lib/architecture-export";
import {
  layoutArchitectureCanvas,
  deriveRequestJourney,
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
  type UnifiedNode,
  type UnifiedEdge,
} from "./shared/layout";
import { useDiagramAnimation } from "./shared/useDiagramAnimation";
import { AnimatedEdge } from "./shared/AnimatedEdge";
import { NodeCard } from "./shared/NodeCard";
import { ArrowheadMarkers } from "./shared/ArrowheadMarkers";
import { DiagramToolbar } from "./shared/DiagramToolbar";
import { toast } from "sonner";

interface ArchitectureCanvasProps {
  data: ArchitectureDiagramData;
  viewMode: ArchitectureViewMode;
  selectedNode: ArchitectureNode | null;
  selectedEdge?: ArchitectureEdge | null;
  onSelectNode: (node: ArchitectureNode | null) => void;
  onSelectEdge?: (edge: ArchitectureEdge | null) => void;
  isEditable?: boolean;
  onUpdateNodes?: (nodes: ArchitectureNode[]) => void;
  className?: string;
}

export function ArchitectureCanvas({
  data,
  viewMode,
  selectedNode,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
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

  // Compute unified DAG layout for nodes & edges
  const layout = useMemo(() => layoutArchitectureCanvas(data), [data]);

  // Derive sequential request journey
  const journeyPath = useMemo(
    () => deriveRequestJourney(layout.nodes, layout.edges, data.journey),
    [layout.nodes, layout.edges, data.journey]
  );

  const {
    isLive,
    toggleLive,
    shouldAnimate,
    hoveredNodeId,
    setHoveredNodeId,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    connectedNodeIds,
    connectedEdgeIds,
    isJourneyActive,
    isJourneyPlaying,
    journeySpeed,
    setJourneySpeed,
    journeyLoop,
    toggleJourneyLoop,
    currentJourneyNodeId,
    currentJourneyEdgeId,
    currentStepInfo,
    startJourney,
    stopJourney,
    toggleJourneyPlay,
    nextJourneyStep,
    prevJourneyStep,
    handleNodeClick,
    handleEdgeClick,
  } = useDiagramAnimation({
    containerRef,
    nodes: layout.nodes,
    edges: layout.edges,
    journeyPath,
    onSelectNode: (node) => {
      const match = node ? data.nodes.find((n) => n.id === node.id) || null : null;
      onSelectNode(match);
      if (onSelectEdge) onSelectEdge(null);
    },
    onSelectEdge: (edge) => {
      const match = edge ? data.edges.find((e) => e.id === edge.id) || null : null;
      if (onSelectEdge) onSelectEdge(match);
      onSelectNode(null);
    },
  });

  // Sync selection with external props
  useEffect(() => {
    if (selectedNode) {
      setSelectedNodeId(selectedNode.id);
      setSelectedEdgeId(null);
    } else if (selectedEdge) {
      setSelectedEdgeId(selectedEdge.id);
      setSelectedNodeId(null);
    } else if (!isJourneyActive) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, [selectedNode, selectedEdge, isJourneyActive, setSelectedNodeId, setSelectedEdgeId]);

  // Compute active node filter by viewMode
  const isNodeActiveInView = useCallback(
    (node: UnifiedNode): boolean => {
      switch (viewMode) {
        case "topology":
          return true;
        case "network":
          return ["client", "dns", "cdn", "networking", "compute", "application"].includes(node.category);
        case "security":
          return (
            ["security", "dns"].includes(node.category) ||
            Boolean(node.security_controls && node.security_controls.length > 0)
          );
        case "infrastructure":
          return ["compute", "database", "storage", "cdn", "networking"].includes(node.category);
        case "deployment":
          return ["cicd", "compute", "client", "security"].includes(node.category);
        default:
          return true;
      }
    },
    [viewMode]
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

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        (e.target as HTMLElement).closest(".node-interactive") ||
        (e.target as HTMLElement).closest("button")
      ) {
        return;
      }
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        });
      } else if (draggingNodeId && isEditable && onUpdateNodes) {
        const newX = Math.round((e.clientX - dragOffset.x - pan.x) / zoom / 10) * 10;
        const newY = Math.round((e.clientY - dragOffset.y - pan.y) / zoom / 10) * 10;
        const updated = data.nodes.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
        onUpdateNodes(updated);
      }
    },
    [isPanning, startPan, draggingNodeId, isEditable, onUpdateNodes, dragOffset, pan, zoom, data.nodes]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  // Node Drag start
  const handleNodeDragStart = (e: React.MouseEvent, node: UnifiedNode) => {
    if (!isEditable) return;
    e.stopPropagation();
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - (node.x * zoom + pan.x),
      y: e.clientY - (node.y * zoom + pan.y),
    });
  };

  // Export handlers
  const handleExportSvg = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      await exportDiagramAsSvg(containerRef.current, "infrastructure-architecture", data, "Cloud Infrastructure Architecture");
      toast.success("Static vector SVG exported successfully");
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAnimatedSvg = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      await exportDiagramAsAnimatedSvg(containerRef.current, "infrastructure-architecture-live", data, "Cloud Infrastructure Architecture");
      toast.success("Animated vector SVG exported with inlined CSS");
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
      await exportDiagramAsPng(containerRef.current, "infrastructure-architecture", data, "Cloud Infrastructure Architecture");
      toast.success("High-resolution PNG exported successfully");
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Compute visual zones / swimlanes
  const zones = useMemo(() => {
    const list: {
      id: string;
      title: string;
      x: number;
      y: number;
      width: number;
      height: number;
      isAwsVpc?: boolean;
    }[] = [];

    const zoneDefinitions = [
      { id: "client-edge", title: "CLIENT & INGRESS EDGE", categories: ["client", "dns", "cdn"] },
      { id: "compute-app", title: "COMPUTE & RUNTIME ENVIRONMENT", categories: ["compute", "application"] },
      { id: "persistence", title: "PERSISTENCE & MANAGED DATA", categories: ["database", "storage"] },
      { id: "security-firewall", title: "SECURITY, NETFILTER & IDENTITY", categories: ["security"] },
      { id: "observability", title: "OBSERVABILITY & TELEMETRY", categories: ["monitoring"] },
      { id: "cicd-devops", title: "CI/CD & PIPELINE AUTOMATION", categories: ["cicd"] },
      { id: "ai-inference", title: "AI INFERENCE & LIVE MODELS", categories: ["ai"] },
    ];

    for (const def of zoneDefinitions) {
      const matchingNodes = layout.nodes.filter((n) => def.categories.includes(n.category));
      if (matchingNodes.length > 0) {
        const minX = Math.min(...matchingNodes.map((n) => n.x));
        const minY = Math.min(...matchingNodes.map((n) => n.y));
        const maxX = Math.max(...matchingNodes.map((n) => n.x + DEFAULT_NODE_WIDTH));
        const maxY = Math.max(...matchingNodes.map((n) => n.y + DEFAULT_NODE_HEIGHT));

        list.push({
          id: def.id,
          title: def.title,
          x: minX - 16,
          y: minY - 26,
          width: maxX - minX + 32,
          height: maxY - minY + 38,
        });
      }
    }

    // Check for AWS VPC boundary
    const awsNodes = layout.nodes.filter(
      (n) => n.provider.toLowerCase().includes("aws") || n.tech.toLowerCase().includes("aws")
    );
    if (awsNodes.length >= 2) {
      const minX = Math.min(...awsNodes.map((n) => n.x));
      const minY = Math.min(...awsNodes.map((n) => n.y));
      const maxX = Math.max(...awsNodes.map((n) => n.x + DEFAULT_NODE_WIDTH));
      const maxY = Math.max(...awsNodes.map((n) => n.y + DEFAULT_NODE_HEIGHT));

      list.push({
        id: "aws-vpc-boundary",
        title: "AWS VPC (10.0.0.0/16) • CLOUD BOUNDARY",
        x: minX - 22,
        y: minY - 32,
        width: maxX - minX + 44,
        height: maxY - minY + 46,
        isAwsVpc: true,
      });
    }

    return list;
  }, [layout.nodes]);

  return (
    <div
      role="img"
      aria-label="Interactive Architecture Explorer"
      className={`relative select-none rounded-lg border border-border bg-[#FAF9F6] dark:bg-[#0E0F12] overflow-hidden transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-white dark:bg-[#121316] p-4" : className
      }`}
    >
      {/* Control Bar & Journey Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <DiagramToolbar
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleReset}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            isLive={isLive}
            onToggleLive={toggleLive}
            isJourneyActive={isJourneyActive}
            isJourneyPlaying={isJourneyPlaying}
            journeySpeed={journeySpeed}
            journeyLoop={journeyLoop}
            currentStepInfo={currentStepInfo}
            onStartJourney={startJourney}
            onStopJourney={stopJourney}
            onToggleJourneyPlay={toggleJourneyPlay}
            onNextJourneyStep={nextJourneyStep}
            onPrevJourneyStep={prevJourneyStep}
            onSetJourneySpeed={setJourneySpeed}
            onToggleJourneyLoop={toggleJourneyLoop}
            extraActions={
              <div className="flex items-center gap-1">
                {/* Export Static SVG */}
                <button
                  type="button"
                  onClick={handleExportSvg}
                  disabled={isExporting}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Export Static Vector SVG"
                  aria-label="Export Static SVG"
                >
                  <FileCode className="h-3.5 w-3.5 text-cobalt" />
                  <span className="mono text-[9px] font-bold uppercase hidden sm:inline">SVG</span>
                </button>

                {/* Export Animated SVG */}
                <button
                  type="button"
                  onClick={handleExportAnimatedSvg}
                  disabled={isExporting}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Export Animated SVG with inlined CSS"
                  aria-label="Export Animated SVG"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="mono text-[9px] font-bold uppercase hidden md:inline">ANIM. SVG</span>
                </button>

                {/* Export PNG */}
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-carbon dark:text-neutral-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Export High-Resolution PNG"
                  aria-label="Export PNG"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-cobalt" />
                  <span className="mono text-[9px] font-bold uppercase hidden sm:inline">PNG</span>
                </button>
              </div>
            }
          />
        </div>
      </div>

      {/* Main Interactive Pan/Zoom Surface */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative h-[620px] w-full overflow-hidden ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(26, 75, 255, 0.1) 1px, transparent 1px)`,
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
          {/* Visual Zones & Boundaries Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {zones.map((zone) => (
              <div
                key={zone.id}
                style={{
                  transform: `translate(${zone.x}px, ${zone.y}px)`,
                  width: `${zone.width}px`,
                  height: `${zone.height}px`,
                }}
                className={`absolute rounded-2xl pointer-events-none transition-all ${
                  zone.isAwsVpc
                    ? "border-2 border-dashed border-amber-500/40 bg-amber-500/[0.02] dark:border-amber-400/30 dark:bg-amber-400/[0.015]"
                    : "border border-dashed border-[#E5E5DF] bg-stone-100/40 dark:border-white/10 dark:bg-white/[0.01]"
                }`}
              >
                <div className="absolute top-2.5 left-3.5 flex items-center gap-1.5">
                  <span
                    className={`mono text-[9px] font-bold tracking-widest uppercase ${
                      zone.isAwsVpc ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
                    }`}
                  >
                    {zone.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* SVG Vector Connections Layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "3200px", height: "2200px", overflow: "visible" }}
          >
            <ArrowheadMarkers />

            {/* Connection Paths */}
            <g className="pointer-events-auto">
              {layout.edges.map((edge) => {
                const isEdgeFocused = connectedEdgeIds.has(edge.id);
                const isJourneyEdge = currentJourneyEdgeId === edge.id;
                const isEdgeSelected = selectedEdgeId === edge.id;
                const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive);
                const isDimmed = hasActiveFocus && !isEdgeFocused && !isJourneyEdge && !isEdgeSelected;

                return (
                  <AnimatedEdge
                    key={edge.id}
                    edge={edge}
                    shouldAnimate={shouldAnimate}
                    isFocused={isEdgeFocused}
                    isJourneyActive={isJourneyEdge}
                    isSelected={isEdgeSelected}
                    isDimmed={isDimmed}
                    onClick={() => handleEdgeClick(edge)}
                  />
                );
              })}
            </g>
          </svg>

          {/* HTML Interactive Node Cards */}
          <div className="absolute inset-0 pointer-events-auto">
            {layout.nodes.map((node, idx) => {
              const isNodeFocused = connectedNodeIds.has(node.id);
              const isNodeJourney = currentJourneyNodeId === node.id;
              const isNodeSelected = selectedNodeId === node.id;
              const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive);
              const isDimmed = hasActiveFocus && !isNodeFocused && !isNodeJourney && !isNodeSelected;
              const isActiveInView = isNodeActiveInView(node);

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeDragStart(e, node)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    position: "absolute",
                  }}
                  className={`node-interactive transition-opacity ${
                    !isActiveInView ? "opacity-30 grayscale" : ""
                  }`}
                >
                  <NodeCard
                    node={node}
                    index={idx}
                    isSelected={isNodeSelected}
                    isFocused={isNodeFocused}
                    isJourneyActive={isNodeJourney}
                    isDimmed={isDimmed}
                    shouldAnimate={shouldAnimate && isActiveInView}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    actionLabel="Inspect &rarr;"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
