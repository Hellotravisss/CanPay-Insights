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
      title: 'Hourly Wage'
    },
    {
      id: CalculationMode.ANNUAL,
      icon: '💼',
      title: 'Annual Salary'
    },
    {
      id: CalculationMode.TIMESHEET,
      icon: '⏱️',
      title: 'Timesheet Tracker'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-slate-800">
          CanPay <span className="text-red-600">Insights</span>
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className="relative p-8 rounded-xl border-2 border-slate-200 bg-white hover:border-red-500 hover:shadow-xl transition-all group"
          >
            {/* Icon and Title - Centered */}
            <div className="flex flex-col items-center text-center">
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">{mode.icon}</span>
              <h3 className="font-bold text-slate-800 text-2xl group-hover:text-red-600 transition-colors">
                {mode.title}
              </h3>
            </div>
            
            {/* Arrow - Centered */}
            <div className="flex justify-center mt-6">
              <svg className="w-6 h-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
