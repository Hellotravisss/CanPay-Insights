# 🤖 AI 内容生成 Prompt 模板

## 系统 Prompt (System Prompt)

```
你是一个专业的加拿大财务内容写手，专门为 CanPay Insights (canpayinsights.ca) 撰写高质量的文章。

你的写作风格：
- 专业但易懂，避免过度学术化
- 数据驱动，使用具体数字
- 实用导向，读者能立即应用
- 对加拿大税务和工资体系非常了解
- 使用简体中文（目标读者是新移民和华人打工者）

文章结构要求：
1. 必须有 H1 标题
2. 使用 H2 分隔主要章节
3. 使用 H3 分隔子章节
4. 关键数据用列表呈现
5. 至少包含一个实际计算案例
6. 结尾有 "立即计算你的工资" CTA
7. 添加 "免责声明"

SEO 要求：
- 自然融入目标关键词
- 使用相关长尾词
- 包含省份名称多次
```

## 文章生成 Prompt 模板

### 模板 1: 省份税率指南

```
请为 CanPay Insights 撰写一篇关于 {province} 省 {year} 年税率的完整指南。

目标关键词：{target_keywords}

文章要求：

## 1. 标题和简介
- 主标题包含 "{province}省", "{year}年", "税率"
- 副标题突出实用性
- 简介：为什么这篇文章重要，读者能得到什么

## 2. {province}省税率概览
- 联邦税阶梯（5个等级）
- {province}省税阶梯（列出所有等级）
- 合并边际税率图表（用表格呈现）

## 3. 实际案例分析
提供 3 个不同收入水平的详细计算：
- 低收入：$35,000/年（接近最低工资）
- 中等收入：$65,000/年（平均工资）
- 高收入：$120,000/年（专业人士）

每个案例包含：
- 年收入
- 联邦税扣除
- 省税扣除
- CPP扣除（2025年标准）
- EI扣除（2025年标准）
- 税后净收入
- 实际税率

## 4. 与其他省份对比
简单对比 2-3 个相近省份，突出 {province} 的特点

## 5. 省税技巧（3-5条实用建议）
- RRSP
- TFSA
- 其他抵扣

## 6. 常见问题 FAQ
5 个常见问题及答案

## 7. CTA
引导读者使用 CanPay Insights 计算器

## 格式要求：
- 使用 Markdown 格式
- 重要数字加粗
- 使用表格呈现对比数据
- 总字数：2000-3000 字

请在文章底部添加：
---
*免责声明：本文基于{year}年加拿大税务局(CRA)公布的税率，仅供一般参考。个人税务情况可能有所不同，请咨询专业税务顾问获取个性化建议。*
```

### 模板 2: 薪资对比文章

```
请撰写一篇关于 "年薪${amount}在{province}税后实际收入" 的详细分析文章。

目标关键词：{target_keywords}

文章结构：

## 1. 开篇
- {amount}年薪在{province}是什么水平
-  gross vs net 的差距有多大（制造悬念）

## 2. 详细计算过程
一步步展示：
- 步骤1：年收入
- 步骤2：扣除联邦税（展示计算）
- 步骤3：扣除省税（展示计算）
- 步骤4：扣除CPP（2025年：收入超过$3,500部分 × 5.95%，最高$4,034）
- 步骤5：扣除EI（2025年：收入 × 1.64%，最高$1,077）
- 最终结果：税后收入

## 3. 月度预算分析
将税后收入分解为月度：
- 月净收入
- 主要支出建议（住房、食物、交通、储蓄）
- 可自由支配金额

## 4. 与加拿大平均水平对比
- 全国平均工资
- {province}省平均工资
- 这个收入的购买力水平

## 5. 同类收入对比
对比其他城市：
- 在多伦多税后多少
- 在温哥华税后多少
- 在卡尔加里税后多少

## 6. 提升收入建议
- 如何合法省税
- 职业发展建议
- 副业可能性

## 7. 立即计算
引导使用 CanPay Insights 计算器
```

### 模板 3: 实用技巧类

```
请撰写一篇关于 "{topic}" 的实用指南。

目标关键词：{target_keywords}

写作要求：
- 开门见山，立即给出价值
- 使用编号列表
- 每个建议包含 "是什么"、"为什么"、"怎么做"
- 提供具体数字（金额、百分比）
- 添加现实案例

文章结构：
1. 问题陈述（读者的痛点）
2. 解决方案总览
3. 详细技巧（5-8条）
4. 实施时间线
5. 常见错误
6. 额外资源
7. CTA
```

## Gemini API 调用示例

```typescript
const generateArticle = async (topic: ArticleTopic) => {
  const prompt = buildPrompt(topic);
  
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: SYSTEM_PROMPT },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          topP: 0.9
        }
      })
    }
  );
  
  const data = await response.json();
  return parseArticleContent(data);
};
```

## Grok API 调用示例

```typescript
const generateArticleWithGrok = async (topic: ArticleTopic) => {
  const prompt = buildPrompt(topic);
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + GROK_API_KEY
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

## 内容后处理

生成后需要：
1. ✅ 提取 H1 作为文章标题
2. ✅ 提取前 160 字符作为 meta description
3. ✅ 生成 slug（URL 友好格式）
4. ✅ 提取关键词
5. ✅ 提取省份信息
6. ✅ 标记嵌入计算器的参数
