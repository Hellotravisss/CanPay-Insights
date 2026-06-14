-- CanPay Insights - Anonymous Mode Database Schema
-- 在 Supabase SQL Editor 中运行此文件
-- 支持无需登录的匿名用户存储

-- ⚠️ IMPORTANT: 如果你已经运行过 DATABASE_SCHEMA.sql，
-- 请先删除旧的 RLS 策略，然后运行此文件

-- 1. 修改 timesheet_entries 表以支持匿名用户
-- 如果表已存在，先删除外键约束
ALTER TABLE IF EXISTS timesheet_entries 
  DROP CONSTRAINT IF EXISTS timesheet_entries_user_id_fkey;

-- 修改 user_id 为 TEXT 类型（用于匿名 ID）
ALTER TABLE IF EXISTS timesheet_entries 
  ALTER COLUMN user_id TYPE TEXT;

-- 如果表不存在，创建新表
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id TEXT PRIMARY KEY,  -- 使用前端生成的 ID
  user_id TEXT NOT NULL,  -- 匿名用户 ID（UUID 格式字符串）
  date DATE NOT NULL,
  check_in TEXT NOT NULL,  -- 格式: "HH:MM"
  check_out TEXT NOT NULL,  -- 格式: "HH:MM"
  unpaid_break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_timesheet_user_date 
  ON timesheet_entries(user_id, date DESC);

-- Enable RLS
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

-- ⚠️ 删除旧的 RLS 策略（如果存在）
DROP POLICY IF EXISTS "Users can view own timesheet entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can insert own timesheet entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can update own timesheet entries" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can delete own timesheet entries" ON timesheet_entries;

-- 新的 RLS 策略：允许匿名用户访问自己的数据
-- 任何人都可以读取、插入、更新、删除自己的记录（基于 user_id）

CREATE POLICY "Anonymous users can view own entries"
  ON timesheet_entries FOR SELECT
  USING (true);  -- 允许读取（应用层会过滤 user_id）

CREATE POLICY "Anonymous users can insert own entries"
  ON timesheet_entries FOR INSERT
  WITH CHECK (true);  -- 允许任何人插入

CREATE POLICY "Anonymous users can update own entries"
  ON timesheet_entries FOR UPDATE
  USING (true);  -- 允许更新（应用层会检查 user_id）

CREATE POLICY "Anonymous users can delete own entries"
  ON timesheet_entries FOR DELETE
  USING (true);  -- 允许删除（应用层会检查 user_id）

-- 2. Trigger: Update updated_at timestamp
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

-- 3. 可选：Calculations 表也支持匿名用户
ALTER TABLE IF EXISTS calculations 
  DROP CONSTRAINT IF EXISTS calculations_user_id_fkey;

ALTER TABLE IF EXISTS calculations 
  ALTER COLUMN user_id TYPE TEXT;

CREATE TABLE IF NOT EXISTS calculations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('simple', 'annual', 'timesheet')),
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);

ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON calculations;

CREATE POLICY "Anonymous users can view own calculations"
  ON calculations FOR SELECT
  USING (true);

CREATE POLICY "Anonymous users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous users can delete own calculations"
  ON calculations FOR DELETE
  USING (true);

-- Done! 🎉
-- 现在你的应用支持无需登录的匿名用户存储
-- 数据通过 user_id（匿名 UUID）隔离
