# CanPay Insights — logo 规则

## 唯一真源

**`public/logo.png`** —— 这是唯一正确的 logo(红底 + 有厚度切面的 Inukshuk 石板)。
PDF 里用的是同一张图,经 `lib/logoBase64.ts` 内嵌。

## 🔴 铁律:永远不要手画这个 mark

不要在 SVG / JSX 里用 `<path>`、`<rect>` 去「重画」Inukshuk。

历史上这么干过,后果是**错误 logo 反复上线**:曾经有人把当年抬头的内联 SVG
提取成 `logo-inukshuk.svg` 和 `logo-full.svg` 并写进文档说这是「logo 文件」,
于是后续每做一个新东西(文章封面、加载动画、favicon 生成器)都去拿那份**手画的赝品** ——
细圆角条组成的简笔画,和真 logo 完全不是一个东西。那三个文件已于 2026-08-23 删除。

## 怎么用

| 场景 | 做法 |
|------|------|
| 网页 / JSX | `<img src="/logo.png" />` |
| PDF(pdf-lib) | `LOGO_PNG_BASE64`(`lib/logoBase64.ts`) |
| 邮件 HTML | `<img src="https://canpayinsights.ca/logo.png">` |
| SVG 封面(必须自包含) | `<image href="data:image/png;base64,…">` 内嵌 96px 版本,**不要** `<path>` |
| favicon / app icon | 已生成好,别再重做:`favicon-*.png`、`apple-touch-icon.png`、`android-chrome-*.png` |

SVG 被 `<img>` 加载时外部引用会被浏览器拦掉,所以封面 SVG 必须内嵌 base64,
不能写 `href="/logo.png"`。96px 的 PNG 约 4.6 KB,够用且不占地方。

## 文章封面:不要手写,调脚本

```bash
node scripts/coverLogo.mjs     # 输出可直接粘贴的 <!-- brand --> 组
```

`scripts/coverLogo.mjs` 是封面 logo 的**唯一出处**。别再「从现有封面照抄 brand 组」——
正是这条捷径让赝品在三次事故里传播到八张封面上。

## 构建关卡

`npm run audit:logo`(已挂在 `prebuild` 上,和数字审计同级)。任何 `public/blog/*.svg`
只要带手画 mark 或没内嵌真 logo,**构建直接失败**。散文规则拦不住,这个拦得住。
自动发文机器人的提示词也已改成先跑这个关卡。
