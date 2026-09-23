/**
 * audit:links — every internal /blog/<slug> link in the source must reach a
 * live article or a 301 in next.config.ts.
 *
 * Found 2026-09-23: /compare-provinces and the province landing pages had
 * linked for three months to 2025 guides that were pruned in August, so every
 * "provincial guide" button on them led to a 404.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { allArticles } from '../src/content/articles-data';

const live = new Set(allArticles.map((a) => a.slug));
const cfg = readFileSync('next.config.ts', 'utf8');
const redirected = new Set([...cfg.matchAll(/source:\s*'\/blog\/([a-z0-9-]+)'/g)].map((m) => m[1]));

const files: string[] = [];
const walk = (d: string) => {
  for (const f of readdirSync(d)) {
    if (f === 'node_modules' || f.startsWith('.')) continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|md|txt)$/.test(f)) files.push(p);
  }
};
['app', 'components', 'lib', 'src', 'public/llms.txt'].forEach((p) => (statSync(p).isDirectory() ? walk(p) : files.push(p)));

const bad: string[] = [];
let n = 0;
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/\/blog\/([a-z0-9][a-z0-9-]*[a-z0-9])(?![a-z0-9-]|\/|\.(png|svg|jpg|webp))/g)) {
    n++;
    const slug = m[1];
    if (!live.has(slug) && !redirected.has(slug)) bad.push(`${f}: /blog/${slug}`);
  }
  // Slug maps that build the URL at runtime (`/blog/${slug}`)
  if (/\/blog\/\$\{/.test(text)) {
    for (const m of text.matchAll(/'([a-z0-9-]+-(?:guide|20\d\d)[a-z0-9-]*)'/g)) {
      n++;
      if (!live.has(m[1]) && !redirected.has(m[1]) && /20\d\d/.test(m[1])) bad.push(`${f}: '${m[1]}' (used in /blog/\${...})`);
    }
  }
}
if (bad.length) {
  console.error(`LINK AUDIT FAIL — ${bad.length} internal link(s) to no article:\n  ` + [...new Set(bad)].join('\n  '));
  process.exit(1);
}
console.log(`LINK AUDIT PASS — ${n} internal blog links, all reach an article or a 301.`);
