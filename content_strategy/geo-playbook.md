# GEO / AEO Playbook — 让 AI 主动推荐你

GEO = Generative Engine Optimization(也叫 AEO,Answer Engine Optimization)。
目标:当有人问 ChatGPT / Perplexity / Gemini / Google AI Overviews / Claude
"加拿大工资税后怎么算 / 哪个计算器好用"时,**AI 引用你、给你的链接、推荐你的品牌**。

这份文档既是 **CanPay 的执行清单**,也是将来**收费帮别人做 GEO 的标准流程(SOP)**。

---

## 一、心智模型:AI 怎么挑"推荐谁"(两条路)

| 路径 | 谁 | 怎么赢 |
| --- | --- | --- |
| **检索式(实时联网)** | ChatGPT search、Perplexity、Gemini、Google AI Overviews、Copilot | 提问时实时搜网 → 从搜到的页面挑几条引用。= **经典 SEO 的延伸**:能被搜到 + 内容能被"摘取" + 来源可信 |
| **记忆式(训练数据)** | 模型"脑子里记得"的品牌 | 来自训练语料里**反复出现的提及**(Reddit、Wikipedia、新闻、其他站)。慢,但护城河深 |

> **两条路的共同点:全网有多少地方在引用、提到你。** 这是 GEO 的核心,和"外链"是同一个底层逻辑。

---

## 二、有效杠杆(按权重排,标注证据强度)

1. **第三方语料里被引用/提到** 🔑(强)— 80% 的胜负。被 Reddit、Wikipedia、清单文、新闻提到 = 既进检索又进训练。
2. **原创数据 + 统计 + 引用** 💎(强)— 带具体数字/统计/来源的内容,LLM 引用率高 ~30-40%(Princeton GEO 论文)。**这是 CanPay 的最大武器**。
3. **答案可被"摘取"的结构**(强)— 问题式标题、第一句直接给答案、表格/列表/FAQ。
4. **结构化数据 schema**(中)— Organization / Dataset / FAQPage / Article。
5. **实体/权威信号**(中)— Wikidata 条目、被"best X"清单收录、作者署名 E-E-A-T。
6. **新鲜 + 具体**(中)— 当年数字、明确实体名。
7. **AI 爬虫可抓**(基础)— 不拦 GPTBot / PerplexityBot / ClaudeBot / Google-Extended。
8. **llms.txt**(弱/投机)— 成本低、加了无害,别指望它救命。

> ⚠️ 没有"保证上 AI 推荐"这回事。AI 回答非确定性、还个性化。只有把上面做扎实,概率上升。任何承诺"保证"的人都在骗。

---

## 三、站内 SOP(技术 + 内容)

技术(一次性):
- [x] robots 允许并显式欢迎 AI 爬虫(GPTBot / OAI-SearchBot / PerplexityBot / ClaudeBot / Google-Extended / Applebot-Extended / CCBot)
- [x] `llms.txt`:站点说明书(品牌一句话 + 核心数据 + 关键 URL + 关键事实)
- [x] Organization schema(含 @id、logo、email、founder、knowsAbout)
- [x] Dataset schema(声明你的数据集 + CC-BY 许可,等于明示"可引用")
- [ ] 每篇文章 FAQPage / Article schema + `directAnswer`

内容(每页都做):
- [ ] **答案前置**:第一句就给数字("A $60,000 salary in Ontario takes home **$47,147** in 2026...")
- [ ] **问题式标题**:H2/H3 用人们问 AI 的原话
- [ ] **表格 / 列表**:把数据做成可摘取的结构
- [ ] **内链**:文章互链 + 链到计算器
- [ ] **原创数字**:用引擎算的真实数据,不要泛泛而谈

内容质量红线(GEO 和 AdSense 都看):
- ❌ 不要"规模化 AI 灌水"(几十篇泛泛的 "X salary guide" / 通用理财 tips,没有独家数据)→ Google 判 low value,AI 也不引用
- ✅ 宁可 20 篇有独家数据的精文,不要 50 篇 AI 味通稿

---

## 四、站外 SOP(真正的胜负手 = 被全网引用)

按 ROI 排:

1. **Reddit**(最高)— Google/OpenAI 都和 Reddit 有数据协议,LLM 疯狂引用 Reddit。
   - 在 r/PersonalFinanceCanada 用你的数据答题(见 [reddit-playbook.md](reddit-playbook.md))
   - 不硬广,用"$X 在安省到手 $Y"这种数据帮人,自然带出工具
2. **Wikidata 实体** — 建一个品牌实体条目(比 Wikipedia 容易,LLM 读 Wikidata)。
3. **被"best Canadian salary/tax calculator"清单收录** — 找这类文章的作者,请求加入。
4. **数据引用 outreach** — 你的原创数据当钩子(见 [outreach-playbook.md](outreach-playbook.md))。被博客/媒体引用 = 既是外链又是 AI 语料。
5. **结构化数据站收录** — 工具目录、Product Hunt 等。

---

## 五、怎么衡量"AI 有没有推荐我"

1. 建一个 **20-30 个真实问题的测试集**(英/中),例如:
   - "best take home pay calculator canada"
   - "how much is 60k after tax in ontario"
   - "加拿大工资税后计算器推荐"
2. **每月**在 ChatGPT / Perplexity / Gemini / Google AI Overviews / Claude 各问一遍。
3. 记录到追踪表:**有没有提到你 / 有没有给链接 / 和谁并列 / 排第几**。

| 月份 | 问题 | ChatGPT | Perplexity | Gemini | AI Overviews | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| | | 提到?链接? | | | | |

> 这张表既是你的 KPI,也是将来给客户看的"AI 可见度报告"。

---

## 六、把它做成可收费的服务

**交付流程**:审计 → 站内结构化改造 → 站外引用建设 → 月度 AI 可见度报告。

- **作品集**:CanPay = "把一个零权重的站做到被 ChatGPT/Perplexity 引用"的真实 case study。
- **定价**:一次性 audit 费 + 月度 retainer(引用建设 + 报告)。
- **差异化**:这行很新,能拿出真实"被 AI 推荐"案例的人很少 —— 趁红利期。

**给客户的 audit checklist** = 本文档第三、四节,逐项打分 + 给改造清单。

---

## 七、CanPay 当前进度(2026-06-20)

- [x] 站内技术:robots 欢迎 AI 爬虫、llms.txt、Organization + Dataset(CC-BY)schema
- [x] 内容精简:52 篇 → 20 篇(删掉 32 篇 AI 味"salary guide"+通用 tips)
- [x] 已有自发信号:ChatGPT 已开始带流量(说明检索式那条路已通)
- [ ] 内容:20 篇逐篇"答案前置 + 问题式标题 + FAQ schema"
- [ ] 站外:Reddit 数据答题 / Wikidata 实体 / 清单文收录 / 数据 outreach
- [ ] 建提示词测试集 + 月度追踪表
