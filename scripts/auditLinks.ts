/**
 * audit:links — every internal /blog/<slug> link in the source must reach a
 * live article or a 301 in next.config.ts; and every root-relative link inside
 * an article ("[Quebec](/quebec)") must reach a real page.
 *
 * Found 2026-09-23: /compare-provinces and the province landing pages had
 * linked for three months to 2025 guides that were pruned in August, so every
 * "provincial guide" button on them led to a 404.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { allArticles } from '../src/content/articles-data';
import sitemap from '../app/sitemap';

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
// Article bodies link to other pages too, not only /blog. Found 2026-10-26: every
// "$X salary, province by province" article linked province names to /ontario,
// /quebec… — 66 links to pages that never existed. A page is real if the sitemap
// lists it, a static app route renders it, or next.config.ts redirects it.
const pages = new Set(sitemap().map((e) => new URL(e.url).pathname.replace(/\/$/, '') || '/'));
const appRoutes = (d: string, base = ''): void => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (!statSync(p).isDirectory()) { if (/^page\.(tsx?|jsx?)$/.test(f)) pages.add(base || '/'); continue; }
    if (f.startsWith('[') || f.startsWith('_') || f === 'api') continue;
    appRoutes(p, f.startsWith('(') ? base : `${base}/${f}`);
  }
};
appRoutes('app');
// Only unconditional redirects: '/:path*' with a www host condition (and header
// rules like '/report/:path*') match any path and would pass every link.
const redirectBlock = cfg.slice(cfg.indexOf('async redirects'));
const redirectSources = [...redirectBlock.matchAll(/source:\s*'([^']+)',(?![^}]*\bhas:)/g)].map((m) => m[1]);
const redirectedPath = (path: string) => redirectSources.some((src) => src === path || (src.includes(':') && new RegExp('^' + src.replace(/:[a-z]+\*?/gi, '[^/]+') + '$').test(path)));
for (const a of allArticles) {
  const text = [a.content, a.excerpt, a.directAnswer ?? '', ...(a.faq ?? []).map((q) => q.answer)].join('\n');
  for (const m of text.matchAll(/\]\((\/[^)\s#?]*)[^)]*\)|href=["'](\/[^"'#?]*)/g)) {
    const path = ((m[1] ?? m[2]).replace(/\/$/, '') || '/');
    if (path.startsWith('/blog/') || /\.(png|svg|jpe?g|webp|csv|json|txt|pdf)$/.test(path)) continue;
    n++;
    if (!pages.has(path) && !redirectedPath(path)) bad.push(`article ${a.slug}: ${path}`);
  }
}

if (bad.length) {
  console.error(`LINK AUDIT FAIL — ${bad.length} internal link(s) to no article:\n  ` + [...new Set(bad)].join('\n  '));
  process.exit(1);
}
console.log(`LINK AUDIT PASS — ${n} internal links, all reach a page, an article or a redirect.`);
