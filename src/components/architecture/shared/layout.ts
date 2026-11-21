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
export const TIER_HEADER_H = 32; // "32 px header strip for the title"
export const TIER_PADDING = 24; // "bounding box of its cards + 24 px padding"
export const EDGE_CARD_CLEARANCE = 24; // "24 px minimum between an edge and a card"

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
  parallelPathData?: string;
  midX: number;
  midY: number;
  badgeIndex?: number;
  secondary?: boolean;
  originalEdgeIds?: string[];
}

export interface LayoutOptions {
  autoLayout?: boolean;
  direction?: "RIGHT" | "DOWN";
  isMobile?: boolean;
  viewportWidth?: number;
  showSecondary?: boolean;
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
  viewBox: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  };
  direction: "RIGHT" | "DOWN";
}

/**
 * Converts orthogonal polyline vertices to an SVG path with rounded corners (R = 12px).
 */
export function pointsToRoundedPath(points: { x: number; y: number }[], r = 12): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const pNext = points[i + 1];

    const dPrev = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
    const dNext = Math.hypot(pNext.x - pCurr.x, pNext.y - pCurr.y);
    const effectiveR = Math.min(r, dPrev / 2, dNext / 2);

    if (effectiveR <= 1) {
      d += ` L ${pCurr.x} ${pCurr.y}`;
      continue;
    }

    const vPrevX = (pCurr.x - pPrev.x) / dPrev;
    const vPrevY = (pCurr.y - pPrev.y) / dPrev;
    const vNextX = (pNext.x - pCurr.x) / dNext;
    const vNextY = (pNext.y - pCurr.y) / dNext;

    const cornerStart = {
      x: pCurr.x - vPrevX * effectiveR,
      y: pCurr.y - vPrevY * effectiveR,
    };
    const cornerEnd = {
      x: pCurr.x + vNextX * effectiveR,
      y: pCurr.y + vNextY * effectiveR,
    };

    d += ` L ${cornerStart.x} ${cornerStart.y} Q ${pCurr.x} ${pCurr.y} ${cornerEnd.x} ${cornerEnd.y}`;
  }

  const pLast = points[points.length - 1];
  d += ` L ${pLast.x} ${pLast.y}`;
  return d;
}

/**
 * Offsets orthogonal points by a fixed distance perpendicular to each segment
 */
function offsetOrthogonalPoints(points: { x: number; y: number }[], offset: number): { x: number; y: number }[] {
  if (points.length < 2) return points;
  return points.map((p, idx) => {
    // For horizontal lines, offset in Y; for vertical lines, offset in X
    if (idx === 0) {
      const next = points[1];
      if (Math.abs(next.x - p.x) > Math.abs(next.y - p.y)) {
        return { x: p.x, y: p.y + offset };
      }
      return { x: p.x + offset, y: p.y };
    }
    const prev = points[idx - 1];
    if (Math.abs(p.x - prev.x) > Math.abs(p.y - prev.y)) {
      return { x: p.x, y: p.y + offset };
    }
    return { x: p.x + offset, y: p.y };
  });
}

export interface EdgeRoutingContext {
  sourceCol?: number;
  targetCol?: number;
  sourceRow?: number;
  targetRow?: number;
  edgeIndex?: number;
  direction?: "RIGHT" | "DOWN";
  topCorridorY?: number;
  bottomCorridorY?: number;
}

/**
 * Computes an orthogonal corridor connection path between source and target nodes.
 * Routes directly through the inter-column / inter-row gaps, starting and ending
 * precisely on card borders within 2 px.
 */
