import {
  CPP_RATE, CPP_MAX_CONTRIBUTION, CPP_EXEMPTION, CPP_MAX_PENSIONABLE_EARNINGS,
  CPP2_RATE, CPP2_MAX_CONTRIBUTION,
  QPP_RATE, QPP_MAX_CONTRIBUTION,
  EI_RATE, EI_MAX_CONTRIBUTION,
  QC_EI_RATE, QC_EI_MAX_CONTRIBUTION,
  QPIP_RATE, QPIP_MAX_INSURABLE_EARNINGS,
} from '../constants';

/**
 * When do the payroll caps hit, and what happens to the cheque afterwards?
 *
 * The annual figures elsewhere in the engine are correct — CPP, CPP2 and EI
 * are all capped. But the per-cheque view divides those annual totals evenly,
 * and that is not how a real pay stub behaves: the employer deducts every pay
 * until the year's maximum is reached, THEN STOPS. Someone earning above the
 * ceilings sees their deposit jump mid-year — a $100k earner's CPP ends
 * around September and the late-year cheques are visibly bigger. People who
 * meet this for the first time routinely think payroll made a mistake
 * (or, in January, that they got a pay cut when deductions restart).
 *
 * This simulates the CRA payroll method period by period: prorated $3,500
 * exemption per pay, deduct at the statutory rate, stop at the cap. CPP2
 * starts only once cumulative pensionable earnings pass the first ceiling
 * (YMPE), then runs to its own cap.
 */

export type CapEvent = {
  kind: 'cpp' | 'cpp2' | 'ei' | 'qpip';
  /** 1-based pay period in which the deduction reaches its maximum. */
  period: number;
  /** Approximate month (1-12) of that period, assuming pays spread evenly. */
  month: number;
  /** How much bigger each later cheque is once this deduction stops. */
  perChequeBump: number;
};

export type CapTimeline = {
  periodsPerYear: number;
  events: CapEvent[];
  /** First-cheque net vs last-cheque net difference (sum of all bumps). */
  lastChequeBump: number;
};

export function buildCapTimeline(annualGross: number, periodsPerYear: number, isQuebec: boolean): CapTimeline | null {
  const P = annualGross / periodsPerYear;
  const exemptionPerPay = CPP_EXEMPTION / periodsPerYear;

  const cpp1Rate = isQuebec ? QPP_RATE : CPP_RATE;
  const cpp1Max = isQuebec ? QPP_MAX_CONTRIBUTION : CPP_MAX_CONTRIBUTION;
  const eiRate = isQuebec ? QC_EI_RATE : EI_RATE;
  const eiMax = isQuebec ? QC_EI_MAX_CONTRIBUTION : EI_MAX_CONTRIBUTION;
  const qpipMax = QPIP_RATE * QPIP_MAX_INSURABLE_EARNINGS;

  let cpp1 = 0, cpp2 = 0, ei = 0, qpip = 0, pensionable = 0;
  const events: CapEvent[] = [];
  const month = (period: number) => Math.min(12, Math.ceil((period / periodsPerYear) * 12));

  for (let i = 1; i <= periodsPerYear; i++) {
    // CPP/QPP tier 1: rate on pay above the prorated exemption, until the cap.
    const c1 = Math.min(Math.max(0, P - exemptionPerPay) * cpp1Rate, cpp1Max - cpp1);
    if (cpp1 < cpp1Max && cpp1 + c1 >= cpp1Max - 0.005) {
      events.push({ kind: 'cpp', period: i, month: month(i), perChequeBump: Math.max(0, P - exemptionPerPay) * cpp1Rate });
    }
    cpp1 += c1;

    // CPP2: only on earnings above the first ceiling, to its own cap.
    const aboveYmpeThisPay = Math.max(0, Math.min(pensionable + P, /* YAMPE-bound handled by cap */ Infinity) - Math.max(pensionable, CPP_MAX_PENSIONABLE_EARNINGS));
    const c2 = Math.min(aboveYmpeThisPay * CPP2_RATE, CPP2_MAX_CONTRIBUTION - cpp2);
    if (cpp2 < CPP2_MAX_CONTRIBUTION && c2 > 0 && cpp2 + c2 >= CPP2_MAX_CONTRIBUTION - 0.005) {
      events.push({ kind: 'cpp2', period: i, month: month(i), perChequeBump: P * CPP2_RATE });
    }
    cpp2 += c2;
    pensionable += P;

    // EI: flat rate on every dollar, until the cap.
    const e = Math.min(P * eiRate, eiMax - ei);
    if (ei < eiMax && ei + e >= eiMax - 0.005) {
      events.push({ kind: 'ei', period: i, month: month(i), perChequeBump: P * eiRate });
    }
    ei += e;

    if (isQuebec) {
      const q = Math.min(P * QPIP_RATE, qpipMax - qpip);
      if (qpip < qpipMax && q > 0 && qpip + q >= qpipMax - 0.005) {
        events.push({ kind: 'qpip', period: i, month: month(i), perChequeBump: P * QPIP_RATE });
      }
      qpip += q;
    }
  }

  // Only interesting if something actually caps BEFORE the final cheque —
  // capping on the last pay of the year is just "the math worked out".
  const early = events.filter((e) => e.period < periodsPerYear);
  if (!early.length) return null;
  return {
    periodsPerYear,
    events: early.sort((a, b) => a.period - b.period),
    lastChequeBump: Math.round(early.reduce((s, e) => s + e.perChequeBump, 0) * 100) / 100,
  };
}
