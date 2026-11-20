import type { ArchitectureDiagramData, ArchitectureNode } from "./architecture-diagrams";
import { resolveLogo } from "./tech-logo-registry";

/**
 * Inlines an SVG image URL as a base64 data URI so it renders reliably
 * in standalone exported SVGs and Canvas PNG conversions without CORS/path breakage.
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
 * Builds a complete, standalone high-fidelity vector SVG representation of the architecture diagram
 * including title, background, zones, routed edges, node cards with embedded logos, and piyushprasad.in footer.
 */
export async function buildFullDiagramSvg(
  containerElement: HTMLElement,
  diagramData?: ArchitectureDiagramData,
  diagramTitle: string = "Infrastructure Architecture"
): Promise<string> {
  // If diagramData is provided, render comprehensive vector SVG directly from data model
  if (diagramData && diagramData.nodes.length > 0) {
    const nodes = diagramData.nodes;
    const edges = diagramData.edges;

    // Calculate bounding box of all nodes
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + 220));
    const maxY = Math.max(...nodes.map((n) => n.y + 130));

    const padding = 60;
    const headerHeight = 90;
    const footerHeight = 60;

    const width = Math.max(maxX - minX + padding * 2, 1200);
    const height = Math.max(maxY - minY + padding * 2 + headerHeight + footerHeight, 720);

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

    // Category edge colors
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
    <!-- Arrowhead markers -->
    ${Object.entries(categoryColors)
      .map(
        ([cat, col]) => `
    <marker id="arrow-${cat}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="${col}" />
    </marker>`
      )
      .join("")}
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="#FAF9F6" />

  <!-- Subtle Blueprint Grid Pattern -->
  <g opacity="0.4">
    ${Array.from({ length: Math.ceil(width / 30) })
      .map((_, i) => `<line x1="${i * 30}" y1="0" x2="${i * 30}" y2="${height}" stroke="#E5E5DF" stroke-width="0.5" />`)
      .join("")}
    ${Array.from({ length: Math.ceil(height / 30) })
      .map((_, i) => `<line x1="0" y1="${i * 30}" x2="${width}" y2="${i * 30}" stroke="#E5E5DF" stroke-width="0.5" />`)
      .join("")}
  </g>

  <!-- Header Section -->
  <g transform="translate(${padding}, 40)">
    <rect x="0" y="-18" width="6" height="24" fill="#1A4BFF" rx="2" />
    <text x="14" y="-3" class="mono" font-size="11" font-weight="700" fill="#1A4BFF" letter-spacing="1.5">PIYUSH PRASAD • CLOUD ARCHITECTURE EXPLORER</text>
    <text x="14" y="22" class="sans" font-size="20" font-weight="700" fill="#121316">${diagramTitle}</text>
    <text x="${width - padding * 2}" y="22" class="mono" font-size="11" font-weight="600" fill="#6B7280" text-anchor="end">${nodes.length} Components • ${edges.length} Connections</text>
  </g>

  <!-- Edge Connection Paths -->
  <g>
    ${edges
      .map((edge) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) return "";

        const sx = source.x + offsetX;
        const sy = source.y + offsetY;
        const tx = target.x + offsetX;
        const ty = target.y + offsetY;

        const dx = tx - sx;
        let startX = sx + 220;
        let startY = sy + 60;
        let endX = tx;
        let endY = ty + 60;

        if (dx < 120 && dx > -120) {
          startX = sx + 110;
          startY = sy + 120;
          endX = tx + 110;
          endY = ty;
        } else if (dx <= -120) {
          startX = sx;
          endX = tx + 220;
        }

        const controlDist = Math.max(Math.abs(endX - startX) * 0.5, 40);
        const pathData = `M ${startX} ${startY} C ${startX + (dx >= 0 ? controlDist : -controlDist)} ${startY}, ${endX - (dx >= 0 ? controlDist : -controlDist)} ${endY}, ${endX} ${endY}`;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const strokeColor = categoryColors[edge.category] || "#1A4BFF";
        const markerId = `arrow-${edge.category || "network"}`;

        return `
    <g>
      <path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="1.8" marker-end="url(#${markerId})" />
      <g transform="translate(${midX}, ${midY})">
        <rect x="-44" y="-10" width="88" height="20" rx="10" fill="#FFFFFF" stroke="#E5E5DF" stroke-width="1" />
        <text x="0" y="3.5" class="mono" font-size="8.5" font-weight="700" fill="${strokeColor}" text-anchor="middle">${edge.protocol || edge.label}</text>
      </g>
    </g>`;
      })
      .join("")}
  </g>

  <!-- Node Cards -->
  <g>
    ${nodes
      .map((node) => {
        const x = node.x + offsetX;
        const y = node.y + offsetY;
        const logo = resolveLogo(node.tech, node.provider);
        const logoUri = logo ? logoMap.get(logo.src) || "" : "";

        return `
    <g transform="translate(${x}, ${y})">
      <!-- Card Box -->
      <rect width="220" height="120" rx="10" fill="#FFFFFF" stroke="#E5E5DF" stroke-width="1.2" />

      <!-- Top Row: Logo Tile & Header -->
      <g transform="translate(12, 12)">
        <!-- Logo Tile -->
        <rect width="36" height="36" rx="6" fill="#FFFFFF" stroke="#E5E5DF" stroke-width="1" />
        ${logoUri ? `<image href="${logoUri}" x="4" y="4" width="28" height="28" preserveAspectRatio="xMidYMid meet" />` : ""}

        <!-- Name & Status -->
        <g transform="translate(44, 0)">
          <text x="0" y="13" class="sans" font-size="11" font-weight="700" fill="#121316">${node.name.length > 22 ? node.name.slice(0, 22) : node.name}</text>
          <text x="0" y="27" class="mono" font-size="9" font-weight="600" fill="#1A4BFF">${node.tech.length > 24 ? node.tech.slice(0, 24) : node.tech}</text>
        </g>
        <circle cx="150" cy="8" r="3.5" fill="#10B981" />
      </g>

      <!-- Description -->
      <text x="14" y="68" class="sans" font-size="9" fill="#5A5C66">${node.description.length > 36 ? node.description.slice(0, 36) : node.description}</text>
      <text x="14" y="80" class="sans" font-size="9" fill="#5A5C66">${node.description.length > 36 ? node.description.slice(36, 72) : ""}</text>

      <!-- Footer Divider & Metadata -->
      <line x1="12" y1="92" x2="208" y2="92" stroke="#E5E5DF" stroke-width="0.8" />
      <text x="14" y="106" class="mono" font-size="8.5" fill="#6B7280">${node.provider.split("(")[0].trim()}</text>
      ${node.port ? `<text x="206" y="106" class="mono" font-size="8.5" font-weight="700" fill="#1A4BFF" text-anchor="end">:${node.port}</text>` : ""}
    </g>`;
      })
      .join("")}
  </g>

  <!-- Footer Branding -->
  <g transform="translate(${padding}, ${height - 24})">
    <line x1="0" y1="-14" x2="${width - padding * 2}" y2="-14" stroke="#E5E5DF" stroke-width="1" />
    <text x="0" y="5" class="mono" font-size="10" font-weight="600" fill="#5A5C66">piyushprasad.in • Infrastructure &amp; Cloud DevOps Architecture</text>
    <text x="${width - padding * 2}" y="5" class="mono" font-size="9.5" fill="#9CA3AF" text-anchor="end">Exported from Interactive Architecture Canvas</text>
  </g>
