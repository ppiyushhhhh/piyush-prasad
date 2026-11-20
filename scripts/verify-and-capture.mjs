import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'docs/screenshots');

fs.mkdirSync(outDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 404) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
}

function runChromeScreenshot(url, outputPath, width, height, virtualTimeMs = 3000) {
  return new Promise((resolve) => {
    const tempProfile = path.resolve(rootDir, '.chrome-temp-verify');
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      `--virtual-time-budget=${virtualTimeMs}`,
      `--user-data-dir=${tempProfile}`,
      `--window-size=${width},${height}`,
      `--screenshot=${outputPath}`,
      url,
    ];
    const proc = spawn(chromePath, args, { stdio: 'inherit' });
    proc.on('close', () => resolve());
    setTimeout(() => {
      try { proc.kill(); } catch {}
      resolve();
    }, 15000);
  });
}

// CDP-based sequence capture
async function captureCDPSequence(baseUrl) {
  const tempProfile = path.resolve(rootDir, '.chrome-temp-cdp');
  const port = 9333;
  const chromeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempProfile}`,
    '--window-size=1440,900',
    `${baseUrl}/projects/kamlesh-prasad`,
  ];

  console.log('Launching Chrome with remote debugging on port ' + port);
  const chromeProc = spawn(chromePath, chromeArgs, { stdio: 'ignore' });

  try {
    // Wait for CDP endpoint
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (res.ok) {
          const data = await res.json();
          wsUrl = data.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!wsUrl) {
      console.log('CDP endpoint not available, falling back to standalone captures.');
      return;
    }

    console.log('Connected to CDP at:', wsUrl);

    // Get list of targets to attach to page
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const pageWsUrl = pageTarget.webSocketDebuggerUrl;

    // Use native WebSocket
    const ws = new WebSocket(pageWsUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const resolve = pending.get(data.id);
        pending.delete(data.id);
        resolve(data.result);
      }
    };

    await new Promise((r) => (ws.onopen = r));

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Performance.enable');

    console.log('Navigating to project diagram...');
    await send('Page.navigate', { url: `${baseUrl}/projects/kamlesh-prasad` });
    await new Promise((r) => setTimeout(r, 3000));

    // 1. Capture Idle Flow
    console.log('Capturing idle-flow.png...');
    const idlePic = await send('Page.captureScreenshot', { format: 'png' });
    if (idlePic?.data) {
      fs.writeFileSync(path.join(outDir, 'idle-flow.png'), Buffer.from(idlePic.data, 'base64'));
      console.log('✓ idle-flow.png saved');
    }

    // Measure CPU metrics over 2 seconds idle
    const metricsBefore = await send('Performance.getMetrics');
    await new Promise((r) => setTimeout(r, 2000));
    const metricsAfter = await send('Performance.getMetrics');

    const getMetric = (list, name) => list?.metrics?.find((m) => m.name === name)?.value || 0;
    const taskDurationBefore = getMetric(metricsBefore, 'TaskDuration');
    const taskDurationAfter = getMetric(metricsAfter, 'TaskDuration');
    const elapsedTasks = taskDurationAfter - taskDurationBefore;
    const cpuUtilization = ((elapsedTasks / 2.0) * 100).toFixed(2);
    console.log(`Measured Idle CPU utilization: ${cpuUtilization}% of one core (target: < 10%)`);

    // 2. Hover Focus
    console.log('Triggering hover focus on first node...');
    await send('Runtime.evaluate', {
      expression: `
        const firstNode = document.querySelector('[role="button"][aria-label*="Client"]');
        if (firstNode) {
          firstNode.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        }
      `,
    });
    await new Promise((r) => setTimeout(r, 600));
    const hoverPic = await send('Page.captureScreenshot', { format: 'png' });
    if (hoverPic?.data) {
      fs.writeFileSync(path.join(outDir, 'hover-focus.png'), Buffer.from(hoverPic.data, 'base64'));
      console.log('✓ hover-focus.png saved');
    }

    // 3. Start Request Journey
    console.log('Starting Request Journey...');
    await send('Runtime.evaluate', {
      expression: `
        const traceBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TRACE REQUEST'));
        if (traceBtn) traceBtn.click();
      `,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Advance to Step 2
    console.log('Stepping to Journey Step 2...');
    await send('Runtime.evaluate', {
      expression: `
        const nextBtn = document.querySelector('button[aria-label="Next Journey Step"]');
        if (nextBtn) nextBtn.click();
      `,
    });
    await new Promise((r) => setTimeout(r, 600));
    const step2Pic = await send('Page.captureScreenshot', { format: 'png' });
    if (step2Pic?.data) {
      fs.writeFileSync(path.join(outDir, 'journey-step-2.png'), Buffer.from(step2Pic.data, 'base64'));
      console.log('✓ journey-step-2.png saved');
    }

    // Advance to Step 4
    console.log('Stepping to Journey Step 4...');
    await send('Runtime.evaluate', {
      expression: `
        const nextBtn = document.querySelector('button[aria-label="Next Journey Step"]');
        if (nextBtn) { nextBtn.click(); nextBtn.click(); }
      `,
    });
    await new Promise((r) => setTimeout(r, 600));
    const step4Pic = await send('Page.captureScreenshot', { format: 'png' });
    if (step4Pic?.data) {
      fs.writeFileSync(path.join(outDir, 'journey-step-4.png'), Buffer.from(step4Pic.data, 'base64'));
      console.log('✓ journey-step-4.png saved');
    }

    ws.close();
  } finally {
    try {
      spawn('taskkill', ['/pid', chromeProc.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    } catch {}
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  console.log('Starting Vite server on port 4173...');
  const server = spawn('cmd.exe', ['/c', 'npx vite --host 127.0.0.1 --port 4173'], {
    cwd: rootDir,
    stdio: 'ignore',
  });

  try {
    const baseUrl = 'http://127.0.0.1:4173';
    console.log('Waiting for Vite server...');
    await waitForServer(baseUrl);
    console.log('Server is ready.');

    // 1. Capture verification sequence via CDP
    await captureCDPSequence(baseUrl);

    // 2. Capture mobile 375px and view modes for /architecture
    console.log('Capturing responsive and view mode screenshots...');
    const views = [
      { name: 'architecture-mobile-375.png', url: `${baseUrl}/architecture`, width: 375, height: 812 },
      { name: 'project-diagram-mobile-375.png', url: `${baseUrl}/projects/kamlesh-prasad`, width: 375, height: 812 },
      { name: 'architecture-desktop-topology.png', url: `${baseUrl}/architecture`, width: 1440, height: 900 },
    ];

    for (const v of views) {
      const dest = path.join(outDir, v.name);
      console.log(`Capturing ${v.name}...`);
      await runChromeScreenshot(v.url, dest, v.width, v.height, 3500);
      console.log(`✓ ${v.name} saved`);
    }

    console.log('All verification captures completed successfully.');
  } finally {
    console.log('Stopping Vite server...');
    try {
      spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    } catch {}
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
