/**
 * audit:live — checks the LIVE site keeps the promises we make in writing.
 *
 * Every other gate reads source code. Ebu's audit (Sept 2026) found things no
 * source gate could see: Cloudflare injected a beacon at the edge, the research
 * page was prerendered against an empty database, a cached page disagreed with
 * its own JSON. Those only show up by loading the real pages the way a visitor
 * does, so this runs after every deploy and once a day.
 *
 * Telemetry requests are intercepted and aborted, so the check never adds rows
 * to the dataset it is auditing.
 *
 *   node scripts/livePromises.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || process.env.LIVE_BASE || 'https://canpayinsights.ca').replace(/\/$/, '');
const ORIGIN = new URL(BASE).host;
const failures = [];
const passes = [];
const check = (ok, what) => (ok ? passes : failures).push(what);

async function html(path) {
  // Accept: text/html matters: Cloudflare only injects its beacon into
  // responses it believes are HTML pages, so a bare curl sees a clean page.
  const r = await fetch(BASE + path, { headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0 canpay-live-audit' } });
  return { status: r.status, body: await r.text(), setCookie: r.headers.get('set-cookie') };
}

const browser = await chromium.launch();

async function visit(path, interact) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const requests = [];
  const cookies = [];
  let events = 0;
  await page.route('**/api/events**', (route) => { events++; route.abort(); });
  page.on('request', (r) => requests.push(r.url()));
  page.on('response', async (r) => {
    const h = await r.allHeaders().catch(() => ({}));
    if (h['set-cookie']) cookies.push(r.url());
  });
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  if (interact) await interact(page);
  await page.waitForTimeout(1500);
  const storage = await page.evaluate(() => {
    try { return Object.keys(localStorage).length + Object.keys(sessionStorage).length; } catch { return -1; }
  });
  const lang = await page.evaluate(() => document.documentElement.lang);
  await ctx.close();
  const thirdParty = requests.filter((u) => { try { return new URL(u).host !== ORIGIN && !u.startsWith('data:'); } catch { return false; } });
  return { requests, thirdParty, cookies, events, storage, lang };
}

async function typeSalary(page) {
  const input = page.locator('input').first();
  await input.fill('');
  await input.type('55000', { delay: 20 });
  await page.locator('select').first().selectOption({ index: 3 });
}

try {
  // 1. The widget: zero third-party requests, no cookies, no storage.
  const w = await visit('/embed?province=QC&lang=fr', typeSalary);
  check(w.thirdParty.length === 0, `widget loads nothing from other hosts (${w.thirdParty.join(', ') || 'none'})`);
  check(w.cookies.length === 0, `widget sets no cookies (${w.cookies.join(', ') || 'none'})`);
  check(w.storage === 0, `widget writes nothing to browser storage (${w.storage} keys)`);
  check(w.lang === 'fr', `widget declares its language (lang="${w.lang}")`);

  // 2. notelemetry=1 means not one event request, even after typing.
  const off = await visit('/embed?province=ON&notelemetry=1', typeSalary);
  check(off.events === 0, `widget with notelemetry=1 sends no events (${off.events} sent)`);

  // 3. Cloudflare edge injection: the widget HTML as served must carry no beacon.
  const eh = await html('/embed');
  check(!/cloudflareinsights|beacon\.min\.js/.test(eh.body), 'widget HTML has no Cloudflare beacon injected at the edge');
  check(!eh.setCookie, `widget HTML response sets no cookie (${eh.setCookie || 'none'})`);

  // 4. The main site does carry our own beacon (the one we disclose), exactly once.
  const home = await html('/');
  const beacons = (home.body.match(/cloudflareinsights\.com\/beacon/g) || []).length;
  check(beacons <= 1, `home page has at most one beacon (found ${beacons})`);

  // 5. Research page: the HTML shows the same n as its own JSON, and it is today's.
  const json = await (await fetch(BASE + '/research/pay-behaviour.json')).json();
  const rp = await html('/research/pay-calculator-behaviour');
  const shown = (rp.body.match(/([\d,]+) calculations/) || [])[1];
  check(shown && Number(shown.replace(/,/g, '')) === json.n, `research page n (${shown}) equals JSON n (${json.n})`);
  check(json.n >= 20, `research page is not showing an empty database (n=${json.n})`);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' });
  check(json.generated === today, `research JSON is live (generated ${json.generated}, today ${today})`);

  // 6. The private data room API refuses anyone without the key.
  for (const name of ['users', 'stats', 'journeys']) {
    const r = await fetch(`${BASE}/api/insights/${name}`);
    check(r.status === 403 || r.status === 401, `data room /api/insights/${name} refuses without key (HTTP ${r.status})`);
  }

  // 7. The sitemap never lists a page that asks not to be indexed.
  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.includes('/blog/'));
  for (const u of urls) {
    const r = await html(new URL(u).pathname);
    if (/<meta name="robots" content="[^"]*noindex/.test(r.body)) failures.push(`sitemap lists a noindex page: ${u}`);
  }
  passes.push(`sitemap: ${urls.length} non-blog URLs checked for noindex`);
} finally {
  await browser.close();
}

for (const p of passes) console.log('  ok   ' + p);
for (const f of failures) console.log('  FAIL ' + f);
if (failures.length) {
  console.error(`\nLIVE AUDIT FAIL — ${failures.length} promise(s) broken on ${BASE}`);
  process.exit(1);
}
console.log(`\nLIVE AUDIT PASS — ${passes.length} checks on ${BASE}`);
