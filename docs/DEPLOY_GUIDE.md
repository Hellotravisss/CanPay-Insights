# CanPay Insights - 博客功能部署指南

## ✅ 已完成的功能

### 1. 10篇精选文章
- 安省税率完全指南
- BC省税率完全指南
- 新移民税务指南
- CPP和EI完全解读
- 年薪$5万税后分析
- 加拿大最低工资对比
- RRSP省税技巧
- TFSA vs RRSP选择指南
- 安省加班费计算规则
- 阿省vs安省详细对比

### 2. 博客页面
- 文章列表页 (`/blog`)
- 文章详情页 (`/blog/:slug`)
- 分类筛选功能
- 相关文章推荐
- 计算器CTA嵌入

### 3. 首页集成
- Logo已更新
- 导航栏博客入口
- 首页博客CTA区块
- 底部快捷链接

## 🚀 部署步骤

### 第一步：构建项目
```bash
cd /Users/travis/Documents/Vibe_Coding/CanPay-Insights
npm run build
```

### 第二步：部署到Vercel
```bash
vercel --prod
```

### 第三步：（可选）设置自动文章生成

如果你想要每天自动生成新文章，需要：

1. **设置Supabase**
   ```bash
   # 安装Supabase CLI
   npm install -g supabase

   # 登录
   supabase login

   # 链接项目
   supabase link --project-ref your-project-ref
   ```

2. **部署Edge Function**
   ```bash
   supabase functions deploy auto-generate
   ```

3. **设置定时任务**（每天北京时间8点）
   ```bash
   supabase functions cron create auto-generate --schedule '0 8 * * *'
   ```

4. **设置环境变量**
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

## 📊 文章SEO优化

每篇文章都包含：
- 独特的meta title
- Meta description（160字符内）
- 目标关键词
- Open Graph图片
- 结构化内容（H1/H2/H3）
- 计算器CTA（转化优化）

## 🎯 转化漏斗

```
Google搜索 → 文章页面 → 阅读内容 → 点击CTA → 使用计算器 → 注册/付费
     ↓            ↓           ↓           ↓           ↓
   1000人       800人       600人       300人       50人
```

## 📈 预期流量

| 时间 | 文章数 | 预估月流量 |
|------|-------|-----------|
| 当前 | 10篇 | 500-1000 |
| 1个月后 | 10篇 | 1000-2000 |
| 3个月后 | 10篇+日更 | 5000+ |

## 🔧 自定义配置

### 添加新文章
编辑 `/src/content/articles-data.ts`，添加新的文章对象到 `allArticles` 数组。

### 修改主题颜色
编辑 `/src/content/components/BlogList.tsx` 中的 `categories` 数组。

### 更新Logo
替换 `/public/logo.png` 文件。

## 🆘 故障排除

**问题1: 构建失败**
- 检查TypeScript错误：`npx tsc --noEmit`
- 确保所有导入路径正确

**问题2: 图片不显示**
- 检查图片URL是否可访问
- 确认图片在public文件夹中

**问题3: 文章页面404**
- 确认路由配置正确
- 检查slug是否匹配

## 📞 支持

如有问题，请检查：
1. Vercel部署日志
2. 浏览器Console错误
3. 网络请求状态

---

**你的博客系统已准备就绪！** 🎉
