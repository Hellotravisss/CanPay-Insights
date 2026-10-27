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
  /** The deductions that reach their maximum in this step (several when they cap on neighbouring cheques). */
  kinds: Array<'cpp' | 'cpp2' | 'ei' | 'qpip'>;
  /** 1-based pay period of the first cheque at the new, bigger level. */
  period: number;
  /** Month (1-12) of that cheque, assuming pays spread evenly. */
  month: number;
  /**
   * How much bigger each cheque is after this step than before it: deductions
   * on the cheque before the step minus deductions on the first cheque after it.
   * Real cheques, so whatever starts on the same pay counts too — CPP2 begins
   * exactly where CPP ends, and the old per-deduction figure overstated the
   * jump by the CPP2 that replaces it (review 2026-10-26). Steps telescope:
   * together they make up the first-to-last difference.
   */
  perChequeBump: number;
};

export type CapTimeline = {
  periodsPerYear: number;
  events: CapEvent[];
  /** Deductions on the first cheque minus deductions on the last one. */
  lastChequeBump: number;
  /** Total CPP/QPP, CPP2/QPP2, EI and QPIP deducted on each cheque, 1-based (index 0 unused). */
  deductionsByPeriod: number[];
};

const cents = (v: number) => Math.round(v * 100) / 100;

export type PaySimulation = {
  /** Gross pay per period. */
  pay: number;
  /** Employee deductions on each pay, 1-based (index 0 unused). */
  cpp: number[]; cpp2: number[]; ei: number[]; qpip: number[];
  /** Pay in which each deduction reaches its annual maximum. */
  capped: Array<{ kind: CapEvent['kinds'][number]; period: number }>;
};

/**
 * Employee CPP/QPP, CPP2/QPP2, EI and QPIP on every pay of the year, by the CRA
 * method: prorated exemption per pay, statutory rate, stop at the cap; CPP2 only
 * once cumulative pensionable earnings pass the first ceiling. Shared by the
 * year-end card and the employer payroll calculator.
 */
export function simulatePays(annualGross: number, periodsPerYear: number, isQuebec: boolean): PaySimulation {
  const P = annualGross / periodsPerYear;
  const exemptionPerPay = CPP_EXEMPTION / periodsPerYear;

  const cpp1Rate = isQuebec ? QPP_RATE : CPP_RATE;
  const cpp1Max = isQuebec ? QPP_MAX_CONTRIBUTION : CPP_MAX_CONTRIBUTION;
  const eiRate = isQuebec ? QC_EI_RATE : EI_RATE;
  const eiMax = isQuebec ? QC_EI_MAX_CONTRIBUTION : EI_MAX_CONTRIBUTION;
  const qpipMax = QPIP_RATE * QPIP_MAX_INSURABLE_EARNINGS;

  let cpp1 = 0, cpp2 = 0, ei = 0, qpip = 0, pensionable = 0;
  const out: PaySimulation = { pay: P, cpp: [0], cpp2: [0], ei: [0], qpip: [0], capped: [] };
  const caps = (sofar: number, add: number, max: number) => sofar < max && add > 0 && sofar + add >= max - 0.005;

  for (let i = 1; i <= periodsPerYear; i++) {
    // CPP/QPP tier 1: rate on pay above the prorated exemption, until the cap.
    const c1 = Math.min(Math.max(0, P - exemptionPerPay) * cpp1Rate, cpp1Max - cpp1);
    if (caps(cpp1, c1, cpp1Max)) out.capped.push({ kind: 'cpp', period: i });
    cpp1 += c1;

    // CPP2/QPP2: only on cumulative earnings above the first ceiling, to its own cap.
    const aboveYmpeThisPay = Math.max(0, pensionable + P - Math.max(pensionable, CPP_MAX_PENSIONABLE_EARNINGS));
    const c2 = Math.min(aboveYmpeThisPay * CPP2_RATE, CPP2_MAX_CONTRIBUTION - cpp2);
    if (caps(cpp2, c2, CPP2_MAX_CONTRIBUTION)) out.capped.push({ kind: 'cpp2', period: i });
    cpp2 += c2;
    pensionable += P;

    // EI: flat rate on every dollar, until the cap.
    const e = Math.min(P * eiRate, eiMax - ei);
    if (caps(ei, e, eiMax)) out.capped.push({ kind: 'ei', period: i });
    ei += e;

    let q = 0;
    if (isQuebec) {
      q = Math.min(P * QPIP_RATE, qpipMax - qpip);
      if (caps(qpip, q, qpipMax)) out.capped.push({ kind: 'qpip', period: i });
      qpip += q;
    }
    out.cpp.push(c1); out.cpp2.push(c2); out.ei.push(e); out.qpip.push(q);
  }
  return out;
}

export function buildCapTimeline(annualGross: number, periodsPerYear: number, isQuebec: boolean): CapTimeline | null {
  const sim = simulatePays(annualGross, periodsPerYear, isQuebec);
  const capped = sim.capped;
  const D: number[] = [0];
  for (let i = 1; i <= periodsPerYear; i++) D.push(sim.cpp[i] + sim.cpp2[i] + sim.ei[i] + sim.qpip[i]);
  const month = (period: number) => Math.min(12, Math.ceil((period / periodsPerYear) * 12));

  // Only interesting if something caps BEFORE the final cheque and the cheques
  // after it really are bigger — capping on the last pay is "the math worked out".
  // A step is a run of consecutive cheques whose deductions change; it ends on
  // the first cheque at the new level. A run with no cap in it — CPP2 starting
  // a pay or two after CPP stops — belongs to the step before it, so the steps
  // add up exactly to the first-to-last difference.
  const runs: Array<{ first: number; last: number }> = [];
  for (let i = 2; i <= periodsPerYear; i++) {
    if (Math.abs(D[i] - D[i - 1]) < 0.005) continue;
    const prev = runs[runs.length - 1];
    if (prev && i === prev.last + 1) prev.last = i;
    else runs.push({ first: i, last: i });
  }
  const steps: Array<{ kinds: CapEvent['kinds']; first: number; last: number }> = [];
  for (const r of runs) {
    const kinds = capped.filter((c) => c.period >= r.first - 1 && c.period <= r.last).map((c) => c.kind);
    const prev = steps[steps.length - 1];
    if (!kinds.length && prev) prev.last = r.last;
    else steps.push({ kinds, first: r.first, last: r.last });
  }
  const events: CapEvent[] = steps
    // Capping on the last pay is "the math worked out", not a bigger cheque to explain.
    .filter((st) => st.kinds.length && capped.some((c) => st.kinds.includes(c.kind) && c.period < periodsPerYear))
    .map((st) => ({
      kinds: st.kinds,
      period: st.last,
      month: month(st.last),
      perChequeBump: cents(D[st.first - 1] - D[st.last]),
    }))
    .filter((e) => e.perChequeBump >= 1);
  const lastChequeBump = cents(D[1] - D[periodsPerYear]);
  if (!events.length || lastChequeBump < 1) return null;
  return { periodsPerYear, events, lastChequeBump, deductionsByPeriod: D };
}
