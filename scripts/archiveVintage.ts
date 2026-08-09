/**
 * Freezes this year's tax rules and wage benchmarks into a dated file.
 *
 * Why this matters more than it looks: Statistics Canada publishes gross wages
 * and the CRA publishes tax rules, but nobody keeps a joined series of what a
 * given job ACTUALLY took home under the rules of each year. Archiving both
 * halves annually means that in a decade we can answer "has a nurse in Ontario
 * gained or lost purchasing power since 2026?" — a question no other dataset
 * can answer, and it costs almost nothing to preserve.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { PROVINCIAL_WAGES, WAGE_DATA_YEAR } from '../lib/provincialWages';
import { getSalaryFigures } from '../lib/salaryFigures';

const TAX_YEAR = 2026;
const ENGINE_PROVINCE: Record<string, string> = {
  ON: 'ontario', QC: 'quebec', BC: 'bc', AB: 'alberta', MB: 'manitoba',
  SK: 'saskatchewan', NS: 'nova-scotia', NB: 'new-brunswick',
  NL: 'newfoundland', PE: 'pei',
};

// Take-home computed for every industry × province at that year's median wage.
const takeHome: Record<string, Record<string, { gross: number; net: number }>> = {};
for (const [industry, provinces] of Object.entries(PROVINCIAL_WAGES)) {
  takeHome[industry] = {};
  for (const [code, hourly] of Object.entries(provinces)) {
    const engineSlug = ENGINE_PROVINCE[code];
    if (!engineSlug) continue; // Canada-wide row and territories have no engine slug
    const gross = Math.round((hourly as number) * 2080);
    takeHome[industry][code] = {
      gross,
      net: Math.round(getSalaryFigures(gross, engineSlug).netAnnual),
    };
  }
}

const vintage = {
  tax_year: TAX_YEAR,
  wage_data_year: WAGE_DATA_YEAR,
  archived_at: new Date().toISOString().slice(0, 10),
  note:
    'Median full-time hourly wages from Statistics Canada Table 14-10-0064-01, ' +
    'and the take-home pay they produce under the CanPay Insights tax engine for ' +
    `the ${TAX_YEAR} tax year. Frozen so historical purchasing power stays computable.`,
  wages_hourly: PROVINCIAL_WAGES,
  take_home_annual: takeHome,
};

mkdirSync('data-archive/vintages', { recursive: true });
const path = `data-archive/vintages/${TAX_YEAR}.json`;
writeFileSync(path, JSON.stringify(vintage, null, 2));
console.log(`archived ${path}`);
