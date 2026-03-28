# 💰 CanPay Insights - 定价方案

## 两层定价架构

```
┌─────────────────────────────────────────────────────────────┐
│                    🆓 FREE (免费版)                          │
│                   「让所有人都能用」                           │
├─────────────────────────────────────────────────────────────┤
│ 功能：                                                       │
│  • ✅ 基础工资计算器 (三种模式)                               │
│  • ✅ 本地保存上次输入 (浏览器本地)                           │
│  • ✅ AI 税务建议 (每天 3 次)                                │
│  • ✅ 基础导出 (带小水印)                                    │
│  • ✅ 阅读所有税务指南                                       │
├─────────────────────────────────────────────────────────────┤
│ 限制：                                                       │
│  ❌ 换设备数据丢失                                           │
│  ❌ 无法查看历史记录                                         │
│  ❌ 无法保存多个场景                                         │
│  ❌ AI 建议次数有限                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓ 升级
┌─────────────────────────────────────────────────────────────┐
│              ⭐ PRO ($9.99/月 或 $99/年)                     │
│              「为重度用户设计」                               │
├─────────────────────────────────────────────────────────────┤
│  FREE 所有功能 +                                             │
│  ✅ 云端同步 (跨设备访问)                                     │
│  ✅ 无限历史记录                                             │
│  ✅ 场景对比 (最多 5 个)                                     │
│  ✅ AI 建议无限次                                            │
│  ✅ 高级 AI (RRSP/TFSA 建议)                                 │
│  ✅ 无水印导出 (图片/PDF/Excel)                              │
│  ✅ 智能提醒 (工资到账、税务截止)                             │
│  ✅ 省份迁移分析 ("搬到Alberta能多赚多少")                    │
│  ✅ 预算规划工具                                             │
│  ✅ 优先客服支持                                             │
├─────────────────────────────────────────────────────────────┤
│  定价：                                                      │
│  • 月付: $9.99/月                                           │
│  • 年付: $99/年 (省 $20)                                    │
│  • 早鸟: $4.99/月 (前100名永久有效)                          │
│  • 学生: $4.99/月 (需 .edu 邮箱)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 为什么这个定价？

### 对标参考

| 产品 | 定价 | 用户量 |
|------|------|--------|
| Mint (Intuit) | Free + Ads | 数百万 |
| YNAB | $14.99/月 | 500万+ |
| Wealthsimple Tax | Free | 数百万 |
| TurboTax Canada | $0-60/次 | 数百万 |

**CanPay 优势**:
- ✅ 比 YNAB 便宜 ($9.99 vs $14.99)
- ✅ 针对加拿大市场更专业
- ✅ 免费版功能足够强大

### 用户付费意愿分析

**目标用户**: 加拿大打工族、新移民、求职者

**心理价位**:
- 💰 $5-10/月: "一杯咖啡钱，可以接受"
- 💰 $10-15/月: "需要看到明显价值"
- 💰 >$15/月: "太贵了，不会考虑"

**$9.99 是甜点价格**:
- 低于 YNAB ($14.99)
- 低于 Netflix Premium ($15.49)
- 低于 Spotify Premium ($10.99)

---

## 促销策略

### 1. 早鸟优惠 (推荐立即使用)

```
🎉 Early Bird Special - 前 100 名用户

原价: $9.99/月
早鸟价: $4.99/月 (永久有效！)

文案:
"Support our launch! First 100 users get 50% off forever.
Lock in this price before it goes up!"

展示位置:
- 首页 banner
- 定价页面
- 升级弹窗
```

### 2. 年付优惠

```
月付: $9.99 × 12 = $119.88
年付: $99 (省 $20.88 = 17%)

文案:
"Save $20 with annual billing"
```

### 3. 学生优惠

```
验证: .edu 邮箱
价格: $4.99/月 (50% off)

