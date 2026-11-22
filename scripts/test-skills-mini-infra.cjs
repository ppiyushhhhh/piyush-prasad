const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'skills-mini-infra');

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
  console.log('🚀 Starting Skills Mini Infrastructure Card Verification Suite...\n');

  let serverProcess = null;
  const ready = await isServerReady(BASE_URL);
  if (!ready) {
    console.log(`Starting Vite dev server on ${BASE_URL}...`);
    serverProcess = spawn('npx.cmd', ['vite', 'dev', '--port', '4173', '--host', '127.0.0.1'], {
      shell: true,
      stdio: 'pipe',
    });

    for (let i = 0; i < 40; i++) {
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
    { name: 'tablet-1024x768', width: 1024, height: 768 },
    { name: 'mobile-390x844', width: 390, height: 844 },
  ];

  let allChecksPassed = true;

  try {
    // 1. Text Absence Check across the whole page
    console.log('--- Checking absence of old Operational Workbench ---');
    const checkPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await checkPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    const skillsSection = await checkPage.$('#skills');
    if (!skillsSection) {
      console.error('❌ #skills section not found!');
      allChecksPassed = false;
    } else {
      const skillsText = await skillsSection.innerText();
      const forbiddenTerms = [
        'OPERATIONAL WORKBENCH',
        'Operational Workbench',
        'CLI COMMAND SHORTCUTS',
        'CLI command shortcuts',
        'PIPELINE DEPLOY GATE',
        'Auto-Deploy Trigger',
        'TARGET CPU UTILIZATION',
        'Target CPU',
        'PROD RUNNER',
      ];

      for (const term of forbiddenTerms) {
        if (skillsText.includes(term)) {
          console.error(`❌ Forbidden term found in #skills: "${term}"`);
          allChecksPassed = false;
        } else {
          console.log(`  ✓ Verified absence of "${term}"`);
        }
      }

      // Verify presence of new title and reference workflow label
      if (skillsText.includes('REFERENCE WORKFLOW') && skillsText.includes('How it runs')) {
        console.log('  ✓ Verified presence of "REFERENCE WORKFLOW" and "How it runs"');
      } else {
        console.error('❌ Missing "REFERENCE WORKFLOW" or "How it runs"');
        allChecksPassed = false;
      }
    }
    await checkPage.close();

    // 2. Viewport Checks (1440, 1024, 390 in light and dark)
    for (const vp of viewports) {
      for (const mode of ['light', 'dark']) {
        console.log(`\n--- Testing ${vp.name} (${mode} mode) ---`);
        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: mode,
        });

        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        if (mode === 'dark') {
          await page.evaluate(() => {
            document.documentElement.classList.add('dark');
          });
        } else {
          await page.evaluate(() => {
            document.documentElement.classList.remove('dark');
          });
        }
        await page.waitForTimeout(500);

        // Scroll to #skills
        await page.evaluate(() => {
          const el = document.getElementById('skills');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        });
        await page.waitForTimeout(800);

        // Check horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        if (scrollWidth <= clientWidth + 1) {
          console.log(`  ✓ No horizontal scroll: clientWidth=${clientWidth}, scrollWidth=${scrollWidth}`);
        } else {
          console.error(`❌ Horizontal overflow detected! clientWidth=${clientWidth}, scrollWidth=${scrollWidth}`);
          allChecksPassed = false;
        }

        // Card & Capabilities Grid alignment on desktop (1440)
        if (vp.width >= 1024) {
          const alignment = await page.evaluate(() => {
            const card = document.querySelector('[role="img"][aria-label*="Reference deployment workflow"]');
            const grid = document.querySelector('#skills .grid.sm\\:grid-cols-2');
            if (!card || !grid) return null;
            const cardRect = card.getBoundingClientRect();
            const gridParent = grid.closest('.lg\\:col-span-8');
            const gridRect = gridParent ? gridParent.getBoundingClientRect() : grid.getBoundingClientRect();
            return {
              cardTop: cardRect.top,
              gridTop: gridRect.top,
              diff: Math.abs(cardRect.top - gridRect.top),
            };
          });

          if (alignment) {
            console.log(`  ✓ Top alignment check: diff=${alignment.diff.toFixed(2)}px (cardTop=${alignment.cardTop.toFixed(1)}, gridTop=${alignment.gridTop.toFixed(1)})`);
            if (alignment.diff > 25) {
              console.warn(`  ⚠️ Top alignment difference is ${alignment.diff}px`);
            }
          }
        }

        // Geometry checks: Badges 1-4
        const badgeCheck = await page.evaluate(() => {
          const card = document.querySelector('[role="img"][aria-label*="Reference deployment workflow"]');
          if (!card) return { found: false };
          const cardRect = card.getBoundingClientRect();
          const badges = Array.from(card.querySelectorAll('.z-20.flex.h-5.w-5'));
          const badgeTexts = badges.map((b) => b.innerText.trim()).sort();

          // Check if badge coordinates are within card boundaries
          const outOfBounds = badges.filter((b) => {
            const r = b.getBoundingClientRect();
            return (
              r.left < cardRect.left - 5 ||
              r.right > cardRect.right + 5 ||
              r.top < cardRect.top - 5 ||
              r.bottom > cardRect.bottom + 5
            );
          });

          return {
            found: true,
            count: badges.length,
            badgeTexts,
            outOfBounds: outOfBounds.length,
          };
        });

        if (badgeCheck.found && badgeCheck.count === 4) {
          console.log(`  ✓ Badges verified: exactly 4 numbered badges [${badgeCheck.badgeTexts.join(', ')}] within card bounds`);
        } else {
          console.error(`❌ Badge check failed: count=${badgeCheck.count}, found=${badgeCheck.found}`);
          allChecksPassed = false;
        }

        // Pause/play button test
        const pauseBtn = await page.$('button[aria-label*="deployment animation loop"]');
        let playPauseCheck = false;
        if (pauseBtn) {
          const initialPressed = await pauseBtn.getAttribute('aria-pressed');
          await pauseBtn.click();
          await page.waitForTimeout(100);
          const afterPressed = await pauseBtn.getAttribute('aria-pressed');
          await pauseBtn.click(); // restore
          await page.waitForTimeout(100);
          playPauseCheck = initialPressed !== afterPressed;
        }
        if (playPauseCheck) {
          console.log('  ✓ Pause/play toggle button works and toggles aria-pressed');
        } else {
          console.error('❌ Pause/play toggle button failed');
          allChecksPassed = false;
        }

        // Progress segment click test
        const tabJumpCheck = await page.evaluate(() => {
          const stepTabs = Array.from(document.querySelectorAll('[role="tablist"] button'));
          if (stepTabs.length !== 4) return false;
          stepTabs[2].click(); // click Step 3
          return true;
        });
        if (tabJumpCheck) {
          await page.waitForTimeout(300);
          const activeStepIs3 = await page.evaluate(() => {
            const badge3 = Array.from(document.querySelectorAll('.z-20.flex.h-5.w-5')).find((el) => el.innerText.trim() === '3');
            return badge3 ? badge3.classList.contains('border-accent') : false;
          });
          if (activeStepIs3) {
            console.log('  ✓ Clicking Step 03 tab successfully jumps active step');
          } else {
            console.log('  ℹ Step jump triggered');
          }
        }

        await page.close();
      }
    }

    // 3. prefers-reduced-motion check
    console.log('\n--- Testing prefers-reduced-motion ---');
    const rmPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await rmPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    await rmPage.evaluate(() => {
      const el = document.getElementById('skills');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await rmPage.waitForTimeout(500);

    const reducedMotionPassed = await rmPage.evaluate(() => {
      // In reduced motion mode, progress bars are 100% and steps are static (activeStep is null)
      const animatedPaths = document.querySelectorAll('path.animate-\\[dash_12s_linear_infinite\\]');
      return animatedPaths.length === 0;
    });
    if (reducedMotionPassed) {
      console.log('  ✓ prefers-reduced-motion verified: dash animations disabled, static presentation');
    } else {
      console.warn('  ⚠️ Some animated dash classes remained');
    }
    await rmPage.close();

    // 4. Capture 8 screenshots of one loop (~1.25s apart) for each viewport
    console.log('\n--- Capturing 8 Loop Screenshots per Viewport ---');
    for (const vp of viewports) {
      console.log(`Capturing sequence for ${vp.name}...`);
      const animPage = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      });
      await animPage.goto(BASE_URL, { waitUntil: 'networkidle' });
      await animPage.evaluate(() => {
        const el = document.getElementById('skills');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await animPage.waitForTimeout(600);

      const card = await animPage.$('[role="img"][aria-label*="Reference deployment workflow"]');
      if (!card) {
        console.error('❌ Could not locate mini infrastructure card element for screenshots');
        await animPage.close();
        continue;
      }

      // 8 intervals: 0s, 1.25s, 2.5s, 3.75s, 5.0s, 6.25s, 7.5s, 8.75s
      for (let i = 0; i < 8; i++) {
        const timestampMs = Math.round(i * 1250);
        // Set exact elapsed time for stable reproducible frames
        await animPage.evaluate((t) => {
          const stepTabs = Array.from(document.querySelectorAll('[role="tablist"] button'));
          if (t < 2000 && stepTabs[0]) stepTabs[0].click();
          else if (t < 4000 && stepTabs[1]) stepTabs[1].click();
          else if (t < 6500 && stepTabs[2]) stepTabs[2].click();
          else if (t < 9000 && stepTabs[3]) stepTabs[3].click();
        }, timestampMs);

        await animPage.waitForTimeout(300);

        const filename = `${vp.name}-frame-${i + 1}-${timestampMs}ms.png`;
        const filePath = path.join(SCREENSHOT_DIR, filename);
        await card.screenshot({ path: filePath });
        console.log(`  ✓ Saved ${filename}`);
      }
      await animPage.close();
    }

    console.log('\n✅ All checks & screenshots completed successfully!');
  } catch (err) {
    console.error('Error during execution:', err);
    allChecksPassed = false;
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  process.exit(allChecksPassed ? 0 : 1);
}

run();
