import type { ArchitectureDiagramData, ArchitectureNode } from "./architecture-diagrams";
import { resolveLogo } from "./tech-logo-registry";
import { NODE_WIDTH, NODE_HEIGHT } from "@/components/architecture/shared/layout";

export interface FlowItem {
  badgeIndex: number;
  from: string;
  to: string;
  label: string;
  protocol?: string;
  category?: string;
}

/**
 * Inlines an SVG image URL as a base64 data URI so it renders reliably
 * in Canvas PNG conversions without CORS/path breakage.
 */
async function toDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const svgText = await res.text();
    const encoded = btoa(unescape(encodeURIComponent(svgText)));
    return `data:image/svg+xml;base64,${encoded}`;
  } catch {
    return url;
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
  diagramDescription?: string
): Promise<string> {
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (diagramData && diagramData.nodes.length > 0) {
    const nodes = diagramData.nodes;
    const edges = diagramData.edges;

    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH));
    const maxY = Math.max(...nodes.map((n) => n.y + NODE_HEIGHT));

    const padding = 50;
    const headerHeight = 90;
    const footerHeight = 50;

    const width = Math.max(maxX - minX + padding * 2, 1100);
    const height = Math.max(maxY - minY + padding * 2 + headerHeight + footerHeight, 640);

    const offsetX = padding - minX;
    const offsetY = padding + headerHeight - minY;

    // Cache logo data URIs
    const logoMap = new Map<string, string>();
    for (const node of nodes) {
      const logo = resolveLogo(node.tech, node.provider);
      if (logo && !logoMap.has(logo.src)) {
        const uri = await toDataUri(logo.src);
        logoMap.set(logo.src, uri);
      }
    }

    const categoryColors: Record<string, string> = {
      network: "#1A4BFF",
      data: "#059669",
      security: "#D97706",
      deployment: "#7C3AED",
      telemetry: "#EA580C",
    };

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>
    ${Object.entries(categoryColors)
      .map(
        ([cat, col]) => `
    <marker id="arrow-${cat}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="${col}" />
    </marker>`
      )
      .join("")}
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="#FAF9F6" />

  <!-- Grid Pattern -->
  <g opacity="0.35">
    ${Array.from({ length: Math.ceil(width / 28) })
      .map((_, i) => `<line x1="${i * 28}" y1="0" x2="${i * 28}" y2="${height}" stroke="#E5E5DF" stroke-width="0.5" />`)
      .join("")}
    ${Array.from({ length: Math.ceil(height / 28) })
      .map((_, i) => `<line x1="0" y1="${i * 28}" x2="${width}" y2="${i * 28}" stroke="#E5E5DF" stroke-width="0.5" />`)
      .join("")}
  </g>

  <!-- Header Block -->
  <g transform="translate(${padding}, 40)">
    <rect x="0" y="-18" width="5" height="22" fill="#1A4BFF" rx="2" />
    <text x="14" y="-3" class="mono" font-size="10" font-weight="700" fill="#1A4BFF" letter-spacing="1.2">PIYUSH PRASAD • CLOUD ARCHITECTURE EXPLORER</text>
    <text x="14" y="22" class="sans" font-size="18" font-weight="700" fill="#121316">${diagramTitle}</text>
    ${
      diagramDescription
        ? `<text x="14" y="38" class="sans" font-size="10.5" fill="#5A5C66">${diagramDescription.slice(0, 110)}${diagramDescription.length > 110 ? "..." : ""}</text>`
        : ""
    }
    <text x="${width - padding * 2}" y="22" class="mono" font-size="10" font-weight="600" fill="#6B7280" text-anchor="end">${nodes.length} Components • ${edges.length} Connections</text>
  </g>

  <!-- Edges Layer -->
  <g>
    ${edges
      .map((edge, idx) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) return "";

        const sx = source.x + offsetX;
        const sy = source.y + offsetY;
        const tx = target.x + offsetX;
        const ty = target.y + offsetY;

        const startX = sx + NODE_WIDTH;
        const startY = sy + NODE_HEIGHT / 2;
        const endX = tx;
        const endY = ty + NODE_HEIGHT / 2;

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

        const strokeColor = categoryColors[edge.category] || "#1A4BFF";
        const markerId = `arrow-${edge.category || "network"}`;
        const badgeNum = idx + 1;

        return `
    <g>
      <path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#${markerId})" />
      <circle cx="${midX}" cy="${midY}" r="10" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="1.8" />
      <text x="${midX}" y="${midY + 3.5}" class="mono" font-size="10" font-weight="700" fill="${strokeColor}" text-anchor="middle">${badgeNum}</text>
    </g>`;
      })
      .join("")}
  </g>

  <!-- Compact Node Cards (200x96) -->
  <g>
    ${nodes
      .map((node) => {
        const x = node.x + offsetX;
        const y = node.y + offsetY;
        const logo = resolveLogo(node.tech, node.provider);
        const logoUri = logo ? logoMap.get(logo.src) || "" : "";

        return `
    <g transform="translate(${x}, ${y})">
      <rect width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="10" fill="#FFFFFF" stroke="#E2E0D8" stroke-width="1.2" />
      <g transform="translate(10, 10)">
        <!-- Logo Tile 32x32 -->
        <rect width="32" height="32" rx="6" fill="#F8F8F6" stroke="#E5E5DF" stroke-width="1" />
        ${logoUri ? `<image href="${logoUri}" x="3" y="3" width="26" height="26" preserveAspectRatio="xMidYMid meet" />` : ""}

        <!-- Title & Status -->
        <g transform="translate(40, 2)">
          <text x="0" y="11" class="sans" font-size="11" font-weight="700" fill="#121316">${node.name.length > 20 ? node.name.slice(0, 19) + "…" : node.name}</text>
          <text x="0" y="24" class="mono" font-size="9" font-weight="600" fill="#1A4BFF">${node.tech.length > 22 ? node.tech.slice(0, 21) + "…" : node.tech}</text>
        </g>
        <circle cx="142" cy="8" r="3" fill="#10B981" />
      </g>
    </g>`;
      })
      .join("")}
  </g>

  <!-- Footer Block -->
  <g transform="translate(${padding}, ${height - 20})">
    <line x1="0" y1="-12" x2="${width - padding * 2}" y2="-12" stroke="#E5E5DF" stroke-width="0.8" />
    <text x="0" y="4" class="mono" font-size="9.5" font-weight="600" fill="#5A5C66">piyushprasad.in • Infrastructure &amp; Cloud DevOps Architecture • ${dateStr}</text>
    <text x="${width - padding * 2}" y="4" class="mono" font-size="9" fill="#9CA3AF" text-anchor="end">Exported from Architecture Explorer</text>
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
  return serializer.serializeToString(clonedSvg);
}

