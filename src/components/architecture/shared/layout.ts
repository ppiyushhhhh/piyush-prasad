import type { ArchitectureCategory } from "@/lib/architecture-diagrams";
import type { ArchitectureData, ArchitectureComponent, ArchitectureConnection } from "@/lib/portfolio-projects";
import type { ArchitectureDiagramData, ArchitectureNode, ArchitectureEdge } from "@/lib/architecture-diagrams";

export const DEFAULT_NODE_WIDTH = 260;
export const DEFAULT_NODE_HEIGHT = 155;

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

export interface LayoutOptions {
  autoLayout?: boolean;
}

export interface LayoutZone {
  id: string;
  title: string;
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

  // Target is to the right
  if (target.x >= source.x + sw - 40) {
    startX = source.x + sw;
    startY = source.y + sh / 2;
    endX = target.x;
    endY = target.y + th / 2;
  }
  // Target is to the left
  else if (target.x + tw <= source.x + 40) {
    startX = source.x;
    startY = source.y + sh / 2;
    endX = target.x + tw;
    endY = target.y + th / 2;
  }
  // Target is predominantly below in same column
  else if (dy > 0) {
    startX = source.x + sw / 2;
    startY = source.y + sh;
    endX = target.x + tw / 2;
    endY = target.y;
  }
  // Target is above in same column
  else {
    startX = source.x + sw / 2;
    startY = source.y;
    endX = target.x + tw / 2;
    endY = target.y + th;
  }

  const isHorizontal = Math.abs(endX - startX) >= Math.abs(endY - startY) * 0.7;
  const controlDist = Math.max(Math.abs(endX - startX) * 0.45, 36);

  let pathData: string;
  let midX: number;
  let midY: number;

