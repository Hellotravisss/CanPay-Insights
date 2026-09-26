/**
 * audit:a11y — WCAG 2.1 AA check (axe-core) on the live public pages.
 *
 * Added 2026-09-25 after an embedding partner reviewed the widget for
 * accessibility; the first full run found 276 serious contrast failures on
 * 18 pages. Fails on any "serious" or "critical" violation. Runs after every
 * deploy (text and styles only change on deploy).
 *
 *   node scripts/liveA11y.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = (process.argv[2] || process.env.LIVE_BASE || 'https://canpayinsights.ca').replace(/\/$/, '');
const PAGES = [
  '/', '/compare-provinces', '/research/pay-calculator-behaviour', '/blog',
  '/blog/minimum-wage-increases-october-2026', '/about', '/privacy', '/fr/confidentialite',
  '/terms', '/refunds', '/widget', '/embed?province=QC&lang=fr', '/wages', '/wages/finance-wages-ontario',
  '/ontario-paycheck-calculator', '/cpp-ei-calculator', '/zh', '/data', '/link-to-canpay',
];

const browser = await chromium.launch();
const failures = [];
try {
  for (const path of PAGES) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**/api/events**', (r) => r.abort()); // never add rows to the dataset
    await page.goto(BASE + path + (path.includes('?') ? '&' : '?') + 'notelemetry=1', { waitUntil: 'networkidle', timeout: 60000 });
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    for (const v of bad) for (const n of v.nodes.slice(0, 3)) failures.push(`${path}  ${v.id}: ${n.html.slice(0, 120)}`);
    console.log(`  ${bad.length ? 'FAIL' : 'ok  '} ${path}${bad.length ? '  ' + bad.map((v) => `${v.id}(${v.nodes.length})`).join(' ') : ''}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
if (failures.length) {
  console.error('\nA11Y AUDIT FAIL:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log(`\nA11Y AUDIT PASS — ${PAGES.length} live pages, no serious or critical WCAG 2.1 AA violations.`);
