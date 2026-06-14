-- CanPay Insights - Add Calculation History Support
-- 在 Supabase SQL Editor 中运行此文件

-- ========================================
-- STEP 1: 修改现有的 calculations 表
-- ========================================

-- 添加 name 字段
ALTER TABLE calculations 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT;

-- 更新现有记录的 name 字段（基于 mode）
UPDATE calculations 
  SET name = CASE 
    WHEN mode = 'simple' THEN 'Hourly Wage Calculation'
    WHEN mode = 'annual' THEN 'Annual Salary Calculation'
    WHEN mode = 'timesheet' THEN 'Timesheet Calculation'
    ELSE 'Calculation'
  END
  WHERE name IS NULL;

-- ========================================
-- STEP 2: 创建 calculation_history 表（如果不存在 calculations 表）
-- ========================================

CREATE TABLE IF NOT EXISTS calculation_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('simple', 'annual', 'timesheet')),
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 3: 创建索引
-- ========================================

CREATE INDEX IF NOT EXISTS idx_calculation_history_user_id 
  ON calculation_history(user_id);

CREATE INDEX IF NOT EXISTS idx_calculation_history_created_at 
  ON calculation_history(created_at DESC);

-- ========================================
-- STEP 4: 启用 RLS
-- ========================================

ALTER TABLE calculation_history ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 5: 创建 RLS 策略
-- ========================================

-- 删除旧策略
DROP POLICY IF EXISTS "Users can view own calculation_history" ON calculation_history;
DROP POLICY IF EXISTS "Users can insert own calculation_history" ON calculation_history;
DROP POLICY IF EXISTS "Users can delete own calculation_history" ON calculation_history;
DROP POLICY IF EXISTS "Anonymous users can view own calculation_history" ON calculation_history;
DROP POLICY IF EXISTS "Anonymous users can insert own calculation_history" ON calculation_history;
DROP POLICY IF EXISTS "Anonymous users can delete own calculation_history" ON calculation_history;

-- 创建新策略（支持匿名用户）
CREATE POLICY "Anonymous users can view own calculation_history"
  ON calculation_history FOR SELECT
  USING (true);

CREATE POLICY "Anonymous users can insert own calculation_history"
  ON calculation_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous users can delete own calculation_history"
  ON calculation_history FOR DELETE
  USING (true);

-- ========================================
-- STEP 6: 验证表结构
-- ========================================

SELECT 
  '✅ calculation_history 表结构' as status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'calculation_history'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 完成！🎉
-- ========================================
