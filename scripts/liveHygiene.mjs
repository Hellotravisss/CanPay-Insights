#!/usr/bin/env node
/**
 * audit:hygiene — the on-site checks an outside GEO audit kept finding, run on
 * every deploy and daily instead of once a quarter.
 *
 * The Avowd audit of 2026-09-30 spent most of its findings on things a script
 * can see: two <h1>s on a page, Chinese pages declaring lang="en", llms.txt
 * leaving out the open-data pages, every sitemap date equal to the build time,
 * http serving a 200 copy, www/ redirecting to the literal "/:path*", "2025" in
 * 2026 page titles. Each check below is one of those, so none can come back
 * without a red deploy.
 *
 * Reads the LIVE site (what crawlers see), every URL in the sitemap.
 *   node scripts/liveHygiene.mjs              # exit 1 on any failure
 *   node scripts/liveHygiene.mjs --selftest   # planted failures must all be caught
 */

const BASE = process.env.HYGIENE_BASE || 'https://canpayinsights.ca';
const UA = 'Mozilla/5.0 (compatible; CanPayHygieneGate/1.0)';

// ── pure checks on one page's HTML (unit-tested by --selftest) ──────────────
export function checkPage(path, html) {
  const fails = [];
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) fails.push(`${h1} <h1> elements (want exactly 1)`);

  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] ?? '';
  if (!title) fails.push('no <title>');
  // The site template appends "| CanPay Insights"; a page that also ends its own
  // title with the brand prints it twice in a row.
  if (/CanPay Insights\s*[|\-–—]\s*CanPay Insights\s*$/.test(title)) fails.push(`title repeats the brand: "${title}"`);
  // A title that names only a past year reads as a stale page ("Hub 2025").
  // A past year beside the current one is a reference ("slowest since 2017").
  const past = title.match(/\b(20(?:1\d|2[0-5]))\b/);
  if (past && !/\b202[6-9]\b/.test(title)) fails.push(`title shows only ${past[1]}: "${title}"`);

  if (/<meta[^>]+name="robots"[^>]+noindex/i.test(html)) fails.push('sitemap page is noindex');
  const canon = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || [])[1];
  if (canon && canon.replace(/\/$/, '') !== (BASE + path).replace(/\/$/, '')) fails.push(`canonical points elsewhere: ${canon}`);

  const want = path.startsWith('/zh') ? 'zh' : path.startsWith('/fr') ? 'fr' : null;
  if (want && !new RegExp(`lang="${want}`, 'i').test(html)) fails.push(`no lang="${want}…" on a ${want} page`);

  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); } catch { fails.push('JSON-LD does not parse'); }
  }
  return fails;
}

export function checkSitemapDates(dates, today) {
  const fails = [];
  if (dates.some((d) => d.slice(0, 10) > today)) fails.push('a sitemap lastmod is in the future');
  // Build-time dates put today's date on every URL — the signal the audit flagged.
  const todays = dates.filter((d) => d.slice(0, 10) === today).length;
  if (dates.length > 20 && todays / dates.length > 0.5) fails.push(`${todays}/${dates.length} lastmod values are today: build time, not change time`);
  return fails;
}

// ── live run ───────────────────────────────────────────────────────────────
async function get(url, redirect = 'follow') {
  // One retry: a single dropped connection from the CI runner is not a site fault.
  let r;
  try { r = await fetch(url, { redirect, headers: { 'User-Agent': UA, Accept: 'text/html' } }); }
  catch { await new Promise((ok) => setTimeout(ok, 2000)); r = await fetch(url, { redirect, headers: { 'User-Agent': UA, Accept: 'text/html' } }); }
  return { status: r.status, location: r.headers.get('location'), headers: r.headers, text: redirect === 'follow' ? await r.text() : '' };
}

async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

