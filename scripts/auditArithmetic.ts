/**
 * Arithmetic inside the prose (2026-10-11).
 *
 * audit:numbers checks every figure against the ENGINE. It cannot see a figure
 * the article derives itself: "room reached $109,000 through 2026; a confirmed
 * $7,500 for 2027 would take that to $109,500" passed every gate for two weeks
 * until a reader wrote in (it is $116,500).
 *
 * This gate finds sentences that announce a result — "take(s) that to $Z",
 * "rise(s) to $Z", "bring(s) it to $Z", "for a total of $Z", "$A plus $B is $Z",
 * "new total of $Z" — and requires $Z to be the sum or the difference of two
 * dollar amounts stated in that sentence or the one before it. A sentence that
 * genuinely derives Z some other way (a percentage, a multi-year sum) is listed
 * in ALLOW with the reason, so a reader of this file can see why it is fine.
 *
 *   npx tsx scripts/auditArithmetic.ts            run the gate
 *   npx tsx scripts/auditArithmetic.ts --selftest plant errors and prove they are caught
 */
import { readFileSync } from 'node:fs';
import { allArticles } from '../src/content/articles-data';
import { landingPages, frenchLandingPages } from '../app/landing-page-data';

type Hit = { where: string; sentence: string; result: number; operands: number[] };

// Only phrasings that DERIVE a result from amounts in the text. "Rises to $70,800"
// on its own reports a published figure, not a sum, so a bare verb + "to" is not
// enough: it needs "that/it/this/the total" (a reference back), or "by $B".
const AMT = String.raw`\$([\d,]+(?:\.\d+)?)`;
const CUE = new RegExp([
  String.raw`\b(?:takes?|taking|brings?|bringing|puts?|pushes|lifts|raises)\s+(?:that|it|this|them|the\s+(?:total|sum|figure|room|amount))\b[^$.;]{0,30}?\bto\s+` + AMT,
  String.raw`\bby\s+\$[\d,]+(?:\.\d+)?\s+to\s+` + AMT,
  // "would/will rise to": a projection the article works out itself, unlike a bare "rises to".
  String.raw`\b(?:would|will)\s+(?:rise|grow|climb|increase|fall|drop|come)\s+to\s+` + AMT,
  String.raw`\b(?:for\s+)?(?:a|the|new)\s+(?:combined\s+)?total\s+of\s+` + AMT,
  String.raw`\bplus\s+\$[\d,]+(?:\.\d+)?\s+(?:is|equals|makes|comes\s+to)\s+` + AMT,
  // "$109,000 + $7,500 = $116,500" and "$60,000 minus $12,660 leaves $47,340"
  String.raw`\$[\d,]+(?:\.\d+)?\s*[+−-]\s*\$[\d,]+(?:\.\d+)?\s*=\s*` + AMT,
  String.raw`\b(?:minus|less)\s+\$[\d,]+(?:\.\d+)?\s+(?:leaves(?:\s+you\s+with)?|is|equals|comes\s+to)\s+` + AMT,
].join('|'), 'gi');
const MONEY = /\$([\d,]+(?:\.\d+)?)(?!\s*(?:k|K|million|billion|M|B)\b)/g;
const num = (s: string) => Number(s.replace(/,/g, ''));

/** Sentences whose result is derived some other way, with the reason. Match on a fragment. */
const ALLOW: Array<{ fragment: string; why: string }> = [
  { fragment: 'cuts income tax by $880 to $2,140 depending on', why: 'a range ($880–$2,140 across salaries and provinces), not "by $B to $Z"' },
];

