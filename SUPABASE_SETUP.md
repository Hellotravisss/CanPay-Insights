# 🚀 Supabase 集成设置指南

## 📋 目录
1. [数据库表创建](#1-数据库表创建)
2. [Google OAuth 配置](#2-google-oauth-配置)
3. [环境变量配置](#3-环境变量配置)
4. [测试集成](#4-测试集成)

---

## 1. 数据库表创建

### 步骤 1: 打开 Supabase SQL Editor

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目：`CanPay-Insights`
3. 左侧菜单 → **SQL Editor**

### 步骤 2: 执行数据库脚本

复制 `DATABASE_SCHEMA.sql` 文件的全部内容，粘贴到 SQL Editor，然后点击 **Run**。

**创建的表：**

```
✅ users                 - 用户信息表
✅ calculations          - 计算历史表
✅ timesheet_entries     - 打卡记录表
```

**安全特性：**
- ✅ Row Level Security (RLS) 已启用
- ✅ 用户只能访问自己的数据
- ✅ 自动创建用户记录（触发器）

### 步骤 3: 验证表创建

在 Supabase Dashboard:
- 左侧菜单 → **Table Editor**
- 确认看到以下 3 个表：
  - `users`
  - `calculations`
  - `timesheet_entries`

---

## 2. Google OAuth 配置

### 步骤 1: 创建 Google OAuth 客户端

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. **APIs & Services** → **Credentials**
4. 点击 **+ CREATE CREDENTIALS** → **OAuth client ID**
5. 应用类型：**Web application**
6. 名称：`CanPay Insights`

### 步骤 2: 配置重定向 URI

在 **Authorized redirect URIs** 添加：

```
https://csvauvgygdjgljgllter.supabase.co/auth/v1/callback
```

**重要：** 将 `csvauvgygdjgljgllter` 替换为您的实际 Supabase Project Ref。

点击 **Create**，保存以下信息：
- ✅ **Client ID**
- ✅ **Client Secret**

### 步骤 3: 在 Supabase 中启用 Google Provider

1. Supabase Dashboard → **Authentication** → **Providers**
2. 找到 **Google** → 点击 **Enable**
3. 填写：
   ```
   Client ID: [从 Google Console 复制]
   Client Secret: [从 Google Console 复制]
   ```
4. 点击 **Save**

### 步骤 4: 配置允许的重定向 URL

Supabase Dashboard → **Authentication** → **URL Configuration**

添加以下 URL（根据您的部署环境）：

```
# 本地开发
http://localhost:3000
http://localhost:3001

# Vercel 生产环境
https://canpay-insights.vercel.app
https://your-custom-domain.com
```

---

## 3. 环境变量配置

### 本地开发 (.env)

创建 `.env` 文件（如果不存在）：

```bash
# Gemini AI
VITE_GEMINI_API_KEY=your_actual_gemini_key

# Supabase
VITE_SUPABASE_URL=https://csvauvgygdjgljgllter.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0.cx26CJjcjb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk
```

### Vercel 生产环境

Vercel Dashboard → Project → **Settings** → **Environment Variables**

添加以下变量：

```
VITE_GEMINI_API_KEY = [您的 Gemini Key]
VITE_SUPABASE_URL = https://csvauvgygdjgljgllter.supabase.co
VITE_SUPABASE_ANON_KEY = [您的 Supabase Anon Key]
```

**注意：** `ANON_KEY` 是公开密钥，可以安全地暴露在前端。Row Level Security (RLS) 保护数据安全。

---

## 4. 测试集成

### 本地测试步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **测试未登录状态**
   - 访问 `http://localhost:3001`
   - 选择任意计算模式
   - 进行一次计算
   - **3 秒后应该弹出"Save Your Data"模态框** ✅

3. **测试 Google 登录**
   - 点击 **"Continue with Google"**
   - 使用 Google 账号登录
   - **登录成功后：**
     - Header 右上角显示用户头像 ✅
     - 再次计算，应该自动保存（看到 "Saving..." 提示）✅

4. **测试数据持久化**
   - 登录后进行几次计算
   - 关闭浏览器
   - 重新打开并登录
   - 在 Supabase Table Editor 查看 `calculations` 表 ✅
   - 应该看到保存的计算记录

5. **测试 Timesheet 同步**
   - 选择 **Timesheet Tracker** 模式
   - 登录
   - 添加几条打卡记录
   - Header 显示 **"Synced to cloud ☁️"** ✅
   - 在 Supabase Table Editor 查看 `timesheet_entries` 表 ✅

---

## 🔍 故障排查

### 问题 1: Google 登录失败

**错误信息：** `redirect_uri_mismatch`

**解决方案：**
1. 检查 Google Cloud Console 中的 Authorized redirect URIs
2. 确保包含：`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. 等待 5 分钟让配置生效

### 问题 2: 数据无法保存

**错误信息：** Console 显示 `new row violates row-level security policy`

**解决方案：**
1. 确认 RLS 策略已正确创建（重新运行 `DATABASE_SCHEMA.sql`）
2. 检查用户是否已登录（`supabase.auth.getUser()`）
3. 确认 `user_id` 字段正确填充

### 问题 3: 环境变量未生效

**错误信息：** `undefined` 或 `null`

**解决方案：**
1. 确认 `.env` 文件在项目根目录
2. 变量名必须以 `VITE_` 开头
3. 重启开发服务器（`Ctrl+C` → `npm run dev`）

### 问题 4: CORS 错误

**错误信息：** `Access to fetch has been blocked by CORS policy`

**解决方案：**
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. 确认 `http://localhost:3001` 在 Site URL 列表中
3. 保存并等待 1 分钟

---

## 📊 验证数据

### 查看保存的数据

Supabase Dashboard → **Table Editor**

**Calculations 表：**
```sql
SELECT * FROM calculations 
ORDER BY created_at DESC 
LIMIT 10;
```

**Timesheet Entries 表：**
```sql
SELECT * FROM timesheet_entries 
ORDER BY date DESC 
LIMIT 10;
```

**Users 表：**
```sql
SELECT email, created_at, last_login 
FROM users 
ORDER BY created_at DESC;
```

---

## ✅ 配置完成检查清单

- [ ] 数据库表已创建（3 个表）
- [ ] RLS 策略已启用
- [ ] Google OAuth 客户端已创建
- [ ] Supabase Google Provider 已启用
- [ ] 重定向 URI 已配置
- [ ] 环境变量已设置（本地 & Vercel）
- [ ] Google 登录测试成功
- [ ] 数据自动保存测试成功
- [ ] Timesheet 同步测试成功
- [ ] 跨设备访问测试成功

---

## 🎉 完成！

现在您的 CanPay Insights 已经完全集成 Supabase：

✅ **用户认证** - Google 一键登录  
✅ **数据持久化** - 自动保存计算历史  
✅ **云端同步** - Timesheet 实时同步  
✅ **跨设备访问** - 随时随地访问数据  
✅ **数据安全** - RLS 保护用户隐私  

**下一步：**
- 部署到 Vercel（记得配置环境变量）
- 推广并获取首批用户 🚀
- 监控 Supabase 使用量（免费层限制）

---

## 📞 需要帮助？

- Supabase 文档: https://supabase.com/docs
- Google OAuth 文档: https://developers.google.com/identity/protocols/oauth2
- 项目 GitHub: [您的仓库链接]
