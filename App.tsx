import React, { useState, useEffect, useMemo } from 'react';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import GeminiAdvisor from './components/GeminiAdvisor';
import { SalaryInputs, Province } from './types';
import { calculateSalary } from './utils/taxEngine';

// Default State
const DEFAULT_INPUTS: SalaryInputs = {
  province: Province.ON,
  hourlyWage: 20.00,
  shift: {
    startTime: "09:00",
    endTime: "17:00",
    unpaidBreakMinutes: 30,
    daysActive: [false, true, true, true, true, true, false] // Mon-Fri
  },
  premium: {
    enabled: false,
    ratePerHour: 2.00,
    startTime: "00:00",
    endTime: "06:00"
  },
  includeVacationPay: false
};

const InukshukIcon = ({ className }: { className?: string }) => (
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

const App: React.FC = () => {
  const [inputs, setInputs] = useState<SalaryInputs>(DEFAULT_INPUTS);
  
  // Memoize results to calculate automatically when inputs change
  const results = useMemo(() => {
    return calculateSalary(inputs);
  }, [inputs]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-red-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-red-200 shadow-lg hover:scale-105 transition-transform">
               <InukshukIcon className="w-7 h-7" />
             </div>
             <h1 className="text-xl font-bold text-slate-800 tracking-tight">CanPay <span className="text-red-600 font-light">Insights</span></h1>
          </div>
          <div className="hidden sm:block text-sm text-slate-500">
            2024/2025 Estimator
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Inputs */}
          <div className="w-full lg:w-5/12 xl:w-1/3">
            <InputSection inputs={inputs} setInputs={setInputs} />
          </div>

          {/* Right Column: Results */}
          <div className="w-full lg:w-7/12 xl:w-2/3">
            <ResultsSection results={results} provinceName={inputs.province} />
            <GeminiAdvisor results={results} inputs={inputs} />
          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-8 space-y-4">
        <p>Calculations are estimates based on simplified 2024 tax brackets and provincial employment standards.</p>
        
        <div className="flex justify-center items-center gap-4">
          <button className="flex items-center gap-2 bg-[#FFDD00] text-slate-900 px-4 py-2 rounded-full font-bold shadow-md hover:bg-[#FFEA00] transition-colors group">
            <span className="text-lg group-hover:scale-125 transition-transform duration-300">☕</span>
            <span>Buy me a double-double</span>
          </button>
        </div>

        <div className="mt-2 flex justify-center gap-2">
           <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
           <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
           <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
        </div>
      </footer>
    </div>
  );
};

export default App;