
import React, { useState, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import InputSection from './components/InputSection';
import AnnualSalaryInput from './components/AnnualSalaryInput';
import TimesheetInput from './components/TimesheetInput';
import ModeSelector from './components/ModeSelector';
import ResultsSection from './components/ResultsSection';
import GeminiAdvisor from './components/GeminiAdvisor';
import SEO from './components/SEO';
import { SalaryInputs, Province, CalculationMode, AnnualSalaryInputs, PayFrequency, TimesheetInputs } from './types';
import { calculateSalary, calculateFromAnnualSalary, calculateFromTimesheet } from './utils/taxEngine';

// Default State - 简易估算（时薪）
const DEFAULT_SIMPLE_INPUTS: SalaryInputs = {
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

// Default State - Annual Salary (Fixed at Bi-Weekly)
const DEFAULT_ANNUAL_INPUTS: AnnualSalaryInputs = {
  province: Province.ON,
  annualSalary: 100000,
  payFrequency: PayFrequency.BI_WEEKLY // Fixed for annual salary mode
};

// Default State - Timesheet
const DEFAULT_TIMESHEET_INPUTS: TimesheetInputs = {
  province: Province.ON,
  hourlyWage: 20.00,
  payFrequency: PayFrequency.WEEKLY,
  entries: []
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
  // 页面状态：'home' = 模式选择页, 'calculator' = 计算页
  const [currentPage, setCurrentPage] = useState<'home' | 'calculator'>('home');
  
  // 计算模式状态
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.SIMPLE);
  
  // 简易估算输入
  const [simpleInputs, setSimpleInputs] = useState<SalaryInputs>(DEFAULT_SIMPLE_INPUTS);
  
  // 年薪倒推输入
  const [annualInputs, setAnnualInputs] = useState<AnnualSalaryInputs>(DEFAULT_ANNUAL_INPUTS);
  
  // Timesheet 输入
  const [timesheetInputs, setTimesheetInputs] = useState<TimesheetInputs>(DEFAULT_TIMESHEET_INPUTS);
  
  // 选择模式并进入计算页
  const handleModeSelect = (selectedMode: CalculationMode) => {
    setMode(selectedMode);
    setCurrentPage('calculator');
  };
  
  // 返回首页
  const handleBackToHome = () => {
    setCurrentPage('home');
  };
  
  // 根据模式计算结果
  const results = useMemo(() => {
    switch (mode) {
      case CalculationMode.SIMPLE:
        return calculateSalary(simpleInputs);
      case CalculationMode.ANNUAL:
        return calculateFromAnnualSalary(annualInputs);
      case CalculationMode.TIMESHEET:
        return calculateFromTimesheet(timesheetInputs);
      default:
        return calculateSalary(simpleInputs);
    }
  }, [mode, simpleInputs, annualInputs, timesheetInputs]);

  // 获取当前输入的省份（用于 GeminiAdvisor）
  const currentProvince = mode === CalculationMode.ANNUAL 
    ? annualInputs.province 
    : mode === CalculationMode.TIMESHEET
    ? timesheetInputs.province
    : simpleInputs.province;

  // 获取当前输入对象（用于 GeminiAdvisor）
  const currentInputs = mode === CalculationMode.ANNUAL
    ? { province: annualInputs.province, hourlyWage: annualInputs.annualSalary / 2080 } // 简化
    : mode === CalculationMode.TIMESHEET
    ? { province: timesheetInputs.province, hourlyWage: timesheetInputs.hourlyWage }
    : simpleInputs;

  // 已绑定您的收款链接
  const DONATION_URL = "https://www.buymeacoffee.com/canpay"; 
 
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* SEO Component */}
      <SEO />
      
      {/* Header - Only show on calculator page */}
      {currentPage === 'calculator' && (
        <header className="bg-white border-b border-red-100 sticky top-0 z-30 shadow-sm" role="banner">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-red-200 shadow-lg hover:scale-105 transition-transform">
                <InukshukIcon className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">CanPay <span className="text-red-600 font-light">Insights</span></h1>
            </div>
            <button 
              onClick={handleBackToHome}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </header>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8" role="main" aria-label="Payroll Calculator">
        {/* Home Page - Mode Selection */}
        {currentPage === 'home' && (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <ModeSelector onModeSelect={handleModeSelect} />
            </div>
          </div>
        )}
        
        {/* Calculator Page */}
        {currentPage === 'calculator' && (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Inputs */}
            <div className="w-full lg:w-5/12 xl:w-1/3">
              {mode === CalculationMode.SIMPLE && (
                <InputSection inputs={simpleInputs} setInputs={setSimpleInputs} />
              )}
              
              {mode === CalculationMode.ANNUAL && (
                <AnnualSalaryInput inputs={annualInputs} setInputs={setAnnualInputs} />
              )}
              
              {mode === CalculationMode.TIMESHEET && (
                <TimesheetInput inputs={timesheetInputs} setInputs={setTimesheetInputs} />
              )}
            </div>

            {/* Right Column: Results */}
            <div className="w-full lg:w-7/12 xl:w-2/3">
              <ResultsSection results={results} provinceName={currentProvince} />
              <GeminiAdvisor results={results} inputs={currentInputs as SalaryInputs} />
            </div>
            
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-8 space-y-4" role="contentinfo">
        <p>Calculations are estimates based on 2025/2026 tax brackets and provincial employment standards.</p>
        
        <div className="flex justify-center items-center gap-4">
          <a 
            href={DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#FFDD00] text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#FFEA00] hover:shadow-lg transition-all transform hover:-translate-y-1 group decoration-none"
          >
            <span className="text-xl group-hover:rotate-12 transition-transform duration-300">☕</span>
            <span>Buy me a double-double</span>
          </a>
        </div>

        <div className="mt-2 flex justify-center gap-2">
           <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
           <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
           <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
        </div>
        <p className="mt-4 opacity-75">Proudly Canadian 🇨🇦 Built for Workers.</p>
      </footer>
      
      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
};

export default App;
