/**
 * audit:minwage — the 13 minimum wages in scripts/minWages.ts against each
 * government's own page.
 *
 * WHY
 *   Minimum wages are inputs, not tax rates: the golden T4032 test cannot see
 *   them. Nunavut and the NWT both rose on 2026-09-01 and the site kept the
 *   old figures until someone happened to look. This gate looks every week and
 *   on every deploy.
 *
 * WHAT FAILS (exit 1), one line per jurisdiction, each naming the URL:
 *   MISMATCH   the page states a different current rate (or a different
 *              announced next step) than the table — a wage changed.
 *   OVERDUE    an announced increase's date has passed and the table still
 *              has the old rate, or a known adjustment date (`reviewBy`) has
 *              passed without a re-check (`verified` older than it), or a
 *              walled source's manual check is older than WALLED_MAX_AGE_DAYS.
 *   UNREADABLE the page did not load, or loaded but the extraction rule found
 *              nothing — NOT a wage change: fix the URL or the extractor.
 *   BLOCKED    a bot challenge on a source not marked `wall` (fails), or a
 *              `wall` source that now loads (fails: write its extractor).
 *   A `wall` source that is still walled is reported BLOCKED but does not
 *   fail; its date checks above still apply.
 *
 * Network gate: NOT in prebuild. Runs after deploy and weekly
 * (.github/workflows/deploy.yml, minwage-audit.yml).
 *
 *   npx tsx scripts/auditMinWage.ts              # live, exit 1 on any failure
 *   npx tsx scripts/auditMinWage.ts --selftest   # offline, saved pages in tests/minwage/
 *   npx tsx scripts/auditMinWage.ts --save-fixtures   # re-save those pages (after a URL or layout change)
 *   MINWAGE_TODAY=2027-04-02 npx tsx scripts/auditMinWage.ts   # pretend it is another day
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MIN_WAGES, WALLED_MAX_AGE_DAYS, type MinWage, type Extracted } from './minWages';

const UA = 'Mozilla/5.0 (compatible; CanPayMinWageGate/1.0; +https://canpayinsights.ca)';

// ── page → visible text ─────────────────────────────────────────────────────
const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', eacute: 'é', egrave: 'è', agrave: 'à',
  ecirc: 'ê', ccedil: 'ç', ocirc: 'ô', icirc: 'î', ucirc: 'û', Eacute: 'É',
};
export function pageText(html: string): string {
  return html
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n] ?? m)
    .replace(/[   ]/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Cloudflare / Radware interstitials served instead of the page. */
export function isChallenge(status: number, html: string): boolean {
  // Unambiguous interstitials, whatever the status (PE's Radware page is a 200).
  // "Radware Captcha Page" replaced PEI's "Radware Page" on 2026-11-10.
  if (/<title>\s*(Just a moment\.\.\.|Radware (Captcha )?Page|Attention Required)/i.test(html) || /Verifying your browser before proceeding/i.test(html)) return true;
  // Weaker markers only count on a refusal or a near-empty page.
  return /challenges\.cloudflare\.com|cf-chl-|perfdrive\.com/i.test(html) && (status === 403 || status === 503 || status === 429 || html.length < 20000);
}

// ── judging, pure (what the selftest exercises) ─────────────────────────────
export type Page = { ok: true; status: number; html: string } | { ok: false; error: string };
export type Verdict = { kind: 'OK' | 'MISMATCH' | 'OVERDUE' | 'UNREADABLE' | 'BLOCKED' | 'NOTE'; fails: boolean; msg: string };

const days = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86_400_000;
const $ = (n: number) => `$${n.toFixed(2)}`;

/** Checks that need no page: dates in the table against today. */
export function judgeDates(w: MinWage, today: string): Verdict[] {
  const out: Verdict[] = [];
  if (w.next && today >= w.next.date && w.wage !== w.next.wage)
    out.push({ kind: 'OVERDUE', fails: true, msg: `announced ${$(w.next.wage)} from ${w.next.date}, table still has ${$(w.wage)}` });
  if (w.reviewBy && today >= w.reviewBy && w.verified < w.reviewBy)
    out.push({ kind: 'OVERDUE', fails: true, msg: `adjustment date ${w.reviewBy} has passed (${w.reviewBasis}); last verified ${w.verified} — re-check the page, then update wage/effective/verified/reviewBy` });
  if (w.source.wall && days(w.verified, today) > WALLED_MAX_AGE_DAYS)
    out.push({ kind: 'OVERDUE', fails: true, msg: `source cannot be read automatically and was last checked by hand ${w.verified} (> ${WALLED_MAX_AGE_DAYS} days) — open ${w.source.url} in a browser and bump verified` });
  return out;
}