export function computeEdgePath(
  source: { x: number; y: number; width?: number; height?: number; col?: number; row?: number },
  target: { x: number; y: number; width?: number; height?: number; col?: number; row?: number },
  routingContext?: EdgeRoutingContext
): { pathData: string; parallelPathData?: string; points: { x: number; y: number }[]; midX: number; midY: number } {
  const sw = source.width ?? NODE_WIDTH;
  const sh = source.height ?? NODE_HEIGHT;
  const tw = target.width ?? NODE_WIDTH;
  const th = target.height ?? NODE_HEIGHT;

  const sCol = source.col ?? routingContext?.sourceCol ?? 0;
  const tCol = target.col ?? routingContext?.targetCol ?? 1;
  const direction = routingContext?.direction ?? "RIGHT";
  const edgeLane = (routingContext?.edgeIndex ?? 0) % 3;

  const points: { x: number; y: number }[] = [];

  if (direction === "DOWN") {
    // Top-to-Bottom Flow
    const srcBottomX = source.x + sw / 2 + (edgeLane - 1) * 20;
    const srcBottomY = source.y + sh;
    const tgtTopX = target.x + tw / 2 + (edgeLane - 1) * 20;
    const tgtTopY = target.y;

    if (target.y > source.y) {
      // Forward down: route through the vertical layer gap
      const midGutterY = Math.round((srcBottomY + tgtTopY) / 2) + (edgeLane - 1) * 12;
      points.push(
        { x: srcBottomX, y: srcBottomY },
        { x: srcBottomX, y: midGutterY },
        { x: tgtTopX, y: midGutterY },
        { x: tgtTopX, y: tgtTopY }
      );
    } else {
      // Reverse / Feedback up: route around the left or right side gutter
      const sideGutterX = Math.max(source.x + sw, target.x + tw) + 36 + edgeLane * 12;
      points.push(
        { x: source.x + sw, y: source.y + sh / 2 },
        { x: sideGutterX, y: source.y + sh / 2 },
        { x: sideGutterX, y: target.y + th / 2 },
        { x: target.x + tw, y: target.y + th / 2 }
      );
    }
  } else {
    // Left-to-Right Flow
    const srcRight = source.x + sw;
    const srcCenterY = source.y + sh / 2 + (edgeLane - 1) * 16;
    const tgtLeft = target.x;
    const tgtRight = target.x + tw;
    const tgtCenterY = target.y + th / 2 + (edgeLane - 1) * 16;

    // 1. Same column: route via right gutter inside the column gap
    if (sCol === tCol) {
      const gutterX = Math.max(srcRight, tgtRight) + 32 + edgeLane * 14;
      points.push(
        { x: srcRight, y: srcCenterY },
        { x: gutterX, y: srcCenterY },
        { x: gutterX, y: tgtCenterY },
        { x: tgtRight, y: tgtCenterY }
      );
    }
    // 2. Adjacent column forward: direct step in the 120px inter-column gap
    else if (tCol === sCol + 1 && tgtLeft > srcRight) {
      const midGutterX = Math.round((srcRight + tgtLeft) / 2) + (edgeLane - 1) * 14;
      if (Math.abs(srcCenterY - tgtCenterY) < 4) {
        // Direct straight horizontal line
        points.push(
          { x: srcRight, y: srcCenterY },
          { x: tgtLeft, y: tgtCenterY }
        );
      } else {
        points.push(
          { x: srcRight, y: srcCenterY },
          { x: midGutterX, y: srcCenterY },
          { x: midGutterX, y: tgtCenterY },
          { x: tgtLeft, y: tgtCenterY }
        );
      }
    }
    // 3. Multi-column forward (tCol > sCol + 1): route through horizontal row gap or top channel
    else if (tCol > sCol) {
      const topCorridorY = (routingContext?.topCorridorY ?? Math.min(source.y, target.y) - 36) - edgeLane * 12;
      const gOutX = srcRight + 24 + edgeLane * 8;
      const gInX = tgtLeft - 24 - edgeLane * 8;
      points.push(
        { x: srcRight, y: srcCenterY },
        { x: gOutX, y: srcCenterY },
        { x: gOutX, y: topCorridorY },
        { x: gInX, y: topCorridorY },
        { x: gInX, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY }
      );
    }
    // 4. Reverse / Feedback edge (tCol < sCol): route through bottom channel
    else {
      const bottomCorridorY = (routingContext?.bottomCorridorY ?? Math.max(source.y + sh, target.y + th) + 36) + edgeLane * 12;
      const gOutX = srcRight + 24 + edgeLane * 8;
      const gInX = Math.max(tgtLeft - 24 - edgeLane * 8, 12);
      points.push(
        { x: srcRight, y: srcCenterY },
        { x: gOutX, y: srcCenterY },
        { x: gOutX, y: bottomCorridorY },
        { x: gInX, y: bottomCorridorY },
        { x: gInX, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY }
      );
    }
  }

  const pathData = pointsToRoundedPath(points, 12);

  // For bidirectional edges: generate second parallel path offset by 6px
  const parallelPoints = offsetOrthogonalPoints(points, 6);
  const parallelPathData = pointsToRoundedPath(parallelPoints, 12);

  // Find longest straight segment for label placement in the gap
  let maxSegLen = 0;
  let bestMidX = (points[0].x + points[points.length - 1].x) / 2;
  let bestMidY = (points[0].y + points[points.length - 1].y) / 2;

  for (let i = 0; i < points.length - 1; i++) {
    const pA = points[i];
    const pB = points[i + 1];
    const segLen = Math.hypot(pB.x - pA.x, pB.y - pA.y);
    if (segLen > maxSegLen) {
      maxSegLen = segLen;
      bestMidX = (pA.x + pB.x) / 2;
      bestMidY = (pA.y + pB.y) / 2;
    }
  }

  return {
    pathData,
    parallelPathData,
    points,
    midX: Math.round(bestMidX),
    midY: Math.round(bestMidY),
  };
}

