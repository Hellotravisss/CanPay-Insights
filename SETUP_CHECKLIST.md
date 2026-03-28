# ✅ CanPay Insights - 配置清单

## 你需要注册/准备的账号

### 1. Google OAuth ✅ (你说已经弄好了)

**确认清单**:
- [ ] Google Cloud Console 项目已创建
- [ ] OAuth 客户端已配置
- [ ] 重定向 URI 已添加: `https://csvauvgygdjgljgllter.supabase.co/auth/v1/callback`
- [ ] Client ID 和 Secret 已复制到 Supabase

---

### 2. Facebook OAuth (推荐配置)

**需要注册**: [Facebook Developers](https://developers.facebook.com/)

**准备材料**:
- Facebook 个人账号
- 应用名称: `CanPay Insights`
- 应用类型: **Consumer**

**配置后获得**:
- App ID (类似: `123456789012345`)
- App Secret (类似: `a1b2c3d4e5f6...`)

**Facebook 配置步骤**:
1. 访问 [developers.facebook.com](https://developers.facebook.com)
2. 点击 **My Apps > Create App**
3. 选择 **Other** > **Consumer**
4. 填写应用名称: `CanPay Insights`
5. 添加产品 **Facebook Login**
6. 设置 > 基本: 复制 **App ID** 和 **App Secret**
7. Facebook Login > 设置:
   - 启用 **Web OAuth Login**
   - 添加 **Valid OAuth Redirect URIs**:
     ```
     https://csvauvgygdjgljgllter.supabase.co/auth/v1/callback
     ```
8. 将 App ID 和 Secret 粘贴到 Supabase Dashboard > Auth > Providers > Facebook

---

### 3. Apple OAuth (可选，但推荐)

**需要注册**: [Apple Developer](https://developer.apple.com/) ($99 USD/年)

⚠️ **注意**: 需要付费开发者账号，如果暂时不想付年费可以跳过，Google + Facebook 已经覆盖大部分用户。

**准备材料**:
- Apple ID
- $99 年费
- 网站域名

**配置后获得**:
- Services ID (类似: `com.yourcompany.canpay`)
- Key ID
- Private Key (文件内容)
- Team ID

**简化建议**: 先上线 Google + Facebook，Apple 可以后面再加。

---

### 4. Supabase (已配置 ✅)

你的 Supabase 项目信息:
- URL: `https://csvauvgygdjgljgllter.supabase.co`
- 匿名密钥: 已在代码中

**需要做的**:
1. 运行数据库脚本 (见下方)
2. 配置 OAuth Providers

---

## 🔧 立即执行步骤

### 步骤 1: 运行数据库脚本 (2分钟)

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 `CanPay-Insights`
3. 左侧菜单 > **SQL Editor**
4. 新建查询，复制粘贴 `DATABASE_SCHEMA_USER_SETTINGS.sql` 文件内容
5. 点击 **Run**
6. 确认看到 "✅ 数据库表创建成功！"

---

### 步骤 2: 配置 Facebook OAuth (5分钟)

1. 前往 [developers.facebook.com](https://developers.facebook.com)
2. 创建 App (选择 Consumer 类型)
3. 添加 Facebook Login 产品
4. 复制 App ID 和 App Secret
5. 前往 Supabase Dashboard > Authentication > Providers > Facebook
6. 启用并粘贴:
   - Client ID: [Facebook App ID]
   - Client Secret: [Facebook App Secret]
7. 保存

---

### 步骤 3: 配置 Site URLs (1分钟)

Supabase Dashboard > Authentication > URL Configuration:

**Site URL**:
```
https://canpay-insights.vercel.app
```

**Redirect URLs**:
```
http://localhost:3000
http://localhost:3001
http://localhost:5173
https://canpay-insights.vercel.app
```

---

### 步骤 4: 测试 (3分钟)

```bash
# 本地启动
npm run dev

# 测试:
1. 打开 http://localhost:3001
2. 选择计算模式
3. 输入一些数字
4. 点击 Sign In
5. 用 Google 或 Facebook 登录
6. 确认右上角显示头像
7. 关闭浏览器，重新打开
8. 确认数字自动恢复
```

---

## 💰 Pro 版定价建议 (Free + Pro)

### 免费版
```
✅ 基础计算器 (三种模式)
✅ 本地保存 (浏览器)
✅ AI 建议 3 次/天
✅ 带水印导出
```

### Pro 版 - $9.99/月 或 $99/年
```
✅ 云端同步
✅ 无限历史记录
✅ 场景对比 (5个)
✅ AI 建议无限次
✅ 无水印导出
✅ 邮件提醒
✅ 省份迁移分析
```

**促销策略**:
- 早鸟价: 前100用户 $4.99/月 (永久)
- 年付省 17%
- 学生 50% off

---

## 📋 准备清单汇总

| 项目 | 状态 | 需要准备 |
|------|------|---------|
| Google OAuth | ✅ 已完成 | 确认配置正确 |
| Facebook OAuth | ⏳ 待配置 | Facebook 账号，5分钟 |
| Apple OAuth | ⏳ 可选 | $99年费，可延后 |
| 数据库 | ⏳ 待运行 | 运行 SQL 脚本，2分钟 |
| 测试 | ⏳ 待测试 | 本地测试，3分钟 |

**总时间**: 约 10-15 分钟

---

## ❓ 常见问题

### Q: Facebook 一定要配置吗？
**A**: 不是必须的，但推荐。Google 登录已经覆盖大部分用户，Facebook 是补充。

### Q: Apple 登录可以后面再加吗？
**A**: 完全可以！建议先用 Google + Facebook 上线，Apple 后续添加。

### Q: 需要准备域名吗？
**A**: 不需要，用 Vercel 提供的 `canpay-insights.vercel.app` 即可。

### Q: 需要准备公司吗？
**A**: 不需要，个人开发者账号即可。

---

完成这些配置后告诉我，我帮你检查一遍！
