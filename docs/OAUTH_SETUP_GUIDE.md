# 🔐 OAuth 登录配置指南

## 概述

CanPay Insights 现在支持以下 OAuth 提供商：
- ✅ Google (推荐，最常用)
- ✅ Facebook
- ✅ Apple (iOS/Mac 用户首选)
- ✅ GitHub (开发者用户)

---

## 1️⃣ Supabase 基础配置（已完成）

你的 Supabase 项目已配置：
- URL: `https://csvauvgygdjgljgllter.supabase.co`
- 匿名密钥已设置

---

## 2️⃣ 配置 Google OAuth

### 步骤 1: 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Google+ API** (或 Google People API)

### 步骤 2: 配置 OAuth 客户端

1. 前往 **APIs & Services > Credentials**
2. 点击 **+ CREATE CREDENTIALS > OAuth client ID**
3. 应用类型选择 **Web application**
4. 名称填写: `CanPay Insights`

### 步骤 3: 添加重定向 URI

在 **Authorized redirect URIs** 添加：
```
https://csvauvgygdjgljgllter.supabase.co/auth/v1/callback
```

### 步骤 4: 复制凭证到 Supabase

1. 点击 **Create** 后，复制 **Client ID** 和 **Client Secret**
2. 打开 [Supabase Dashboard](https://app.supabase.com)
3. 前往 **Authentication > Providers > Google**
4. 启用并粘贴：
   - Client ID
   - Client Secret

---

## 3️⃣ 配置 Facebook OAuth

### 步骤 1: 创建 Facebook 应用

1. 访问 [Facebook Developers](https://developers.facebook.com/)
2. 创建新应用
3. 类型选择 **Consumer** 或 **None**
4. 添加 **Facebook Login** 产品

### 步骤 2: 配置 OAuth 设置

1. 在 Facebook Login 设置中，启用 **Web OAuth Login**
2. 添加 **Valid OAuth Redirect URIs**：
```
https://csvauvgygdjgljgllter.supabase.co/auth/v1/callback
```

### 步骤 3: 复制到 Supabase

1. 前往 **Settings > Basic**，复制 **App ID** 和 **App Secret**
2. 在 Supabase Dashboard > Authentication > Providers > Facebook
3. 启用并粘贴凭证

---

## 4️⃣ 配置 Apple OAuth

### 步骤 1: 注册 Apple Developer

需要 Apple Developer 账号 ($99/年)

### 步骤 2: 创建 App ID

1. 访问 [Apple Developer Portal](https://developer.apple.com/)
2. 前往 **Certificates, Identifiers & Profiles**
3. 创建新的 **App ID**，启用 **Sign In with Apple**

### 步骤 3: 创建 Service ID

1. 创建新的 **Service ID**
2. 启用 **Sign In with Apple**
3. 配置 **Return URLs**：
```
https://csvauvgygdjgljgllter.supabase.co/auth/v1/callback
```

### 步骤 4: 创建私钥

1. 前往 **Keys**，创建新密钥
2. 启用 **Sign In with Apple**
3. 下载私钥文件 (.p8)

### 步骤 5: 复制到 Supabase

在 Supabase Dashboard > Authentication > Providers > Apple：
- **Services ID**: 你的 Service ID (例如: com.yourcompany.canpay)
- **Key ID**: 私钥的 Key ID
- **Private Key**: 私钥文件 (.p8) 的内容
- **Team ID**: 你的 Apple Team ID

---

## 5️⃣ 配置 GitHub OAuth

### 步骤 1: 创建 OAuth App

1. 访问 GitHub > Settings > Developer settings > OAuth Apps
2. 点击 **New OAuth App**

### 步骤 2: 配置应用

填写以下信息：
- **Application name**: CanPay Insights
- **Homepage URL**: `https://canpay-insights.vercel.app` (你的域名)
- **Authorization callback URL**: 
```
https://csvauvgygdjgljgllter.supabase.co/auth/v1/callback
```

### 步骤 3: 复制到 Supabase

1. 创建后复制 **Client ID**
2. 生成 **Client Secret** 并复制
3. 在 Supabase Dashboard > Authentication > Providers > GitHub
4. 启用并粘贴凭证

---

## 6️⃣ 配置 Site URLs

在 Supabase Dashboard > Authentication > URL Configuration：

### Site URL
```
https://canpay-insights.vercel.app
```

### Redirect URLs (添加所有环境)
```
# 本地开发
http://localhost:3000
http://localhost:3001
http://localhost:5173

# 生产环境
https://canpay-insights.vercel.app
https://www.canpay-insights.com (如果有自定义域名)
```

---

## 7️⃣ 数据库配置

运行数据库脚本创建用户设置表：

1. 打开 Supabase Dashboard > SQL Editor
2. 复制 `DATABASE_SCHEMA_USER_SETTINGS.sql` 内容
3. 点击 **Run**

---

## ✅ 验证配置

### 测试清单

- [ ] Google 登录正常
- [ ] Facebook 登录正常
- [ ] Apple 登录正常 (如有配置)
- [ ] GitHub 登录正常
- [ ] 登录后自动保存用户输入
- [ ] 登出后重新登录能恢复数据
- [ ] 跨设备数据同步正常

### 调试技巧

1. **查看浏览器 Console** - 检查错误信息
2. **查看 Network 标签** - 检查 API 请求
3. **查看 Supabase Logs** - Dashboard > Logs > Auth

---

## 🚨 常见问题

### 错误: `redirect_uri_mismatch`

**原因**: 重定向 URI 配置不正确

**解决**: 
1. 检查 OAuth 提供商中的回调 URL
2. 确保包含 `https://[PROJECT_REF].supabase.co/auth/v1/callback`
3. 等待 5 分钟让配置生效

### 错误: `access_denied`

**原因**: 用户拒绝授权或应用未发布

**解决**: 
- Facebook: 将应用状态改为 **Live**
- Google: 发布应用状态改为 **In production**

### 错误: `invalid_client`

**原因**: Client ID 或 Secret 错误

**解决**: 重新复制粘贴，确保没有多余空格

---

## 🎉 完成！

配置完成后，用户可以通过多种方式登录：

1. 点击 **Sign In** 按钮
2. 选择登录方式 (Google/Facebook/Apple/GitHub)
3. 授权后自动返回应用
4. 数据自动保存到云端

所有登录用户的数据都会：
- ✅ 自动保存输入值
- ✅ 跨设备同步
- ✅ 下次访问时自动恢复
