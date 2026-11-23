const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'skills-mini-infra');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:4173';

async function isServerReady(url) {
  try {
    const res = await fetch(url);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function run() {
  console.log(`🚀 Starting HowItRuns validation against ${BASE_URL}...`);

  let serverProcess = null;
  if (!process.env.TEST_URL) {
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
  }

  const browser = await chromium.launch({ headless: true });

  const desktopViewports = [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1366x768', width: 1366, height: 768 },
    { name: '1280x720', width: 1280, height: 720 },
  ];

  const resultsTable = [];

  try {
    for (const vp of desktopViewports) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();

        await page.goto(`${BASE_URL}/#how-it-runs`, { waitUntil: 'networkidle' });

        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        } else {
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }

        await page.waitForTimeout(600);

        // Scroll to #how-it-runs
        await page.evaluate(() => {
          const el = document.getElementById('how-it-runs');
          if (el) el.scrollIntoView({ block: 'start' });
        });

        await page.waitForTimeout(500);

        // Measurements
        const metrics = await page.evaluate(() => {
          const el = document.getElementById('how-it-runs');
          const header = document.querySelector('header');
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const headerRect = header ? header.getBoundingClientRect() : { bottom: 0, height: 70 };
          const vh = window.innerHeight;
          const vw = window.innerWidth;
          const hasHScroll = document.documentElement.scrollWidth > vw;
          const lines = el.querySelectorAll('.hir-line').length;
          const badges = el.querySelectorAll('.hir-badge').length;
          
          return {
            cardTop: Math.round(rect.top),
            cardBottom: Math.round(rect.bottom),
            cardHeight: Math.round(rect.height),
            headerBottom: Math.round(headerRect.bottom),
            headerHeight: Math.round(headerRect.height),
            vh,
            hasHScroll,
            lines,
            badges,
            fits: rect.top >= headerRect.bottom - 1 && rect.bottom <= vh + 1,
          };
        });

        if (!metrics) throw new Error('Could not find #how-it-runs');

        console.log(`[${vp.name} - ${theme}] Top: ${metrics.cardTop}px (Header bottom: ${metrics.headerBottom}px), Bottom: ${metrics.cardBottom}px (Viewport: ${metrics.vh}px), Height: ${metrics.cardHeight}px, Fits: ${metrics.fits ? 'YES' : 'NO'}, H-Scroll: ${metrics.hasHScroll ? 'FAIL' : 'PASS'}`);

        resultsTable.push({
          viewport: vp.name,
          theme,
          cardTop: metrics.cardTop,
          cardBottom: metrics.cardBottom,
          cardHeight: metrics.cardHeight,
          viewportHeight: metrics.vh,
          headerBottom: metrics.headerBottom,
          fits: metrics.fits ? 'YES' : 'NO',
          lines: metrics.lines,
          badges: metrics.badges,
        });

        // Screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `desktop-${vp.name}-${theme}.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 Saved screenshot: ${screenshotPath}`);

        await context.close();
      }
    }

    // Mobile Check (390x844)
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        colorScheme: theme,
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/#how-it-runs`, { waitUntil: 'networkidle' });

      if (theme === 'dark') {
        await page.evaluate(() => document.documentElement.classList.add('dark'));
      } else {
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }

      await page.waitForTimeout(500);

      const mobileListCount = await page.locator('.hir-li').count();
      const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`[390x844 - ${theme}] Mobile list count: ${mobileListCount} (expected 4), H-Scroll: ${hasHScroll ? 'FAIL' : 'PASS'}`);

      const screenshotPath = path.join(SCREENSHOT_DIR, `mobile-390x844-${theme}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`📸 Saved screenshot: ${screenshotPath}`);

      await context.close();
    }

    console.log('\n=== VIEWPORT MEASUREMENT TABLE ===');
    console.table(resultsTable);

  } finally {
    await browser.close();
    if (serverProcess) serverProcess.kill();
  }
}

run().catch((err) => {
  console.error('❌ Check failed:', err);
  process.exit(1);
});
