import type { ArchitectureCategory } from "@/lib/architecture-diagrams";
import type { ArchitectureData, ArchitectureComponent, ArchitectureConnection } from "@/lib/portfolio-projects";
import type { ArchitectureDiagramData, ArchitectureNode, ArchitectureEdge } from "@/lib/architecture-diagrams";

export const DEFAULT_NODE_WIDTH = 220;
export const DEFAULT_NODE_HEIGHT = 125;

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
  raw?: any;
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
}

export interface LayoutResult {
  nodes: UnifiedNode[];
  edges: UnifiedEdge[];
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

/**
 * Computes a smooth cubic Bezier curve between source and target node rectangles
 */
export function computeEdgePath(
  source: { x: number; y: number; width?: number; height?: number },
  target: { x: number; y: number; width?: number; height?: number }
): { pathData: string; midX: number; midY: number } {
  const sw = source.width ?? DEFAULT_NODE_WIDTH;
  const sh = source.height ?? DEFAULT_NODE_HEIGHT;
  const tw = target.width ?? DEFAULT_NODE_WIDTH;
  const th = target.height ?? DEFAULT_NODE_HEIGHT;

  const dx = target.x - source.x;
  const dy = target.y - source.y;

  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;

  // Target is primarily to the right
  if (dx >= 120) {
    startX = source.x + sw;
    startY = source.y + sh / 2;
    endX = target.x;
    endY = target.y + th / 2;
  }
  // Target is to the left
  else if (dx <= -120) {
    startX = source.x;
    startY = source.y + sh / 2;
    endX = target.x + tw;
    endY = target.y + th / 2;
  }
  // Target is predominantly below
  else if (dy > 40) {
    startX = source.x + sw / 2;
    startY = source.y + sh;
    endX = target.x + tw / 2;
    endY = target.y;
  }
  // Target is above or overlapping
  else {
    startX = source.x + sw / 2;
    startY = source.y;
    endX = target.x + tw / 2;
    endY = target.y + th;
  }

  // Smooth Bezier with controlled curvature
  const controlDist = Math.max(Math.abs(endX - startX) * 0.5, 45);
  let pathData: string;
  let midX: number;
  let midY: number;

  if (Math.abs(dx) >= 120) {
    const cp1x = startX + (dx >= 0 ? controlDist : -controlDist);
    const cp1y = startY;
    const cp2x = endX - (dx >= 0 ? controlDist : -controlDist);
    const cp2y = endY;
    pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    // Cubic Bezier midpoint B(0.5)
    midX = 0.125 * startX + 0.375 * cp1x + 0.375 * cp2x + 0.125 * endX;
    midY = 0.125 * startY + 0.375 * cp1y + 0.375 * cp2y + 0.125 * endY;
  } else {
    const cp1x = startX;
    const cp1y = startY + (dy >= 0 ? 35 : -35);
    const cp2x = endX;
    const cp2y = endY - (dy >= 0 ? 35 : -35);
    pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    midX = (startX + endX) / 2;
    midY = (startY + endY) / 2;
  }

  return { pathData, midX, midY };
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

/**
 * Layout engine for project case-study architecture data (ArchitectureData)
 * Lays out nodes left-to-right in ordered lanes by category so the full system
 * fits inside a single viewBox without horizontal scrollbars.
 */
export function layoutProjectArchitecture(data: ArchitectureData): LayoutResult {
  const components = data.components || [];
  const rawConnections = data.connections || [];

  const nodeIds = new Set(components.map((c) => c.id));
  const validConnections = validateConnections(rawConnections, nodeIds, "ProjectArchitecture");

  // Determine lane mapping
  const LANE_ORDER: ArchitectureCategory[][] = [
    ["client"],
    ["dns", "cdn", "networking"],
    ["security"],
    ["compute", "application"],
    ["database", "storage"],
    ["cicd", "monitoring", "ai"],
  ];

  // Map each component to its lane index
  const lanes: { index: number; components: ArchitectureComponent[] }[] = LANE_ORDER.map((_, i) => ({
    index: i,
    components: [],
  }));

  components.forEach((comp) => {
    const cat = mapComponentTypeToCategory(comp.type);
    let assignedLane = 3; // default to compute
    for (let i = 0; i < LANE_ORDER.length; i++) {
      if (LANE_ORDER[i].includes(cat)) {
        assignedLane = i;
        break;
      }
    }
    lanes[assignedLane].components.push(comp);
  });

  // Filter out empty lanes and compute horizontal coordinates
  const activeLanes = lanes.filter((l) => l.components.length > 0);

  const colWidth = DEFAULT_NODE_WIDTH;
  const colGap = 70;
  const rowHeight = DEFAULT_NODE_HEIGHT;
  const rowGap = 36;
  const paddingX = 40;
  const paddingY = 40;

  // Find max nodes in any single lane
  const maxNodesInLane = Math.max(...activeLanes.map((l) => l.components.length), 1);
  const totalHeight = paddingY * 2 + maxNodesInLane * rowHeight + (maxNodesInLane - 1) * rowGap;

  const nodeMap = new Map<string, UnifiedNode>();

  activeLanes.forEach((lane, laneIdx) => {
    const count = lane.components.length;
    const laneHeight = count * rowHeight + (count - 1) * rowGap;
    const startY = (totalHeight - laneHeight) / 2;

    lane.components.forEach((comp, rowIdx) => {
      const x = paddingX + laneIdx * (colWidth + colGap);
      const y = startY + rowIdx * (rowHeight + rowGap);

      // Determine an illustrative counter or protocol badge
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

      const node: UnifiedNode = {
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
      };

      nodeMap.set(comp.id, node);
    });
  });

  const nodes = Array.from(nodeMap.values());
  const totalWidth = paddingX * 2 + activeLanes.length * colWidth + (activeLanes.length - 1) * colGap;

  // Build unified routed edges
  const edges: UnifiedEdge[] = validConnections.map((conn, idx) => {
    const sourceNode = nodeMap.get(conn.from)!;
    const targetNode = nodeMap.get(conn.to)!;
    const { pathData, midX, midY } = computeEdgePath(sourceNode, targetNode);

    // Determine category
    let category: UnifiedEdge["category"] = conn.category || "network";
    if (!conn.category) {
      if (sourceNode.category === "security" || targetNode.category === "security") {
        category = "security";
      } else if (sourceNode.category === "database" || targetNode.category === "database") {
        category = "data";
      } else if (sourceNode.category === "cicd" || targetNode.category === "cicd") {
        category = "deployment";
      } else if (sourceNode.category === "monitoring" || targetNode.category === "monitoring") {
        category = "telemetry";
      }
    }

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
      midX,
      midY,
    };
  });

  return {
    nodes,
    edges,
    viewBox: {
      minX: 0,
      minY: 0,
      width: Math.max(totalWidth, 780),
      height: Math.max(totalHeight, 380),
    },
  };
}

/**
 * Layout engine for full architecture diagram canvas data (ArchitectureDiagramData)
 */
export function layoutArchitectureCanvas(data: ArchitectureDiagramData): LayoutResult {
  const nodes = data.nodes || [];
  const rawEdges = data.edges || [];

  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = validateConnections(rawEdges, nodeIds, "ArchitectureCanvas");

  const nodeMap = new Map<string, UnifiedNode>();
  nodes.forEach((n) => {
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
      x: n.x,
      y: n.y,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
      metricLabel,
      responsibilities: n.responsibilities,
      configuration: n.configuration,
      security_controls: n.security_controls,
      raw: n,
    });
  });

  const unifiedNodes = Array.from(nodeMap.values());

  const edges: UnifiedEdge[] = validEdges.map((e) => {
    const sourceNode = nodeMap.get(e.source)!;
    const targetNode = nodeMap.get(e.target)!;
    const { pathData, midX, midY } = computeEdgePath(sourceNode, targetNode);

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
      midX,
      midY,
    };
  });

  // Calculate bounding box
  const minX = Math.min(...unifiedNodes.map((n) => n.x), 0);
  const minY = Math.min(...unifiedNodes.map((n) => n.y), 0);
  const maxX = Math.max(...unifiedNodes.map((n) => n.x + n.width), 1200);
  const maxY = Math.max(...unifiedNodes.map((n) => n.y + n.height), 700);

  return {
    nodes: unifiedNodes,
    edges,
    viewBox: {
      minX: minX - 40,
      minY: minY - 40,
      width: maxX - minX + 80,
      height: maxY - minY + 80,
    },
  };
}

