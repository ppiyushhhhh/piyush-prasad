import { useState, useRef, useMemo, useCallback } from "react";
import { Lock, X, Info } from "lucide-react";
import type { ArchitectureData, ArchitectureComponent } from "@/lib/portfolio-projects";
import {
  layoutProjectArchitecture,
  deriveRequestJourney,
  type UnifiedNode,
  type UnifiedEdge,
} from "@/components/architecture/shared/layout";
import { useDiagramAnimation } from "@/components/architecture/shared/useDiagramAnimation";
import { AnimatedEdge } from "@/components/architecture/shared/AnimatedEdge";
import { NodeCard } from "@/components/architecture/shared/NodeCard";
import { ArrowheadMarkers } from "@/components/architecture/shared/ArrowheadMarkers";
import { DiagramToolbar } from "@/components/architecture/shared/DiagramToolbar";
import { NodeLogo } from "@/components/architecture/NodeLogo";

interface ArchitectureDiagramProps {
  data: ArchitectureData;
  className?: string;
}

export function ArchitectureDiagram({ data, className = "" }: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inspectedNode, setInspectedNode] = useState<UnifiedNode | null>(null);
  const [inspectedEdge, setInspectedEdge] = useState<UnifiedEdge | null>(null);

  // Compute unified DAG layout for components & connections
  const layout = useMemo(() => layoutProjectArchitecture(data), [data]);

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
    selectedEdgeId,
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
      setInspectedNode(node);
      setInspectedEdge(null);
    },
    onSelectEdge: (edge) => {
      setInspectedEdge(edge);
      setInspectedNode(null);
    },
  });

  // Fit to screen handler
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (!clientWidth || !clientHeight) return;
    const scale = Math.min((clientWidth - 48) / layout.viewBox.width, (clientHeight - 48) / layout.viewBox.height, 1.2);
    const newZoom = Math.min(Math.max(Number(scale.toFixed(2)), 0.5), 1.4);
    const panX = Math.round((clientWidth - layout.viewBox.width * newZoom) / 2);
    setZoom(newZoom);
    setPan({ x: panX, y: 10 });
  }, [layout.viewBox]);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='button']")) {
        return;
      }
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    },
    [isPanning, startPan]
  );

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const viewBoxStr = `${layout.viewBox.minX} ${layout.viewBox.minY} ${layout.viewBox.width} ${layout.viewBox.height}`;

  return (
    <div
      role="img"
      aria-label={`System Architecture Diagram: ${data.title || "Cloud Infrastructure"}`}
      className={`relative overflow-hidden border border-border bg-[#FAF9F6] dark:bg-[#0E0F12] shadow-2xs transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 rounded-lg p-6 bg-white dark:bg-[#121316] shadow-2xl overflow-y-auto"
          : "rounded-md p-4 md:p-6"
      } ${className}`}
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
              Live System Architecture
            </span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
              }`}
            />
          </div>
          <h4 className="text-base font-bold text-carbon dark:text-white mt-0.5">
            {data.title || "Infrastructure & Traffic Flow"}
          </h4>
          {data.summary && <p className="mt-0.5 text-xs text-muted-foreground">{data.summary}</p>}
        </div>
      </div>

      {/* Shared Interactive Diagram Toolbar & Journey Controller */}
      <div className="mt-3.5">
        <DiagramToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onFitToScreen={fitToScreen}
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
        />
      </div>

      {/* Main Scalable Diagram Canvas (ViewBox scaled, no horizontal scrollbar) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative mt-4 min-h-[380px] w-full overflow-hidden rounded-lg border border-border/60 bg-white/50 dark:bg-neutral-900/40 select-none ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(26, 75, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-75 origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG Vector Connections Layer */}
          <svg
            viewBox={viewBoxStr}
            className="w-full h-auto min-h-[380px] overflow-visible pointer-events-none"
            style={{ width: `${layout.viewBox.width}px`, height: `${layout.viewBox.height}px` }}
          >
            <ArrowheadMarkers />

            {/* Render all animated edges */}
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

          {/* HTML Interactive Node Cards Layer (positioned over SVG) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ width: `${layout.viewBox.width}px`, height: `${layout.viewBox.height}px` }}
          >
            {layout.nodes.map((node, idx) => {
              const isNodeFocused = connectedNodeIds.has(node.id);
              const isNodeJourney = currentJourneyNodeId === node.id;
              const isNodeSelected = selectedNodeId === node.id;
              const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive);
              const isDimmed = hasActiveFocus && !isNodeFocused && !isNodeJourney && !isNodeSelected;

              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                  }}
                  className="pointer-events-auto"
                >
                  <NodeCard
                    node={node}
                    index={idx}
                    isSelected={isNodeSelected}
                    isFocused={isNodeFocused}
                    isJourneyActive={isNodeJourney}
                    isDimmed={isDimmed}
                    shouldAnimate={shouldAnimate}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    actionLabel="Details &rarr;"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node or Edge Inspector Drawer */}
      {inspectedNode && (
        <div className="mt-4 border-t border-border/80 pt-4 animate-fadeIn">
          <div className="rounded-xl border border-cobalt/30 bg-blue-50/40 dark:bg-blue-950/20 p-4 relative">
            <button
              type="button"
              onClick={() => {
                setInspectedNode(null);
                handleNodeClick(inspectedNode);
              }}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-carbon hover:bg-neutral-200/50 transition-colors cursor-pointer"
              aria-label="Close component details"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 mb-2">
              <NodeLogo
                tech={inspectedNode.tech}
                size="md"
                alt={inspectedNode.name}
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-200 bg-white text-cobalt">
                    {inspectedNode.category}
                  </span>
                  <span className="text-sm font-bold text-carbon dark:text-white">
                    {inspectedNode.name}
                  </span>
                  <span className="mono text-xs font-semibold text-cobalt">({inspectedNode.tech})</span>
                </div>
                <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {inspectedNode.description}
                </p>
              </div>
            </div>

            {inspectedNode.raw?.details && (
              <div className="mt-2 text-xs bg-white dark:bg-neutral-900 border border-border rounded p-2.5 text-muted-foreground">
                <span className="font-semibold text-carbon dark:text-white block mb-0.5">
                  Technical Specifications:
                </span>
                {inspectedNode.raw.details}
              </div>
            )}

            {inspectedNode.port && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3 text-cobalt" />
                <span>Port mapping / firewall boundary: </span>
                <span className="mono font-semibold text-carbon dark:text-white">
                  {inspectedNode.port}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {inspectedEdge && (
        <div className="mt-4 border-t border-border/80 pt-4 animate-fadeIn">
          <div className="rounded-xl border border-cobalt/30 bg-blue-50/40 dark:bg-blue-950/20 p-4 relative">
            <button
              type="button"
              onClick={() => {
                setInspectedEdge(null);
                handleEdgeClick(inspectedEdge);
              }}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-carbon hover:bg-neutral-200/50 transition-colors cursor-pointer"
              aria-label="Close connection details"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-200 bg-white text-cobalt">
                Connection Layer &bull; {inspectedEdge.category}
              </span>
              <span className="text-xs font-bold text-carbon dark:text-white">
                {inspectedEdge.source} &rarr; {inspectedEdge.target}
              </span>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              {inspectedEdge.description || `${inspectedEdge.label || inspectedEdge.protocol} protocol channel.`}
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {inspectedEdge.protocol && (
                <span>
                  Protocol: <strong className="mono text-cobalt">{inspectedEdge.protocol}</strong>
                </span>
              )}
              {inspectedEdge.label && (
                <span>
                  Label: <strong className="text-carbon dark:text-white">{inspectedEdge.label}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
