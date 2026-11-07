'use client';
import { taxDays } from '../utils/taxDays';
import { useBelowViewport } from './useBelowViewport';
import React from 'react';
import AnimatedAmount from './AnimatedAmount';
import { CalculationResult, Province } from '../types';
import { provinceDisplayName } from '../lib/provinceNames';
import { useT } from '../lib/i18n';

interface Props {
  results: CalculationResult;
  provinceName?: string;
}

const InukshukWatermark = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <img src="/logo_reverse.png" alt="" aria-hidden="true" className={className} style={style} />
);

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
}: {
  data: ChartDatum[];
  formatCurrency: (value: number) => string;
  netPayPercent: number;
  netPayLabel: string;
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const size = 220;
  const center = size / 2;
  const radius = 72;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + Math.max(item.value, 0), 0);

  const segments = React.useMemo(() => {
    if (total <= 0) return [];

    const gap = 4;
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
    <div className="relative mx-auto flex min-h-[16rem] w-full max-w-sm flex-col items-center justify-center">
      <style>
        {`
          @keyframes paycheckDonutIn {
            from {
              opacity: 0;
              transform: rotate(-90deg) scale(0.96);
            }
            to {
              opacity: 1;
              transform: rotate(-90deg) scale(1);
            }
          }
        `}
      </style>
      <div className="relative h-[220px] w-[220px]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Paycheck breakdown donut chart"
          className="h-full w-full overflow-visible"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
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
              className="cursor-default transition-opacity duration-150"
              style={{
                animation: `paycheckDonutIn 420ms ease-out ${segment.index * 45}ms both`,
                opacity: activeIndex === null || activeIndex === segment.index ? 1 : 0.42,
                transformOrigin: `${center}px ${center}px`,
              }}
              onMouseEnter={() => setActiveIndex(segment.index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <title>{`${segment.name}: ${formatCurrency(segment.value)}`}</title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase text-slate-500">{netPayLabel}</span>
          <p className="text-2xl font-bold text-slate-800">{netPayPercent}%</p>
        </div>
      </div>

      {activeSegment && (
        <div className="absolute top-2 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
          <p className="font-bold text-slate-900">{activeSegment.name}</p>
          <p className="text-slate-600">
            {formatCurrency(activeSegment.value)} · {activeSegment.percent}%
          </p>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-slate-600">
        {data.map((item) => (
          <div key={item.name} className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsSection: React.FC<Props> = ({ results, provinceName }) => {
  const { t, lang } = useT();
  const currencyFormatter = React.useMemo(
    () => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
    [],
  );

  const formatCurrency = React.useCallback(
    (val: number) => currencyFormatter.format(Number.isFinite(val) ? val : 0),
    [currencyFormatter],
  );
  
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
  const days = taxDays(results);
  // 是否是年薪或打卡模式（有 payFrequency 字段）
  const hasCustomFrequency = !!results.payFrequency;
  const payPeriodLabel = hasCustomFrequency ? getPayFrequencyLabel(results.payFrequency) : t('res.biweekly');

  const chartData = React.useMemo(() => [
    { name: t('res.netPay'), value: results.netPayBiWeekly, color: '#dc2626' }, // Red-600
    { name: t('res.fedTax'), value: results.federalTax, color: '#334155' }, // Slate-700
    { name: t('res.provTax'), value: results.provincialTax, color: '#64748b' }, // Slate-500
    { name: t('res.cppEi'), value: results.cppDeduction + results.eiDeduction, color: '#94a3b8' }, // Slate-400
    // Pension, RRSP, union dues and the rest: without this slice the donut's
    // shares summed to less than gross and overstated the net-pay percentage.
    { name: t('annual.otherDed'), value: (results.rrspDeduction ?? 0) + (results.pensionDeduction ?? 0) + (results.otherDeductions ?? 0), color: '#cbd5e1' }, // Slate-300
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
          {/* Decorative Icon */}
          <InukshukWatermark className="absolute -right-4 -bottom-8 w-28 h-28 opacity-20 transform group-hover:scale-110 transition-transform duration-500" />
        </div>

        {heroBelow && (
          <button
            type="button"
            onClick={() => heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="glass-bar lg:hidden fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-3 rounded-full border border-white/60 px-5 py-3 text-left shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)]"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">{payPeriodLabel} · {t('res.netPay')}</span>
            <span className="text-xl font-extrabold tabular-nums text-red-600">
              {formatCurrency(hasCustomFrequency ? (results.netPayPerPeriod || results.netPayBiWeekly) : results.netPayBiWeekly)}
            </span>
          </button>
        )}

        {/* Annual Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="" aria-hidden="true" className="w-5 h-5 rounded-sm" />
            <h3 className="text-lg font-bold text-slate-800">{t('res.annualProjection')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline gap-4 border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-sm">{t('res.grossIncomePre')}</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{formatCurrency(results.grossPayAnnual)}</span>
            </div>
            <div className="flex justify-between items-center gap-4 text-sm text-red-500">
              <span>{t('res.totalTaxDed')}</span>
              <span className="tabular-nums">- {formatCurrency(results.totalDeductionsAnnual)}</span>
            </div>
            <div className="flex justify-between items-baseline gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-700 font-bold text-sm">{t('res.netIncomePost')}</span>
              <span className="text-2xl font-extrabold text-red-600 tabular-nums whitespace-nowrap">{formatCurrency(results.netPayAnnual)}</span>
            </div>
          </div>
          {days && (
            <p className="mt-4 text-xs leading-5 text-slate-600">
              {t('res.taxDays').replace('{tax}', String(days.tax)).replace('{contrib}', String(days.contributions))}
            </p>
          )}
        </div>
      </div>

      {/* Quebec Information */}
      {provinceName === Province.QC && (
        <div className="bg-blue-50/40 border border-blue-100/60 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-800">{t('res.qcTitle')}</p>
              <p className="text-xs text-blue-700 mt-1">
                {t('res.qcDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{payPeriodLabel} · {t('res.breakdown')}</h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Chart */}
          <div className="w-full md:w-1/2 h-64 relative">
            <PaycheckDonutChart
              data={chartData}
              formatCurrency={formatCurrency}
              netPayPercent={netPayPercent}
              netPayLabel={netPayLabel}
            />
          </div>

          {/* Detailed Table */}
          <div className="w-full md:w-1/2 text-sm space-y-4">
             {/* Earnings */}
             <div>
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{t('res.earnings')}</h4>
               <div className="space-y-2">
                 {/* Each row is the engine's own amount for that source, so the rows add up to gross pay. */}
                 {earn.salary !== undefined ? (
                   <div className="flex justify-between text-slate-700">
                     <span>{t('res.salaryPay')}</span>
                     <span className="font-medium">{formatCurrency(earn.salary)}</span>
                   </div>
                 ) : (
                   <div className="flex justify-between text-slate-700">
                     <span>{t('res.regularPay')} ({results.regularHours.toFixed(1)}h)</span>
                     <span className="font-medium">{formatCurrency(earn.regular ?? 0)}</span>
                   </div>
                 )}
                 {results.overtimeHours15 > 0 && (
                   <div className="flex justify-between text-amber-600">
                     <span>{t('res.ot15')} ({results.overtimeHours15.toFixed(1)}h)</span>
                     <span className="font-medium">{earn.overtime15 !== undefined ? formatCurrency(earn.overtime15) : t('res.included')}</span>
                   </div>
                 )}
                 {results.overtimeHours20 > 0 && (
                   <div className="flex justify-between text-amber-700 font-bold">
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
                   <div className="flex justify-between text-slate-700">
                     <span>{t('ts.tipsDeclared')}</span>
                     <span className="font-medium">{formatCurrency(earn.tips!)}</span>
                   </div>
                 )}
                 {(earn.additional ?? 0) > 0 && (
                   <div className="flex justify-between text-slate-700">
                     <span>{t('annual.addIncome')}</span>
                     <span className="font-medium">{formatCurrency(earn.additional!)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
                   <span>{t('res.grossPay')}</span>
                   <span>{formatCurrency(results.grossPayBiWeekly)}</span>
                 </div>
               </div>
             </div>

             {/* Deductions */}
             <div>
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{t('res.deductions')}</h4>
               <div className="space-y-2">
                 <div className="flex justify-between text-slate-600">
                   <span>{t('res.federalTax')}</span>
                   <span>- {formatCurrency(results.federalTax)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                   <span>{t('res.provincialTax')} {provinceName ? `(${provinceDisplayName(provinceName, lang)})` : ''}</span>
                   <span>- {formatCurrency(results.provincialTax)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                   <span>{t('res.cppEiAmp')}</span>
                   <span>- {formatCurrency(results.cppDeduction + results.eiDeduction)}</span>
                 </div>
                 {(results.rrspDeduction ?? 0) > 0 && (
                   <div className="flex justify-between text-slate-600">
                     <span>{t('annual.rrsp')}</span>
                     <span>- {formatCurrency(results.rrspDeduction ?? 0)}</span>
                   </div>
                 )}
                 {(results.pensionDeduction ?? 0) > 0 && (
                   <div className="flex justify-between text-slate-600">
                     <span>{t('ded.pension')}</span>
                     <span>- {formatCurrency(results.pensionDeduction ?? 0)}</span>
                   </div>
                 )}
                 {(results.otherDeductions ?? 0) > 0 && (
                   <div className="flex justify-between text-slate-600">
                     <span>{t('res.otherDed')}</span>
                     <span>- {formatCurrency(results.otherDeductions ?? 0)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-red-600 font-bold pt-2 border-t border-slate-100">
                   <span>{t('res.totalDeductions')}</span>
                   <span>- {formatCurrency(results.federalTax + results.provincialTax + results.cppDeduction + results.eiDeduction + (results.rrspDeduction ?? 0) + (results.pensionDeduction ?? 0) + (results.otherDeductions ?? 0))}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