</svg>`;

    return svg;
  }

  // Fallback: Clone existing SVG from container
  const svgElement = containerElement.querySelector("svg");
  if (!svgElement) {
    throw new Error("SVG element not found in diagram container");
  }

  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);
  if (!svgString.startsWith("<?xml")) {
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  }
  return svgString;
}

export async function exportDiagramAsSvg(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram",
  diagramData?: ArchitectureDiagramData,
  diagramTitle?: string
): Promise<void> {
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export async function exportDiagramAsAnimatedSvg(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram-animated",
  diagramData?: ArchitectureDiagramData,
  diagramTitle?: string
): Promise<void> {
  let svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle);

  // Inject animated CSS styles into the SVG
  const animatedStyles = `
    <style>
      @keyframes edgeFlow {
        from { stroke-dashoffset: 24; }
        to { stroke-dashoffset: 0; }
      }
      .animated-flow {
        stroke-dasharray: 6 4;
        animation: edgeFlow 2.5s linear infinite;
      }
    </style>
  `;

  svgString = svgString.replace("</defs>", `${animatedStyles}</defs>`);
  svgString = svgString.replace(/stroke-dasharray="undefined"/g, 'class="animated-flow"');

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export async function exportDiagramAsPng(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram",
  diagramData?: ArchitectureDiagramData,
  diagramTitle?: string
): Promise<void> {
  const svgString = await buildFullDiagramSvg(containerElement, diagramData, diagramTitle);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      const scale = 2; // High-resolution 2x retina canvas
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

    image.onerror = (e) => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Failed to load vector SVG image for PNG rendering"));
    };

    image.src = blobUrl;
  });
}
