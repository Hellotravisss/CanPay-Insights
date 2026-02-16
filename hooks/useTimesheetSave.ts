import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { TimesheetEntry } from '../types';

export const useTimesheetSave = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  // Load timesheet entries from Supabase
  const loadEntries = async () => {
    if (!isAuthenticated || !user) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading timesheet entries:', error);
        return [];
      }

      // Transform to TimesheetEntry format
      const transformedEntries: TimesheetEntry[] = (data || []).map((row) => ({
        id: row.id,
        date: row.date,
        checkIn: row.check_in,
        checkOut: row.check_out,
        unpaidBreakMinutes: row.unpaid_break_minutes,
        notes: row.notes || undefined,
      }));

      setEntries(transformedEntries);
      return transformedEntries;
    } catch (error) {
      console.error('Error loading timesheet entries:', error);
      return [];
    }
  };

  // Save a single entry
  const saveEntry = async (entry: TimesheetEntry): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .upsert({
          id: entry.id,
          user_id: user.id,
          date: entry.date,
          check_in: entry.checkIn,
          check_out: entry.checkOut,
          unpaid_break_minutes: entry.unpaidBreakMinutes,
          notes: entry.notes || null,
        });

      if (error) {
        console.error('Error saving timesheet entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving timesheet entry:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete entry
  const deleteEntry = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting timesheet entry:', error);
        return false;
      }

      // Update local state
      setEntries((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting timesheet entry:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync all entries (batch save)
  const syncAllEntries = async (entriesToSync: TimesheetEntry[]): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    setIsSyncing(true);
    try {
      const dbEntries = entriesToSync.map((entry) => ({
        id: entry.id,
        user_id: user.id,
        date: entry.date,
        check_in: entry.checkIn,
        check_out: entry.checkOut,
        unpaid_break_minutes: entry.unpaidBreakMinutes,
        notes: entry.notes || null,
      }));

      const { error } = await supabase.from('timesheet_entries').upsert(dbEntries);

      if (error) {
        console.error('Error syncing timesheet entries:', error);
        return false;
      }

      setEntries(entriesToSync);
      return true;
    } catch (error) {
      console.error('Error syncing timesheet entries:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-load entries on mount and auth change
  useEffect(() => {
    if (isAuthenticated) {
      loadEntries();
    } else {
      setEntries([]);
    }
  }, [isAuthenticated, user?.id]);

  return {
    entries,
    loadEntries,
    saveEntry,
    deleteEntry,
    syncAllEntries,
    isSyncing,
    isAuthenticated,
  };
};
