import fs from 'node:fs';
import { resolveLogo } from '../src/lib/tech-logo-registry.ts';

const content = fs.readFileSync('src/lib/portfolio-projects.ts', 'utf8');
const techMatches = content.match(/technologies:\s*\[([\s\S]*?)\]/g) || [];
const allTechs = new Set();
techMatches.forEach((block) => {
  const items = block.match(/"([^"]+)"/g) || [];
  items.forEach((item) => allTechs.add(item.replace(/"/g, '')));
});

const missing = [];
const resolved = [];
Array.from(allTechs).sort().forEach((t) => {
  const l = resolveLogo(t);
  if (l) resolved.push(`${t} => ${l.label} (${l.src})`);
  else missing.push(t);
});

console.log('Total unique technologies found in portfolio-projects:', allTechs.size);
console.log('Resolved count:', resolved.length);
console.log('Resolved:\n ', resolved.join('\n  '));
console.log('\nFallback count:', missing.length);
console.log('Missing/Fallback list:\n ', missing.join('\n  '));
