import type { ArchitectureCategory } from "@/lib/architecture-diagrams";
import type { ArchitectureData, ArchitectureComponent, ArchitectureConnection } from "@/lib/portfolio-projects";
import type { ArchitectureDiagramData, ArchitectureNode, ArchitectureEdge } from "@/lib/architecture-diagrams";

// Single Source of Truth for Card Dimensions & Layout Spacing
export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 96;
export const DEFAULT_NODE_WIDTH = NODE_WIDTH;
export const DEFAULT_NODE_HEIGHT = NODE_HEIGHT;
export const NODE_GAP_Y = 48; // "node-to-node 48 px vertical"
export const LAYER_GAP_X = 120; // "120 px between layers (columns)"
export const TIER_HEADER_H = 36; // 36 px header strip for title (allows 2 lines of text)
export const TIER_PADDING = 24; // bounding box of cards + 24 px padding
export const EDGE_CARD_CLEARANCE = 24; // 24 px minimum between an edge and a card

export interface CardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CardPort {
  x: number;
  y: number;
  nodeId: string;
  side: "left" | "right" | "top" | "bottom";
  edgeId: string;
  isSource: boolean;
}

export interface UnifiedNode {
  id: string;
  name: string;
  category: ArchitectureCategory;
  tech: string;
  provider: string;
  description: string;
  port?: string;
  status?: "operational" | "active" | "verified" | "secured";
  x: number;
  y: number;
  width: number;
  height: number;
  metricLabel?: string;
  responsibilities?: string[];
  configuration?: string[];
  security_controls?: string[];
  verification?: "code" | "documented";
  evidence?: string[];
  raw?: any;
  col?: number;
  row?: number;
  sectionId?: string;
}

export interface UnifiedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
  category: "network" | "data" | "security" | "deployment" | "telemetry";
  direction: "directional" | "bidirectional";
  description?: string;
  animated?: boolean;
  pathData: string;
  points: { x: number; y: number }[];
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  midX: number;
  midY: number;
  badgeIndex?: number;
  badgeLetter?: string;
  step?: number;
  secondary?: boolean;
  originalEdgeIds?: string[];
}

export interface LayoutOptions {
  autoLayout?: boolean;
  direction?: "RIGHT" | "DOWN";
  isMobile?: boolean;
  viewportWidth?: number;
  showSecondary?: boolean;
  cardDimensions?: Map<string, { width: number; height: number }>;
}

export interface LayoutZone {
  id: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds: string[];
  isAwsVpc?: boolean;
}

export interface LayoutResult {
  nodes: UnifiedNode[];
  edges: UnifiedEdge[];
  zones: LayoutZone[];
  ports: CardPort[];
  viewBox: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  };
  direction: "RIGHT" | "DOWN";
}

/**
 * Converts orthogonal polyline vertices to an SVG path with rounded corners (R = 10px).
 */
