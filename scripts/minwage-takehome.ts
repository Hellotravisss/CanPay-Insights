// One-off data generation for the minimum-wage take-home article.
// Run: npx tsx scripts/minwage-takehome.ts
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province } from '../types';

const HOURS_PER_YEAR = 2080; // 40 hrs/week x 52 weeks

// General adult rates. ON, SK, MB, NS, PE updated 2026-10-01 (re-verified that
// morning against each government's own page; PE's page was behind a Radware
// challenge for automated fetches, so PE used the 2026-09-17 figure from
// princeedwardisland.ca news, corroborated by secondary coverage). The rest
// were verified on the jurisdiction's own site 2026-09-17.

const MIN_WAGES: Array<{ province: Province; label: string; wage: number }> = [
  { province: Province.AB, label: 'Alberta', wage: 15.0 },
  { province: Province.SK, label: 'Saskatchewan', wage: 15.7 }, // ↑ 2026-10-01, saskatchewan.ca
  { province: Province.NB, label: 'New Brunswick', wage: 15.9 },
  { province: Province.MB, label: 'Manitoba', wage: 16.4 }, // ↑ 2026-10-01, news.gov.mb.ca
  { province: Province.NL, label: 'Newfoundland and Labrador', wage: 16.35 },
  { province: Province.QC, label: 'Quebec', wage: 16.6 },
  { province: Province.NS, label: 'Nova Scotia', wage: 17.0 }, // ↑ 2026-10-01, novascotia.ca/lae/employmentrights/minimumwage.asp
  { province: Province.NT, label: 'Northwest Territories', wage: 17.2 }, // ↑ 2026-09-01, ece.gov.nt.ca
  { province: Province.PE, label: 'Prince Edward Island', wage: 17.3 }, // ↑ 2026-10-01, princeedwardisland.ca news, 2026-04-02
  { province: Province.ON, label: 'Ontario', wage: 17.95 }, // ↑ 2026-10-01, ontario.ca employment standards guide
  { province: Province.BC, label: 'British Columbia', wage: 18.25 },
  { province: Province.YT, label: 'Yukon', wage: 18.51 },
  { province: Province.NU, label: 'Nunavut', wage: 20.17 }, // ↑ 2026-09-01, gov.nu.ca
];

const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

const rows = MIN_WAGES.map(({ province, label, wage }) => {
  const gross = wage * HOURS_PER_YEAR;
  const r = calculateFromAnnualSalary({
    annualSalary: gross,
    province,
    payFrequency: PayFrequency.BI_WEEKLY,
  });
  const totalTax = (r.federalTax + r.provincialTax) * 26;
  return {
    label,
    wage,
    gross,
    netAnnual: r.netPayAnnual,
    netMonthly: r.netPayAnnual / 12,
    netHourly: r.netPayAnnual / HOURS_PER_YEAR,
    totalTax,
    cppEi: (r.cppDeduction + r.eiDeduction) * 26,
    deductionRate: r.totalDeductionsAnnual / gross,
  };
});

rows.sort((a, b) => b.netAnnual - a.netAnnual);

console.log('| Province | Min. wage | Gross (full-time) | Take-home / year | Take-home / month | Net hourly | Deductions kept by gov |');
console.log('| --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) {
  console.log(
    `| ${r.label} | $${r.wage.toFixed(2)} | ${money(r.gross)} | **${money(r.netAnnual)}** | ${money(r.netMonthly)} | $${r.netHourly.toFixed(2)} | ${(r.deductionRate * 100).toFixed(1)}% |`
  );
}
console.log('\nJSON:\n' + JSON.stringify(rows, null, 1));
