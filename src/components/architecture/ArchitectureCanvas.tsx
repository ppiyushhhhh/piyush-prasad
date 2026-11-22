import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Compass,
  Search,
  RotateCcw,
} from "lucide-react";
import type {
  ArchitectureDiagramData,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureViewMode,
} from "@/lib/architecture-diagrams";
import {
  exportDiagramAsPng,
  exportDiagramAsPdf,
  exportDiagramAsGif,
  type FlowItem,
} from "@/lib/architecture-export";
import {
  layoutArchitectureCanvas,
  deriveRequestJourney,
  type UnifiedNode,
  type UnifiedEdge,
} from "./shared/layout";
import { useDiagramAnimation } from "./shared/useDiagramAnimation";
import { AnimatedEdge, EdgeBadge } from "./shared/AnimatedEdge";
import { NodeCard } from "./shared/NodeCard";
import { ArrowheadMarkers } from "./shared/ArrowheadMarkers";
import { DiagramToolbar } from "./shared/DiagramToolbar";
import { NodeLogo } from "./NodeLogo";
import { getNodeCategoryIcon } from "./shared/NodeCard";
import { toast } from "sonner";

interface ArchitectureCanvasProps {
  data: ArchitectureDiagramData;
  title?: string;
  slug?: string;
  description?: string;
  viewMode: ArchitectureViewMode;
  selectedNode: ArchitectureNode | null;
  selectedEdge?: ArchitectureEdge | null;
  onSelectNode: (node: ArchitectureNode | null) => void;
  onSelectEdge?: (edge: ArchitectureEdge | null) => void;
  onOpenWorkspace?: () => void;
  isEditable?: boolean;
  onUpdateNodes?: (nodes: ArchitectureNode[]) => void;
  isIsolated?: boolean;
  onToggleIsolate?: () => void;
  className?: string;
}

