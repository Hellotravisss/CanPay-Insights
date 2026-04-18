'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CalculationResult, CalculationMode, Province, PayFrequency } from '../types';

export interface CalculationRecord {
  id: string;
  mode: CalculationMode;
  name: string;
  province: string;
  inputs: Record<string, any>;
  results: CalculationResult;
  createdAt: string;
}

const STORAGE_KEY = 'canpay_calculation_history';
const MAX_LOCAL_RECORDS = 50;

export const useCalculationHistory = (userId: string | null) => {
  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load records on mount
  useEffect(() => {
    const loadRecords = async () => {
      setIsLoading(true);
      
      try {
        // Try to load from Supabase (works for both authenticated and anonymous users)
        try {
          const { data, error } = await supabase
            .from('calculation_history')
            .select('*')
            .eq('user_id', userId || 'anonymous')
            .order('created_at', { ascending: false })
            .limit(100);

          if (!error && data) {
            const formattedRecords: CalculationRecord[] = data.map(row => ({
              id: row.id,
              mode: row.mode,
              name: row.name,
              province: row.province,
              inputs: row.inputs,
              results: row.results,
              createdAt: row.created_at
            }));
            setRecords(formattedRecords);
            // Also sync to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedRecords));
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase load failed, using local settings');
        }

        // Fall back to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecords(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.error('Failed to load calculation history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [userId]);

  // Save a new calculation record
  const saveCalculation = useCallback(async (
    mode: CalculationMode,
    province: string,
    inputs: Record<string, any>,
    results: CalculationResult,
    name?: string
  ): Promise<CalculationRecord | null> => {
    const record: CalculationRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mode,
      name: name || generateDefaultName(mode, province, inputs),
      province,
      inputs,
      results,
      createdAt: new Date().toISOString()
    };

    // Update local state
    setRecords(prev => {
      const newRecords = [record, ...prev].slice(0, MAX_LOCAL_RECORDS);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
      } catch (e) {
        console.warn('Failed to save to localStorage');
      }
      
      return newRecords;
    });

    // Save to Supabase (works for both authenticated and anonymous users)
    try {
      const { error } = await supabase
        .from('calculation_history')
        .insert({
          id: record.id,
          user_id: userId || 'anonymous',
          mode: record.mode,
          name: record.name,
          province: record.province,
          inputs: record.inputs,
          results: record.results,
          created_at: record.createdAt
        });

      if (error) {
        console.error('Failed to save to Supabase:', error);
      }
    } catch (err) {
      console.error('Error saving calculation:', err);
    }

    return record;
  }, [userId]);

  // Delete a record
  const deleteRecord = useCallback(async (id: string) => {
    setRecords(prev => {
      const newRecords = prev.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
      return newRecords;
    });

    try {
      await supabase
        .from('calculation_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId || 'anonymous');
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  }, [userId]);

  // Clear all records
  const clearHistory = useCallback(async () => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);

    try {
      await supabase
        .from('calculation_history')
        .delete()
        .eq('user_id', userId || 'anonymous');
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  }, [userId]);

  return {
    records,
    isLoading,
    saveCalculation,
    deleteRecord,
    clearHistory
  };
};

// Generate a default name for the calculation
function generateDefaultName(
  mode: CalculationMode,
  province: string,
  inputs: Record<string, any>
): string {
  const date = new Date().toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  switch (mode) {
    case CalculationMode.SIMPLE:
      return `${province} - $${inputs.hourlyWage}/hr (${date})`;
    case CalculationMode.ANNUAL:
      return `${province} - $${inputs.annualSalary?.toLocaleString()}/year (${date})`;
    case CalculationMode.TIMESHEET:
      const entryCount = inputs.entries?.length || 0;
      return `${province} - ${entryCount} entries (${date})`;
    default:
      return `Calculation (${date})`;
  }
}

export default useCalculationHistory;
