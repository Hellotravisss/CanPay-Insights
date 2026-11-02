/**
 * audit:telemetry — the telemetry pipeline computes what the methodology says.
 *
 * Telemetry errors never crash; they quietly publish a wrong share. Each case
 * below is a concrete, synthetic situation that once produced a wrong figure
 * (data-pipeline review, 2026-11-01). No production data is involved.
 *
 *   npx tsx scripts/auditTelemetry.ts
 */
import { buildWorkPattern } from '../lib/workPattern';
import { dedupeKey, deriveEmploymentShape, SCHEMA_VERSION, type WorkPattern } from '../lib/telemetry';
import { calcStats, calcStatsExtra, monthlySnapshot, type Ev } from '../lib/d1/events';
import { computePayBehaviour } from '../lib/payBehaviour';
import type { D1 } from '../lib/d1/db';
import { CalculationMode, PayFrequency, Province, type SalaryInputs, type TimesheetInputs } from '../types';

const failures: string[] = [];
let passed = 0;
function check(name: string, got: unknown, want: unknown) {
  if (JSON.stringify(got) === JSON.stringify(want)) { passed++; return; }
  failures.push(`${name}\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`);
}

// ── fixtures ───────────────────────────────────────────────────────────────
const simple = (start: string, end: string, breakMin: number, days: boolean[]): SalaryInputs => ({
  province: Province.ON, hourlyWage: 25,
  shift: { startTime: start, endTime: end, unpaidBreakMinutes: breakMin, daysActive: days },
  premium: { enabled: false, ratePerHour: 0, startTime: '00:00', endTime: '06:00' },
  rrspContributionPerPeriod: 0,
} as SalaryInputs);
const MON_FRI = [false, true, true, true, true, true, false];
const TUE_SAT = [false, false, true, true, true, true, true];
const sheet = (dates: string[], checkIn = '09:00', checkOut = '17:00', breakMin = 30): TimesheetInputs => ({
  province: Province.ON, hourlyWage: 25, payFrequency: PayFrequency.WEEKLY,
  entries: dates.map((date, i) => ({ id: String(i), date, checkIn, checkOut, unpaidBreakMinutes: breakMin })),
} as TimesheetInputs);
const noTimesheet = sheet([]);