async function live() {
  const fails = [];
  const today = new Date().toISOString().slice(0, 10);

  // Transport: one hop to https, HSTS, www root to apex root.
  const h = await get(`${BASE.replace('https:', 'http:')}/zh`, 'manual');
  if (!(h.status >= 300 && h.status < 400 && h.location?.startsWith('https://'))) fails.push(`http /zh → ${h.status} ${h.location ?? ''} (want a redirect to https)`);
  const home = await get(`${BASE}/`);
  if (!home.headers.get('strict-transport-security')) fails.push('no Strict-Transport-Security header');
  const www = await get(BASE.replace('://', '://www.') + '/', 'manual');
  if (www.location && www.location.includes(':path')) fails.push(`www root redirects to ${www.location}`);

  // Sitemap pages.
  const sm = (await get(`${BASE}/sitemap.xml`)).text;
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const dates = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  fails.push(...checkSitemapDates(dates, today).map((f) => `sitemap: ${f}`));
  const pages = await pool(urls, 8, async (u) => {
    const path = u.replace(BASE, '') || '/';
    try {
      const r = await get(u, 'manual');
      if (r.status !== 200) return [`${path}: HTTP ${r.status}${r.location ? ' → ' + r.location : ''}`];
      const full = await get(u);
      return checkPage(path, full.text).map((f) => `${path}: ${f}`);
    } catch (e) { return [`${path}: fetch failed (${e.message})`]; }
  });
  fails.push(...pages.flat());

  // llms.txt: every link answers 200 directly, and the core hubs are listed.
  const llms = (await get(`${BASE}/llms.txt`)).text;
  const links = [...new Set([...llms.matchAll(/\]\((https:\/\/canpayinsights\.ca[^)\s]*)\)/g)].map((m) => m[1]))];
  for (const hub of ['/data', '/research/pay-calculator-behaviour', '/zh', '/widget']) {
    if (!links.some((l) => l === BASE + hub)) fails.push(`llms.txt: missing ${hub}`);
  }
  const bad = await pool(links, 8, async (l) => { const r = await get(l, 'manual'); return r.status === 200 ? null : `llms.txt: ${l} → ${r.status}`; });
  fails.push(...bad.filter(Boolean));

  console.log(`checked ${urls.length} sitemap pages, ${links.length} llms.txt links`);
  return fails;
}

function selftest() {
  const ok = '<html lang="en"><title>Page | CanPay Insights</title><h1>x</h1></html>';
  const cases = [
    ['/a', '<title>A | CanPay Insights</title><h1>a</h1><h1>b</h1>', 'h1'],
    ['/a', '<title>A - CanPay Insights | CanPay Insights</title><h1>a</h1>', 'brand'],
    ['/a', '<title>Guide 2025 | CanPay Insights</title><h1>a</h1>', '2025'],
    ['/zh/x', '<html lang="en"><title>中文 | CanPay Insights</title><h1>a</h1>', 'lang'],
    ['/a', '<title>A</title><h1>a</h1><meta name="robots" content="noindex">', 'noindex'],
    ['/a', '<title>A</title><h1>a</h1><script type="application/ld+json">{bad</script>', 'JSON-LD'],
  ];
  let missed = 0;
  if (checkPage('/a', ok).length) { console.log('false alarm on a clean page:', checkPage('/a', ok)); missed++; }
  if (checkPage('/wages', '<title>Wages (2025 data) — 2026 | CanPay Insights</title><h1>w</h1>').length) { console.log('false alarm on "2025 data"'); missed++; }
  if (checkPage('/b', '<title>Wage Growth Slowest Since 2017, August 2026 | CanPay Insights</title><h1>w</h1>').length) { console.log('false alarm on a referenced year'); missed++; }
  if (checkPage('/about', '<title>About CanPay Insights — Free Canadian Take-Home Pay Calculator | CanPay Insights</title><h1>w</h1>').length) { console.log('false alarm on the brand inside a title'); missed++; }
  for (const [p, html, what] of cases) if (!checkPage(p, html).length) { console.log(`MISSED planted ${what}`); missed++; }
  const today = '2026-10-01';
  if (!checkSitemapDates(Array(30).fill(today), today).length) { console.log('MISSED build-time sitemap dates'); missed++; }
  if (checkSitemapDates(Array(30).fill('2026-09-15'), today).length) { console.log('false alarm on real dates'); missed++; }
  console.log(missed ? `HYGIENE SELFTEST FAIL — ${missed}` : 'HYGIENE SELFTEST PASS — every planted failure caught, no false alarms.');
  process.exit(missed ? 1 : 0);
}

if (process.argv.includes('--selftest')) selftest();
else {
  const fails = await live();
  if (fails.length) { console.log(`HYGIENE FAIL — ${fails.length}`); for (const f of fails) console.log('  ' + f); process.exit(1); }
  console.log('HYGIENE PASS — one h1, clean titles, right lang, indexable, valid JSON-LD on every sitemap page; https, HSTS, llms.txt links all good.');
}
