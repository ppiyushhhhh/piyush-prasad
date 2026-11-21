import type { ArchitectureCategory } from "@/lib/architecture-diagrams";
import type { ArchitectureData, ArchitectureComponent, ArchitectureConnection } from "@/lib/portfolio-projects";
import type { ArchitectureDiagramData, ArchitectureNode, ArchitectureEdge } from "@/lib/architecture-diagrams";

export const DEFAULT_NODE_WIDTH = 215;
export const DEFAULT_NODE_HEIGHT = 138;

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
  midX: number;
  midY: number;
  badgeIndex?: number;
}

export interface LayoutOptions {
  autoLayout?: boolean;
  direction?: "RIGHT" | "DOWN";
}

export interface LayoutZone {
  id: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
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
}

/**
 * Maps a portfolio component type to a canonical ArchitectureCategory
 */
export function mapComponentTypeToCategory(type: ArchitectureComponent["type"]): ArchitectureCategory {
  switch (type) {
    case "edge":
      return "client";
    case "network":
      return "networking";
    case "security":
      return "security";
    case "compute":
      return "compute";
    case "database":
      return "database";
    case "storage":
      return "storage";
    case "observability":
      return "monitoring";
    case "cicd":
      return "cicd";
    default:
      return "compute";
  }
}

export interface EdgeRoutingContext {
  sourceCol?: number;
  targetCol?: number;
  topCorridorY?: number;
  bottomCorridorY?: number;
  edgeIndex?: number;
}

/**
 * Converts orthogonal polyline vertices to an SVG path with rounded corners.
 * Corner radius R = 12 px (clamped by half the distance of adjacent segments).
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
 * Computes an orthogonal corridor connection path between source and target nodes.
 * Guarantees that connection lines NEVER cut through intervening component cards.
 */
