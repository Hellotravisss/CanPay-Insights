import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { SalaryInputs, AnnualSalaryInputs, TimesheetInputs, CalculationMode } from '../types';

// 本地存储键
const LOCAL_STORAGE_KEY = 'canpay_user_settings';
const ANONYMOUS_ID_KEY = 'canpay_anonymous_id';

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

// 生成匿名 ID
const getAnonymousId = (): string => {
  let id = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!id) {
    id = 'anon_' + crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }
  return id;
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
  saveSettings: (mode: CalculationMode, data: SalaryInputs | AnnualSalaryInputs | TimesheetInputs) => Promise<void>;
  saveLastMode: (mode: CalculationMode) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useUserSettings = (userId: string | null): UseUserSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 使用 ref 跟踪是否已经加载过数据，避免重复加载
  const hasLoadedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // 从本地存储加载
  const loadFromLocalStorage = useCallback((): UserSettings | null => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    return null;
  }, []);

  // 保存到本地存储
  const saveToLocalStorage = useCallback((newSettings: UserSettings) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, []);

  // 从 Supabase 加载设置
  const loadFromSupabase = useCallback(async (): Promise<UserSettings | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // 如果没有记录，创建一条
        if (error.code === 'PGRST116') {
          try {
            const { error: insertError } = await supabase
              .from('user_settings')
              .insert([{ user_id: userId }]);
            
            if (insertError) {
              console.warn('Error creating user settings (table may not exist):', insertError);
              return null;
            }
            return DEFAULT_SETTINGS;
          } catch (e) {
            console.warn('user_settings table may not exist, using localStorage');
            return null;
          }
        }
        console.warn('Error loading from Supabase:', error);
        return null;
      }

      return {
        simple: data.simple_inputs || DEFAULT_SETTINGS.simple,
        annual: data.annual_inputs || DEFAULT_SETTINGS.annual,
        timesheet: { ...DEFAULT_SETTINGS.timesheet, ...data.timesheet_inputs },
        lastMode: data.last_mode || 'simple'
      };
    } catch (e) {
      console.warn('Error in loadFromSupabase:', e);
      return null;
    }
  }, [userId]);

  // 保存到 Supabase（带防抖）
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const saveToSupabase = useCallback(async (newSettings: UserSettings) => {
    if (!userId) return;
    
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // 延迟保存，避免频繁调用
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
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
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.warn('Error saving to Supabase:', error.message);
        } else {
          console.log('Settings saved to Supabase');
        }
      } catch (e) {
        console.warn('Error in saveToSupabase:', e);
      }
    }, 500); // 500ms 防抖
  }, [userId]);

  // 加载设置（优先从 Supabase，其次本地存储）
  const loadSettings = useCallback(async () => {
    // 避免重复加载同一用户的数据
    if (hasLoadedRef.current && lastUserIdRef.current === userId) return;
    
    setIsLoading(true);
    
    try {
      let loadedSettings: UserSettings | null = null;

      if (userId) {
        // 已登录用户：从 Supabase 加载
        loadedSettings = await loadFromSupabase();
      }

      if (!loadedSettings) {
        // 未登录或加载失败：从本地存储加载
        loadedSettings = loadFromLocalStorage();
      }

      if (loadedSettings) {
        setSettings(loadedSettings);
        // 如果没有登录，也保存到本地存储
        if (!userId) {
          saveToLocalStorage(loadedSettings);
        }
      }
    } finally {
      setIsLoading(false);
      hasLoadedRef.current = true;
      lastUserIdRef.current = userId;
    }
  }, [userId, loadFromSupabase, loadFromLocalStorage, saveToLocalStorage]);

  // 初始加载 + 用户状态变化时重新加载
  useEffect(() => {
    loadSettings();
  }, [userId]); // 只依赖 userId，不依赖 loadSettings

  // 保存特定模式的设置
  const saveSettings = useCallback(async (
    mode: CalculationMode,
    data: SalaryInputs | AnnualSalaryInputs | TimesheetInputs
  ) => {
    setIsSaving(true);
    
    try {
      const newSettings = { ...settings };
      
      if (mode === 'simple') {
        newSettings.simple = data as SalaryInputs;
      } else if (mode === 'annual') {
        newSettings.annual = data as AnnualSalaryInputs;
      } else if (mode === 'timesheet') {
        // 对于 timesheet，我们只保存基础配置，条目单独保存
        const { entries, ...config } = data as TimesheetInputs;
        newSettings.timesheet = { ...newSettings.timesheet, ...config };
      }

      setSettings(newSettings);

      // 保存到本地存储（所有用户）
      saveToLocalStorage(newSettings);

      // 保存到 Supabase（仅登录用户）
      if (userId) {
        await saveToSupabase(newSettings);
      }
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId, saveToLocalStorage, saveToSupabase]);

  // 保存最后使用的模式
  const saveLastMode = useCallback(async (mode: CalculationMode) => {
    const newSettings = { ...settings, lastMode: mode };
    setSettings(newSettings);
    
    // 保存到本地存储
    saveToLocalStorage(newSettings);
    
    // 保存到 Supabase（仅登录用户）
    if (userId) {
      await saveToSupabase(newSettings);
    }
  }, [settings, userId, saveToLocalStorage, saveToSupabase]);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    saveLastMode,
    loadSettings
  };
};

// 保存 Timesheet 条目
export const useTimesheetEntries = (userId: string | null) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 加载条目
  const loadEntries = useCallback(async () => {
    if (!userId) {
      // 未登录：从本地存储加载
      try {
        const stored = localStorage.getItem('canpay_timesheet_entries');
        if (stored) {
          setEntries(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading timesheet entries:', e);
      }
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading timesheet entries:', error);
        return;
      }

      setEntries(data || []);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 保存条目
  const saveEntry = useCallback(async (entry: any) => {
    if (!userId) {
      // 未登录：保存到本地存储
      const newEntries = [...entries, { ...entry, id: crypto.randomUUID() }];
      localStorage.setItem('canpay_timesheet_entries', JSON.stringify(newEntries));
      setEntries(newEntries);
      return;
    }

    const { data, error } = await supabase
      .from('timesheet_entries')
      .insert([{ ...entry, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error saving entry:', error);
      return;
    }

    setEntries(prev => [data, ...prev]);
  }, [userId, entries]);

  // 删除条目
  const deleteEntry = useCallback(async (entryId: string) => {
    if (!userId) {
      const newEntries = entries.filter(e => e.id !== entryId);
      localStorage.setItem('canpay_timesheet_entries', JSON.stringify(newEntries));
      setEntries(newEntries);
      return;
    }

    const { error } = await supabase
      .from('timesheet_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting entry:', error);
      return;
    }

    setEntries(prev => prev.filter(e => e.id !== entryId));
  }, [userId, entries]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return { entries, isLoading, saveEntry, deleteEntry, loadEntries };
};

export default useUserSettings;
