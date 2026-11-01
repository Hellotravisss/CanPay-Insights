import { CalculationMode, type SalaryInputs, type TimesheetInputs } from '../types';
import type { WorkPattern } from './telemetry';

// Derive the anonymous work-schedule PATTERN for telemetry: hour-of-day,
// days/week, unpaid break length. Deliberately drops calendar dates — the
// pattern is the dataset ("who works weekends", "whose break is unpaid"),
// specific dates could identify a person and add nothing analytically.
const hourOf = (hhmm: string): number | null => {
  const h = parseInt(hhmm?.split(':')[0] ?? '', 10);
  return Number.isFinite(h) && h >= 0 && h <= 23 ? h : null;
};
// Minutes since midnight. Paid hours are computed from these: hourOf() alone
// dropped the minutes, so 10:30-16:00 counted as 6 h, and a 27.5-hour week
// crossed StatCan's 30-hour part-time line (fixed 2026-11-01).
const minuteOf = (hhmm: string): number | null => {
  const h = hourOf(hhmm);
  if (h === null) return null;
  const m = parseInt(hhmm.split(':')[1] ?? '0', 10);
  return h * 60 + (Number.isFinite(m) && m >= 0 && m <= 59 ? m : 0);
};
const spanHours = (start: number, end: number) => (end - start + (end <= start ? 1440 : 0)) / 60; // overnight shifts wrap
// Monday of the date's week. Weeks used to be counted from 1 January, so in a
// year starting on a Thursday every Monday-to-Friday week was split in two
// and recorded as 3 days a week (fixed 2026-11-01).
const mondayOf = (d: string): string => {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
};
const modal = (xs: number[]): number => {
  const counts = new Map<number, number>();
  xs.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
};
export function buildWorkPattern(
  mode: CalculationMode,
  simple: SalaryInputs,
  timesheet: TimesheetInputs
): WorkPattern | null {
  if (mode === CalculationMode.SIMPLE) {
    const s = simple.shift;
    const start = hourOf(s.startTime);
    const end = hourOf(s.endTime);
    const daysPerWeek = s.daysActive.filter(Boolean).length;
    if (start === null || end === null || daysPerWeek === 0) return null;
    const paid = Math.max(0, spanHours(minuteOf(s.startTime) as number, minuteOf(s.endTime) as number) - s.unpaidBreakMinutes / 60);
    return {
      shiftStartHour: start,
      shiftEndHour: end,
      unpaidBreakMin: Math.max(0, Math.min(480, s.unpaidBreakMinutes || 0)),
      daysPerWeek,
      worksWeekend: s.daysActive[0] || s.daysActive[6],
      avgDailyHours: Math.round(paid * 10) / 10,
    };
  }
  if (mode === CalculationMode.TIMESHEET) {
    const entries = timesheet.entries.filter(
      (en) => hourOf(en.checkIn) !== null && hourOf(en.checkOut) !== null && en.date
    );
    if (entries.length === 0) return null;
    const starts = entries.map((en) => hourOf(en.checkIn) as number);
    const ends = entries.map((en) => hourOf(en.checkOut) as number);
    const breaks = entries.map((en) => Math.max(0, Math.min(480, en.unpaidBreakMinutes || 0)));
    const paidHours = entries.map((en, i) =>
      Math.max(0, spanHours(minuteOf(en.checkIn) as number, minuteOf(en.checkOut) as number) - breaks[i] / 60));
    const dates = [...new Set(entries.map((en) => en.date))];
    const weeks = new Set(dates.map(mondayOf));
    return {
      shiftStartHour: modal(starts),
      shiftEndHour: modal(ends),
      unpaidBreakMin: modal(breaks),
      daysPerWeek: Math.max(1, Math.min(7, Math.round(dates.length / Math.max(1, weeks.size)))),
      worksWeekend: dates.some((d) => [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay())),
      avgDailyHours:
        Math.round((paidHours.reduce((a, b) => a + b, 0) / paidHours.length) * 10) / 10,
    };
  }
  return null; // annual mode has no schedule
}
