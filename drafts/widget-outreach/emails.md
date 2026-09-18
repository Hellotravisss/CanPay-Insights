# Widget 外联 · 邮件

发件地址用 **info@canpayinsights.ca**（域名已配 Google 邮箱，SPF 正常）。发件域名和被推荐的网站一致，
收件人一眼能核实你是谁；用 gmail/me.com 发，回复率会明显变差。

每封信只改方括号里的三处：`[页面标题]`、`[那一页的读者卡在哪]`、`[称呼]`。
这三处在 `targets.md` 里每一行都已经替你写好了，照抄即可。
**不要群发、不要密送。** 一封一封发，每天 8–10 封，这样既不会被 Google 判成批量邮件，也符合下面的法律条件。

---

## 法律条件（CASL，2026-09-17 按 laws-lois.justice.gc.ca 现行条文核实）

可以不经对方同意发这封信，前提是**三条同时成立**（法案第 10(9)(b) 条）：

1. 这个邮箱是对方**自己公开刊登**在网站上的；
2. 刊登处**没有**写「请勿发送推销邮件」之类的话；
3. 信的内容与收件人的**职务相关**（给负责网站内容的人推荐一个网页工具，成立）。

所以：`targets.md` 里只有「在对方网站上亲眼看到」的邮箱。**没有邮箱、只有联系表单的那几家，走表单，不要去猜地址。**

每封信必须带（法案第 6(2) 条 + 条例 SOR/2012-36 第 2 条）：发件人姓名、**邮寄地址**、一种联系方式、退订办法。
下面的签名块已经包含这四样。对方回信说不要再发，**10 个工作日内**必须停（第 11(3) 条）——直接在 `targets.md` 那一行标 `STOP`。

> ⚠️ 签名里的 `{{邮寄地址}}` 需要你填一次。可以是家庭地址，也可以是邮局信箱；法律只要求能寄到。

---

## 签名块（每封都带）

```
Travis Zhang
CanPay Insights · canpayinsights.ca
{{邮寄地址}}, Vancouver, BC
info@canpayinsights.ca

Not useful? Reply "no thanks" and I won't write again.
```

---

## 第 1 封 · 按对象分五版

### A. 移民安置机构 / 新移民服务

**主题：** `paycheque question on your site`

```
Hi [称呼],

Your page "[页面标题]" explains Canadian pay to people who have never seen
a Canadian pay stub. The question it can't answer is the one they ask next:
"so what will I actually get?"

I built a calculator that answers it — gross pay in, take-home out, for every
province and territory, 2026 rates. It runs in ten languages, including
Punjabi, Hindi, Tagalog, Chinese, Ukrainian and Spanish, so a client can use
it in the language they think about money in.

It embeds with one line of HTML, it's free, and it has no ads or signup:
https://canpayinsights.ca/widget

Before each release it's checked against the payroll deduction tables the CRA
publishes for employers — a bit over 10,000 rows.

Would it be useful on that page?
```

### B. 新移民 / 移民资讯博客与媒体

**主题：** `your salary guide`

```
Hi [称呼],

"[页面标题]" quotes salaries before tax. Most of the readers deciding whether
to move are trying to work out what's left after it — and [那一页的读者卡在哪].

I run a free take-home pay calculator for Canada (all 13 provinces and
territories, 2026 rates, checked against the CRA's payroll tables). There's
an embeddable version you can drop into an article with one line of HTML,
and you can preset the province and the language — ten of them:
https://canpayinsights.ca/widget

No ads, no signup, nothing to pay. Worth adding to that guide?
```

### C. 求职网站 / 招聘板

**主题：** `hourly vs take-home`

```
Hi [称呼],

Your listings show an hourly rate or a salary. The candidate is doing a
different sum in their head: what lands in the account every two weeks.

I built a Canadian take-home calculator with a free embeddable version —
one iframe, preset to your province, 2026 federal and provincial tax plus
CPP and EI. It would sit naturally on "[页面标题]".
https://canpayinsights.ca/widget

It's checked against the CRA's payroll deduction tables before every release,
and there are no ads or signup. If you'd rather have it in your own colours
with your name on it, I can do that too.

Would either be useful?
```

### D. 高校就业中心 / 国际学生办公室

**主题：** `student paycheque tool`

