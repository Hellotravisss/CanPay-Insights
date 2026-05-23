'use client';
import React from 'react';
import { CalculationMode } from '../types';

interface Props {
  onModeSelect: (mode: CalculationMode) => void;
}

const ModeSelector: React.FC<Props> = ({ onModeSelect }) => {
  const modes = [
    {
      id: CalculationMode.SIMPLE,
      title: 'Hourly Wage',
      subtitle: 'Hourly shifts and weekly pay',
    },
    {
      id: CalculationMode.ANNUAL,
      title: 'Annual Salary',
      subtitle: 'Salary to each paycheck',
    },
    {
      id: CalculationMode.TIMESHEET,
      title: 'Timesheet',
      subtitle: 'Overtime, tips, and deductions',
    }
  ];

  const renderIcon = (mode: CalculationMode) => {
    if (mode === CalculationMode.ANNUAL) {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h4m-6 4h8M9 4h6a2 2 0 012 2v2h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1V6a2 2 0 012-2z" />
        </svg>
      );
    }

    if (mode === CalculationMode.TIMESHEET) {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m4-12.5c-.7-.9-1.9-1.5-3.4-1.5-2 0-3.6 1-3.6 2.6 0 1.4 1.1 2.1 3.4 2.6 2.4.5 3.6 1.3 3.6 2.8 0 1.7-1.6 2.8-3.8 2.8-1.6 0-3-.6-4-1.7" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeSelect(mode.id)}
          className="group relative flex min-h-24 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-100 sm:min-h-44 sm:flex-col sm:items-start sm:justify-between sm:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
            {renderIcon(mode.id)}
          </span>
          <span className="min-w-0 sm:mt-4">
            <span className="block text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-red-600 sm:text-2xl">
              {mode.title}
            </span>
            <span className="mt-1 hidden text-sm font-semibold leading-6 text-slate-500 sm:block">
              {mode.subtitle}
            </span>
          </span>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-red-500 sm:absolute sm:right-6 sm:top-6" aria-hidden="true">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
