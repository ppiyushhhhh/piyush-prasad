const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'skills-mini-infra');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:4173';

async function isServerReady(url) {
  try {
    const res = await fetch(url);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function run() {
  console.log('🚀 Starting HowItRuns validation...');

  let serverProcess = null;
  const ready = await isServerReady(BASE_URL);
  if (!ready) {
    console.log(`Starting Vite server on ${BASE_URL}...`);
    serverProcess = spawn('npx.cmd', ['vite', 'dev', '--port', '4173', '--host', '127.0.0.1'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      shell: true,
    });

    for (let i = 0; i < 35; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isServerReady(BASE_URL)) {
        console.log('Server ready!');
        break;
      }
    }
  }

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  try {
    for (const vp of viewports) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();

        await page.goto('http://localhost:4173/#skills', { waitUntil: 'networkidle' });

        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        } else {
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }

        await page.waitForTimeout(500);

        // Verify no old text exists
        const pageText = await page.evaluate(() => document.body.innerText);
        const forbidden = [
          'ALL RUNNERS ACTIVE',
          'ZERO DOWNTIME RELOAD',
          'WORKFLOW IDLE',
          'TF PLAN',
          'OPERATIONAL WORKBENCH',
        ];
        for (const f of forbidden) {
          if (pageText.includes(f)) {
            throw new Error(`Forbidden old text found: "${f}"`);
          }
        }

        // Verify .hir card exists
        const hirCard = page.locator('.hir');
        await hirCard.scrollIntoViewIfNeeded();

        // Check horizontal overflow
        const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        console.log(`[${vp.name} - ${theme}] Horizontal overflow: ${hasOverflow ? 'FAIL' : 'PASS'}`);

        if (vp.width >= 1024) {
          // Check 9 lines and 9 badges
          const lineCount = await page.locator('.hir-line').count();
          const badgeCount = await page.locator('.hir-badge').count();
          console.log(`[${vp.name} - ${theme}] SVG lines: ${lineCount} (expected 9), badges: ${badgeCount} (expected 9)`);
          if (lineCount !== 9 || badgeCount !== 9) {
            throw new Error(`Expected 9 lines and 9 badges, got ${lineCount} and ${badgeCount}`);
          }
        } else if (vp.width < 760) {
          // Check 4-step list
          const listItems = await page.locator('.hir-li').count();
          console.log(`[${vp.name} - ${theme}] Mobile list items: ${listItems} (expected 4)`);
          if (listItems !== 4) {
            throw new Error(`Expected 4 list items on mobile, got ${listItems}`);
          }
        }

        // Test Pause Button
        const pauseBtn = page.locator('.hir-btn');
        const initialPressed = await pauseBtn.getAttribute('aria-pressed');
        await pauseBtn.click();
        const afterClickPressed = await pauseBtn.getAttribute('aria-pressed');
        console.log(`[${vp.name} - ${theme}] Pause button toggled aria-pressed: ${initialPressed} -> ${afterClickPressed}`);

        // Capture screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}-${vp.width}x${vp.height}-${theme}.png`);
        await hirCard.screenshot({ path: screenshotPath });
        console.log(`📸 Saved screenshot: ${screenshotPath}`);

        await context.close();
      }
    }

    console.log('✅ ALL LOCAL CHECKS PASSED!');
  } finally {
    await browser.close();
    if (serverProcess) serverProcess.kill();
  }
}

run().catch((err) => {
  console.error('❌ Check failed:', err);
  process.exit(1);
});
