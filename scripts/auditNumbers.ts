/**
 * Check every tax figure printed in an article against the engine that computes
 * them for real.
 *
 * WHY
 *   Two wrong numbers were found by hand in one afternoon: a CPP maximum of
 *   "$4,341" in the snippet Google shows (the real figure is $4,646.45), and an
 *   invented "$66,500 salary threshold" for Ontario's IT overtime exemption,
 *   which has no salary threshold at all. Both had been live for months. Prose
 *   is where stale numbers hide, because nothing type-checks it.
 *
 * HOW IT DECIDES
 *   A number is only judged inside a sentence that names the thing it belongs
 *   to, and it clears if ANY of these explains it:
 *     1. it matches a constant for a topic the sentence mentions — so
 *        "CPP (5.95%) and EI (1.63%)" clears both ways round;
 *     2. the sentence names a salary and the engine, run on that salary,
 *        produces the figure — this verifies worked examples rather than
 *        excusing them, and is why "$60,000 → about $3,362" passes;
 *     3. the sentence is explicitly about an earlier year.
 *   Case 3 is reported separately: not wrong, but a 2026 article leading with
 *   2025 figures is stale, and that is worth seeing.
 *
 * USAGE
 *   npx tsx scripts/auditNumbers.ts            # exits 1 if anything is unexplained
 *   npx tsx scripts/auditNumbers.ts --verbose  # print the sentence behind each one
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { allArticles } from '../src/content/articles-data';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import * as C from '../constants';

// Read from the engine so the audit's idea of "current" can never drift from
// the constants it audits — when they disagree, the HISTORICAL bucket inverts.
const CURRENT_YEAR = C.TAX_YEAR;

/**
 * Rates and amounts are kept apart and never compared across. A percentage was
 * once cleared by a dollar figure that happened to round to the same integer —
 * "the lowest federal rate is 15%" passed because Quebec's weekly EI premium is
 * $14.63. Nothing about a dollar amount can vouch for a rate, or the reverse.
 */
type Topic = {
  label: string;
  /** Sentence must mention this to bring the topic's figures into play. */
  mentions: RegExp;
  /** Extra gate: mentioning the topic is not enough, the sentence must also
   * match this. Used where the topic word appears in prose that is not about
   * the topic's constants (RRSP investment advice vs the RRSP limit). */
  requires?: RegExp;
  /** Percentages that are legitimate when this topic is in play. */
  rates: number[];
  /** Dollar figures that are legitimate when this topic is in play. */
  amounts: number[];
};

/** An annual maximum is quoted per cheque as often as per year. */
const perPeriod = (n: number) => [n, n / 12, n / 24, n / 26, n / 52];

/**
 * A basic personal amount is an amount, but what a reader is usually told is
 * the tax it saves them — the amount times the lowest rate. Both forms appear.
 */
const FEDERAL_BPA_CREDIT = C.FEDERAL_BASIC_PERSONAL_AMOUNT * C.FEDERAL_BRACKETS[0].rate;
const PROVINCIAL_BPA_CREDITS = Object.values(C.PROVINCIAL_DATA).map(
  (p) => p.basicPersonalAmount * p.brackets[0].rate,
);

