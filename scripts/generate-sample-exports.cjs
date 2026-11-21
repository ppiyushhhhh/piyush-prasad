// scripts/generate-sample-exports.cjs
const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'architecture');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Telegram AI Agent Diagram Definition
const telegramNodes = [
  { id: 'node-tg-user', name: 'Telegram User', tech: 'Telegram App / MTProto', provider: 'Telegram Client', x: 40, y: 180 },
  { id: 'node-tg-api', name: 'Telegram Bot API Cloud', tech: 'Telegram Bot API Platform', provider: 'Telegram Cloud', x: 280, y: 180 },
  { id: 'node-cf-worker', name: 'Cloudflare Worker Webhook', tech: 'Cloudflare Workers (V8)', provider: 'Cloudflare Global Edge', x: 520, y: 180 },
  { id: 'node-auth-idempotency', name: 'Auth & Idempotency Layer', tech: 'Crypto Token / KV Dedup', provider: 'Cloudflare Worker Runtime', x: 760, y: 80 },
  { id: 'node-gemini-primary', name: 'Google Gemini Primary AI', tech: 'Gemini 1.5 Flash API', provider: 'Google AI Cloud', x: 1000, y: 80 },
  { id: 'node-cf-ai-fallback', name: 'Cloudflare Workers AI Fallback', tech: 'Workers AI (Llama 3)', provider: 'Cloudflare Edge GPUs', x: 1000, y: 280 },
  { id: 'node-d1-db', name: 'Cloudflare D1 SQLite Database', tech: 'Cloudflare D1 SQL', provider: 'Cloudflare D1', x: 760, y: 280 },
];

const telegramFlows = [
  { badgeIndex: 1, from: 'Telegram User', to: 'Telegram Bot API Cloud', label: 'Send Telegram Message', protocol: 'MTProto / Port 443' },
  { badgeIndex: 2, from: 'Telegram Bot API Cloud', to: 'Cloudflare Worker Webhook', label: 'POST Webhook JSON / sendMessage Response', protocol: 'HTTPS / TLS 1.3' },
  { badgeIndex: 3, from: 'Cloudflare Worker Webhook', to: 'Auth & Idempotency Layer', label: 'Validate Secret Header', protocol: 'Internal Runtime Check' },
  { badgeIndex: 4, from: 'Auth & Idempotency Layer', to: 'Google Gemini Primary AI', label: 'Primary Prompt Dispatch', protocol: 'HTTPS REST / JSON' },
];

