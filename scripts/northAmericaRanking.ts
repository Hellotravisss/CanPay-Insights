/**
 * North America take-home ranking: 13 provinces and territories + 51 states, one
 * single earner at five fixed US-dollar salaries, ranked by the share of gross
 * pay kept. Canada comes from this repo's engine (T4032 withholding, gated by
 * audit:engine); the US from USAPay's engine (annual liability, gated in that
 * repo), read from a sibling checkout.
 *
 *   USAPAY_CORE=… npx tsx scripts/northAmericaRanking.ts --write   rebuild the file
 *   npx tsx scripts/northAmericaRanking.ts                         build gate
 *
 * The gate always recomputes the Canadian rows, the exchange rate (from the
 * archived Bank of Canada series) and every rank. The US rows are recomputed
 * when a USAPay checkout is present (locally); in CI they are checked by
 * USAPay's own gate against the published file. A state with an open
 * rankingBlockers() gap is refused at --write, never quietly ranked.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import { PROVINCIAL_WAGES, annualFromHourly, WAGE_DATA_YEAR } from '../lib/provincialWages';
import { Province } from '../types';

const OUT = 'public/data/rankings/north-america-2026.json';
const FX_ARCHIVE = 'data-archive/boc/FXUSDCAD-2025-10-01_2026-09-30.json';
const SALARIES_USD = [40000, 60000, 80000, 100000, 150000];
// A variant with the US worker's average health premium (KFF EHBS 2025: $1,440,
// single coverage, pre-tax) was built in 81e4978 and withdrawn: whether each state
// excludes Section 125 premiums from income tax and from its payroll-contribution
// base is not verified state by state. Do not publish it until it is.
const USAPAY_CORE = process.env.USAPAY_CORE ?? join(homedir(), 'Code/Vibe_Coding/USPay/core');

type Row = { code: string; country: 'CA' | 'US'; name: string; gross: number; net: number; keptPct: number; rank?: number };

const round2 = (n: number) => Math.round(n * 100) / 100;
const pct = (net: number, gross: number) => round2((net / gross) * 100);

/** Bank of Canada 12-month average, from the archived Valet response. */
function fxFromArchive() {
  const j = JSON.parse(readFileSync(FX_ARCHIVE, 'utf8'));
  const obs: { d: string; FXUSDCAD: { v: string } }[] = j.observations;
  const mean = obs.reduce((s, o) => s + Number(o.FXUSDCAD.v), 0) / obs.length;
  return { usdcad: Math.round(mean * 10000) / 10000, days: obs.length, from: obs[0].d, to: obs[obs.length - 1].d };
}

/**
 * Shared ranks on the figure readers see (kept share to 0.1 point): nine
 * no-wage-tax states that print 84.0% must not read 1st…9th. Standard
 * competition ranking — 1, 1, 3 — so a rank still says how many are ahead.
 */
function rank(rows: Row[], key: (r: Row) => number): Row[] {
  const shown = (r: Row) => Math.round(key(r) * 10);
  const sorted = [...rows].sort((a, b) => key(b) - key(a) || a.code.localeCompare(b.code));
  return sorted.map((r, i) => ({ ...r, rank: sorted.findIndex((s) => shown(s) === shown(r)) + 1 }));
}

const provinceCode = (p: Province) => Object.entries(Province).find(([, v]) => v === p)![0];

function canadaRow(slug: string, grossCad: number): Row {
  const p = PROVINCE_SEO_CONFIGS.find((c) => c.slug === slug)!;
  const net = round2(getSalaryFigures(grossCad, slug).netAnnual);
  return { code: provinceCode(p.province), country: 'CA', name: p.name, gross: grossCad, net, keptPct: pct(net, grossCad) };
}

