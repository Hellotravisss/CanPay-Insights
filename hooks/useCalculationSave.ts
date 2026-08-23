'use client';
import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './useAuth';
import { CalculationResult, CalculationMode } from '../types';

// Unified hook for saving/loading calculations — uses calculation_history table only.
// Anonymous users are handled by useCalculationHistory (localStorage).
export const useCalculationSave = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveCalculation = async (
    mode: CalculationMode,
    inputs: any,
    results: CalculationResult
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    setIsSaving(true);
    try {
      const { error } = await api('POST', '/api/me/history', {
        mode,
        inputs,
        results,
        name: `${mode} — ${new Date().toLocaleDateString('en-CA')}`,
        province: inputs.province || '',
      });

      if (error) {
        console.error('Error saving calculation:', error);
        return false;
      }

      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error saving calculation:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadHistory = async (limit = 20, offset = 0) => {
    if (!isAuthenticated || !user) return [];

    try {
      const { data, error } = await api<any[]>('GET', `/api/me/history?limit=${limit}&offset=${offset}`);

      if (error) {
        console.error('Error loading history:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  };

  const deleteCalculation = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    try {
      const { error } = await api('DELETE', `/api/me/history?id=${encodeURIComponent(id)}`);

      if (error) {
        console.error('Error deleting calculation:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting calculation:', error);
      return false;
    }
  };

  return { saveCalculation, loadHistory, deleteCalculation, isSaving, lastSaved, isAuthenticated };
};
