const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');

const PORT = 4173;
const HOST = '127.0.0.1';
const DEFAULT_URL = `http://${HOST}:${PORT}`;
const BASE_URL = process.env.BASE_URL || DEFAULT_URL;

function isServerRunning(urlStr) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: '/',
        method: 'HEAD',
        timeout: 1500,
      },
      (res) => resolve(true)
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log(`Starting Vite dev server on ${HOST}:${PORT}...`);
    const serverProcess = spawn('cmd.exe', ['/c', 'npx', 'vite', 'dev', '--port', String(PORT), '--host', HOST], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env },
    });

    serverProcess.stdout.on('data', (d) => {
      const text = d.toString();
      // console.log('[vite]', text);
      if (text.includes(String(PORT)) || text.includes('Local:')) {
        resolve(serverProcess);
      }
    });

    serverProcess.stderr.on('data', (d) => {
      // console.error('[vite err]', d.toString());
    });

    serverProcess.on('error', (err) => reject(err));

    setTimeout(() => {
      resolve(serverProcess);
    }, 8000);
  });
}

// Line segment to rectangle intersection check
function segmentIntersectsRect(p1, p2, rect) {
  // rect: { left, top, right, bottom }
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  if (maxX <= rect.left || minX >= rect.right || maxY <= rect.top || minY >= rect.bottom) {
    return false;
  }

  // Check if either endpoint is inside the rect
  if (
    p1.x > rect.left && p1.x < rect.right && p1.y > rect.top && p1.y < rect.bottom ||
    p2.x > rect.left && p2.x < rect.right && p2.y > rect.top && p2.y < rect.bottom
  ) {
    return true;
  }

  // Check line intersection with 4 sides of rect
  const sides = [
    [{ x: rect.left, y: rect.top }, { x: rect.right, y: rect.top }],
    [{ x: rect.right, y: rect.top }, { x: rect.right, y: rect.bottom }],
    [{ x: rect.right, y: rect.bottom }, { x: rect.left, y: rect.bottom }],
    [{ x: rect.left, y: rect.bottom }, { x: rect.left, y: rect.top }],
  ];

  for (const [s1, s2] of sides) {
    if (linesIntersect(p1, p2, s1, s2)) return true;
  }
  return false;
}

function linesIntersect(a1, a2, b1, b2) {
  const d = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
  if (d === 0) return false;
  const u = ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / d;
  const v = ((b1.x - a1.x) * (a2.y - a1.y) - (b1.y - a1.y) * (a2.x - a1.x)) / d;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1;
}

