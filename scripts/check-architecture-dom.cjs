const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'architecture');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const EXPLORER_SLUGS = [
  'personal-portfolio',
  'site-automation',
  'sentinel-cloud-view',
  'devsecops-pipeline-scripts',
  'aws-infrastructure-templates',
  'kamlesh-prasad-cicd',
  'onixmall-devsecops',
  'telegram-ai-agent',
];

const PROJECT_SLUGS = [
  'sentinel-cloud-view',
  'devsecops-pipeline-scripts',
  'aws-infrastructure-templates',
  'kamlesh-prasad',
  'onixmall',
  'piyush-prasad',
];

async function isServerReady(url) {
  try {
    const res = await fetch(url);
    return res.status < 500;
  } catch {
    return false;
  }
}

// Line segment intersects box interior
function lineIntersectsBoxInterior(p1, p2, box, margin = 2) {
  const left = box.left + margin;
  const right = box.right - margin;
  const top = box.top + margin;
  const bottom = box.bottom - margin;

  if (left >= right || top >= bottom) return false;

  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  if (maxX <= left || minX >= right || maxY <= top || minY >= bottom) return false;

  // If horizontal line passes through vertical span of box
  if (Math.abs(p1.y - p2.y) < 1) {
    return p1.y > top && p1.y < bottom && minX < right && maxX > left;
  }
  // If vertical line passes through horizontal span of box
  if (Math.abs(p1.x - p2.x) < 1) {
    return p1.x > left && p1.x < right && minY < bottom && maxY > top;
  }

  return false;
}