/**
 * Validates connections and logs developer warnings if from/to nodes do not exist
 */
export function validateConnections<T extends { from?: string; to?: string; source?: string; target?: string }>(
  connections: T[],
  nodeIds: Set<string>,
  contextName: string = "Diagram"
): T[] {
  const valid: T[] = [];
  for (const conn of connections) {
    const src = conn.source || conn.from;
    const tgt = conn.target || conn.to;
    if (!src || !nodeIds.has(src)) continue;
    if (!tgt || !nodeIds.has(tgt)) continue;
    valid.push(conn);
  }
  return valid;
}

export interface CanonicalSectionDefinition {
  id: string;
  title: string;
  description: string;
  matchCategories: ArchitectureCategory[];
}

export const CANONICAL_SECTIONS: CanonicalSectionDefinition[] = [
  {
    id: "sec-network",
    title: "01. Client & Ingress",
    description: "Handles domain resolution and visitor traffic ingress.",
    matchCategories: ["client", "dns"],
  },
  {
    id: "sec-security",
    title: "02. Perimeter & Security",
    description: "Protects application perimeter and controls network access.",
    matchCategories: ["cdn", "networking", "security"],
  },
  {
    id: "sec-compute",
    title: "03. Compute & Runtime",
    description: "Executes business logic and server-side processing.",
    matchCategories: ["compute", "application"],
  },
  {
    id: "sec-data",
    title: "04. Data & Persistence",
    description: "Maintains transactional records, state, and asset storage.",
    matchCategories: ["database", "storage"],
  },
  {
    id: "sec-automation",
    title: "05. DevOps & Observability",
    description: "Automates testing, continuous delivery, and observability.",
    matchCategories: ["cicd", "monitoring", "ai"],
  },
];

function rectsOverlap(
  r1: { left: number; top: number; right: number; bottom: number },
  r2: { left: number; top: number; right: number; bottom: number },
  margin = 0
): boolean {
  return !(
    r1.right + margin <= r2.left ||
    r2.right + margin <= r1.left ||
    r1.bottom + margin <= r2.top ||
    r2.bottom + margin <= r1.top
  );
}

