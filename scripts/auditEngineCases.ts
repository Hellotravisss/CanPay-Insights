/**
 * Build gate: the engine paths the CRA golden test does not reach.
 *
 * The golden test covers plain bi-weekly salary. An audit on 2026-09-22 found
 * three bugs outside that path, each paying people wrongly:
 *   - timesheet overtime grouped into the wrong week in every Canadian time zone;
 *   - no shift premium at all for a shift that starts after midnight;
 *   - a one-time bonus in hourly mode multiplied by 26.
 *
 * ⚠️ Run it in a Canadian time zone (the npm script does). The week bug did not
 * exist in UTC, which is what CI machines use — a gate run there would have
 * passed the broken code.
 */
import { calculateSalary, calculateFromTimesheet, calculateFromAnnualSalary } from '../utils/taxEngine';
import { Province, PayFrequency, type AnnualSalaryInputs } from '../types';

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (!/^America\//.test(tz)) {
  console.log(`ENGINE CASES AUDIT FAIL — running in ${tz}. Run with TZ=America/Vancouver: the week bug is invisible in UTC.`);
  process.exit(1);
}
const failures: string[] = [];
let checks = 0;
const expect = (label: string, got: number, want: number, tol = 0.01) => {
  checks++;
  if (Math.abs(got - want) > tol) failures.push(`${label}: got ${got}, want ${want}`);
};

// 1. Timesheet weeks: Monday–Saturday is ONE week (Ontario overtime after 44 h)
const ts = (dates: string[]) => calculateFromTimesheet({
  province: Province.ON, hourlyWage: 25, payFrequency: PayFrequency.WEEKLY,
  entries: dates.map((date) => ({ date, checkIn: '09:00', checkOut: '17:00', unpaidBreakMinutes: 0 })),
} as never);
for (const [label, dates] of [
  ['Mon–Sat March', ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07']],
  ['Mon–Sat across New Year', ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']],
] as [string, string[]][]) {
  const r = ts(dates);
  expect(`${label} regular hours`, r.regularHours, 44);
  expect(`${label} overtime hours`, r.overtimeHours15, 4);
}

// 2. Shift premium 22:00–06:00, Mon–Fri, two weeks
const shift = (startTime: string, endTime: string) => calculateSalary({
  province: Province.ON, hourlyWage: 25,
  shift: { startTime, endTime, unpaidBreakMinutes: 0, daysActive: [false, true, true, true, true, true, false] },
  premium: { enabled: true, ratePerHour: 2, startTime: '22:00', endTime: '06:00' },
} as never);
for (const [s, e, want] of [['22:00', '06:00', 80], ['18:00', '02:00', 40], ['00:00', '08:00', 60], ['02:00', '10:00', 40], ['08:00', '16:00', 0]] as [string, string, number][]) {
  expect(`premium hours, shift ${s}–${e}`, shift(s, e).shiftPremiumHours, want);
}

// 3. One-time bonus in hourly mode = the CRA bonus method, not × 26
const hourly = (bonus: number, province: string) => calculateSalary({
  province, hourlyWage: 25,
  shift: { startTime: '09:00', endTime: '17:00', unpaidBreakMinutes: 0, daysActive: [false, true, true, true, true, true, false] },
  premium: { enabled: false, ratePerHour: 0, startTime: '00:00', endTime: '00:00' },
  additionalIncome: { statHolidayPay: 0, sickPay: 0, bonus, otherIncome: 0 },
} as never);
const annualNet = (province: string, x: number) =>
  calculateFromAnnualSalary({ province, annualSalary: x, payFrequency: PayFrequency.BI_WEEKLY } as AnnualSalaryInputs).netPayAnnual;
for (const p of Object.values(Province) as string[]) {
  const b0 = hourly(0, p), b1 = hourly(1000, p);
  expect(`${p} bonus: annual gross`, b1.grossPayAnnual, b0.grossPayAnnual + 1000);
  expect(`${p} bonus: this period's extra take-home vs the year with and without it`,
    b1.netPayBiWeekly - b0.netPayBiWeekly, annualNet(p, b0.grossPayAnnual + 1000) - annualNet(p, b0.grossPayAnnual), 0.05);
  const ded = b1.federalTax + b1.provincialTax + b1.cppDeduction + b1.eiDeduction + (b1.rrspDeduction ?? 0);
  expect(`${p} bonus: gross − deductions = net`, b1.grossPayBiWeekly - ded, b1.netPayBiWeekly);
  expect(`${p} bonus: annual tax is the year's, not the period's × 26`,
    (b1.annual?.federalTax ?? 0) + (b1.annual?.provincialTax ?? 0), b1.grossPayAnnual - b1.netPayAnnual - (b1.annual?.cpp ?? 0) - (b1.annual?.ei ?? 0) - (b1.annual?.rrsp ?? 0), 0.5);
}

// 4. Non-cash taxable benefits: pensionable, NOT insurable (CRA T4130)
for (const p of Object.values(Province) as string[]) {
  const base = { province: p, annualSalary: 60000, payFrequency: PayFrequency.BI_WEEKLY } as AnnualSalaryInputs;
  const a0 = calculateFromAnnualSalary(base);
  const a1 = calculateFromAnnualSalary({ ...base, additionalIncome: { statHolidayPay: 0, sickPay: 0, bonus: 0, otherIncome: 0, taxableBenefits: 50 } } as AnnualSalaryInputs);
  expect(`${p} non-cash benefit leaves EI unchanged`, a1.annual?.ei ?? -1, a0.annual?.ei ?? -2);
  checks++;
  if (!((a1.annual?.cpp ?? 0) > (a0.annual?.cpp ?? 0))) failures.push(`${p} non-cash benefit should raise CPP/QPP`);
}

// 5. Daily pay: the CRA's 240 days a year (T4127 table 6.1), not 365
const daily = calculateFromTimesheet({
  province: Province.ON, hourlyWage: 25, payFrequency: PayFrequency.DAILY,
  entries: [{ date: '2026-03-02', checkIn: '09:00', checkOut: '17:00', unpaidBreakMinutes: 0 }],
} as never);
expect('one $200 day annualised', daily.grossPayAnnual, 48000);

if (failures.length) {
  console.log(failures.map((f) => '  ✗ ' + f).join('\n'));
  console.log(`\nENGINE CASES AUDIT FAIL (${tz}) — ${failures.length} of ${checks}.`);
  process.exit(1);
}
console.log(`ENGINE CASES AUDIT PASS (${tz}) — ${checks} checks: timesheet weeks, night premium, one-time pay, non-cash benefits, daily pay.`);
