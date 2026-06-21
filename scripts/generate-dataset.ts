/**
 * Generates the downloadable CanPay open dataset (CSV + JSON) from the live 2026
 * tax engine, so the Dataset schema's `distribution` points at a real, citable file.
 * Run:  npx tsx scripts/generate-dataset.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';

const YEAR = 2026;
const GENERATED = '2026-06-21'; // bump when regenerated

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
  'public/data/canpay-take-home-2026.json',
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

console.log(`Wrote ${rows.length} rows (${incomes.length} incomes × ${PROVINCE_SEO_CONFIGS.length} jurisdictions) → public/data/canpay-take-home-2026.{csv,json}`);