文案:
"Student? Get 50% off with your .edu email"
```

### 4. 限时促销

```
节假日促销:
- Black Friday: 40% off
- Christmas: 买1年送3个月
- Tax Season (2-4月): "File smarter" 20% off
```

---

## 升级触点设计

### 1. 使用频率触发

```typescript
// 第 5 次使用后
"You're a power user! 🚀
You've made 5 calculations this week.
Upgrade to Pro to save your history and sync across devices."

按钮: [Upgrade - $9.99/mo] [Maybe Later]
```

### 2. 功能预览

```typescript
// 场景对比功能 (Pro only)
<div className="relative">
  <div className="blur-sm">
    [场景对比界面预览]
  </div>
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center">
      <p className="text-lg font-bold mb-2">🔒 Pro Feature</p>
      <button className="bg-red-600 text-white px-6 py-2 rounded-lg">
        Unlock for $9.99/mo
      </button>
    </div>
  </div>
</div>
```

### 3. AI 限制提示

```typescript
// 用完 3 次免费 AI 后
<div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
  <p className="font-bold text-yellow-800">
    ⚡ Daily AI limit reached (3/3)
  </p>
  <p className="text-sm text-yellow-700 mb-3">
    You've used all your free AI insights for today.
  </p>
  <button className="bg-yellow-600 text-white px-4 py-2 rounded">
    Upgrade for unlimited AI
  </button>
</div>
```

---

## 收入预测

### 保守估计 (Year 1)

| 时间 | 免费用户 | Pro 用户 | MRR (月收入) |
|------|---------|---------|-------------|
| Month 1-3 | 500 | 0 | $0 |
| Month 4-6 | 1,500 | 10 | $99.90 |
| Month 7-9 | 3,000 | 30 | $299.70 |
| Month 10-12 | 5,000 | 60 | $599.40 |

**Year 1 总计**: ~$3,000

### 乐观估计 (Year 1)

| 时间 | 免费用户 | Pro 用户 | MRR |
|------|---------|---------|-----|
| Month 1-3 | 1,000 | 5 | $49.95 |
| Month 4-6 | 3,000 | 40 | $399.60 |
| Month 7-9 | 6,000 | 100 | $999 |
| Month 10-12 | 10,000 | 200 | $1,998 |

**Year 1 总计**: ~$12,000

### Year 2 目标

```
- 500+ Pro 用户
- MRR: $4,995+
- ARR: $60,000+
```

---

## 实施建议

### Phase 1: 现在 (免费版上线)

- ✅ 保留所有免费功能
- ✅ 添加 Sign In 按钮
- ✅ 保存用户数据
- [ ] 添加 Pricing 页面 (静态)
- [ ] 添加升级提示文案

### Phase 2: 1-2周后 (Pro 功能开发)

- [ ] 集成 Stripe
- [ ] 实现订阅管理
- [ ] 场景对比功能
- [ ] 高级 AI 建议
- [ ] 无水印导出

### Phase 3: 2-4周后 (Pro 上线)

- [ ] 发布 Pro 版
- [ ] 早鸟优惠推广
- [ ] 收集首批付费用户反馈

---

## 定价页面文案

### 标题
```
Simple Pricing for Everyone
```

### Free 卡片
```
🆓 Free
Forever free

✓ Hourly/Annual/Timesheet calculator
✓ Local data saving
✓ 3 AI insights per day
✓ Watermarked exports
✓ All tax guides

[Current Plan]
```

### Pro 卡片
```
⭐ Pro
For power users

Everything in Free, plus:
✓ Cloud sync across devices
✓ Unlimited calculation history
✓ Compare up to 5 scenarios
✓ Unlimited AI insights
✓ RRSP/TFSA optimization
✓ Watermark-free exports
✓ Smart reminders
✓ Province comparison tool
✓ Priority support

$9.99/month
or $99/year (Save $20)

🎉 Early Bird: $4.99/month (first 100 users)

[Upgrade to Pro]
```

---

**建议**: 先上线免费版收集用户，根据反馈调整 Pro 功能和定价，2周后再开发支付功能。