  if (isHorizontal) {
    const cp1x = startX + (endX >= startX ? controlDist : -controlDist);
    const cp1y = startY;
    const cp2x = endX - (endX >= startX ? controlDist : -controlDist);
    const cp2y = endY;
    pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    // Cubic Bezier midpoint B(0.5)
    midX = 0.125 * startX + 0.375 * cp1x + 0.375 * cp2x + 0.125 * endX;
    midY = 0.125 * startY + 0.375 * cp1y + 0.375 * cp2y + 0.125 * endY;
  } else {
    const cp1x = startX;
    const cp1y = startY + (endY >= startY ? 40 : -40);
    const cp2x = endX;
    const cp2y = endY - (endY >= startY ? 40 : -40);
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
 * Intelligent topological infrastructure tier definitions
 */
interface TierDefinition {
  id: string;
  title: string;
  categories: ArchitectureCategory[];
  isMatch: (node: ArchitectureNode) => boolean;
}

const ARCHITECTURE_TIERS: TierDefinition[] = [
  {
    id: "tier-client",
    title: "TIER 01 · CLIENT & INGRESS ORIGIN",
    categories: ["client"],
    isMatch: (n) => n.category === "client",
  },
  {
    id: "tier-dns",
    title: "TIER 02 · DNS & DOMAIN RESOLUTION",
    categories: ["dns"],
    isMatch: (n) => n.category === "dns",
  },
  {
    id: "tier-routing",
    title: "TIER 03 · EDGE ROUTING & CDN PROXY",
    categories: ["cdn", "networking"],
    isMatch: (n) => ["cdn", "networking"].includes(n.category),
  },
  {
    id: "tier-security",
    title: "TIER 04 · PERIMETER SECURITY & FIREWALL",
    categories: ["security"],
    isMatch: (n) => n.category === "security",
  },
  {
    id: "tier-compute",
    title: "TIER 05 · COMPUTE RUNTIME & SSR",
    categories: ["compute", "application"],
    isMatch: (n) => ["compute", "application"].includes(n.category),
  },
  {
    id: "tier-persistence",
    title: "TIER 06 · PERSISTENCE & DATA STORAGE",
    categories: ["database", "storage"],
    isMatch: (n) => ["database", "storage"].includes(n.category),
  },
  {
    id: "tier-ai-external",
    title: "TIER 07 · AI INFERENCE & EXTERNAL APIS",
    categories: ["ai"],
    isMatch: (n) => n.category === "ai",
  },
  {
    id: "tier-telemetry",
    title: "TIER 08 · TELEMETRY & OBSERVABILITY",
    categories: ["monitoring"],
    isMatch: (n) => n.category === "monitoring",
  },
  {
    id: "tier-automation",
    title: "TIER 09 · CI/CD & DEVOPS AUTOMATION",
    categories: ["cicd"],
    isMatch: (n) => n.category === "cicd",
  },
];

/**
 * Layout engine for full architecture diagram canvas data (ArchitectureDiagramData).
 * Supports smart topological auto-layout arranging components logically into left-to-right
 * infrastructure swimlanes, eliminating large gaps and balancing horizontal/vertical density.
 */
export function layoutArchitectureCanvas(
  data: ArchitectureDiagramData,
  options: LayoutOptions = { autoLayout: true }
): LayoutResult {
  const nodes = data.nodes || [];
  const rawEdges = data.edges || [];

  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = validateConnections(rawEdges, nodeIds, "ArchitectureCanvas");

  const useAutoLayout = options.autoLayout !== false;

  const nodeMap = new Map<string, UnifiedNode>();
  const computedZones: LayoutZone[] = [];

  const colWidth = DEFAULT_NODE_WIDTH;
  const colGap = 84;
  const rowHeight = DEFAULT_NODE_HEIGHT;
  const rowGap = 36;
  const paddingX = 64;
  const paddingY = 64;

  if (useAutoLayout) {
    // 1. Assign nodes to appropriate tier lanes
    const tierLanes: { tier: TierDefinition; nodes: ArchitectureNode[] }[] = ARCHITECTURE_TIERS.map((tier) => ({
      tier,
      nodes: [],
    }));

    nodes.forEach((node) => {
      let assignedIndex = -1;
      for (let i = 0; i < ARCHITECTURE_TIERS.length; i++) {
        if (ARCHITECTURE_TIERS[i].isMatch(node)) {
          assignedIndex = i;
          break;
        }
      }
      if (assignedIndex === -1) {
        // Fallback: put compute-like in compute tier
        assignedIndex = 4;
      }
      tierLanes[assignedIndex].nodes.push(node);
    });

    // 2. Filter active lanes that contain at least one node
    const activeLanes = tierLanes.filter((lane) => lane.nodes.length > 0);

    // Compute max column height to center columns vertically
    const maxNodesInCol = Math.max(...activeLanes.map((l) => l.nodes.length), 1);
    const canvasInnerHeight = maxNodesInCol * rowHeight + (maxNodesInCol - 1) * rowGap;

    // 3. Layout each active lane
    activeLanes.forEach((lane, laneIdx) => {
      const colX = paddingX + laneIdx * (colWidth + colGap);
      const laneNodeCount = lane.nodes.length;
      const laneHeight = laneNodeCount * rowHeight + (laneNodeCount - 1) * rowGap;
      const startY = paddingY + (canvasInnerHeight - laneHeight) / 2;

      lane.nodes.forEach((n, rowIdx) => {
        const x = colX;
        const y = Math.round(startY + rowIdx * (rowHeight + rowGap));

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
        });
      });

      // Calculate distinct, non-overlapping swimlane boundary for this tier
      const minLaneX = colX - 18;
      const minLaneY = startY - 34;
      const laneW = colWidth + 36;
      const laneH = laneHeight + 46;

      computedZones.push({
        id: lane.tier.id,
        title: lane.tier.title,
        x: minLaneX,
        y: minLaneY,
        width: laneW,
        height: laneH,
      });
    });
  } else {
    // Manual / Custom Preserved Coordinates
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
        verification: n.verification,
        evidence: n.evidence,
        raw: n,
      });
    });

    // Compute bounding zones by category
    const zoneDefinitions = [
      { id: "client-edge", title: "CLIENT & INGRESS ORIGIN", categories: ["client"] },
      { id: "dns-domain", title: "DNS & DOMAIN RESOLUTION", categories: ["dns"] },
      { id: "routing-edge", title: "EDGE ROUTING & CDN PROXY", categories: ["cdn", "networking"] },
      { id: "compute-app", title: "COMPUTE & RUNTIME ENVIRONMENT", categories: ["compute", "application"] },
      { id: "persistence", title: "PERSISTENCE & MANAGED DATA", categories: ["database", "storage"] },
      { id: "security-firewall", title: "SECURITY, NETFILTER & IDENTITY", categories: ["security"] },
      { id: "observability", title: "OBSERVABILITY & TELEMETRY", categories: ["monitoring"] },
      { id: "cicd-devops", title: "CI/CD & PIPELINE AUTOMATION", categories: ["cicd"] },
      { id: "ai-inference", title: "AI INFERENCE & LIVE MODELS", categories: ["ai"] },
    ];

    for (const def of zoneDefinitions) {
      const matchingNodes = Array.from(nodeMap.values()).filter((n) => def.categories.includes(n.category));
      if (matchingNodes.length > 0) {
        const minX = Math.min(...matchingNodes.map((n) => n.x));
        const minY = Math.min(...matchingNodes.map((n) => n.y));
        const maxX = Math.max(...matchingNodes.map((n) => n.x + n.width));
        const maxY = Math.max(...matchingNodes.map((n) => n.y + n.height));

        computedZones.push({
          id: def.id,
          title: def.title,
          x: minX - 18,
          y: minY - 32,
          width: maxX - minX + 36,
          height: maxY - minY + 44,
        });
      }
    }
  }

  const unifiedNodes = Array.from(nodeMap.values());

  // AWS VPC boundary detection
  const awsNodes = unifiedNodes.filter(
    (n) => n.provider.toLowerCase().includes("aws") || n.tech.toLowerCase().includes("aws")
  );
  if (awsNodes.length >= 2) {
    const minX = Math.min(...awsNodes.map((n) => n.x));
    const minY = Math.min(...awsNodes.map((n) => n.y));
    const maxX = Math.max(...awsNodes.map((n) => n.x + n.width));
    const maxY = Math.max(...awsNodes.map((n) => n.y + n.height));

    computedZones.push({
      id: "aws-vpc-boundary",
      title: "AWS VPC (10.0.0.0/16) • CLOUD BOUNDARY",
      x: minX - 24,
      y: minY - 36,
      width: maxX - minX + 48,
      height: maxY - minY + 52,
      isAwsVpc: true,
    });
  }

  // Build unified routed edges
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

  // Calculate complete dynamic bounding box across all nodes, zones, and edge labels
  const allX = [
    ...unifiedNodes.map((n) => n.x),
    ...unifiedNodes.map((n) => n.x + n.width),
    ...computedZones.map((z) => z.x),
    ...computedZones.map((z) => z.x + z.width),
    ...edges.map((e) => e.midX - 70),
    ...edges.map((e) => e.midX + 70),
  ];
  const allY = [
    ...unifiedNodes.map((n) => n.y),
    ...unifiedNodes.map((n) => n.y + n.height),
    ...computedZones.map((z) => z.y),
    ...computedZones.map((z) => z.y + z.height),
    ...edges.map((e) => e.midY - 25),
    ...edges.map((e) => e.midY + 25),
  ];

  const minX = allX.length > 0 ? Math.min(...allX) : 0;
  const minY = allY.length > 0 ? Math.min(...allY) : 0;
  const maxX = allX.length > 0 ? Math.max(...allX) : 800;
  const maxY = allY.length > 0 ? Math.max(...allY) : 400;

  const padX = 64;
  const padY = 64;

  return {
    nodes: unifiedNodes,
    edges,
    zones: computedZones,
    viewBox: {
      minX: Math.round(minX - padX),
      minY: Math.round(minY - padY),
      width: Math.round(Math.max(maxX - minX + padX * 2, 700)),
      height: Math.round(Math.max(maxY - minY + padY * 2, 400)),
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
