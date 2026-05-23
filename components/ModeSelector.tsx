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
    },
    {
      id: CalculationMode.ANNUAL,
      title: 'Annual Salary',
    },
    {
      id: CalculationMode.TIMESHEET,
      title: 'Timesheet',
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeSelect(mode.id)}
          className="group flex h-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-transform group-hover:scale-105">
            {renderIcon(mode.id)}
          </span>
          <span className="min-w-0 text-lg font-bold text-slate-900 transition-colors group-hover:text-red-600">
            {mode.title}
          </span>
          <span className="ml-auto text-slate-300 transition-colors group-hover:text-red-500" aria-hidden="true">
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
