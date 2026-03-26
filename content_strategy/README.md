# 🤖 CanPay 自动内容系统 - 部署指南

## 📋 系统概览

这是一个全自动的 SEO 内容生成系统：
- ✅ 每天自动生成 1 篇文章
- ✅ 使用 Gemini/Grok AI 生成高质量内容
- ✅ 自动优化 SEO（标题、描述、关键词）
- ✅ 文章存储在 Supabase，实时展示
- ✅ 内置计算器 CTA，引导转化

## 🚀 部署步骤

### 第一步：安装依赖

```bash
# 在你的项目目录
npm install react-markdown
npm install -g supabase  # 如果需要 CLI
```

### 第二步：设置 Supabase 数据库

1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 进入 SQL Editor
4. 新建 Query，粘贴 `CONTENT_DATABASE_SCHEMA.sql` 的内容
5. 点击 Run

这会创建：
- `article_topics` - 文章主题池（18+ 个模板）
- `articles` - 已发布的文章
- `article_generation_logs` - 生成日志

### 第三步：部署 Edge Function

```bash
# 1. 登录 Supabase
supabase login

# 2. 链接你的项目
supabase link --project-ref csvauvgygdjgljgllter

# 3. 创建 Edge Function 目录
mkdir -p supabase/functions/auto-generate

# 4. 复制代码
cp content_strategy/auto-generate.ts supabase/functions/auto-generate/index.ts

# 5. 设置环境变量
supabase secrets set GEMINI_API_KEY=你的Gemini_API_Key
supabase secrets set GROK_API_KEY=你的Grok_API_Key  # 可选

# 6. 部署
supabase functions deploy auto-generate

# 7. 设置定时任务（每天北京时间8点）
supabase functions cron create auto-generate --schedule '0 8 * * *'
```

### 第四步：配置前端路由

在 `App.tsx` 中添加：

```tsx
import BlogPage from './content_strategy/components/BlogPage';
import ArticlePage from './content_strategy/components/ArticlePage';

// 在你的路由配置中
<Route path="/blog" element={<BlogPage />} />
<Route path="/blog/:slug" element={<ArticlePage />} />
```

### 第五步：添加导航入口

在 Header/Footer 添加：

```tsx
<Link to="/blog" className="text-slate-600 hover:text-red-600">
  财务指南
</Link>
```

### 第六步：SEO 优化

在 `index.html` 的 `<head>` 中添加动态 sitemap：

```html
<link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
```

创建 `public/sitemap.xml`（可以定期更新）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://canpayinsights.ca/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://canpayinsights.ca/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 文章链接会自动添加 -->
</urlset>
```

### 第七步：提交到 Google Search Console

1. 访问 https://search.google.com/search-console
2. 添加你的网站
3. 提交 sitemap: `https://canpayinsights.ca/sitemap.xml`

## 🧪 测试系统

### 手动触发生成

```bash
# 调用 Edge Function 手动生成一篇文章
curl -X POST https://csvauvgygdjgljgllter.supabase.co/functions/v1/auto-generate \
  -H "Authorization: Bearer 你的_ANON_KEY"
```

### 查看生成的文章

1. 打开 Supabase Dashboard
2. 进入 Table Editor → `articles`
3. 查看生成的文章记录

### 前端验证

访问 `http://localhost:3000/blog` 查看文章列表

## 📊 监控和维护

### 查看生成日志

```sql
-- 查看最近7天的生成情况
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM article_generation_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 查看文章统计

```sql
-- 查看最受欢迎的文章
SELECT title, view_count, calculator_clicks, published_at
FROM articles
WHERE status = 'published'
ORDER BY view_count DESC
LIMIT 10;
```

### 手动添加新主题

```sql
-- 添加新的文章主题模板
INSERT INTO article_topics (category, topic_template, target_keywords, content_outline, priority)
VALUES (
  'tax',
  '加拿大{year}年新移民税务误区：这5个错误会让你多交税',
  ARRAY['newcomer tax mistakes', 'common tax errors canada'],
  '{"sections": ["误区1", "误区2", "误区3", "误区4", "误区5", "正确做法"]}',
  8
);
```

## 💡 内容策略建议

### 发布频率

- **日更**：适合 SEO 快速积累
- **工作日更**：周末休息，更自然
- **每周3篇**：质量优先

### 内容优化

1. **标题优化**：
   - 包含年份（2025）
   - 包含省份名称
   - 使用数字（"5个技巧"）
   - 制造悬念（"你不知道的..."）

2. **关键词布局**：
   - 标题包含主关键词
   - 前100字出现关键词
   - H2 标题包含长尾词
   - 图片 alt 文本包含关键词

3. **内链建设**：
   - 文章之间相互链接
   - 链接到计算器页面
   - 链接到相关省份文章

## 🎯 预期效果

### 流量预测

| 时间 | 文章数量 | 预估月流量 | SEO 权重 |
|------|---------|-----------|---------|
| 1个月 | 30篇 | 500访问 | 低 |
| 3个月 | 90篇 | 3,000访问 | 中 |
| 6个月 | 180篇 | 10,000访问 | 高 |
| 12个月 | 365篇 | 30,000+访问 | 权威 |

### 转化路径

```
Google 搜索 → 文章页面 → 使用计算器 → 注册/付费
    ↓              ↓            ↓           ↓
  1000人        800人        300人        30人 (3%)
```

## 🛠️ 故障排除

### 问题1：Edge Function 调用失败

检查：
- API Key 是否正确设置
- 配额是否用完（Gemini 免费版有每日限制）
- 查看 Supabase Functions Logs

### 问题2：文章质量不高

优化：
- 调整 Prompt 模板
- 增加 Few-shot 示例
- 使用 GPT-4 替代（质量更高但成本高）

### 问题3：生成速度太慢

优化：
- 使用 Gemini Flash 模型（更快更便宜）
- 减少文章长度
- 启用 Edge Function 缓存

## 💰 成本估算

| 项目 | 免费额度 | 超出费用 | 预估月成本 |
|------|---------|---------|-----------|
| Supabase 数据库 | 500MB | $0.25/GB | $0 |
| Supabase Edge Function | 500K 调用 | $2/百万 | $0 |
| Gemini API | 1500 req/day | $0.5/百万token | $0-5 |
| Grok API | 需付费 | ~$5/月 | $5 |
| **总计** | - | - | **$0-10/月** |

## 📞 支持

遇到问题？
1. 查看 Supabase Dashboard Logs
2. 检查浏览器 Console 错误
3. 验证数据库表结构
4. 重新部署 Edge Function

---

**恭喜！你现在拥有一个全自动的内容工厂！** 🎉

每天都会有新文章自动生成，帮你持续获取 SEO 流量！