async function loadUs() {
  if (!existsSync(join(USAPAY_CORE, 'engine.ts'))) return null;
  const engine = await import(join(USAPAY_CORE, 'engine.ts'));
  const states = await import(join(USAPAY_CORE, 'states2026.ts'));
  const gaps = await import(join(USAPAY_CORE, 'rankingGaps.ts'));
  const medians = await import(join(USAPAY_CORE, 'stateMedianWage.ts'));
  const pkg = JSON.parse(readFileSync(join(USAPAY_CORE, 'package.json'), 'utf8'));
  const git = (a: string) => execSync(`git -C "${USAPAY_CORE}" ${a}`, { encoding: 'utf8' }).trim();
  return {
    version: pkg.version as string,
    commit: git('rev-parse --short HEAD'),
    dirty: git('status --porcelain -- .') !== '',
    codes: states.ALL_STATE_CODES as string[],
    name: (c: string) => states.STATE_RULES[c].name as string,
    net: (state: string, annualGross: number) =>
      round2(engine.calculateTakeHome({ annualGross, filingStatus: 'single', state, payFrequency: 'biweekly' }).netAnnual),
    blockers: (state: string, salary: number) => gaps.rankingBlockers(state, salary, 'single') as string[],
    scope: (state: string) => gaps.scopeNotes(state) as string[],
    median: (c: string) => medians.STATE_MEDIAN_WAGE[c].annual as number,
  };
}

async function build(us: NonNullable<Awaited<ReturnType<typeof loadUs>>>) {
  const fx = fxFromArchive();
  const refused: string[] = [];
  const usRow = (code: string, gross: number): Row => {
    const b = us.blockers(code, gross);
    if (b.length) refused.push(`${code} $${gross}: ${b.join(' | ')}`);
    const net = us.net(code, gross);
    return { code, country: 'US', name: us.name(code), gross, net, keptPct: pct(net, gross) };
  };

  const tiers = SALARIES_USD.map((usd) => {
    const cad = Math.round(usd * fx.usdcad);
    const ca = PROVINCE_SEO_CONFIGS.map((p) => canadaRow(p.slug, cad));
    return {
      usd, cad,
      rows: rank([...ca, ...us.codes.map((c) => usRow(c, usd))], (r) => r.keptPct),
    };
  });

  const caMedian = PROVINCE_SEO_CONFIGS
    .map((p) => ({ p, hourly: PROVINCIAL_WAGES['all-industries'][provinceCode(p.province)] }))
    .filter((x) => x.hourly)
    .map((x) => canadaRow(x.p.slug, annualFromHourly(x.hourly)));
  const usMedian = us.codes.map((c) => usRow(c, us.median(c)));

  if (refused.length) throw new Error(`open ranking gaps, refusing to rank:\n  ${refused.join('\n  ')}`);

  return {
    title: 'North America take-home ranking, 2026',
    persona: 'Single, no dependants, salary only, paid bi-weekly; no pre-tax savings; no city or county income tax.',
    method: {
      canada: 'CanPay Insights engine: CRA T4032 (July 2026 edition) and Revenu Québec TP-1015.TI withholding — federal and provincial tax, CPP/QPP, EI, QPIP. Checked row by row against the official tables.',
      us: 'USAPay Insights engine: 2026 annual liability — federal income tax, Social Security, Medicare, state income tax and statewide payroll contributions at their statutory employee rates.',
      basis: 'Canada is what the payroll withholds; the US is the tax owed for the year. For a single salary earner with no other income the two agree to within a few dollars.',
      fx: `Bank of Canada daily USD/CAD, ${fx.days}-day average ${fx.from} to ${fx.to}: ${fx.usdcad}. Canadian salaries are the US salary × this rate, rounded to the dollar.`,
      ranks: 'By share of gross kept, shown to 0.1 point; jurisdictions that print the same share share a rank (1, 1, 3).',
    },
    fx,
    engines: { canada: 'canpay-insights (this repository)', us: { package: '@usapay/engine', version: us.version, commit: us.commit } },
    tiers,
    medians: {
      note: 'Ranked within each country only: the two sources measure different things.',
      CA: { source: `Statistics Canada Table 14-10-0064-01, ${WAGE_DATA_YEAR}: median hourly wage of full-time employees, all industries, × 2,080 hours, rounded to $100. Provinces only (no territorial series).`, rows: rank(caMedian, (r) => r.keptPct) },
      US: { source: 'BLS OEWS May 2025, all occupations: median annual wage (hourly × 2,080).', rows: rank(usMedian, (r) => r.keptPct) },
    },
    scopeNotes: Object.fromEntries(us.codes.map((c) => [c, us.scope(c)]).filter(([, n]) => (n as string[]).length)),
  };
}

