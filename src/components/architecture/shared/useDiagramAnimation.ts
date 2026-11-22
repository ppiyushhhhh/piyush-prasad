import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { UnifiedNode, UnifiedEdge } from "./layout";

export interface JourneyStepInfo {
  stepNumber: number;
  totalSteps: number;
  node: UnifiedNode;
  edge?: UnifiedEdge;
  nextNode?: UnifiedNode;
  transferredData?: string;
  servicePurpose?: string;
  caption: string;
}

export function useDiagramAnimation({
  containerRef,
  nodes,
  edges,
  journeyPath,
  onSelectNode,
  onSelectEdge,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  nodes: UnifiedNode[];
  edges: UnifiedEdge[];
  journeyPath: string[];
  onSelectNode?: (node: UnifiedNode | null) => void;
  onSelectEdge?: (edge: UnifiedEdge | null) => void;
}) {
  // 1. Live / Paused toggle with localStorage persistence
  const [isLive, setIsLive] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("pp_arch_diagram_live");
        return stored !== "false";
      }
    } catch {
      // Ignore localStorage access restrictions
    }
    return true;
  });

  const toggleLive = useCallback(() => {
    setIsLive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pp_arch_diagram_live", String(next));
      } catch {
        // Ignore localStorage access restrictions
      }
      return next;
    });
  }, []);

  // 2. Reduced motion detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // 3. Tab visibility detection
  const [isTabVisible, setIsTabVisible] = useState(true);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState !== "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 4. IntersectionObserver for viewport on-screen pause
  const [isIntersecting, setIsIntersecting] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  // Combined master animation switch
  const shouldAnimate = isLive && isTabVisible && isIntersecting && !prefersReducedMotion;

  // 5. Hover and selection state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Compute connected nodes and edges for dimming
  const activeFocusNodeId = hoveredNodeId || selectedNodeId;

  const connectedEdgeIds = useMemo(() => {
    if (!activeFocusNodeId) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((e) => {
      if (e.source === activeFocusNodeId || e.target === activeFocusNodeId) {
        set.add(e.id);
      }
    });
    return set;
  }, [activeFocusNodeId, edges]);

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusNodeId) return new Set<string>();
    const set = new Set<string>([activeFocusNodeId]);
    edges.forEach((e) => {
      if (e.source === activeFocusNodeId) set.add(e.target);
      if (e.target === activeFocusNodeId) set.add(e.source);
    });
    return set;
  }, [activeFocusNodeId, edges]);

  // 6. Request journey playback
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const [isJourneyPlaying, setIsJourneyPlaying] = useState(false);
  const [journeySpeed, setJourneySpeed] = useState<0.5 | 1 | 2>(1);
  const [journeyLoop, setJourneyLoop] = useState(true);

  const totalJourneySteps = journeyPath.length;

  const currentJourneyNodeId = isJourneyActive && totalJourneySteps > 0
    ? journeyPath[journeyStep] || null
    : null;

  const currentJourneyEdgeId = useMemo(() => {
    if (!isJourneyActive || journeyStep === 0 || totalJourneySteps <= 1) return null;
    const prevNodeId = journeyPath[journeyStep - 1];
    const currNodeId = journeyPath[journeyStep];
    const match = edges.find(
      (e) => (e.source === prevNodeId && e.target === currNodeId) ||
             (e.source === currNodeId && e.target === prevNodeId)
    );
    return match?.id || null;
  }, [isJourneyActive, journeyStep, journeyPath, totalJourneySteps, edges]);

  // Step Caption & Rich Journey details calculation
  const currentStepInfo: JourneyStepInfo | null = useMemo(() => {
    if (!isJourneyActive || !currentJourneyNodeId) return null;
    const node = nodes.find((n) => n.id === currentJourneyNodeId);
    if (!node) return null;

    let edge: UnifiedEdge | undefined;
    if (journeyStep > 0) {
      const prevId = journeyPath[journeyStep - 1];
      edge = edges.find((e) => (e.source === prevId && e.target === currentJourneyNodeId) || (e.source === currentJourneyNodeId && e.target === prevId));
    }

    const nextNodeId = journeyStep + 1 < totalJourneySteps ? journeyPath[journeyStep + 1] : null;
    const nextNode = nextNodeId ? nodes.find((n) => n.id === nextNodeId) : undefined;

    const transferredData = edge?.description || (edge?.protocol ? `${edge.protocol} Traffic · ${edge.label || "Synchronous packet transmission"}` : (node.port ? `Port ${node.port} · Ingress Traffic` : "Application layer event & data dispatch"));
    const servicePurpose = node.responsibilities && node.responsibilities.length > 0 ? node.responsibilities[0] : node.description;

    const proto = edge?.protocol || edge?.label || node.port ? `Port ${node.port || ""}` : "Direct Connection";
    const desc = node.description ? ` · ${node.description.slice(0, 75)}` : "";
    const caption = `Step ${journeyStep + 1}/${totalJourneySteps} · ${proto} · ${node.name}${desc}`;

    return {
      stepNumber: journeyStep + 1,
      totalSteps: totalJourneySteps,
      node,
      edge,
      nextNode,
      transferredData,
      servicePurpose,
      caption,
    };
  }, [isJourneyActive, currentJourneyNodeId, journeyStep, totalJourneySteps, nodes, edges, journeyPath]);

  // Step controls
  const startJourney = useCallback(() => {
    if (totalJourneySteps === 0) return;
    setIsJourneyActive(true);
    setJourneyStep(0);
    setIsJourneyPlaying(!prefersReducedMotion);
  }, [totalJourneySteps, prefersReducedMotion]);

  const stopJourney = useCallback(() => {
    setIsJourneyActive(false);
    setIsJourneyPlaying(false);
    setJourneyStep(0);
  }, []);

  const toggleJourneyPlay = useCallback(() => {
    if (!isJourneyActive) {
      startJourney();
    } else {
      setIsJourneyPlaying((p) => !p);
    }
  }, [isJourneyActive, startJourney]);

  const toggleJourneyLoop = useCallback(() => {
    setJourneyLoop((prev) => !prev);
  }, []);

  const nextJourneyStep = useCallback(() => {
    setJourneyStep((prev) => {
      if (prev + 1 < totalJourneySteps) {
        return prev + 1;
      }
      if (journeyLoop) return 0;
      setIsJourneyPlaying(false);
      return prev;
    });
  }, [totalJourneySteps, journeyLoop]);

  const prevJourneyStep = useCallback(() => {
    setJourneyStep((prev) => (prev > 0 ? prev - 1 : totalJourneySteps - 1));
  }, [totalJourneySteps]);

  // Auto-play timer for journey
  useEffect(() => {
    if (!isJourneyActive || !isJourneyPlaying || !shouldAnimate) return;

    const baseInterval = 2400;
    const intervalTime = baseInterval / journeySpeed;

    const timer = setInterval(() => {
      nextJourneyStep();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isJourneyActive, isJourneyPlaying, shouldAnimate, journeySpeed, nextJourneyStep]);

  // Sync journey active node with selection if desired
  useEffect(() => {
    if (isJourneyActive && currentJourneyNodeId) {
      const match = nodes.find((n) => n.id === currentJourneyNodeId);
      if (match && onSelectNode) {
        onSelectNode(match);
      }
    }
  }, [isJourneyActive, currentJourneyNodeId, nodes, onSelectNode]);

  // Handlers for node & edge selection
  const handleNodeClick = useCallback(
    (node: UnifiedNode) => {
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
      setSelectedEdgeId(null);
      if (onSelectNode) {
        onSelectNode(selectedNodeId === node.id ? null : node);
      }
    },
    [selectedNodeId, onSelectNode]
  );

  const handleEdgeClick = useCallback(
    (edge: UnifiedEdge) => {
      setSelectedEdgeId((prev) => (prev === edge.id ? null : edge.id));
      if (onSelectEdge) {
        onSelectEdge(selectedEdgeId === edge.id ? null : edge);
      }
    },
    [selectedEdgeId, onSelectEdge]
  );

  return {
    isLive,
    toggleLive,
    shouldAnimate,
    prefersReducedMotion,
    hoveredNodeId,
    setHoveredNodeId,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    activeFocusNodeId,
    connectedNodeIds,
    connectedEdgeIds,
    // Journey State & Controls
    isJourneyActive,
    isJourneyPlaying,
    journeyStep,
    totalJourneySteps,
    journeySpeed,
    setJourneySpeed,
    journeyLoop,
    setJourneyLoop,
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
  };
}
