-- ==========================================
-- 自动内容系统数据库结构
-- ==========================================

-- 文章主题池（循环使用）
CREATE TABLE article_topics (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'tax', 'salary', 'province', 'tips', 'news'
  topic_template TEXT NOT NULL, -- 主题模板，如 "{province}省{year}年最低工资调整"
  target_keywords TEXT[], -- SEO 目标关键词数组
  content_outline JSONB, -- 文章结构大纲
  priority INTEGER DEFAULT 5, -- 1-10，数字越大优先级越高
  last_published_at TIMESTAMP WITH TIME ZONE,
  publish_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 已发布的文章
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL, -- URL 友好的标识，如 "ontario-tax-guide-2025"
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  
  -- 内容
  content JSONB NOT NULL, -- 结构化内容，包含 blocks
  excerpt TEXT, -- 摘要（用于列表页和 meta description）
  
  -- SEO
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  keywords TEXT[],
  canonical_url VARCHAR(500),
  
  -- 分类和标签
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  province VARCHAR(50), -- 如果是省份相关内容
  
  -- 互动元素
  embedded_calculator JSONB, -- 嵌入的计算器配置
  related_articles UUID[], -- 相关文章 ID
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  calculator_clicks INTEGER DEFAULT 0, -- 计算器点击次数（转化追踪）
  
  -- 生成信息
  ai_model VARCHAR(50), -- 'gemini-2.0-flash' 或 'grok'
  generation_prompt TEXT, -- 使用的 prompt
  source_urls TEXT[], -- 参考来源
  
  -- 状态
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文章生成日志（用于调试和监控）
CREATE TABLE article_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id INTEGER REFERENCES article_topics(id),
  article_id UUID REFERENCES articles(id),
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'skipped'
  error_message TEXT,
  generation_time_ms INTEGER,
  ai_response_tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_province ON articles(province);
CREATE INDEX idx_article_topics_active ON article_topics(is_active);

-- 设置 RLS（行级安全）
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_topics ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布文章
CREATE POLICY "Allow public read published articles" 
  ON articles FOR SELECT 
  USING (status = 'published');

-- 公开读取主题池
CREATE POLICY "Allow public read topics" 
  ON article_topics FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- 只允许服务角色写入（Edge Function）
CREATE POLICY "Allow service role insert articles"
  ON articles FOR INSERT 
  TO service_role 
  WITH CHECK (true);

CREATE POLICY "Allow service role update articles"
  ON articles FOR UPDATE 
  TO service_role 
  USING (true);

-- ==========================================
-- 初始化主题池数据（50+ 个主题，可循环使用）
-- ==========================================

INSERT INTO article_topics (category, topic_template, target_keywords, content_outline, priority) VALUES
-- 税务类 (Tax Guides)
('tax', '{province}省{year}年税率完全指南：实际到手工资计算器', 
 ARRAY['{province} tax rate {year}', '{province} salary calculator', 'take home pay {province}'], 
 '{"sections": ["税率概览", "联邦税计算", "省税计算", "CPP和EI扣除", "实际案例分析", "省税技巧"]}', 10),

('tax', '加拿大{year}年CPP和EI扣除详解：影响你工资的隐藏成本', 
 ARRAY['cpp ei deduction {year}', 'canada pension plan contribution', 'employment insurance deduction'], 
 '{"sections": ["CPP是什么", "CPP计算方式", "EI是什么", "EI计算方式", "实际例子", "如何优化"]}', 9),

('tax', '{year}年加拿大新移民税务指南：第一次报税必看', 
 ARRAY['newcomer tax guide canada', 'first tax return canada', 'new immigrant taxes'], 
 '{"sections": ["税务居民身份", "需要报哪些税", "可抵扣项目", "报税截止日期", "常见错误", "实用工具"]}', 10),

-- 薪资对比类 (Salary Comparisons)
('salary', '年薪${amount}在{province}税后实际收入：详细计算 breakdown', 
 ARRAY['{amount} salary after tax {province}', '{amount}k take home pay {province}'], 
 '{"sections": ["年收入概览", "联邦税扣除", "省税扣除", "CPP/EI扣除", "税后净收入", "月度预算建议"]}', 9),

('salary', '{year}年加拿大各省最低工资对比：哪里生活质量最高？', 
 ARRAY['minimum wage canada {year} by province', 'minimum wage comparison canada'], 
 '{"sections": ["各省最低工资一览", "生活成本对比", "实际购买力分析", "最佳省份推荐"]}', 8),

('salary', '{province} vs {compare_province}：同样的工资哪里到手更多？', 
 ARRAY['{province} vs {compare_province} tax', 'best province for salary canada'], 
 '{"sections": ["两省税率对比", "生活成本差异", "实际案例分析", "迁移建议"]}', 9),

-- 省份专题
('province', '在{province}省生活：{year}年完整财务指南', 
 ARRAY['cost of living {province}', '{province} salary guide'], 
 '{"sections": ["平均工资水平", "主要城市对比", "住房成本", "税务优势", "省钱技巧"]}', 7),

('province', '{province}省加班费计算规则：1.5倍还是2倍？', 
 ARRAY['overtime pay {province}', 'overtime rules {province}'], 
 '{"sections": ["每日加班阈值", "每周加班阈值", "计算方式", "实际例子", "维权建议"]}', 8),

-- 实用技巧
('tips', '加拿大打工人{year}年省税技巧：合法减少{amount}+税款', 
 ARRAY['tax saving tips canada {year}', 'reduce taxes canada'], 
 '{"sections": ["RRSP策略", "TFSA优势", "FHSA使用", "其他抵扣", "行动清单"]}', 9),

('tips', 'Remote Work 税务指南：跨省工作如何计算省税？', 
 ARRAY['remote work tax canada', 'work from home tax deduction'], 
 '{"sections": ["税务居民规则", "跨省工作场景", "雇主演算税", "自雇税务", "优化建议"]}', 7),

('tips', '加拿大工资单解读：每项扣除都代表什么？', 
 ARRAY['understanding canadian pay stub', 'payroll deductions explained'], 
 '{"sections": ["工资单结构", "每项扣除说明", "Year-to-Date含义", "常见疑问"]}', 8),

-- 新闻动态（需要结合时事）
('news', '{province}省{year}年预算案解析：对打工人的影响', 
 ARRAY['{province} budget {year}', '{province} tax changes {year}'], 
 '{"sections": ["主要变化", "税率调整", "福利变化", "对你的影响", "应对建议"]}', 10),

('news', '加拿大{year}年最低工资上调：你需要知道的', 
 ARRAY['minimum wage increase canada {year}'], 
 '{"sections": ["各省调整一览", "生效日期", "实际影响", "历史趋势"]}', 9);

-- 添加更多主题（循环使用）
INSERT INTO article_topics (category, topic_template, target_keywords, content_outline, priority) VALUES
('tax', '自雇人士税务指南：如何计算季度预缴税？', ARRAY['self employed tax canada', 'quarterly tax payments'], '{"sections": ["自雇税务基础", "收入计算", "支出抵扣", "季度缴税", "工具推荐"]}', 8),
('salary', '科技行业薪资报告：{province}省程序员实际收入', ARRAY['software engineer salary {province}', 'tech salary canada'], '{"sections": ["行业平均", "经验等级对比", "公司规模影响", "谈判技巧"]}', 7),
('tips', 'TFSA vs RRSP：{year}年加拿大人该如何选择？', ARRAY['tfsa vs rrsp', 'which is better tfsa or rrsp'], '{"sections": ["基础概念", "适用场景", "收入考量", "组合策略"]}', 9),
('province', '{province}省最佳雇主福利对比：除了工资还有什么？', ARRAY['employee benefits {province}', 'best employers {province}'], '{"sections": ["常见福利", "健康保险", "退休计划", "其他津贴"]}', 6),
('tax', '投资收益税务指南：股息、利息、资本增值怎么算？', ARRAY['investment tax canada', 'capital gains tax'], '{"sections": ["股息收入", "利息收入", "资本增值", "税率计算"]}', 7);

-- 总计 18 个主题模板，可以循环使用并变换参数
