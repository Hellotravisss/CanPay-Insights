'use client';
import { useState } from 'react';
import { TimesheetEntry } from '../types';

const STORAGE_KEY = 'canpay_timesheet_entries';

const loadFromStorage = (): TimesheetEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveToStorage = (entries: TimesheetEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('Failed to save timesheet to localStorage:', err);
  }
};

export const useAnonymousTimesheet = () => {
  const [isSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const loadEntries = async (): Promise<TimesheetEntry[]> => {
    const entries = loadFromStorage();
    setLastSyncTime(new Date());
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  };

  const saveEntry = async (entry: TimesheetEntry): Promise<boolean> => {
    const entries = loadFromStorage();
    const idx = entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.unshift(entry);
    }
    saveToStorage(entries);
    setLastSyncTime(new Date());
    return true;
  };

  const deleteEntry = async (entryId: string): Promise<boolean> => {
    const entries = loadFromStorage().filter(e => e.id !== entryId);
    saveToStorage(entries);
    setLastSyncTime(new Date());
    return true;
  };

  const syncAllEntries = async (entries: TimesheetEntry[]): Promise<boolean> => {
    saveToStorage(entries);
    setLastSyncTime(new Date());
    return true;
  };

  return {
    isSyncing,
    lastSyncTime,
    anonymousUserId: 'local',
    loadEntries,
    saveEntry,
    deleteEntry,
    syncAllEntries,
  };
};
