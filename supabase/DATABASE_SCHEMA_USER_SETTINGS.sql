-- CanPay Insights - 用户设置和数据持久化 Schema
-- 在 Supabase SQL Editor 中运行此文件

-- ========================================
-- 1. 用户设置表 (保存用户的输入偏好)
-- ========================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 简易模式设置
  simple_inputs JSONB DEFAULT '{
    "province": "ON",
    "hourlyWage": 20.00,
    "shift": {
      "startTime": "09:00",
      "endTime": "17:00",
      "unpaidBreakMinutes": 30,
      "daysActive": [false, true, true, true, true, true, false]
    },
    "premium": {
      "enabled": false,
      "ratePerHour": 2.00,
      "startTime": "00:00",
      "endTime": "06:00"
    },
    "vacationPayRate": 0
  }'::jsonb,
  
  -- 年薪模式设置
  annual_inputs JSONB DEFAULT '{
    "province": "ON",
    "annualSalary": 100000,
    "payFrequency": "bi-weekly"
  }'::jsonb,
  
  -- Timesheet 模式设置 (基础配置，不含条目)
  timesheet_inputs JSONB DEFAULT '{
    "province": "ON",
    "hourlyWage": 20.00,
    "payFrequency": "weekly"
  }'::jsonb,
  
  -- 上次使用的模式
  last_mode TEXT DEFAULT 'simple',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_mode CHECK (last_mode IN ('simple', 'annual', 'timesheet'))
);

-- 启用 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能访问自己的设置
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- 唯一约束：每个用户只有一条设置记录
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_user_id 
  ON user_settings(user_id);

-- ========================================
-- 2. 计算历史表 (已存在的表，确保结构正确)
-- ========================================

CREATE TABLE IF NOT EXISTS calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('simple', 'annual', 'timesheet')),
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);

-- RLS
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 3. Timesheet 条目表 (已存在的表，确保结构正确)
-- ========================================

CREATE TABLE IF NOT EXISTS timesheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME NOT NULL,
  check_out TIME NOT NULL,
  unpaid_break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_timesheet_user_date ON timesheet_entries(user_id, date DESC);

-- RLS
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timesheet entries"
  ON timesheet_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timesheet entries"
  ON timesheet_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timesheet entries"
  ON timesheet_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timesheet entries"
  ON timesheet_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 4. 触发器：自动更新 updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Timesheet 条目更新触发器
DROP TRIGGER IF EXISTS update_timesheet_entries_updated_at ON timesheet_entries;
CREATE TRIGGER update_timesheet_entries_updated_at
  BEFORE UPDATE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 用户设置更新触发器
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. 触发器：用户注册时自动创建设置记录
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 创建用户设置记录
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 确保触发器存在
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 6. 为现有用户创建设置记录
-- ========================================

INSERT INTO user_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- 7. 验证
-- ========================================

SELECT '✅ 数据库表创建成功！' as status;

-- 列出所有表
SELECT 
  table_name,
  'Table' as type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_settings', 'calculations', 'timesheet_entries')
ORDER BY table_name;

-- ========================================
-- 完成！🎉
-- ========================================
-- 下一步：在 Supabase Dashboard 中启用 OAuth 提供商
-- Authentication > Providers > Google / Apple / Facebook
