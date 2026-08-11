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
    mentions: /CPP|Canada Pension Plan/i,
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
    mentions: /\bEI\b|Employment Insurance|insurable/i,
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
    mentions: /QPP|Quebec Pension/i,
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
    mentions: /QPIP|parental insurance/i,
    rates: [C.QPIP_RATE * 100],
    amounts: [...perPeriod(C.QPIP_MAX_CONTRIBUTION), C.QPIP_MAX_INSURABLE_EARNINGS],
  },
  {
    // The quarterly routine checks these against the CRA, so the prose quoting
    // them has to be checked too — otherwise a bracket change is corrected in
    // the engine while every article still prints last year's rate.
    label: 'Federal brackets and BPA',
    mentions: /federal (tax )?(bracket|rate|tax)|basic personal amount|\bBPA\b/i,
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
    mentions: /basic personal amount|\bBPA\b|provincial (tax )?(bracket|rate)/i,
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
  /\b(rate|rates|maximum|maximums|max|maxes|most|ceiling|ceilings|exemption|threshold|premium|premiums|contribution|contributions|insurable|pensionable|YMPE|YAMPE|cap|capped|bracket|brackets|BPA)\b|basic personal amount/i;

/** Negative lookahead on "k"/"K": "$50k earners" is shorthand, not a figure of $50. */
const MONEY = /\$\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)(?![0-9]*[kK])/g;
// Three decimals matters: QPIP is printed as 0.494% — at two, the regex read
// it as "494%" and the self-test's planted stale QPIP rate slipped through.
const PERCENT = /\b([0-9]{1,3}(?:\.[0-9]{1,3})?)\s?%/g;

/** Gains and gaps are computed between two scenarios, not read off a rate table. */
const DESCRIBES_A_CHANGE = /\b(gains?|more take-home|increase[sd]?|difference|extra|raise[sd]?)\b/i;

/** Large figures are salaries being discussed unless the sentence calls them a limit. */
const NAMES_A_LIMIT =
  /\b(ceiling|ceilings|YMPE|YAMPE|insurable|pensionable|maximum|maximums|exemption|bracket|brackets|BPA)\b|basic personal amount/i;

/**
 * A rate the engine derives from a salary (effective, average, marginal) must
 * not be allowed to vouch for a statutory rate. "The lowest federal rate is 15%"
 * was cleared for exactly that reason: 15% happened to be some province's
 * effective rate at the salary named in the same sentence.
 */
const DESCRIBES_A_COMPUTED_RATE = /\b(effective|average|marginal|combined|overall|take-home|keeps?)\b/i;

const num = (s: string) => parseFloat(s.replace(/,/g, ''));
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
  return Math.round(parseFloat(printed) * f) === Math.round(actual * f);
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
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function auditText(slug: string, field: string, text: string, out: Finding[], stats: { checked: number }) {
  const all = splitSentences(text);

  // An article works one example salary for pages at a time ("David earns
  // $68,000"), so the salary behind a figure can be far above it. Scope salary
  // detection to the whole field; the figures themselves are still judged
  // sentence by sentence, which is what keeps unrelated numbers apart.
  const derivedMoney: number[] = [];
  const derivedRates: number[] = [];
  for (const m of [...text.matchAll(MONEY)]) {
    const v = num(m[1]);
    if (v >= 15000 && v <= 500000) {
      const e = engineValuesFor(v);
      derivedMoney.push(...e.money);
      derivedRates.push(...e.rates);
    }
  }

  all.forEach((s, i) => {
    const topics = TOPICS.filter((t) => t.mentions.test(s));
    if (!topics.length || !STATES_A_RULE.test(s)) return;
    // A sentence about how much a raise adds is doing arithmetic across two
    // scenarios, not quoting a rule; there is nothing here to compare against.
    if (DESCRIBES_A_CHANGE.test(s)) return;

    const acceptedAmounts = [...topics.flatMap((t) => t.amounts), ...derivedMoney];
    const acceptedRates = topics.flatMap((t) => t.rates);
    // Only a sentence that says it is reporting a computed rate may lean on one.
    if (DESCRIBES_A_COMPUTED_RATE.test(s)) acceptedRates.push(...derivedRates);

    // "in 2025", "2024 rates" — the figures are allowed to be last year's.
    const years = [...s.matchAll(/\b(20[0-9]{2})\b/g)].map((m) => parseInt(m[1], 10));
    const historical = years.some((y) => y < CURRENT_YEAR);

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

console.log(`${allArticles.length} articles · ${stats.checked} figures checked against the engine\n`);

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
report(`HISTORICAL — figures from before ${CURRENT_YEAR}, check they are still framed as past`, stale);

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
