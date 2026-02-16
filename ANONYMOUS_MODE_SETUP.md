# 匿名模式设置指南

## 🎯 概述

这个配置允许用户**无需登录**就能使用 Supabase 云端存储。每个浏览器会获得一个唯一的匿名 ID，数据保存在云端。

## 📋 设置步骤

### 1️⃣ 在 Supabase 中运行 SQL

1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目: `csvauvgygdjgljgllter`
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 复制 `DATABASE_SCHEMA_ANONYMOUS_v3.sql` 的内容（⚠️ 使用 v3 最终版）
6. 粘贴到编辑器中
7. 点击 **Run** 按钮

⚠️ **重要**：必须使用 `DATABASE_SCHEMA_ANONYMOUS_v3.sql`（最终修复版），这个版本会先删除依赖的视图。

### 2️⃣ 验证表结构

运行后，检查：

```sql
-- 检查 timesheet_entries 表
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'timesheet_entries';
```

应该看到：
- `id` - TEXT
- `user_id` - TEXT
- `date` - DATE
- `check_in` - TEXT
- `check_out` - TEXT
- ...

### 3️⃣ 测试 RLS 策略

```sql
-- 测试插入（应该成功）
INSERT INTO timesheet_entries (
  id, 
  user_id, 
  date, 
  check_in, 
  check_out, 
  unpaid_break_minutes
) VALUES (
  'test-123',
  'anonymous-uuid-123',
  '2026-02-15',
  '09:00',
  '17:00',
  30
);

-- 测试查询（应该返回上面插入的数据）
SELECT * FROM timesheet_entries WHERE user_id = 'anonymous-uuid-123';
```

## 🔒 安全性说明

### ✅ 优点：
- 用户无需注册即可使用
- 数据仍然隔离（基于 user_id）
- 换设备 = 新用户，数据不会混淆

### ⚠️ 注意事项：
- RLS 策略允许任何人读写数据（但应用层会过滤 user_id）
- **理论上**，如果有人知道别人的 anonymous_user_id，可以访问其数据
- 对于个人工资计算器，这个风险可接受
- 未来可以升级为"登录后合并匿名数据"

### 🛡️ 如果需要更强的安全性：

可以在 RLS 策略中添加额外检查，例如：

```sql
-- 更严格的策略（需要客户端传递 user_id 作为查询参数）
CREATE POLICY "Anonymous users can view own entries"
  ON timesheet_entries FOR SELECT
  USING (user_id = current_setting('request.jwt.claim.anonymous_id', true));
```

但这需要修改 Supabase 客户端配置。

## 🎉 完成！

现在你的应用支持：
- ✅ 无需登录
- ✅ 云端存储（Supabase）
- ✅ 数据持久化
- ✅ 跨设备独立（每个设备有自己的匿名 ID）

## 🔄 未来升级路径

如果以后想添加登录功能：

1. 用户注册/登录时，获取真实的 `auth.uid()`
2. 将旧的 `anonymous_user_id` 的数据迁移到新的 `auth.uid()`
3. 更新 RLS 策略，优先使用 `auth.uid()`，fallback 到 `anonymous_id`

示例迁移代码：

```typescript
const migrateAnonymousData = async (oldAnonymousId: string, newAuthId: string) => {
  // 更新所有 timesheet_entries 的 user_id
  await supabase
    .from('timesheet_entries')
    .update({ user_id: newAuthId })
    .eq('user_id', oldAnonymousId);
    
  // 删除本地的 anonymous_user_id
  localStorage.removeItem('canpay_anonymous_user_id');
};
```
