# App Store 本地化文案 · CanPayInsights (6759822038)

> **2026-09-16 更正与状态。** 本文件初稿建议加简体中文、旁遮普语等 10 种语言,那是错的。
> 苹果官方表格(App Store Connect → App Store localizations)写明:**加拿大区只用
> 英语(加拿大)和法语(加拿大)两种语言做搜索索引**。中文、旁遮普语的文案不会让在加拿大
> App Store 搜索的人找到这个 App。
>
> **已经通过 App Store Connect API 写入 1.2.3 版本(待提交):**
> - en-CA 名称 `CanPay Insights: Paycheck` · 副标题 `Take-Home Pay & Tax 2026` · 新关键词 · 宣传语 · 更新说明
> - fr-CA 名称 `CanPay Insights : paie nette` · 副标题 `Salaire net et impôt 2026` · 关键词 · 描述 · 宣传语 · 更新说明 · 法语隐私政策链接
> - 宣传语同时写进了已上架的 1.2.2(此字段免审核,即时生效)
>
> 写入用的文案源在 scratchpad `asc/copy.py`;下面保留初稿内容仅供参考,**以 App Store Connect 里的实际值为准**。

---

为什么做这件事：App Store 的搜索**只用你提交的本地化文案**。现在语言栏只有 English，
所以在 App Store 里用法语搜 “calculateur de paie net”、用中文搜「加拿大工资计算器」的人
搜不到我们——尽管 App 本身支持 10 种语言。网页端最近的计算里 iOS 占 47%，
一个月约 1,350 个 iPhone 用户算了工资，下载只有 200。

## 怎么填（App Store Connect）

1. 打开 App Store Connect → CanPayInsights → 左侧「App Store」→ 当前版本。
2. 页面顶部语言下拉 →「添加语言」，逐个加下面列出的语言。
3. 每种语言填四个字段：**名称、副标题、关键词、描述**。关键词字段用户看不到，只影响搜索。
4. 截图可以全部沿用英文那套（苹果允许），有余力再做本地化截图。
5. 存盘后随下一个版本一起提交审核；纯文案改动通常几小时内通过。

**字数上限：** 名称 30 字符，副标题 30 字符，关键词 100 字符（含逗号），描述 4000 字符。
下面每条都已经数过，未超限。关键词用英文逗号分隔、不要空格（空格会占用配额）。

---

## 1. English（已有，建议替换副标题和关键词）

- **名称**：`CanPay Insights: Paycheck`（25）
- **副标题**：`Take-Home Pay & Tax 2026`（24）
  - 现在是 “Canadian Payroll Calculator”，和名称重复，浪费了一次匹配机会。
- **关键词**：`paycheck,takehome,salary,netpay,payroll,tax,CPP,EI,timesheet,hourly,wage,calculator,canada`（98）
  - 不要重复名称和副标题里已有的词，苹果会自动索引那些。

## 2. French (Canada) — 优先级最高

- **名称**：`CanPay : paie nette`（19）
- **副标题**：`Salaire net et impôt 2026`（25）
- **关键词**：`calculateur,paie,salaire,net,impot,retenues,RRQ,RQAP,assurance,emploi,horaire,feuille,temps`（97）
- **描述**：

```
Taux 2026, 13 provinces et territoires, le même moteur que canpayinsights.ca. Aucune inscription, aucune publicité.

CanPay Insights montre ce que vaut réellement une paie canadienne après l'impôt fédéral, l'impôt provincial, le RPC/RPC2 (RRQ/RQAP au Québec) et l'AE.

CE QU'IL FAIT
• Salaire annuel, taux horaire, ou une feuille de temps complète avec quarts, pauses, heures supplémentaires et primes
• Toutes les fréquences de paie : hebdomadaire, aux deux semaines, bimensuelle, mensuelle
• Cotisations REER, cotisations syndicales et autres retenues, traitées comme le fait l'ARC
• Québec : RRQ, RQAP, déduction pour travailleur, taux d'AE réduit
• Comparez deux provinces côte à côte

POURQUOI LUI FAIRE CONFIANCE
Le moteur est vérifié, avant chaque mise à jour, contre les tables de retenues que l'ARC publie pour les employeurs et contre la table de Revenu Québec — plus de 10 000 lignes. Si un chiffre s'écarte de quelques cents, la mise à jour est bloquée.

VIE PRIVÉE
Aucun compte requis. Vos chiffres restent sur votre appareil. Aucune publicité, aucun traceur.
```

## 3. Chinese (Simplified)

- **名称**：`CanPay 加拿大工资计算`（14）
- **副标题**：`2026 税后到手工资计算器`（15）
- **关键词**：`加拿大,工资,税后,到手,薪水,计算器,报税,扣税,时薪,工时,安省,BC,魁北克,移民`（约 60）
- **描述**：

```
2026 年税率,覆盖 13 个省和地区,与 canpayinsights.ca 使用同一套计算引擎。无需注册,没有广告。

CanPay Insights 告诉你一份加拿大工资在扣除联邦税、省税、CPP/CPP2(魁北克为 QPP/QPIP)和 EI 之后,实际到手多少。

功能
• 年薪、时薪,或完整的工时表:班次、休息、加班、班次补贴
• 所有发薪周期:每周、每两周、每半月、每月
• RRSP 供款、工会会费等扣除项,按 CRA 的算法处理
• 魁北克单独处理:QPP、QPIP、工作者扣除、较低的 EI 费率
• 两个省份并排对比,适合考虑搬省的人

为什么可信
每次更新之前,计算引擎都会与加拿大税务局面向雇主发布的扣税表、以及魁北克税务局的扣税表逐行比对,超过一万行。任何一个数字偏差超过几分钱,更新就会被拦下。

隐私
不需要账号,输入的金额留在你自己的设备上。没有广告,没有追踪。
```

