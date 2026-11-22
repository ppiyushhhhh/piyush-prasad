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

        // Capture required screenshots for Telegram AI Agent & OnixMall
        if (slug === 'telegram-ai-agent') {
          if (mode === 'light') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'telegram-agent-desktop-light.png') });
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'telegram-agent.png') });
          } else {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'telegram-agent-desktop-dark.png') });
          }
        } else if (slug === 'onixmall-devsecops') {
          if (mode === 'light') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onixmall-desktop-light.png') });
          } else {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onixmall-desktop-dark.png') });
          }
        }

        const metrics = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.node-interactive'));
          const cardElements = cards.map((c) => {
            const cardDiv = c.querySelector('[data-node-id]') || c;
            const nodeId = cardDiv.getAttribute('data-node-id') || c.getAttribute('data-node-id');
            const r = cardDiv.getBoundingClientRect();
            return {
              nodeId,
              left: r.left,
              top: r.top,
              right: r.right,
              bottom: r.bottom,
              width: r.width,
              height: r.height,
            };
          });

          const cardRects = cardElements.map((ce) => ({
            nodeId: ce.nodeId,
            left: ce.left,
            top: ce.top,
            right: ce.right,
            bottom: ce.bottom,
            width: ce.width,
            height: ce.height,
          }));

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

          // 3. Status dots: exactly 1 per card
          let cardsWithWrongStatusDots = 0;
          for (const c of cards) {
            const dots = c.querySelectorAll('.rounded-full.h-1\\.5.w-1\\.5, .rounded-full.w-1\\.5.h-1\\.5');
            if (dots.length !== 1) {
              cardsWithWrongStatusDots++;
            }
          }

          // 4. Line Ends Attached: Each visible edge path start and end points must touch source and target card border within 2.5px
          const edgePaths = Array.from(document.querySelectorAll('path[data-edge-id]'));
          let linesDetached = 0;
          const connectedNodes = new Set();

          function distToBorder(px, py, r) {
            const dx = px < r.left ? r.left - px : px > r.right ? px - r.right : 0;
            const dy = py < r.top ? r.top - py : py > r.bottom ? py - r.bottom : 0;
            if (dx === 0 && dy === 0) {
              return Math.min(px - r.left, r.right - px, py - r.top, r.bottom - py);
            }
            return Math.hypot(dx, dy);
          }

          for (const pathEl of edgePaths) {
            const srcId = pathEl.getAttribute('data-source');
            const tgtId = pathEl.getAttribute('data-target');
            if (srcId) connectedNodes.add(srcId);
            if (tgtId) connectedNodes.add(tgtId);

            const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 0;
            if (len > 0) {
              const pStart = pathEl.getPointAtLength(0);
              const pEnd = pathEl.getPointAtLength(len);

              const srcRect = cardRects.find((cr) => cr.nodeId === srcId);
              const tgtRect = cardRects.find((cr) => cr.nodeId === tgtId);

              const ctm = pathEl.getScreenCTM();
              if (ctm && srcRect && tgtRect && pathEl.ownerSVGElement) {
                const svgStart = pathEl.ownerSVGElement.createSVGPoint();
                svgStart.x = pStart.x;
                svgStart.y = pStart.y;
                const screenStart = svgStart.matrixTransform(ctm);

                const svgEnd = pathEl.ownerSVGElement.createSVGPoint();
                svgEnd.x = pEnd.x;
                svgEnd.y = pEnd.y;
                const screenEnd = svgEnd.matrixTransform(ctm);

                const dSrc = distToBorder(screenStart.x, screenStart.y, srcRect);
                const dTgt = distToBorder(screenEnd.x, screenEnd.y, tgtRect);

                if (dSrc > 2.5 || dTgt > 2.5) {
                  linesDetached++;
                }
              }
            }
          }

          // 5. Orphan nodes: each card must have >= 1 visible edge attached to it
          let orphanCount = 0;
          for (const cr of cardRects) {
            if (cr.nodeId && !connectedNodes.has(cr.nodeId)) {
              orphanCount++;
            }
          }

          // 6. Badges: offset <= 6px from its path, and 0 collisions
          const badges = Array.from(document.querySelectorAll('.edge-badge'));
          const visibleLines = badges.length;
          let badgePathOffsetFailures = 0;
          let badgeOverlap = 0;

          for (const b of badges) {
            const br = b.getBoundingClientRect();
            const bx = br.left + br.width / 2;
            const by = br.top + br.height / 2;

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

            const edgeId = b.getAttribute('data-edge-id');
            const pathEl = edgeId ? document.querySelector(`path[data-edge-id="${edgeId}"]`) : null;
            if (pathEl && pathEl.getTotalLength) {
              const ctm = pathEl.getScreenCTM();
              if (ctm && pathEl.ownerSVGElement) {
                const totalLen = pathEl.getTotalLength();
                let minD = Infinity;
                const samples = Math.max(10, Math.min(50, Math.floor(totalLen / 10)));
                for (let s = 0; s <= samples; s++) {
                  const pt = pathEl.getPointAtLength((s / samples) * totalLen);
                  const svgPt = pathEl.ownerSVGElement.createSVGPoint();
                  svgPt.x = pt.x;
                  svgPt.y = pt.y;
                  const scPt = svgPt.matrixTransform(ctm);
                  const dist = Math.hypot(scPt.x - bx, scPt.y - by);
                  if (dist < minD) minD = dist;
                }
                if (minD > 6.0) {
                  badgePathOffsetFailures++;
                }
              }
            }
          }

          // Check badge vs badge collision (min center distance 18px)
          for (let i = 0; i < badges.length; i++) {
            const r1 = badges[i].getBoundingClientRect();
            const c1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };
            for (let j = i + 1; j < badges.length; j++) {
              const r2 = badges[j].getBoundingClientRect();
              const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
              if (Math.hypot(c1.x - c2.x, c1.y - c2.y) < 18) {
                badgeOverlap++;
              }
            }
          }

          // 7. Text truncated / cut text (or ellipsis in titles/cards)
          let textTruncated = 0;
          tierTitles.forEach((tt) => {
            if (tt.textContent && tt.textContent.includes('…')) {
              textTruncated++;
            }
            if (tt.scrollWidth > tt.clientWidth + 2) {
              textTruncated++;
            }
          });

          cards.forEach((card) => {
            const textEls = card.querySelectorAll('h4, p, span');
            textEls.forEach((el) => {
              if (el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) return;
              if (el.textContent && el.textContent.includes('…')) {
                textTruncated++;
              }
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
            badgePathOffsetFailures,
            linesDetached,
            orphanCount,
            cardsWithWrongStatusDots,
            textTruncated,
          };
        });

        const pass =
          metrics.visibleLines <= 10 &&
          metrics.cardCardOverlap === 0 &&
          metrics.cardTitleOverlap === 0 &&
          metrics.badgeOverlap === 0 &&
          metrics.badgePathOffsetFailures === 0 &&
          metrics.linesDetached === 0 &&
          metrics.orphanCount === 0 &&
          metrics.cardsWithWrongStatusDots === 0 &&
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
      } else if (slug === 'onixmall-devsecops') {
        await mobilePage.screenshot({
          path: path.join(SCREENSHOT_DIR, 'onixmall-mobile.png'),
        });
      }
      await mobilePage.close();
    }

    // Capture telegram secondary flows screenshot
    const secPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await secPage.goto(`${BASE_URL}/architecture?diagram=telegram-ai-agent`, { waitUntil: 'networkidle' });
    await secPage.waitForTimeout(500);
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
          const cardElements = cards.map((c) => {
            const cardDiv = c.querySelector('[data-node-id]') || c;
            const nodeId = cardDiv.getAttribute('data-node-id') || c.getAttribute('data-node-id');
            const r = cardDiv.getBoundingClientRect();
            return {
              nodeId,
              left: r.left,
              top: r.top,
              right: r.right,
              bottom: r.bottom,
              width: r.width,
              height: r.height,
            };
          });

          const cardRects = cardElements.map((ce) => ({
            nodeId: ce.nodeId,
            left: ce.left,
            top: ce.top,
            right: ce.right,
            bottom: ce.bottom,
          }));

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

          let cardsWithWrongStatusDots = 0;
          for (const c of cards) {
            const dots = c.querySelectorAll('.rounded-full.h-1\\.5.w-1\\.5, .rounded-full.w-1\\.5.h-1\\.5');
            if (dots.length !== 1) {
              cardsWithWrongStatusDots++;
            }
          }

          const edgePaths = Array.from(document.querySelectorAll('path[data-edge-id]'));
          let linesDetached = 0;
          const connectedNodes = new Set();

          function distToBorder(px, py, r) {
            const dx = px < r.left ? r.left - px : px > r.right ? px - r.right : 0;
            const dy = py < r.top ? r.top - py : py > r.bottom ? py - r.bottom : 0;
            if (dx === 0 && dy === 0) {
              return Math.min(px - r.left, r.right - px, py - r.top, r.bottom - py);
            }
            return Math.hypot(dx, dy);
          }

          for (const pathEl of edgePaths) {
            const srcId = pathEl.getAttribute('data-source');
            const tgtId = pathEl.getAttribute('data-target');
            if (srcId) connectedNodes.add(srcId);
            if (tgtId) connectedNodes.add(tgtId);

            const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 0;
            if (len > 0) {
              const pStart = pathEl.getPointAtLength(0);
              const pEnd = pathEl.getPointAtLength(len);

              const srcRect = cardRects.find((cr) => cr.nodeId === srcId);
              const tgtRect = cardRects.find((cr) => cr.nodeId === tgtId);

              const ctm = pathEl.getScreenCTM();
              if (ctm && srcRect && tgtRect && pathEl.ownerSVGElement) {
                const svgStart = pathEl.ownerSVGElement.createSVGPoint();
                svgStart.x = pStart.x;
                svgStart.y = pStart.y;
                const screenStart = svgStart.matrixTransform(ctm);

                const svgEnd = pathEl.ownerSVGElement.createSVGPoint();
                svgEnd.x = pEnd.x;
                svgEnd.y = pEnd.y;
                const screenEnd = svgEnd.matrixTransform(ctm);

                const dSrc = distToBorder(screenStart.x, screenStart.y, srcRect);
                const dTgt = distToBorder(screenEnd.x, screenEnd.y, tgtRect);

                if (dSrc > 2.5 || dTgt > 2.5) {
                  linesDetached++;
                }
              }
            }
          }

          let orphanCount = 0;
          for (const cr of cardRects) {
            if (cr.nodeId && !connectedNodes.has(cr.nodeId)) {
              orphanCount++;
            }
          }

          const badges = Array.from(document.querySelectorAll('.edge-badge'));
          const visibleLines = badges.length;
          let badgePathOffsetFailures = 0;
          let badgeOverlap = 0;

          for (const b of badges) {
            const br = b.getBoundingClientRect();
            const bx = br.left + br.width / 2;
            const by = br.top + br.height / 2;

            for (const cr of cardRects) {
              const overlaps = !(
                br.right <= cr.left ||
                cr.right <= br.left ||
                br.bottom <= cr.top ||
                cr.bottom <= br.top
              );
              if (overlaps) badgeOverlap++;
            }

            const edgeId = b.getAttribute('data-edge-id');
            const pathEl = edgeId ? document.querySelector(`path[data-edge-id="${edgeId}"]`) : null;
            if (pathEl && pathEl.getTotalLength) {
              const ctm = pathEl.getScreenCTM();
              if (ctm && pathEl.ownerSVGElement) {
                const totalLen = pathEl.getTotalLength();
                let minD = Infinity;
                const samples = Math.max(10, Math.min(50, Math.floor(totalLen / 10)));
                for (let s = 0; s <= samples; s++) {
                  const pt = pathEl.getPointAtLength((s / samples) * totalLen);
                  const svgPt = pathEl.ownerSVGElement.createSVGPoint();
                  svgPt.x = pt.x;
                  svgPt.y = pt.y;
                  const scPt = svgPt.matrixTransform(ctm);
                  const dist = Math.hypot(scPt.x - bx, scPt.y - by);
                  if (dist < minD) minD = dist;
                }
                if (minD > 6.0) {
                  badgePathOffsetFailures++;
                }
              }
            }
          }

          let textTruncated = 0;
          cards.forEach((card) => {
            const textEls = card.querySelectorAll('h4, p, span');
            textEls.forEach((el) => {
              if (el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) return;
              if (el.textContent && el.textContent.includes('…')) {
                textTruncated++;
              }
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
            badgeOverlap,
            badgePathOffsetFailures,
            linesDetached,
            orphanCount,
            cardsWithWrongStatusDots,
            textTruncated,
          };
        });

        const pass =
          metrics.visibleLines <= 10 &&
          metrics.cardCardOverlap === 0 &&
          metrics.badgeOverlap === 0 &&
          metrics.badgePathOffsetFailures === 0 &&
          metrics.linesDetached === 0 &&
          metrics.orphanCount === 0 &&
          metrics.cardsWithWrongStatusDots === 0 &&
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
        Lines: r.visibleLines,
        'C-C Ovlp': r.cardCardOverlap,
        'C-T Ovlp': r.cardTitleOverlap,
        'Bdg Ovlp': r.badgeOverlap,
        'Bdg Off': r.badgePathOffsetFailures,
        Detached: r.linesDetached,
        Orphans: r.orphanCount,
        'Dots Err': r.cardsWithWrongStatusDots,
        'Txt Cut': r.textTruncated,
        Status: r.pass ? 'PASS' : 'FAIL',
      }))
    );

    const failures = results.filter((r) => !r.pass);
    const svgFailed = svgExportRefs.length > 0;

    if (failures.length === 0 && !svgFailed) {
      console.log(`\n✅ ALL ${results.length} DIAGRAM VIEWS PASSED DOM QUALITY GATE!`);
      console.log(`✅ 0 SVG EXPORT REFERENCES IN USER UI!`);
      console.log(`✅ ALL DIAGRAMS HAVE <= 10 VISIBLE LINES IN DEFAULT VIEW!`);
      console.log(`✅ ALL LINES ATTACHED TO CARD BORDERS (<= 2.5px gap)!`);
      console.log(`✅ ALL BADGES ON-PATH (<= 6px offset) WITH 0 COLLISIONS!`);
      console.log(`✅ 0 ORPHAN NODES ACROSS ALL 14 DIAGRAMS!`);
      console.log(`✅ EXACTLY 1 STATUS DOT PER CARD!`);
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
