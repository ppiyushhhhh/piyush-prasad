const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'featured-projects');

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
  console.log('🚀 Starting Featured Projects Verification & Screenshot Suite...\n');

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
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const viewports = [
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'mobile-390x844', width: 390, height: 844 },
  ];

  let allChecksPassed = true;

  try {
    for (const vp of viewports) {
      for (const mode of ['light', 'dark']) {
        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: mode,
        });

        await page.goto(`${BASE_URL}/#projects`, { waitUntil: 'networkidle' });
        await page.waitForSelector('#projects', { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Force dark mode class if mode is dark
        if (mode === 'dark') {
          await page.evaluate(() => {
            document.documentElement.classList.add('dark');
          });
          await page.waitForTimeout(300);
        } else {
          await page.evaluate(() => {
            document.documentElement.classList.remove('dark');
          });
          await page.waitForTimeout(300);
        }

        const section = await page.$('#projects');
        if (!section) {
          throw new Error('Could not find #projects section');
        }

        // Scroll section into view
        await section.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        // Capture screenshot
        const screenshotPath = path.join(
          SCREENSHOT_DIR,
          `featured-projects-${vp.name}-${mode}.png`
        );
        await section.screenshot({ path: screenshotPath });
        console.log(`📸 Saved screenshot: ${path.basename(screenshotPath)}`);

        // DOM Verifications (specifically on desktop 1440 for alignment)
        if (vp.name === 'desktop-1440x900' && mode === 'light') {
          console.log('\n--- Running Quantitative DOM Layout Checks ---');
          const results = await page.evaluate(() => {
            const sec = document.querySelector('#projects');
            if (!sec) return { error: '#projects not found' };

            // 1. Architecture Explorer text check
            const hasArchitectureExplorer = sec.textContent.includes('Architecture Explorer');

            // 2. Bottom button href check
            const ctaBtn = sec.querySelector('a[href="https://dev.piyushprasad.in/projects"]');
            const ctaBtnHref = ctaBtn ? ctaBtn.getAttribute('href') : null;

            // 3. Card heights & CTA baseline alignment
            const cards = Array.from(sec.querySelectorAll('article'));
            const cardRects = cards.map((c) => c.getBoundingClientRect());
            const cardHeights = cardRects.map((r) => Math.round(r.height));
            const allEqualHeights = cardHeights.every((h) => Math.abs(h - cardHeights[0]) <= 1);

            // View case study rows
            const footers = cards.map((c) => {
              const f = c.querySelector('div.border-t');
              return f ? f.getBoundingClientRect() : null;
            });
            const footerYs = footers.filter(Boolean).map((f) => Math.round(f.y));
            const allEqualFooterY = footerYs.every((y) => Math.abs(y - footerYs[0]) <= 1);

            // 4. Title ellipsis check
            const titles = Array.from(sec.querySelectorAll('article h3'));
            const titleEllipsis = titles.some((t) => {
              // check if scrollWidth is greater than clientWidth with overflow hidden
              return t.scrollWidth > t.clientWidth + 2;
            });

            // 5. Overlap check between status pill and logos
            let statusPillOverlap = false;
            cards.forEach((c) => {
              const pill = c.querySelector('div.relative.h-\\[120px\\] span.rounded-full');
              const logoRow = c.querySelector('div.relative.h-\\[120px\\] div.flex.items-center.justify-center');
              if (pill && logoRow) {
                const pr = pill.getBoundingClientRect();
                const lr = logoRow.getBoundingClientRect();
                // Overlap condition
                if (
                  pr.left < lr.right &&
                  pr.right > lr.left &&
                  pr.top < lr.bottom &&
                  pr.bottom > lr.top
                ) {
                  statusPillOverlap = true;
                }
              }
            });

            return {
              hasArchitectureExplorer,
              ctaBtnHref,
              cardCount: cards.length,
              cardHeights,
              allEqualHeights,
              footerYs,
              allEqualFooterY,
              titleEllipsis,
              statusPillOverlap,
            };
          });

          console.log('Results:', JSON.stringify(results, null, 2));

          if (results.hasArchitectureExplorer) {
            console.error('❌ Check Failed: "Architecture Explorer" text still present in #projects');
            allChecksPassed = false;
          } else {
            console.log('✅ Check Passed: No "Architecture Explorer" text in #projects');
          }

          if (results.ctaBtnHref === 'https://dev.piyushprasad.in/projects') {
            console.log('✅ Check Passed: CTA button href equals https://dev.piyushprasad.in/projects');
          } else {
            console.error(`❌ Check Failed: CTA button href is ${results.ctaBtnHref}`);
            allChecksPassed = false;
          }

          if (results.allEqualHeights) {
            console.log(`✅ Check Passed: All 3 cards have equal height (${results.cardHeights.join(', ')} px)`);
          } else {
            console.error(`❌ Check Failed: Card heights differ: ${results.cardHeights.join(', ')} px`);
            allChecksPassed = false;
          }

          if (results.allEqualFooterY) {
            console.log(`✅ Check Passed: "VIEW CASE STUDY" footer rows share identical Y baseline (${results.footerYs.join(', ')} px)`);
          } else {
            console.error(`❌ Check Failed: Footer Y positions differ: ${results.footerYs.join(', ')} px`);
            allChecksPassed = false;
          }

          if (!results.titleEllipsis) {
            console.log('✅ Check Passed: Titles wrap cleanly without horizontal ellipsis');
          } else {
            console.warn('⚠️ Warning: A title appears clipped or overflowing');
          }

          if (!results.statusPillOverlap) {
            console.log('✅ Check Passed: Status badges do not overlap logos');
          } else {
            console.error('❌ Check Failed: Status badge overlaps logos');
            allChecksPassed = false;
          }
        }

        // Horizontal scroll check on mobile 390
        if (vp.name === 'mobile-390x844') {
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          if (scrollWidth <= 390) {
            console.log(`✅ Check Passed (${mode}): No horizontal scroll at 390px (scrollWidth = ${scrollWidth}px)`);
          } else {
            console.error(`❌ Check Failed (${mode}): Horizontal scroll detected at 390px (scrollWidth = ${scrollWidth}px)`);
            allChecksPassed = false;
          }
        }

        await page.close();
      }
    }
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  if (allChecksPassed) {
    console.log('\n🎉 ALL FEATURED PROJECTS VERIFICATION CHECKS PASSED!');
  } else {
    console.error('\n❌ Some verification checks failed.');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Error running verification:', err);
  process.exit(1);
});
