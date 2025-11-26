import React from 'react';
import { CalculationResult } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  results: CalculationResult;
  provinceName?: string;
}

const InukshukWatermark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Head */}
    <rect x="10" y="2" width="4" height="3" rx="0.5" />
    {/* Arms */}
    <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    {/* Torso */}
    <rect x="9" y="10" width="6" height="4" rx="0.5" />
    {/* Hips */}
    <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
    {/* Legs */}
    <rect x="7" y="18" width="3" height="4" rx="0.5" />
    <rect x="14" y="18" width="3" height="4" rx="0.5" />
  </svg>
);

const ResultsSection: React.FC<Props> = ({ results, provinceName }) => {
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  };

  const chartData = [
    { name: 'Net Pay', value: results.netPayBiWeekly, color: '#dc2626' }, // Red-600
    { name: 'Fed Tax', value: results.federalTax, color: '#334155' }, // Slate-700
    { name: 'Prov Tax', value: results.provincialTax, color: '#64748b' }, // Slate-500
    { name: 'CPP/EI', value: results.cppDeduction + results.eiDeduction, color: '#94a3b8' }, // Slate-400
  ];

  const totalHours = results.regularHours + results.overtimeHours15 + results.overtimeHours20;

  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bi-Weekly Card */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-red-100 text-xs font-bold uppercase tracking-widest mb-1">Bi-Weekly Net Pay</h3>
                  <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(results.netPayBiWeekly)}</p>
               </div>
               <div className="bg-white/20 px-3 py-1 rounded text-xs font-semibold backdrop-blur-sm">
                 {totalHours.toFixed(1)} Hours
               </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-red-400/30 space-y-1">
              <div className="flex justify-between items-center text-sm text-red-50 font-medium">
                <span>Gross Pay (Pre-tax)</span>
                <span>{formatCurrency(results.grossPayBiWeekly)}</span>
              </div>
            </div>
          </div>
          {/* Decorative Icon */}
          <InukshukWatermark className="absolute -right-6 -bottom-6 w-40 h-40 text-red-800 opacity-30 transform group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Annual Card */}
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-600 p-6 relative overflow-hidden">
           <div className="flex items-center gap-2 mb-4">
              <InukshukWatermark className="w-5 h-5 text-red-600" />
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
           <InukshukWatermark className="absolute top-4 right-4 w-16 h-16 text-slate-100 -rotate-12 opacity-50" />
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Bi-Weekly Paycheck Breakdown</h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Chart */}
          <div className="w-full md:w-1/2 h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)} 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs text-slate-400 font-bold uppercase">Net Pay</span>
              <p className="text-slate-800 font-bold">{Math.round((results.netPayBiWeekly / results.grossPayBiWeekly) * 100)}%</p>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="w-full md:w-1/2 text-sm space-y-4">
             {/* Earnings */}
             <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Earnings</h4>
               <div className="space-y-2">
                 <div className="flex justify-between text-slate-700">
                   <span>Regular Pay ({results.regularHours.toFixed(1)}h)</span>
                   <span className="font-medium">{formatCurrency((results.regularHours * (results.grossPayBiWeekly / totalHours)) || 0)}</span>
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
                 <div className="flex justify-between text-red-600 font-bold pt-2 border-t border-slate-100">
                   <span>Total Deductions</span>
                   <span>- {formatCurrency(results.federalTax + results.provincialTax + results.cppDeduction + results.eiDeduction)}</span>
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