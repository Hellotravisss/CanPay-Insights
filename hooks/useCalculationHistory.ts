'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CalculationResult, CalculationMode } from '../types';

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
const PAGE_SIZE = 20;

export const useCalculationHistory = (userId: string | null) => {
  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadRecords = useCallback(async (pageIndex = 0) => {
    setIsLoading(true);
    try {
      if (userId) {
        // Authenticated: load from Supabase with pagination
        const from = pageIndex * PAGE_SIZE;
        const { data, error } = await supabase
          .from('calculation_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (!error && data) {
          const formatted: CalculationRecord[] = data.map(row => ({
            id: row.id,
            mode: row.mode,
            name: row.name,
            province: row.province,
            inputs: row.inputs,
            results: row.results,
            createdAt: row.created_at,
          }));
          setRecords(prev => pageIndex === 0 ? formatted : [...prev, ...formatted]);
          setHasMore(data.length === PAGE_SIZE);
          setPage(pageIndex);
          return;
        }
      }

      // Anonymous or Supabase failed: use localStorage only
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecords(Array.isArray(parsed) ? parsed : []);
      }
      setHasMore(false);
    } catch (err) {
      console.warn('Failed to load calculation history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRecords(0);
  }, [loadRecords]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) loadRecords(page + 1);
  }, [hasMore, isLoading, page, loadRecords]);

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
      createdAt: new Date().toISOString(),
    };

    setRecords(prev => {
      const next = [record, ...prev].slice(0, MAX_LOCAL_RECORDS);
      if (!userId) {
        // Anonymous: persist to localStorage only
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
      return next;
    });

    if (userId) {
      // Authenticated: save to Supabase (single table: calculation_history)
      try {
        const { error } = await supabase
          .from('calculation_history')
          .insert({
            id: record.id,
            user_id: userId,
            mode: record.mode,
            name: record.name,
            province: record.province,
            inputs: record.inputs,
            results: record.results,
            created_at: record.createdAt,
          });
        if (error) console.error('Failed to save to Supabase:', error);
      } catch (err) {
        console.error('Error saving calculation:', err);
      }
    }

    return record;
  }, [userId]);

  const deleteRecord = useCallback(async (id: string) => {
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      if (!userId) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
      return next;
    });

    if (userId) {
      try {
        await supabase
          .from('calculation_history')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  }, [userId]);

  const clearHistory = useCallback(async () => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);

    if (userId) {
      try {
        await supabase
          .from('calculation_history')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.error('Error clearing history:', err);
      }
    }
  }, [userId]);

  return { records, isLoading, hasMore, loadMore, saveCalculation, deleteRecord, clearHistory };
};

function generateDefaultName(
  mode: CalculationMode,
  province: string,
  inputs: Record<string, any>
): string {
  const date = new Date().toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  switch (mode) {
    case CalculationMode.SIMPLE:
      return `${province} - $${inputs.hourlyWage}/hr (${date})`;
    case CalculationMode.ANNUAL:
      return `${province} - $${inputs.annualSalary?.toLocaleString()}/year (${date})`;
    case CalculationMode.TIMESHEET:
      return `${province} - ${inputs.entries?.length || 0} entries (${date})`;
    default:
      return `Calculation (${date})`;
  }
}

export default useCalculationHistory;