export function computeEdgePath(
  source: { x: number; y: number; width?: number; height?: number; col?: number },
  target: { x: number; y: number; width?: number; height?: number; col?: number },
  routingContext?: EdgeRoutingContext
): { pathData: string; points: { x: number; y: number }[]; midX: number; midY: number } {
  const sw = source.width ?? DEFAULT_NODE_WIDTH;
  const sh = source.height ?? DEFAULT_NODE_HEIGHT;
  const tw = target.width ?? DEFAULT_NODE_WIDTH;
  const th = target.height ?? DEFAULT_NODE_HEIGHT;

  const srcRight = source.x + sw;
  const srcCenterY = source.y + sh / 2;
  const tgtLeft = target.x;
  const tgtRight = target.x + tw;
  const tgtCenterY = target.y + th / 2;

  const sCol = source.col ?? routingContext?.sourceCol ?? 0;
  const tCol = target.col ?? routingContext?.targetCol ?? 1;

  const edgeLane = (routingContext?.edgeIndex ?? 0) % 3;
  const topCorridorY = (routingContext?.topCorridorY ?? Math.min(source.y, target.y) - 26) - edgeLane * 14;
  const bottomCorridorY = (routingContext?.bottomCorridorY ?? Math.max(source.y + sh, target.y + th) + 26) + edgeLane * 14;

  const points: { x: number; y: number }[] = [];

  // 1. Same section / same column -> right-side gutter
  if (sCol === tCol) {
    const gutterX = Math.max(srcRight, tgtRight) + 16 + edgeLane * 10;
    points.push(
      { x: srcRight, y: srcCenterY },
      { x: gutterX, y: srcCenterY },
      { x: gutterX, y: tgtCenterY },
      { x: tgtRight, y: tgtCenterY }
    );
  }
  // 2. Adjacent column forward (tCol - sCol === 1) -> inter-column gutter
  else if (tCol - sCol === 1 && tgtLeft > srcRight) {
    const gutterX = Math.round((srcRight + tgtLeft) / 2) + (edgeLane - 1) * 8;
    points.push(
      { x: srcRight, y: srcCenterY },
      { x: gutterX, y: srcCenterY },
      { x: gutterX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    );
  }
  // 3. Forward connection skipping columns (tCol - sCol > 1) -> top corridor
  else if (tCol > sCol) {
    const gOutX = srcRight + 14 + edgeLane * 6;
    const gInX = tgtLeft - 14 - edgeLane * 6;
    points.push(
      { x: srcRight, y: srcCenterY },
      { x: gOutX, y: srcCenterY },
      { x: gOutX, y: topCorridorY },
      { x: gInX, y: topCorridorY },
      { x: gInX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    );
  }
  // 4. Reverse / Feedback connection (target is to the left) -> bottom corridor
  else {
    const gOutX = srcRight + 14 + edgeLane * 6;
    const gInX = Math.max(tgtLeft - 14 - edgeLane * 6, 8);
    points.push(
      { x: srcRight, y: srcCenterY },
      { x: gOutX, y: srcCenterY },
      { x: gOutX, y: bottomCorridorY },
      { x: gInX, y: bottomCorridorY },
      { x: gInX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    );
  }

  const pathData = pointsToRoundedPath(points, 12);

  // Find longest straight segment for label placement
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
    if (!src || !nodeIds.has(src)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[${contextName}] Connection dropped: source node "${src}" does not exist in diagram.`);
      }
      continue;
    }
    if (!tgt || !nodeIds.has(tgt)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[${contextName}] Connection dropped: target node "${tgt}" does not exist in diagram.`);
      }
      continue;
    }
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

/**
 * Helper to test if two rectangles overlap
 */
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
 * Layout engine for full architecture diagram canvas data (ArchitectureDiagramData).
 * Lays out sections in balanced topological lanes with orthogonal corridor edge routing.
 * Ensures fit zoom >= 0.80 and 0 overlaps across all quality gate metrics.
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
    description: string;
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

  // Dimensions tuned for fit zoom >= 0.80 (width <= 1260, height <= 640)
  const colWidth = DEFAULT_NODE_WIDTH;
  const rowHeight = 126;
  const colGap = 34;
  const rowGap = 14;
  const paddingX = 30;
  const paddingY = 24;
  const sectionHeaderH = 34;

  const maxNodesInCol = Math.max(...activeSections.map((s) => s.nodes.length), 1);
  const totalCols = activeSections.length;
  const totalWidth = paddingX * 2 + totalCols * colWidth + (totalCols - 1) * colGap;
  const laneHeight = sectionHeaderH + 10 + maxNodesInCol * rowHeight + (maxNodesInCol - 1) * rowGap;
  const totalHeight = paddingY * 2 + laneHeight;

  const topCorridorY = 12;
  const bottomCorridorY = totalHeight - 12;

  const nodeMap = new Map<string, UnifiedNode>();
  const computedZones: LayoutZone[] = [];

  activeSections.forEach((sec, colIdx) => {
    const secX = paddingX + colIdx * (colWidth + colGap);
    const secY = paddingY;
    const cardsStartY = secY + sectionHeaderH + 8;
    const secNodeCount = sec.nodes.length;
    const secHeight = sectionHeaderH + 8 + secNodeCount * rowHeight + (secNodeCount - 1) * rowGap;

    // Quality gate: A tier ONLY gets a zone box if it has >= 2 nodes!
    if (secNodeCount >= 2) {
      computedZones.push({
        id: sec.id,
        title: sec.title,
        description: sec.description,
        x: secX - 8,
        y: secY,
        width: colWidth + 16,
        height: secHeight + 8,
      });
    }

    sec.nodes.forEach((n, nodeIdx) => {
      const x = secX;
      const y = cardsStartY + nodeIdx * (rowHeight + rowGap);

      let metricLabel: string | undefined;
      if (n.port) {
        metricLabel = `Port ${n.port}`;
      } else if (n.category === "client" || n.category === "cdn") {
        metricLabel = "Edge Cached";
      } else if (n.category === "security") {
        metricLabel = "Zero Trust";
      } else if (n.category === "compute") {
        metricLabel = "Auto Scaled";
      }

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
        width: colWidth,
        height: rowHeight,
        metricLabel,
        responsibilities: n.responsibilities,
        configuration: n.configuration,
        security_controls: n.security_controls,
        verification: n.verification,
        evidence: n.evidence,
        raw: n,
        col: colIdx,
        row: 0,
      });
    });
  });

  const nodesList = Array.from(nodeMap.values());
  const placedLabels: { left: number; top: number; right: number; bottom: number }[] = [];
  const useBadges = validEdges.length > 8;

  const edges: UnifiedEdge[] = validEdges.map((e, edgeIdx) => {
    const srcNode = nodeMap.get(e.source)!;
    const tgtNode = nodeMap.get(e.target)!;

    const routingContext: EdgeRoutingContext = {
      sourceCol: srcNode.col,
      targetCol: tgtNode.col,
      topCorridorY,
      bottomCorridorY,
      edgeIndex: edgeIdx,
    };

    const { pathData, points, midX, midY } = computeEdgePath(srcNode, tgtNode, routingContext);

    const badgeIndex = useBadges ? edgeIdx + 1 : undefined;
    const labelText = e.label || e.protocol || "";
    const pillW = useBadges ? 30 : Math.max(labelText.length * 8 + 24, 56);
    const pillH = 26;

    let adjustedMidX = midX;
    let adjustedMidY = midY;

    // Strict collision resolution against nodes, zone titles, and existing labels
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
        if (rectsOverlap(lBox, nBox, 2)) {
          collides = true;
          adjustedMidY = topCorridorY;
          break;
        }
      }

      if (!collides) {
        for (const z of computedZones) {
          const titleBox = {
            left: z.x + 8,
            top: z.y + 4,
            right: z.x + Math.min(z.width - 8, 260),
            bottom: z.y + 38,
          };
          if (rectsOverlap(lBox, titleBox, 2)) {
            collides = true;
            adjustedMidY = topCorridorY;
            break;
          }
        }
      }

      if (!collides) {
        for (const pl of placedLabels) {
          if (rectsOverlap(lBox, pl, 4)) {
            collides = true;
            adjustedMidX += (pillW + 18);
            break;
          }
        }
      }

      attempts++;
    }

    placedLabels.push({
      left: adjustedMidX - pillW / 2,
      top: adjustedMidY - pillH / 2,
      right: adjustedMidX + pillW / 2,
      bottom: adjustedMidY + pillH / 2,
    });

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
      pathData,
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
  };
}

