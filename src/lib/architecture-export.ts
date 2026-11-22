import type { ArchitectureDiagramData, ArchitectureNode } from "./architecture-diagrams";
import { resolveLogo } from "./tech-logo-registry";
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  layoutArchitectureCanvas,
  type LayoutZone,
} from "@/components/architecture/shared/layout";

export interface FlowItem {
  badgeIndex: number | string;
  from: string;
  to: string;
  label: string;
  protocol?: string;
  category?: string;
}

export interface DiagramLayoutExportOptions {
  nodes: any[];
  edges: any[];
  zones?: any[];
  viewBox?: { minX: number; minY: number; width: number; height: number };
}

/**
 * Escapes unsafe characters for valid SVG/XML attributes and text content.
 */
function escapeXml(unsafe: string | number | undefined | null): string {
  if (unsafe === undefined || unsafe === null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Inlines an SVG image URL as a base64 data URI so it renders reliably
 * in Canvas PNG conversions without CORS/path breakage.
 */
async function toDataUri(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const svgText = await res.text();
    const encoded = btoa(unescape(encodeURIComponent(svgText)));
    return `data:image/svg+xml;base64,${encoded}`;
  } catch {
    return "";
  }
}

/**
 * Builds an offscreen SVG markup representing the diagram layout and cards
 * used for high-fidelity rasterization into PNG, PDF, and GIF canvas frames.
 */
export async function buildFullDiagramSvg(
  containerElement: HTMLElement,
  diagramData?: ArchitectureDiagramData,
  diagramTitle: string = "Infrastructure Architecture",
  diagramDescription?: string,
  layoutParam?: DiagramLayoutExportOptions
): Promise<string> {
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Resolve layout either from layoutParam or by running layoutArchitectureCanvas
  let nodes: any[] = [];
  let edges: any[] = [];
  let zones: any[] = [];
  let viewBox = layoutParam?.viewBox;

  if (layoutParam && layoutParam.nodes && layoutParam.nodes.length > 0) {
    nodes = layoutParam.nodes;
    edges = layoutParam.edges || [];
    zones = layoutParam.zones || [];
  } else if (diagramData && diagramData.nodes && diagramData.nodes.length > 0) {
    const computed = layoutArchitectureCanvas(diagramData, { autoLayout: true });
    nodes = computed.nodes;
    edges = computed.edges;
    zones = computed.zones || [];
    viewBox = computed.viewBox;
  }

  if (nodes.length > 0) {
    const allX1 = [...nodes.map((n) => n.x), ...zones.map((z) => z.x)];
    const allY1 = [...nodes.map((n) => n.y), ...zones.map((z) => z.y)];
    const allX2 = [...nodes.map((n) => n.x + (n.width || NODE_WIDTH)), ...zones.map((z) => z.x + z.width)];
    const allY2 = [...nodes.map((n) => n.y + (n.height || NODE_HEIGHT)), ...zones.map((z) => z.y + z.height)];

    const minX = viewBox ? viewBox.minX : Math.min(...allX1);
    const minY = viewBox ? viewBox.minY : Math.min(...allY1);
    const maxX = viewBox ? viewBox.minX + viewBox.width : Math.max(...allX2);
    const maxY = viewBox ? viewBox.minY + viewBox.height : Math.max(...allY2);

    const padding = 50;
    const headerHeight = 90;
    const footerHeight = 50;

    const totalWidth = Math.max(maxX - minX + padding * 2, 1100);
    const totalHeight = Math.max(maxY - minY + padding * 2 + headerHeight + footerHeight, 640);

    const offsetX = padding - minX;
    const offsetY = padding + headerHeight - minY;

    // Cache logo data URIs
    const logoMap = new Map<string, string>();
    for (const node of nodes) {
      const logo = resolveLogo(node.tech, node.provider);
      if (logo && !logoMap.has(logo.src)) {
        const uri = await toDataUri(logo.src);
        if (uri) logoMap.set(logo.src, uri);
      }
    }
    if (zones.some((z) => z.isDocker) && !logoMap.has("/tech-logos/docker.svg")) {
      const uri = await toDataUri("/tech-logos/docker.svg");
      if (uri) logoMap.set("/tech-logos/docker.svg", uri);
    }

    const categoryColors: Record<string, string> = {
      network: "#1A4BFF",
      data: "#0284C7",
      security: "#D97706",
      deployment: "#7C3AED",
      telemetry: "#64748B",
    };

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
  <defs>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>
    ${Object.entries(categoryColors)
      .map(
        ([cat, col]) => `
    <marker id="arrow-${cat}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="${col}" />
    </marker>`
      )
      .join("")}
    <marker id="arrow-secondary" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#9CA3AF" />
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="#FAF9F6" />

  <!-- Grid Pattern -->
  <g opacity="0.35">
    ${Array.from({ length: Math.ceil(totalWidth / 28) })
      .map((_, i) => `<line x1="${i * 28}" y1="0" x2="${i * 28}" y2="${totalHeight}" stroke="#E5E5DF" stroke-width="0.5" />`)
      .join("")}
    ${Array.from({ length: Math.ceil(totalHeight / 28) })
      .map((_, i) => `<line x1="0" y1="${i * 28}" x2="${totalWidth}" y2="${i * 28}" stroke="#E5E5DF" stroke-width="0.5" />`)
      .join("")}
  </g>

  <!-- Header Block -->
  <g transform="translate(${padding}, 40)">
    <rect x="0" y="-18" width="5" height="22" fill="#1A4BFF" rx="2" />
    <text x="14" y="-3" class="mono" font-size="10" font-weight="700" fill="#1A4BFF" letter-spacing="1.2">PIYUSH PRASAD • CLOUD ARCHITECTURE EXPLORER</text>
    <text x="14" y="22" class="sans" font-size="18" font-weight="700" fill="#121316">${escapeXml(diagramTitle)}</text>
    ${
      diagramDescription
        ? `<text x="14" y="38" class="sans" font-size="10.5" fill="#5A5C66">${escapeXml(diagramDescription.slice(0, 120))}${diagramDescription.length > 120 ? "…" : ""}</text>`
        : ""
    }
    <text x="${totalWidth - padding * 2}" y="22" class="mono" font-size="10" font-weight="600" fill="#5A5C66" text-anchor="end">${nodes.length} Components • ${edges.length} Connections</text>
  </g>

  <!-- Main Architecture Stage -->
  <g transform="translate(${offsetX}, ${offsetY})">
    <!-- Zones & Groups Layer -->
    <g>
      ${zones
        .map((zone) => {
          const isDocker = !!zone.isDocker;
          const dockerLogo = isDocker ? logoMap.get("/tech-logos/docker.svg") || "" : "";
          if (isDocker) {
            return `
      <g>
        <rect x="${zone.x}" y="${zone.y}" width="${zone.width}" height="${zone.height}" rx="10" fill="#F3F3ED" stroke="#1A4BFF" stroke-width="1.5" />
        <rect x="${zone.x + 8}" y="${zone.y + 6}" width="${zone.width - 16}" height="24" rx="6" fill="#EEF2FF" />
        ${dockerLogo ? `<image href="${dockerLogo}" x="${zone.x + 14}" y="${zone.y + 9}" width="18" height="18" preserveAspectRatio="xMidYMid meet" />` : ""}
        <text x="${zone.x + (dockerLogo ? 38 : 16)}" y="${zone.y + 22}" class="mono" font-size="10.5" font-weight="700" fill="#1A4BFF">${escapeXml(zone.title)}</text>
      </g>`;
          }
          return `
      <g>
        <rect x="${zone.x}" y="${zone.y}" width="${zone.width}" height="${zone.height}" rx="12" fill="#F3F3ED" stroke="#E5E5DF" stroke-dasharray="4 4" stroke-width="1.2" />
        <text x="${zone.x + 16}" y="${zone.y + 24}" class="mono" font-size="11" font-weight="700" fill="#5A5C66" letter-spacing="0.5">${escapeXml(zone.title)}</text>
      </g>`;
        })
        .join("")}
    </g>

    <!-- Edges Layer -->
    <g>
      ${edges
        .map((edge, idx) => {
          const strokeColor = edge.secondary ? "#9CA3AF" : categoryColors[edge.category] || "#0F766E";
          const markerId = edge.secondary ? "arrow-secondary" : `arrow-${edge.category || "network"}`;
          const isBidirectional = edge.direction === "bidirectional";
          const badgeLabel = edge.secondary
            ? edge.badgeLetter || "A"
            : String(edge.badgeIndex !== undefined ? edge.badgeIndex : idx + 1);

          let pathData = edge.pathData;
          let midX = edge.midX;
          let midY = edge.midY;

          if (!pathData) {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target) || zones.find((z) => z.id === edge.target);
            if (!source || !target) return "";

            const sx = source.x + (source.width || NODE_WIDTH);
            const sy = source.y + (source.height || NODE_HEIGHT) / 2;
            const tx = target.x;
            const ty = target.y + (target.height || NODE_HEIGHT) / 2;

            midX = (sx + tx) / 2;
            midY = (sy + ty) / 2;
            pathData = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
          }

          const hasBadge = midX !== undefined && midY !== undefined && midX !== 0 && midY !== 0;

          return `
      <g>
        <path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="1.75" stroke-dasharray="${edge.secondary ? "4 4" : "6 4"}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#${markerId})"${isBidirectional ? ` marker-start="url(#${markerId})"` : ""} />
        ${
          hasBadge
            ? `
        <circle cx="${midX}" cy="${midY}" r="10" fill="${edge.secondary ? "#F3F4F6" : "#FFFFFF"}" stroke="${edge.secondary ? "#9CA3AF" : strokeColor}" stroke-width="1.5" />
        <text x="${midX}" y="${midY + 3.5}" class="mono" font-size="10.5" font-weight="700" fill="${edge.secondary ? "#6B7280" : strokeColor}" text-anchor="middle">${escapeXml(badgeLabel)}</text>
        `
            : ""
        }
      </g>`;
        })
        .join("")}
    </g>

    <!-- Compact Node Cards (200x96) -->
    <g>
      ${nodes
        .map((node) => {
          const w = node.width || NODE_WIDTH;
          const h = node.height || NODE_HEIGHT;
          const logo = resolveLogo(node.tech, node.provider);
          const logoUri = logo ? logoMap.get(logo.src) || "" : "";

          return `
      <g transform="translate(${node.x}, ${node.y})">
        <rect width="${w}" height="${h}" rx="10" fill="#FFFFFF" stroke="#E5E5DF" stroke-width="1.2" />
        <g transform="translate(10, 10)">
          <!-- Logo Tile 32x32 -->
          <rect width="32" height="32" rx="6" fill="#F3F3ED" stroke="#E5E5DF" stroke-width="1" />
          ${logoUri ? `<image href="${logoUri}" x="3" y="3" width="26" height="26" preserveAspectRatio="xMidYMid meet" />` : ""}

          <!-- Title & Tech -->
          <g transform="translate(40, 2)">
            <text x="0" y="11" class="sans" font-size="11" font-weight="700" fill="#121316">${escapeXml(node.name.length > 22 ? node.name.slice(0, 21) + "…" : node.name)}</text>
            <text x="0" y="24" class="mono" font-size="9" font-weight="600" fill="#1A4BFF">${escapeXml(node.tech.length > 24 ? node.tech.slice(0, 23) + "…" : node.tech)}</text>
          </g>
          <circle cx="${w - 24}" cy="8" r="3" fill="#16A34A" />
        </g>
      </g>`;
        })
        .join("")}
    </g>
  </g>

  <!-- Footer Block -->
  <g transform="translate(${padding}, ${totalHeight - 18})">
    <line x1="0" y1="-10" x2="${totalWidth - padding * 2}" y2="-10" stroke="#E5E5DF" stroke-width="0.8" />
    <text x="0" y="4" class="mono" font-size="9.5" font-weight="600" fill="#5A5C66">piyushprasad.in • Infrastructure &amp; Cloud DevOps Architecture • ${dateStr}</text>
    <text x="${totalWidth - padding * 2}" y="4" class="mono" font-size="9" fill="#9CA3AF" text-anchor="end">Exported from Architecture Explorer</text>
  </g>
</svg>`;

    return svg;
  }

  // Fallback from container SVG
  const svgElement = containerElement.querySelector("svg");
  if (!svgElement) {
    throw new Error("SVG element not found in diagram container");
  }
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const serializer = new XMLSerializer();
  let rawSvg = serializer.serializeToString(clonedSvg);
  rawSvg = rawSvg.replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;");
  return rawSvg;
}

/**
 * 1. Export High-Resolution 2x Retina PNG
 */
export async function exportDiagramAsPng(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram",
  diagramData?: ArchitectureDiagramData,
  diagramTitle?: string,
  diagramDescription?: string,
  layout?: DiagramLayoutExportOptions
): Promise<void> {
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle, diagramDescription, layout);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      const scale = 2; // 2x Retina
      const width = image.width || 1200;
      const height = image.height || 720;

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error("Unable to obtain canvas 2D rendering context"));
        return;
      }

      ctx.scale(scale, scale);
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (pngBlob) => {
          URL.revokeObjectURL(blobUrl);
          if (!pngBlob) {
            reject(new Error("PNG blob conversion failed"));
            return;
          }

          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            if (link.parentNode) {
              document.body.removeChild(link);
            }
            URL.revokeObjectURL(pngUrl);
          }, 10000);
          resolve();
        },
        "image/png",
        1.0
      );
    };

    image.onerror = (e) => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Failed to load SVG image for PNG rendering"));
    };

    image.src = blobUrl;
  });
}

/**
 * 2. Export Vector Landscape A4 PDF with Flow Table
 */
export async function exportDiagramAsPdf(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram",
  diagramData?: ArchitectureDiagramData,
  diagramTitle: string = "Infrastructure Architecture",
  diagramDescription?: string,
  flows?: FlowItem[],
  layout?: DiagramLayoutExportOptions
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  // Generate PNG canvas for high-quality embedding
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle, diagramDescription, layout);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.crossOrigin = "anonymous";

  const pngDataUrl = await new Promise<string>((resolve, reject) => {
    image.onload = () => {
      const scale = 2;
      const width = image.width || 1200;
      const height = image.height || 640;

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error("Canvas context failed"));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Failed to load diagram for PDF rendering"));
    };
    image.src = blobUrl;
  });

  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 14;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 27, 26);
  doc.text(diagramTitle, margin, margin + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(91, 107, 104);
  const subtitle = diagramDescription
    ? diagramDescription.slice(0, 140)
    : "Piyush Prasad • Infrastructure Architecture Explorer";
  doc.text(subtitle, margin, margin + 10);

  // Diagram Image: fits width 269mm
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = 115;
  doc.addImage(pngDataUrl, "PNG", margin, margin + 14, imgWidth, imgHeight);

  // Flow Table
  const tableY = margin + 14 + imgHeight + 6;
  if (flows && flows.length > 0 && tableY < pageHeight - 30) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text("END-TO-END DATA FLOWS", margin, tableY);

    // Table Header
    doc.setFontSize(7.5);
    doc.setFont("courier", "bold");
    doc.setTextColor(100, 100, 100);
    const colX = [margin, margin + 10, margin + 80, margin + 180];
    doc.text("#", colX[0], tableY + 5);
    doc.text("CONNECTION", colX[1], tableY + 5);
    doc.text("FLOW / ACTION", colX[2], tableY + 5);
    doc.text("PROTOCOL / TYPE", colX[3], tableY + 5);

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, tableY + 6.5, pageWidth - margin, tableY + 6.5);

    // Table Rows
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    let rowY = tableY + 11;

    for (const f of flows.slice(0, 6)) {
      if (rowY > pageHeight - 14) break;
      doc.text(String(f.badgeIndex), colX[0], rowY);
      doc.text(`${f.from} -> ${f.to}`.slice(0, 36), colX[1], rowY);
      doc.text(f.label.slice(0, 50), colX[2], rowY);
      doc.text((f.protocol || "HTTPS").slice(0, 24), colX[3], rowY);
      rowY += 4.5;
    }
  }

  // Footer
  const footerDateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(`piyushprasad.in • Cloud DevOps Architecture • ${footerDateStr}`, margin, pageHeight - 6);

  doc.save(`${fileName}.pdf`);
}

/**
 * 3. Export Deterministic Animated GIF (3 seconds @ 12 fps = 36 frames)
 */
export async function exportDiagramAsGif(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram",
  diagramData?: ArchitectureDiagramData,
  diagramTitle: string = "Infrastructure Architecture",
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
  layoutParam?: DiagramLayoutExportOptions
): Promise<void> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");

  // Build the base diagram SVG and load as image
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle, undefined, layoutParam);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  const baseImage = new Image();
  baseImage.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    baseImage.onload = () => resolve();
    baseImage.onerror = () => reject(new Error("Failed to load base image for GIF"));
    baseImage.src = blobUrl;
  });

  const width = Math.min(baseImage.width || 1000, 1000);
  const scale = width / (baseImage.width || 1000);
  const height = Math.round((baseImage.height || 600) * scale);

  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Offscreen canvas context failed");

  const gif = GIFEncoder();
  const totalFrames = 36; // 3 seconds at 12 fps
  const fps = 12;
  const delayMs = Math.round(1000 / fps);

  // Nodes and edges for deterministic animated packet rendering
  let nodes = layoutParam?.nodes || [];
  let edges = layoutParam?.edges || [];
  let zones = layoutParam?.zones || [];

  if (nodes.length === 0 && diagramData) {
    const computed = layoutArchitectureCanvas(diagramData, { autoLayout: true });
    nodes = computed.nodes;
    edges = computed.edges;
    zones = computed.zones || [];
  }

  const allX1 = [...nodes.map((n) => n.x), ...zones.map((z) => z.x)];
  const allY1 = [...nodes.map((n) => n.y), ...zones.map((z) => z.y)];
  const minX = allX1.length ? Math.min(...allX1) : 0;
  const minY = allY1.length ? Math.min(...allY1) : 0;
  const padding = 50;
  const headerHeight = 90;
  const offsetX = padding - minX;
  const offsetY = padding + headerHeight - minY;

  for (let frame = 0; frame < totalFrames; frame++) {
    if (signal?.aborted) {
      URL.revokeObjectURL(blobUrl);
      throw new Error("GIF export cancelled by user");
    }

    const t = frame / fps; // deterministic time in seconds: 0.0 to 3.0

    // Clear and draw base diagram
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseImage, 0, 0, width, height);

    // Draw animated moving packets along each edge
    if (nodes.length > 0 && edges.length > 0) {
      for (const edge of edges) {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target) || zones.find((z) => z.id === edge.target);
        if (!src || !tgt) continue;

        // Base coordinates in stage coordinate space
        const sx = (src.x + offsetX + (src.width || NODE_WIDTH)) * scale;
        const sy = (src.y + offsetY + (src.height || NODE_HEIGHT) / 2) * scale;
        const tx = (tgt.x + offsetX) * scale;
        const ty = (tgt.y + offsetY + (tgt.height || NODE_HEIGHT) / 2) * scale;

        // Packet progression along edge
        const duration = 2.4; // 2.4s per loop
        const progress = (t % duration) / duration;

        let px: number;
        let py: number;

        if (edge.midX !== undefined && edge.midY !== undefined && edge.midX !== 0 && edge.midY !== 0) {
          const mx = (edge.midX + offsetX) * scale;
          const my = (edge.midY + offsetY) * scale;
          if (progress < 0.5) {
            const p = progress * 2;
            px = sx + (mx - sx) * p;
            py = sy + (my - sy) * p;
          } else {
            const p = (progress - 0.5) * 2;
            px = mx + (tx - mx) * p;
            py = my + (ty - my) * p;
          }
        } else {
          px = sx + (tx - sx) * progress;
          py = sy + (ty - sy) * progress;
        }

        // Glowing packet dot
        ctx.save();
        ctx.fillStyle = edge.secondary ? "#9CA3AF" : "#1A4BFF";
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = edge.secondary ? "rgba(156, 163, 175, 0.4)" : "rgba(26, 75, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Read pixel data
    const imgData = ctx.getImageData(0, 0, width, height);
    const rgba = imgData.data;

    // Quantize palette to 128 colors for compact file size (<1 MB)
    const palette = quantize(rgba, 128);
    const index = applyPalette(rgba, palette);

    gif.writeFrame(index, width, height, {
      palette,
      delay: delayMs,
    });

    if (onProgress) {
      onProgress(Math.round(((frame + 1) / totalFrames) * 100));
    }
  }

  gif.finish();
  URL.revokeObjectURL(blobUrl);

  const gifBytes = gif.bytes();
  const gifBlob = new Blob([gifBytes.buffer as ArrayBuffer], { type: "image/gif" });
  const downloadUrl = URL.createObjectURL(gifBlob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${fileName}.gif`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(downloadUrl);
  }, 10000);
}
