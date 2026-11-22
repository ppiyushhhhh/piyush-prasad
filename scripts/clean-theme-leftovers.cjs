const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

const IGNORE_PATHS = [
  path.join('src', 'routeTree.gen.ts'),
  path.join('src', 'integrations', 'supabase'),
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
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Root / page level backgrounds
  content = content.replace(/min-h-screen bg-\[#FAF9F6\]/g, 'min-h-screen bg-background');
  content = content.replace(/fixed inset-0[^"]*bg-\[#FAF9F6\]/g, (m) => m.replace('bg-[#FAF9F6]', 'bg-background'));
  content = content.replace(/section[^"]*bg-\[#FAF9F6\]/g, (m) => m.replace('bg-[#FAF9F6]', 'bg-background'));

  // 2. All other bg-[#FAF9F6] to bg-surface-muted
  content = content.replace(/bg-\[#FAF9F6\]\/([0-9]+)/g, 'bg-surface-muted/$1');
  content = content.replace(/bg-\[#FAF9F6\]/g, 'bg-surface-muted');
  content = content.replace(/hover:bg-\[#FAF9F6\]/g, 'hover:bg-surface-muted');

  // 3. Raw cobalt hex #1A4BFF
  content = content.replace(/#1A4BFF/gi, '#0F766E');
  content = content.replace(/accent-\[#1A4BFF\]/gi, 'accent-accent');

  // 4. Blue / Indigo utilities
  content = content.replace(/border-blue-200\/80 bg-blue-50\/80/g, 'border-accent/30 bg-accent-soft');
  content = content.replace(/border-blue-200 bg-blue-50/g, 'border-accent/30 bg-accent-soft');
  content = content.replace(/border-blue-300/g, 'border-accent/40');
  content = content.replace(/border-blue-200/g, 'border-accent/30');
  content = content.replace(/bg-blue-50\/60/g, 'bg-accent-soft');
  content = content.replace(/bg-blue-50/g, 'bg-accent-soft');
  content = content.replace(/bg-blue-100/g, 'bg-accent-soft');
  content = content.replace(/text-blue-700/g, 'text-accent');
  content = content.replace(/text-blue-800/g, 'text-accent');
  content = content.replace(/text-blue-600/g, 'text-accent');
  content = content.replace(/bg-blue-500/g, 'bg-accent');
  content = content.replace(/bg-blue-600/g, 'bg-accent');

  content = content.replace(/text-indigo-600/g, 'text-accent');
  content = content.replace(/text-indigo-700/g, 'text-accent');
  content = content.replace(/text-indigo-800/g, 'text-accent');
  content = content.replace(/bg-indigo-600/g, 'bg-accent');
  content = content.replace(/bg-indigo-100/g, 'bg-accent-soft');
  content = content.replace(/border-indigo-200/g, 'border-accent/30');
  content = content.replace(/border-indigo-300/g, 'border-accent/40');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function run() {
  const files = getAllFiles(SRC_DIR);
  let changedCount = 0;
  for (const file of files) {
    if (cleanFile(file)) {
      changedCount++;
    }
  }
  console.log(`Cleaned ${changedCount} files of old color tokens and hex values.`);
}

run();