/** Checks on the fetched page. */
export function judgePage(w: MinWage, page: Page, today: string): Verdict[] {
  const url = w.source.url;
  if ('error' in page) return [{ kind: 'UNREADABLE', fails: true, msg: `could not load ${url}: ${page.error} — not a wage change; fix the URL or retry` }];
  if (isChallenge(page.status, page.html)) {
    return w.source.wall
      ? [{ kind: 'BLOCKED', fails: false, msg: `${w.source.wall} at ${url}; rate not read automatically (date checks still apply)` }]
      : [{ kind: 'BLOCKED', fails: true, msg: `bot challenge (HTTP ${page.status}) at ${url} — not a wage change; find a reachable government page` }];
  }
  if (page.status >= 500) return [{ kind: 'UNREADABLE', fails: true, msg: `HTTP ${page.status} at ${url} after 3 tries — server error; not a wage change; re-run, and fix the URL if it persists` }];
  if (page.status >= 400) return [{ kind: 'UNREADABLE', fails: true, msg: `HTTP ${page.status} at ${url} — page moved or gone; not a wage change; fix the URL` }];
  if (!w.source.extract)
    return [{ kind: 'BLOCKED', fails: true, msg: `${url} now loads (HTTP ${page.status}) but has no extractor — the wall is gone: write source.extract in scripts/minWages.ts` }];

  let got: Extracted | null = null;
  try { got = w.source.extract(pageText(page.html), today); } catch (e) { got = null; }
  if (!got) return [{ kind: 'UNREADABLE', fails: true, msg: `layout changed at ${url}: rule "${w.source.rule}" found nothing — not a wage change; fix the extractor` }];

  const out: Verdict[] = [];
  if (got.rate !== w.wage) out.push({ kind: 'MISMATCH', fails: true, msg: `page says ${$(got.rate)}${got.effective ? ` (from ${got.effective})` : ''}, table has ${$(w.wage)} — ${url}` });
  else if (got.effective && got.effective !== w.effective) out.push({ kind: 'MISMATCH', fails: true, msg: `same rate but page dates it ${got.effective}, table ${w.effective} — ${url}` });
  if (got.next) {
    if (!w.next) out.push({ kind: 'NOTE', fails: false, msg: `page announces ${$(got.next.wage)} from ${got.next.date}; add it as \`next\` (and reviewBy) in scripts/minWages.ts` });
    else if (got.next.wage !== w.next.wage || got.next.date !== w.next.date)
      out.push({ kind: 'MISMATCH', fails: true, msg: `page announces ${$(got.next.wage)} from ${got.next.date}, table's next is ${$(w.next.wage)} from ${w.next.date} — ${url}` });
  }
  if (!out.some((v) => v.fails)) out.unshift({ kind: 'OK', fails: false, msg: `${$(got.rate)} on the page` });
  return out;
}

// ── live ────────────────────────────────────────────────────────────────────
async function fetchPage(url: string): Promise<Page> {
  let last = '';
  // Government servers time out now and then (gov.nl.ca 503 and ece.gov.nt.ca
  // 504 on the first live run): retry server errors, not challenges or 4xx.
  let page: Page = { ok: false, error: 'not fetched' };
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((res) => setTimeout(res, 5000 * attempt));
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
      page = { ok: true, status: r.status, html: await r.text() };
      if (r.status < 500 || isChallenge(r.status, page.html)) return page;
    } catch (e: any) {
      last = e?.cause?.code || e?.name || String(e);
      page = { ok: false, error: last };
    }
  }
  return page;
}

function report(rows: Array<{ w: MinWage; verdicts: Verdict[] }>): number {
  let failed = 0;
  for (const { w, verdicts } of rows) {
    for (const v of verdicts) {
      if (v.fails) failed++;
      console.log(`${(v.fails ? 'FAIL ' : '     ') + v.kind.padEnd(10)} ${w.code} ${$(w.wage).padEnd(7)} ${v.msg}`);
    }
  }
  return failed;
}

