/**
 * audit:claims — every sentence in which CanPay describes itself is registered
 * and backed by something.
 *
 * Why: twice in September 2026 an embedding partner found pages that said one
 * thing while the code did another (privacy policy section 1 against section 2;
 * the About page saying no data leaves the device). Number gates could not see
 * it, because the errors were in prose.
 *
 * How:
 *  1. scripts/claimsExtract.mjs pulls every self-descriptive sentence from the
 *     live pages (collect, store, send, free, never, cookie, days, licence...).
 *  2. Each must appear in scripts/claims.json with what backs it:
 *       "check:<id>"   an automated check below, run now
 *       "gate:<name>"  an existing gate (audit:engine, audit:live, ...)
 *       "manual"       a commitment no script can test, with the reason;
 *                      a person re-read it against the code on "reviewed"
 *       "not-a-claim"  matched a keyword but says nothing about us
 *  3. The build fails when a page carries a sentence the register does not
 *     know (new or reworded text must be classified), when a registered
 *     sentence has vanished (clean the register), or when a check fails.
 *
 *   node scripts/liveClaims.mjs [baseUrl]            run the gate
 *   node scripts/liveClaims.mjs --unregistered       print unknown sentences as JSON
 */
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { CLAIM_PAGES, claimSentences } from './claimsExtract.mjs';

const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith('http')) || process.env.LIVE_BASE || 'https://canpayinsights.ca').replace(/\/$/, '');
const REGISTER = JSON.parse(readFileSync(new URL('./claims.json', import.meta.url), 'utf8'));
const HOST = new URL(BASE).host;

// Every host the main site is allowed to load from, and why (privacy policy §4).
const ALLOWED_HOSTS = new Set([
  HOST,
  'static.cloudflareinsights.com', // Cloudflare Web Analytics beacon script
  'cloudflareinsights.com',        // its cookieless beacon endpoint
  'avowd-analytics.qharbert.workers.dev', // our own cookieless page counter
]);
// Every key the site may keep in the browser (privacy policy §4 lists each).
const DISCLOSED_STORAGE = new Set([
  'canpay_lang', 'canpay_user_settings', 'canpay_calculation_history', 'canpay_timesheet_entries',
  'timesheetData', 'canpay_industry', 'canpay_no_telemetry', 'canpay_fsa', 'canpay_seen',
  '_av_sid', '_av_seen', '_av_off', 'canpay_entry_path',
]);

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

async function browse(browser, path, act) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const hosts = new Set(); const cookies = []; let events = 0; let beacons = 0;
  await page.route('**/api/events**', (r) => { events++; r.abort(); });
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith('http')) hosts.add(u.host);
    if (u.host.includes('cloudflareinsights') || u.host.includes('avowd-analytics')) beacons++;
  });
  page.on('response', async (r) => { const h = await r.allHeaders().catch(() => ({})); if (h['set-cookie']) cookies.push(r.url()); });
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
  if (act) await act(page);
  await page.waitForTimeout(4500); // telemetry is debounced ~3 s
  const storage = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
  // Page-view counters also fire on unload; count what was sent while open.
  await ctx.close();
  return { hosts: [...hosts], cookies, events, beacons, storage };
}

async function calculate(page) {
  // Only the home page has the full calculator; other pages are just loaded.
  if (new URL(page.url()).pathname !== '/') return;
  // Choose the annual-salary calculator and enter a salary other than the
  // default, so a real calculation settles (defaults are never recorded).
  await page.getByRole('button', { name: /Annual Salary/ }).click();
  const input = page.locator('input[type="number"]').first();
  await input.fill('72000');
  await page.keyboard.press('Tab');
}

