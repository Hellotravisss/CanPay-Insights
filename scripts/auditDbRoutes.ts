/**
 * Build gate: anything that reads the production database must render at
 * request time.
 *
 * On 2026-09-22 the public research page declared `revalidate` instead of
 * `force-dynamic`. The build prerendered it against the build machine's local
 * database — four test rows — and the live page told journalists "4
 * calculations across 0 visits" while its own JSON said 4,944. The build
 * passed, the deploy passed, and the page was wrong.
 *
 * Rule: a page.tsx or route.ts under app/ that imports lib/d1 or calls
 * payBehaviour()/loadEvents() must export `dynamic = 'force-dynamic'`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : /(^|\/)(page\.tsx|route\.ts)$/.test(p) ? [p] : [];
  });

const bad: string[] = [];
let n = 0;
for (const f of walk('app')) {
  const s = readFileSync(f, 'utf8');
  if (!/lib\/d1\/|payBehaviour\(|loadEvents\(/.test(s)) continue;
  n++;
  if (!/export const dynamic = ['"]force-dynamic['"]/.test(s)) bad.push(f);
}
if (bad.length) {
  console.log(bad.map((f) => `  ✗ ${f} reads the database but can be prerendered — add export const dynamic = 'force-dynamic'`).join('\n'));
  console.log(`\nDB ROUTE AUDIT FAIL — ${bad.length} of ${n}.`);
  process.exit(1);
}
console.log(`DB ROUTE AUDIT PASS — ${n} pages and routes that read the database all render at request time.`);
