# CanPay Insights Logo 文件说明

## 📍 Logo 来源

**网页抬头的 logo 原本没有独立文件**，是直接写在 `App.tsx` 第 49-63 行的内联 SVG 组件 `InukshukIcon`。

现已提取到独立文件，方便统一使用和分享。

---

## 📂 Logo 文件列表

| 文件 | 用途 | 说明 |
|------|------|------|
| **logo-inukshuk.svg** | 纯图标 | 抬头 logo 的原始设计，24x24 viewBox |
| **favicon.svg** | 浏览器图标 | 红色背景 + 同上 Inukshuk，100x100 |
| **logo-full.svg** | 完整 logo | 图标 + "CanPay Insights" 文字，发给朋友用 |

---

## 🎯 发给朋友用哪个？

- **只要图标**：`logo-inukshuk.svg` 或 `favicon.svg`
- **完整 logo（图标+文字）**：`logo-full.svg`

---

## 📐 设计来源

所有 logo 都来自 `App.tsx` 中的 `InukshukIcon`：

```tsx
// App.tsx 第 49-63 行
const InukshukIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="10" y="2" width="4" height="3" rx="0.5" />
    <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    <rect x="9" y="10" width="6" height="4" rx="0.5" />
    <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
    <rect x="7" y="18" width="3" height="4" rx="0.5" />
    <rect x="14" y="18" width="3" height="4" rx="0.5" />
  </svg>
);
```

Inukshuk（因纽特石堆）是加拿大标志，代表指引和方向。
