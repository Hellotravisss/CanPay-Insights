'use client';
import React from 'react';
import { CalculationMode } from '../types';
import { useT } from '../lib/i18n';
import { type IconName } from './Icon';

interface Props {
  onModeSelect: (mode: CalculationMode) => void;
}

const MODE_TILE: Partial<Record<IconName, string>> = { coins: 'hourly', briefcase: 'annual', stopwatch: 'timesheet' };

const ModeSelector: React.FC<Props> = ({ onModeSelect }) => {
  const { t } = useT();
  const modes = [
    {
      id: CalculationMode.SIMPLE,
      title: t('mode.hourly.title'),
      subtitle: t('mode.hourly.subtitle'),
      icon: 'coins' as IconName,
    },
    {
      id: CalculationMode.ANNUAL,
      title: t('mode.annual.title'),
      subtitle: t('mode.annual.subtitle'),
      icon: 'briefcase' as IconName,
    },
    {
      id: CalculationMode.TIMESHEET,
      title: t('mode.timesheet.title'),
      subtitle: t('mode.timesheet.subtitle'),
      icon: 'stopwatch' as IconName,
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeSelect(mode.id)}
          className="group flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3 text-left shadow-[0_10px_30px_-20px_rgba(21,23,28,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:border-ink-5 hover:shadow-[0_12px_28px_-16px_rgba(21,23,28,0.45)] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 sm:px-5"
        >
          {/* the three modes as the app icon draws things: pearly 3D type ($/hr · $/yr · hrs) on the red tile (PayFamily-brand/15-icons/3d, 2026-11-24) */}
          <span className="flex h-14 w-14 shrink-0 items-center justify-center transition-transform group-hover:scale-105" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- static 3x PNG, next/image adds nothing */}
            <img src={`/brand/icons/mode-${MODE_TILE[mode.icon] ?? 'hourly'}.png`} width={56} height={56} alt="" className="h-14 w-14 drop-shadow-[0_4px_8px_rgba(158,11,16,0.25)]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-semibold leading-tight text-ink sm:text-[1.4rem]">
              {mode.title}
            </span>
          </span>
          <span className="text-ink-5 transition-transform group-hover:translate-x-1 group-hover:text-red-600" aria-hidden="true">
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