## 4. Punjabi — 温哥华和多伦多最大的南亚语言之一

- **名称**：`CanPay ਤਨਖਾਹ ਕੈਲਕੁਲੇਟਰ`（21）
- **副标件**：`2026 ਟੈਕਸ ਤੋਂ ਬਾਅਦ ਤਨਖਾਹ`（23）
- **关键词**：`ਤਨਖਾਹ,ਕੈਲਕੁਲੇਟਰ,ਕੈਨੇਡਾ,ਟੈਕਸ,ਘੰਟਾ,ਕਮਾਈ,punjabi,paycheck,canada,salary,tax,hourly`（约 90）
- **描述**（保留英文段落在后，苹果允许混排；搜索主要看前 3 行和关键词）：

```
2026 ਦੀਆਂ ਦਰਾਂ, 13 ਸੂਬੇ ਅਤੇ ਖੇਤਰ, canpayinsights.ca ਵਾਲਾ ਹੀ ਇੰਜਣ। ਕੋਈ ਸਾਈਨ-ਅੱਪ ਨਹੀਂ, ਕੋਈ ਇਸ਼ਤਿਹਾਰ ਨਹੀਂ।

CanPay Insights ਦੱਸਦੀ ਹੈ ਕਿ ਫ਼ੈਡਰਲ ਟੈਕਸ, ਸੂਬਾਈ ਟੈਕਸ, CPP/CPP2 ਅਤੇ EI ਕੱਟਣ ਤੋਂ ਬਾਅਦ ਤੁਹਾਡੇ ਹੱਥ ਵਿੱਚ ਅਸਲ ਵਿੱਚ ਕਿੰਨਾ ਆਉਂਦਾ ਹੈ।

• ਸਾਲਾਨਾ ਤਨਖਾਹ, ਘੰਟਾ ਦਰ, ਜਾਂ ਪੂਰੀ ਟਾਈਮਸ਼ੀਟ — ਸ਼ਿਫ਼ਟ, ਬਰੇਕ, ਓਵਰਟਾਈਮ
• ਹਰ ਪੇਅ ਫ੍ਰੀਕੁਐਂਸੀ: ਹਫ਼ਤਾਵਾਰ, ਦੋ-ਹਫ਼ਤਾਵਾਰ, ਮਹੀਨਾਵਾਰ
• RRSP ਅਤੇ ਯੂਨੀਅਨ ਫ਼ੀਸ ਸਮੇਤ ਕਟੌਤੀਆਂ
• ਦੋ ਸੂਬਿਆਂ ਦੀ ਨਾਲੋ-ਨਾਲ ਤੁਲਨਾ

ਹਰ ਅੱਪਡੇਟ ਤੋਂ ਪਹਿਲਾਂ ਇੰਜਣ ਨੂੰ CRA ਦੀਆਂ ਸਰਕਾਰੀ ਕਟੌਤੀ ਸਾਰਣੀਆਂ ਨਾਲ 10,000 ਤੋਂ ਵੱਧ ਲਾਈਨਾਂ 'ਤੇ ਮਿਲਾਇਆ ਜਾਂਦਾ ਹੈ।
```

## 5. Spanish (Mexico) — App Store 的西语加拿大用户默认看这个

- **名称**：`CanPay: sueldo neto`（19）
- **副标题**：`Calculadora de nómina 2026`（26）
- **关键词**：`sueldo,neto,nomina,salario,impuestos,calculadora,canada,hora,quincenal,CPP,EI,tiempo`（92）

## 6. Hindi / 7. Tagalog / 8. Ukrainian / 9. Korean / 10. Vietnamese

这五种的名称和副标题（描述可先沿用英文，苹果允许）：

| 语言 | 名称 | 副标题 |
| --- | --- | --- |
| Hindi | `CanPay वेतन कैलकुलेटर` | `2026 टैक्स के बाद वेतन` |
| Tagalog（App Store 归在 English 下，跳过） | — | — |
| Ukrainian | `CanPay: зарплата нетто` | `Податки та виплати 2026` |
| Korean | `CanPay 캐나다 급여 계산기` | `2026 실수령액 계산` |
| Vietnamese | `CanPay: lương thực nhận` | `Tính thuế và lương 2026` |

> Tagalog 在 App Store 没有独立本地化位（菲律宾区默认英文），不用加。

---

## 顺序建议

先做 **French、Chinese (Simplified)、Punjabi** 这三种，它们对应网页端最大的三个非英语群体。
其余的等这三种跑出效果（App Store Connect 的「来源」报告里看「App Store 搜索」的变化）再补。

## 同时要改的一处

**副标题不要和名称重复。** 现在名称是 “CanPayInsights”、副标题是 “Canadian Payroll Calculator”，
而描述第一句已经说了同样的事。副标题是搜索权重第二高的字段，应该放名称里没有的词
（take-home、paycheck、2026）。
