# CanPay Insights — logo 规则（2026-11 新标识）

## 唯一真源

**`public/logo.png`** —— 唯一正确的 logo：红色圆角方块上的珍珠白海狸，外面绕一圈圈「回声线」（纸币雕版纹）。
`public/logo_reverse.png` 自 2026-11 起与它是同一张图，只为兼容旧引用而保留。PDF 里经 `lib/logoBase64.ts` 内嵌同一张图。

字标：**Bricolage Grotesque**，「CanPay」用 ExtraBold、「Insights」用 Regular（2026-11-24 定，第 07 版）。
网页里写成文字：`font-brand font-extrabold` + `font-brand font-normal text-red-600`；图片里用 `lib/brand/wordmark.json` 的曲线路径。

## 🔴 铁律：永远不要手画这个 mark

不要在 SVG / JSX 里用 `<path>`、`<rect>` 去「重画」海狸或旧的 Inukshuk。只许原样使用 `public/logo.png`。

## 文章封面

一律用 `scripts/brandCovers.mjs` 生成（入口 `npx tsx scripts/genAllCovers.ts`）：
- 新闻数据卡：写 `src/content/covers/<slug>.json`，再 `node scripts/brandCovers.mjs news <slug>`；
- 省份指南：引擎数字自动生成；其余文章：标题封面。

`npm run audit:logo` 逐张检查封面左上角（`LOGO_BOX`）是不是真的 `public/logo.png`，不是就构建失败。
