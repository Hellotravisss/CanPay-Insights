# Reddit Playbook — CanPay Insights

目标：通过真实、有用的回答带来访问量、品牌搜索和 Google 发现路径。不是发广告。

## 铁律（违反任何一条都会被封号/删帖，前功尽弃）

1. **先攒信用**：新账号前 1–2 周只回答、不放链接。r/PersonalFinanceCanada 对自我推广极其严格。
2. **回答永远先给答案**：数字写在回答正文里，链接只是"来源/验证"角色。没有链接回答也成立。
3. **频率**：带链接的回答 ≤ 1 次/天/子版；纯文字回答不限。
4. **被版主删一次**：该子版改为纯文字回答（仍有品牌价值），两周后再试。
5. 永远不开新帖推广工具。只回答别人的问题。Profile 简介里可以放网站链接。

## 每日 10 分钟工作流

依次打开这些固定搜索（已按"最新+相关"排好），挑 1–3 个有人问但还没好答案的帖子：

| 子版 | 搜索链接 |
| --- | --- |
| r/PersonalFinanceCanada | https://www.reddit.com/r/PersonalFinanceCanada/search/?q=%22take%20home%22%20OR%20%22after%20tax%22&restrict_sr=1&sort=new&t=week |
| r/PersonalFinanceCanada（offer 类） | https://www.reddit.com/r/PersonalFinanceCanada/search/?q=offer%20salary%20worth&restrict_sr=1&sort=new&t=week |
| r/ImmigrationCanada | https://www.reddit.com/r/ImmigrationCanada/search/?q=salary%20enough%20live&restrict_sr=1&sort=new&t=month |
| r/movingtocanada | https://www.reddit.com/r/movingtocanada/search/?q=salary%20after%20tax&restrict_sr=1&sort=new&t=month |
| r/askTO / r/vancouver / r/Calgary | 搜 "salary enough" / "take home"，按城市匹配省份页 |
| r/cantax | https://www.reddit.com/r/cantax/search/?q=paycheck%20deductions&restrict_sr=1&sort=new&t=week |

加分项：RedFlagDeals 论坛 Personal Finance 版（加拿大本土流量，链接管制比 Reddit 松）。

## 回答模板

模板里的数字用 canpayinsights.ca 对应页面现查现填（页面上就有现成数字）。

### 模板 A：「Offer $X 在 Y 省，税后多少 / 够不够活？」

> At $70,000 in Ontario you'd take home roughly **$53,600/yr — about $4,470/month or $2,060 bi-weekly** (federal + provincial tax, CPP, EI, basic personal amount only). If you have RRSP matching or benefits, your real number changes a bit.
>
> Rent in [city] for a 1BR is around $X, so you'd be looking at roughly X% of net on housing — [tight but doable / comfortable].
>
> Source/check your exact numbers: canpayinsights.ca/70000-after-tax-ontario

（已算好的常用值：$60k ON → 净 $47,147/yr，$3,929/mo ▏$70k ON → $53,631/yr，$4,469/mo ▏$85k AB → $62,864/yr，$5,239/mo ▏$75k QC → $53,484/yr，$4,457/mo ▏$25/hr 全职 BC → $41,569/yr，$3,464/mo）

### 模板 B：「第一份工资比想象的少好多，钱去哪了？」

> Totally normal shock. On a $X salary in [province] the breakdown is roughly:
> - Federal tax: $X
> - Provincial tax: $X
> - CPP: $X (5.95% up to the cap)
> - EI: $X (1.64%)
>
> That's about X% of gross gone before it hits your account. The full table for your exact salary: [对应薪资页链接]

### 模板 C：「A 省 vs B 省 offer 怎么比？」

> Same gross ≠ same net. $X keeps the most in [province] (~$X) and least in [province] (~$X) — that's $X/yr difference before cost of living. [两省对比的具体数字]
>
> Side-by-side comparison: canpayinsights.ca/compare-provinces

### 模板 D：「最低工资 / 低收入预算」类

> Full-time minimum wage in [province] ($X/hr) nets about **$X/month** after deductions. [预算建议]
>
> We just published take-home data for all 13 provinces' minimum wages: canpayinsights.ca/blog/minimum-wage-take-home-pay-canada-2026

### 模板 E：新移民「IT 工资在加拿大什么水平」

> [回答水平判断] For reference, $X in [province] is about $X/month after tax — against [city] rent of ~$X that's [评估].
>
> Newcomer guide + calculator: canpayinsights.ca/salary-after-tax-canada

## 数据弹药库

- 351 个薪资页：`canpayinsights.ca/{金额}-after-tax-{省slug}`（35000–200000，省 slug：ontario/bc/alberta/quebec/manitoba/saskatchewan/nova-scotia/new-brunswick/newfoundland/pei/yukon/northwest-territories/nunavut）
- 最低工资研究：`/blog/minimum-wage-take-home-pay-canada-2026`（新数据帖，适合 minimum wage 类讨论直接引用）
- 省对比：`/compare-provinces`
- 法语（r/Quebec 等）：`/fr/{金额}-apres-impot-quebec`

## 追踪

在本文件底部记录：日期 | 帖子链接 | 用的模板 | 是否带链接 | 结果（赞数/是否被删/带来访问）。每周看 Vercel Analytics 的 referrer 验证效果。