export function ArchitectureCanvas({
  data,
  title = "Cloud Infrastructure Architecture",
  slug = "infrastructure-architecture",
  description = "",
  viewMode,
  selectedNode,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
  onOpenWorkspace,
  isEditable = false,
  onUpdateNodes,
  isIsolated: propsIsIsolated,
  onToggleIsolate,
  className = "",
}: ArchitectureCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout mode: "auto" (clean infrastructure tier lanes) vs "preset" (original / custom coordinates)
  const [layoutMode, setLayoutMode] = useState<"auto" | "preset">("auto");

  // Search, Filter and Isolation States
  const [internalIsolated, setInternalIsolated] = useState(false);
  const isIsolated = propsIsIsolated !== undefined ? propsIsIsolated : internalIsolated;
  const toggleIsolated = onToggleIsolate || (() => setInternalIsolated((prev) => !prev));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(data.nodes.map((n) => n.category))).sort();
  }, [data.nodes]);

  const availableProviders = useMemo(() => {
    return Array.from(new Set(data.nodes.map((n) => n.provider))).sort();
  }, [data.nodes]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedProvider("all");
    if (propsIsIsolated === undefined) {
      setInternalIsolated(false);
    } else if (onToggleIsolate && propsIsIsolated) {
      onToggleIsolate();
    }
  }, [propsIsIsolated, onToggleIsolate]);

  // Secondary flows state (hidden by default)
  const [showSecondary, setShowSecondary] = useState(false);
  const secondaryCount = useMemo(() => {
    return (data.edges || []).filter((e) => e.secondary || e.category === "telemetry").length;
  }, [data.edges]);

  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const [measuredCards, setMeasuredCards] = useState<Map<string, { width: number; height: number }>>(new Map());

  // Real rendered card geometry measurement (Fix 1.1)
  useEffect(() => {
    let changed = false;
    const next = new Map(measuredCards);
    cardElementsRef.current.forEach((el, id) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0) {
        const prev = next.get(id);
        if (!prev || Math.abs(prev.width - w) > 1 || Math.abs(prev.height - h) > 1) {
          next.set(id, { width: w, height: h });
          changed = true;
        }
      }
    });
    if (changed) {
      setMeasuredCards(next);
    }
  }, [data, layoutMode]);

  const isDebugGeometry = typeof window !== "undefined" && window.location.search.includes("debug=geometry");

  // Compute unified DAG layout for nodes & edges with real card geometry
  const layout = useMemo(
    () =>
      layoutArchitectureCanvas(data, {
        autoLayout: layoutMode === "auto",
        showSecondary,
        cardDimensions: measuredCards,
      }),
    [data, layoutMode, showSecondary, measuredCards]
  );

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [gifProgress, setGifProgress] = useState<number | null>(null);
  const gifAbortControllerRef = useRef<AbortController | null>(null);

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

  // Calculate Scale to Fit Diagram Perfectly Inside Container Viewport
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (!clientWidth || !clientHeight) return;

    const padX = clientWidth > 1024 ? 80 : 40;
    const padY = clientHeight > 700 ? 70 : 40;
    const availW = Math.max(clientWidth - padX * 2, 280);
    const availH = Math.max(clientHeight - padY * 2, 220);

    const scaleX = availW / layout.viewBox.width;
    const scaleY = availH / layout.viewBox.height;
    const fitScale = Math.min(scaleX, scaleY);

    // Clamp zoom scale comfortably between 0.35 and 1.3
    const newZoom = Math.min(Math.max(Number(fitScale.toFixed(2)), 0.35), 1.3);

    // Center diagram within container viewport
    const renderedW = layout.viewBox.width * newZoom;
    const renderedH = layout.viewBox.height * newZoom;

    const newPanX = (clientWidth - renderedW) / 2 - layout.viewBox.minX * newZoom;
    const newPanY = (clientHeight - renderedH) / 2 - layout.viewBox.minY * newZoom;

    setZoom(newZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [layout.viewBox]);

  // Automatically trigger fitToScreen on initial mount & whenever diagram or layout changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 40);
    return () => clearTimeout(timer);
  }, [data, layoutMode, fitToScreen]);

  // ResizeObserver to re-fit when parent container or window dimensions change
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    let initial = true;
    const observer = new ResizeObserver(() => {
      if (initial) {
        initial = false;
        return;
      }
      fitToScreen();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [fitToScreen]);

  // Center-Anchored Zoom In / Zoom Out
  const zoomAroundCenter = useCallback((delta: number) => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const centerX = clientWidth / 2;
    const centerY = clientHeight / 2;

    setZoom((prevZoom) => {
      const nextZoom = Math.min(Math.max(Number((prevZoom + delta).toFixed(2)), 0.35), 2.2);
      if (nextZoom === prevZoom) return prevZoom;

      setPan((prevPan) => {
        const factor = nextZoom / prevZoom;
        const newPanX = centerX - (centerX - prevPan.x) * factor;
        const newPanY = centerY - (centerY - prevPan.y) * factor;
        return { x: Math.round(newPanX), y: Math.round(newPanY) };
      });

      return nextZoom;
    });
  }, []);

  const handleZoomIn = () => zoomAroundCenter(0.15);
  const handleZoomOut = () => zoomAroundCenter(-0.15);
  const handleReset = () => fitToScreen();

  // Cursor-Anchored Mouse Wheel Zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(Math.max(Number((prevZoom + zoomFactor).toFixed(2)), 0.35), 2.2);
      if (nextZoom === prevZoom) return prevZoom;

      setPan((prevPan) => {
        const factor = nextZoom / prevZoom;
        const newPanX = cursorX - (cursorX - prevPan.x) * factor;
        const newPanY = cursorY - (cursorY - prevPan.y) * factor;
        return { x: Math.round(newPanX), y: Math.round(newPanY) };
      });

      return nextZoom;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Mouse Pan Handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        (e.target as HTMLElement).closest(".node-interactive") ||
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest(".interactive-card")
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

  // Touch Navigation Handlers (1-finger pan, 2-finger pinch-to-zoom)
  const touchStateRef = useRef<{
    mode: "pan" | "pinch" | null;
    startPan: { x: number; y: number };
    startX: number;
    startY: number;
    startDist: number;
    startZoom: number;
  }>({
    mode: null,
    startPan: { x: 0, y: 0 },
    startX: 0,
    startY: 0,
    startDist: 0,
    startZoom: 1,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (
      (e.target as HTMLElement).closest(".node-interactive") ||
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest(".interactive-card")
    ) {
      return;
    }

    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStateRef.current = {
        mode: "pan",
        startPan: { ...pan },
        startX: t.clientX,
        startY: t.clientY,
        startDist: 0,
        startZoom: zoom,
      };
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStateRef.current = {
        mode: "pinch",
        startPan: { ...pan },
        startX: (t1.clientX + t2.clientX) / 2,
        startY: (t1.clientY + t2.clientY) / 2,
        startDist: dist,
        startZoom: zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const state = touchStateRef.current;
    if (state.mode === "pan" && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - state.startX;
      const dy = t.clientY - state.startY;
      setPan({
        x: Math.round(state.startPan.x + dx),
        y: Math.round(state.startPan.y + dy),
      });
    } else if (state.mode === "pinch" && e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (state.startDist > 0) {
        const factor = dist / state.startDist;
        const nextZoom = Math.min(Math.max(Number((state.startZoom * factor).toFixed(2)), 0.35), 2.2);
        setZoom(nextZoom);
      }
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current.mode = null;
  };

  // Node Drag start (Editable Mode)
  const handleNodeDragStart = (e: React.MouseEvent, node: UnifiedNode) => {
    if (!isEditable) return;
    e.stopPropagation();
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - (node.x * zoom + pan.x),
      y: e.clientY - (node.y * zoom + pan.y),
    });
  };

  // Sync external selection props
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

  // Compute active node filter by viewMode, search, category, provider, and isolation mode
  const isNodeActiveInView = useCallback(
    (node: UnifiedNode): boolean => {
      // Isolation Mode: if active and a node is selected, only keep selected node + directly connected nodes
      if (isIsolated && selectedNodeId) {
        if (node.id !== selectedNodeId && !connectedNodeIds.has(node.id)) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = node.name.toLowerCase().includes(q);
        const matchTech = node.tech.toLowerCase().includes(q);
        const matchDesc = node.description ? node.description.toLowerCase().includes(q) : false;
        const matchProvider = node.provider.toLowerCase().includes(q);
        if (!matchName && !matchTech && !matchDesc && !matchProvider) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all" && node.category !== selectedCategory) {
        return false;
      }

      // Provider filter
      if (selectedProvider !== "all" && node.provider !== selectedProvider) {
        return false;
      }

      switch (viewMode) {
        case "topology":
          return true;
        case "request_flow":
          return ["client", "dns", "cdn", "networking", "compute", "application", "database"].includes(node.category);
        case "dns_network":
        case "network":
          return ["client", "dns", "cdn", "networking"].includes(node.category);
        case "security":
          return (
            ["security", "dns"].includes(node.category) ||
            Boolean(node.security_controls && node.security_controls.length > 0)
          );
        case "deployment":
          return ["cicd", "compute"].includes(node.category);
        case "data_flow":
        case "infrastructure":
          return ["database", "storage", "compute", "application"].includes(node.category);
        default:
          return true;
      }
    },
    [isIsolated, selectedNodeId, connectedNodeIds, searchQuery, selectedCategory, selectedProvider, viewMode]
  );

  // Compute active edge filter by viewMode, isolation mode, and active nodes
  const isEdgeActiveInView = useCallback(
    (edge: UnifiedEdge): boolean => {
      if (isIsolated && selectedNodeId) {
        if (edge.source !== selectedNodeId && edge.target !== selectedNodeId) {
          return false;
        }
      }
      if (
        viewMode === "topology" &&
        !isIsolated &&
        !searchQuery.trim() &&
        selectedCategory === "all" &&
        selectedProvider === "all"
      ) {
        return true;
      }
      const srcNode = layout.nodes.find((n) => n.id === edge.source);
      const tgtNode = layout.nodes.find((n) => n.id === edge.target);
      if (!srcNode || !tgtNode) return false;
      return isNodeActiveInView(srcNode) && isNodeActiveInView(tgtNode);
    },
    [
      isIsolated,
      selectedNodeId,
      viewMode,
      searchQuery,
      selectedCategory,
      selectedProvider,
      layout.nodes,
      isNodeActiveInView,
    ]
  );

  // Export handlers
  const handleExportPng = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      await exportDiagramAsPng(
        containerRef.current,
        slug,
        data,
        title,
        description
      );
      toast.success("High-resolution PNG exported successfully");
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      const flows: FlowItem[] = layout.edges
        .filter((e) => e.badgeIndex !== undefined)
        .map((e) => {
          const srcNode = layout.nodes.find((n) => n.id === e.source);
          const tgtNode = layout.nodes.find((n) => n.id === e.target);
          return {
            badgeIndex: e.badgeIndex!,
            from: srcNode?.name || e.source,
            to: tgtNode?.name || e.target,
            label: e.label || "",
            protocol: e.protocol,
            category: e.category,
          };
        });

      await exportDiagramAsPdf(
        containerRef.current,
        slug,
        data,
        title,
        description,
        flows
      );
      toast.success("Vector PDF document exported successfully");
    } catch (err) {
      toast.error(`PDF export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGif = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      setGifProgress(0);
      const controller = new AbortController();
      gifAbortControllerRef.current = controller;

      await exportDiagramAsGif(
        containerRef.current,
        slug,
        data,
        title,
        (percent) => setGifProgress(percent),
        controller.signal
      );
      toast.success("Animated GIF exported successfully (3s loop)");
    } catch (err) {
      if ((err as Error)?.message?.includes("cancelled")) {
        toast.info("GIF export cancelled");
      } else {
        toast.error(`GIF export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    } finally {
      setIsExporting(false);
      setGifProgress(null);
      gifAbortControllerRef.current = null;
    }
  };

  const handleCancelGif = () => {
    if (gifAbortControllerRef.current) {
      gifAbortControllerRef.current.abort();
    }
  };

  return (
    <div
      role="img"
      aria-label="Interactive Architecture Explorer"
      className={`relative flex flex-col select-none rounded-xl border border-border bg-[#FAF9F6] dark:bg-[#0E0F12] overflow-hidden transition-all shadow-xs ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-white dark:bg-[#121316] h-full w-full" : className
      }`}
    >
      {/* Dedicated Top Toolbar Bar (Separated from stage so NO cards are ever hidden behind it) */}
      <div className="w-full border-b border-border/80 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md px-4 py-2.5 z-20 shrink-0">
        <DiagramToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleReset}
          onFitToScreen={fitToScreen}
          layoutMode={layoutMode}
          onToggleLayoutMode={() => setLayoutMode(layoutMode === "auto" ? "preset" : "auto")}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onOpenWorkspace={onOpenWorkspace}
          showSecondary={showSecondary}
          onToggleSecondary={() => setShowSecondary(!showSecondary)}
          secondaryCount={secondaryCount}
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
          onExportPng={handleExportPng}
          onExportPdf={handleExportPdf}
          onExportGif={handleExportGif}
          isExporting={isExporting}
          gifProgress={gifProgress}
          onCancelGif={handleCancelGif}
        />
      </div>

      {/* Search & Filter Strip */}
      <div className="w-full border-b border-border/70 bg-[#FAF9F6]/90 dark:bg-[#121316]/90 backdrop-blur-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 z-10 shrink-0 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components or tech..."
              className="w-full pl-8 pr-7 py-1 text-xs rounded-md border border-border bg-white dark:bg-neutral-900 text-carbon dark:text-neutral-100 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cobalt"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-carbon cursor-pointer"
                title="Clear Search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-md border border-border bg-white dark:bg-neutral-900 text-carbon dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cobalt cursor-pointer"
          >
            <option value="all">All Categories ({availableCategories.length})</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Provider Dropdown */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-md border border-border bg-white dark:bg-neutral-900 text-carbon dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cobalt cursor-pointer"
          >
            <option value="all">All Providers ({availableProviders.length})</option>
            {availableProviders.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>

          {/* Reset Filters button if any filter active */}
          {(searchQuery || selectedCategory !== "all" || selectedProvider !== "all" || isIsolated) && (
            <button
              type="button"
              onClick={resetFilters}
              className="mono text-[10px] font-semibold text-muted-foreground hover:text-carbon dark:hover:text-white px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Reset all search & filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Isolation Mode Toggle (When a node is selected) */}
        {selectedNodeId && (
          <button
            type="button"
            onClick={toggleIsolated}
            className={`mono text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              isIsolated
                ? "bg-cobalt text-white border-cobalt shadow-xs"
                : "bg-white dark:bg-neutral-900 border-border text-carbon dark:text-neutral-200 hover:border-cobalt"
            }`}
            title="Isolate selected component and its direct dependencies"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isIsolated ? "bg-white animate-pulse" : "bg-cobalt"}`} />
            {isIsolated ? "Isolation Active (Connected Only)" : "Show Related Components"}
          </button>
        )}
      </div>

      {/* Main Interactive Pan/Zoom Surface (Takes 100% of remaining height) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`relative flex-1 min-h-[580px] w-full overflow-hidden ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(100, 116, 139, 0.12) 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
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
          {/* Layer 1: Visual Zones & Boundaries Layer (Background) */}
          <div className="absolute inset-0 pointer-events-none">
            {layout.zones.map((zone) => (
              <div
                key={zone.id}
                style={{
                  transform: `translate(${zone.x}px, ${zone.y}px)`,
                  width: `${zone.width}px`,
                  height: `${zone.height}px`,
                }}
                className={`tier-container absolute rounded-2xl pointer-events-none transition-all ${
                  zone.isAwsVpc
                    ? "border-2 border-dashed border-amber-500/40 bg-amber-500/[0.025] dark:border-amber-400/30 dark:bg-amber-400/[0.015]"
                    : "border border-dashed border-border/80 bg-white/40 dark:border-white/10 dark:bg-white/[0.015] shadow-2xs"
                }`}
              >
                {/* Dedicated Header Strip for Title (no ellipsis, wraps cleanly to 2 lines) */}
                <div
                  className="tier-header-strip absolute top-0 left-0 right-0 min-h-[36px] py-1 px-3.5 flex items-center border-b border-border/60 bg-stone-100/70 dark:bg-neutral-900/70 rounded-t-2xl pointer-events-none"
                  title={zone.description}
                >
                  <span
                    className={`mono text-[11px] font-bold tracking-wider uppercase leading-tight line-clamp-2 break-words ${
                      zone.isAwsVpc ? "text-amber-700 dark:text-amber-400" : "text-carbon dark:text-neutral-200"
                    }`}
                  >
                    {zone.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Layer 2: SVG Vector Connections Layer (Lines only) */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "4200px", height: "2800px", overflow: "visible" }}
          >
            <ArrowheadMarkers />

            {/* Connection Paths */}
            <g className="pointer-events-auto">
              {layout.edges.map((edge) => {
                const isEdgeFocused = connectedEdgeIds.has(edge.id) || hoveredEdgeId === edge.id;
                const isJourneyEdge = currentJourneyEdgeId === edge.id;
                const isEdgeSelected = selectedEdgeId === edge.id;
                const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive);
                const isActiveInView = isEdgeActiveInView(edge);
                const isDimmed =
                  !isActiveInView || (hasActiveFocus && !isEdgeFocused && !isJourneyEdge && !isEdgeSelected);

                return (
                  <AnimatedEdge
                    key={edge.id}
                    edge={edge}
                    renderBadge={false}
                    shouldAnimate={shouldAnimate && isActiveInView}
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

          {/* Layer 3: HTML Interactive Node Cards */}
          <div className="absolute inset-0 pointer-events-auto">
            {layout.nodes.map((node, idx) => {
              const isNodeFocused = connectedNodeIds.has(node.id);
              const isNodeJourney = currentJourneyNodeId === node.id;
              const isNodeSelected = selectedNodeId === node.id;
              const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive);
              const isActiveInView = isNodeActiveInView(node);
              const isDimmed = !isActiveInView || (hasActiveFocus && !isNodeFocused && !isNodeJourney && !isNodeSelected);

              return (
                <div
                  key={node.id}
                  ref={(el) => {
                    if (el) cardElementsRef.current.set(node.id, el);
                    else cardElementsRef.current.delete(node.id);
                  }}
                  onMouseDown={(e) => handleNodeDragStart(e, node)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    position: "absolute",
                  }}
                  className={`node-interactive transition-opacity ${
                    !isActiveInView ? "opacity-25 grayscale" : ""
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

          {/* Layer 4: SVG Badges Layer (Rendered ON TOP of Cards & Lines) */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "4200px", height: "2800px", overflow: "visible" }}
          >
            <g className="pointer-events-auto">
              {layout.edges.map((edge) => {
                const isEdgeFocused = connectedEdgeIds.has(edge.id) || hoveredEdgeId === edge.id;
                const isJourneyEdge = currentJourneyEdgeId === edge.id;
                const isEdgeSelected = selectedEdgeId === edge.id;
                const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || isJourneyActive);
                const isActiveInView = isEdgeActiveInView(edge);
                const isDimmed =
                  !isActiveInView || (hasActiveFocus && !isEdgeFocused && !isJourneyEdge && !isEdgeSelected);

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
                      key={`port-${idx}-${p.nodeId}-${p.edgeId}`}
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                  ))}
                  {layout.edges.map((e) => (
                    <g key={`debug-${e.id}`}>
                      <circle cx={e.startPoint.x} cy={e.startPoint.y} r="3" fill="#EF4444" />
                      <circle cx={e.endPoint.x} cy={e.endPoint.y} r="3" fill="#EF4444" />
                      <circle
                        cx={e.midX}
                        cy={e.midY}
                        r="12"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    </g>
                  ))}
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Guided Architecture Playback Card ("TRACE REQUEST") */}
      {isJourneyActive && currentStepInfo && (
        <div className="interactive-card absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-30 pointer-events-auto animate-in slide-in-from-bottom-3 duration-200">
          <div className="relative overflow-hidden rounded-xl border border-cobalt/40 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md p-4 shadow-xl text-xs space-y-3">
            {/* Progress Bar Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-full bg-cobalt transition-all duration-300"
                style={{
                  width: `${(currentStepInfo.stepNumber / currentStepInfo.totalSteps) * 100}%`,
                }}
              />
            </div>

            {/* Header: Beacon + Step Counter + Mini Controller */}
            <div className="flex items-center justify-between gap-2 pt-1 border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="mono inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-cobalt/15 text-cobalt border border-cobalt/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-cobalt animate-ping" />
                  STEP 0{currentStepInfo.stepNumber} OF 0{currentStepInfo.totalSteps}
                </span>
                <span className="mono text-[10px] text-muted-foreground font-semibold uppercase">
                  {currentStepInfo.node.category}
                </span>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevJourneyStep}
                  className="p-1 rounded text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
                  title="Previous Step"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={toggleJourneyPlay}
                  className="p-1 px-1.5 rounded bg-cobalt text-white hover:bg-cobalt/90 transition-colors cursor-pointer"
                  title={isJourneyPlaying ? "Pause Journey" : "Play Journey"}
                >
                  {isJourneyPlaying ? <Pause className="h-3 w-3 fill-white" /> : <Play className="h-3 w-3 fill-white" />}
                </button>
                <button
                  type="button"
                  onClick={nextJourneyStep}
                  className="p-1 rounded text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
                  title="Next Step"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={stopJourney}
                  className="p-1 rounded text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600 transition-colors cursor-pointer ml-1"
                  title="Exit Trace"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Active Service Card */}
            <div className="flex items-start gap-3">
              <NodeLogo
                tech={currentStepInfo.node.tech}
                provider={currentStepInfo.node.provider}
                fallbackIcon={getNodeCategoryIcon(currentStepInfo.node.category)}
                size="md"
                alt={currentStepInfo.node.name}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-carbon dark:text-white leading-tight">
                    {currentStepInfo.node.name}
                  </h4>
                  {currentStepInfo.node.port && (
                    <span className="mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cobalt/10 text-cobalt shrink-0">
                      Port {currentStepInfo.node.port}
                    </span>
                  )}
                </div>
                <p className="mono text-[10px] text-cobalt font-semibold truncate mt-0.5">
                  {currentStepInfo.node.tech} &bull; {currentStepInfo.node.provider}
                </p>
              </div>
            </div>

            {/* Service Requirement & Why Needed */}
            <div className="space-y-1 bg-stone-50 dark:bg-neutral-900/60 rounded-md p-2.5 border border-border/60">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Compass className="h-3 w-3 text-cobalt shrink-0" />
                <span className="mono text-[9px] uppercase font-bold tracking-wider">
                  ROLE &amp; FUNCTION IN PIPELINE
                </span>
              </div>
              <p className="text-[11px] text-carbon dark:text-neutral-200 leading-snug">
                {currentStepInfo.servicePurpose}
              </p>
            </div>

            {/* Transferred Data & Next Destination Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded border border-border/60 bg-white/60 dark:bg-neutral-900/40">
                <span className="mono text-[8.5px] uppercase font-bold text-muted-foreground block">
                  DATA TRANSMISSION
                </span>
                <span className="mono font-semibold text-carbon dark:text-neutral-200 block truncate mt-0.5">
                  {currentStepInfo.transferredData}
                </span>
              </div>

              <div className="p-2 rounded border border-border/60 bg-white/60 dark:bg-neutral-900/40">
                <span className="mono text-[8.5px] uppercase font-bold text-muted-foreground block">
                  NEXT FORWARDING TARGET
                </span>
                {currentStepInfo.nextNode ? (
                  <button
                    type="button"
                    onClick={nextJourneyStep}
                    className="inline-flex items-center gap-1 text-cobalt font-bold hover:underline mt-0.5 truncate text-left cursor-pointer"
                  >
                    <span>{currentStepInfo.nextNode.name}</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>Journey Complete</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Flow List Table: [ # | From -> To | Flow / Action | Protocol / Type ] */}
      {layout.edges.length > 0 && (
        <div className="w-full border-t border-border/80 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md px-4 py-2.5 z-20 shrink-0">
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
              Hover row to highlight connection &bull; Click to inspect
            </span>
          </div>

          <div className="overflow-x-auto max-h-36 overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground mono text-[9.5px] uppercase tracking-wider">
                  <th className="py-1 px-2 w-8">#</th>
                  <th className="py-1 px-2 min-w-[200px]">From &rarr; To</th>
                  <th className="py-1 px-2 min-w-[220px]">Flow / Action</th>
                  <th className="py-1 px-2 min-w-[120px]">Protocol / Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {layout.edges.map((e) => {
                  const srcNode = layout.nodes.find((n) => n.id === e.source);
                  const tgtNode = layout.nodes.find((n) => n.id === e.target);
                  const isHovered = hoveredEdgeId === e.id || selectedEdgeId === e.id;
                  const isSec = Boolean(e.secondary);

                  return (
                    <tr
                      key={e.id}
                      onMouseEnter={() => setHoveredEdgeId(e.id)}
                      onMouseLeave={() => setHoveredEdgeId(null)}
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
    </div>
  );
}