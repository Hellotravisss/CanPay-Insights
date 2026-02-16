import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { CalculationResult, CalculationMode } from '../types';

export const useCalculationSave = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save calculation to Supabase
  const saveCalculation = async (
    mode: CalculationMode,
    inputs: any,
    results: CalculationResult
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping save');
      return false;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('calculations')
        .insert({
          user_id: user.id,
          mode,
          inputs,
          results,
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

  // Load calculation history
  const loadHistory = async (limit: number = 10) => {
    if (!isAuthenticated || !user) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

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

  // Delete calculation
  const deleteCalculation = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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

  return {
    saveCalculation,
    loadHistory,
    deleteCalculation,
    isSaving,
    lastSaved,
    isAuthenticated,
  };
};
