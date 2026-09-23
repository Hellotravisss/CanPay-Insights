/**
 * audit:sitemap — the sitemap may only list pages that ask to be indexed.
 *
 * Listing a noindex page tells Google "index this" and "don't" at once; Search
 * Console then reports it as an error. For every sitemap URL whose route is a
 * static app/<path>/page.tsx, fail if that file sets `index: false`.
 */
import { existsSync, readFileSync } from 'node:fs';
import sitemap from '../app/sitemap';

async function main() {
  const entries = await sitemap();
  const bad: string[] = [];
  let checked = 0;
  for (const e of entries) {
    const path = new URL(e.url).pathname.replace(/^\/|\/$/g, '');
    const file = path ? `app/${path}/page.tsx` : 'app/page.tsx';
    if (!existsSync(file)) continue; // dynamic route (blog/[slug] etc.)
    checked++;
    if (/index:\s*false/.test(readFileSync(file, 'utf8'))) bad.push(`${e.url}  (${file})`);
  }
  if (bad.length) {
    console.error(`AUDIT FAIL — ${bad.length} noindex page(s) listed in the sitemap:\n  ` + bad.join('\n  '));
    process.exit(1);
  }
  console.log(`AUDIT PASS — ${checked} static sitemap URLs, none marked noindex.`);
}
main();
