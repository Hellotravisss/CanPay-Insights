import React, { useState, useEffect } from 'react';
import { TimesheetInputs, TimesheetEntry, Province, PayFrequency } from '../types';
import { PROVINCIAL_DATA } from '../constants';
import { useTimesheetSave } from '../hooks/useTimesheetSave';

interface Props {
  inputs: TimesheetInputs;
  setInputs: (inputs: TimesheetInputs) => void;
}

const TimesheetInput: React.FC<Props> = ({ inputs, setInputs }) => {
  const { saveEntry, deleteEntry: deleteSavedEntry, loadEntries, isSyncing, isAuthenticated } = useTimesheetSave();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    checkIn: '09:00',
    checkOut: '17:00',
    unpaidBreakMinutes: 30,
    notes: ''
  });
  
  // Load entries from Supabase when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadEntries().then((loadedEntries) => {
        if (loadedEntries.length > 0) {
          setInputs({
            ...inputs,
            entries: loadedEntries
          });
        }
      });
    }
  }, [isAuthenticated]);

  // Get current month calendar data
  const getCurrentMonthData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    return { year, month, daysInMonth, startDayOfWeek };
  };

  const { year, month, daysInMonth, startDayOfWeek } = getCurrentMonthData();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Get entries for selected date
  const getEntriesForDate = (date: string) => {
    return inputs.entries.filter(e => e.date === date);
  };

  // Calculate hours for an entry
  const calculateEntryHours = (entry: TimesheetEntry) => {
    const [inH, inM] = entry.checkIn.split(':').map(Number);
    const [outH, outM] = entry.checkOut.split(':').map(Number);
    
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 1440; // Crossed midnight
    
    const paidMinutes = Math.max(0, totalMinutes - entry.unpaidBreakMinutes);
    return (paidMinutes / 60).toFixed(2);
  };

  // Add new entry
  const handleAddEntry = async () => {
    const entry: TimesheetEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      checkIn: newEntry.checkIn,
      checkOut: newEntry.checkOut,
      unpaidBreakMinutes: newEntry.unpaidBreakMinutes,
      notes: newEntry.notes || undefined
    };
    
    const newEntries = [...inputs.entries, entry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setInputs({
      ...inputs,
      entries: newEntries
    });
    
    // Save to Supabase if authenticated
    if (isAuthenticated) {
      await saveEntry(entry);
    }
    
    setIsAddingEntry(false);
    setNewEntry({
      checkIn: '09:00',
      checkOut: '17:00',
      unpaidBreakMinutes: 30,
      notes: ''
    });
  };

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    setInputs({
      ...inputs,
      entries: inputs.entries.filter(e => e.id !== id)
    });
    
    // Delete from Supabase if authenticated
    if (isAuthenticated) {
      await deleteSavedEntry(id);
    }
  };

  // Calculate total hours for current period
  const calculatePeriodHours = () => {
    return inputs.entries.reduce((sum, entry) => {
      return sum + parseFloat(calculateEntryHours(entry));
    }, 0).toFixed(2);
  };

  // Render calendar day
  const renderCalendarDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entriesForDay = getEntriesForDate(dateStr);
    const isSelected = dateStr === selectedDate;
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const hasEntries = entriesForDay.length > 0;
    
    return (
      <button
        key={day}
        onClick={() => setSelectedDate(dateStr)}
        className={`
          aspect-square p-2 rounded-lg text-sm font-medium transition-all relative
          ${isSelected 
            ? 'bg-red-600 text-white shadow-lg scale-105' 
            : hasEntries
            ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            : 'text-slate-600 hover:bg-slate-50'
          }
          ${isToday && !isSelected ? 'ring-2 ring-red-400' : ''}
        `}
      >
        {day}
        {hasEntries && (
          <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-600'}`} />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">⏱️ Timesheet Tracker</h2>
          {isSyncing && (
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </span>
          )}
        </div>
        <p className="text-slate-300 text-sm">
          Track your daily hours with precision
          {isAuthenticated && <span className="ml-2 text-green-300">• Synced to cloud ☁️</span>}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-2 gap-4">
          {/* Province */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Province</label>
            <select
              value={inputs.province}
              onChange={(e) => setInputs({ ...inputs, province: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
            >
              {Object.entries(PROVINCIAL_DATA).map(([key, data]) => (
                <option key={key} value={key}>{data.name}</option>
              ))}
            </select>
          </div>

          {/* Hourly Wage */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Wage</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                value={inputs.hourlyWage}
                onChange={(e) => setInputs({ ...inputs, hourlyWage: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Pay Frequency */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pay Frequency</label>
            <select
              value={inputs.payFrequency}
              onChange={(e) => setInputs({ ...inputs, payFrequency: e.target.value as PayFrequency })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
            >
              <option value={PayFrequency.DAILY}>Daily</option>
              <option value={PayFrequency.WEEKLY}>Weekly</option>
              <option value={PayFrequency.BI_WEEKLY}>Bi-Weekly (Every 2 weeks)</option>
              <option value={PayFrequency.MONTHLY}>Monthly</option>
              <option value={PayFrequency.QUARTERLY}>Quarterly</option>
            </select>
          </div>
        </div>

        {/* Calendar */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            {monthNames[month]} {year}
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
            
            {/* Empty cells before first day */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => renderCalendarDay(i + 1))}
          </div>
        </div>

        {/* Selected Date Info */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              📅 {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => setIsAddingEntry(true)}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              + Add Entry
            </button>
          </div>

          {/* Entry list for selected date */}
          {getEntriesForDate(selectedDate).length === 0 ? (
            <p className="text-sm text-slate-500 italic">No entries for this date</p>
          ) : (
            <div className="space-y-2">
              {getEntriesForDate(selectedDate).map(entry => (
                <div key={entry.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold text-slate-800">
                        {entry.checkIn} → {entry.checkOut}
                      </span>
                      <span className="text-slate-600">
                        ({calculateEntryHours(entry)}h)
                      </span>
                      {entry.unpaidBreakMinutes > 0 && (
                        <span className="text-xs text-slate-500">
                          Break: {entry.unpaidBreakMinutes}min
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-slate-600 mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="ml-2 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Entry Modal */}
        {isAddingEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Add Time Entry</h3>
              
              <div className="space-y-4">
                {/* Check-in */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Check In</label>
                  <input
                    type="time"
                    value={newEntry.checkIn}
                    onChange={(e) => setNewEntry({ ...newEntry, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Check Out</label>
                  <input
                    type="time"
                    value={newEntry.checkOut}
                    onChange={(e) => setNewEntry({ ...newEntry, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Break */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Unpaid Break (minutes)</label>
                  <input
                    type="number"
                    value={newEntry.unpaidBreakMinutes}
                    onChange={(e) => setNewEntry({ ...newEntry, unpaidBreakMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Training session"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAddingEntry(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-900">Total Hours Tracked</p>
              <p className="text-xs text-red-700 mt-1">{inputs.entries.length} entries</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{calculatePeriodHours()}</p>
              <p className="text-xs text-red-700">hours</p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-blue-800 font-medium">💡 Calculation Info</p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1">
            <li>• Overtime calculated based on {PROVINCIAL_DATA[inputs.province as keyof typeof PROVINCIAL_DATA]?.name || 'provincial'} rules</li>
            <li>• Pay calculated at {inputs.payFrequency} frequency</li>
            <li>• Add multiple entries per day for split shifts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimesheetInput;
