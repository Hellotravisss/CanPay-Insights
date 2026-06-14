'use client';
import React from 'react';
import { CalculationMode } from '../types';
import { useT } from '../lib/i18n';

interface Props {
  onModeSelect: (mode: CalculationMode) => void;
}

const ModeSelector: React.FC<Props> = ({ onModeSelect }) => {
  const { t } = useT();
  const modes = [
    {
      id: CalculationMode.SIMPLE,
      title: t('mode.hourly.title'),
      subtitle: t('mode.hourly.subtitle'),
      icon: '💰',
    },
    {
      id: CalculationMode.ANNUAL,
      title: t('mode.annual.title'),
      subtitle: t('mode.annual.subtitle'),
      icon: '💼',
    },
    {
      id: CalculationMode.TIMESHEET,
      title: t('mode.timesheet.title'),
      subtitle: t('mode.timesheet.subtitle'),
      icon: '⏱️',
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeSelect(mode.id)}
          className="group flex min-h-24 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-100 sm:p-5"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-3xl transition-transform group-hover:scale-105" aria-hidden="true">
            {mode.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-red-600 sm:text-2xl">
              {mode.title}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500 sm:text-base">
              {mode.subtitle}
            </span>
          </span>
          <span className="text-red-400 transition-transform group-hover:translate-x-1 group-hover:text-red-600" aria-hidden="true">
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
