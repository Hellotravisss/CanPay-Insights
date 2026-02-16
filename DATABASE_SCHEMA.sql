-- CanPay Insights - Supabase Database Schema
-- 在 Supabase SQL Editor 中运行此文件

-- 1. Users Table（用户表）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 2. Calculations Table（计算历史表）
CREATE TABLE IF NOT EXISTS calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('simple', 'annual', 'timesheet')),
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);

-- Enable RLS
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own calculations
CREATE POLICY "Users can view own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Timesheet Entries Table（打卡记录表）
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME NOT NULL,
  check_out TIME NOT NULL,
  unpaid_break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_timesheet_user_date ON timesheet_entries(user_id, date DESC);

-- Enable RLS
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own timesheet entries
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

-- 4. Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timesheet_entries_updated_at
  BEFORE UPDATE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Function: Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, last_login)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create user record when auth.users is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Usage Statistics View (Optional - for analytics)
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_login,
  COUNT(DISTINCT c.id) as total_calculations,
  COUNT(DISTINCT t.id) as total_timesheet_entries
FROM users u
LEFT JOIN calculations c ON u.id = c.user_id
LEFT JOIN timesheet_entries t ON u.id = t.user_id
GROUP BY u.id, u.email, u.created_at, u.last_login;

-- Grant access to authenticated users
GRANT SELECT ON user_statistics TO authenticated;

-- Done! 🎉
-- Next step: Enable Google OAuth in Supabase Dashboard
-- Settings > Authentication > Providers > Google
