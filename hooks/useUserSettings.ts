import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { SalaryInputs, AnnualSalaryInputs, TimesheetInputs, CalculationMode } from '../types';

// 本地存储键
const LOCAL_STORAGE_KEY = 'canpay_user_settings';

// 默认设置
const DEFAULT_SETTINGS = {
  simple: {
    province: 'ON',
    hourlyWage: 20.00,
    shift: {
      startTime: "09:00",
      endTime: "17:00",
      unpaidBreakMinutes: 30,
      daysActive: [false, true, true, true, true, true, false]
    },
    premium: {
      enabled: false,
      ratePerHour: 2.00,
      startTime: "00:00",
      endTime: "06:00"
    },
    vacationPayRate: 0
  } as SalaryInputs,
  annual: {
    province: 'ON',
    annualSalary: 100000,
    payFrequency: 'bi-weekly'
  } as AnnualSalaryInputs,
  timesheet: {
    province: 'ON',
    hourlyWage: 20.00,
    payFrequency: 'weekly',
    entries: []
  } as TimesheetInputs,
  lastMode: 'simple' as CalculationMode
};

interface UserSettings {
  simple: SalaryInputs;
  annual: AnnualSalaryInputs;
  timesheet: TimesheetInputs;
  lastMode: CalculationMode;
}

interface UseUserSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  isSaving: boolean;
  saveSettings: (mode: CalculationMode, data: SalaryInputs | AnnualSalaryInputs | TimesheetInputs) => void;
  saveLastMode: (mode: CalculationMode) => void;
}

export const useUserSettings = (userId: string | null): UseUserSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const loadedUserId = useRef<string | null>(null);

  // 只加载一次数据
  useEffect(() => {
    // 避免重复加载同一用户的数据
    if (loadedUserId.current === userId) return;
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // 先尝试从本地存储加载
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        let localSettings: UserSettings | null = null;
        
        if (stored) {
          try {
            localSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
          } catch (e) {
            console.warn('Failed to parse local settings');
          }
        }
        
        // 如果已登录，尝试从 Supabase 加载
        if (userId) {
          try {
            const { data, error } = await supabase
              .from('user_settings')
              .select('*')
              .eq('user_id', userId)
              .single();

            if (data && !error) {
              // 合并 Supabase 数据和本地设置
              setSettings({
                simple: data.simple_inputs || localSettings?.simple || DEFAULT_SETTINGS.simple,
                annual: data.annual_inputs || localSettings?.annual || DEFAULT_SETTINGS.annual,
                timesheet: { ...DEFAULT_SETTINGS.timesheet, ...data.timesheet_inputs } || localSettings?.timesheet || DEFAULT_SETTINGS.timesheet,
                lastMode: data.last_mode || localSettings?.lastMode || DEFAULT_SETTINGS.lastMode
              });
            } else if (localSettings) {
              setSettings(localSettings);
            }
          } catch (e) {
            console.warn('Supabase load failed, using local settings');
            if (localSettings) setSettings(localSettings);
          }
        } else if (localSettings) {
          setSettings(localSettings);
        }
      } finally {
        setIsLoading(false);
        loadedUserId.current = userId;
      }
    };
    
    loadData();
  }, [userId]);

  // 保存到本地存储
  const saveToLocal = useCallback((newSettings: UserSettings) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save to localStorage');
    }
  }, []);

  // 保存设置
  const saveSettings = useCallback((
    mode: CalculationMode,
    data: SalaryInputs | AnnualSalaryInputs | TimesheetInputs
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      
      if (mode === 'simple') {
        newSettings.simple = data as SalaryInputs;
      } else if (mode === 'annual') {
        newSettings.annual = data as AnnualSalaryInputs;
      } else if (mode === 'timesheet') {
        const { entries, ...config } = data as TimesheetInputs;
        newSettings.timesheet = { ...newSettings.timesheet, ...config };
      }
      
      // 保存到本地
      saveToLocal(newSettings);
      
      // 如果已登录，异步保存到 Supabase（不等待）
      if (userId) {
        setIsSaving(true);
        (async () => {
          try {
            await supabase
              .from('user_settings')
              .upsert({
                user_id: userId,
                simple_inputs: newSettings.simple,
                annual_inputs: newSettings.annual,
                timesheet_inputs: {
                  province: newSettings.timesheet.province,
                  hourlyWage: newSettings.timesheet.hourlyWage,
                  payFrequency: newSettings.timesheet.payFrequency
                },
                last_mode: newSettings.lastMode,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
          } catch (e) {
            console.warn('Failed to save to Supabase');
          } finally {
            setIsSaving(false);
          }
        })();
      }
      
      return newSettings;
    });
  }, [userId, saveToLocal]);

  // 保存最后使用的模式
  const saveLastMode = useCallback((mode: CalculationMode) => {
    setSettings(prev => {
      const newSettings = { ...prev, lastMode: mode };
      saveToLocal(newSettings);
      
      // 如果已登录，异步保存到 Supabase
      if (userId) {
        (async () => {
          try {
            await supabase
              .from('user_settings')
              .upsert({
                user_id: userId,
                last_mode: mode,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
          } catch (e) {
            // Ignore errors
          }
        })();
      }
      
      return newSettings;
    });
  }, [userId, saveToLocal]);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    saveLastMode
  };
};

export default useUserSettings;
