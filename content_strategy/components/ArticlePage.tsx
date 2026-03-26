import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown'; // 需要安装: npm install react-markdown

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: { blocks: string };
  meta_title: string;
  meta_description: string;
  keywords: string[];
  category: string;
  tags: string[];
  province: string;
  embedded_calculator: any;
  published_at: string;
  view_count: number;
}

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    
    // 获取文章
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      console.error('Error fetching article:', error);
      setLoading(false);
      return;
    }

    setArticle(data);

    // 增加浏览量
    await supabase
      .from('articles')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id);

    // 获取相关文章
    const { data: related } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, category')
      .eq('status', 'published')
      .eq('category', data.category)
      .neq('id', data.id)
      .limit(3);

    setRelatedArticles(related || []);
    setLoading(false);

    // 更新页面标题
    document.title = `${data.meta_title || data.title} | CanPay Insights`;
  };

  // 嵌入计算器组件
  const EmbeddedCalculator: React.FC = () => {
    return (
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white my-8">
        <h3 className="text-xl font-bold mb-2">💰 立即计算你的税后收入</h3>
        <p className="text-red-100 mb-4 text-sm">
          输入你的年薪和省份，立即查看详细税务分析
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          使用免费计算器
        </Link>
      </div>
    );
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">文章未找到</h1>
          <p className="text-slate-500 mb-4">这篇文章可能已被删除或不存在</p>
          <Link to="/blog" className="text-red-600 hover:underline">
            返回文章列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Article Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-red-600">首页</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-red-600">财务指南</Link>
            <span>/</span>
            <span className="text-slate-800">{article.category}</span>
          </nav>

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full mb-4">
            {article.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-slate-600 mb-6">
              {article.subtitle}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(article.published_at).toLocaleDateString('zh-CN')}
            </span>
            {article.province && (
              <span className="bg-slate-100 px-2 py-1 rounded">
                📍 {article.province}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.view_count} 阅读
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享
            </button>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Embedded Calculator CTA (Top) */}
          <EmbeddedCalculator />

          {/* Markdown Content */}
          <div className="prose prose-slate prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-slate-900 mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 border-b border-slate-200 pb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-slate-700 mt-6 mb-3">{children}</h3>,
                p: ({ children }) => <p className="text-slate-600 leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 text-slate-600 mb-4">{children}</ol>,
                li: ({ children }) => <li className="ml-4">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border-collapse border border-slate-300">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-slate-100">{children}</thead>,
                th: ({ children }) => <th className="border border-slate-300 px-4 py-2 text-left font-bold">{children}</th>,
                td: ({ children }) => <td className="border border-slate-300 px-4 py-2">{children}</td>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-red-500 pl-4 italic text-slate-600 my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {article.content.blocks}
            </ReactMarkdown>
          </div>

          {/* Embedded Calculator CTA (Bottom) */}
          <EmbeddedCalculator />

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <p className="text-sm text-yellow-800">
              <strong>免责声明：</strong>
              本文内容基于公开信息和一般性税务知识，仅供参考。个人税务情况可能因具体 circumstances 而异，建议咨询专业税务顾问或会计师获取个性化建议。
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <span className="text-xs text-red-600 font-medium uppercase">
                    {related.category}
                  </span>
                  <h3 className="font-bold text-slate-800 mt-1 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            查看所有文章
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
