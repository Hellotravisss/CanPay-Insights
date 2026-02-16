# 图片文件说明

## 需要添加的图片文件

为了完善 SEO，请添加以下图片到 `public/` 文件夹：

### 1. Open Graph 图片
- **文件名**: `og-image.png`
- **尺寸**: 1200x630 像素
- **格式**: PNG 或 JPG
- **内容建议**: 
  - CanPay Insights Logo
  - 标语: "Canadian Payroll Calculator 2025/2026"
  - 简洁的背景（红色主题）
  - 可以包含计算器界面截图

### 2. Favicon 图片（PNG 格式）
- **favicon-16x16.png** - 16x16 像素
- **favicon-32x32.png** - 32x32 像素
- **apple-touch-icon.png** - 180x180 像素
- **android-chrome-192x192.png** - 192x192 像素
- **android-chrome-512x512.png** - 512x512 像素

**提示**: 可以使用在线工具从 `favicon.svg` 生成这些 PNG：
- https://realfavicongenerator.net/
- https://favicon.io/

### 3. PWA 截图（可选）
- **screenshot-mobile.png** - 540x720 像素（手机竖屏）
- **screenshot-desktop.png** - 1280x720 像素（桌面横屏）

---

## 快速生成命令

如果您已经安装了 ImageMagick，可以使用以下命令从 SVG 生成 PNG：

```bash
# 生成各种尺寸的 favicon
convert -background none favicon.svg -resize 16x16 favicon-16x16.png
convert -background none favicon.svg -resize 32x32 favicon-32x32.png
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png
convert -background none favicon.svg -resize 192x192 android-chrome-192x192.png
convert -background none favicon.svg -resize 512x512 android-chrome-512x512.png
```

---

## 临时方案

在添加真实图片之前，浏览器会使用：
- ✅ `favicon.svg` - 已创建，使用 Inukshuk 图标
- ⚠️ 其他图片 - 暂时缺失，不影响核心功能

SEO 和社交分享功能已配置完成，添加图片后会自动生效！
