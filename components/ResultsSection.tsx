'use client';
import React from 'react';
import { CalculationResult, Province } from '../types';

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
}: {
  data: ChartDatum[];
  formatCurrency: (value: number) => string;
  netPayPercent: number;
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
          <span className="text-xs font-bold uppercase text-slate-400">Net Pay</span>
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
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'bi-weekly': return 'Bi-Weekly';
      case 'semi-monthly': return 'Semi-Monthly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      default: return 'Bi-Weekly';
    }
  };
  
  // 是否是年薪或打卡模式（有 payFrequency 字段）
  const hasCustomFrequency = !!results.payFrequency;
  const payPeriodLabel = hasCustomFrequency ? getPayFrequencyLabel(results.payFrequency) : 'Bi-Weekly';

  const chartData = React.useMemo(() => [
    { name: 'Net Pay', value: results.netPayBiWeekly, color: '#dc2626' }, // Red-600
    { name: 'Fed Tax', value: results.federalTax, color: '#334155' }, // Slate-700
    { name: 'Prov Tax', value: results.provincialTax, color: '#64748b' }, // Slate-500
    { name: 'CPP/EI', value: results.cppDeduction + results.eiDeduction, color: '#94a3b8' }, // Slate-400
  ], [results.cppDeduction, results.eiDeduction, results.federalTax, results.netPayBiWeekly, results.provincialTax]);

  const totalHours = results.regularHours + results.overtimeHours15 + results.overtimeHours20;
  const netPayPercent = results.grossPayBiWeekly > 0
    ? Math.round((results.netPayBiWeekly / results.grossPayBiWeekly) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 主收入卡片 - 根据模式显示不同内容 */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-red-100 text-xs font-bold uppercase tracking-widest mb-1">
                    {payPeriodLabel} Net Pay
                  </h3>
                  <p className="text-4xl font-extrabold tracking-tight">
                    {formatCurrency(hasCustomFrequency ? (results.netPayPerPeriod || results.netPayBiWeekly) : results.netPayBiWeekly)}
                  </p>
               </div>
               <div className="bg-white/20 px-3 py-1 rounded text-xs font-semibold backdrop-blur-sm">
                 {totalHours > 0 ? `${totalHours.toFixed(1)} Hours` : payPeriodLabel}
               </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-red-400/30 space-y-1">
              <div className="flex justify-between items-center text-sm text-red-50 font-medium">
                <span>Gross Pay (Pre-tax)</span>
                <span>{formatCurrency(hasCustomFrequency ? (results.grossPayPerPeriod || results.grossPayBiWeekly) : results.grossPayBiWeekly)}</span>
              </div>
            </div>
          </div>
          {/* Decorative Icon */}
          <InukshukWatermark className="absolute -right-6 -bottom-6 w-40 h-40 opacity-20 transform group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Annual Card */}
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-600 p-6 relative overflow-hidden">
           <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="" aria-hidden="true" className="w-5 h-5 rounded-sm" />
              <h3 className="text-lg font-bold text-slate-800">Annual Projection</h3>
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                 <span className="text-slate-500 text-sm">Gross Income (Pre-tax)</span>
                 <span className="text-xl font-bold text-slate-900">{formatCurrency(results.grossPayAnnual)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-red-500">
                 <span>Total Tax & Deductions</span>
                 <span>- {formatCurrency(results.totalDeductionsAnnual)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                 <span className="text-slate-700 font-bold text-sm">Net Income (Post-tax)</span>
                 <span className="text-2xl font-extrabold text-red-600">{formatCurrency(results.netPayAnnual)}</span>
              </div>
           </div>
           <InukshukWatermark className="absolute top-4 right-4 w-16 h-16 -rotate-12 opacity-10" />
        </div>
      </div>

      {/* Quebec Information */}
      {provinceName === Province.QC && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-800">Québec Special Tax Rules Applied</p>
              <p className="text-xs text-blue-700 mt-1">
                This calculation includes Québec's unique system: QPP (6.4% + 7.15% for high earners), 
                QPIP (0.494%), lower EI rate (1.27%), and 16.5% federal tax abatement. 
                Results are estimates based on 2025 rates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{payPeriodLabel} Paycheck Breakdown</h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Chart */}
          <div className="w-full md:w-1/2 h-64 relative">
            <PaycheckDonutChart
              data={chartData}
              formatCurrency={formatCurrency}
              netPayPercent={netPayPercent}
            />
          </div>

          {/* Detailed Table */}
          <div className="w-full md:w-1/2 text-sm space-y-4">
             {/* Earnings */}
             <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Earnings</h4>
               <div className="space-y-2">
                 <div className="flex justify-between text-slate-700">
                   <span>Regular Pay ({results.regularHours.toFixed(1)}h)</span>
                   <span className="font-medium">
                     {formatCurrency(totalHours > 0 
                       ? (results.regularHours * (results.grossPayBiWeekly / totalHours)) 
                       : 0)}
                   </span>
                 </div>
                 {results.overtimeHours15 > 0 && (
                   <div className="flex justify-between text-amber-600">
                     <span>Overtime 1.5x ({results.overtimeHours15.toFixed(1)}h)</span>
                     <span className="font-medium">Included</span>
                   </div>
                 )}
                 {results.overtimeHours20 > 0 && (
                   <div className="flex justify-between text-amber-700 font-bold">
                     <span>Overtime 2.0x ({results.overtimeHours20.toFixed(1)}h)</span>
                     <span className="font-medium">Included</span>
                   </div>
                 )}
                 {results.shiftPremiumHours > 0 && (
                   <div className="flex justify-between text-red-600">
                     <span>Shift Premium ({results.shiftPremiumHours.toFixed(1)}h)</span>
                     <span className="font-medium">+ Premium</span>
                   </div>
                 )}
                 <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
                   <span>Gross Pay</span>
                   <span>{formatCurrency(results.grossPayBiWeekly)}</span>
                 </div>
               </div>
             </div>

             {/* Deductions */}
             <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Deductions</h4>
               <div className="space-y-2">
                 <div className="flex justify-between text-slate-600">
                   <span>Federal Tax</span>
                   <span>- {formatCurrency(results.federalTax)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                   <span>Provincial Tax {provinceName ? `(${provinceName})` : ''}</span>
                   <span>- {formatCurrency(results.provincialTax)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                   <span>CPP & EI</span>
                   <span>- {formatCurrency(results.cppDeduction + results.eiDeduction)}</span>
                 </div>
                 {(results.rrspDeduction ?? 0) > 0 && (
                   <div className="flex justify-between text-slate-600">
                     <span>RRSP Contribution</span>
                     <span>- {formatCurrency(results.rrspDeduction ?? 0)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-red-600 font-bold pt-2 border-t border-slate-100">
                   <span>Total Deductions</span>
                   <span>- {formatCurrency(results.federalTax + results.provincialTax + results.cppDeduction + results.eiDeduction + (results.rrspDeduction ?? 0))}</span>
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
