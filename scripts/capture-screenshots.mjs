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

function captureScreenshot(url, outputPath, width, height) {
  return new Promise((resolve) => {
    const tempProfile = path.resolve(rootDir, '.chrome-temp-profile');
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=3000',
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
    console.log('Server is ready. Capturing screenshots...');

    const targets = [
      { name: 'home-projects-desktop.png', url: `${baseUrl}/`, width: 1440, height: 900 },
      { name: 'home-projects-mobile.png', url: `${baseUrl}/`, width: 375, height: 812 },
      { name: 'projects-desktop.png', url: `${baseUrl}/projects`, width: 1440, height: 900 },
      { name: 'projects-mobile.png', url: `${baseUrl}/projects`, width: 375, height: 812 },
      { name: 'project-detail-desktop.png', url: `${baseUrl}/projects/kamlesh-prasad`, width: 1440, height: 900 },
      { name: 'project-detail-mobile.png', url: `${baseUrl}/projects/kamlesh-prasad`, width: 375, height: 812 },
      { name: 'architecture-desktop.png', url: `${baseUrl}/architecture`, width: 1440, height: 900 },
      { name: 'architecture-mobile.png', url: `${baseUrl}/architecture`, width: 375, height: 812 },
    ];

    for (const t of targets) {
      const dest = path.join(outDir, t.name);
      console.log(`Capturing ${t.name} (${t.width}x${t.height}) from ${t.url}...`);
      await captureScreenshot(t.url, dest, t.width, t.height);
      console.log(`✓ Processed ${t.name}`);
    }

    console.log('All screenshots processed.');
  } finally {
    console.log('Stopping Vite server...');
    try {
      spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    } catch {}
  }
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