/** Engine constants, expressed as the numbers a reader would see in print. */
const TOPICS: Topic[] = [
  {
    label: 'CPP',
    // Deliberately not \bCPP\b: "CPP2" would not match (the digit is a word
    // character), yet a sentence about CPP2 discusses base CPP alongside it.
    mentions: /CPP|Canada Pension Plan|RPC|Régime de pensions/i,
    rates: [C.CPP_RATE * 100, C.CPP_RATE * 100 * 2 /* employee + employer, for self-employed */],
    amounts: [
      ...perPeriod(C.CPP_MAX_CONTRIBUTION),
      C.CPP_MAX_CONTRIBUTION * 2,
      C.CPP_EXEMPTION,
      C.CPP_MAX_PENSIONABLE_EARNINGS,
      C.CPP_MAX_PENSIONABLE_EARNINGS - C.CPP_EXEMPTION,
    ],
  },
  {
    label: 'CPP2',
    mentions: /CPP2|second additional|second ceiling|YAMPE/i,
    rates: [C.CPP2_RATE * 100, C.CPP2_RATE * 100 * 2, C.CPP_RATE * 100],
    amounts: [
      ...perPeriod(C.CPP2_MAX_CONTRIBUTION),
      C.CPP2_MAX_CONTRIBUTION * 2,
      C.CPP2_MAX_PENSIONABLE_EARNINGS,
      ...perPeriod(C.CPP_MAX_CONTRIBUTION + C.CPP2_MAX_CONTRIBUTION),
      C.CPP2_MAX_PENSIONABLE_EARNINGS - C.CPP_MAX_PENSIONABLE_EARNINGS,
      // CPP2 is always explained beside the base band it sits on top of, and
      // comparison tables name that band without repeating the word "CPP".
      C.CPP_EXEMPTION,
      C.CPP_MAX_PENSIONABLE_EARNINGS,
    ],
  },
  {
    label: 'EI',
    mentions: /\bEI\b|\bAE\b|Employment Insurance|assurance-emploi|insurable|assurable/i,
    rates: [C.EI_RATE * 100],
    amounts: [
      ...perPeriod(C.EI_MAX_CONTRIBUTION),
      C.EI_MAX_INSURABLE_EARNINGS,
      C.EI_MAX_CONTRIBUTION * 1.4, // employer pays 1.4×
    ],
  },
  {
    label: 'EI (Quebec)',
    mentions: /Quebec|QPIP|QPP/i,
    rates: [C.QC_EI_RATE * 100],
    amounts: [...perPeriod(C.QC_EI_MAX_CONTRIBUTION)],
  },
  {
    // Quebec runs its own pension plan; without these the audit flags every
    // correct QPP figure as UNEXPLAINED, inviting a "fix" that breaks it.
    label: 'QPP/QPP2',
    mentions: /QPP|RRQ|Quebec Pension|Régime de rentes/i,
    rates: [C.QPP_RATE * 100, C.QPP_RATE * 100 * 2, C.QPP2_RATE * 100],
    amounts: [
      ...perPeriod(C.QPP_MAX_CONTRIBUTION),
      ...perPeriod(C.QPP2_MAX_CONTRIBUTION),
      ...perPeriod(C.QPP_MAX_CONTRIBUTION + C.QPP2_MAX_CONTRIBUTION),
      C.QPP_EXEMPTION,
      C.QPP_MAX_PENSIONABLE_EARNINGS,
      C.QPP2_MAX_PENSIONABLE_EARNINGS,
    ],
  },
  {
    label: 'QPIP',
    mentions: /QPIP|RQAP|parental insurance|assurance parentale/i,
    rates: [C.QPIP_RATE * 100],
    amounts: [...perPeriod(C.QPIP_MAX_CONTRIBUTION), C.QPIP_MAX_INSURABLE_EARNINGS],
  },
  {
    label: 'Quebec abatement',
    mentions: /abatement|abattement|联邦税减免/i,
    rates: [C.QUEBEC_ABATEMENT_RATE * 100],
    amounts: [],
  },
  {
    // Not payroll, but the site states them beside payroll figures (llms.txt
    // key-facts, savings articles) and a stale limit is the same failure mode.
    label: 'TFSA/RRSP limits',
    mentions: /TFSA|CELI|RRSP|REER/i,
    // Savings articles are full of worked examples ("a $10,000 contribution at
    // a 30% marginal rate") and unrelated rates (mortgages); only a sentence
    // about the LIMIT is stating a constant.
    requires: /limit|plafond|room|上限/i,
    rates: [C.RRSP_CONTRIBUTION_RATE_OF_INCOME * 100],
    amounts: [C.TFSA_LIMIT, C.RRSP_DOLLAR_LIMIT],
  },
  {
    // The quarterly routine checks these against the CRA, so the prose quoting
    // them has to be checked too — otherwise a bracket change is corrected in
    // the engine while every article still prints last year's rate.
    label: 'Federal brackets and BPA',
    // "federal lowest rate", "premier palier ... fédéral", "联邦最低档" — the
    // word order varies, but bare "Federal" is NOT enough: "US Federal minimum
    // wage" and "the Federal government" are not income-tax sentences. The
    // keyword must appear near a tax word in either order.
    mentions:
      /\bfederal\b.{0,24}\b(bracket|rate|tax|BPA)\b|\b(bracket|rate|tax)\b.{0,24}\bfederal\b|imp[oô]t f[ée]d[ée]ral|palier|联邦/i,
    rates: C.FEDERAL_BRACKETS.map((b) => b.rate * 100),
    amounts: [
      ...C.FEDERAL_BRACKETS.filter((b) => isFinite(b.threshold)).map((b) => b.threshold),
      C.FEDERAL_BASIC_PERSONAL_AMOUNT,
      FEDERAL_BPA_CREDIT,
      // "credits reduce your tax by $2,959" = the federal and provincial ones together
      ...PROVINCIAL_BPA_CREDITS.map((c) => c + FEDERAL_BPA_CREDIT),
    ],
  },
  {
    // A sentence rarely says which province's BPA it means, so accept any of
    // them; the point is to catch a figure that belongs to no province at all.
    label: 'Provincial brackets and BPAs',
    mentions:
      /basic personal amount|montant personnel de base|\bBPA\b|provincial tax|provincial.{0,16}(bracket|rate)|paliers? (?:d'imposition )?(?:provinciaux|qu[ée]b[ée]cois)|imp[oô]t du Qu[ée]bec|省税/i,
    rates: Object.values(C.PROVINCIAL_DATA).flatMap((p) => p.brackets.map((b) => b.rate * 100)),
    amounts: Object.values(C.PROVINCIAL_DATA).flatMap((p) => [
      p.basicPersonalAmount,
      ...p.brackets.filter((b) => isFinite(b.threshold)).map((b) => b.threshold),
      p.basicPersonalAmount * p.brackets[0].rate,
      p.basicPersonalAmount * p.brackets[0].rate + FEDERAL_BPA_CREDIT,
    ]),
  },
];

/**
 * The failure mode this catches is a stale *constant* — a rate or ceiling that
 * was right last year. Derived amounts ("keeps roughly $55,416 a year") are
 * generated from the engine already and are phrased too freely to judge, so a
 * sentence is only examined when it is stating a rule, not doing arithmetic.
 */
const STATES_A_RULE =
  /\b(rate|rates|maximum|maximums|max|maxes|most|ceiling|ceilings|exemption|threshold|premium|premiums|contribution|contributions|insurable|pensionable|YMPE|YAMPE|cap|capped|bracket|brackets|BPA|limit|limits|taux|plafond|plafonds|cotisation|cotisations|palier|paliers|assurable|exonération)\b|basic personal amount|montant personnel de base|上限|免税额|费率|税率|最低档|供款|保费|封顶|减免/i;

/** Negative lookahead on "k"/"K": "$50k earners" is shorthand, not a figure of $50. */
// The digits group must end on a digit — "jusqu'à $54,345, puis" would
// otherwise capture the list comma into the figure.
const MONEY = /\$\s?([0-9](?:[0-9,]*[0-9])?(?:\.[0-9]{1,2})?)(?![0-9]*[kK])/g;
// Three decimals matters: QPIP is printed as 0.494% — at two, the regex read
// it as "494%" and the self-test's planted stale QPIP rate slipped through.
const PERCENT = /\b([0-9]{1,3}(?:\.[0-9]{1,3})?)\s?%/g;

/** Gains and gaps are computed between two scenarios, not read off a rate table. */
const DESCRIBES_A_CHANGE =
  /\b(gains?|more take-home|increase[sd]?|difference|extra|raise[sd]?|cut|reduced|lowered|dropped|rose|down from|up from|baisse|hausse|passe de)\b|降至|降到|升至|升到|由.{1,8}降|由.{1,8}升/i;

/** Large figures are salaries being discussed unless the sentence calls them a limit. */
const NAMES_A_LIMIT =
  /\b(ceiling|ceilings|YMPE|YAMPE|insurable|pensionable|maximum|maximums|exemption|bracket|brackets|BPA|limit|limits|plafond|plafonds|palier|paliers|assurable)\b|basic personal amount|montant personnel de base|上限|免税额|封顶/i;

/**
 * A rate the engine derives from a salary (effective, average, marginal) must
 * not be allowed to vouch for a statutory rate. "The lowest federal rate is 15%"
 * was cleared for exactly that reason: 15% happened to be some province's
 * effective rate at the salary named in the same sentence.
 */
const DESCRIBES_A_COMPUTED_RATE = /\b(effective|average|marginal|combined|overall|take-home|keeps?)\b/i;

const num = (s: string) => parseFloat(s.replace(/,/g, ''));

/**
 * Canadian French prints "1 123,07 $" and "16,5 %" — space-grouped thousands
 * (often non-breaking), decimal comma, trailing currency sign. Without this
 * pass every figure in articles-fr.ts was simply invisible to the audit.
 */
function normalizeFrenchNumbers(text: string): string {
  return text
    .replace(/([0-9]{1,3}(?:[\s\u00A0\u202F][0-9]{3})+(?:,[0-9]{1,2})?)[\s\u00A0\u202F]?\$/g,
      (_, n) => '$' + n.replace(/[\s\u00A0\u202F]/g, ',').replace(/,([0-9]{1,2})$/, '.$1'))
    .replace(/\b([0-9]{1,4}(?:,[0-9]{1,2})?)[\s\u00A0\u202F]?\$/g,
      (_, n) => '$' + n.replace(',', '.'))
    .replace(/\b([0-9]{1,3}),([0-9]{1,3})[\s\u00A0\u202F]?%/g, '$1.$2%');
}
/**
 * Compare at the precision the author chose, rather than picking a tolerance.
 * "about 21.7%" is one decimal, so it is right if the engine's 21.65% rounds to
 * 21.7; "1.64%" is two, so it is wrong against 1.63% — and a fixed tolerance
 * cannot be both. Writing more decimals is a claim to more accuracy, and this
 * holds the text to whichever claim it made.
 */
function matchesAtPrintedPrecision(printed: string, actual: number): boolean {
  const dp = (printed.split('.')[1] || '').length;
  const f = Math.pow(10, dp);
  if (Math.round(parseFloat(printed) * f) === Math.round(actual * f)) return true;
  // Trailing zeros signal deliberate rounding: "environ 58 500 $" is the
  // bracket threshold 58,523 stated to the nearest hundred, and is not wrong.
  // Capped at thousands so coarse rounding cannot launder a stale figure.
  if (dp === 0) {
    const zeros = Math.min((printed.match(/0+$/) || [''])[0].length, 3);
    if (zeros > 0) {
      const mag = Math.pow(10, zeros);
      return Math.round(actual / mag) * mag === parseFloat(printed);
    }
  }
  return false;
}

/**
 * Everything the engine legitimately produces for a salary named in the same
 * sentence — the deductions themselves, the rates they imply, and the take-home
 * they leave. Articles quote all three, so all three must clear.
 */
function engineValuesFor(salary: number): { money: number[]; rates: number[] } {
  const out: number[] = [];
  const rates: number[] = [];
  for (const { slug } of PROVINCE_SEO_CONFIGS) {
    const f = getSalaryFigures(salary, slug);
    rates.push(
      f.averageTaxRate * 100,
      f.totalDeductionRate * 100,
      f.marginalRate * 100,
      (1 - f.totalDeductionRate) * 100, // "keeps 79.5%"
    );
    out.push(
      f.pensionContribution,
      f.pensionContribution * 2,
      f.eiPremium,
      f.federalTax,
      f.provincialTax,
      f.federalTax + f.provincialTax,
      f.totalDeductions,
      f.pensionContribution + f.eiPremium, // "your CPP + EI for the year"
      f.netAnnual,
      f.netMonthly,
      f.netBiWeekly,
      f.netWeekly,
      f.netSemiMonthly,
      f.netHourly,
      salary - C.CPP_EXEMPTION,
    );
    // Articles quote deductions per cheque as often as per year.
    for (const periods of [12, 24, 26, 52]) {
      out.push(f.pensionContribution / periods, f.eiPremium / periods);
    }
  }
  return { money: out, rates };
}

type Finding = { slug: string; field: string; value: string; sentence: string; historical: boolean };

function splitSentences(text: string): string[] {
  // Tables hold most of these figures, so rows count as sentences; a whole
  // table read as one string would let any number clear against any other.
  return text
    .split(/\n|(?<=[.!?])\s+|(?<=[。！？；])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function auditText(slug: string, field: string, rawText: string, out: Finding[], stats: { checked: number }) {
  const text = normalizeFrenchNumbers(rawText);
  const all = splitSentences(text);

  // An article works one example salary for pages at a time ("David earns
  // $68,000"), so the salary behind a figure can be far above it. Scope salary
  // detection to the whole field; the figures themselves are still judged
  // sentence by sentence, which is what keeps unrelated numbers apart.
  const derivedMoney: number[] = [];
  const derivedRates: number[] = [];
  for (const m of [...text.matchAll(MONEY)]) {
    const v = num(m[1]);
    let salary = v >= 15000 && v <= 500000 ? v : 0;
    // "$17.60 minimum wage" or "$33.00/hr" is a salary too, stated hourly.
    if (!salary && v >= 10 && v <= 150) {
      const after = text.slice(m.index + m[0].length, m.index + m[0].length + 20);
      if (/^\s*(an hour|per hour|\/\s?hr|\/\s?hour|hourly|minimum wage)/i.test(after)) salary = v * 2080;
    }
    if (salary) {
      const e = engineValuesFor(salary);
      derivedMoney.push(...e.money);
      derivedRates.push(...e.rates);
    }
  }

  all.forEach((s, i) => {
    const topics = TOPICS.filter((t) => t.mentions.test(s) && (!t.requires || t.requires.test(s)));
    if (!topics.length || !STATES_A_RULE.test(s)) return;
    // A sentence about how much a raise adds is doing arithmetic across two
    // scenarios, not quoting a rule; there is nothing here to compare against.
    if (DESCRIBES_A_CHANGE.test(s)) return;

    const acceptedAmounts = [...topics.flatMap((t) => t.amounts), ...derivedMoney];
    const acceptedRates = topics.flatMap((t) => t.rates);
    // Only a sentence that says it is reporting a computed rate may lean on one.
    if (DESCRIBES_A_COMPUTED_RATE.test(s)) acceptedRates.push(...derivedRates);

    // A sentence dated to a different year — "in 2025", or "announced for
    // 2027" — is not making a claim about the engine's year, so it cannot be
    // judged against the engine's constants. It is reported, not failed; this
    // is also what lets a forward-looking rates article pass the build gate.
    // A sentence that names the current year alongside others IS judged.
    const years = [...s.matchAll(/\b(20[0-9]{2})\b/g)].map((m) => parseInt(m[1], 10));
    const historical =
      years.length > 0 && !years.includes(CURRENT_YEAR) && years.some((y) => y !== CURRENT_YEAR);

    const figures = [...s.matchAll(MONEY), ...s.matchAll(PERCENT)].map((m) => ({
      raw: m[0].trim(),
      printed: m[1].replace(/,/g, ''),
      v: num(m[1]),
      // An hourly wage is an input like a salary, just a smaller number.
      isWageInput: /^\s*(an hour|per hour|\/\s?hr|\/\s?hour|hourly|minimum wage)/i.test(
        s.slice(m.index + m[0].length),
      ),
    }));

    for (const f of figures) {
      // A large figure is the income being discussed, not a claim about the tax
      // system — unless the sentence presents it as a limit. Judging every
      // example salary would bury the findings that matter.
      if (f.isWageInput) continue;
      if (f.raw.startsWith('$') && f.v >= 15000 && !NAMES_A_LIMIT.test(s)) continue;
      stats.checked++;
      const pool = f.raw.endsWith('%') ? acceptedRates : acceptedAmounts;
      if (pool.some((a) => matchesAtPrintedPrecision(f.printed, a))) continue;
      out.push({ slug, field, value: f.raw, sentence: s.slice(0, 160), historical });
    }
  });
}

/**
 * The audit's original blind spot: the articles were checked while the
 * homepage's FAQ JSON-LD, the Chinese landing page, llms.txt's key-facts
 * block, the published dataset, and two components kept stating rates as
 * hardcoded strings nothing verified. These are exactly the surfaces AI
 * engines and Google quote. Each is scanned as text; the topic gate keeps
 * class names and other code noise out because they never mention CPP or EI.
 */
const SURFACE_SOURCES = [
  'app/page.tsx',
  'app/zh/page.tsx',
  'app/landing-page-data.ts',
  'components/DataPage.tsx',
  'components/AboutPage.tsx',
];
const SURFACE_TEXTS = ['public/llms.txt'];

/** Pull every string literal out of a TS/TSX source file, minus interpolations. */
function stringLiteralsOf(source: string): string {
  const out: string[] = [];
  // No dotAll flag: the negated classes already cross newlines for template
  // literals, and the repo's TS target predates es2018's /s.
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  for (const m of source.matchAll(re)) {
    const lit = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, ' ');
    if (lit.length >= 8) out.push(lit);
  }
  return out.join('\n');
}

function jsonStrings(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(jsonStrings);
  if (v && typeof v === 'object') return Object.values(v).flatMap(jsonStrings);
  return [];
}

function auditSurfaces(out: Finding[], stats: { checked: number }): number {
  let count = 0;
  for (const rel of SURFACE_SOURCES) {
    auditText(rel, 'strings', stringLiteralsOf(readFileSync(join(process.cwd(), rel), 'utf8')), out, stats);
    count++;
  }
  for (const rel of SURFACE_TEXTS) {
    auditText(rel, 'text', readFileSync(join(process.cwd(), rel), 'utf8'), out, stats);
    count++;
  }
  // The dataset filename is year-stamped, so find it rather than hardcode it.
  const dataDir = join(process.cwd(), 'public', 'data');
  for (const name of readdirSync(dataDir).filter((n) => n.endsWith('.json'))) {
    auditText(`public/data/${name}`, 'json', jsonStrings(JSON.parse(readFileSync(join(dataDir, name), 'utf8'))).join('\n'), out, stats);
    count++;
  }
  return count;
}

const verbose = process.argv.includes('--verbose');

/**
 * A checker that has quietly stopped checking looks exactly like a clean run.
 * These are figures that were, or would be, wrong; each must be caught.
 */
if (process.argv.includes('--selftest')) {
  const cases: Array<[string, string]> = [
    ['CPP maxes out at about $4,341 for the year.', '$4,341'],
    ['The CPP contribution rate is 5.7% of pensionable earnings.', '5.7%'],
    ['The EI maximum premium is $1,077.48 in 2026.', '$1,077.48'],
    ['CPP2 applies between the first ceiling and $81,200.', '$81,200'],
    ['EI is charged at a rate of 1.64% on insurable earnings.', '1.64%'],
    ['The CPP basic exemption is $3,800 a year.', '$3,800'],
    ['The federal basic personal amount is $16,129 for 2026.', '$16,129'],
    ['The lowest federal tax rate is 15% on the first $58,523.', '15%'],
    ['Ontario’s basic personal amount is $12,747.', '$12,747'],
    ['The QPP rate in Quebec is 6.4% of pensionable earnings.', '6.4%'],
    ['QPIP premiums are 0.494% of insurable earnings.', '0.494%'],
  ];
  /**
   * Hand cases rot: a value planted as "wrong" can become next year's real
   * figure (EI 1.64% will, eventually). So on top of the fixed regression
   * cases, one probe per topic is GENERATED by perturbing the topic's own
   * first rate and amount — when the constants move, the probes move with
   * them, and a collision with any legitimate value is stepped over.
   */
  const allPools = TOPICS.flatMap((t) => [...t.rates, ...t.amounts]);
  const collides = (v: number, printed: string) => allPools.some((a) => matchesAtPrintedPrecision(printed, a));
  const fmtRate = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2)) + '%';
  const fmtMoney = (v: number) =>
    '$' + (Number.isInteger(v) ? v.toLocaleString('en-CA') : v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const PROBES: Record<string, { rate?: string; amount?: string }> = {
    CPP: { rate: 'The CPP contribution rate is {V} of pensionable earnings.', amount: 'The CPP maximum contribution is {V} for the year.' },
    CPP2: { rate: 'The CPP2 rate is {V} above the first ceiling.', amount: 'The CPP2 maximum contribution is {V} for the year.' },
    EI: { rate: 'The EI premium rate is {V} of insurable earnings.', amount: 'The EI maximum premium is {V} for the year.' },
    'EI (Quebec)': { rate: 'The Quebec EI premium rate is {V}.', amount: 'The Quebec EI maximum premium is {V} for the year.' },
    'QPP/QPP2': { rate: 'The QPP contribution rate is {V} of pensionable earnings.', amount: 'The QPP maximum contribution is {V} for the year.' },
    QPIP: { rate: 'The QPIP premium rate is {V} of insurable earnings.', amount: 'The QPIP maximum premium is {V} for the year.' },
    'Quebec abatement': { rate: 'The Quebec abatement rate is {V} of federal tax.' },
    'TFSA/RRSP limits': { amount: 'The TFSA contribution limit is {V} for the year.' },
    'Federal brackets and BPA': { rate: 'The lowest federal tax rate is {V}.', amount: 'The federal basic personal amount is {V}.' },
  };
  for (const t of TOPICS) {
    const probe = PROBES[t.label];
    if (!probe) continue;
    const jobs: Array<['rate' | 'amount', number, string]> = [];
    if (probe.rate && t.rates.length) jobs.push(['rate', t.rates[0], probe.rate]);
    if (probe.amount && t.amounts.length) jobs.push(['amount', t.amounts[0], probe.amount]);
    for (const [kind, base, template] of jobs) {
      let wrong = 0;
      let printed = '';
      for (const mult of [1.13, 1.31, 1.57, 0.83]) {
        wrong = kind === 'rate' ? Math.round(base * mult * 100) / 100 : Math.round(base * mult);
        printed = String(wrong);
        if (!collides(wrong, printed)) break;
      }
      const rendered = kind === 'rate' ? fmtRate(wrong) : fmtMoney(wrong);
      cases.push([template.replace('{V}', rendered), rendered]);
    }
  }

  let failed = 0;
  for (const [sentence, expected] of cases) {
    const found: Finding[] = [];
    auditText('selftest', 'x', sentence, found, { checked: 0 });
    const caught = found.some((f) => f.value.replace(/\s/g, '') === expected);
    console.log(`${caught ? 'caught  ' : 'MISSED  '} ${expected}  ${sentence}`);
    if (!caught) failed++;
  }
  console.log(failed ? `\n${failed} case(s) not caught — the audit has holes.` : '\nAll planted errors caught.');
  process.exit(failed ? 1 : 0);
}

const findings: Finding[] = [];
const stats = { checked: 0 };

const surfaceCount = auditSurfaces(findings, stats);

for (const a of allArticles) {
  auditText(a.slug, 'title', a.title, findings, stats);
  auditText(a.slug, 'excerpt', a.excerpt, findings, stats);
  auditText(a.slug, 'metaDescription', a.metaDescription || '', findings, stats);
  auditText(a.slug, 'directAnswer', a.directAnswer || '', findings, stats);
  // The question carries the salary the answer is about ("What is CPP on
  // $60,000?"), so it must be in scope or every FAQ answer looks unexplained.
  (a.faq || []).forEach((f, i) => auditText(a.slug, `faq[${i}]`, `${f.question}\n${f.answer}`, findings, stats));
  auditText(a.slug, 'content', a.content, findings, stats);
}

const wrong = findings.filter((f) => !f.historical);
const stale = findings.filter((f) => f.historical);

console.log(
  `${allArticles.length} articles + ${surfaceCount} site surfaces · ${stats.checked} figures checked against the engine\n`,
);

const report = (title: string, list: Finding[]) => {
  if (!list.length) return;
  console.log(`${title} (${list.length})`);
  const byArticle = new Map<string, Finding[]>();
  for (const f of list) {
    if (!byArticle.has(f.slug)) byArticle.set(f.slug, []);
    byArticle.get(f.slug)!.push(f);
  }
  for (const [slug, items] of byArticle) {
    console.log(`\n  ${slug}`);
    for (const f of items) {
      console.log(`    ${f.field}: ${f.value}`);
      if (verbose) console.log(`      "${f.sentence}"`);
    }
  }
  console.log();
};

report('UNEXPLAINED — no engine value or constant produces these', wrong);
report(
  `HISTORICAL — figures framed as a year other than ${CURRENT_YEAR} (past, or announced future); informational`,
  stale,
);

// The last line is the contract for anything scripted on top of this — an
// unsupervised agent once had "wait until it prints Clean" as its stop
// condition, which no run with a legitimate historical note could satisfy.
// PASS/FAIL here always agrees with the exit code, by construction.
if (wrong.length) {
  console.log(`AUDIT FAIL — ${wrong.length} unexplained figure(s).`);
} else {
  console.log(
    `AUDIT PASS — 0 unexplained figures` +
      (stale.length ? ` (${stale.length} historical note(s), informational only).` : `. Every figure traces back to the engine.`),
  );
}
process.exit(wrong.length ? 1 : 0);
