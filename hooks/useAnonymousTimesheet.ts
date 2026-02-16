import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TimesheetEntry } from '../types';
import { getAnonymousUserId } from '../utils/anonymousUser';

/**
 * Hook for syncing timesheet entries with Supabase using anonymous user ID
 * No login required - uses device-specific anonymous ID
 */
export const useAnonymousTimesheet = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const anonymousUserId = getAnonymousUserId();

  /**
   * Load all entries for this anonymous user
   */
  const loadEntries = async (): Promise<TimesheetEntry[]> => {
    try {
      setIsSyncing(true);
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', anonymousUserId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to load entries:', error);
        return [];
      }

      // Convert database format to app format
      const entries: TimesheetEntry[] = (data || []).map((row) => ({
        id: row.id,
        date: row.date,
        checkIn: row.check_in,
        checkOut: row.check_out,
        unpaidBreakMinutes: row.unpaid_break_minutes,
        notes: row.notes || '',
      }));

      setLastSyncTime(new Date());
      return entries;
    } catch (err) {
      console.error('Error loading entries:', err);
      return [];
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Save a single entry (insert or update)
   */
  const saveEntry = async (entry: TimesheetEntry): Promise<boolean> => {
    try {
      setIsSyncing(true);

      const { error } = await supabase
        .from('timesheet_entries')
        .upsert({
          id: entry.id,
          user_id: anonymousUserId,
          date: entry.date,
          check_in: entry.checkIn,
          check_out: entry.checkOut,
          unpaid_break_minutes: entry.unpaidBreakMinutes,
          notes: entry.notes || null,
        });

      if (error) {
        console.error('Failed to save entry:', error);
        return false;
      }

      setLastSyncTime(new Date());
      return true;
    } catch (err) {
      console.error('Error saving entry:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Delete an entry
   */
  const deleteEntry = async (entryId: string): Promise<boolean> => {
    try {
      setIsSyncing(true);

      const { error } = await supabase
        .from('timesheet_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', anonymousUserId); // Security: only delete own entries

      if (error) {
        console.error('Failed to delete entry:', error);
        return false;
      }

      setLastSyncTime(new Date());
      return true;
    } catch (err) {
      console.error('Error deleting entry:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Sync all entries (useful for batch operations)
   */
  const syncAllEntries = async (entries: TimesheetEntry[]): Promise<boolean> => {
    try {
      setIsSyncing(true);

      // Delete all existing entries for this user
      await supabase
        .from('timesheet_entries')
        .delete()
        .eq('user_id', anonymousUserId);

      // Insert all entries
      if (entries.length > 0) {
        const { error } = await supabase
          .from('timesheet_entries')
          .insert(
            entries.map((entry) => ({
              id: entry.id,
              user_id: anonymousUserId,
              date: entry.date,
              check_in: entry.checkIn,
              check_out: entry.checkOut,
              unpaid_break_minutes: entry.unpaidBreakMinutes,
              notes: entry.notes || null,
            }))
          );

        if (error) {
          console.error('Failed to sync entries:', error);
          return false;
        }
      }

      setLastSyncTime(new Date());
      return true;
    } catch (err) {
      console.error('Error syncing entries:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSyncTime,
    anonymousUserId,
    loadEntries,
    saveEntry,
    deleteEntry,
    syncAllEntries,
  };
};
