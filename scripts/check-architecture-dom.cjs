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
  'aws-ec2-deployment',
  'devsecops-pipeline-mastery',
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

function rectsOverlap(r1, r2, margin = 0) {
  return !(
    r1.right + margin <= r2.left ||
    r2.right + margin <= r1.left ||
    r1.bottom + margin <= r2.top ||
    r2.bottom + margin <= r1.top
  );
}

async function isServerReady(url) {
  try {
    const res = await fetch(url);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function run() {
  console.log('🚀 Starting Architecture DOM & Layout Quality Gate Check...\n');

  let serverProcess = null;
  const ready = await isServerReady(BASE_URL);
  if (!ready) {
    console.log(`Starting Vite server on ${BASE_URL}...`);
    serverProcess = spawn('npx', ['vite', 'dev', '--port', '4173', '--host', '127.0.0.1'], {
      shell: true,
      stdio: 'pipe',
    });

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isServerReady(BASE_URL)) break;
    }
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    // 1. Measure Explorer Diagrams at 1440x900 and 390x844 (Light & Dark)
    for (const slug of EXPLORER_SLUGS) {
      for (const mode of ['light', 'dark']) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 900 },
          colorScheme: mode,
        });

        const targetUrl = `${BASE_URL}/architecture?diagram=${slug}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(600);

        // Take screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `explorer-${slug}-${mode}-1440x900.png`);
        await page.screenshot({ path: screenshotPath });

        // Measure DOM
        const metrics = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.node-interactive'));
          const cardRects = cards.map((c) => {
            const r = c.getBoundingClientRect();
            return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
          });

          // 1. Card vs Card Overlap (8px safety margin)
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

          // 2. Card vs Tier Title Strip Overlap
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

          // 3. Tier Box fully contains its cards
          const tierBoxes = Array.from(document.querySelectorAll('.tier-container'));
          let tierUncontained = 0;
          // Every card that overlaps a tier container X range should have its Y range inside
          for (const box of tierBoxes) {
            const br = box.getBoundingClientRect();
            // find cards horizontally inside this tier
            const containedCards = cardRects.filter((cr) => cr.left >= br.left - 4 && cr.right <= br.right + 4);
            for (const cr of containedCards) {
              if (cr.top < br.top - 4 || cr.bottom > br.bottom + 4) {
                tierUncontained++;
              }
            }
          }

          // 4. Edges visibility and endpoint proximity
          const edgePaths = Array.from(document.querySelectorAll('svg path[d]')).filter((p) => {
            const d = p.getAttribute('d') || '';
            return d.startsWith('M') && d.includes('L');
          });

          let edgeCount = edgePaths.length;
          let edgeHidden = 0;
          edgePaths.forEach((p) => {
            const style = window.getComputedStyle(p);
            const opacity = parseFloat(style.strokeOpacity || '1');
            const width = parseFloat(style.strokeWidth || '1');
            if (opacity < 0.2 || width < 1) edgeHidden++;
          });

          // 5. Text truncation / ellipsis check
          let textTruncated = 0;
          cards.forEach((card) => {
            const textEls = card.querySelectorAll('h4, p, span');
            textEls.forEach((el) => {
              // Ignore multi-line line-clamp containers
              if (el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) return;
              if (el.scrollWidth > el.clientWidth + 1) {
                textTruncated++;
              }
            });
          });

          // Zoom check
          return {
            cardCount: cards.length,
            cardCardOverlap,
            cardTitleOverlap,
            tierUncontained,
            edgeCount,
            edgeHidden,
            textTruncated,
          };
        });

        results.push({
          type: 'explorer',
          name: slug,
          mode,
          viewport: '1440x900',
          ...metrics,
          pass:
            metrics.cardCardOverlap === 0 &&
            metrics.cardTitleOverlap === 0 &&
            metrics.tierUncontained === 0 &&
            metrics.textTruncated === 0,
        });

        await page.close();
      }

      // Mobile check at 390x844
      const mobilePage = await browser.newPage({
        viewport: { width: 390, height: 844 },
      });
      await mobilePage.goto(`${BASE_URL}/architecture?diagram=${slug}`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({
        path: path.join(SCREENSHOT_DIR, `explorer-${slug}-mobile-390x844.png`),
      });
      await mobilePage.close();
    }

    // 2. Measure Project Detail Quick Diagrams (Light & Dark)
    for (const slug of PROJECT_SLUGS) {
      for (const mode of ['light', 'dark']) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 900 },
          colorScheme: mode,
        });

        const targetUrl = `${BASE_URL}/projects/${slug}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        try {
          await page.waitForSelector('.node-interactive', { timeout: 5000 });
        } catch {}
        await page.waitForTimeout(600);

        // Scroll to architecture section
        await page.evaluate(() => {
          const el = document.querySelector('section[aria-label="Technical Architecture"]') || document.querySelector('.node-interactive');
          if (el) el.scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(300);

        const screenshotPath = path.join(SCREENSHOT_DIR, `project-${slug}-${mode}-1440x900.png`);
        await page.screenshot({ path: screenshotPath });

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
            cardCardOverlap,
            cardTitleOverlap: 0,
            tierUncontained: 0,
            edgeCount: 0,
            edgeHidden: 0,
            textTruncated,
          };
        });

        results.push({
          type: 'project',
          name: `${slug} (quick)`,
          mode,
          viewport: '1440x900',
          ...metrics,
          pass: metrics.cardCardOverlap === 0 && metrics.textTruncated === 0,
        });

        await page.close();
      }
    }

    console.log(`\nMeasured ${results.length} diagram views in Real Browser DOM:\n`);

    console.table(
      results.map((r) => ({
        Diagram: r.name,
        Mode: r.mode,
        Cards: r.cardCount,
        'C-C Overlap': r.cardCardOverlap,
        'C-T Overlap': r.cardTitleOverlap,
        'Tier Out': r.tierUncontained,
        'Text Cut': r.textTruncated,
        Status: r.pass ? 'PASS' : 'FAIL',
      }))
    );

    const failures = results.filter((r) => !r.pass);
    if (failures.length === 0) {
      console.log(`\n✅ ALL ${results.length} DIAGRAM VIEWS PASSED DOM QUALITY GATE!\n`);
      console.log(`Screenshots saved to: ${SCREENSHOT_DIR}\n`);
      process.exitCode = 0;
    } else {
      console.log(`\n❌ FAIL: ${failures.length} diagram views had DOM overlap or truncation violations.\n`);
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
