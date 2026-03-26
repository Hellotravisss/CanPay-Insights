// ==========================================
// 自动文章生成 Edge Function
// 部署到 Supabase: supabase functions deploy auto-generate
// 定时触发: supabase functions cron create auto-generate --schedule '0 8 * * *'
// ==========================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gemini API Key (从环境变量获取)
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GROK_API_KEY = Deno.env.get('GROK_API_KEY') || '';

// 省份列表
const PROVINCES = [
  'Ontario', 'British Columbia', 'Alberta', 'Quebec', 
  'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick',
  'Newfoundland and Labrador', 'Prince Edward Island'
];

// 收入档次
const SALARY_AMOUNTS = ['35000', '50000', '65000', '80000', '100000', '120000', '150000'];

// 生成 slug
const generateSlug = (title: string, province: string, date: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${base}-${province.toLowerCase()}-${date}`;
};

// 构建 Prompt
const buildPrompt = (topic: any): string => {
  const year = new Date().getFullYear();
  const province = PROVINCES[Math.floor(Math.random() * PROVINCES.length)];
  const salary = SALARY_AMOUNTS[Math.floor(Math.random() * SALARY_AMOUNTS.length)];
  const compareProvince = PROVINCES.find(p => p !== province) || 'British Columbia';
  
  let template = topic.topic_template
    .replace(/{year}/g, year.toString())
    .replace(/{province}/g, province)
    .replace(/{amount}/g, salary)
    .replace(/{compare_province}/g, compareProvince);
  
  const keywords = topic.target_keywords
    .map((k: string) => k.replace(/{province}/g, province.toLowerCase()).replace(/{year}/g, year.toString()))
    .join(', ');
  
  return `
请为 CanPay Insights (canpayinsights.ca) 撰写一篇高质量的文章。

主题：${template}
目标关键词：${keywords}

要求：
1. 使用简体中文撰写
2. 总字数 2000-3000 字
3. 使用 Markdown 格式
4. 包含具体数字和计算
5. 至少一个实际案例
6. 结尾有 CTA 引导使用计算器
7. 添加免责声明

大纲指引：
${JSON.stringify(topic.content_outline, null, 2)}

请直接输出文章内容，以 # 开头作为标题。
`;
};

// 调用 Gemini API
const callGemini = async (prompt: string): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          topP: 0.9,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// 解析生成的内容
const parseContent = (rawContent: string, topic: any) => {
  const lines = rawContent.split('\n');
  const title = lines.find(l => l.startsWith('# '))?.replace('# ', '').trim() || topic.topic_template;
  const subtitle = lines.find(l => l.startsWith('## '))?.replace('## ', '').trim() || '';
  
  // 提取前 160 字作为 excerpt
  const plainText = rawContent.replace(/[#*_`]/g, '').replace(/\n/g, ' ');
  const excerpt = plainText.substring(0, 160) + '...';
  
  // 提取关键词
  const keywords = topic.target_keywords.map((k: string) => 
    k.replace(/{\w+}/g, '').trim()
  ).filter(Boolean);
  
  return {
    title,
    subtitle,
    content: { blocks: rawContent },
    excerpt,
    keywords,
  };
};

// 主处理函数
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting auto content generation...');

    // 1. 获取一个未最近使用过的主题
    const { data: topics, error: topicError } = await supabase
      .from('article_topics')
      .select('*')
      .eq('is_active', true)
      .order('last_published_at', { ascending: true, nullsFirst: true })
      .order('priority', { ascending: false })
      .limit(1);

    if (topicError || !topics || topics.length === 0) {
      throw new Error('No available topics found');
    }

    const topic = topics[0];
    console.log(`📋 Selected topic: ${topic.topic_template}`);

    // 2. 记录开始生成
    const { data: logEntry } = await supabase
      .from('article_generation_logs')
      .insert({
        topic_id: topic.id,
        status: 'processing',
      })
      .select()
      .single();

    const startTime = Date.now();

    // 3. 生成内容
    const prompt = buildPrompt(topic);
    console.log('🤖 Calling Gemini API...');
    
    let rawContent: string;
    let aiModel = 'gemini-2.0-flash';
    
    try {
      rawContent = await callGemini(prompt);
    } catch (error) {
      console.error('Gemini failed, trying fallback:', error);
      // 如果 Gemini 失败，可以尝试 Grok 作为备选
      throw error;
    }

    const generationTime = Date.now() - startTime;
    console.log(`✅ Content generated in ${generationTime}ms`);

    // 4. 解析内容
    const parsed = parseContent(rawContent, topic);
    const year = new Date().getFullYear();
    const date = new Date().toISOString().split('T')[0];
    const province = parsed.keywords.find((k: string) => 
      PROVINCES.some(p => p.toLowerCase().includes(k))
    ) || 'Canada';

    // 5. 生成 slug
    const slug = generateSlug(parsed.title, province, date);

    // 6. 检查是否已存在相同 slug
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      // 更新日志
      await supabase
        .from('article_generation_logs')
        .update({
          status: 'skipped',
          error_message: 'Duplicate slug',
          generation_time_ms: generationTime,
        })
        .eq('id', logEntry.id);

      return new Response(
        JSON.stringify({ success: false, message: 'Article already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. 保存文章
    const { data: article, error: insertError } = await supabase
      .from('articles')
      .insert({
        slug,
        title: parsed.title,
        subtitle: parsed.subtitle,
        content: parsed.content,
        excerpt: parsed.excerpt,
        meta_title: parsed.title.substring(0, 70),
        meta_description: parsed.excerpt.substring(0, 160),
        keywords: parsed.keywords,
        category: topic.category,
        tags: [topic.category, province, year.toString()],
        province,
        embedded_calculator: {
          type: 'salary',
          defaultProvince: province,
        },
        ai_model: aiModel,
        generation_prompt: prompt,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 8. 更新主题记录
    await supabase
      .from('article_topics')
      .update({
        last_published_at: new Date().toISOString(),
        publish_count: topic.publish_count + 1,
      })
      .eq('id', topic.id);

    // 9. 更新日志
    await supabase
      .from('article_generation_logs')
      .update({
        article_id: article.id,
        status: 'success',
        generation_time_ms: generationTime,
      })
      .eq('id', logEntry.id);

    console.log(`✨ Article published: ${article.slug}`);

    return new Response(
      JSON.stringify({
        success: true,
        article: {
          id: article.id,
          slug: article.slug,
          title: article.title,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
