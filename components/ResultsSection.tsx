'use client';
import { taxDays } from '../utils/taxDays';
import { TAX_YEAR } from '../constants';
import { useBelowViewport } from './useBelowViewport';
import React from 'react';
import AnimatedAmount from './AnimatedAmount';
import { CalculationResult, PayFrequency, Province } from '../types';
import { provinceDisplayName } from '../lib/provinceNames';
import { useT } from '../lib/i18n';
import { formatMoney, formatPercent } from '../lib/money';

interface Props {
  results: CalculationResult;
  provinceName?: string;
}

type ChartDatum = {
  name: string;
  value: number;
  color: string;
};

const PaycheckDonutChart = ({
  data,
  formatCurrency,
  netPayPercent,
  netPayLabel,
  lang,
}: {
  lang: string;
  data: ChartDatum[];
  formatCurrency: (value: number) => string;
  netPayPercent: number;
  netPayLabel: string;
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const maskId = `donut-sweep-${React.useId().replace(/:/g, '')}`;
  const size = 220;
  const center = size / 2;
  const radius = 72;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + Math.max(item.value, 0), 0);

  const segments = React.useMemo(() => {
    if (total <= 0) return [];

    const gap = 3; // a 2px-ish surface gap between segments (chart rule)
    let cursor = 0;

    return data
      .map((item, index) => {
        const rawLength = (Math.max(item.value, 0) / total) * circumference;
        const visibleLength = Math.max(rawLength - gap, 0);
        const segment = {
          ...item,
          index,
          length: visibleLength,
          offset: -cursor,
          percent: Math.round((Math.max(item.value, 0) / total) * 100),
        };

        cursor += rawLength;
        return segment;
      })
      .filter((segment) => segment.length > 0);
  }, [circumference, data, total]);

  const activeSegment = activeIndex === null ? null : segments.find((segment) => segment.index === activeIndex);

  return (
    <div className="pc relative mx-auto flex w-full max-w-sm flex-col items-center justify-center">
      <div className="relative h-[220px] w-[220px]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Paycheck breakdown donut chart"
          className="h-full w-full overflow-visible"
        >
          {/* the ring is revealed by a mask that sweeps clockwise from 12 o'clock once (globals.css .pm-sweep);
              when the figures change, each segment slides to its new share instead of redrawing */}
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={size} height={size}>
              <circle
                className="pm-sweep"
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#fff"
                strokeWidth={strokeWidth + 4}
                pathLength={1}
                strokeDasharray="1"
                transform={`rotate(-90 ${center} ${center})`}
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#EEEEF3" strokeWidth={strokeWidth} />
            <g transform={`rotate(-90 ${center} ${center})`}>
              {segments.map((segment) => (
                <circle
                  key={segment.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="butt"
                  strokeDasharray={`${segment.length} ${circumference - segment.length}`}
                  strokeDashoffset={segment.offset}
                  className="cursor-default"
                  style={{
                    opacity: activeIndex === null || activeIndex === segment.index ? 1 : 0.42,
                    transition: 'opacity 150ms cubic-bezier(0.2,0,0,1), stroke-dasharray 320ms cubic-bezier(0.2,0,0,1), stroke-dashoffset 320ms cubic-bezier(0.2,0,0,1)',
                  }}
                  onMouseEnter={() => setActiveIndex(segment.index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <title>{`${segment.name}: ${formatCurrency(segment.value)}`}</title>
                </circle>
              ))}
            </g>
          </g>
        </svg>
        <div className="pm-fade pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" style={{ ['--i' as string]: 8 }}>
          <p className="font-display text-[2.5rem] leading-none font-semibold text-red-600 tabular-nums">{netPayPercent}<span className={`text-xl align-top${lang === 'fr' ? ' ml-1' : ''}`}>%</span></p>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5E6270]">{netPayLabel}</span>
        </div>
      </div>

      {activeSegment && (
        <div className="absolute top-2 z-10 rounded-lg border border-[#E3E3EA] bg-white px-3 py-2 text-xs shadow-lg tabular-nums">
          <p className="font-bold text-ink">{activeSegment.name}</p>
          <p className="text-[#535866]">
            {formatCurrency(activeSegment.value)} · {formatPercent(activeSegment.percent, lang)}
          </p>
        </div>
      )}

      {/* legend: identity + share, amounts live in the table beside it */}
      <ul className="mt-4 grid w-full grid-cols-2 gap-x-5 gap-y-2 text-[13px]">
        {segments.map((item) => (
          <li
            key={item.name}
            className="pm-fade flex items-center gap-2 min-w-0"
            style={{ ['--i' as string]: 10 + item.index * 2 }}
            onMouseEnter={() => setActiveIndex(item.index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: item.color }} />
            <span className="truncate text-[#2B2E36]">{item.name}</span>
            <span className="ml-auto tabular-nums text-[#5E6270]">{formatPercent(item.percent, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ResultsSection: React.FC<Props> = ({ results, provinceName }) => {
  const { t, lang } = useT();
  const formatCurrency = React.useCallback((val: number) => formatMoney(val, lang, 2), [lang]);
  // RSUs (annual mode): in the year's totals, not on the cheque. totalPay is what the year's
  // deductions come out of, so the bar and the three rows add up.
  const equity = results.equityAnnual ?? 0;
  const totalPay = results.grossPayAnnual + equity;
  
  // Get pay frequency display label
  const getPayFrequencyLabel = (frequency?: string) => {
    switch (frequency) {
      case 'daily': return t('ts.daily');
      case 'weekly': return t('ts.weekly');
      case 'bi-weekly': return t('res.biweekly');
      case 'semi-monthly': return t('res.semiMonthly');
      case 'monthly': return t('ts.monthly');
      case 'quarterly': return t('ts.quarterly');
      default: return t('res.biweekly');
    }
  };

  const netPayLabel = t('res.netPay');

  // On a phone the inputs sit above the results, so the answer is off screen
  // while the reader edits them; a frosted bar shows it until the card is reached.
  const heroRef = React.useRef<HTMLDivElement>(null);
  const heroBelow = useBelowViewport(heroRef);
  // One pass of light across the card's banknote lines when a NEW result lands (not on first render).
  const netForFoil = hasCustomFrequency_(results) ? (results.netPayPerPeriod || results.netPayBiWeekly) : results.netPayBiWeekly;
  const foilFirst = React.useRef(true);
  React.useEffect(() => {
    if (foilFirst.current) { foilFirst.current = false; return; }
    const el = heroRef.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.remove('pm-foil'); void el.offsetWidth; el.classList.add('pm-foil');
  }, [netForFoil]);
  const days = taxDays(results);
  // 是否是年薪或打卡模式（有 payFrequency 字段）
  const hasCustomFrequency = !!results.payFrequency;
  const payPeriodLabel = hasCustomFrequency ? getPayFrequencyLabel(results.payFrequency) : t('res.biweekly');

  const chartData = React.useMemo(() => [
    { name: t('res.netPay'), value: results.netPayBiWeekly, color: '#C8161A' }, // brand red = the money you keep
    // deductions: the ink ramp in pay-stub order (PayFamily-brand/18-charts, validated: light end 2.44:1 on white)
    { name: t('res.fedTax'), value: results.federalTax, color: '#2B2E36' },
    { name: t('res.provTax'), value: results.provincialTax, color: '#535866' },
    { name: t('res.cppEi'), value: results.cppDeduction + results.eiDeduction, color: '#7C818D' },
    // Pension, RRSP, union dues and the rest: without this slice the donut's
    // shares summed to less than gross and overstated the net-pay percentage.
    { name: t('annual.otherDed'), value: (results.rrspDeduction ?? 0) + (results.pensionDeduction ?? 0) + (results.otherDeductions ?? 0), color: '#A2A6B0' },
  ].filter((d) => d.value > 0), [t, results.cppDeduction, results.eiDeduction, results.federalTax, results.netPayBiWeekly, results.provincialTax, results.rrspDeduction, results.pensionDeduction, results.otherDeductions]);

  const totalHours = results.regularHours + results.overtimeHours15 + results.overtimeHours20;
  const earn = results.earnings ?? {};
  const netPayPercent = results.grossPayBiWeekly > 0
    ? Math.round((results.netPayBiWeekly / results.grossPayBiWeekly) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Summary: one slim red band for this cheque, the year in a row beneath it.
          Side by side, the red card was stretched to the annual card's height and
          left a large empty red block (Travis, 2026-11-02). */}
      <div className="space-y-4">
        <div ref={heroRef} className="card-brand-3d rounded-2xl px-6 py-5 text-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-red-100 text-xs font-bold uppercase tracking-widest mb-1">
                {payPeriodLabel} · {t('res.netPay')}
              </h3>
              <p className="text-4xl font-extrabold tracking-tight tabular-nums">
                <AnimatedAmount
                  value={hasCustomFrequency ? (results.netPayPerPeriod || results.netPayBiWeekly) : results.netPayBiWeekly}
                  format={formatCurrency}
                />
              </p>
              {/* People budget by the month; on bi-weekly pay "two cheques" is not a
                  month (26 a year, so two months have three). A user compared two
                  cheques with a monthly figure and read a $200 gap as an error. */}
              {results.payFrequency !== PayFrequency.MONTHLY && results.netPayAnnual > 0 && (
                <p className="text-sm text-red-100 mt-1 tabular-nums">
                  {t('res.monthlyAvg')} <span className="font-bold text-white">{formatCurrency((results.netPayAnnualCash ?? results.netPayAnnual) / 12)}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-red-50 font-medium sm:justify-end">
              <span className="chip-glass px-3 py-1 rounded-full text-xs font-semibold">
                {totalHours > 0 ? `${totalHours.toFixed(1)} ${t('res.hoursCap')}` : payPeriodLabel}
              </span>
              <span className="chip-glass px-3 py-1 rounded-full tabular-nums">
                {t('res.grossPrePeriod')}{' '}
                <span className="font-bold text-white">
                  {formatCurrency(hasCustomFrequency ? (results.grossPayPerPeriod || results.grossPayBiWeekly) : results.grossPayBiWeekly)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {heroBelow && (
          <button
            type="button"
            onClick={() => heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="glass-bar lg:hidden fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-3 rounded-full border border-white/60 px-5 py-3 text-left shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)]"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#535866]">{payPeriodLabel} · {t('res.netPay')}</span>
            <span className="text-xl font-extrabold tabular-nums text-red-600">
              {formatCurrency(hasCustomFrequency ? (results.netPayPerPeriod || results.netPayBiWeekly) : results.netPayBiWeekly)}
            </span>
          </button>
        )}

        {/* Annual Card: the year in one bar (kept vs deducted), then three ruled lines */}
        <div className="bg-white rounded-2xl border border-[#E3E3EA] p-6 relative overflow-hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5E6270]">{TAX_YEAR}</p>
          <h3 className="font-display text-xl font-semibold text-[#15171C] mb-4">{t('res.annualProjection')}</h3>

          {totalPay > 0 && (
            <div className="pc mb-5" aria-hidden="true">
              <div className="pm-x flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full">
                <div className="h-full rounded-l-full bg-[#C8161A] transition-[width] duration-500 ease-[cubic-bezier(0.2,0,0,1)]" style={{ width: `${Math.max(0, Math.min(100, (results.netPayAnnual / totalPay) * 100))}%` }} />
                <div className="h-full flex-1 rounded-r-full bg-[#A2A6B0]" />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-[#5E6270] tabular-nums">
                <span><span className="font-semibold text-red-600">{formatPercent(Math.round((results.netPayAnnual / totalPay) * 100), lang)}</span> {t('res.netPay')}</span>
                <span>{formatPercent(Math.round((results.totalDeductionsAnnual / totalPay) * 100), lang)} {t('res.deductions')}</span>
              </div>
            </div>
          )}

          <dl className="divide-y divide-[#E3E3EA] border-y border-[#E3E3EA]">
            <div className="flex justify-between items-baseline gap-4 py-2.5">
              <dt className="text-sm text-[#5E6270]">{t('res.grossIncomePre')}</dt>
              <dd className="text-lg font-semibold text-[#15171C] tabular-nums">{formatCurrency(results.grossPayAnnual)}</dd>
            </div>
            {equity > 0 && (
              <div className="flex justify-between items-baseline gap-4 py-2.5">
                <dt className="text-sm text-[#5E6270]">{t('res.equityRow')}</dt>
                <dd className="text-base font-semibold text-[#15171C] tabular-nums">+ {formatCurrency(equity)}</dd>
              </div>
            )}
            <div className="flex justify-between items-baseline gap-4 py-2.5">
              <dt className="text-sm text-[#5E6270]">{t('res.totalTaxDed')}</dt>
              <dd className="text-base text-[#535866] tabular-nums">− {formatCurrency(results.totalDeductionsAnnual)}</dd>
            </div>
            <div className="flex justify-between items-baseline gap-4 py-3">
              <dt className="text-sm font-semibold text-[#15171C]">{t('res.netIncomePost')}</dt>
              <dd className="font-display text-[1.9rem] leading-none font-semibold text-red-600 tabular-nums whitespace-nowrap">{formatCurrency(results.netPayAnnual)}</dd>
            </div>
          </dl>
          {equity > 0 && results.netPayAnnualCash !== undefined && (
            <p className="mt-2 text-xs leading-5 text-[#5E6270]">
              {t('res.netInclShares').replace('{v}', formatCurrency(results.netPayAnnual - results.netPayAnnualCash))}
            </p>
          )}
          {days && (
            <p className="mt-4 text-xs leading-5 text-[#5E6270]">
              {t('res.taxDays').replace('{tax}', String(days.tax)).replace('{contrib}', String(days.contributions))}
            </p>
          )}
        </div>
      </div>

      {/* Quebec Information */}
      {provinceName === Province.QC && (
        <div className="bg-white border border-line p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-ink mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-ink">{t('res.qcTitle')}</p>
              <p className="text-xs text-ink-2 mt-1">
                {t('res.qcDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E3E3EA] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5E6270]">{payPeriodLabel}</p>
        <h3 className="font-display text-xl font-semibold text-[#15171C] mb-6">{t('res.breakdown')}</h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Chart */}
          <div className="w-full md:w-1/2 relative">
            <PaycheckDonutChart
              data={chartData}
              formatCurrency={formatCurrency}
              netPayPercent={netPayPercent}
              netPayLabel={netPayLabel}
              lang={lang}
            />
          </div>

          {/* Detailed Table */}
          <div className="w-full md:w-1/2 text-sm space-y-6 tabular-nums">
             {/* Earnings */}
             <div>
               <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5E6270] mb-2">{t('res.earnings')}</h4>
               <div className="space-y-2">
                 {/* Each row is the engine's own amount for that source, so the rows add up to gross pay. */}
                 {earn.salary !== undefined ? (
                   <div className="flex justify-between text-[#2B2E36]">
                     <span>{t('res.salaryPay')}</span>
                     <span className="font-medium">{formatCurrency(earn.salary)}</span>
                   </div>
                 ) : (
                   <div className="flex justify-between text-[#2B2E36]">
                     <span>{t('res.regularPay')} ({results.regularHours.toFixed(1)}h)</span>
                     <span className="font-medium">{formatCurrency(earn.regular ?? 0)}</span>
                   </div>
                 )}
                 {results.overtimeHours15 > 0 && (
                   <div className="flex justify-between text-ink-2">
                     <span>{t('res.ot15')} ({results.overtimeHours15.toFixed(1)}h)</span>
                     <span className="font-medium">{earn.overtime15 !== undefined ? formatCurrency(earn.overtime15) : t('res.included')}</span>
                   </div>
                 )}
                 {results.overtimeHours20 > 0 && (
                   <div className="flex justify-between text-ink font-bold">
                     <span>{t('res.ot20')} ({results.overtimeHours20.toFixed(1)}h)</span>
                     <span className="font-medium">{earn.overtime20 !== undefined ? formatCurrency(earn.overtime20) : t('res.included')}</span>
                   </div>
                 )}
                 {results.shiftPremiumHours > 0 && (
                   <div className="flex justify-between text-red-600">
                     <span>{t('hourly.shiftPremium')} ({results.shiftPremiumHours.toFixed(1)}h)</span>
                     <span className="font-medium">{earn.shiftPremium !== undefined ? formatCurrency(earn.shiftPremium) : t('res.plusPremium')}</span>
                   </div>
                 )}
                 {(earn.tips ?? 0) > 0 && (
                   <div className="flex justify-between text-[#2B2E36]">
                     <span>{t('ts.tipsDeclared')}</span>
                     <span className="font-medium">{formatCurrency(earn.tips!)}</span>
                   </div>
                 )}
                 {(earn.additional ?? 0) > 0 && (
                   <div className="flex justify-between text-[#2B2E36]">
                     <span>{t('annual.addIncome')}</span>
                     <span className="font-medium">{formatCurrency(earn.additional!)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-[#15171C] font-semibold pt-2 border-t border-[#15171C]/80">
                   <span>{t('res.grossPay')}</span>
                   <span>{formatCurrency(results.grossPayBiWeekly)}</span>
                 </div>
               </div>
             </div>

             {/* Deductions */}
             <div>
               <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5E6270] mb-2">{t('res.deductions')}</h4>
               <div className="space-y-2">
                 <div className="flex justify-between text-[#535866]">
                   <span>{t('res.federalTax')}</span>
                   <span>− {formatCurrency(results.federalTax)}</span>
                 </div>
                 <div className="flex justify-between text-[#535866]">
                   <span>{t('res.provincialTax')} {provinceName ? `(${provinceDisplayName(provinceName, lang)})` : ''}</span>
                   <span>− {formatCurrency(results.provincialTax)}</span>
                 </div>
                 {/* Outside Québec, CRA withholds both taxes together and most stubs print one line
                     (often labelled "Federal Tax"). Québec stubs list Revenu Québec tax separately. */}
                 {provinceName !== Province.QC && (
                   <div className="pl-3 border-l-2 border-[#E3E3EA]">
                     <div className="flex justify-between text-ink font-medium">
                       <span>{t('res.incomeTaxTotal')}</span>
                       <span>− {formatCurrency(results.federalTax + results.provincialTax)}</span>
                     </div>
                     <p className="text-xs text-ink-4">{t('res.incomeTaxTotalHint')}</p>
                   </div>
                 )}
                 <div className="flex justify-between text-[#535866]">
                   <span>{t('res.cppEiAmp')}</span>
                   <span>− {formatCurrency(results.cppDeduction + results.eiDeduction)}</span>
                 </div>
                 {(results.rrspDeduction ?? 0) > 0 && (
                   <div className="flex justify-between text-[#535866]">
                     <span>{t('annual.rrsp')}</span>
                     <span>− {formatCurrency(results.rrspDeduction ?? 0)}</span>
                   </div>
                 )}
                 {(results.pensionDeduction ?? 0) > 0 && (
                   <div className="flex justify-between text-[#535866]">
                     <span>{t('ded.pension')}</span>
                     <span>− {formatCurrency(results.pensionDeduction ?? 0)}</span>
                   </div>
                 )}
                 {(results.otherDeductions ?? 0) > 0 && (
                   <div className="flex justify-between text-[#535866]">
                     <span>{t('res.otherDed')}</span>
                     <span>− {formatCurrency(results.otherDeductions ?? 0)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-[#15171C] font-semibold pt-2 border-t border-[#15171C]/80">
                   <span>{t('res.totalDeductions')}</span>
                   <span>− {formatCurrency(results.federalTax + results.provincialTax + results.cppDeduction + results.eiDeduction + (results.rrspDeduction ?? 0) + (results.pensionDeduction ?? 0) + (results.otherDeductions ?? 0))}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function hasCustomFrequency_(r: CalculationResult) { return !!r.payFrequency; }

export default ResultsSection;
