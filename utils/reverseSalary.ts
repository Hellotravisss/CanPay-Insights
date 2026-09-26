import { calculateFromAnnualSalary } from './taxEngine';
import type { AnnualSalaryInputs } from '../types';

/**
 * Net → gross: the smallest whole-dollar annual salary whose take-home, under
 * exactly the same inputs (province, pay frequency, RRSP, extra income and
 * deductions), reaches `targetNetAnnual`.
 *
 * It searches with the engine itself rather than inverting any formula. A
 * separate inverse formula is exactly the "parallel formula" that once put the
 * advisor's marginal rate wrong in 90 of 91 cells while the golden test stayed
 * green: only numbers that come out of calculateFromAnnualSalary are checked
 * against the CRA tables. Take-home rises with salary (audit:consistency checks
 * monotonicity), so a bisection is exact to the dollar.
 *
 * Returns null when no salary up to the ceiling reaches the target.
 */
export const REVERSE_MAX_GROSS = 2_000_000;

export function netForGross(gross: number, base: AnnualSalaryInputs): number {
  return calculateFromAnnualSalary({ ...base, annualSalary: gross }).netPayAnnual;
}

export function grossForNet(targetNetAnnual: number, base: AnnualSalaryInputs): number | null {
  if (!Number.isFinite(targetNetAnnual) || targetNetAnnual <= 0) return null;
  if (netForGross(REVERSE_MAX_GROSS, base) < targetNetAnnual) return null;
  let lo = 0;
  let hi = REVERSE_MAX_GROSS;
  // Invariant: net(lo) < target <= net(hi). Whole dollars, so ~21 steps.
  if (netForGross(0, base) >= targetNetAnnual) return 0;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (netForGross(mid, base) >= targetNetAnnual) hi = mid;
    else lo = mid;
  }
  return hi;
}