/**
 * 1. Export High-Resolution 2x Retina PNG
 */
export async function exportDiagramAsPng(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram",
  diagramData?: ArchitectureDiagramData,
  diagramTitle?: string,
  diagramDescription?: string
): Promise<void> {
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle, diagramDescription);
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
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          resolve();
        },
        "image/png",
        1.0
      );
    };

    image.onerror = () => {
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
  flows?: FlowItem[]
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  // Generate PNG canvas for high-quality embedding
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle, diagramDescription);
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
  doc.setTextColor(18, 19, 22);
  doc.text(diagramTitle, margin, margin + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 92, 102);
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
    doc.setTextColor(26, 75, 255);
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
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(`piyushprasad.in • Cloud DevOps Architecture • ${dateStr}`, margin, pageHeight - 6);

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
  signal?: AbortSignal
): Promise<void> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");

  // Build the base diagram SVG and load as image
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle);
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
  const height = Math.min(baseImage.height || 600, 600);

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
  const nodes = diagramData?.nodes || [];
  const edges = diagramData?.edges || [];

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
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) continue;

        // Base coordinates scaled to offscreen canvas
        const sx = src.x + 200;
        const sy = src.y + 48;
        const tx = tgt.x;
        const ty = tgt.y + 48;

        // Packet progression along edge
        const duration = 2.4; // 2.4s per loop
        const progress = (t % duration) / duration;
        const px = sx + (tx - sx) * progress;
        const py = sy + (ty - sy) * progress;

        // Glowing packet dot
        ctx.save();
        ctx.fillStyle = "#1A4BFF";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(26, 75, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
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
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
