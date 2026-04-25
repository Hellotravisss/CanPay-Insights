'use client';

import React, { useState } from 'react';
import { SalaryInputs, Province, AdditionalIncome, Deductions } from '../types';
import { PROVINCIAL_DATA, DAYS_OF_WEEK } from '../constants';

interface Props {
  inputs: SalaryInputs;
  setInputs: React.Dispatch<React.SetStateAction<SalaryInputs>>;
}

const InputSection: React.FC<Props> = ({ inputs, setInputs }) => {
  const [showAdditional, setShowAdditional] = useState(false);
  const [showDeductions, setShowDeductions] = useState(false);

  const updateAdditional = (field: keyof AdditionalIncome, value: number) => {
    setInputs({ ...inputs, additionalIncome: { ...inputs.additionalIncome!, [field]: value } });
  };

  const updateDeductions = (field: keyof Deductions, value: number) => {
    setInputs({ ...inputs, deductions: { ...inputs.deductions!, [field]: value } });
  };

  const parseAmount = (v: string) => Math.max(0, parseFloat(v) || 0);

  const handleDayToggle = (index: number) => {
    const newDays = [...inputs.shift.daysActive];
    newDays[index] = !newDays[index];
    setInputs({ ...inputs, shift: { ...inputs.shift, daysActive: newDays } });
  };

  const updatePremium = (field: string, value: any) => {
    setInputs({ ...inputs, premium: { ...inputs.premium, [field]: value } });
  };

  // 优化数字输入：处理空值，防止“0”一直留在输入框前面
  const handleWageChange = (value: string) => {
    if (value === '') {
      // 允许临时为空，方便用户输入
      setInputs({ ...inputs, hourlyWage: '' as unknown as number });
    } else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setInputs({ ...inputs, hourlyWage: num });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>

      {/* Province & Wage */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Province / Territory</label>
          <select 
            className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all cursor-pointer hover:border-red-300 shadow-sm"
            value={inputs.province}
            onChange={(e) => setInputs({...inputs, province: e.target.value})}
          >
            {Object.entries(PROVINCIAL_DATA).map(([key, data]) => (
              <option key={key} value={key} className="text-slate-900">{data.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Hourly Wage ($/hr)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
            <input 
              type="number" 
              inputMode="decimal"
              step="0.01"
              min="0"
              className="w-full p-3.5 pl-10 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none font-bold text-lg shadow-sm"
              value={inputs.hourlyWage || ''}
              onFocus={(e) => e.target.select()} // 点击自动全选，方便覆盖
              onChange={(e) => handleWageChange(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Schedule */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Work Schedule
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {DAYS_OF_WEEK.map((day, idx) => (
            <button
              key={day}
              onClick={() => handleDayToggle(idx)}
              className={`flex-1 min-w-[55px] py-2.5 rounded-lg text-xs font-bold transition-all transform active:scale-95 border ${
                inputs.shift.daysActive[idx] 
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* 改进的时间输入布局：增加间距和宽度 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Start Time</label>
              <input 
                type="time" 
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm min-h-[48px]"
                value={inputs.shift.startTime}
                onChange={(e) => setInputs({...inputs, shift: { ...inputs.shift, startTime: e.target.value }})}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">End Time</label>
              <input 
                type="time" 
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm min-h-[48px]"
                value={inputs.shift.endTime}
                onChange={(e) => setInputs({...inputs, shift: { ...inputs.shift, endTime: e.target.value }})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Unpaid Break (mins)</label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm"
                value={inputs.shift.unpaidBreakMinutes}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setInputs({...inputs, shift: { ...inputs.shift, unpaidBreakMinutes: parseInt(e.target.value) || 0 }})}
              />
              <span className="absolute right-4 top-3 text-slate-400 text-sm">min</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Shift Premium */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Shift Premium
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={inputs.premium.enabled}
              onChange={(e) => updatePremium('enabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {inputs.premium.enabled && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-4 animate-fadeIn">
             <div>
                <label className="block text-xs font-bold text-red-800 mb-1.5 ml-1">Premium Rate ($/hr)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-red-400">$</span>
                  <input 
                    type="number" 
                    className="w-full p-2 pl-7 bg-white text-slate-900 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={inputs.premium.ratePerHour}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updatePremium('ratePerHour', parseFloat(e.target.value) || 0)}
                  />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-xs font-bold text-red-800 mb-1.5 ml-1">From</label>
                  <input 
                    type="time" 
                    className="w-full p-2.5 bg-white text-slate-900 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={inputs.premium.startTime}
                    onChange={(e) => updatePremium('startTime', e.target.value)}
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-red-800 mb-1.5 ml-1">To</label>
                  <input 
                    type="time" 
                    className="w-full p-2.5 bg-white text-slate-900 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={inputs.premium.endTime}
                    onChange={(e) => updatePremium('endTime', e.target.value)}
                  />
               </div>
             </div>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Additional Income */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdditional(v => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Additional Income
          </h3>
          <div className="flex items-center gap-2">
            {(inputs.additionalIncome && Object.values(inputs.additionalIncome).some(v => v > 0)) && (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
            )}
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showAdditional ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>
        <p className="text-xs text-slate-500 mt-1 mb-3">Stat holiday pay, sick pay, bonus, etc. — added to gross this period</p>

        {showAdditional && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3 animate-fadeIn">
            {([
              { key: 'statHolidayPay', label: 'Statutory Holiday Pay', hint: 'Paid for public holidays worked or not worked' },
              { key: 'sickPay',        label: 'Sick Pay / Paid Leave',  hint: 'Employer-paid sick or personal days this period' },
              { key: 'bonus',          label: 'Bonus / Retroactive Pay', hint: 'One-time or recurring bonus, gain-share, retro' },
              { key: 'otherIncome',   label: 'Other Income',            hint: 'Tips, commissions, allowances, etc.' },
            ] as { key: keyof AdditionalIncome; label: string; hint: string }[]).map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-red-800 mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-red-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full p-2.5 pl-7 bg-white text-slate-900 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={inputs.additionalIncome?.[key] || ''}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateAdditional(key, parseAmount(e.target.value))}
                  />
                </div>
                <p className="text-xs text-red-600 mt-0.5 ml-1">{hint}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Deductions */}
      <div>
        <button
          type="button"
          onClick={() => setShowDeductions(v => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
            Other Deductions
          </h3>
          <div className="flex items-center gap-2">
            {(inputs.deductions && Object.values(inputs.deductions).some(v => v > 0)) && (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
            )}
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showDeductions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>
        <p className="text-xs text-slate-500 mt-1 mb-3">LTD, union dues, and other after-tax deductions from your cheque</p>

        {showDeductions && (
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
            {([
              { key: 'ltdPremium',       label: 'LTD / Disability Insurance', hint: 'Long-term disability premium per period' },
              { key: 'unionDues',        label: 'Union Dues',                  hint: 'Monthly dues deducted from your cheque' },
              { key: 'otherDeductions',  label: 'Other Deductions',            hint: 'Parking, tool rental, garnishment, etc.' },
            ] as { key: keyof Deductions; label: string; hint: string }[]).map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full p-2.5 pl-7 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={inputs.deductions?.[key] || ''}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateDeductions(key, parseAmount(e.target.value))}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-0.5 ml-1">{hint}</p>
              </div>
            ))}
            <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-2">
              These are deducted after tax — they reduce your net pay but not your taxable income.
            </p>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* RRSP Contribution */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            RRSP Contribution
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!(inputs.rrspContributionPerPeriod && inputs.rrspContributionPerPeriod > 0)}
              onChange={(e) => setInputs({ ...inputs, rrspContributionPerPeriod: e.target.checked ? 100 : 0 })}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {!!(inputs.rrspContributionPerPeriod && inputs.rrspContributionPerPeriod > 0) && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-fadeIn">
            <label className="block text-xs font-bold text-red-800 mb-1.5 ml-1">Per-Paycheque Contribution ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-red-400">$</span>
              <input
                type="number"
                min="0"
                step="25"
                className="w-full p-2.5 pl-7 bg-white text-slate-900 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={inputs.rrspContributionPerPeriod || ''}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setInputs({ ...inputs, rrspContributionPerPeriod: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <p className="text-xs text-red-700 mt-2">Reduces taxable income — lowers your federal &amp; provincial tax</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default InputSection;
