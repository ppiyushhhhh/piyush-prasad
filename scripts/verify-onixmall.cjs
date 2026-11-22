const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'architecture');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
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
  console.log('🚀 Verifying OnixMall 2-Lane Architecture Layout...\n');

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
    // 1. Desktop Light & Dark
    for (const mode of ['light', 'dark']) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        colorScheme: mode,
      });

      const targetUrl = `${BASE_URL}/architecture?diagram=onixmall-devsecops`;
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(600);

      const shotPath = path.join(SCREENSHOT_DIR, `onixmall-desktop-${mode}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);

      const metrics = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.node-interactive'));
        const cardElements = cards.map((c) => {
          const cardDiv = c.querySelector('[data-node-id]') || c;
          const nodeId = cardDiv.getAttribute('data-node-id') || c.getAttribute('data-node-id');
          const r = cardDiv.getBoundingClientRect();
          return { nodeId, left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
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

        // Include Docker Compose group container in targets
        const allTargetBoxes = [...cardRects];
        const groupEl = document.querySelector('[data-group-id="sec-onix-docker"]');
        if (groupEl) {
          const gr = groupEl.getBoundingClientRect();
          allTargetBoxes.push({
            nodeId: 'sec-onix-docker',
            left: gr.left,
            top: gr.top,
            right: gr.right,
            bottom: gr.bottom,
          });
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

            const srcRect = allTargetBoxes.find((cr) => cr.nodeId === srcId);
            const tgtRect = allTargetBoxes.find((cr) => cr.nodeId === tgtId);

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

              if (dSrc > 3.0 || dTgt > 3.0) {
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

        let textTruncated = 0;
        tierTitles.forEach((tt) => {
          if (tt.textContent && tt.textContent.includes('…')) textTruncated++;
          if (tt.scrollWidth > tt.clientWidth + 2) textTruncated++;
        });

        cards.forEach((card) => {
          const textEls = card.querySelectorAll('h4, p, span');
          textEls.forEach((el) => {
            if (el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) return;
            if (el.textContent && el.textContent.includes('…')) textTruncated++;
            if (el.scrollWidth > el.clientWidth + 1) textTruncated++;
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

      results.push({
        diagram: 'onixmall-devsecops',
        mode,
        viewport: '1440x900',
        ...metrics,
      });

      await page.close();
    }

    // 2. Mobile Light & Dark
    for (const mMode of ['light', 'dark']) {
      const mobilePage = await browser.newPage({
        viewport: { width: 390, height: 844 },
        colorScheme: mMode,
      });
      await mobilePage.goto(`${BASE_URL}/architecture?diagram=onixmall-devsecops`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(600);

      const shotPath = path.join(SCREENSHOT_DIR, `onixmall-mobile-${mMode}.png`);
      await mobilePage.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);

      if (mMode === 'light') {
        await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'onixmall-mobile.png') });
      }

      await mobilePage.close();
    }

    console.log('\n--- VERIFICATION RESULTS ---');
    console.table(results);

    const hasFailure = results.some(
      (r) =>
        r.cardCardOverlap > 0 ||
        r.cardTitleOverlap > 0 ||
        r.badgeOverlap > 0 ||
        r.badgePathOffsetFailures > 0 ||
        r.linesDetached > 0 ||
        r.orphanCount > 0 ||
        r.cardsWithWrongStatusDots > 0 ||
        r.textTruncated > 0
    );

    if (!hasFailure) {
      console.log('✅ ALL ONIXMALL CHECKS PASSED PERFECTLY!');
      process.exitCode = 0;
    } else {
      console.log('❌ SOME ONIXMALL CHECKS FAILED');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Error during verification:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (serverProcess) serverProcess.kill();
  }
}

run();
