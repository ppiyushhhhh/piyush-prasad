/**
 * Architecture Diagram Export Utilities
 * Exports interactive SVG diagrams as vector SVG or high-resolution PNG.
 */

export async function exportDiagramAsSvg(
  containerElement: HTMLElement,
  fileName: string = "architecture-diagram",
): Promise<void> {
  const svgElement = containerElement.querySelector("svg");
  if (!svgElement) {
    throw new Error("SVG element not found in diagram container");
  }

  // Clone SVG to avoid modifying the active DOM
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;

  // Ensure standard SVG namespaces and dimensions
  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  // Determine current theme for background rendering
  const isDark = document.documentElement.classList.contains("dark");
  const bgColor = isDark ? "#121316" : "#FAF9F6";

  // Prepend background rect for standalone viewer contrast
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("width", "100%");
  bgRect.setAttribute("height", "100%");
  bgRect.setAttribute("fill", bgColor);
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

  // Serialize SVG to XML string
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);

  // Clean XML declaration
  if (!svgString.startsWith("<?xml")) {
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  }

  // Create downloadable blob
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
): Promise<void> {
  const svgElement = containerElement.querySelector("svg");
  if (!svgElement) {
    throw new Error("SVG element not found in diagram container");
  }

  const isDark = document.documentElement.classList.contains("dark");
  const bgColor = isDark ? "#121316" : "#FAF9F6";

  const bbox = svgElement.getBoundingClientRect();
  const width = Math.max(bbox.width, 1200);
  const height = Math.max(bbox.height, 700);

  // Clone SVG with embedded background
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clonedSvg.setAttribute("width", width.toString());
  clonedSvg.setAttribute("height", height.toString());

  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("width", "100%");
  bgRect.setAttribute("height", "100%");
  bgRect.setAttribute("fill", bgColor);
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      // 2x high-resolution rendering
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas 2D rendering context"));
        return;
      }

      ctx.scale(scale, scale);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to generate PNG blob"));
            return;
          }
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
          resolve();
        },
        "image/png",
        1.0,
      );
    };

    image.onerror = (err) => {
      reject(new Error(`Failed to load SVG for PNG conversion: ${err}`));
    };

    image.src = blobUrl;
  }).finally(() => {
    URL.revokeObjectURL(blobUrl);
  });
}
