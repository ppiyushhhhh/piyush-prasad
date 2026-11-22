import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Lock, X, Info, Maximize2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ArchitectureData, ArchitectureComponent } from "@/lib/portfolio-projects";
import { PROJECT_ARCHITECTURES } from "@/lib/project-architectures";
import {
  layoutProjectArchitecture,
  layoutArchitectureCanvas,
  deriveRequestJourney,
  type UnifiedNode,
  type UnifiedEdge,
} from "@/components/architecture/shared/layout";
import { useDiagramAnimation } from "@/components/architecture/shared/useDiagramAnimation";
import { AnimatedEdge, EdgeBadge } from "@/components/architecture/shared/AnimatedEdge";
import { NodeCard } from "@/components/architecture/shared/NodeCard";
import { ArrowheadMarkers } from "@/components/architecture/shared/ArrowheadMarkers";
import { DiagramToolbar } from "@/components/architecture/shared/DiagramToolbar";
import { NodeLogo } from "@/components/architecture/NodeLogo";

interface ArchitectureDiagramProps {
  data: ArchitectureData;
  diagramSlug?: string;
  onOpenWorkspace?: () => void;
  className?: string;
}

export function ArchitectureDiagram({
  data,
  diagramSlug,
  onOpenWorkspace,
  className = "",
}: ArchitectureDiagramProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [inspectedNode, setInspectedNode] = useState<UnifiedNode | null>(null);
  const [inspectedEdge, setInspectedEdge] = useState<UnifiedEdge | null>(null);

  const isDebugGeometry = typeof window !== "undefined" && window.location.search.includes("debug=geometry");

  // DOM Card Dimension Tracking for 100% attached lines
  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const [measuredCards, setMeasuredCards] = useState<Map<string, { width: number; height: number }>>(new Map());

  // Observe and measure real rendered card dimensions
  useEffect(() => {
    let hasDiff = false;
    const next = new Map(measuredCards);
    cardElementsRef.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w > 0 && h > 0) {
        const prev = next.get(id);
        if (!prev || Math.abs(prev.width - w) > 2 || Math.abs(prev.height - h) > 2) {
          next.set(id, { width: w, height: h });
          hasDiff = true;
        }
      }
    });
    if (hasDiff) {
      setMeasuredCards(next);
    }
  });

  const fullDiagram = useMemo(() => {
    if (!diagramSlug) return null;
    return PROJECT_ARCHITECTURES.find((d) => d.slug === diagramSlug) || null;
  }, [diagramSlug]);

  // Compute unified DAG layout for components & connections with measured cards
  const layout = useMemo(
    () =>
      fullDiagram
        ? layoutArchitectureCanvas(fullDiagram.diagram_data, {
            autoLayout: true,
            cardDimensions: measuredCards.size > 0 ? measuredCards : undefined,
          })
        : layoutProjectArchitecture(data, {
            autoLayout: true,
            cardDimensions: measuredCards.size > 0 ? measuredCards : undefined,
          }),
    [fullDiagram, data, measuredCards]
  );

  // Derive sequential request journey
  const journeyPath = useMemo(
    () =>
      deriveRequestJourney(
        layout.nodes,
        layout.edges,
        fullDiagram ? fullDiagram.diagram_data.journey : data.journey
      ),
    [layout.nodes, layout.edges, fullDiagram, data.journey]
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

  const handleOpenWorkspace = useCallback(() => {
    if (onOpenWorkspace) {
      onOpenWorkspace();
    } else if (diagramSlug) {
      navigate({
        to: "/architecture",
        search: { diagram: diagramSlug, workspace: "fullscreen" },
      });
    }
  }, [onOpenWorkspace, diagramSlug, navigate]);

  // Fit to screen handler
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth } = containerRef.current;
    if (!clientWidth) return;
    const scale = Math.min((clientWidth - 48) / layout.viewBox.width, 1.2);
    const newZoom = Math.min(Math.max(Number(scale.toFixed(2)), 0.4), 1.2);
    const panX = Math.max(24, Math.round((clientWidth - layout.viewBox.width * newZoom) / 2));
    setZoom(newZoom);
    setPan({ x: panX, y: 24 });
  }, [layout.viewBox]);

  useEffect(() => {
    fitToScreen();
  }, [fitToScreen]);

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
            {fullDiagram?.title || data.title || "Infrastructure & Traffic Flow"}
          </h4>
          {(fullDiagram?.description || data.summary) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fullDiagram?.description || data.summary}
            </p>
          )}
        </div>

        {(diagramSlug || onOpenWorkspace) && (
          <button
            type="button"
            onClick={handleOpenWorkspace}
            className="mono inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-cobalt bg-cobalt text-white text-[11px] font-bold hover:bg-cobalt/90 transition-colors shadow-2xs cursor-pointer"
          >
            <Maximize2 className="h-3 w-3" />
            <span>OPEN FULL SCREEN</span>
          </button>
        )}
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
          onOpenWorkspace={undefined}
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
          height: isFullscreen ? "calc(100vh - 200px)" : `${Math.max(380, Math.round(layout.viewBox.height * zoom + 48))}px`,
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
          {/* Layer 1: Visual Zones Layer */}
          {layout.zones && layout.zones.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {layout.zones.map((zone) => (
                <div
                  key={zone.id}
                  data-node-id={zone.id}
                  data-group-id={zone.id}
                  style={{
                    transform: `translate(${zone.x}px, ${zone.y}px)`,
                    width: `${zone.width}px`,
                    height: `${zone.height}px`,
                  }}
                  className={`tier-container absolute rounded-2xl pointer-events-none transition-all ${
                    zone.isAwsVpc
                      ? "border-2 border-dashed border-amber-500/40 bg-amber-500/[0.025] dark:border-amber-400/30 dark:bg-amber-400/[0.015]"
                      : zone.isDocker
                        ? "border-2 border-dashed border-sky-500/50 bg-sky-500/[0.03] dark:border-sky-400/40 dark:bg-sky-400/[0.02] shadow-sm"
                        : "border border-dashed border-border/80 bg-white/40 dark:border-white/10 dark:bg-white/[0.015] shadow-2xs"
                  }`}
                >
                  <div className="tier-header-strip absolute top-0 left-0 right-0 min-h-[32px] py-1 px-3.5 flex items-center gap-2 border-b border-border/60 bg-stone-100/80 dark:bg-neutral-900/80 rounded-t-2xl pointer-events-none">
                    {(zone.isDocker || zone.title.toLowerCase().includes("docker")) && (
                      <img
                        src="/tech-logos/docker.svg"
                        alt="Docker Logo"
                        className="w-4 h-4 object-contain inline-block shrink-0"
                      />
                    )}
                    <span
                      className={`mono text-[10.5px] font-bold tracking-wider uppercase leading-tight line-clamp-1 break-words ${
                        zone.isAwsVpc
                          ? "text-amber-700 dark:text-amber-400"
                          : zone.isDocker
                            ? "text-sky-700 dark:text-sky-400"
                            : "text-carbon dark:text-neutral-200"
                      }`}
                    >
                      {zone.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Layer 2: SVG Vector Connections Layer (Lines only) */}
          <svg
            viewBox={viewBoxStr}
            className="w-full h-auto min-h-[380px] overflow-visible pointer-events-none"
            style={{ width: `${layout.viewBox.width}px`, height: `${layout.viewBox.height}px` }}
          >
            <ArrowheadMarkers />

            {/* Render all animated edges */}
            <g className="pointer-events-auto">
              {layout.edges.map((edge) => {
                const isEdgeFocused = connectedEdgeIds.has(edge.id) || hoveredEdgeId === edge.id;
                const isJourneyEdge = currentJourneyEdgeId === edge.id;
                const isEdgeSelected = selectedEdgeId === edge.id;
                const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive || hoveredEdgeId);
                const isDimmed = hasActiveFocus && !isEdgeFocused && !isJourneyEdge && !isEdgeSelected;

                return (
                  <AnimatedEdge
                    key={edge.id}
                    edge={edge}
                    renderBadge={false}
                    shouldAnimate={shouldAnimate}
                    isFocused={isEdgeFocused}
                    isJourneyActive={isJourneyEdge}
                    isSelected={isEdgeSelected}
                    isDimmed={isDimmed}
                    onClick={() => handleEdgeClick(edge)}
                    onHover={(id) => setHoveredEdgeId(id)}
                  />
                );
              })}
            </g>
          </svg>

          {/* Layer 3: HTML Interactive Node Cards Layer (positioned over SVG) */}
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
                  ref={(el) => {
                    if (el) cardElementsRef.current.set(node.id, el);
                    else cardElementsRef.current.delete(node.id);
                  }}
                  style={{
                    position: "absolute",
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                  }}
                  className="node-interactive pointer-events-auto"
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

          {/* Layer 4: SVG Badges Layer (Rendered ON TOP of Cards & Lines) */}
          <svg
            viewBox={viewBoxStr}
            className="absolute inset-0 w-full h-auto min-h-[380px] overflow-visible pointer-events-none"
            style={{ width: `${layout.viewBox.width}px`, height: `${layout.viewBox.height}px` }}
          >
            <g className="pointer-events-auto">
              {layout.edges.map((edge) => {
                const isEdgeFocused = connectedEdgeIds.has(edge.id) || hoveredEdgeId === edge.id;
                const isJourneyEdge = currentJourneyEdgeId === edge.id;
                const isEdgeSelected = selectedEdgeId === edge.id;
                const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive || hoveredEdgeId);
                const isDimmed = hasActiveFocus && !isEdgeFocused && !isJourneyEdge && !isEdgeSelected;

                return (
                  <EdgeBadge
                    key={`badge-${edge.id}`}
                    edge={edge}
                    isHighlighted={isEdgeFocused || isJourneyEdge || isEdgeSelected}
                    isDimmed={isDimmed}
                    onClick={() => handleEdgeClick(edge)}
                    onHover={(id) => setHoveredEdgeId(id)}
                  />
                );
              })}

              {/* Debug Geometry Mode (?debug=geometry) */}
              {isDebugGeometry && (
                <g className="debug-geometry-overlay pointer-events-none">
                  {layout.ports?.map((p, idx) => (
                    <circle
                      key={`port-${idx}`}
                      cx={p.x}
                      cy={p.y}
                      r={3}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  ))}
                  {layout.edges.map((e) => (
                    <g key={`dbg-pts-${e.id}`}>
                      <circle cx={e.startPoint.x} cy={e.startPoint.y} r={3.5} fill="#10b981" />
                      <circle cx={e.endPoint.x} cy={e.endPoint.y} r={3.5} fill="#f59e0b" />
                      {e.midX !== undefined && e.midY !== undefined && (
                        <circle cx={e.midX} cy={e.midY} r={2} fill="#6366f1" />
                      )}
                    </g>
                  ))}
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Flow List Table: [ # | From -> To | Flow / Action | Protocol / Type ] */}
      {layout.edges.length > 0 && (
        <div className="mt-3 w-full border border-border/80 rounded-lg bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="mono text-[10.5px] font-bold uppercase tracking-wider text-carbon dark:text-neutral-200">
                End-to-End Flows ({layout.edges.length})
              </span>
              <span className="mono text-[9px] px-1.5 py-0.5 rounded bg-cobalt/10 text-cobalt font-semibold">
                Numbered Corridors
              </span>
            </div>
            <span className="mono text-[9px] text-muted-foreground hidden sm:inline">
              Hover row to highlight &bull; Click to inspect
            </span>
          </div>

          <div className="overflow-x-auto max-h-32 overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground mono text-[9.5px] uppercase tracking-wider">
                  <th className="py-1 px-2 w-8">#</th>
                  <th className="py-1 px-2 min-w-[160px]">From &rarr; To</th>
                  <th className="py-1 px-2 min-w-[180px]">Flow / Action</th>
                  <th className="py-1 px-2 min-w-[100px]">Protocol / Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {layout.edges.map((e) => {
                  const srcNode = layout.nodes.find((n) => n.id === e.source);
                  const tgtNode = layout.nodes.find((n) => n.id === e.target);
                  const isHovered = hoveredEdgeId === e.id || hoveredNodeId === e.source || hoveredNodeId === e.target || selectedEdgeId === e.id;
                  const isSec = Boolean(e.secondary);

                  return (
                    <tr
                      key={e.id}
                      onMouseEnter={() => {
                        setHoveredEdgeId(e.id);
                        setHoveredNodeId(e.source);
                      }}
                      onMouseLeave={() => {
                        setHoveredEdgeId(null);
                        setHoveredNodeId(null);
                      }}
                      onClick={() => handleEdgeClick(e)}
                      className={`transition-colors cursor-pointer select-none ${
                        isHovered
                          ? "bg-cobalt/10 text-carbon dark:text-white"
                          : "hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 text-muted-foreground hover:text-carbon dark:hover:text-neutral-200"
                      }`}
                    >
                      <td className="py-1 px-2 font-mono font-bold text-cobalt">
                        {e.badgeIndex ? (
                          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-cobalt/15 text-cobalt text-[9px]">
                            {e.badgeIndex}
                          </span>
                        ) : e.badgeLetter ? (
                          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-stone-200 dark:bg-neutral-700 text-stone-600 dark:text-stone-300 text-[9px]">
                            {e.badgeLetter}
                          </span>
                        ) : (
                          <span className="text-[9px] text-neutral-400">--</span>
                        )}
                      </td>
                      <td className="py-1 px-2 font-semibold">
                        <span className="text-carbon dark:text-neutral-100">{srcNode?.name || e.source}</span>
                        <span className="text-muted-foreground mx-1.5">&rarr;</span>
                        <span className="text-carbon dark:text-neutral-100">{tgtNode?.name || e.target}</span>
                      </td>
                      <td className="py-1 px-2 truncate max-w-xs">
                        <span className="font-medium text-carbon dark:text-neutral-200">
                          {e.label || "Data Transfer"}
                        </span>
                        {isSec && (
                          <span className="ml-1.5 mono text-[8.5px] px-1 py-0.5 rounded bg-stone-100 dark:bg-neutral-800 text-stone-500">
                            secondary
                          </span>
                        )}
                      </td>
                      <td className="py-1 px-2 mono text-[9.5px] text-muted-foreground">
                        {e.protocol || e.category}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