function sentencesOf(text: string): string[] {
  return text
    .replace(/[#*_>`|]/g, ' ')
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function check(where: string, text: string): Hit[] {
  const out: Hit[] = [];
  const ss = sentencesOf(text);
  ss.forEach((s, i) => {
    CUE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = CUE.exec(s))) {
      const raw = m.slice(1).find(Boolean) as string;
      const result = num(raw);
      if (!result || result < 100) continue;
      // The amounts it is built from may sit either side of it ("rises by $B to $Z from $A").
      const cut = m.index + m[0].length - raw.length - 1;
      const scope = `${ss[i - 1] ?? ''} ${s.slice(0, cut)} ${s.slice(cut + raw.length + 1)}`;
      const ops = [...scope.matchAll(MONEY)].map((x) => num(x[1])).filter((v) => v > 0 && v !== result);
      if (ops.length < 2) continue; // nothing to add up: not an arithmetic claim this gate can judge
      const ok = ops.some((a, x) => ops.some((b, y) => x !== y && (Math.abs(a + b - result) <= 1 || Math.abs(a - b - result) <= 1)));
      if (ok) continue;
      if (ALLOW.some((w) => s.includes(w.fragment))) continue;
      out.push({ where, sentence: s, result, operands: ops });
    }
  });
  return out;
}

const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('auditArithmetic.ts');
if (isMain && process.argv.includes('--selftest')) {
  const planted: Array<[string, boolean]> = [
    ['Room reached $109,000 through 2026. A confirmed $7,500 for 2027 would take that to $109,500.', true],
    ['Room reached $109,000 through 2026. A confirmed $7,500 for 2027 would take that to $116,500.', false],
    ['A $3,000 raise on $60,000 brings it to $64,000.', true],
    ['A $3,000 raise on $60,000 brings it to $63,000.', false],
    ['The ceiling rises by $1,900 to $70,800 from $68,900.', false],
    ['The ceiling rises by $1,900 to $70,900 from $68,900.', true],
    ['The earnings ceiling rises to $70,800 from $68,900, and the rate is $1.64 per $100.', false],
    ['Federal tax of $5,338 and provincial tax of $2,982, for a total of $8,420.', true],
    ['Federal tax of $5,338 and provincial tax of $2,982, for a total of $8,320.', false],
    ['If the limit is $7,500, room that was $109,000 would rise to $109,500.', true],
    ['That is $109,000 + $7,500 = $109,500.', true],
    ['That is $109,000 + $7,500 = $116,500.', false],
    ['A $60,000 salary minus $12,660 leaves you with $47,340.', false],
    ['A $60,000 salary minus $12,660 leaves you with $47,940.', true],
    ['A $2,000 bonus is taxed at 30%, which takes it to $1,400.', false], // one operand only: not judged
  ];
  let bad = 0;
  for (const [text, shouldFlag] of planted) {
    const flagged = check('selftest', text).length > 0;
    const right = flagged === shouldFlag;
    if (!right) bad++;
    console.log(`${right ? 'ok    ' : 'WRONG '} ${shouldFlag ? 'flag ' : 'pass '} ${text}`);
  }
  console.log(bad ? `\n${bad} selftest case(s) wrong.` : '\nARITHMETIC SELFTEST PASS');
  process.exit(bad ? 1 : 0);
}

if (isMain && !process.argv.includes('--selftest')) {
const hits: Hit[] = [];
let scanned = 0;
for (const a of allArticles) {
  const parts: Array<[string, string]> = [
    ['excerpt', a.excerpt], ['metaDescription', a.metaDescription || ''], ['directAnswer', a.directAnswer || ''],
    ...(a.faq || []).map((f, i) => [`faq[${i}]`, `${f.question}\n${f.answer}`] as [string, string]),
    ['content', a.content],
  ];
  for (const [field, text] of parts) { scanned++; hits.push(...check(`${a.slug} · ${field}`, text)); }
}

// The topic pages and llms.txt are quoted by AI engines as much as the articles.
const stringsIn = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(stringsIn) : v && typeof v === 'object' ? Object.values(v).flatMap(stringsIn) : [];
for (const pg of [...landingPages, ...frenchLandingPages]) { scanned++; hits.push(...check(`landing ${pg.slug}`, stringsIn(pg).join('\n'))); }
scanned++; hits.push(...check('public/llms.txt', readFileSync('public/llms.txt', 'utf8')));

if (hits.length) {
  console.log(`ARITHMETIC AUDIT FAIL — ${hits.length} result(s) that are not the sum or difference of the amounts beside them:\n`);
  for (const h of hits) console.log(`  ${h.where}\n    "${h.sentence}"\n    result $${h.result.toLocaleString('en-CA')} · amounts in scope: ${h.operands.map((o) => '$' + o.toLocaleString('en-CA')).join(', ') || 'none'}\n`);
  console.log('Fix the figure, or — if it is derived another way — add the sentence to ALLOW with the reason.');
  process.exit(1);
}
console.log(`ARITHMETIC AUDIT PASS — ${allArticles.length} articles + ${landingPages.length + frenchLandingPages.length} topic pages + llms.txt, ${scanned} fields: every announced total is the sum or difference of the amounts beside it.`);
}