/**
 * Merges bidirectional pairs (A->B and B->A) into a single edge with direction: "bidirectional".
 * Keeps both original edges referenced in originalEdgeIds.
 */
export function mergeBidirectionalEdges<
  T extends {
    id: string;
    source: string;
    target: string;
    label?: string;
    protocol?: string;
    category?: any;
    direction?: any;
    description?: string;
    animated?: boolean;
    secondary?: boolean;
  }
>(
  edges: T[]
): (T & { direction: "directional" | "bidirectional"; originalEdgeIds: string[] })[] {
  const merged: (T & { direction: "directional" | "bidirectional"; originalEdgeIds: string[] })[] = [];
  const handled = new Set<string>();

  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (handled.has(e.id)) continue;

    const rev = edges.find(
      (other, oIdx) =>
        oIdx !== i &&
        !handled.has(other.id) &&
        other.source === e.target &&
        other.target === e.source
    );

    if (rev) {
      handled.add(e.id);
      handled.add(rev.id);
      const combinedLabel = [e.label, rev.label].filter(Boolean).join(" / ");
      const combinedProtocol = e.protocol || rev.protocol;
      const isSec = Boolean(e.secondary && rev.secondary);
      merged.push({
        ...e,
        id: `${e.id}--merged--${rev.id}`,
        direction: "bidirectional",
        label: combinedLabel || e.label || rev.label,
        protocol: combinedProtocol,
        secondary: isSec,
        originalEdgeIds: [e.id, rev.id],
      });
    } else {
      handled.add(e.id);
      merged.push({
        ...e,
        direction: e.direction || "directional",
        originalEdgeIds: [e.id],
      });
    }
  }

  return merged;
}

