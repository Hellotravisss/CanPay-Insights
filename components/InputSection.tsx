import React from 'react';
import { SalaryInputs, Province } from '../types';
import { PROVINCIAL_DATA, DAYS_OF_WEEK } from '../constants';

interface Props {
  inputs: SalaryInputs;
  setInputs: React.Dispatch<React.SetStateAction<SalaryInputs>>;
}

const InputSection: React.FC<Props> = ({ inputs, setInputs }) => {

  const handleDayToggle = (index: number) => {
    const newDays = [...inputs.shift.daysActive];
    newDays[index] = !newDays[index];
    setInputs({ ...inputs, shift: { ...inputs.shift, daysActive: newDays } });
  };

  const updatePremium = (field: string, value: any) => {
    setInputs({ ...inputs, premium: { ...inputs.premium, [field]: value } });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>

      {/* Province & Wage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Province / Territory</label>
          <select 
            className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all cursor-pointer hover:border-red-300"
            value={inputs.province}
            onChange={(e) => setInputs({...inputs, province: e.target.value})}
          >
            {Object.values(PROVINCIAL_DATA).map((p) => (
              <option key={p.id} value={p.name} className="text-slate-900">{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Hourly Wage ($/hr)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-500 font-medium">$</span>
            <input 
              type="number" 
              className="w-full p-3 pl-8 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none font-medium"
              value={inputs.hourlyWage}
              onChange={(e) => setInputs({...inputs, hourlyWage: parseFloat(e.target.value) || 0})}
              placeholder="e.g. 25.00"
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
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all transform active:scale-95 ${
                inputs.shift.daysActive[idx] 
                ? 'bg-red-600 text-white shadow-md shadow-red-200' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
            <input 
              type="time" 
              className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={inputs.shift.startTime}
              onChange={(e) => setInputs({...inputs, shift: { ...inputs.shift, startTime: e.target.value }})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
            <input 
              type="time" 
              className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={inputs.shift.endTime}
              onChange={(e) => setInputs({...inputs, shift: { ...inputs.shift, endTime: e.target.value }})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unpaid Break (mins)</label>
            <input 
              type="number" 
              className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={inputs.shift.unpaidBreakMinutes}
              onChange={(e) => setInputs({...inputs, shift: { ...inputs.shift, unpaidBreakMinutes: parseInt(e.target.value) || 0 }})}
            />
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
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
             <div>
                <label className="block text-xs font-bold text-red-800 mb-1">Premium Rate ($/hr)</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-white text-slate-900 border border-red-200 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={inputs.premium.ratePerHour}
                  onChange={(e) => updatePremium('ratePerHour', parseFloat(e.target.value))}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-red-800 mb-1">From</label>
                <input 
                  type="time" 
                  className="w-full p-2 bg-white text-slate-900 border border-red-200 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={inputs.premium.startTime}
                  onChange={(e) => updatePremium('startTime', e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-red-800 mb-1">To</label>
                <input 
                  type="time" 
                  className="w-full p-2 bg-white text-slate-900 border border-red-200 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={inputs.premium.endTime}
                  onChange={(e) => updatePremium('endTime', e.target.value)}
                />
             </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <input 
          id="vacation"
          type="checkbox" 
          checked={inputs.includeVacationPay}
          onChange={(e) => setInputs({...inputs, includeVacationPay: e.target.checked})}
          className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
        />
        <label htmlFor="vacation" className="text-sm font-medium text-slate-700 cursor-pointer">Add 4% Vacation Pay</label>
      </div>

    </div>
  );
};

export default InputSection;