// Parse SVG path data into polyline segments
function parsePathSegments(pathData) {
  const segments = [];
  if (!pathData) return segments;

  const points = [];
  const commands = pathData.match(/([MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*)/g) || [];
  let curr = { x: 0, y: 0 };

  for (const cmd of commands) {
    const type = cmd[0];
    const args = cmd.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (type === 'M' || type === 'L') {
      if (args.length >= 2) {
        curr = { x: args[0], y: args[1] };
        points.push({ ...curr });
      }
    } else if (type === 'H') {
      if (args.length >= 1) {
        curr = { x: args[0], y: curr.y };
        points.push({ ...curr });
      }
    } else if (type === 'V') {
      if (args.length >= 1) {
        curr = { x: curr.x, y: args[0] };
        points.push({ ...curr });
      }
    } else if (type === 'C') {
      // Cubic bezier: approximate with midpoints
      if (args.length >= 6) {
        const cp1 = { x: args[0], y: args[1] };
        const cp2 = { x: args[2], y: args[3] };
        const end = { x: args[4], y: args[5] };
        // sample 4 points along curve
        for (let t = 0.25; t <= 1; t += 0.25) {
          const x = (1-t)**3 * curr.x + 3*(1-t)**2*t * cp1.x + 3*(1-t)*t**2 * cp2.x + t**3 * end.x;
          const y = (1-t)**3 * curr.y + 3*(1-t)**2*t * cp1.y + 3*(1-t)*t**2 * cp2.y + t**3 * end.y;
          points.push({ x, y });
        }
        curr = end;
      }
    } else if (type === 'Q') {
      if (args.length >= 4) {
        const cp = { x: args[0], y: args[1] };
        const end = { x: args[2], y: args[3] };
        for (let t = 0.33; t <= 1; t += 0.33) {
          const x = (1-t)**2 * curr.x + 2*(1-t)*t * cp.x + t**2 * end.x;
          const y = (1-t)**2 * curr.y + 2*(1-t)*t * cp.y + t**2 * end.y;
          points.push({ x, y });
        }
        curr = end;
      }
    }
  }

  for (let i = 0; i < points.length - 1; i++) {
    segments.push({ p1: points[i], p2: points[i + 1] });
  }

  return segments;
}

function rectsOverlap(r1, r2, tolerance = 1) {
  return !(
    r1.right <= r2.left + tolerance ||
    r2.right <= r1.left + tolerance ||
    r1.bottom <= r2.top + tolerance ||
    r2.bottom <= r1.top + tolerance
  );
}

function measureDiagram(layout, name) {
  const { nodes = [], edges = [], zones = [], viewBox = { width: 1200, height: 700 } } = layout;

  // 1. nodeNode: overlapping node cards
  let nodeNode = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const rA = { left: a.x, top: a.y, right: a.x + a.width, bottom: a.y + a.height };
      const rB = { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height };
      if (rectsOverlap(rA, rB)) {
        nodeNode++;
      }
    }
  }

  // 2. zoneZone: overlapping zones/tiers
  let zoneZone = 0;
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const a = zones[i];
      const b = zones[j];
      const rA = { left: a.x, top: a.y, right: a.x + a.width, bottom: a.y + a.height };
      const rB = { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height };
      if (rectsOverlap(rA, rB)) {
        zoneZone++;
      }
    }
  }

  // 3. nodeInManyZones: node in more than 1 zone
  let nodeInManyZones = 0;
  for (const node of nodes) {
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    let count = 0;
    for (const z of zones) {
      if (cx >= z.x && cx <= z.x + z.width && cy >= z.y && cy <= z.y + z.height) {
        count++;
      }
    }
    if (count > 1) {
      nodeInManyZones++;
    }
  }

  // Zone title areas
  const zoneTitleRects = zones.map((z) => ({
    zoneId: z.id,
    left: z.x + 8,
    top: z.y + 4,
    right: z.x + Math.min(z.width - 8, 260),
    bottom: z.y + 38,
  }));

  // Edge segments
  const parsedEdges = edges.map((e) => ({
    ...e,
    segments: parsePathSegments(e.pathData),
  }));

  // 4. edgeThroughNode: edge lines cutting through node cards (excluding connection endpoints)
  let edgeThroughNode = 0;
  for (const edge of parsedEdges) {
    for (const node of nodes) {
      const isEndpoint = node.id === edge.source || node.id === edge.target;
      // Shrink node rect slightly for endpoints to allow connection touch without counting as through
      const inset = isEndpoint ? 8 : 2;
      const nodeRect = {
        left: node.x + inset,
        top: node.y + inset,
        right: node.x + node.width - inset,
        bottom: node.y + node.height - inset,
      };

      if (nodeRect.right <= nodeRect.left || nodeRect.bottom <= nodeRect.top) continue;

      let cutsThrough = false;
      for (let sIdx = 0; sIdx < edge.segments.length; sIdx++) {
        // If it's an endpoint node, skip the first and last segments touching the port
        if (isEndpoint) {
          if (node.id === edge.source && sIdx === 0) continue;
          if (node.id === edge.target && sIdx === edge.segments.length - 1) continue;
        }

        const seg = edge.segments[sIdx];
        if (segmentIntersectsRect(seg.p1, seg.p2, nodeRect)) {
          cutsThrough = true;
          break;
        }
      }

      if (cutsThrough) {
        edgeThroughNode++;
      }
    }
  }

  // 5. edgeThroughZoneTitle: edge lines cutting through zone title headers
  let edgeThroughZoneTitle = 0;
  for (const edge of parsedEdges) {
    for (const titleRect of zoneTitleRects) {
      let cutsTitle = false;
      for (const seg of edge.segments) {
        if (segmentIntersectsRect(seg.p1, seg.p2, titleRect)) {
          cutsTitle = true;
          break;
        }
      }
      if (cutsTitle) {
        edgeThroughZoneTitle++;
      }
    }
  }

  // Edge label bounding boxes
  const labelBoxes = [];
  for (const edge of edges) {
    if (edge.label || edge.protocol || edges.length > 8) {
      const textLen = (edge.label || edge.protocol || '99').length;
      const w = edges.length > 8 ? 26 : Math.max(textLen * 7 + 16, 44);
      const h = 22;
      labelBoxes.push({
        edgeId: edge.id,
        left: edge.midX - w / 2,
        top: edge.midY - h / 2,
        right: edge.midX + w / 2,
        bottom: edge.midY + h / 2,
      });
    }
  }

  // 6. labelOnNode: labels overlapping nodes
  let labelOnNode = 0;
  for (const lBox of labelBoxes) {
    for (const node of nodes) {
      const nBox = { left: node.x, top: node.y, right: node.x + node.width, bottom: node.y + node.height };
      if (rectsOverlap(lBox, nBox)) {
        labelOnNode++;
      }
    }
  }

  // 7. labelOnLabel: labels overlapping other labels
  let labelOnLabel = 0;
  for (let i = 0; i < labelBoxes.length; i++) {
    for (let j = i + 1; j < labelBoxes.length; j++) {
      if (rectsOverlap(labelBoxes[i], labelBoxes[j])) {
        labelOnLabel++;
      }
    }
  }

  // 8. labelOnZoneTitle: labels overlapping zone titles
  let labelOnZoneTitle = 0;
  for (const lBox of labelBoxes) {
    for (const tBox of zoneTitleRects) {
      if (rectsOverlap(lBox, tBox)) {
        labelOnZoneTitle++;
      }
    }
  }

  // 9. tooSmall: fit zoom in 1200x700 viewport below 0.8
  const availW = Math.max(1200 - 160, 200);
  const availH = Math.max(700 - 140, 200);
  const fitZoom = Math.min(availW / (viewBox.width || 1200), availH / (viewBox.height || 700));
  const tooSmall = fitZoom < 0.8 ? 1 : 0;

  const totalViolations =
    nodeNode +
    zoneZone +
    nodeInManyZones +
    edgeThroughNode +
    edgeThroughZoneTitle +
    labelOnNode +
    labelOnLabel +
    labelOnZoneTitle +
    tooSmall;

  return {
    name,
    nodeNode,
    zoneZone,
    nodeInManyZones,
    edgeThroughNode,
    edgeThroughZoneTitle,
    labelOnNode,
    labelOnLabel,
    labelOnZoneTitle,
    tooSmall,
    fitZoom: Number(fitZoom.toFixed(2)),
    viewBox: `${Math.round(viewBox.width)}x${Math.round(viewBox.height)}`,
    pass: totalViolations === 0,
  };
}