/**
 * Layout engine for full architecture diagram canvas data (ArchitectureDiagramData).
 * Automatically chooses direction:
 * - RIGHT on desktop for <= 4 layers
 * - DOWN for > 4 layers or when on mobile
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

  // Direction Choice
  const isMobile = options.isMobile ?? (typeof window !== "undefined" && window.innerWidth <= 768);
  const direction: "RIGHT" | "DOWN" =
    options.direction ||
    (isMobile ? "DOWN" : activeSections.length <= 4 ? "RIGHT" : "RIGHT");

  const startPadX = 36;
  const startPadY = 36;

  const nodeMap = new Map<string, UnifiedNode>();
  const computedZones: LayoutZone[] = [];

  let totalWidth = 0;
  let totalHeight = 0;

  if (direction === "DOWN") {
    // Top-to-Bottom Flow
    let currentY = startPadY;

    activeSections.forEach((sec, layerIdx) => {
      const secNodeCount = sec.nodes.length;
      const tierX = startPadX;
      const tierY = currentY;

      const cardsStartX = tierX + TIER_PADDING;
      const cardsStartY = tierY + TIER_HEADER_H + TIER_PADDING;

      const layerWidth = TIER_PADDING * 2 + secNodeCount * NODE_WIDTH + (secNodeCount - 1) * 36;
      const tierW = Math.max(layerWidth, 248);
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
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
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
      const tierW = NODE_WIDTH + TIER_PADDING * 2;
      const cardsStartY = tierY + TIER_HEADER_H + TIER_PADDING;
      const tierH = TIER_HEADER_H + TIER_PADDING * 2 + secNodeCount * NODE_HEIGHT + (secNodeCount - 1) * NODE_GAP_Y;

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
        const x = secX;
        const y = cardsStartY + nodeIdx * (NODE_HEIGHT + NODE_GAP_Y);

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
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
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
      });
    });

    totalWidth = startPadX * 2 + totalCols * NODE_WIDTH + (totalCols - 1) * LAYER_GAP_X;
    const maxTierHeight = Math.max(...computedZones.map((z) => z.height));
    totalHeight = startPadY * 2 + maxTierHeight;
  }

  const nodesList = Array.from(nodeMap.values());
  const placedBadges: { left: number; top: number; right: number; bottom: number }[] = [];

  const topCorridorY = 16;
  const bottomCorridorY = totalHeight - 16;

  // 1. Merge bidirectional edges
  const mergedEdges = mergeBidirectionalEdges(validEdges);

  // 2. Filter secondary edges unless showSecondary is true
  const showSecondary = Boolean(options.showSecondary);
  const activeEdges = mergedEdges.filter((e) => {
    const isSec = Boolean(e.secondary || e.category === "telemetry");
    return showSecondary || !isSec;
  });

  // 3. Assign sequential numbered badges 1, 2, 3... to all primary visible edges
  let badgeCounter = 1;
  const edges: UnifiedEdge[] = activeEdges.map((e, edgeIdx) => {
    const srcNode = nodeMap.get(e.source)!;
    const tgtNode = nodeMap.get(e.target)!;
    const isSec = Boolean(e.secondary || e.category === "telemetry");
    const badgeIndex = isSec ? undefined : badgeCounter++;

    const routingContext: EdgeRoutingContext = {
      sourceCol: srcNode.col,
      targetCol: tgtNode.col,
      sourceRow: srcNode.row,
      targetRow: tgtNode.row,
      edgeIndex: edgeIdx,
      direction,
      topCorridorY,
      bottomCorridorY,
    };

    const { pathData, parallelPathData, midX, midY } = computeEdgePath(srcNode, tgtNode, routingContext);

    const pillW = 24;
    const pillH = 24;

    let adjustedMidX = midX;
    let adjustedMidY = midY;

    let collides = true;
    let attempts = 0;
    while (collides && attempts < 15) {
      collides = false;
      const lBox = {
        left: adjustedMidX - pillW / 2,
        top: adjustedMidY - pillH / 2,
        right: adjustedMidX + pillW / 2,
        bottom: adjustedMidY + pillH / 2,
      };

      for (const n of nodesList) {
        const nBox = { left: n.x, top: n.y, right: n.x + n.width, bottom: n.y + n.height };
        if (rectsOverlap(lBox, nBox, 4)) {
          collides = true;
          adjustedMidY = n.y - pillH - 8;
          break;
        }
      }

      if (!collides) {
        for (const z of computedZones) {
          const titleBox = {
            left: z.x,
            top: z.y,
            right: z.x + z.width,
            bottom: z.y + TIER_HEADER_H,
          };
          if (rectsOverlap(lBox, titleBox, 4)) {
            collides = true;
            adjustedMidY = z.y + TIER_HEADER_H + 12;
            break;
          }
        }
      }

      if (!collides) {
        for (const pb of placedBadges) {
          if (rectsOverlap(lBox, pb, 4)) {
            collides = true;
            adjustedMidX += pillW + 12;
            break;
          }
        }
      }

      attempts++;
    }

    if (!isSec) {
      placedBadges.push({
        left: adjustedMidX - pillW / 2,
        top: adjustedMidY - pillH / 2,
        right: adjustedMidX + pillW / 2,
        bottom: adjustedMidY + pillH / 2,
      });
    }

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
      secondary: isSec,
      originalEdgeIds: e.originalEdgeIds,
      pathData,
      parallelPathData,
      midX: adjustedMidX,
      midY: adjustedMidY,
      badgeIndex,
    };
  });

  return {
    nodes: nodesList,
    edges,
    zones: computedZones,
    viewBox: {
      minX: 0,
      minY: 0,
      width: Math.round(totalWidth),
      height: Math.round(totalHeight),
    },
    direction,
  };
}

/**
 * Layout engine for project architecture quick diagrams (ArchitectureData).
 */