/**
 * Derives a sequential request journey path from the diagram graph
 * Either returns the explicit journey if defined and valid, or performs
 * a BFS from the entry node (e.g. client/edge or lowest in-degree).
 */
export function deriveRequestJourney(
  nodes: UnifiedNode[],
  edges: UnifiedEdge[],
  explicitJourney?: string[]
): string[] {
  if (explicitJourney && explicitJourney.length > 0) {
    const valid = explicitJourney.every((id) => nodes.some((n) => n.id === id));
    if (valid) return explicitJourney;
  }

  if (nodes.length === 0) return [];

  // Find start node: prefer category 'client', then 'dns', 'cdn', then lowest in-degree
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });

  let startNode = nodes.find((n) => n.category === "client");
  if (!startNode) startNode = nodes.find((n) => n.category === "dns" || n.category === "cdn");
  if (!startNode) {
    // Find node with in-degree 0
    startNode = nodes.reduce((prev, curr) => (inDegree[curr.id] < inDegree[prev.id] ? curr : prev), nodes[0]);
  }

  // BFS to build logical path
  const visited = new Set<string>();
  const journey: string[] = [];
  const queue: string[] = [startNode.id];
  visited.add(startNode.id);

  while (queue.length > 0) {
    const currId = queue.shift()!;
    journey.push(currId);

    const neighbors = adj[currId] || [];
    // Sort neighbors: prioritize network/compute -> persistence/database -> telemetry/cicd
    neighbors.sort((a, b) => {
      const nodeA = nodes.find((n) => n.id === a);
      const nodeB = nodes.find((n) => n.id === b);
      const weight = (cat?: ArchitectureCategory) => {
        if (!cat) return 99;
        if (cat === "cdn" || cat === "dns" || cat === "networking") return 1;
        if (cat === "security") return 2;
        if (cat === "compute" || cat === "application") return 3;
        if (cat === "database" || cat === "storage") return 4;
        return 5;
      };
      return weight(nodeA?.category) - weight(nodeB?.category);
    });

    for (const nextId of neighbors) {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push(nextId);
      }
    }
  }

  return journey;
}
