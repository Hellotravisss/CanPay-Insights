/**
 * Generates the downloadable CanPay open dataset (CSV + JSON) from the live 2026
 * tax engine, so the Dataset schema's `distribution` points at a real, citable file.
 * Run:  npx tsx scripts/generate-dataset.ts          (rewrite the files)
 *       npx tsx scripts/generate-dataset.ts --check  (build gate: fail if stale)
 *
 * The version date is automatic: it moves to today only when the rows change.
 * It used to be a constant marked "bump when regenerated" and stayed at
 * 2026-06-21 through three engine corrections, while /data promised that the
 * version date moves with every correction.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';

const YEAR = 2026;

const incomes: number[] = [];
for (let g = 30000; g <= 200000; g += 5000) incomes.push(g);

type Row = Record<string, string | number>;
const rows: Row[] = [];
for (const p of PROVINCE_SEO_CONFIGS) {
  for (const gross of incomes) {
    const f = getSalaryFigures(gross, p.slug);
    rows.push({
      year: YEAR,
      province_slug: p.slug,
      province: p.name,
      gross,
      net_annual: Math.round(f.netAnnual),
      net_monthly: Math.round(f.netMonthly),
      net_biweekly: Math.round(f.netBiWeekly),
      federal_tax: Math.round(f.federalTax),
      provincial_tax: Math.round(f.provincialTax),
      cpp_qpp_qpip: Math.round(f.pensionContribution),
      ei: Math.round(f.eiPremium),
      total_deductions: Math.round(f.totalDeductions),
      average_tax_rate_pct: +(f.averageTaxRate * 100).toFixed(2),
      total_deduction_rate_pct: +(f.totalDeductionRate * 100).toFixed(2),
    });
  }
}

const JSON_PATH = 'public/data/canpay-take-home-2026.json';
const previous = existsSync(JSON_PATH) ? JSON.parse(readFileSync(JSON_PATH, 'utf8')) : null;
const changed = !previous || JSON.stringify(previous.rows) !== JSON.stringify(rows);
if (process.argv.includes('--check')) {
  if (changed) {
    console.error('DATASET AUDIT FAIL — public/data/canpay-take-home-2026.* no longer matches the engine. Run: npx tsx scripts/generate-dataset.ts');
    process.exit(1);
  }
  const v = readFileSync('lib/datasetVersion.ts', 'utf8').match(/'([\d-]+)'/)?.[1];
  if (v !== previous.generated) {
    console.error(`DATASET AUDIT FAIL — lib/datasetVersion.ts says ${v}, the dataset says ${previous.generated}. Run: npx tsx scripts/generate-dataset.ts`);
    process.exit(1);
  }
  console.log(`DATASET AUDIT PASS — ${rows.length} open-dataset rows match the engine (version ${previous.generated}).`);
  process.exit(0);
}
const GENERATED = changed
  ? new Date().toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' })
  : previous.generated;

mkdirSync('public/data', { recursive: true });

const headers = [
  'year', 'province_slug', 'province', 'gross', 'net_annual', 'net_monthly', 'net_biweekly',
  'federal_tax', 'provincial_tax', 'cpp_qpp_qpip', 'ei', 'total_deductions',
  'average_tax_rate_pct', 'total_deduction_rate_pct',
];
const csv = [headers.join(',')]
  .concat(rows.map((r) => headers.map((h) => r[h]).join(',')))
  .join('\n');
writeFileSync('public/data/canpay-take-home-2026.csv', csv + '\n');

writeFileSync(
  JSON_PATH,
  JSON.stringify(
    {
      name: 'Canadian Take-Home Pay & Payroll Deductions 2026',
      year: YEAR,
      generated: GENERATED,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: 'CanPay Insights — https://canpayinsights.ca',
      methodology:
        'Computed from the CanPay Insights open rules engine applying published CRA, Revenu Québec, and provincial/territorial 2026 rates (federal lowest rate 14%, CPP YMPE $74,600, CPP2 YAMPE $85,000, EI 1.63%/MIE $68,900). Basic personal amount only; excludes RRSP, benefits, and other credits.',
      fields: headers,
      rows,
    },
    null,
    2
  ) + '\n'
);

writeFileSync('lib/datasetVersion.ts',
  `// Written by scripts/generate-dataset.ts. Do not edit: the date moves when the dataset's rows change.\nexport const DATASET_VERSION = '${GENERATED}';\n`);

console.log(`Wrote ${rows.length} rows (${incomes.length} incomes × ${PROVINCE_SEO_CONFIGS.length} jurisdictions) → public/data/canpay-take-home-2026.{csv,json}`);