export function pointsToRoundedPath(points: { x: number; y: number }[], r = 10): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);
    const maxRadius = Math.min(r, d1 / 2, d2 / 2);

    if (maxRadius < 1) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const t1x = curr.x - ((curr.x - prev.x) / d1) * maxRadius;
    const t1y = curr.y - ((curr.y - prev.y) / d1) * maxRadius;
    const t2x = curr.x + ((next.x - curr.x) / d2) * maxRadius;
    const t2y = curr.y + ((next.y - curr.y) / d2) * maxRadius;

    d += ` L ${t1x} ${t1y} Q ${curr.x} ${curr.y} ${t2x} ${t2y}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export interface RectBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function rectsOverlap(r1: RectBox, r2: RectBox, margin = 4): boolean {
  return !(
    r1.right + margin <= r2.left ||
    r2.right + margin <= r1.left ||
    r1.bottom + margin <= r2.top ||
    r2.bottom + margin <= r1.top
  );
}

/**
 * Distributes ports evenly along card borders (>= 18px separation).
 * Returns exact port coordinates on the border of each card.
 */
export function allocateDistributedPorts(
  nodes: UnifiedNode[],
  edges: { id: string; source: string; target: string; direction?: string }[]
): {
  sourcePorts: Map<string, { x: number; y: number; side: "left" | "right" | "top" | "bottom" }>;
  targetPorts: Map<string, { x: number; y: number; side: "left" | "right" | "top" | "bottom" }>;
  allPorts: CardPort[];
} {
  const nodeMap = new Map<string, UnifiedNode>(nodes.map((n) => [n.id, n]));

  // Determine facing sides for each edge
  interface EdgeSideInfo {
    edgeId: string;
    sourceId: string;
    targetId: string;
    srcSide: "left" | "right" | "top" | "bottom";
    tgtSide: "left" | "right" | "top" | "bottom";
    otherCoordSrc: number; // for sorting
    otherCoordTgt: number; // for sorting
  }

  const sideAssignments: EdgeSideInfo[] = [];

  for (const edge of edges) {
    const s = nodeMap.get(edge.source);
    const t = nodeMap.get(edge.target);
    if (!s || !t) continue;

    const sRight = s.x + s.width;
    const sBottom = s.y + s.height;
    const tRight = t.x + t.width;
    const tBottom = t.y + t.height;

    let srcSide: "left" | "right" | "top" | "bottom";
    let tgtSide: "left" | "right" | "top" | "bottom";

    // Check relative layout orientation
    const colDiff = (t.col ?? 0) - (s.col ?? 0);
    const isSameCol = colDiff === 0 || Math.abs(s.x - t.x) < 40;

    if (isSameCol) {
      if (t.y >= sBottom - 10) {
        srcSide = "bottom";
        tgtSide = "top";
      } else {
        srcSide = "top";
        tgtSide = "bottom";
      }
    } else if (t.x >= sRight - 10) {
      srcSide = "right";
      tgtSide = "left";
    } else {
      // Reverse / Feedback edge (target is to the left)
      srcSide = "left";
      tgtSide = "right";
    }

    sideAssignments.push({
      edgeId: edge.id,
      sourceId: s.id,
      targetId: t.id,
      srcSide,
      tgtSide,
      otherCoordSrc: srcSide === "left" || srcSide === "right" ? t.y + t.height / 2 : t.x + t.width / 2,
      otherCoordTgt: tgtSide === "left" || tgtSide === "right" ? s.y + s.height / 2 : s.x + s.width / 2,
    });
  }

  // Group by (nodeId, side)
  const nodeSideConnections = new Map<string, { edgeId: string; isSource: boolean; otherCoord: number }[]>();

  for (const info of sideAssignments) {
    const srcKey = `${info.sourceId}:${info.srcSide}`;
    const tgtKey = `${info.targetId}:${info.tgtSide}`;

    if (!nodeSideConnections.has(srcKey)) nodeSideConnections.set(srcKey, []);
    nodeSideConnections.get(srcKey)!.push({
      edgeId: info.edgeId,
      isSource: true,
      otherCoord: info.otherCoordSrc,
    });

    if (!nodeSideConnections.has(tgtKey)) nodeSideConnections.set(tgtKey, []);
    nodeSideConnections.get(tgtKey)!.push({
      edgeId: info.edgeId,
      isSource: false,
      otherCoord: info.otherCoordTgt,
    });
  }

  const sourcePorts = new Map<string, { x: number; y: number; side: "left" | "right" | "top" | "bottom" }>();
  const targetPorts = new Map<string, { x: number; y: number; side: "left" | "right" | "top" | "bottom" }>();
  const allPorts: CardPort[] = [];

  // Distribute along each side
  nodeSideConnections.forEach((conns, key) => {
    const [nodeId, side] = key.split(":") as [string, "left" | "right" | "top" | "bottom"];
    const node = nodeMap.get(nodeId)!;

    // Sort connections by the other endpoint's coordinate to prevent line crossings
    conns.sort((a, b) => a.otherCoord - b.otherCoord);

    const k = conns.length;
    const isVerticalSide = side === "left" || side === "right";
    const span = isVerticalSide ? node.height : node.width;
    const center = isVerticalSide ? node.y + node.height / 2 : node.x + node.width / 2;

    // Minimum separation of 18px
    const spacing = k <= 1 ? 0 : Math.max(18, Math.min(28, (span - 32) / (k - 1)));
    const startOffset = k <= 1 ? 0 : -((k - 1) * spacing) / 2;

    conns.forEach((conn, idx) => {
      const offset = startOffset + idx * spacing;
      let x = 0;
      let y = 0;

      if (side === "right") {
        x = node.x + node.width;
        y = center + offset;
      } else if (side === "left") {
        x = node.x;
        y = center + offset;
      } else if (side === "bottom") {
        x = center + offset;
        y = node.y + node.height;
      } else {
        // top
        x = center + offset;
        y = node.y;
      }

      const port = { x: Math.round(x), y: Math.round(y), side };
      if (conn.isSource) {
        sourcePorts.set(conn.edgeId, port);
      } else {
        targetPorts.set(conn.edgeId, port);
      }

      allPorts.push({
        x: port.x,
        y: port.y,
        nodeId,
        side,
        edgeId: conn.edgeId,
        isSource: conn.isSource,
      });
    });
  });

  return { sourcePorts, targetPorts, allPorts };
}

/**
 * Routes orthogonal obstacle-free path between distributed source and target ports.
 */
export function routeOrthogonalEdge(
  sourceNode: UnifiedNode,
  targetNode: UnifiedNode,
  srcPort: { x: number; y: number; side: "left" | "right" | "top" | "bottom" },
  tgtPort: { x: number; y: number; side: "left" | "right" | "top" | "bottom" },
  edgeIndex: number,
  allNodes: UnifiedNode[],
  zones: LayoutZone[]
): { points: { x: number; y: number }[]; pathData: string } {
  const points: { x: number; y: number }[] = [];
  const stub = 24; // minimum stub length

  // Lane offset for distinct parallel channels (18px apart)
  const laneOffset = ((edgeIndex % 5) - 2) * 18;

  const isAdjacentRight =
    srcPort.side === "right" &&
    tgtPort.side === "left" &&
    tgtPort.x > srcPort.x &&
    (targetNode.col ?? 1) === (sourceNode.col ?? 0) + 1;

  if (isAdjacentRight) {
    // Direct forward step in gutter between adjacent columns
    const midGutterX = Math.round((srcPort.x + tgtPort.x) / 2) + laneOffset;

    if (Math.abs(srcPort.y - tgtPort.y) < 2) {
      // Perfectly horizontal
      points.push({ x: srcPort.x, y: srcPort.y }, { x: tgtPort.x, y: tgtPort.y });
    } else {
      points.push(
        { x: srcPort.x, y: srcPort.y },
        { x: midGutterX, y: srcPort.y },
        { x: midGutterX, y: tgtPort.y },
        { x: tgtPort.x, y: tgtPort.y }
      );
    }
  } else if (
    (srcPort.side === "bottom" && tgtPort.side === "top") ||
    (srcPort.side === "top" && tgtPort.side === "bottom")
  ) {
    // Same column vertical flow
    const midY = Math.round((srcPort.y + tgtPort.y) / 2) + laneOffset;
    if (Math.abs(srcPort.x - tgtPort.x) < 2) {
      points.push({ x: srcPort.x, y: srcPort.y }, { x: tgtPort.x, y: tgtPort.y });
    } else {
      points.push(
        { x: srcPort.x, y: srcPort.y },
        { x: srcPort.x, y: midY },
        { x: tgtPort.x, y: midY },
        { x: tgtPort.x, y: tgtPort.y }
      );
    }
  } else if (srcPort.side === "right" && tgtPort.side === "left" && tgtPort.x > srcPort.x) {
    // Multi-column forward (colDiff > 1): route through top or bottom channel
    // Find highest card top and lowest card bottom
    const allTops = allNodes.map((n) => n.y);
    const allBottoms = allNodes.map((n) => n.y + n.height);
    const minTop = Math.min(...allTops);
    const maxBottom = Math.max(...allBottoms);

    // Prefer bottom channel if available, or top corridor above tier headers
    const useBottom = edgeIndex % 2 === 1;
    if (useBottom) {
      const corridorY = maxBottom + 36 + Math.abs(laneOffset);
      const outX = srcPort.x + stub;
      const inX = tgtPort.x - stub;
      points.push(
        { x: srcPort.x, y: srcPort.y },
        { x: outX, y: srcPort.y },
        { x: outX, y: corridorY },
        { x: inX, y: corridorY },
        { x: inX, y: tgtPort.y },
        { x: tgtPort.x, y: tgtPort.y }
      );
    } else {
      const corridorY = Math.max(16, minTop - 48 - Math.abs(laneOffset));
      const outX = srcPort.x + stub;
      const inX = tgtPort.x - stub;
      points.push(
        { x: srcPort.x, y: srcPort.y },
        { x: outX, y: srcPort.y },
        { x: outX, y: corridorY },
        { x: inX, y: corridorY },
        { x: inX, y: tgtPort.y },
        { x: tgtPort.x, y: tgtPort.y }
      );
    }
  } else {
    // Reverse / Feedback or Same-column lateral: route around outer perimeter
    const allBottoms = allNodes.map((n) => n.y + n.height);
    const maxBottom = Math.max(...allBottoms);
    const corridorY = maxBottom + 40 + Math.abs(laneOffset);

    const outX = srcPort.x - stub - Math.abs(laneOffset);
    const inX = tgtPort.x + stub + Math.abs(laneOffset);

    points.push(
      { x: srcPort.x, y: srcPort.y },
      { x: outX, y: srcPort.y },
      { x: outX, y: corridorY },
      { x: inX, y: corridorY },
      { x: inX, y: tgtPort.y },
      { x: tgtPort.x, y: tgtPort.y }
    );
  }

  const pathData = pointsToRoundedPath(points, 10);
  return { points, pathData };
}

/**
 * Finds badge position strictly ON a straight segment of the polyline.
 * Slides along the line to guarantee zero overlap with cards, tier headers, or other badges.
 */
export function placeBadgeOnPath(
  points: { x: number; y: number }[],
  nodes: UnifiedNode[],
  zones: LayoutZone[],
  placedBadges: RectBox[]
): { midX: number; midY: number } {
  const pillR = 10;
  const pillBoxSize = 22;

  // Identify all straight segments
  interface Segment {
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    len: number;
    isHorizontal: boolean;
  }

  const segments: Segment[] = [];
  let totalLength = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    totalLength += len;
    segments.push({
      p1,
      p2,
      len,
      isHorizontal: Math.abs(p1.y - p2.y) < 1,
    });
  }

  // Sort segments by length (longest straight segment preferred)
  const validSegments = segments
    .filter((s) => s.len >= 36)
    .sort((a, b) => b.len - a.len);

  const fallback = {
    midX: points[0].x,
    midY: points[0].y,
  };

  if (validSegments.length === 0) {
    const p0 = points[0];
    const p1 = points[points.length - 1];
    return { midX: Math.round((p0.x + p1.x) / 2), midY: Math.round((p0.y + p1.y) / 2) };
  }

  // Helper to test if a point collides with cards, tier titles, or already placed badges
  function testCollision(x: number, y: number): boolean {
    const box: RectBox = {
      left: x - pillBoxSize / 2,
      top: y - pillBoxSize / 2,
      right: x + pillBoxSize / 2,
      bottom: y + pillBoxSize / 2,
    };

    // 1. Collides with any card?
    for (const n of nodes) {
      const nBox: RectBox = { left: n.x, top: n.y, right: n.x + n.width, bottom: n.y + n.height };
      if (rectsOverlap(box, nBox, 4)) return true;
    }

    // 2. Collides with tier header strip?
    for (const z of zones) {
      const zBox: RectBox = { left: z.x, top: z.y, right: z.x + z.width, bottom: z.y + TIER_HEADER_H + 4 };
      if (rectsOverlap(box, zBox, 4)) return true;
    }

    // 3. Collides with already placed badge?
    for (const pb of placedBadges) {
      if (rectsOverlap(box, pb, 6)) return true;
    }

    return false;
  }

  // Search along straight segments
  for (const seg of validSegments) {
    const minD = Math.min(20, seg.len * 0.2);
    const maxD = seg.len - minD;

    // Test midpoint first, then outwards in 8px increments
    const midD = seg.len / 2;
    const testDeltas = [0, 8, -8, 16, -16, 24, -24, 32, -32];

    for (const delta of testDeltas) {
      const d = midD + delta;
      if (d < minD || d > maxD) continue;

      const t = d / seg.len;
      const candX = Math.round(seg.p1.x + t * (seg.p2.x - seg.p1.x));
      const candY = Math.round(seg.p1.y + t * (seg.p2.y - seg.p1.y));

      if (!testCollision(candX, candY)) {
        placedBadges.push({
          left: candX - pillBoxSize / 2,
          top: candY - pillBoxSize / 2,
          right: candX + pillBoxSize / 2,
          bottom: candY + pillBoxSize / 2,
        });
        return { midX: candX, midY: candY };
      }
    }
  }

  // Fallback to midpoint of longest segment
  const bestSeg = validSegments[0];
  const midX = Math.round((bestSeg.p1.x + bestSeg.p2.x) / 2);
  const midY = Math.round((bestSeg.p1.y + bestSeg.p2.y) / 2);
  placedBadges.push({
    left: midX - pillBoxSize / 2,
    top: midY - pillBoxSize / 2,
    right: midX + pillBoxSize / 2,
    bottom: midY + pillBoxSize / 2,
  });
  return { midX, midY };
}

/**
 * Validates connections and ensures source & target nodes exist.
 */
export function validateConnections<T extends { id?: string; source?: string; target?: string; from?: string; to?: string }>(
  connections: T[],
  validNodeIds: Set<string>,
  contextName = "architecture"
): T[] {
  return connections.filter((conn) => {
    const src = conn.source || conn.from;
    const tgt = conn.target || conn.to;
    if (!src || !tgt) return false;
    const valid = validNodeIds.has(src) && validNodeIds.has(tgt);
    if (!valid && typeof console !== "undefined") {
      console.warn(`[${contextName}] Discarding connection ${src} -> ${tgt} (node not found in data)`);
    }
    return valid;
  });
}

/**
 * Merges bidirectional pairs (A->B and B->A) into ONE edge with direction="bidirectional".
 */
export function mergeBidirectionalEdges<T extends {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
  category?: any;
  direction?: "directional" | "bidirectional";
  description?: string;
  animated?: boolean;
  step?: number;
  secondary?: boolean;
}>(edges: T[]): (T & { direction: "directional" | "bidirectional"; originalEdgeIds: string[] })[] {
  const merged: (T & { direction: "directional" | "bidirectional"; originalEdgeIds: string[] })[] = [];
  const handled = new Set<string>();

  for (let i = 0; i < edges.length; i++) {
    const e1 = edges[i];
    if (handled.has(e1.id)) continue;

    const reverseIdx = edges.findIndex(
      (e2, idx) =>
        idx > i &&
        !handled.has(e2.id) &&
        e2.source === e1.target &&
        e2.target === e1.source
    );

    if (reverseIdx !== -1) {
      const e2 = edges[reverseIdx];
      handled.add(e1.id);
      handled.add(e2.id);

      const jointLabel = e1.label && e2.label && e1.label !== e2.label
        ? `${e1.label} / ${e2.label}`
        : e1.label || e2.label || "";

      merged.push({
        ...e1,
        label: jointLabel,
        direction: "bidirectional",
        originalEdgeIds: [e1.id, e2.id],
        secondary: Boolean(e1.secondary && e2.secondary),
      });
    } else {
      handled.add(e1.id);
      merged.push({
        ...e1,
        direction: e1.direction || "directional",
        originalEdgeIds: [e1.id],
      });
    }
  }

  return merged;
}

/**
 * Assigns sequential traversal flow numbers 1..N and secondary letters A, B, C...
 */
export function assignTraversalFlowBadges<T extends {
  id: string;
  source: string;
  target: string;
  direction?: "directional" | "bidirectional";
  step?: number;
  secondary?: boolean;
  category?: string;
}>(edges: T[], nodes: UnifiedNode[]): (T & { badgeIndex?: number; badgeLetter?: string })[] {
  const primaryEdges = edges.filter((e) => !e.secondary && e.category !== "telemetry");
  const secondaryEdges = edges.filter((e) => e.secondary || e.category === "telemetry");

  const hasAuthorSteps = primaryEdges.some((e) => typeof e.step === "number");
  let orderedPrimary: T[] = [];

  if (hasAuthorSteps) {
    orderedPrimary = [...primaryEdges].sort((a, b) => (a.step ?? 999) - (b.step ?? 999));
  } else {
    // Breadth-first search from ingress entry node
    const nodeMap = new Map<string, UnifiedNode>(nodes.map((n) => [n.id, n]));
    const inDegree = new Map<string, number>();
    for (const e of primaryEdges) {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }

    let entryNode = nodes[0];
    let bestScore = Infinity;
    for (const n of nodes) {
      const colScore = (n.col ?? Math.round((n.x ?? 0) / 250)) * 10;
      const degScore = inDegree.get(n.id) || 0;
      const catBonus = n.category === "client" || n.category === "dns" ? -5 : 0;
      const score = colScore + degScore + catBonus;
      if (score < bestScore) {
        bestScore = score;
        entryNode = n;
      }
    }

    const visitedEdges = new Set<string>();
    const visitedNodes = new Set<string>([entryNode?.id || ""]);
    const queue: string[] = entryNode ? [entryNode.id] : [];

    while (queue.length > 0) {
      const currId = queue.shift()!;
      const outgoing = primaryEdges.filter(
        (e) => !visitedEdges.has(e.id) && (e.source === currId || (e.direction === "bidirectional" && e.target === currId))
      );

      outgoing.sort((a, b) => {
        const nextIdA = a.source === currId ? a.target : a.source;
        const nextIdB = b.source === currId ? b.target : b.source;
        const nodeA = nodeMap.get(nextIdA);
        const nodeB = nodeMap.get(nextIdB);
        const currNode = nodeMap.get(currId);
        const currCol = currNode?.col ?? 0;
        const colA = nodeA?.col ?? 0;
        const colB = nodeB?.col ?? 0;

        const isFwdA = colA > currCol ? 1 : colA === currCol ? 2 : 3;
        const isFwdB = colB > currCol ? 1 : colB === currCol ? 2 : 3;
        if (isFwdA !== isFwdB) return isFwdA - isFwdB;
        return colA - colB;
      });

      for (const edge of outgoing) {
        visitedEdges.add(edge.id);
        orderedPrimary.push(edge);
        const nextId = edge.source === currId ? edge.target : edge.source;
        if (!visitedNodes.has(nextId)) {
          visitedNodes.add(nextId);
          queue.push(nextId);
        }
      }
    }

    for (const e of primaryEdges) {
      if (!visitedEdges.has(e.id)) {
        visitedEdges.add(e.id);
        orderedPrimary.push(e);
      }
    }
  }

  // Contiguous integers 1..N
  const primaryWithBadges = orderedPrimary.map((e, idx) => ({
    ...e,
    badgeIndex: idx + 1,
    badgeLetter: undefined,
  }));

  // Letters A, B, C... for secondary flows
  const secondaryWithBadges = secondaryEdges.map((e, idx) => ({
    ...e,
    badgeIndex: undefined,
    badgeLetter: String.fromCharCode(65 + (idx % 26)),
  }));

  const edgeMap = new Map<string, T & { badgeIndex?: number; badgeLetter?: string }>();
  for (const e of primaryWithBadges) edgeMap.set(e.id, e);
  for (const e of secondaryWithBadges) edgeMap.set(e.id, e);

  return edges.map((e) => edgeMap.get(e.id)!);
}

/**
 * Derives request playback journey following sequential traversal numbers 1..N.
 */
export function deriveRequestJourney(
  nodes: UnifiedNode[],
  edges: UnifiedEdge[],
  authorJourney?: string[]
): string[] {
  if (authorJourney && authorJourney.length > 1) {
    const nodeIds = new Set(nodes.map((n) => n.id));
    const valid = authorJourney.filter((id) => nodeIds.has(id));
    if (valid.length > 1) return valid;
  }

  // Order by primary badge index 1..N
  const sortedPrimary = [...edges]
    .filter((e) => e.badgeIndex !== undefined)
    .sort((a, b) => (a.badgeIndex ?? 999) - (b.badgeIndex ?? 999));

  const journeyPath: string[] = [];
  for (const e of sortedPrimary) {
    if (journeyPath.length === 0) {
      journeyPath.push(e.source);
      journeyPath.push(e.target);
    } else {
      const last = journeyPath[journeyPath.length - 1];
      if (e.source === last) {
        journeyPath.push(e.target);
      } else if (e.target === last) {
        journeyPath.push(e.source);
      } else {
        journeyPath.push(e.source);
        journeyPath.push(e.target);
      }
    }
  }

  return Array.from(new Set(journeyPath));
}

const CANONICAL_SECTIONS = [
  { id: "sec-ingress", title: "01. Ingress & Perimeter", description: "Traffic ingress & DNS.", matchCategories: ["client", "dns", "cdn"] },
  { id: "sec-routing", title: "02. Network & Routing", description: "Load balancing & routing.", matchCategories: ["networking"] },
  { id: "sec-compute", title: "03. Application Compute", description: "Backend application execution.", matchCategories: ["compute", "application"] },
  { id: "sec-data", title: "04. Data & Persistence", description: "Databases & storage.", matchCategories: ["database", "storage"] },
  { id: "sec-observability", title: "05. CI/CD & Operations", description: "Pipelines, security & telemetry.", matchCategories: ["cicd", "security", "monitoring", "ai"] },
];

/**
 * Layout engine for full architecture diagram canvas data.
 */
export function layoutArchitectureCanvas(
  data: ArchitectureDiagramData,
  options: LayoutOptions = { autoLayout: true }
): LayoutResult {
  const nodes = data.nodes || [];
  const rawEdges = data.edges || [];

  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = validateConnections(rawEdges, nodeIds, "ArchitectureCanvas");

  interface EffectiveSection {
    id: string;
    title: string;
    description?: string;
    nodes: ArchitectureNode[];
  }

  let effectiveSections: EffectiveSection[] = [];

  if (data.sections && data.sections.length > 0) {
    const assignedNodeIds = new Set<string>();

    effectiveSections = data.sections.map((sec) => {
      const secNodes = nodes.filter((n) => {
        const match = n.sectionId === sec.id || sec.nodeIds?.includes(n.id);
        if (match) assignedNodeIds.add(n.id);
        return match;
      });
      return {
        id: sec.id,
        title: sec.title,
        description: sec.description,
        nodes: secNodes,
      };
    });

    const unassigned = nodes.filter((n) => !assignedNodeIds.has(n.id));
    if (unassigned.length > 0) {
      if (effectiveSections.length > 0) {
        effectiveSections[Math.min(2, effectiveSections.length - 1)].nodes.push(...unassigned);
      } else {
        effectiveSections.push({
          id: "sec-misc",
          title: "Application Components",
          description: "Workload and infrastructure components.",
          nodes: unassigned,
        });
      }
    }
  } else {
    effectiveSections = CANONICAL_SECTIONS.map((sec) => {
      const secNodes = nodes.filter((n) => sec.matchCategories.includes(n.category));
      return {
        id: sec.id,
        title: sec.title,
        description: sec.description,
        nodes: secNodes,
      };
    });
  }

  const activeSections = effectiveSections.filter((sec) => sec.nodes.length > 0);

  const isMobile = options.isMobile ?? (typeof window !== "undefined" && window.innerWidth <= 768);
  const direction: "RIGHT" | "DOWN" =
    options.direction ||
    (isMobile ? "DOWN" : "RIGHT");

  const startPadX = 36;
  const startPadY = 36;

  const nodeMap = new Map<string, UnifiedNode>();
  const computedZones: LayoutZone[] = [];

  let totalWidth = 0;
  let totalHeight = 0;

  if (direction === "DOWN") {
    let currentY = startPadY;

    activeSections.forEach((sec, layerIdx) => {
      const secNodeCount = sec.nodes.length;
      const tierX = startPadX;
      const tierY = currentY;

      const cardsStartX = tierX + TIER_PADDING;
      const cardsStartY = tierY + TIER_HEADER_H + TIER_PADDING;

      const layerWidth = TIER_PADDING * 2 + secNodeCount * NODE_WIDTH + (secNodeCount - 1) * 36;
      const tierW = Math.max(layerWidth, 260);
      const tierH = TIER_HEADER_H + TIER_PADDING * 2 + NODE_HEIGHT;

      computedZones.push({
        id: sec.id,
        title: sec.title,
        description: sec.description,
        x: tierX,
        y: tierY,
        width: tierW,
        height: tierH,
        nodeIds: sec.nodes.map((n) => n.id),
      });

      sec.nodes.forEach((n, nodeIdx) => {
        const x = cardsStartX + nodeIdx * (NODE_WIDTH + 36);
        const y = cardsStartY;
        const measured = options.cardDimensions?.get(n.id);
        const width = measured?.width ?? NODE_WIDTH;
        const height = measured?.height ?? NODE_HEIGHT;

        nodeMap.set(n.id, {
          id: n.id,
          name: n.name,
          category: n.category,
          tech: n.tech,
          provider: n.provider,
          description: n.description,
          port: n.port,
          status: n.status || "operational",
          x,
          y,
          width,
          height,
          metricLabel: n.port ? `Port ${n.port}` : undefined,
          responsibilities: n.responsibilities,
          configuration: n.configuration,
          security_controls: n.security_controls,
          verification: n.verification,
          evidence: n.evidence,
          raw: n,
          col: nodeIdx,
          row: layerIdx,
          sectionId: sec.id,
        });
      });

      currentY += tierH + LAYER_GAP_X;
    });

    totalWidth = Math.max(...computedZones.map((z) => z.x + z.width)) + startPadX;
    totalHeight = currentY - LAYER_GAP_X + startPadY;
  } else {
    // Left-to-Right Flow
    const totalCols = activeSections.length;

    activeSections.forEach((sec, colIdx) => {
      const secX = startPadX + colIdx * (NODE_WIDTH + LAYER_GAP_X);
      const secY = startPadY;
      const secNodeCount = sec.nodes.length;

      const tierX = secX - TIER_PADDING;
      const tierY = secY;
      const tierW = Math.max(NODE_WIDTH + TIER_PADDING * 2, 260);
      const cardsStartY = tierY + TIER_HEADER_H + TIER_PADDING;

      // Calculate heights based on measured card sizes if present
      let totalColumnCardH = 0;
      sec.nodes.forEach((n) => {
        const measured = options.cardDimensions?.get(n.id);
        totalColumnCardH += (measured?.height ?? NODE_HEIGHT);
      });
      totalColumnCardH += Math.max(0, secNodeCount - 1) * NODE_GAP_Y;

      const tierH = TIER_HEADER_H + TIER_PADDING * 2 + totalColumnCardH;

      computedZones.push({
        id: sec.id,
        title: sec.title,
        description: sec.description,
        x: tierX,
        y: tierY,
        width: tierW,
        height: tierH,
        nodeIds: sec.nodes.map((n) => n.id),
      });

      let currentCardY = cardsStartY;
      sec.nodes.forEach((n, nodeIdx) => {
        const x = secX;
        const y = currentCardY;
        const measured = options.cardDimensions?.get(n.id);
        const width = measured?.width ?? NODE_WIDTH;
        const height = measured?.height ?? NODE_HEIGHT;

        nodeMap.set(n.id, {
          id: n.id,
          name: n.name,
          category: n.category,
          tech: n.tech,
          provider: n.provider,
          description: n.description,
          port: n.port,
          status: n.status || "operational",
          x,
          y,
          width,
          height,
          metricLabel: n.port ? `Port ${n.port}` : undefined,
          responsibilities: n.responsibilities,
          configuration: n.configuration,
          security_controls: n.security_controls,
          verification: n.verification,
          evidence: n.evidence,
          raw: n,
          col: colIdx,
          row: nodeIdx,
          sectionId: sec.id,
        });

        currentCardY += height + NODE_GAP_Y;
      });
    });

    totalWidth = startPadX * 2 + totalCols * NODE_WIDTH + (totalCols - 1) * LAYER_GAP_X;
    const maxTierHeight = Math.max(...computedZones.map((z) => z.height));
    totalHeight = startPadY * 2 + maxTierHeight;
  }

  const nodesList = Array.from(nodeMap.values());

  // 1. Merge bidirectional edges
  const mergedEdges = mergeBidirectionalEdges(validEdges);

  // 2. Count primary edges touching each node to guarantee NO ORPHAN NODES
  const primaryDegree = new Map<string, number>();
  for (const n of nodesList) primaryDegree.set(n.id, 0);

  for (const e of mergedEdges) {
    const isSec = Boolean(e.secondary || e.category === "telemetry");
    if (!isSec) {
      primaryDegree.set(e.source, (primaryDegree.get(e.source) || 0) + 1);
      primaryDegree.set(e.target, (primaryDegree.get(e.target) || 0) + 1);
    }
  }

  const showSecondary = Boolean(options.showSecondary);
  const activeEdges = mergedEdges.filter((e) => {
    const isSec = Boolean(e.secondary || e.category === "telemetry");
    if (showSecondary || !isSec) return true;
    // Hard rule: if either endpoint would have 0 visible connections, keep this edge visible!
    const srcDeg = primaryDegree.get(e.source) || 0;
    const tgtDeg = primaryDegree.get(e.target) || 0;
    if (srcDeg === 0 || tgtDeg === 0) return true;
    return false;
  });

  // 3. Assign sequential traversal flow numbers 1..N and secondary letters A, B, C...
  const edgesWithBadges = assignTraversalFlowBadges(activeEdges, nodesList);

  // 4. Allocate distributed ports strictly on card borders
  const { sourcePorts, targetPorts, allPorts } = allocateDistributedPorts(nodesList, edgesWithBadges);

  // 5. Route edges and position badges strictly ON lines
  const placedBadges: RectBox[] = [];

  const edges: UnifiedEdge[] = edgesWithBadges.map((e, edgeIdx) => {
    const srcNode = nodeMap.get(e.source)!;
    const tgtNode = nodeMap.get(e.target)!;
    const srcPort = sourcePorts.get(e.id) || { x: srcNode.x + srcNode.width, y: srcNode.y + srcNode.height / 2, side: "right" as const };
    const tgtPort = targetPorts.get(e.id) || { x: tgtNode.x, y: tgtNode.y + tgtNode.height / 2, side: "left" as const };

    const { points, pathData } = routeOrthogonalEdge(
      srcNode,
      tgtNode,
      srcPort,
      tgtPort,
      edgeIdx,
      nodesList,
      computedZones
    );

    const { midX, midY } = placeBadgeOnPath(points, nodesList, computedZones, placedBadges);

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      protocol: e.protocol,
      category: e.category || "network",
      direction: e.direction || "directional",
      description: e.description,
      animated: e.animated,
      secondary: Boolean(e.secondary || e.category === "telemetry"),
      step: (e as any).step,
      originalEdgeIds: e.originalEdgeIds,
      points,
      startPoint: points[0],
      endPoint: points[points.length - 1],
      pathData,
      midX,
      midY,
      badgeIndex: e.badgeIndex,
      badgeLetter: e.badgeLetter,
    };
  });

  return {
    nodes: nodesList,
    edges,
    zones: computedZones,
    ports: allPorts,
    viewBox: {
      minX: 0,
      minY: 0,
      width: Math.max(totalWidth, 1200),
      height: Math.max(totalHeight, 700),
    },
    direction,
  };
}

/**
 * Layout engine for project page quick architecture diagrams (ArchitectureData).
 */
export function layoutProjectArchitecture(
  data: ArchitectureData,
  options: LayoutOptions = { autoLayout: true }
): LayoutResult {
  const components = data.components || [];
  const connections = data.connections || [];

  const validCompIds = new Set(components.map((c) => c.id));
  const validConns = validateConnections(connections, validCompIds, "ProjectArchitecture");

  // Map components to columns based on type
  const typeColMap: Record<string, number> = {
    edge: 0,
    network: 1,
    compute: 2,
    database: 3,
    storage: 3,
    observability: 4,
    cicd: 4,
    security: 4,
  };

  const colGroups = new Map<number, ArchitectureComponent[]>();
  components.forEach((c) => {
    const col = typeColMap[c.type] ?? 2;
    if (!colGroups.has(col)) colGroups.set(col, []);
    colGroups.get(col)!.push(c);
  });

  const activeCols = Array.from(colGroups.keys()).sort((a, b) => a - b);
  const startPadX = 36;
  const startPadY = 36;
  const nodeMap = new Map<string, UnifiedNode>();
  const computedZones: LayoutZone[] = [];

  activeCols.forEach((colKey, colIdx) => {
    const comps = colGroups.get(colKey)!;
    const secX = startPadX + colIdx * (NODE_WIDTH + LAYER_GAP_X);
    const secY = startPadY;
    const secNodeCount = comps.length;

    const tierX = secX - TIER_PADDING;
    const tierY = secY;
    const tierW = Math.max(NODE_WIDTH + TIER_PADDING * 2, 260);
    const cardsStartY = tierY + TIER_HEADER_H + TIER_PADDING;

    let totalColumnCardH = 0;
    comps.forEach((c) => {
      const measured = options.cardDimensions?.get(c.id);
      totalColumnCardH += (measured?.height ?? NODE_HEIGHT);
    });
    totalColumnCardH += Math.max(0, secNodeCount - 1) * NODE_GAP_Y;

    const tierH = TIER_HEADER_H + TIER_PADDING * 2 + totalColumnCardH;

    const zoneTitle =
      colKey === 0
        ? "01. Edge & Client Access"
        : colKey === 1
          ? "02. Network & Ingress"
          : colKey === 2
            ? "03. Application Workloads"
            : colKey === 3
              ? "04. Persistence Tier"
              : "05. DevOps & Observability";

    computedZones.push({
      id: `zone-col-${colKey}`,
      title: zoneTitle,
      x: tierX,
      y: tierY,
      width: tierW,
      height: tierH,
      nodeIds: comps.map((c) => c.id),
    });

    let currentCardY = cardsStartY;
    comps.forEach((c, rowIdx) => {
      const x = secX;
      const y = currentCardY;
      const measured = options.cardDimensions?.get(c.id);
      const width = measured?.width ?? NODE_WIDTH;
      const height = measured?.height ?? NODE_HEIGHT;

      nodeMap.set(c.id, {
        id: c.id,
        name: c.name,
        category: (c.type === "edge" ? "client" : c.type) as ArchitectureCategory,
        tech: c.tech,
        provider: c.details || "Managed Service",
        description: c.description,
        port: c.port,
        status: "operational",
        x,
        y,
        width,
        height,
        col: colIdx,
        row: rowIdx,
        sectionId: `zone-col-${colKey}`,
      });

      currentCardY += height + NODE_GAP_Y;
    });
  });

  const nodesList = Array.from(nodeMap.values());

  // Adapt connections to unified edge format
  const mappedEdges = validConns.map((conn, idx) => ({
    id: `conn-${idx}-${conn.from}-${conn.to}`,
    source: conn.from,
    target: conn.to,
    label: conn.label || "",
    protocol: conn.protocol || "",
    category: conn.category || ("network" as const),
    direction: conn.direction || ("directional" as const),
    secondary: conn.secondary,
    description: conn.description || "",
    step: (conn as any).step,
  }));

  const mergedEdges = mergeBidirectionalEdges(mappedEdges);

  // Guarantee no orphan nodes
  const primaryDegree = new Map<string, number>();
  for (const n of nodesList) primaryDegree.set(n.id, 0);

  for (const e of mergedEdges) {
    const isSec = Boolean(e.secondary || e.category === "telemetry");
    if (!isSec) {
      primaryDegree.set(e.source, (primaryDegree.get(e.source) || 0) + 1);
      primaryDegree.set(e.target, (primaryDegree.get(e.target) || 0) + 1);
    }
  }

  const showSecondary = Boolean(options.showSecondary);
  const activeEdges = mergedEdges.filter((e) => {
    const isSec = Boolean(e.secondary || e.category === "telemetry");
    if (showSecondary || !isSec) return true;
    const srcDeg = primaryDegree.get(e.source) || 0;
    const tgtDeg = primaryDegree.get(e.target) || 0;
    if (srcDeg === 0 || tgtDeg === 0) return true;
    return false;
  });

  const edgesWithBadges = assignTraversalFlowBadges(activeEdges, nodesList);
  const { sourcePorts, targetPorts, allPorts } = allocateDistributedPorts(nodesList, edgesWithBadges);

  const placedBadges: RectBox[] = [];

  const edges: UnifiedEdge[] = edgesWithBadges.map((e, edgeIdx) => {
    const srcNode = nodeMap.get(e.source)!;
    const tgtNode = nodeMap.get(e.target)!;
    const srcPort = sourcePorts.get(e.id) || { x: srcNode.x + srcNode.width, y: srcNode.y + srcNode.height / 2, side: "right" as const };
    const tgtPort = targetPorts.get(e.id) || { x: tgtNode.x, y: tgtNode.y + tgtNode.height / 2, side: "left" as const };

    const { points, pathData } = routeOrthogonalEdge(
      srcNode,
      tgtNode,
      srcPort,
      tgtPort,
      edgeIdx,
      nodesList,
      computedZones
    );

    const { midX, midY } = placeBadgeOnPath(points, nodesList, computedZones, placedBadges);

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      protocol: e.protocol,
      category: e.category || "network",
      direction: e.direction || "directional",
      description: e.description,
      animated: true,
      secondary: Boolean(e.secondary || e.category === "telemetry"),
      step: (e as any).step,
      originalEdgeIds: e.originalEdgeIds,
      points,
      startPoint: points[0],
      endPoint: points[points.length - 1],
      pathData,
      midX,
      midY,
      badgeIndex: e.badgeIndex,
      badgeLetter: e.badgeLetter,
    };
  });

  const totalCols = activeCols.length;
  const totalWidth = startPadX * 2 + totalCols * NODE_WIDTH + Math.max(0, totalCols - 1) * LAYER_GAP_X;
  const maxTierHeight = Math.max(...computedZones.map((z) => z.height));
  const totalHeight = startPadY * 2 + maxTierHeight;

  return {
    nodes: nodesList,
    edges,
    zones: computedZones,
    ports: allPorts,
    viewBox: {
      minX: 0,
      minY: 0,
      width: Math.max(totalWidth, 1000),
      height: Math.max(totalHeight, 600),
    },
    direction: "RIGHT",
  };
}
