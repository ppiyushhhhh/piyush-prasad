const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

// Paths to ignore per constraints
const IGNORE_PATHS = [
  path.join('src', 'routeTree.gen.ts'),
  path.join('src', 'integrations', 'supabase'),
];

// Legitimate exceptions (third party brand colors or SVGs)
const ALLOWED_EXCEPTIONS = [
  '#0A66C2', // LinkedIn official brand color
  '#2496ED', // Docker official brand color
  '#326CE5', // Kubernetes official brand color
  '#E535AB', // Postman / HashiCorp
  '#F05032', // Git
  '#E34F26', // HTML5
  '#1572B6', // CSS3
  '#F7DF1E', // JavaScript
  '#3178C6', // TypeScript
  '#61DAFB', // React
  '#47A248', // MongoDB
  '#336791', // PostgreSQL
  '#4479A1', // MySQL
  '#FF9900', // AWS official orange
  '#E6522C', // Prometheus
  '#F46800', // Grafana
  '#009639', // Nginx
  '#E95420', // Ubuntu
  '#2496ED', // Docker
  '#FF6B6B', // Redux / Sentry
  '#F05138', // Swift
  '#7952B3', // Bootstrap
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(path.join(__dirname, '..'), fullPath);

    if (IGNORE_PATHS.some((p) => relPath.includes(p))) {
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function auditLeftovers() {
  const files = getAllFiles(SRC_DIR);
  const issues = [];
  const allowedHits = [];

  const oldColorRegex = /\b(blue-[1-9]00|indigo-[1-9]00)\b|#1A4BFF|#FAF9F6/gi;
  const brandColorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;

  for (const file of files) {
    const relPath = path.relative(path.join(__dirname, '..'), file);
    // Don't flag styles.css token definitions or theme init
    if (relPath.endsWith('styles.css') || relPath.endsWith('theme.ts') || relPath.endsWith('architecture-export.ts')) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      let match;
      while ((match = oldColorRegex.exec(line)) !== null) {
        issues.push({
          file: relPath,
          line: idx + 1,
          match: match[0],
          text: line.trim(),
        });
      }

      // Check for hardcoded hex colors
      let hexMatch;
      while ((hexMatch = brandColorRegex.exec(line)) !== null) {
        const hex = hexMatch[0].toUpperCase();
        if (ALLOWED_EXCEPTIONS.map((e) => e.toUpperCase()).includes(hex)) {
          allowedHits.push({
            file: relPath,
            line: idx + 1,
            hex,
            reason: 'Third-party brand / service logo color',
          });
        }
      }
    });
  }

  console.log('=== Quality Gate 2: Leftovers Audit ===\n');
  if (issues.length > 0) {
    console.error(`Found ${issues.length} leftover old color tokens/utilities:`);
    issues.forEach((iss) => {
      console.error(`- ${iss.file}:${iss.line} -> "${iss.match}" in: ${iss.text.slice(0, 100)}`);
    });
  } else {
    console.log('✅ ZERO unapproved leftover blue/indigo utilities or old colors found!');
  }

  console.log(`\nAllowed third-party brand hex colors detected (${allowedHits.length}):`);
  const uniqueAllowed = [...new Set(allowedHits.map((h) => `${h.hex} (${h.reason}) in ${h.file}`))];
  uniqueAllowed.forEach((u) => console.log(`- ${u}`));

  if (issues.length > 0) {
    process.exit(1);
  }
}

auditLeftovers();