async function generatePng() {
  console.log('Generating sample PNG...');
  // Build a crisp SVG and write directly as PNG / SVG-backed image
  // We can write an SVG file and convert with resvg, sharp, or canvas, or write an ultra-clean PNG
  const width = 1200;
  const height = 700;

  // Since we have canvas or headless chromium, we can render offscreen or create via node-canvas/chromium
  // Let's create an SVG string first
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      .mono { font-family: ui-monospace, Menlo, Consolas, monospace; }
      .sans { font-family: system-ui, -apple-system, sans-serif; }
    </style>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#1A4BFF" />
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#FAF9F6" />
  <!-- Blueprint Grid -->
  <g opacity="0.35">
    ${Array.from({ length: 42 }).map((_, i) => `<line x1="${i * 28}" y1="0" x2="${i * 28}" y2="${height}" stroke="#E5E5DF" stroke-width="0.5" />`).join('')}
    ${Array.from({ length: 25 }).map((_, i) => `<line x1="0" y1="${i * 28}" x2="${width}" y2="${i * 28}" stroke="#E5E5DF" stroke-width="0.5" />`).join('')}
  </g>
  <!-- Header -->
  <g transform="translate(48, 48)">
    <rect x="0" y="-18" width="5" height="22" fill="#1A4BFF" rx="2" />
    <text x="14" y="-3" class="mono" font-size="10" font-weight="700" fill="#1A4BFF" letter-spacing="1.2">PIYUSH PRASAD • CLOUD ARCHITECTURE EXPLORER</text>
    <text x="14" y="24" class="sans" font-size="20" font-weight="700" fill="#121316">Telegram AI Agent Serverless Architecture</text>
    <text x="14" y="44" class="sans" font-size="11" fill="#5A5C66">High-concurrency serverless Telegram chatbot on Cloudflare Workers edge with Gemini AI primary &amp; Workers AI fallback.</text>
    <text x="${width - 96}" y="24" class="mono" font-size="10" font-weight="600" fill="#6B7280" text-anchor="end">7 Components • 4 Primary Flows</text>
  </g>
  <!-- Edges -->
  <g>
    <!-- Flow 1: User -> TG API -->
    <path d="M 240 276 L 280 276" stroke="#1A4BFF" stroke-width="2" marker-end="url(#arrow)" />
    <circle cx="260" cy="276" r="10" fill="#FFFFFF" stroke="#1A4BFF" stroke-width="1.8" />
    <text x="260" y="279.5" class="mono" font-size="10" font-weight="700" fill="#1A4BFF" text-anchor="middle">1</text>

    <!-- Flow 2: TG API <-> Worker (Bidirectional) -->
    <path d="M 480 276 L 520 276" stroke="#1A4BFF" stroke-width="2" marker-end="url(#arrow)" marker-start="url(#arrow)" />
    <circle cx="500" cy="276" r="10" fill="#FFFFFF" stroke="#1A4BFF" stroke-width="1.8" />
    <text x="500" y="279.5" class="mono" font-size="10" font-weight="700" fill="#1A4BFF" text-anchor="middle">2</text>

    <!-- Flow 3: Worker -> Auth -->
    <path d="M 720 276 L 740 276 L 740 176 L 760 176" fill="none" stroke="#D97706" stroke-width="2" marker-end="url(#arrow)" />
    <circle cx="740" cy="226" r="10" fill="#FFFFFF" stroke="#D97706" stroke-width="1.8" />
    <text x="740" y="229.5" class="mono" font-size="10" font-weight="700" fill="#D97706" text-anchor="middle">3</text>

    <!-- Flow 4: Auth -> Gemini -->
    <path d="M 960 176 L 1000 176" stroke="#059669" stroke-width="2" marker-end="url(#arrow)" />
    <circle cx="980" cy="176" r="10" fill="#FFFFFF" stroke="#059669" stroke-width="1.8" />
    <text x="980" y="179.5" class="mono" font-size="10" font-weight="700" fill="#059669" text-anchor="middle">4</text>
  </g>
  <!-- Compact Cards (200x96) -->
  ${telegramNodes
    .map(
      (n) => `
  <g transform="translate(${n.x}, ${n.y + 48})">
    <rect width="200" height="96" rx="10" fill="#FFFFFF" stroke="#E2E0D8" stroke-width="1.2" />
    <g transform="translate(10, 10)">
      <rect width="32" height="32" rx="6" fill="#F8F8F6" stroke="#E5E5DF" stroke-width="1" />
      <g transform="translate(40, 2)">
        <text x="0" y="11" class="sans" font-size="11" font-weight="700" fill="#121316">${n.name}</text>
        <text x="0" y="24" class="mono" font-size="9" font-weight="600" fill="#1A4BFF">${n.tech}</text>
      </g>
      <circle cx="142" cy="8" r="3" fill="#10B981" />
    </g>
  </g>`
    )
    .join('')}
  <!-- Footer -->
  <g transform="translate(48, ${height - 24})">
    <line x1="0" y1="-12" x2="${width - 96}" y2="-12" stroke="#E5E5DF" stroke-width="0.8" />
    <text x="0" y="4" class="mono" font-size="9.5" font-weight="600" fill="#5A5C66">piyushprasad.in • Infrastructure &amp; Cloud DevOps Architecture</text>
    <text x="${width - 96}" y="4" class="mono" font-size="9" fill="#9CA3AF" text-anchor="end">Exported from Interactive Architecture Canvas</text>
  </g>
</svg>`;

  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'telegram-agent-base.svg'), svg);
}

async function generatePdf() {
  console.log('Generating sample PDF...');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 14;
  const pageWidth = 297;
  const pageHeight = 210;

  // Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(18, 19, 22);
  doc.text('Telegram AI Agent Serverless Architecture', margin, margin + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 92, 102);
  doc.text('High-concurrency serverless Telegram chatbot running on Cloudflare Workers edge with Gemini AI primary.', margin, margin + 10);

  // Diagram placeholder box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 249, 246);
  doc.roundedRect(margin, margin + 14, pageWidth - margin * 2, 110, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 75, 255);
  doc.text('ARCHITECTURE OVERVIEW (7 COMPONENTS • 4 PRIMARY DATA FLOWS)', margin + 6, margin + 22);

  // Cards representation in PDF
  const cardW = 34;
  const cardH = 18;
  telegramNodes.forEach((n, idx) => {
    const cx = margin + 8 + (idx % 4) * 62;
    const cy = margin + 30 + Math.floor(idx / 4) * 36;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(cx, cy, cardW + 20, cardH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 20, 20);
    doc.text(n.name.slice(0, 24), cx + 3, cy + 6);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(26, 75, 255);
    doc.text(n.tech.slice(0, 26), cx + 3, cy + 12);
  });

  // Flow Table
  const tableY = margin + 14 + 110 + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 75, 255);
  doc.text('END-TO-END REQUEST FLOWS', margin, tableY);

  doc.setFontSize(7.5);
  doc.setFont('courier', 'bold');
  doc.setTextColor(100, 100, 100);
  const colX = [margin, margin + 8, margin + 70, margin + 180];
  doc.text('#', colX[0], tableY + 5);
  doc.text('CONNECTION', colX[1], tableY + 5);
  doc.text('FLOW / ACTION', colX[2], tableY + 5);
  doc.text('PROTOCOL / TYPE', colX[3], tableY + 5);

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, tableY + 6.5, pageWidth - margin, tableY + 6.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 30, 30);
  let rowY = tableY + 11;

  for (const f of telegramFlows) {
    doc.text(String(f.badgeIndex), colX[0], rowY);
    doc.text(`${f.from} -> ${f.to}`.slice(0, 34), colX[1], rowY);
    doc.text(f.label.slice(0, 52), colX[2], rowY);
    doc.text(f.protocol.slice(0, 24), colX[3], rowY);
    rowY += 4.5;
  }

  // Footer
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(`piyushprasad.in • Infrastructure & Cloud DevOps Architecture • ${dateStr}`, margin, pageHeight - 6);

  const pdfPath = path.join(SCREENSHOT_DIR, 'telegram-agent.pdf');
  const buf = doc.output('arraybuffer');
  fs.writeFileSync(pdfPath, Buffer.from(buf));
  console.log(`Saved PDF to ${pdfPath}`);
}

async function generateGif() {
  console.log('Generating sample GIF...');
  const width = 640;
  const height = 360;
  const gif = GIFEncoder();
  const totalFrames = 36;
  const fps = 12;

  // Simple clean background
  const rgba = new Uint8Array(width * height * 4);

  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps; // 0 to 3.0s

    // Fill background (#FAF9F6)
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = 250;
      rgba[i * 4 + 1] = 249;
      rgba[i * 4 + 2] = 246;
      rgba[i * 4 + 3] = 255;
    }

    // Draw cards & packet dots along the flow line
    // Flow line from x=60 to x=580 at y=180
    const progress = (t % 2.5) / 2.5;
    const packetX = Math.round(60 + progress * (580 - 60));
    const packetY = 180;

    // Draw packet dot (radius 5)
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        if (dx * dx + dy * dy <= 25) {
          const px = packetX + dx;
          const py = packetY + dy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            rgba[idx] = 26;
            rgba[idx + 1] = 75;
            rgba[idx + 2] = 255;
            rgba[idx + 3] = 255;
          }
        }
      }
    }

    const palette = quantize(rgba, 64);
    const index = applyPalette(rgba, palette);
    gif.writeFrame(index, width, height, { palette, delay: 1000 / fps });
  }

  gif.finish();
  const gifPath = path.join(SCREENSHOT_DIR, 'telegram-agent.gif');
  fs.writeFileSync(gifPath, Buffer.from(gif.bytes()));
  console.log(`Saved GIF to ${gifPath}`);
}

async function main() {
  await generatePng();
  await generatePdf();
  await generateGif();
  console.log('Sample exports generated successfully!');
}

main().catch(console.error);
