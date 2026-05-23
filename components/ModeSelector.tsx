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
      icon: '💰',
      title: 'Hourly Wage',
    },
    {
      id: CalculationMode.ANNUAL,
      icon: '💼',
      title: 'Annual Salary',
    },
    {
      id: CalculationMode.TIMESHEET,
      icon: '⏱️',
      title: 'Timesheet',
    }
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeSelect(mode.id)}
          className="group relative flex h-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-2xl transition-transform group-hover:scale-105">
            {mode.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-xl font-bold text-slate-900 transition-colors group-hover:text-red-600">
              {mode.title}
            </span>
          </span>
          <span className="ml-auto mt-1 text-slate-300 transition-colors group-hover:text-red-500" aria-hidden="true">
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