const CHECKS = {
  // Static facts, read from the code that decides them.
  'ten-languages': () => {
    const n = (read('lib/i18n.tsx').match(/^const (en|zh|fr): Dict = \{/gm) || []).length +
      ['es', 'pa', 'hi', 'tl', 'uk', 'ko', 'vi'].filter((l) => existsSync(new URL(`../lib/translations/${l}.ts`, import.meta.url))).length;
    return [n === 10, `${n} interface languages`];
  },
  'report-price-9': () => {
    const cents = [...read('lib/products.ts').matchAll(/amountCents:\s*(\d+)/g)].map((m) => +m[1]);
    return [cents.length === 2 && cents.every((c) => c === 900), `report prices ${cents.join(', ')} cents`];
  },
  'session-30-days': () => [/SESSION_DAYS = 30;/.test(read('lib/auth/core.ts')), 'sign-in cookie lasts 30 days'],
  'no-ip-column': () => {
    const bad = read('cloudflare/schema.sql').match(/^\s*(ip|ip_address|client_ip|user_agent|useragent)\b/gim);
    return [!bad, bad ? `schema has ${bad.join(', ')}` : 'database schema has no IP or user-agent column'];
  },
  'publish-floor-20': () => {
    const src = read('lib/d1/events.ts');
    return [/MIN_CELL = 20/.test(src) && /min_cell = 20/.test(src), 'every published cell needs at least 20'];
  },
  'products-two': () => {
    const n = (read('lib/products.ts').match(/amountCents:\s*\d+/g) || []).length;
    return [n === 2, `${n} paid products`];
  },
};

const LIVE_CHECKS = {
  'no-anon-cookies': async (b) => {
    const bad = [];
    for (const p of ['/', '/privacy', '/embed?province=ON']) bad.push(...(await browse(b, p)).cookies);
    return [bad.length === 0, bad.length ? `cookies set without sign-in: ${bad.join(', ')}` : 'no cookie without sign-in'];
  },
  'hosts-disclosed': async (b) => {
    const seen = new Set();
    for (const p of ['/', '/privacy', '/blog', '/compare-provinces']) for (const h of (await browse(b, p, p === '/' ? calculate : null)).hosts) seen.add(h);
    const extra = [...seen].filter((h) => !ALLOWED_HOSTS.has(h));
    return [extra.length === 0, extra.length ? `undisclosed hosts: ${extra.join(', ')}` : `hosts: ${[...seen].join(', ')}`];
  },
  'storage-disclosed': async (b) => {
    const r = await browse(b, '/', calculate);
    const extra = r.storage.filter((k) => !DISCLOSED_STORAGE.has(k));
    return [extra.length === 0, extra.length ? `undisclosed browser storage: ${extra.join(', ')}` : `storage keys: ${r.storage.join(', ') || 'none'}`];
  },
  'optout-silences-site': async (b) => {
    // Calculation records cannot be tested here: lib/telemetry.ts deliberately
    // ignores automated browsers (navigator.webdriver), so they send nothing
    // with or without the opt-out. The page-view counters do run in automation,
    // so they are the control: they must fire normally and stop when opted out.
    const on = await browse(b, '/', calculate);
    const off = await browse(b, '/?notelemetry=1', calculate);
    return [on.beacons > 0 && off.beacons === 0 && off.events === 0,
      `page-view requests: ${on.beacons} normally, ${off.beacons} with ?notelemetry=1`];
  },
};

// ── run ──────────────────────────────────────────────────────────────────
// The research page renders live counts that change with every calculation;
// audit:live already checks them against the page's own JSON. There, numbers
// and dates are matched as placeholders so the wording is still reviewed but
// a new count is not a new sentence. Everywhere else a changed number is a
// changed claim and must be looked at again.
const LIVE_FIGURE_PAGES = new Set(['/research/pay-calculator-behaviour']);
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const keyOf = (page, text) => page + '\u0000' + (LIVE_FIGURE_PAGES.has(page)
  ? text.replace(new RegExp(`(${MONTHS}) \\d{1,2}, \\d{4}`, 'g'), '<date>').replace(/\d[\d,.]*/g, '#')
  : text);
const known = new Map(REGISTER.claims.map((c) => [keyOf(c.page, c.text), c]));
const unknown = [];
const live = new Set();
for (const page of CLAIM_PAGES) {
  for (const text of await claimSentences(BASE, page)) {
    const key = keyOf(page, text);
    live.add(key);
    if (!known.has(key)) unknown.push({ page, text });
  }
}
if (args.includes('--unregistered')) {
  console.log(JSON.stringify(unknown, null, 1));
  process.exit(0);
}
const gone = REGISTER.claims.filter((c) => !live.has(keyOf(c.page, c.text)));

const failures = [];
const results = [];
const bad = REGISTER.claims.filter((c) => !/^(check:|gate:|manual$|not-a-claim$)/.test(c.backing) || (c.backing === 'manual' && !c.note));
for (const c of bad) failures.push(`register entry without valid backing: ${c.page} — ${c.text.slice(0, 80)}`);

const used = new Set(REGISTER.claims.filter((c) => c.backing.startsWith('check:')).map((c) => c.backing.slice(6)));
for (const id of used) if (!CHECKS[id] && !LIVE_CHECKS[id]) failures.push(`unknown check id: ${id}`);
for (const id of Object.keys(CHECKS)) if (used.has(id)) { const [ok, msg] = CHECKS[id](); results.push([ok, id, msg]); }
const browser = await chromium.launch();
try {
  for (const id of Object.keys(LIVE_CHECKS)) if (used.has(id)) {
    const [ok, msg] = await LIVE_CHECKS[id](browser); results.push([ok, id, msg]);
  }
} finally { await browser.close(); }

for (const [ok, id, msg] of results) { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${id}: ${msg}`); if (!ok) failures.push(`${id}: ${msg}`); }
for (const u of unknown) failures.push(`unregistered sentence on ${u.page}: "${u.text.slice(0, 140)}"`);
for (const g of gone) failures.push(`registered sentence no longer on ${g.page}: "${g.text.slice(0, 140)}"`);

const tally = {};
for (const c of REGISTER.claims) { const k = c.backing.split(':')[0]; tally[k] = (tally[k] || 0) + 1; }
console.log(`  register: ${REGISTER.claims.length} sentences on ${CLAIM_PAGES.length} pages — ${Object.entries(tally).map(([k, n]) => `${n} ${k}`).join(', ')}`);
if (failures.length) {
  console.error(`\nCLAIMS AUDIT FAIL — ${failures.length} problem(s):\n  ` + failures.slice(0, 40).join('\n  '));
  if (unknown.length) console.error(`\nClassify new sentences: node scripts/liveClaims.mjs --unregistered, then add them to scripts/claims.json.`);
  process.exit(1);
}
console.log('\nCLAIMS AUDIT PASS');