```
Hi [称呼],

"[页面标题]" tells international students what they're allowed to earn.
The part they tend to get wrong is how much of it they keep — a first
Canadian pay stub with CPP and EI on it is a surprise to most of them.

I built a free take-home pay calculator for Canada: hourly or annual pay in,
net pay out, 2026 rates, every province. It embeds in a page with one line of
HTML and runs in ten languages, including Chinese, Hindi, Punjabi, Korean and
Vietnamese.
https://canpayinsights.ca/widget

No ads, no signup, no cookies, and nothing that identifies a student. Would it fit on that page?
```

### E. 个人理财博客 / 工会与劳工组织 / 薪资教育

**主题：** `calculator for your post`

```
Hi [称呼],

In "[页面标题]" you walk through deductions by hand. Readers usually want to
plug in their own number right after — [那一页的读者卡在哪].

I maintain a free Canadian take-home pay calculator with an embeddable
version: one line of HTML, 2026 rates, all provinces, Quebec handled
separately (QPP, QPIP, the lower EI rate).
https://canpayinsights.ca/widget

The engine is compared with the CRA T4032 tables and Revenu Québec's
source-deduction table before every release — about 10,000 rows. No ads,
no signup.

Want to try it in that post?
```

### F. 法语版（魁北克机构）

**主题：** `question sur la paie nette`

```
Bonjour [称呼],

Votre page « [页面标题] » explique la paie au Canada. La question qui suit
est toujours la même : « combien vais-je réellement recevoir ? »

J'ai conçu un calculateur gratuit qui y répond : salaire brut, paie nette,
taux 2026, avec le RRQ, le RQAP et le taux d'AE réduit du Québec. Il
s'intègre à une page avec une seule ligne de HTML, en français par défaut :
https://canpayinsights.ca/widget

Il est vérifié avant chaque mise à jour contre la table de retenues de
Revenu Québec et celles de l'ARC. Aucune publicité, aucune inscription.

Est-ce que ce serait utile sur cette page ?
```

Signature en français :

```
Travis Zhang
CanPay Insights · canpayinsights.ca
{{邮寄地址}}, Vancouver (C.-B.)
info@canpayinsights.ca

Pas utile ? Répondez « non merci » et je ne vous écrirai plus.
```

---

## 第 2 封 · 第 5 个工作日，没回才发

给一个新东西，不写「跟进一下」。这封送的是**已经替对方配好的代码**，对方复制粘贴就能用。

**主题：** 直接回复第 1 封（同一线程）

```
Hi [称呼],

In case it saves you a step — this is the snippet already set up for
[机构名]: [省份] by default, in [语言].

<iframe src="https://canpayinsights.ca/embed?province=[XX]&lang=[xx]"
  width="100%" height="560" loading="lazy"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:420px"
  title="Canadian Take-Home Pay Calculator"></iframe>
<p style="font-size:12px;margin-top:4px">
  <a href="https://canpayinsights.ca/">Canadian take-home pay calculator</a>
  by CanPay Insights
</p>

Paste it anywhere in the page body. If your CMS strips iframes, tell me
which one and I'll send a version that works with it.
```

## 第 3 封 · 第 12 个工作日，最后一封

```
Hi [称呼],

Last note from me on this. If a calculator isn't right for "[页面标题]",
a plain link from your resources list does the same job for the reader.

Either way, thanks for the work you do for [他们服务的人群].
```

发完这封就停。三封没回 = 在 `targets.md` 标 `DONE`，不再联系。

---

## 对方回信后

| 对方说 | 你回 |
| --- | --- |
| 「好，怎么装？」 | 发第 2 封里那段已配好的代码 |
| 「能不能去掉你们的署名 / 换成我们的颜色？」 | **这是付费线索。** 回：可以做白标版，问对方月访问量，然后来找我报价 |
| 「我们不放第三方工具」 | 问能不能在资源列表里放一个链接（外链本身就有 SEO 价值） |
| 「不用了」 | 回一句谢谢，标 `STOP` |

## 怎么知道有人装了

装上之后不需要对方告诉你：widget 每次计算都会记录 `source='widget'` 和所在域名 `embed_host`。
数据室里能看到是哪个站、每天多少次。目前只有 3 条，全部来自我们自己的预览页——**基线是零**，
之后出现的任何一个外部域名，都是这批邮件带来的。
