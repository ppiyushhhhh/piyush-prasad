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
}

/**
 * Computes an obstacle-free connection path between source and target node rectangles.
 * Guarantees that connection lines NEVER cut through intervening component cards:
 * - Adjacent sections: clean smooth horizontal Bézier in the inter-column corridor.
 * - Non-adjacent sections: routed via upper routing corridor above cards.
 * - Same column: routed around the right gutter.
 * - Feedback / reverse: routed via lower routing corridor below all cards.
 */
export function computeEdgePath(
  source: { x: number; y: number; width?: number; height?: number },
  target: { x: number; y: number; width?: number; height?: number },
  routingContext?: EdgeRoutingContext
): { pathData: string; midX: number; midY: number } {
  const sw = source.width ?? DEFAULT_NODE_WIDTH;
  const sh = source.height ?? DEFAULT_NODE_HEIGHT;
  const tw = target.width ?? DEFAULT_NODE_WIDTH;
  const th = target.height ?? DEFAULT_NODE_HEIGHT;

  const startX = source.x + sw;
  const startY = source.y + sh / 2;
  const endX = target.x;
  const endY = target.y + th / 2;

  const dx = endX - startX;

  const sourceCol = routingContext?.sourceCol;
  const targetCol = routingContext?.targetCol;
  const hasColInfo = sourceCol !== undefined && targetCol !== undefined;
  const colDiff = hasColInfo ? targetCol - sourceCol : (dx > 40 ? 1 : 0);

  let pathData: string;
  let midX: number;
  let midY: number;

  // 1. Same column (same section) -> route around right edge through dedicated gutter
  if (Math.abs(source.x - target.x) < 40 || colDiff === 0) {
    const gutterX = Math.max(source.x + sw, target.x + tw) + 26;
    const targetRight = target.x + tw;
    pathData = `M ${startX} ${startY} C ${gutterX} ${startY}, ${gutterX} ${endY}, ${targetRight} ${endY}`;
    midX = gutterX;
    midY = (startY + endY) / 2;
  }
  // 2. Adjacent column moving left-to-right (colDiff === 1 or direct forward)
  else if (dx > 0 && colDiff === 1) {
    const cpDist = Math.max(dx * 0.45, 32);
    pathData = `M ${startX} ${startY} C ${startX + cpDist} ${startY}, ${endX - cpDist} ${endY}, ${endX} ${endY}`;
    midX = (startX + endX) / 2;
    midY = (startY + endY) / 2;
  }
  // 3. Forward connection skipping intermediate columns (colDiff > 1)
  // Route via upper corridor above intermediate cards so it NEVER crosses through any card!
  else if (dx > 0 && colDiff > 1) {
    const corridorY = routingContext?.topCorridorY ?? Math.min(startY, endY) - 52;
    const cpOut = Math.min(32, dx * 0.2);
    const cpIn = Math.min(32, dx * 0.2);
    pathData = `M ${startX} ${startY} C ${startX + cpOut} ${startY}, ${startX + cpOut} ${corridorY}, ${startX + cpOut * 2} ${corridorY} L ${endX - cpIn * 2} ${corridorY} C ${endX - cpIn} ${corridorY}, ${endX - cpIn} ${endY}, ${endX} ${endY}`;
    midX = (startX + endX) / 2;
    midY = corridorY;
  }
  // 4. Reverse / Feedback connection (target is to the left of source)
  // Route via lower corridor below all cards
  else {
    const corridorY = routingContext?.bottomCorridorY ?? Math.max(startY, endY) + 64;
    const cpOut = 32;
    const cpIn = 32;
    pathData = `M ${startX} ${startY} C ${startX + cpOut} ${startY}, ${startX + cpOut} ${corridorY}, ${startX} ${corridorY} L ${endX} ${corridorY} C ${endX - cpIn} ${corridorY}, ${endX - cpIn} ${endY}, ${endX} ${endY}`;
    midX = (startX + endX) / 2;
    midY = corridorY;
  }

  return { pathData, midX: Math.round(midX), midY: Math.round(midY) };
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
    const sourceCol = activeLanes.findIndex((l) => l.components.some((c) => c.id === conn.from));
    const targetCol = activeLanes.findIndex((l) => l.components.some((c) => c.id === conn.to));
    const { pathData, midX, midY } = computeEdgePath(sourceNode, targetNode, {
      sourceCol: sourceCol >= 0 ? sourceCol : undefined,
      targetCol: targetCol >= 0 ? targetCol : undefined,
      topCorridorY: 10,
      bottomCorridorY: totalHeight + 20,
    });

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
export interface CanonicalSectionDefinition {
  id: string;
  title: string;
  description: string;
  matchCategories: ArchitectureCategory[];
}

export const CANONICAL_SECTIONS: CanonicalSectionDefinition[] = [
  {
    id: "sec-network",
    title: "01. Client & Domain Resolution",
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
    title: "03. Compute & Application",
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
    title: "05. DevOps & Automation",
    description: "Automates testing, continuous delivery, and observability.",
    matchCategories: ["cicd", "monitoring", "ai"],
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
  const nodeColMap = new Map<string, number>();
  const computedZones: LayoutZone[] = [];

  const colWidth = DEFAULT_NODE_WIDTH;
  const colGap = 92;
  const rowHeight = DEFAULT_NODE_HEIGHT;
  const rowGap = 36;
  const paddingX = 64;
  const paddingY = 72;
  const sectionHeaderH = 50;

  if (useAutoLayout) {
    interface EffectiveSection {
      id: string;
      title: string;
      description: string;
      nodes: ArchitectureNode[];
    }

    let effectiveSections: EffectiveSection[] = [];

    // 1. If explicit sections are provided on diagram_data, use them!
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

      // If any nodes were not explicitly mapped, attach them to the most logical section
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
      // 2. Otherwise map automatically into human-friendly canonical sections
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

    // Filter out any empty sections (NO empty groups)
    const activeSections = effectiveSections.filter((sec) => sec.nodes.length > 0);

    // 3. Layout each active section as a clean column with header zone
    activeSections.forEach((sec, colIdx) => {
      const colX = paddingX + colIdx * (colWidth + colGap);
      const sectionHeaderY = paddingY;
      const cardsStartY = sectionHeaderY + sectionHeaderH + 16;
      const laneNodeCount = sec.nodes.length;
      const laneHeight = sectionHeaderH + 16 + laneNodeCount * rowHeight + (laneNodeCount - 1) * rowGap;

      sec.nodes.forEach((n, rowIdx) => {
        const x = colX;
        const y = Math.round(cardsStartY + rowIdx * (rowHeight + rowGap));
        nodeColMap.set(n.id, colIdx);

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

      computedZones.push({
        id: sec.id,
        title: sec.title,
        description: sec.description,
        x: colX - 16,
        y: sectionHeaderY,
        width: colWidth + 32,
        height: laneHeight + 20,
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
      { id: "client-edge", title: "01. Client & Ingress", description: "Visitor and domain entry points.", categories: ["client", "dns"] },
      { id: "routing-security", title: "02. Perimeter & Security", description: "Edge distribution and security boundaries.", categories: ["cdn", "networking", "security"] },
      { id: "compute-app", title: "03. Compute & Application", description: "Application runtime and backend services.", categories: ["compute", "application"] },
      { id: "persistence", title: "04. Persistence & Storage", description: "Databases and persistent data stores.", categories: ["database", "storage"] },
      { id: "automation-cicd", title: "05. Automation & DevOps", description: "Pipelines, monitoring, and telemetry.", categories: ["cicd", "monitoring", "ai"] },
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
          description: def.description,
          x: minX - 18,
          y: minY - 32,
          width: maxX - minX + 36,
          height: maxY - minY + 44,
        });
      }
    }
  }

  const unifiedNodes = Array.from(nodeMap.values());

  // Routing corridors
  const maxCardBottom = Math.max(...unifiedNodes.map((n) => n.y + n.height), 400);
  const topCorridorY = paddingY - 32;
  const bottomCorridorY = maxCardBottom + 44;

  // Build unified routed edges
  const edges: UnifiedEdge[] = validEdges.map((e) => {
    const sourceNode = nodeMap.get(e.source)!;
    const targetNode = nodeMap.get(e.target)!;
    const sourceCol = nodeColMap.get(e.source);
    const targetCol = nodeColMap.get(e.target);

    const { pathData, midX, midY } = computeEdgePath(sourceNode, targetNode, {
      sourceCol,
      targetCol,
      topCorridorY,
      bottomCorridorY,
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