export function layoutProjectArchitecture(
  data: ArchitectureData,
  options: LayoutOptions = { autoLayout: true }
): LayoutResult {
  const components = data.components || [];
  const rawConnections = data.connections || [];

  const compIds = new Set(components.map((c) => c.name));
  const validConnections = validateConnections(
    rawConnections.map((c, i) => ({
      id: `conn-${i}-${c.from}-${c.to}`,
      source: c.from,
      target: c.to,
      from: c.from,
      to: c.to,
      label: c.label,
      protocol: c.protocol,
      category: c.category,
      direction: c.direction,
      secondary: c.secondary,
    })),
    compIds,
    "ProjectArchitecture"
  );

  // Map components to nodes with NODE_WIDTH and NODE_HEIGHT
  const nodes: UnifiedNode[] = [];
  const nodeMap = new Map<string, UnifiedNode>();

  const startPadX = 36;
  const startPadY = 36;

  // Group by layer/category into topological columns
  const layerOrder: ArchitectureCategory[] = ["client", "dns", "networking", "security", "compute", "application", "database", "storage", "cicd", "monitoring"];
  const layerGroups = new Map<ArchitectureCategory, ArchitectureComponent[]>();

  const mapComponentCategory = (type: string): ArchitectureCategory => {
    switch (type) {
      case "edge": return "client";
      case "network": return "networking";
      case "observability": return "monitoring";
      default: return (type as ArchitectureCategory) || "compute";
    }
  };

  components.forEach((c) => {
    const cat = mapComponentCategory(c.type);
    const list = layerGroups.get(cat) || [];
    list.push(c);
    layerGroups.set(cat, list);
  });

  const activeLayers = layerOrder.filter((l) => (layerGroups.get(l) || []).length > 0);

  activeLayers.forEach((layer, colIdx) => {
    const comps = layerGroups.get(layer)!;
    const secX = startPadX + colIdx * (NODE_WIDTH + LAYER_GAP_X);

    comps.forEach((c, rowIdx) => {
      const x = secX;
      const y = startPadY + TIER_HEADER_H + TIER_PADDING + rowIdx * (NODE_HEIGHT + NODE_GAP_Y);

      const node: UnifiedNode = {
        id: c.name,
        name: c.name,
        category: layer,
        tech: c.tech,
        provider: (c as any).provider || "Infrastructure Service",
        description: c.description || (c as any).role || "",
        port: c.port,
        status: "operational",
        x,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        metricLabel: c.port ? `Port ${c.port}` : undefined,
        col: colIdx,
        row: rowIdx,
      };

      nodes.push(node);
      nodeMap.set(c.name, node);
    });
  });

  const totalCols = activeLayers.length;
  const totalWidth = startPadX * 2 + totalCols * NODE_WIDTH + (totalCols - 1) * LAYER_GAP_X;
  const maxNodesInCol = Math.max(...activeLayers.map((l) => (layerGroups.get(l) || []).length), 1);
  const totalHeight = startPadY * 2 + TIER_HEADER_H + TIER_PADDING * 2 + maxNodesInCol * NODE_HEIGHT + (maxNodesInCol - 1) * NODE_GAP_Y;

  const topCorridorY = 16;
  const bottomCorridorY = totalHeight - 16;
  const placedBadges: { left: number; top: number; right: number; bottom: number }[] = [];

  // 1. Merge bidirectional edges
  const mergedConnections = mergeBidirectionalEdges(validConnections);

  // 2. Filter secondary flows
  const showSecondary = Boolean(options.showSecondary);
  const activeConnections = mergedConnections.filter((conn) => {
    const isSec = Boolean(conn.secondary || conn.category === "telemetry");
    return showSecondary || !isSec;
  });

  // 3. Assign numbered badges sequentially
  let badgeCounter = 1;
  const edges: UnifiedEdge[] = activeConnections.map((conn, idx) => {
    const src = nodeMap.get(conn.source)!;
    const tgt = nodeMap.get(conn.target)!;
    const isSec = Boolean(conn.secondary || conn.category === "telemetry");
    const badgeIndex = isSec ? undefined : badgeCounter++;

    const routingContext: EdgeRoutingContext = {
      sourceCol: src.col,
      targetCol: tgt.col,
      sourceRow: src.row,
      targetRow: tgt.row,
      edgeIndex: idx,
      direction: "RIGHT",
      topCorridorY,
      bottomCorridorY,
    };

    const { pathData, parallelPathData, midX, midY } = computeEdgePath(src, tgt, routingContext);
    const pillW = 24;
    const pillH = 24;

    let adjustedMidX = midX;
    let adjustedMidY = midY;

    let collides = true;
    let attempts = 0;
    while (collides && attempts < 15) {
      collides = false;
      const lBox = {
        left: adjustedMidX - pillW / 2,
        top: adjustedMidY - pillH / 2,
        right: adjustedMidX + pillW / 2,
        bottom: adjustedMidY + pillH / 2,
      };

      for (const n of nodes) {
        const nBox = { left: n.x, top: n.y, right: n.x + n.width, bottom: n.y + n.height };
        if (rectsOverlap(lBox, nBox, 4)) {
          collides = true;
          adjustedMidY = n.y - pillH - 8;
          break;
        }
      }

      if (!collides) {
        for (const pb of placedBadges) {
          if (rectsOverlap(lBox, pb, 4)) {
            collides = true;
            adjustedMidX += pillW + 12;
            break;
          }
        }
      }

      attempts++;
    }

    if (!isSec) {
      placedBadges.push({
        left: adjustedMidX - pillW / 2,
        top: adjustedMidY - pillH / 2,
        right: adjustedMidX + pillW / 2,
        bottom: adjustedMidY + pillH / 2,
      });
    }

    let category: UnifiedEdge["category"] = conn.category || "network";
    if (src.category === "database" || tgt.category === "database") category = "data";
    else if (src.category === "security" || tgt.category === "security") category = "security";
    else if (src.category === "cicd" || tgt.category === "cicd") category = "deployment";
    else if (src.category === "monitoring" || tgt.category === "monitoring") category = "telemetry";

    return {
      id: conn.id,
      source: conn.source,
      target: conn.target,
      label: conn.label,
      protocol: conn.protocol,
      category,
      direction: conn.direction || "directional",
      animated: true,
      secondary: isSec,
      originalEdgeIds: conn.originalEdgeIds,
      pathData,
      parallelPathData,
      midX: adjustedMidX,
      midY: adjustedMidY,
      badgeIndex,
    };
  });

  return {
    nodes,
    edges,
    zones: [],
    viewBox: {
      minX: 0,
      minY: 0,
      width: Math.max(totalWidth, 780),
      height: Math.max(totalHeight, 380),
    },
    direction: "RIGHT",
  };
}

