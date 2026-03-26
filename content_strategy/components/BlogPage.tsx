import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // 或者使用你的路由库
import { supabase } from '../../lib/supabase';

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  province: string;
  published_at: string;
  view_count: number;
}

const BlogPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: '全部', color: 'bg-slate-600' },
    { id: 'tax', label: '税务指南', color: 'bg-red-600' },
    { id: 'salary', label: '薪资对比', color: 'bg-blue-600' },
    { id: 'province', label: '省份专题', color: 'bg-green-600' },
    { id: 'tips', label: '实用技巧', color: 'bg-amber-600' },
    { id: 'news', label: '最新动态', color: 'bg-purple-600' },
  ];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from('articles')
      .select('id, slug, title, subtitle, excerpt, category, province, published_at, view_count')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching articles:', error);
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'bg-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">CanPay 财务指南</h1>
          </div>
          <p className="text-red-100 text-lg max-w-2xl">
            加拿大税务、薪资、省钱的实用指南。每日更新，帮你做出更明智的财务决策。
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? `${cat.color} text-white shadow-md`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>暂无文章，敬请期待...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {/* Card Header with Category */}
                <div className={`${getCategoryColor(article.category)} px-4 py-2`}>
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    {getCategoryLabel(article.category)}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {article.title}
                  </h2>
                  
                  {article.subtitle && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                      {article.subtitle}
                    </p>
                  )}

                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(article.published_at)}
                      </span>
                      {article.province && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded">
                          {article.province}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {article.view_count}
                    </span>
                  </div>
                </div>

                {/* Read More */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-red-50 transition-colors">
                  <span className="text-sm font-medium text-red-600">阅读全文</span>
                  <svg className="w-4 h-4 text-red-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-slate-800 text-white py-12 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">想要更精准的计算？</h2>
          <p className="text-slate-300 mb-6">
            使用 CanPay Insights 计算器，输入你的具体情况，获取个性化的税务分析和薪资预测。
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            立即计算我的工资
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
