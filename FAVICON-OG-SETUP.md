# 🎨 Favicon 和 OG 图片设置指南

## 📋 **概述**

这个指南帮助你生成并安装网站的图标和社交媒体预览图。

---

## 🎯 **第一步：生成 Favicon 图标**

### **1. 启动开发服务器**

确保开发服务器正在运行：
```bash
npm run dev
```

### **2. 在浏览器中打开 Favicon 生成器**

在浏览器地址栏输入：
```
http://localhost:3000/favicon-generator.html
```

### **3. 下载所有尺寸的图标**

你会看到 4 个卡片，每个卡片代表一个尺寸：

| 尺寸 | 文件名 | 用途 |
|------|--------|------|
| 16x16 | `favicon-16x16.png` | 浏览器标签页 |
| 32x32 | `favicon-32x32.png` | 标准 Favicon |
| 180x180 | `apple-touch-icon.png` | iOS 主屏幕 |
| 192x192 | `android-chrome-192x192.png` | Android 主屏幕 |

**点击每个卡片下方的"下载 PNG"按钮**

### **4. 移动文件到 public 文件夹**

将下载的 4 个 PNG 文件放到：
```
/public/
  ├── favicon-16x16.png          ← 下载的文件
  ├── favicon-32x32.png          ← 下载的文件
  ├── apple-touch-icon.png       ← 下载的文件
  └── android-chrome-192x192.png ← 下载的文件
```

### **5. 验证安装**

刷新网站（`Cmd + Shift + R`），浏览器标签页应该显示红色的 💰 图标。

---

## 📸 **第二步：生成 OG 图片（社交媒体预览）**

### **1. 在浏览器中打开 OG 图片生成器**

```
http://localhost:3000/og-image-generator.html
```

### **2. 截取 OG 图片**

#### **Mac 用户：**
1. 按 `Cmd + Shift + 4`
2. 按空格键切换到窗口捕获模式
3. 点击浏览器窗口（会自动捕获窗口）
4. 或者精确框选 1200x630 的图片区域

#### **Windows 用户：**
1. 使用 Snipping Tool 或 Win + Shift + S
2. 框选 1200x630 的图片区域

### **3. 保存图片**

- 文件名：`og-image.png`
- 格式：PNG
- 位置：`/public/og-image.png`

### **4. 验证安装**

1. 访问你的网站
2. 在社交媒体分享链接（Facebook、Twitter、LinkedIn）
3. 应该能看到专业的预览图

---

## ✅ **完成后的文件结构**

```
/public/
  ├── favicon.svg                   ✓ 已创建
  ├── favicon-16x16.png            → 需要下载
  ├── favicon-32x32.png            → 需要下载
  ├── apple-touch-icon.png         → 需要下载
  ├── android-chrome-192x192.png   → 需要下载
  ├── og-image.png                 → 需要截图
  ├── favicon-generator.html        ✓ 已创建
  └── og-image-generator.html       ✓ 已创建
```

---

## 🎨 **设计说明**

### **Favicon 设计元素：**
- **背景颜色**: #dc2626（品牌红色）
- **主元素**: 白色美元符号 $ 
- **装饰**: 小枫叶 🍁（加拿大特色）
- **风格**: 现代、简洁、专业

### **OG 图片设计元素：**
- **尺寸**: 1200x630px（社交媒体标准）
- **背景**: 深色渐变（黑色→深灰）
- **主标题**: "Calculate Your Take-Home Pay"
- **副标题**: 红色渐变高亮
- **特性标签**: AI Insights, All Provinces, 2025/2026
- **底部**: 网站域名 + "FREE TOOL" 徽章

---

## 🔧 **故障排除**

### **问题 1: 浏览器标签页图标没变化**

**解决方案：**
```bash
# 强制刷新（清除缓存）
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

### **问题 2: 生成器页面打不开**

**检查：**
1. 开发服务器是否正在运行（`npm run dev`）
2. 端口是否是 3000（查看终端输出）
3. 文件是否在 `public/` 文件夹中

### **问题 3: OG 图片不显示**

**检查：**
1. 文件名是否为 `og-image.png`（不是 `og-image(1).png`）
2. 文件是否在 `public/` 文件夹根目录
3. 使用 Facebook 的调试工具重新抓取：
   ```
   https://developers.facebook.com/tools/debug/
   ```

---

## 📱 **测试清单**

- [ ] 浏览器标签页显示红色 💰 图标
- [ ] 手机浏览器标签页显示图标
- [ ] iOS "添加到主屏幕" 显示正确图标
- [ ] Android "添加到主屏幕" 显示正确图标
- [ ] Facebook 分享链接有预览图
- [ ] Twitter/X 分享链接有预览图
- [ ] LinkedIn 分享链接有预览图

---

## 🎉 **完成！**

现在你的网站有了专业的图标和社交媒体预览图！

---

## 💡 **可选：使用在线工具**

如果你不想手动截图，也可以使用：

### **Favicon：**
- [Favicon.io](https://favicon.io/) - 上传 SVG 自动生成所有尺寸
- [RealFaviconGenerator](https://realfavicongenerator.net/) - 完整的 Favicon 解决方案

### **OG 图片：**
- [Canva](https://www.canva.com/) - 搜索 "Social Media Post"，调整为 1200x630
- [Figma](https://www.figma.com/) - 专业设计工具
- [OG Image Generator](https://og-image.vercel.app/) - Vercel 官方工具

---

**需要帮助？** 查看生成器页面底部的详细说明！