export function deriveRequestJourney(
  nodes: UnifiedNode[],
  edges: UnifiedEdge[],
  explicitJourney?: string[]
): string[] {
  if (explicitJourney && explicitJourney.length > 0) {
    const nodeIds = new Set(nodes.map((n) => n.id));
    const valid = explicitJourney.filter((id) => nodeIds.has(id));
    if (valid.length > 0) return valid;
  }

  if (nodes.length === 0) return [];

  const inDegree = new Map<string, number>();
  nodes.forEach((n) => inDegree.set(n.id, 0));
  edges.forEach((e) => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const entryNodes = nodes
    .filter((n) => n.category === "client" || n.category === "dns")
    .map((n) => n.id);

  let startNodeId = entryNodes[0];
  if (!startNodeId) {
    let minIn = Infinity;
    nodes.forEach((n) => {
      const d = inDegree.get(n.id) || 0;
      if (d < minIn) {
        minIn = d;
        startNodeId = n.id;
      }
    });
  }

  const visited = new Set<string>();
  const queue = [startNodeId];
  const journey: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    journey.push(curr);

    const outEdges = edges.filter((e) => e.source === curr);
    for (const e of outEdges) {
      if (!visited.has(e.target)) {
        queue.push(e.target);
      }
    }
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      journey.push(n.id);
    }
  }

  return journey;
}
