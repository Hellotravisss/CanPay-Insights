import React, { useEffect, useState } from 'react';
import { getArticleBySlug, allArticles, Article } from '../articles-data';
import SEO from '../../components/SEO';

interface ArticleViewProps {
  slug: string;
  onBack: () => void;
  onSelectArticle?: (slug: string) => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ slug, onBack, onSelectArticle }) => {
  const article = getArticleBySlug(slug);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | CanPay Insights`;
      window.scrollTo(0, 0);
    }
  }, [article]);

  const getShareUrl = () => {
    return `${window.location.origin}/blog/${slug}`;
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(article?.title || '');
    const description = encodeURIComponent(article?.excerpt || '');

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}&via=CanPayInsights`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
      email: `mailto:?subject=${title}&body=${description}%0A%0A${url}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h1>
          <p className="text-slate-500 mb-4">This article may have been removed or does not exist.</p>
          <button onClick={onBack} className="text-red-600 hover:underline font-medium">
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRelatedArticles = (): Article[] => {
    return allArticles
      .filter(a => a.id !== article.id && (a.category === article.category || a.province === article.province))
      .slice(0, 3);
  };

  const relatedArticles = getRelatedArticles();

  const categoryLabels: Record<string, string> = {
    tax: 'Tax Guides',
    salary: 'Salary Insights',
    province: 'Provincial Guides',
    tips: 'Money Tips',
    news: 'Latest News',
  };

  // Simple Markdown renderer
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let tableRows: string[][] = [];
    let inTable = false;
    let listItems: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    const flushTable = () => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(2);
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  {header.map((cell, i) => (
                    <th key={i} className="border border-slate-300 px-4 py-2 text-left font-bold text-sm">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border border-slate-300 px-4 py-2 text-sm">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListTag key={`list-${elements.length}`} className={`my-4 ${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-inside space-y-2 text-slate-600`}>
            {listItems.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|')) {
        if (!inTable) {
          flushList();
          inTable = true;
        }
        const cells = trimmed.split('|').filter(c => c.trim() !== '');
        if (!trimmed.includes('---')) {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable();
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(trimmed.substring(2));
        return;
      } else if (/^\d+\./.test(trimmed)) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listItems.push(trimmed.replace(/^\d+\.\s*/, ''));
        return;
      } else if (inList && trimmed === '') {
        flushList();
        return;
      }

      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={idx} className="text-3xl font-bold text-slate-900 mt-8 mb-4">{trimmed.substring(2)}</h1>);
      } else if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={idx} className="text-2xl font-bold text-slate-800 mt-8 mb-4 border-b border-slate-200 pb-2">{trimmed.substring(3)}</h2>);
      } else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={idx} className="text-xl font-bold text-slate-700 mt-6 mb-3">{trimmed.substring(4)}</h3>);
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
        flushList();
        elements.push(<p key={idx} className="my-4 text-slate-700"><strong>{trimmed.slice(2, -2)}</strong></p>);
      } else if (trimmed === '---') {
        flushList();
        elements.push(<hr key={idx} className="my-6 border-slate-200" />);
      } else if (trimmed !== '') {
        flushList();
        let text = trimmed;
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        elements.push(<p key={idx} className="my-4 text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />);
      }
    });

    flushList();
    flushTable();

    return elements;
  };

  const ShareButtons = () => {
    const shareOptions = [
      {
        name: 'Twitter',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
        platform: 'twitter',
        color: 'hover:bg-black hover:text-white',
      },
      {
        name: 'Facebook',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        ),
        platform: 'facebook',
        color: 'hover:bg-blue-600 hover:text-white',
      },
      {
        name: 'LinkedIn',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        ),
        platform: 'linkedin',
        color: 'hover:bg-blue-700 hover:text-white',
      },
      {
        name: 'WhatsApp',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        ),
        platform: 'whatsapp',
        color: 'hover:bg-green-500 hover:text-white',
      },
      {
        name: 'Reddit',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
        ),
        platform: 'reddit',
        color: 'hover:bg-orange-600 hover:text-white',
      },
      {
        name: 'Email',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        platform: 'email',
        color: 'hover:bg-gray-600 hover:text-white',
      },
    ];

    return (
      <div className="border-t border-b border-slate-200 py-6 my-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-slate-800">Share this article</h4>
            <p className="text-sm text-slate-500">Help others learn about Canadian taxes</p>
          </div>
          <div className="flex items-center gap-2">
            {shareOptions.map((option) => (
              <button
                key={option.platform}
                onClick={() => handleShare(option.platform)}
                className={`p-2.5 rounded-full bg-slate-100 text-slate-600 transition-all duration-200 ${option.color} hover:scale-110`}
                title={`Share on ${option.name}`}
                aria-label={`Share on ${option.name}`}
              >
                {option.icon}
              </button>
            ))}
            <button
              onClick={() => handleShare('copy')}
              className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 flex items-center gap-2 text-sm font-medium ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white'
              }`}
              title="Copy link"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CalculatorCTA = () => {
    const handleCalculatorClick = () => {
      window.location.href = window.location.origin + '/';
    };
    
    return (
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white my-8">
        <h3 className="text-xl font-bold mb-2">Calculate Your Take-Home Pay</h3>
        <p className="text-red-100 mb-4 text-sm">
          Enter your salary and province to see detailed tax breakdowns instantly.
        </p>
        <button
          onClick={handleCalculatorClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Use Free Calculator
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO 
        title={`${article.title} | CanPay Insights`}
        description={article.excerpt}
        keywords={`${article.category}, Canadian tax, ${article.province || 'Canada'}, salary guide, payroll`}
        canonicalUrl={`https://www.canpayinsights.ca/blog/${slug}`}
      />
      {/* Article Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <button onClick={onBack} className="hover:text-red-600">Tax Guides</button>
            <span>/</span>
            <span className="text-slate-800">{categoryLabels[article.category]}</span>
          </nav>

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full mb-4">
            {categoryLabels[article.category]}
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
              {formatDate(article.publishedAt)}
            </span>
            {article.province && (
              <span className="bg-slate-100 px-2 py-1 rounded">
                {article.province}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Featured Image */}
          {article.imageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Top CTA */}
          <CalculatorCTA />

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            {renderContent(article.content)}
          </div>

          {/* Share Buttons */}
          <ShareButtons />

          {/* Bottom CTA */}
          <CalculatorCTA />

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This content is based on publicly available information and general tax knowledge for reference only. Individual tax situations may vary. Please consult a qualified tax professional or accountant for personalized advice.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <button
                  key={related.id}
                  onClick={() => onSelectArticle ? onSelectArticle(related.slug) : window.location.href = `/blog/${related.slug}`}
                  className="text-left bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <span className="text-xs text-red-600 font-medium uppercase">
                    {categoryLabels[related.category]}
                  </span>
                  <h3 className="font-bold text-slate-800 mt-1 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {related.excerpt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View All Articles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
