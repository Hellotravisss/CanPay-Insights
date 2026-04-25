'use client';
import React, { useState } from 'react';
import { AnnualSalaryInputs, Province, PayFrequency, AdditionalIncome, Deductions } from '../types';
import { PROVINCIAL_DATA } from '../constants';

interface Props {
  inputs: AnnualSalaryInputs;
  setInputs: React.Dispatch<React.SetStateAction<AnnualSalaryInputs>>;
}

const AnnualSalaryInput: React.FC<Props> = ({ inputs, setInputs }) => {
  const [showAdditional, setShowAdditional] = useState(false);
  const [showDeductions, setShowDeductions] = useState(false);

  const updateAdditional = (field: keyof AdditionalIncome, value: number) => {
    setInputs({ ...inputs, additionalIncome: { ...inputs.additionalIncome!, [field]: value } });
  };
  const updateDeductions = (field: keyof Deductions, value: number) => {
    setInputs({ ...inputs, deductions: { ...inputs.deductions!, [field]: value } });
  };
  const parseAmt = (v: string) => Math.max(0, parseFloat(v) || 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Annual Salary Calculator</h2>
          <p className="text-xs text-slate-500">Enter your annual salary to see take-home pay</p>
        </div>
      </div>

      {/* Annual Salary Input */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Annual Salary <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
          <input
            type="number"
            value={inputs.annualSalary}
            onChange={(e) => setInputs({ ...inputs, annualSalary: parseFloat(e.target.value) || 0 })}
            className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:outline-none text-lg font-bold"
            placeholder="100,000"
            step="1000"
            min="0"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          📊 Annual Salary: {formatCurrency(inputs.annualSalary)}
        </p>
      </div>

      {/* Province Selection */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Province <span className="text-red-600">*</span>
        </label>
        <select
          value={inputs.province}
          onChange={(e) => setInputs({ ...inputs, province: e.target.value })}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:outline-none font-medium"
        >
          {Object.entries(PROVINCIAL_DATA).map(([key, data]) => (
            <option key={key} value={key}>
              {data.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          💼 Tax rates and deductions vary by province
        </p>
      </div>

      <hr className="border-slate-100" />

      {/* Additional Income */}
      <div>
        <button type="button" onClick={() => setShowAdditional(v => !v)} className="w-full flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-bold text-slate-700">Additional Income</p>
            <p className="text-xs text-slate-500">Bonus, stat holiday, retroactive pay, etc.</p>
          </div>
          <div className="flex items-center gap-2">
            {(inputs.additionalIncome && Object.values(inputs.additionalIncome).some(v => v > 0)) && (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
            )}
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showAdditional ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>
        {showAdditional && (
          <div className="mt-3 bg-red-50 p-4 rounded-xl border border-red-100 space-y-3">
            {([
              { key: 'statHolidayPay', label: 'Statutory Holiday Pay', hint: 'Per pay period' },
              { key: 'sickPay',        label: 'Sick Pay / Paid Leave',  hint: 'Per pay period' },
              { key: 'bonus',          label: 'Bonus / Retroactive Pay', hint: 'Per pay period (annualized)' },
              { key: 'otherIncome',   label: 'Other Income',            hint: 'Tips, commissions, allowances' },
            ] as { key: keyof AdditionalIncome; label: string; hint: string }[]).map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-red-800 mb-1">{label} <span className="font-normal text-red-600">({hint})</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 font-bold">$</span>
                  <input type="number" min="0" step="1" placeholder="0"
                    className="w-full pl-8 pr-4 py-2.5 border border-red-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={inputs.additionalIncome?.[key] || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateAdditional(key, parseAmt(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Other Deductions */}
      <div>
        <button type="button" onClick={() => setShowDeductions(v => !v)} className="w-full flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-bold text-slate-700">Other Deductions</p>
            <p className="text-xs text-slate-500">LTD, union dues — deducted after tax</p>
          </div>
          <div className="flex items-center gap-2">
            {(inputs.deductions && Object.values(inputs.deductions).some(v => v > 0)) && (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
            )}
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showDeductions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>
        {showDeductions && (
          <div className="mt-3 bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3">
            {([
              { key: 'ltdPremium',      label: 'LTD / Disability Insurance' },
              { key: 'unionDues',       label: 'Union Dues' },
              { key: 'otherDeductions', label: 'Other (parking, tools…)' },
            ] as { key: keyof Deductions; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input type="number" min="0" step="1" placeholder="0"
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={inputs.deductions?.[key] || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateDeductions(key, parseAmt(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* RRSP Contribution */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-bold text-slate-700">RRSP Contribution</label>
            <p className="text-xs text-slate-500">Per pay period — reduces taxable income</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer"
              checked={!!(inputs.rrspContributionPerPeriod && inputs.rrspContributionPerPeriod > 0)}
              onChange={(e) => setInputs({ ...inputs, rrspContributionPerPeriod: e.target.checked ? 200 : 0 })}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
        {!!(inputs.rrspContributionPerPeriod && inputs.rrspContributionPerPeriod > 0) && (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
            <input type="number" min="0" step="50" placeholder="200"
              className="w-full pl-8 pr-4 py-3 border-2 border-red-200 rounded-lg focus:border-red-500 focus:outline-none font-bold bg-red-50"
              value={inputs.rrspContributionPerPeriod || ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setInputs({ ...inputs, rrspContributionPerPeriod: parseFloat(e.target.value) || 0 })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnualSalaryInput;
