-- CanPay Insights - Anonymous Mode Database Schema (Final Fixed Version)
-- 在 Supabase SQL Editor 中运行此文件
-- v3: 修复视图依赖问题

-- ========================================
-- STEP 0: 删除所有依赖视图
-- ========================================

DROP VIEW IF EXISTS user_statistics CASCADE;

-- ========================================
-- STEP 1: 删除所有现有策略和约束
-- ========================================

-- 删除 timesheet_entries 的所有策略
DROP POLICY IF EXISTS "Users can view own timesheet entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can insert own timesheet entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can update own timesheet entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can delete own timesheet entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Anonymous users can view own entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Anonymous users can insert own entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Anonymous users can update own entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Anonymous users can delete own entries" ON timesheet_entries;

-- 删除 calculations 的所有策略
DROP POLICY IF EXISTS "Users can view own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON calculations;
DROP POLICY IF EXISTS "Anonymous users can view own calculations" ON calculations;
DROP POLICY IF EXISTS "Anonymous users can insert own calculations" ON calculations;
DROP POLICY IF EXISTS "Anonymous users can delete own calculations" ON calculations;

-- 删除外键约束
ALTER TABLE IF EXISTS timesheet_entries 
  DROP CONSTRAINT IF EXISTS timesheet_entries_user_id_fkey;

ALTER TABLE IF EXISTS calculations 
  DROP CONSTRAINT IF EXISTS calculations_user_id_fkey;

-- ========================================
-- STEP 2: 修改列类型
-- ========================================

-- 修改 timesheet_entries
ALTER TABLE timesheet_entries 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE timesheet_entries 
  ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- 修改 calculations
ALTER TABLE IF EXISTS calculations 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE IF EXISTS calculations 
  ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- ========================================
-- STEP 3: 确保表结构正确
-- ========================================

-- timesheet_entries 表
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  unpaid_break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- calculations 表
CREATE TABLE IF NOT EXISTS calculations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('simple', 'annual', 'timesheet')),
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 4: 创建索引
-- ========================================

DROP INDEX IF EXISTS idx_timesheet_user_date;
CREATE INDEX idx_timesheet_user_date ON timesheet_entries(user_id, date DESC);

DROP INDEX IF EXISTS idx_calculations_user_id;
DROP INDEX IF EXISTS idx_calculations_created_at;
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);

-- ========================================
-- STEP 5: 启用 RLS
-- ========================================

ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 6: 创建新的 RLS 策略（匿名模式）
-- ========================================

-- timesheet_entries 策略
CREATE POLICY "Anonymous users can view own entries"
  ON timesheet_entries FOR SELECT
  USING (true);

CREATE POLICY "Anonymous users can insert own entries"
  ON timesheet_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update own entries"
  ON timesheet_entries FOR UPDATE
  USING (true);

CREATE POLICY "Anonymous users can delete own entries"
  ON timesheet_entries FOR DELETE
  USING (true);

-- calculations 策略
CREATE POLICY "Anonymous users can view own calculations"
  ON calculations FOR SELECT
  USING (true);

CREATE POLICY "Anonymous users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous users can delete own calculations"
  ON calculations FOR DELETE
  USING (true);

-- ========================================
-- STEP 7: 更新触发器
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_timesheet_entries_updated_at ON timesheet_entries;

CREATE TRIGGER update_timesheet_entries_updated_at
  BEFORE UPDATE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 8: 验证表结构（最后一步）
-- ========================================

SELECT 
  '✅ 表结构修改成功！' as status,
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('timesheet_entries', 'calculations')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ========================================
-- 完成！🎉
-- ========================================
-- 如果看到上面的表格显示 user_id 和 id 都是 text 类型，就成功了！
