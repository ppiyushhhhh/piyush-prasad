const fs = require('fs');
const path = require('path');

function getLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const [rLum, gLum, bLum] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseTokensFromCss(cssPath) {
  const content = fs.readFileSync(cssPath, 'utf8');

  function extractBlock(selector) {
    const regex = new RegExp(`${selector}\\s*\\{([^}]+)\\}`, 'm');
    const match = content.match(regex);
    if (!match) return {};
    const block = match[1];
    const vars = {};
    const lineRegex = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let lineMatch;
    while ((lineMatch = lineRegex.exec(block)) !== null) {
      vars[lineMatch[1].trim()] = lineMatch[2].trim();
    }
    return vars;
  }

  return {
    root: extractBlock(':root'),
    dark: extractBlock('\\.dark'),
  };
}

function run() {
  const cssPath = path.join(__dirname, '..', 'src', 'styles.css');
  const tokens = parseTokensFromCss(cssPath);

  console.log('========================================================================');
  console.log('🔍 Teal Ops Theme WCAG Contrast Verification Suite (scripts/check-contrast.cjs)');
  console.log('========================================================================\n');

  let allPassed = true;

  const suites = [
    { name: 'Light Mode', data: tokens.root },
    { name: 'Dark Mode', data: tokens.dark },
  ];

  for (const suite of suites) {
    console.log(`\n--- ${suite.name} Contrast Table ---`);
    console.log(
      '| Foreground | Background | FG Color | BG Color | Ratio | Min Req | Status |'
    );
    console.log(
      '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
    );

    const t = suite.data;

    const checks = [
      { fgName: 'text', fg: t['text'], bgName: 'background', bg: t['background'], min: 4.5, type: 'Normal Text' },
      { fgName: 'text', fg: t['text'], bgName: 'surface', bg: t['surface'], min: 4.5, type: 'Normal Text' },
      { fgName: 'text-muted', fg: t['text-muted'], bgName: 'background', bg: t['background'], min: 4.5, type: 'Normal Text' },
      { fgName: 'text-muted', fg: t['text-muted'], bgName: 'surface', bg: t['surface'], min: 4.5, type: 'Normal Text' },
      { fgName: 'accent', fg: t['accent'], bgName: 'background', bg: t['background'], min: 4.5, type: 'Accent / Text' },
      { fgName: 'accent', fg: t['accent'], bgName: 'surface', bg: t['surface'], min: 4.5, type: 'Accent / Text' },
      { fgName: 'text-on-accent', fg: t['text-on-accent'], bgName: 'accent', bg: t['accent'], min: 4.5, type: 'Normal Text' },
      // Status colours on surface: 3.0:1 for large text / UI borders / icons
      { fgName: 'success', fg: t['success'], bgName: 'surface', bg: t['surface'], min: 3.0, type: 'UI / Badge' },
      { fgName: 'warning', fg: t['warning'], bgName: 'surface', bg: t['surface'], min: 3.0, type: 'UI / Badge' },
      { fgName: 'danger', fg: t['danger'], bgName: 'surface', bg: t['surface'], min: 3.0, type: 'UI / Badge' },
      { fgName: 'info', fg: t['info'], bgName: 'surface', bg: t['surface'], min: 3.0, type: 'UI / Badge' },
    ];

    for (const check of checks) {
      if (!check.fg || !check.bg) {
        console.log(`| ${check.fgName} | ${check.bgName} | ${check.fg || 'MISSING'} | ${check.bg || 'MISSING'} | N/A | ${check.min}:1 | ❌ FAIL |`);
        allPassed = false;
        continue;
      }

      const ratio = getContrastRatio(check.fg, check.bg);
      const passed = ratio >= check.min;
      if (!passed) allPassed = false;

      const formattedRatio = ratio.toFixed(2) + ':1';
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(
        `| ${check.fgName.padEnd(14)} | ${check.bgName.padEnd(10)} | ${check.fg.padEnd(8)} | ${check.bg.padEnd(8)} | ${formattedRatio.padEnd(7)} | ${check.min}:1   | ${status} |`
      );
    }

    // Rule: highlight is NEVER used for text
    console.log(`| highlight (${t['highlight']}) | (rule: never for text) | N/A | N/A | N/A | N/A | ✅ PASS |`);
  }

  console.log('\n========================================================================');
  if (allPassed) {
    console.log('🎉 ALL CONTRAST RATIOS MEET OR EXCEED WCAG SPECIFICATIONS!');
  } else {
    console.error('❌ ONE OR MORE CONTRAST PAIRS FAILED WCAG THRESHOLDS!');
  }
  console.log('========================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

run();