const sameRows = (a: Row[], b: Row[]) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  const write = process.argv.includes('--write');
  const us = await loadUs();
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
  const fail: string[] = [];

  if (write) {
    if (!us) throw new Error(`--write needs the USAPay engine at ${USAPAY_CORE} (set USAPAY_CORE)`);
    if (us.dirty) throw new Error(`USAPay core has uncommitted changes — commit them so the file can name the engine it came from`);
    const next = await build(us);
    // The date moves when a figure moves, not when an engine commit does.
    const { updated: _u, engines: _e, ...prevBody } = prev ?? {};
    const { engines: _e2, ...nextBody } = next;
    const updated = prev && JSON.stringify(prevBody) === JSON.stringify(nextBody) ? prev.updated : new Date().toISOString().slice(0, 10);
    mkdirSync('public/data/rankings', { recursive: true });
    writeFileSync(OUT, JSON.stringify({ updated, ...next }, null, 1) + '\n');
    console.log(`wrote ${OUT} (updated ${updated}; USAPay ${us.commit})`);
    return;
  }

  if (!prev) throw new Error(`${OUT} missing — run with --write`);
  const fx = fxFromArchive();
  if (JSON.stringify(prev.fx) !== JSON.stringify(fx)) fail.push(`fx: file ${JSON.stringify(prev.fx)} ≠ archive ${JSON.stringify(fx)}`);

  for (const t of prev.tiers) {
    if (t.cad !== Math.round(t.usd * fx.usdcad)) fail.push(`$${t.usd}: CAD ${t.cad} ≠ ${Math.round(t.usd * fx.usdcad)}`);
    for (const list of ['rows'] as const) {
      const rows: Row[] = t[list];
      if (rows.length !== 64) fail.push(`$${t.usd} ${list}: ${rows.length} rows, expected 64`);
      for (const r of rows.filter((r) => r.country === 'CA')) {
        const now = canadaRow(PROVINCE_SEO_CONFIGS.find((p) => provinceCode(p.province) === r.code)!.slug, t.cad);
        if (now.net !== r.net || now.keptPct !== r.keptPct) fail.push(`$${t.usd} ${list} ${r.code}: file ${r.net} ≠ engine ${now.net}`);
      }
      for (const r of rows) if (r.keptPct !== pct(r.net, r.gross)) fail.push(`$${t.usd} ${list} ${r.code}: keptPct ${r.keptPct} ≠ ${pct(r.net, r.gross)}`);
      if (!sameRows(rows, rank(rows, (r) => r.keptPct))) fail.push(`$${t.usd} ${list}: order or ranks are not what the shares give`);
    }
  }
  for (const c of ['CA', 'US'] as const) {
    const rows: Row[] = prev.medians[c].rows;
    if (!sameRows(rows, rank(rows, (r) => r.keptPct))) fail.push(`medians ${c}: order or ranks are not what the shares give`);
  }

  let usNote = 'US rows not recomputed here (no USAPay checkout) — USAPay\'s gate checks them against the published file';
  if (us) {
    const next = await build(us);
    const { updated: _u, engines: _e, ...a } = prev;
    const { engines: _e2, ...b } = next;
    if (JSON.stringify(a) !== JSON.stringify(b)) fail.push(`file ≠ engines now (USAPay ${us.commit}${us.dirty ? ', uncommitted' : ''}) — run --write`);
    usNote = `US rows recomputed with USAPay ${us.commit}`;
  }

  if (fail.length) {
    console.error(`RANKING AUDIT FAIL — ${fail.length} problem(s):\n  ${fail.slice(0, 30).join('\n  ')}`);
    process.exit(1);
  }
  console.log(`ranking OK — 5 tiers × 64, Canadian rows equal the engine, FX ${fx.usdcad} from the archive, ranks consistent. ${usNote}.`);
}

main().catch((e) => { console.error(`RANKING AUDIT FAIL — ${e.message}`); process.exit(1); });