async function run() {
  let serverProcess = null;
  const running = await isServerRunning(BASE_URL);

  if (!running) {
    try {
      serverProcess = await startDevServer();
      // wait a bit for ready
      let ready = false;
      for (let i = 0; i < 20; i++) {
        ready = await isServerRunning(BASE_URL);
        if (ready) break;
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!ready) {
        throw new Error(`Dev server did not start on ${BASE_URL}`);
      }
    } catch (e) {
      console.error('Failed to start dev server:', e.message);
      process.exit(1);
    }
  }

  console.log(`\nConnecting to Playwright Chromium on ${BASE_URL}...\n`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const results = await page.evaluate(async () => {
      // Dynamic imports from Vite dev server
      const { INITIAL_ARCHITECTURES } = await import('/src/lib/architecture-diagrams.ts');
      const { INITIAL_PORTFOLIO_PROJECTS } = await import('/src/lib/portfolio-projects.ts');
      const { layoutArchitectureCanvas, layoutProjectArchitecture } = await import('/src/components/architecture/shared/layout.ts');

      const outputs = [];

      // 1-8: Canvas Architectures
      for (const arch of INITIAL_ARCHITECTURES) {
        const layout = layoutArchitectureCanvas(arch.diagram_data, { autoLayout: true });
        outputs.push({
          type: 'canvas',
          id: arch.slug || arch.id,
          name: arch.title,
          layout: {
            nodes: layout.nodes,
            edges: layout.edges,
            zones: layout.zones,
            viewBox: layout.viewBox,
          },
        });
      }

      // 9-14: Project Architecture Quick Diagrams
      for (const proj of INITIAL_PORTFOLIO_PROJECTS) {
        if (proj.architecture_data) {
          const layout = layoutProjectArchitecture(proj.architecture_data);
          outputs.push({
            type: 'project',
            id: proj.slug,
            name: `${proj.title} (quick)`,
            layout: {
              nodes: layout.nodes,
              edges: layout.edges,
              zones: layout.zones,
              viewBox: layout.viewBox,
            },
          });
        }
      }

      return outputs;
    });

    console.log(`Measured ${results.length} diagrams:\n`);

    const measuredResults = results.map((d) => measureDiagram(d.layout, d.name));

    console.table(
      measuredResults.map((r) => ({
        Diagram: r.name.length > 28 ? r.name.slice(0, 26) + '...' : r.name,
        'N-N': r.nodeNode,
        'Z-Z': r.zoneZone,
        'N-in-Z': r.nodeInManyZones,
        'E-thru-N': r.edgeThroughNode,
        'E-thru-ZT': r.edgeThroughZoneTitle,
        'L-on-N': r.labelOnNode,
        'L-on-L': r.labelOnLabel,
        'L-on-ZT': r.labelOnZoneTitle,
        Zoom: r.fitZoom,
        Box: r.viewBox,
        Status: r.pass ? 'PASS' : 'FAIL',
      }))
    );

    const failures = measuredResults.filter((r) => !r.pass);
    if (failures.length === 0) {
      console.log('\n✅ PASS: All 14 diagrams meet all quality gate metrics.\n');
      process.exitCode = 0;
    } else {
      console.log(`\n❌ FAIL: ${failures.length} of ${measuredResults.length} diagrams failed quality gate.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Measurement error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run();
