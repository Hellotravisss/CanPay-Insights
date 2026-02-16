import React from 'react';
import { AnnualSalaryInputs, Province, PayFrequency } from '../types';

interface Props {
  inputs: AnnualSalaryInputs;
  setInputs: React.Dispatch<React.SetStateAction<AnnualSalaryInputs>>;
}

const AnnualSalaryInput: React.FC<Props> = ({ inputs, setInputs }) => {
  
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
          {Object.entries(Province).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          💼 Tax rates and deductions vary by province
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-xs text-blue-800">
            <p className="font-bold mb-1">💡 Calculation Info</p>
            <p>Automatically calculates federal tax, provincial tax, CPP, and EI deductions based on bi-weekly pay periods (26 per year - standard in Canada).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualSalaryInput;