// ── 1. Timesheet days per week ─────────────────────────────────────────────
// Weeks were counted from 1 January, so in a year that starts on a Thursday
// (2026) a Monday-to-Friday week was split in two, recorded as 3 days a week,
// and a full-time worker became 'part-time-hourly'.
{
  const oneWeek = buildWorkPattern(CalculationMode.TIMESHEET, simple('09:00', '17:00', 30, MON_FRI), sheet(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']));
  check('timesheet: one Mon-Fri week (2026-11-02..06) is 5 days a week', oneWeek?.daysPerWeek, 5);
  check('timesheet: one Mon-Fri week of 7.5 h days is full time', deriveEmploymentShape('timesheet', oneWeek, null), 'full-time-hourly');
  const twoWeeks = buildWorkPattern(CalculationMode.TIMESHEET, simple('09:00', '17:00', 30, MON_FRI), sheet([
    '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06',
    '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']));
  check('timesheet: a two-week Mon-Fri pay period is 5 days a week', twoWeeks?.daysPerWeek, 5);
  const weekend = buildWorkPattern(CalculationMode.TIMESHEET, simple('09:00', '17:00', 30, MON_FRI), sheet(['2026-11-07', '2026-11-08']));
  check('timesheet: a Sat+Sun weekend is 2 days a week', weekend?.daysPerWeek, 2);
}

// ── 2. Paid hours from minutes, not whole hours ────────────────────────────
// hourOf() dropped the minutes, so 10:30-16:00 counted as 6 h, and a 27.5 h
// part-time week crossed StatCan's 30 h line into 'full-time-hourly'.
{
  const p = buildWorkPattern(CalculationMode.SIMPLE, simple('10:30', '16:00', 0, MON_FRI), noTimesheet);
  check('simple: 10:30-16:00 is 5.5 paid hours', p?.avgDailyHours, 5.5);
  check('simple: 5 x 5.5 h = 27.5 h a week is part time', deriveEmploymentShape('simple', p, null), 'part-time-hourly');
  check('simple: start hour is still the hour of day', p?.shiftStartHour, 10);
  const q = buildWorkPattern(CalculationMode.SIMPLE, simple('08:45', '17:15', 30, MON_FRI), noTimesheet);
  check('simple: 08:45-17:15 less 30 min is 8 paid hours', q?.avgDailyHours, 8);
  const night = buildWorkPattern(CalculationMode.SIMPLE, simple('22:30', '06:00', 30, MON_FRI), noTimesheet);
  check('simple: overnight 22:30-06:00 less 30 min is 7 paid hours', night?.avgDailyHours, 7);
  const t = buildWorkPattern(CalculationMode.TIMESHEET, simple('09:00', '17:00', 30, MON_FRI), sheet(['2026-11-02', '2026-11-03'], '10:30', '16:00', 0));
  check('timesheet: 10:30-16:00 is 5.5 paid hours', t?.avgDailyHours, 5.5);
}

// ── 3. Dedupe key ──────────────────────────────────────────────────────────
// works_weekend was not in the key: moving a Mon-Fri week to Tue-Sat (same
// hours, same day count) in the same page load was dropped as a repeat.
{
  const a = buildWorkPattern(CalculationMode.SIMPLE, simple('09:00', '17:00', 30, MON_FRI), noTimesheet) as WorkPattern;
  const b = buildWorkPattern(CalculationMode.SIMPLE, simple('09:00', '17:00', 30, TUE_SAT), noTimesheet) as WorkPattern;
  const base = { mode: 'simple' as const, province: 'Ontario', annualIncome: 52000, lang: 'en' };
  check('dedupe: Mon-Fri and Tue-Sat are different calculations',
    dedupeKey({ ...base, work: a }, 'web', '50-70k', null) !== dedupeKey({ ...base, work: b }, 'web', '50-70k', null), true);
  // $20 → $22 an hour stays in the 30-50k bracket. Without wage_edited in the key the
  // edited calculation was a repeat of the default one, and only the default row survived.
  const dflt = { mode: 'simple' as const, province: 'Ontario', annualIncome: 41600, lang: 'en' };
  check('dedupe: editing the opening wage within its bracket is a new calculation',
    dedupeKey({ ...dflt, wageEdited: false }, 'web', '30-50k', null) !== dedupeKey({ ...dflt, annualIncome: 45760, wageEdited: true }, 'web', '30-50k', null), true);
}

// Rows written with the corrected schedule maths must be distinguishable.
check('web/widget rows written by this build are schema_version 2', SCHEMA_VERSION, 2);

// ── 4. Weekend share honours the app schema_version rule ───────────────────
// docs/telemetry-methodology.md: works_weekend is unknown where source = 'app'
// and schema_version = 1 (iOS default week was Sunday-Thursday).
const row = (o: Partial<Ev>): Ev => ({
  created_at: '2026-10-15T18:00:00.000Z', mode: 'simple', province: 'Ontario', income_bracket: '30-50k', lang: 'en',
  source: 'web', schema_version: 1, unpaid_break_min: 30, shift_start_hour: 9, shift_end_hour: 17, days_per_week: 5,
  avg_daily_hours: 7.5, works_weekend: 0, session_id: null, excluded: null, product_interest: null, ...o,
});
{
  const ev: Ev[] = [
    row({ works_weekend: 1 }), row({}), row({}), row({}),                                   // web: 1 of 4
    row({ source: 'app', works_weekend: 1 }), row({ source: 'app', works_weekend: 1 }),      // app before 1.3.0: unknown
    row({ source: 'app', works_weekend: 1 }), row({ source: 'app', works_weekend: 1 }),
    row({ source: 'app', schema_version: 2, works_weekend: 1 }), row({ source: 'app', schema_version: 2 }), // app 1.3.0+: 1 of 2
  ];
  const s = calcStats(ev, 0);
  check('calcStats: weekend share leaves out app schema 1 (2 of 6)', s.work.weekend_share, 33.3);
  check('calcStats: weekend share counts only rows where it is known', s.work.weekend_n, 6);
  check('calcStats: other work figures still use every schedule', s.work.n, 10);
  const m = monthlySnapshot(ev, '2026-10');
  check('monthlySnapshot: weekend share leaves out app schema 1', m.work.weekend_share, 33.3);
  check('monthlySnapshot: weekend_n', m.work.weekend_n, 6);
}

// ── 4b. Zero tips is not tipped service ────────────────────────────────────
// The timesheet calculator always sends a tips bucket, '0' when no tips were
// entered. '0' is a non-empty string, so every timesheet visitor was recorded as
// 'tipped-service': in production 408 of 409 such rows had tips_pct_bucket '0'.
{
  const noTips = { tipsPctBucket: '0', shiftPremium: false } as Parameters<typeof deriveEmploymentShape>[2];
  const week = buildWorkPattern(CalculationMode.TIMESHEET, simple('09:00', '17:00', 30, MON_FRI), sheet(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']));
  check('shape: a timesheet with 0% tips is not tipped-service', deriveEmploymentShape('timesheet', week, noTips), 'full-time-hourly');
  const tips = { tipsPctBucket: '10-20', shiftPremium: false } as Parameters<typeof deriveEmploymentShape>[2];
  check('shape: a timesheet with tips is tipped-service', deriveEmploymentShape('timesheet', week, tips), 'tipped-service');
  // Rows already stored that way are read as unknown, not as tipped service.
  const x = calcStatsExtra([
    row({ mode: 'timesheet', employment_shape: 'tipped-service', tips_pct_bucket: '0' }),
    row({ mode: 'timesheet', employment_shape: 'tipped-service', tips_pct_bucket: '1-10' }),
    row({ employment_shape: 'full-time-hourly' }),
  ]);
  const shapes = Object.fromEntries(x.by_shape.map((r) => [r.k, r.n]));
  check('by_shape: stored tipped-service rows with 0% tips are not counted as tipped', shapes['tipped-service'], 1);
}

// ── 5. Research page: one filter for numerator and denominator ─────────────
// The "two or more provinces" numerator was a separate SQL query that kept
// fake-door / offer-comparison taps (product_interest rows). An offer
// comparison records offer A's province, so a visit that calculated only in
// Ontario but compared a BC offer counted as pricing two provinces.
{
  const table: Ev[] = [
    row({ session_id: 's1' }), row({ session_id: 's1', product_interest: 'offer-compare', province: 'British Columbia' }),
    row({ session_id: 's2' }), row({ session_id: 's2', province: 'Alberta' }),
    row({ session_id: 's3' }),
    row({ session_id: 's4', excluded: 1 }), row({ session_id: 's4', excluded: 1, province: 'Quebec' }),
  ];
  // What loadEvents(d) returns: no excluded rows, no taps.
  const ev = table.filter((r) => r.excluded !== 1 && r.product_interest === null);
  // A D1 stand-in that answers the per-session SQL the page used to run over the whole table.
  const fake: D1 = {
    prepare: (sql: string) => {
      const run = async () => {
        if (/count\(distinct province\)/.test(sql)) {
          const m = new Map<string, Set<string>>();
          for (const r of table) if (r.session_id && r.excluded !== 1) m.set(r.session_id as string, (m.get(r.session_id as string) ?? new Set()).add(r.province as string));
          return { n: [...m.values()].filter((s) => s.size > 1).length };
        }
        return null;
      };
      const stmt = { all: async () => ({ results: [] }), run: async () => ({}), first: run as never };
      return { ...stmt, bind: () => stmt } as never;
    },
    batch: async () => [],
  };
  const snap = await computePayBehaviour(fake, ev);
  check('research: visits pricing 2+ provinces count calculations only', snap.move.multiProv, 1);
  check('research: move share = 1 of 3 visits', snap.move.share, 33);

  // Weekend finding on the research page uses the same known-only base.
  const wk = await computePayBehaviour(fake, [row({ works_weekend: 1 }), row({}), row({ source: 'app', works_weekend: 1 })]);
  check('research: weekend share leaves out app schema 1', wk.weekend.share, 50);
  check('research: weekend n is the rows it was computed on', wk.weekend.n, 2);

  // "x% of the calculations sit below the median wage": all calculations on
  // the page, not just the current calendar year.
  const yr = await computePayBehaviour(fake, [
    row({ median_ratio_bucket: '0.5-0.75' }), row({ median_ratio_bucket: '0.5-0.75' }),
    row({ created_at: '2027-01-03T18:00:00.000Z', median_ratio_bucket: '1.5-2' }),
  ]);
  check('research: below-median share covers every calculation on the page', yr.belowMedianShare, 67);
}

if (failures.length) {
  console.log(`TELEMETRY AUDIT FAIL — ${failures.length} case(s):\n`);
  for (const f of failures) console.log('  ' + f);
  process.exit(1);
}
console.log(`TELEMETRY AUDIT PASS — ${passed} pipeline cases compute what docs/telemetry-methodology.md says.`);
