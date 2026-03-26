// Supabase Edge Function - 自动文章生成
// 部署: supabase functions deploy auto-generate
// 定时任务: supabase functions cron create auto-generate --schedule '0 8 * * *'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gemini API Key (从环境变量获取)
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

// 省份列表
const PROVINCES = [
  'Ontario', 'British Columbia', 'Alberta', 'Quebec', 
  'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick',
  'Newfoundland and Labrador', 'Prince Edward Island'
];

// 文章主题模板
const TOPICS = [
  {
    category: 'tax',
    template: '{province}省{year}年税务变化：影响你的工资单',
    keywords: ['tax changes', 'payroll deductions', '{province} tax'],
  },
  {
    category: 'salary',
    template: '年薪{amount}在{province}的真实购买力分析',
    keywords: ['salary buying power', 'cost of living', '{province}'],
  },
  {
    category: 'tips',
    template: '{year}年加拿大人必知的{count}个省税技巧',
    keywords: ['tax saving tips', 'canada tax', 'money saving'],
  },
  {
    category: 'province',
    template: '{province}省生活指南：新移民必看',
    keywords: ['newcomer guide', 'living in {province}', 'canada immigration'],
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting auto content generation...');

    // 随机选择主题
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const province = PROVINCES[Math.floor(Math.random() * PROVINCES.length)];
    const year = new Date().getFullYear();
    const amount = [50000, 60000, 75000, 80000, 100000][Math.floor(Math.random() * 5)];

    const title = topic.template
      .replace('{province}', province)
      .replace('{year}', year.toString())
      .replace('{amount}', amount.toString())
      .replace('{count}', '5');

    console.log('Generated title:', title);

    // 这里可以调用Gemini API生成内容
    // 暂时返回成功状态

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Article generation triggered',
        title,
        province,
        category: topic.category,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
