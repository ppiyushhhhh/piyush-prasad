const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'docs/screenshots/theme-teal-ops');
fs.mkdirSync(outDir, { recursive: true });

async function waitForServer(url, timeoutMs = 30000) {
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

async function run() {
  const port = 4173;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`Checking/Starting Vite dev server on ${baseUrl}...`);
  let server = null;
  try {
    const res = await fetch(baseUrl);
    if (res.status < 500) {
      console.log('Server is already running on ' + baseUrl);
    }
  } catch {
    server = spawn('npx.cmd', ['vite', 'dev', '--port', String(port), '--host', '127.0.0.1'], {
      cwd: rootDir,
      shell: true,
      stdio: 'pipe',
    });
    server.stdout?.on('data', (d) => process.stdout.write(d));
    server.stderr?.on('data', (d) => process.stderr.write(d));
  }

  let browser;
  try {
    await waitForServer(baseUrl);
    console.log('Server is responsive. Launching Playwright Chromium...');

    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    });

    const viewports = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'mobile', width: 390, height: 844 },
    ];

    const themes = ['light', 'dark'];

    for (const vp of viewports) {
      for (const th of themes) {
        console.log(`\n--- Capturing ${vp.name.toUpperCase()} (${vp.width}x${vp.height}) in ${th.toUpperCase()} mode ---`);

        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: th,
        });

        const page = await context.newPage();

        // Helper to force theme via localStorage & document class
        const setPageTheme = async () => {
          await page.evaluate((theme) => {
            localStorage.setItem('theme', theme);
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }, th);
          await page.waitForTimeout(400);
        };

        // 1. Home (Hero)
        console.log(`Capturing View 1: Home (Hero)...`);
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
        await setPageTheme();
        await page.screenshot({ path: path.join(outDir, `01-home-hero-${vp.name}-${th}.png`) });

        // 2. Featured Projects Section
        console.log(`Capturing View 2: Featured Projects Section...`);
        const projectsEl = await page.$('#projects');
        if (projectsEl) {
          await projectsEl.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(outDir, `02-featured-projects-${vp.name}-${th}.png`) });
        } else {
          await page.screenshot({ path: path.join(outDir, `02-featured-projects-${vp.name}-${th}.png`) });
        }

        // 3. Project List (/projects)
        console.log(`Capturing View 3: Project List (/projects)...`);
        await page.goto(`${baseUrl}/projects`, { waitUntil: 'networkidle' });
        await setPageTheme();
        await page.screenshot({ path: path.join(outDir, `03-project-list-${vp.name}-${th}.png`) });

        // 4. Case Study Page (/projects/piyush-prasad)
        console.log(`Capturing View 4: Case Study Page (/projects/piyush-prasad)...`);
        await page.goto(`${baseUrl}/projects/piyush-prasad`, { waitUntil: 'networkidle' });
        await setPageTheme();
        await page.screenshot({ path: path.join(outDir, `04-case-study-${vp.name}-${th}.png`) });

        // 5. Architecture Explorer (/architecture?diagram=personal-portfolio)
        console.log(`Capturing View 5: Architecture Explorer...`);
        await page.goto(`${baseUrl}/architecture?diagram=personal-portfolio`, { waitUntil: 'networkidle' });
        await setPageTheme();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(outDir, `05-architecture-explorer-${vp.name}-${th}.png`) });

        // 6. Contact Section
        console.log(`Capturing View 6: Contact Section...`);
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
        await setPageTheme();
        const contactEl = await page.$('#contact');
        if (contactEl) {
          await contactEl.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(outDir, `06-contact-${vp.name}-${th}.png`) });
        } else {
          await page.screenshot({ path: path.join(outDir, `06-contact-${vp.name}-${th}.png`) });
        }

        // 7. AI Chat Widget Open
        console.log(`Capturing View 7: AI Chat Widget Open...`);
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
        await setPageTheme();
        const chatLauncher = await page.$('button[aria-label="Ask Piyush\'s AI assistant"]');
        if (chatLauncher) {
          await chatLauncher.click();
          await page.waitForTimeout(600);
        }
        await page.screenshot({ path: path.join(outDir, `07-ai-chat-open-${vp.name}-${th}.png`) });

        // 8. Search Dialog Open
        console.log(`Capturing View 8: Search Dialog Open...`);
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
        await setPageTheme();
        await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-command-palette')));
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, `08-search-dialog-${vp.name}-${th}.png`) });

        // 9. Admin Login (/dashboard/login)
        console.log(`Capturing View 9: Admin Login...`);
        await page.goto(`${baseUrl}/dashboard/login`, { waitUntil: 'networkidle' });
        await setPageTheme();
        await page.screenshot({ path: path.join(outDir, `09-admin-login-${vp.name}-${th}.png`) });

        await context.close();
      }
    }

    console.log('\n🎉 All 36 Teal Ops screenshots captured successfully in docs/screenshots/theme-teal-ops/!');
  } finally {
    if (browser) await browser.close();
    if (server && server.pid) {
      console.log('Shutting down Vite dev server...');
      try {
        spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
      } catch {}
    }
  }
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
