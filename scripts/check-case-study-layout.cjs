const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots', 'case-study');

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
  console.log('🚀 Starting Project Case Study Layout Verification Suite...\n');

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
    { name: 'desktop-1920x1080', width: 1920, height: 1080 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'desktop-1440x900-zoom80', width: 1440, height: 900, zoom: 0.8 },
    { name: 'laptop-1024x768', width: 1024, height: 768 },
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'mobile-390x844', width: 390, height: 844 },
  ];

  const testProjects = ['piyush-prasad', 'onixmall'];
  let allChecksPassed = true;

  try {
    for (const slug of testProjects) {
      console.log(`\n========================================`);
      console.log(`🔍 Testing Project Case Study: /projects/${slug}`);
      console.log(`========================================`);

      for (const vp of viewports) {
        console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}${vp.zoom ? ` @ ${vp.zoom * 100}% zoom` : ''}) ---`);
        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height },
        });

        const targetUrl = `${BASE_URL}/projects/${slug}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);

        if (vp.zoom) {
          await page.evaluate((z) => {
            document.body.style.zoom = String(z);
          }, vp.zoom);
          await page.waitForTimeout(500);
        }

        // 1. Check Container Alignment
        const containerBox = await page.locator('main > div.mx-auto').first().boundingBox();
        if (containerBox) {
          console.log(`  ✓ Main container width: ${Math.round(containerBox.width)}px (max-w ~1280px), left: ${Math.round(containerBox.x)}px`);
          if (containerBox.width > 1290 && !vp.zoom) {
            console.error(`  ❌ Container exceeded 1280px: ${containerBox.width}px`);
            allChecksPassed = false;
          }
        } else {
          console.error(`  ❌ Main container not found`);
          allChecksPassed = false;
        }

        // 2. Check Sidebar behavior
        const isDesktop = vp.width >= 1024;
        const sidebar = page.locator('aside');
        const sidebarVisible = await sidebar.isVisible();
        if (isDesktop) {
          if (sidebarVisible) {
            const sideBox = await sidebar.boundingBox();
            console.log(`  ✓ Desktop sidebar visible, width: ${Math.round(sideBox.width)}px, top: ${Math.round(sideBox.y)}px`);
          } else {
            console.error(`  ❌ Desktop sidebar should be visible at ${vp.width}px`);
            allChecksPassed = false;
          }
        } else {
          if (!sidebarVisible) {
            console.log(`  ✓ Sidebar correctly hidden on tablet/mobile (<1024px)`);
          } else {
            console.error(`  ❌ Sidebar should be hidden on screen <1024px`);
            allChecksPassed = false;
          }
        }

        // 3. Check Problem & Solution Equal Heights
        const problemCard = page.locator('#problem .rounded-xl, #problem.rounded-xl').first();
        const solutionCard = page.locator('#solution').first();
        if ((await problemCard.count()) > 0 && (await solutionCard.count()) > 0) {
          const pBox = await problemCard.boundingBox();
          const sBox = await solutionCard.boundingBox();
          if (pBox && sBox) {
            const heightDiff = Math.abs(pBox.height - sBox.height);
            console.log(`  ✓ Problem Card: ${Math.round(pBox.height)}px, Solution Card: ${Math.round(sBox.height)}px (diff: ${Math.round(heightDiff)}px)`);
            if (isDesktop && heightDiff > 4) {
              console.warn(`  ⚠️ Problem/Solution cards differ by ${Math.round(heightDiff)}px`);
            }
          }
        }

        // 4. Check Key Engineering Features - No Orphan Cards
        const featureCards = page.locator('#features .grid > div');
        const featureCount = await featureCards.count();
        if (featureCount > 0) {
          console.log(`  ✓ Key Features card count: ${featureCount}`);
          if (featureCount % 2 !== 0 && isDesktop) {
            const lastCard = featureCards.last();
            const lastClass = await lastCard.getAttribute('class');
            const spansFull = lastClass && (lastClass.includes('col-span-2') || lastClass.includes('col-span-full'));
            if (spansFull) {
              console.log(`  ✓ Odd card count handled: last card spans full width (no lonely orphan card)`);
            } else {
              console.warn(`  ⚠️ Odd card count (${featureCount}) without col-span-2 on last card`);
            }
          }
        }

        // 5. Check Technologies Grid & Category Captions
        const techSection = page.locator('#technologies');
        if ((await techSection.count()) > 0) {
          const techCards = techSection.locator('.grid > div');
          const techCount = await techCards.count();
          console.log(`  ✓ Tech Stack cards count: ${techCount}`);

          let hasForbiddenCaption = false;
          for (let i = 0; i < Math.min(techCount, 5); i++) {
            const caption = await techCards.nth(i).locator('span.mono').textContent();
            if (caption && caption.includes('VERIFIED COMPONENT')) {
              hasForbiddenCaption = true;
            }
          }
          if (hasForbiddenCaption) {
            console.error(`  ❌ Tech stack card contains forbidden text 'VERIFIED COMPONENT'`);
            allChecksPassed = false;
          } else {
            console.log(`  ✓ Tech stack captions use authentic categories (no 'VERIFIED COMPONENT')`);
          }
        }

        // 6. Check Architecture Diagram - ONE Full Screen Button, Continuous Tiers, No Blue Box
        const archSection = page.locator('#architecture');
        if ((await archSection.count()) > 0) {
          const fullscreenBtns = archSection.locator('button:has-text("OPEN FULL SCREEN")');
          const fsBtnCount = await fullscreenBtns.count();
          console.log(`  ✓ Architecture section 'OPEN FULL SCREEN' button count: ${fsBtnCount}`);
          if (fsBtnCount > 1) {
            console.error(`  ❌ Found duplicate 'OPEN FULL SCREEN' buttons in architecture section: ${fsBtnCount}`);
            allChecksPassed = false;
          }

          // Check that duplicate blue deep-dive box is gone
          const blueBox = archSection.locator('text="Inspect Detailed Cloud & Security Architecture"');
          if ((await blueBox.count()) > 0) {
            console.error(`  ❌ Old duplicate blue architecture banner still present`);
            allChecksPassed = false;
          } else {
            console.log(`  ✓ Old duplicate blue deep-dive banner removed`);
          }

          // Check continuous tier numbering
          const tierHeaders = archSection.locator('.tier-header-strip span');
          const tierCount = await tierHeaders.count();
          if (tierCount > 0) {
            const tiers = [];
            for (let i = 0; i < tierCount; i++) {
              tiers.push(await tierHeaders.nth(i).textContent());
            }
            console.log(`  ✓ Tiers found (${tierCount}): ${tiers.slice(0, 3).join(' | ')}...`);
            const firstTier = tiers[0] || '';
            if (firstTier.startsWith('01.') || firstTier.startsWith('01 /')) {
              console.log(`  ✓ Tiers start cleanly at continuous '01.' index`);
            }
          }
        }

        // 7. Save screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `${slug}-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`  📸 Saved screenshot: ${path.relative(process.cwd(), screenshotPath)}`);

        await page.close();
      }
    }

    console.log(`\n========================================`);
    if (allChecksPassed) {
      console.log(`🎉 ALL CASE STUDY LAYOUT CHECKS PASSED SUCCESSFULLY!`);
    } else {
      console.error(`❌ SOME CHECKS FAILED - PLEASE REVIEW LOGS ABOVE.`);
    }
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Fatal error during verification:', err);
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