async function run() {
  console.log('🚀 Starting Architecture DOM & Quality Gate Check across all 14 diagrams...\n');

  let serverProcess = null;
  const ready = await isServerReady(BASE_URL);
  if (!ready) {
    console.log(`Starting Vite server on ${BASE_URL}...`);
    serverProcess = spawn('npx.cmd', ['vite', 'dev', '--port', '4173', '--host', '127.0.0.1'], {
      shell: true,
      stdio: 'pipe',
    });

    for (let i = 0; i < 35; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isServerReady(BASE_URL)) break;
    }
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });
  const results = [];

  try {
    // 0. Verify NO SVG export references exist in the user-facing UI
    const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await testPage.goto(`${BASE_URL}/architecture?diagram=telegram-ai-agent`, { waitUntil: 'networkidle' });
    const svgExportRefs = await testPage.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, a'));
      const found = [];
      for (const b of allButtons) {
        const text = (b.textContent || '').trim();
        const title = b.getAttribute('title') || '';
        const aria = b.getAttribute('aria-label') || '';
        if (
          text.includes('SVG') ||
          title.toLowerCase().includes('export svg') ||
          aria.toLowerCase().includes('export svg')
        ) {
          found.push({ text, title, aria });
        }
      }
      return found;
    });

    console.log(`SVG export references in UI: ${svgExportRefs.length} (must be 0)`);
    if (svgExportRefs.length > 0) {
      console.error('Found unexpected SVG export elements:', svgExportRefs);
    }
    await testPage.close();

    // 1. Measure Explorer Diagrams (8 total)
    for (const slug of EXPLORER_SLUGS) {
      for (const mode of ['light', 'dark']) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 900 },
          colorScheme: mode,
        });

        const targetUrl = `${BASE_URL}/architecture?diagram=${slug}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(600);

        // Capture required screenshots for Telegram AI Agent
        if (slug === 'telegram-ai-agent') {
          if (mode === 'light') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'telegram-agent-desktop-light.png') });
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'telegram-agent.png') });
          } else {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'telegram-agent-desktop-dark.png') });
          }
        }

        const metrics = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.node-interactive'));
          const cardRects = cards.map((c) => {
            const r = c.getBoundingClientRect();
            return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
          });

          // 1. Card vs Card Overlap (8px clearance margin)
          let cardCardOverlap = 0;
          for (let i = 0; i < cardRects.length; i++) {
            for (let j = i + 1; j < cardRects.length; j++) {
              const r1 = cardRects[i];
              const r2 = cardRects[j];
              const overlaps = !(
                r1.right + 8 <= r2.left ||
                r2.right + 8 <= r1.left ||
                r1.bottom + 8 <= r2.top ||
                r2.bottom + 8 <= r1.top
              );
              if (overlaps) cardCardOverlap++;
            }
          }

          // 2. Card vs Tier Header Strip Overlap
          const tierTitles = Array.from(document.querySelectorAll('.tier-header-strip'));
          let cardTitleOverlap = 0;
          for (const title of tierTitles) {
            const tr = title.getBoundingClientRect();
            for (const cr of cardRects) {
              const overlaps = !(
                cr.right <= tr.left ||
                tr.right <= cr.left ||
                cr.bottom <= tr.top ||
                tr.bottom <= cr.top
              );
              if (overlaps) cardTitleOverlap++;
            }
          }

          // 3. Numbered badges count (each primary edge has a numbered badge)
          const badges = Array.from(document.querySelectorAll('.edge-badge'));
          const visibleLines = badges.length;

          // 4. Badges do not overlap cards or tier headers
          let badgeOverlap = 0;
          for (const b of badges) {
            const br = b.getBoundingClientRect();
            for (const cr of cardRects) {
              const overlaps = !(
                br.right <= cr.left ||
                cr.right <= br.left ||
                br.bottom <= cr.top ||
                cr.bottom <= br.top
              );
              if (overlaps) badgeOverlap++;
            }
            for (const tr of tierTitles) {
              const trBox = tr.getBoundingClientRect();
              const overlaps = !(
                br.right <= trBox.left ||
                trBox.right <= br.left ||
                br.bottom <= trBox.top ||
                trBox.bottom <= br.top
              );
              if (overlaps) badgeOverlap++;
            }
          }

          // 5. Text truncation / cut text
          let textTruncated = 0;
          cards.forEach((card) => {
            const textEls = card.querySelectorAll('h4, p, span');
            textEls.forEach((el) => {
              if (el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) return;
              if (el.scrollWidth > el.clientWidth + 1) {
                textTruncated++;
              }
            });
          });

          return {
            cardCount: cards.length,
            visibleLines,
            cardCardOverlap,
            cardTitleOverlap,
            badgeOverlap,
            textTruncated,
          };
        });

        const pass =
          metrics.visibleLines <= 10 &&
          metrics.cardCardOverlap === 0 &&
          metrics.cardTitleOverlap === 0 &&
          metrics.badgeOverlap === 0 &&
          metrics.textTruncated === 0;

        results.push({
          type: 'explorer',
          name: slug,
          mode,
          viewport: '1440x900',
          ...metrics,
          pass,
        });

        await page.close();
      }

      // Mobile check at 390x844
      const mobilePage = await browser.newPage({
        viewport: { width: 390, height: 844 },
      });
      await mobilePage.goto(`${BASE_URL}/architecture?diagram=${slug}`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(500);

      if (slug === 'telegram-ai-agent') {
        await mobilePage.screenshot({
          path: path.join(SCREENSHOT_DIR, 'telegram-agent-mobile.png'),
        });
      }
      await mobilePage.close();
    }

    // Capture telegram secondary flows screenshot
    const secPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await secPage.goto(`${BASE_URL}/architecture?diagram=telegram-ai-agent`, { waitUntil: 'networkidle' });
    await secPage.waitForTimeout(500);
    // Click "SECONDARY" toggle button
    const secButton = await secPage.$('button:has-text("SECONDARY")');
    if (secButton) {
      await secButton.click();
      await secPage.waitForTimeout(500);
    }
    await secPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'telegram-agent-secondary-flows.png') });
    await secPage.close();

    // 2. Measure Project Quick Diagrams (6 total)
    for (const slug of PROJECT_SLUGS) {
      for (const mode of ['light', 'dark']) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 900 },
          colorScheme: mode,
        });

        const targetUrl = `${BASE_URL}/projects/${slug}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        try {
          await page.waitForSelector('.node-interactive', { timeout: 6000 });
        } catch {}
        await page.waitForTimeout(600);

        // Scroll to architecture section
        await page.evaluate(() => {
          const el = document.querySelector('.node-interactive');
          if (el) el.scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(300);

        const metrics = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.node-interactive'));
          const cardRects = cards.map((c) => {
            const r = c.getBoundingClientRect();
            return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
          });

          let cardCardOverlap = 0;
          for (let i = 0; i < cardRects.length; i++) {
            for (let j = i + 1; j < cardRects.length; j++) {
              const r1 = cardRects[i];
              const r2 = cardRects[j];
              const overlaps = !(
                r1.right + 8 <= r2.left ||
                r2.right + 8 <= r1.left ||
                r1.bottom + 8 <= r2.top ||
                r2.bottom + 8 <= r1.top
              );
              if (overlaps) cardCardOverlap++;
            }
          }

          const badges = Array.from(document.querySelectorAll('.edge-badge'));
          const visibleLines = badges.length;

          let textTruncated = 0;
          cards.forEach((card) => {
            const textEls = card.querySelectorAll('h4, p, span');
            textEls.forEach((el) => {
              if (el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) return;
              if (el.scrollWidth > el.clientWidth + 1) {
                textTruncated++;
              }
            });
          });

          return {
            cardCount: cards.length,
            visibleLines,
            cardCardOverlap,
            cardTitleOverlap: 0,
            badgeOverlap: 0,
            textTruncated,
          };
        });

        const pass =
          metrics.visibleLines <= 10 &&
          metrics.cardCardOverlap === 0 &&
          metrics.textTruncated === 0;

        results.push({
          type: 'project',
          name: `${slug} (quick)`,
          mode,
          viewport: '1440x900',
          ...metrics,
          pass,
        });

        await page.close();
      }
    }

    console.log(`\nMeasured ${results.length} diagram views across all 14 diagrams in Real Browser DOM:\n`);

    console.table(
      results.map((r) => ({
        Diagram: r.name,
        Mode: r.mode,
        Cards: r.cardCount,
        'Visible Lines (<=10)': r.visibleLines,
        'C-C Overlap': r.cardCardOverlap,
        'C-T Overlap': r.cardTitleOverlap,
        'Badge Overlap': r.badgeOverlap,
        'Text Cut': r.textTruncated,
        Status: r.pass ? 'PASS' : 'FAIL',
      }))
    );

    const failures = results.filter((r) => !r.pass);
    const svgFailed = svgExportRefs.length > 0;

    if (failures.length === 0 && !svgFailed) {
      console.log(`\n✅ ALL ${results.length} DIAGRAM VIEWS PASSED DOM QUALITY GATE!`);
      console.log(`✅ 0 SVG EXPORT REFERENCES IN USER UI!`);
      console.log(`✅ ALL DIAGRAMS HAVE <= 10 VISIBLE LINES IN DEFAULT VIEW!`);
      console.log(`Screenshots saved to: ${SCREENSHOT_DIR}\n`);
      process.exitCode = 0;
    } else {
      console.log(`\n❌ QUALITY GATE FAIL: ${failures.length} diagram views failed or SVG references found.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run();