async function live() {
  const today = process.env.MINWAGE_TODAY || new Date().toISOString().slice(0, 10);
  console.log(`Minimum wages vs government pages, ${today}\n`);
  const rows = await Promise.all(MIN_WAGES.map(async (w) => ({
    w, verdicts: [...judgePage(w, await fetchPage(w.source.url), today), ...judgeDates(w, today)],
  })));
  const failed = report(rows);
  console.log(failed
    ? `\n${failed} failure(s). MISMATCH/OVERDUE: a wage may have changed — update scripts/minWages.ts from the government page and regenerate. UNREADABLE/BLOCKED: the page moved or changed layout — fix the URL or extractor; the wage itself may be fine.`
    : `\nAll ${MIN_WAGES.length} minimum wages agree with their government pages (or, behind a bot wall, are within their review dates).`);
  process.exit(failed ? 1 : 0);
}

// ── selftest: saved pages, planted errors ───────────────────────────────────
function selftest() {
  const dir = join(process.cwd(), 'tests/minwage');
  const manifest: Record<string, { url: string; fetched: string; status: number; rate: number | null }> =
    JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
  let bad = 0, cases = 0;
  const expect = (label: string, verdicts: Verdict[], want: Verdict['kind'] | 'PASS') => {
    cases++;
    const fails = verdicts.filter((v) => v.fails);
    const ok = want === 'PASS' ? fails.length === 0 : fails.some((v) => v.kind === want);
    if (!ok) bad++;
    console.log(`${ok ? 'ok    ' : 'WRONG '} ${label.padEnd(54)} want ${want.padEnd(10)} got ${fails.map((v) => v.kind).join(',') || 'pass'}`);
  };

  for (const w of MIN_WAGES) {
    const m = manifest[w.code];
    if (!m) { bad++; console.log(`WRONG  ${w.code}: no saved page in tests/minwage/manifest.json`); continue; }
    if (m.url !== w.source.url) { bad++; console.log(`WRONG  ${w.code}: fixture is of ${m.url}, table reads ${w.source.url} — re-save the fixture`); continue; }
    const html = readFileSync(join(dir, `${w.code}.html`), 'utf8');
    const page: Page = { ok: true, status: m.status, html };
    // Judge against the rate the page showed when saved, not the live table, so
    // updating the table never breaks the selftest.
    const asSaved: MinWage = m.rate == null ? w : { ...w, wage: m.rate };
    if (w.source.extract) {
      const got = w.source.extract(pageText(html), m.fetched);
      const ok = got?.rate === m.rate;
      if (!ok) bad++;
      console.log(`${ok ? 'ok    ' : 'WRONG '} ${`${w.code} extractor reads the saved page`.padEnd(54)} want ${$(m.rate ?? 0).padEnd(10)} got ${got ? $(got.rate) : 'nothing'}`);
      expect(`${w.code} saved page, matching table`, judgePage({ ...asSaved, effective: got?.effective ?? asSaved.effective, next: got?.next ?? asSaved.next }, page, m.fetched), 'PASS');
      expect(`${w.code} table off by 5 cents`, judgePage({ ...asSaved, wage: +(m.rate! + 0.05).toFixed(2) }, page, m.fetched), 'MISMATCH');
      const rateText = m.rate!.toFixed(2);
      const altered = html.split(rateText).join((m.rate! + 0.4).toFixed(2)).split(rateText.replace('.', ',')).join((m.rate! + 0.4).toFixed(2).replace('.', ','))
        .split(`$${m.rate}/`).join(`$${m.rate! + 1}/`);
      expect(`${w.code} government raises the rate on the page`, judgePage(asSaved, { ok: true, status: 200, html: altered }, m.fetched), 'MISMATCH');
      expect(`${w.code} page redesigned (text gone)`, judgePage(asSaved, { ok: true, status: 200, html: '<html><body><h1>Minimum wage</h1><p>See our new page.</p></body></html>' }, m.fetched), 'UNREADABLE');
      expect(`${w.code} page 404`, judgePage(asSaved, { ok: true, status: 404, html: '<title>Not found</title>' }, m.fetched), 'UNREADABLE');
      expect(`${w.code} server error 504`, judgePage(asSaved, { ok: true, status: 504, html: '<title>Gateway Timeout</title>' }, m.fetched), 'UNREADABLE');
      expect(`${w.code} network error`, judgePage(asSaved, { ok: false, error: 'ECONNRESET' }, m.fetched), 'UNREADABLE');
      const challenge = readFileSync(join(dir, `${MIN_WAGES.find((x) => x.source.wall)!.code}.html`), 'utf8');
      expect(`${w.code} starts serving a bot challenge`, judgePage(asSaved, { ok: true, status: 403, html: challenge }, m.fetched), 'BLOCKED');
    } else {
      expect(`${w.code} saved challenge page (walled source)`, judgePage(w, page, m.fetched), 'PASS');
      const blocked = judgePage(w, page, m.fetched);
      if (!blocked.some((v) => v.kind === 'BLOCKED')) { bad++; console.log(`WRONG  ${w.code}: walled page not reported as BLOCKED`); }
      expect(`${w.code} wall comes down`, judgePage(w, { ok: true, status: 200, html: '<p>Minimum wage is $99.00</p>' }, m.fetched), 'BLOCKED');
    }
  }

  // 2026-11-10: PEI changed its wall to a captcha page (HTTP 200, a title the gate did not know),
  // and the gate reported "the wall is gone" for two deploys while the wage had not moved.
  const pe = MIN_WAGES.find((w) => w.code === 'PE')!;
  const captcha = readFileSync(join(dir, 'PE-captcha.html'), 'utf8');
  expect('PE wall changes to the Radware captcha page', judgePage(pe, { ok: true, status: 200, html: captcha }, '2026-11-10'), 'PASS');
  const ns = MIN_WAGES.find((w) => w.code === 'NS')!;
  expect('NS starts serving the Radware captcha page', judgePage(ns, { ok: true, status: 200, html: captcha }, '2026-11-10'), 'BLOCKED');

  // Date checks — the 2026-09-01 failure, replayed.
  const nu = MIN_WAGES.find((w) => w.code === 'NU')!;
  const nuAug: MinWage = { ...nu, wage: 19.75, effective: '2025-09-01', verified: '2026-08-15', reviewBy: '2026-09-01', next: { wage: 20.17, date: '2026-09-01' } };
  expect('NU 2026-08-31: increase announced, not yet due', judgeDates(nuAug, '2026-08-31'), 'PASS');
  expect('NU 2026-09-01: increase due, table still $19.75', judgeDates(nuAug, '2026-09-01'), 'OVERDUE');
  expect('NU 2026-09-02: increase not announced, reviewBy passed', judgeDates({ ...nuAug, next: undefined }, '2026-09-02'), 'OVERDUE');
  expect('NU after the fix (wage, verified, reviewBy bumped)', judgeDates({ ...nuAug, wage: 20.17, verified: '2026-09-02', reviewBy: '2027-09-01', next: undefined }, '2026-09-02'), 'PASS');
  expect('walled source, manual check 200 days old', judgeDates({ ...nu, verified: '2026-01-01', reviewBy: null }, '2026-07-20'), 'OVERDUE');
  const ab = MIN_WAGES.find((w) => w.code === 'AB')!;
  expect('no reviewBy (Alberta), years later', judgeDates(ab, '2030-01-01'), 'PASS');
  for (const w of MIN_WAGES) expect(`${w.code} table dates, today`, judgeDates(w, '2026-11-01'), 'PASS');

  console.log(bad
    ? `\nMINWAGE SELFTEST FAIL — ${bad} case(s) wrong: the minimum-wage gate has holes.`
    : `\nMINWAGE SELFTEST PASS — ${cases} cases: all ${MIN_WAGES.filter((w) => w.source.extract).length} extractors read their saved government page; every planted mismatch, overdue date, layout change, outage and bot wall caught.`);
  process.exit(bad ? 1 : 0);
}

/** Save every source page as the selftest's fixture, with the rate it shows. */
async function saveFixtures() {
  const dir = join(process.cwd(), 'tests/minwage');
  mkdirSync(dir, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const manifest: Record<string, unknown> = {};
  for (const w of MIN_WAGES) {
    const page = await fetchPage(w.source.url);
    if ('error' in page) throw new Error(`${w.code}: ${page.error}`);
    const got = w.source.extract && !isChallenge(page.status, page.html) ? w.source.extract(pageText(page.html), today) : null;
    if (w.source.extract && !got) throw new Error(`${w.code}: extractor found nothing at ${w.source.url}; fix it before saving`);
    writeFileSync(join(dir, `${w.code}.html`), page.html);
    manifest[w.code] = { url: w.source.url, fetched: today, status: page.status, rate: got ? got.rate : null };
    console.log(`${w.code} ${page.status} ${got ? `$${got.rate.toFixed(2)}` : '(walled)'}  ${w.source.url}`);
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}

if (process.argv.includes('--selftest')) selftest();
else if (process.argv.includes('--save-fixtures')) saveFixtures();
else live();