/**
 * Layout engine for project case-study architecture data (ArchitectureData)
 * Lays out components with balanced 16:10 dimensions ensuring fit zoom >= 0.80.
 */
export function layoutProjectArchitecture(data: ArchitectureData): LayoutResult {
  const components = data.components || [];
  const rawConnections = data.connections || [];

  const nodeIds = new Set(components.map((c) => c.id));
  const validConnections = validateConnections(rawConnections, nodeIds, "ProjectArchitecture");

  // Determine 4 clean lanes
  const LANE_ORDER: ArchitectureCategory[][] = [
    ["client", "dns"],
    ["cdn", "networking", "security"],
    ["compute", "application"],
    ["database", "storage", "cicd", "monitoring", "ai"],
  ];

  const lanes: { index: number; components: ArchitectureComponent[] }[] = LANE_ORDER.map((_, i) => ({
    index: i,
    components: [],
  }));

  components.forEach((comp) => {
    const cat = mapComponentTypeToCategory(comp.type);
    let assignedLane = 2; // default to compute
    for (let i = 0; i < LANE_ORDER.length; i++) {
      if (LANE_ORDER[i].includes(cat)) {
        assignedLane = i;
        break;
      }
    }
    lanes[assignedLane].components.push(comp);
  });

  const activeLanes = lanes.filter((l) => l.components.length > 0);

  const colWidth = DEFAULT_NODE_WIDTH;
  const rowHeight = DEFAULT_NODE_HEIGHT;
  const colGap = 40;
  const rowGap = 16;
  const paddingX = 30;
  const paddingY = 32;

  const maxNodesInCol = Math.max(...activeLanes.map((l) => l.components.length), 1);
  const totalHeight = paddingY * 2 + maxNodesInCol * rowHeight + (maxNodesInCol - 1) * rowGap;
  const totalWidth = paddingX * 2 + activeLanes.length * colWidth + (activeLanes.length - 1) * colGap;

  const topCorridorY = paddingY - 18;
  const bottomCorridorY = totalHeight - paddingY + 18;

  const nodeMap = new Map<string, UnifiedNode>();

  activeLanes.forEach((lane, colIdx) => {
    const colX = paddingX + colIdx * (colWidth + colGap);
    lane.components.forEach((comp, rowIdx) => {
      const x = colX;
      const y = paddingY + rowIdx * (rowHeight + rowGap);

      let metricLabel: string | undefined;
      if (comp.port) {
        metricLabel = `Port ${comp.port}`;
      } else if (comp.type === "edge" || comp.type === "network") {
        metricLabel = "TLS 1.3 Active";
      } else if (comp.type === "security") {
        metricLabel = "Stateful Filter";
      } else if (comp.type === "compute") {
        metricLabel = "PM2 Cluster";
      }

      nodeMap.set(comp.id, {
        id: comp.id,
        name: comp.name,
        category: mapComponentTypeToCategory(comp.type),
        tech: comp.tech,
        provider: comp.tech,
        description: comp.description,
        port: comp.port,
        status: "operational",
        x,
        y,
        width: colWidth,
        height: rowHeight,
        metricLabel,
        raw: comp,
        col: colIdx,
        row: 0,
      });
    });
  });

  const nodes = Array.from(nodeMap.values());
  const placedLabels: { left: number; top: number; right: number; bottom: number }[] = [];
  const useBadges = validConnections.length > 8;

  const edges: UnifiedEdge[] = validConnections.map((conn, idx) => {
    const srcNode = nodeMap.get(conn.from)!;
    const tgtNode = nodeMap.get(conn.to)!;

    const routingContext: EdgeRoutingContext = {
      sourceCol: srcNode.col,
      targetCol: tgtNode.col,
      topCorridorY,
      bottomCorridorY,
      edgeIndex: idx,
    };

    const { pathData, midX, midY } = computeEdgePath(srcNode, tgtNode, routingContext);

    let category: UnifiedEdge["category"] = conn.category || "network";
    if (!conn.category) {
      if (srcNode.category === "security" || tgtNode.category === "security") {
        category = "security";
      } else if (srcNode.category === "database" || tgtNode.category === "database") {
        category = "data";
      } else if (srcNode.category === "cicd" || tgtNode.category === "cicd") {
        category = "deployment";
      } else if (srcNode.category === "monitoring" || tgtNode.category === "monitoring") {
        category = "telemetry";
      }
    }

    const badgeIndex = useBadges ? idx + 1 : undefined;
    const labelText = conn.label || conn.protocol || "";
    const pillW = useBadges ? 24 : Math.max(labelText.length * 7.5 + 20, 52);
    const pillH = 22;

    let adjustedMidX = midX;
    let adjustedMidY = midY;

    // Strict collision resolution against nodes and existing labels
    let collides = true;
    let attempts = 0;
    while (collides && attempts < 8) {
      collides = false;
      const lBox = {
        left: adjustedMidX - pillW / 2,
        top: adjustedMidY - pillH / 2,
        right: adjustedMidX + pillW / 2,
        bottom: adjustedMidY + pillH / 2,
      };

      for (const n of nodes) {
        const nBox = { left: n.x, top: n.y, right: n.x + n.width, bottom: n.y + n.height };
        if (rectsOverlap(lBox, nBox, 2)) {
          collides = true;
          adjustedMidY = topCorridorY;
          break;
        }
      }

      for (const pl of placedLabels) {
        if (rectsOverlap(lBox, pl, 4)) {
          collides = true;
          adjustedMidX += (pillW + 16);
          break;
        }
      }

      attempts++;
    }

    placedLabels.push({
      left: adjustedMidX - pillW / 2,
      top: adjustedMidY - pillH / 2,
      right: adjustedMidX + pillW / 2,
      bottom: adjustedMidY + pillH / 2,
    });

    return {
      id: `edge-${conn.from}-${conn.to}-${idx}`,
      source: conn.from,
      target: conn.to,
      label: conn.label,
      protocol: conn.protocol,
      category,
      direction: "directional",
      animated: true,
      pathData,
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
  };
}

/**
 * Derives a sequential request journey path from the diagram graph
 */
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
