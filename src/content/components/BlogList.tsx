import React, { useState, useEffect } from 'react';
import { allArticles, Article } from '../articles-data';

interface BlogListProps {
  onSelectArticle: (slug: string) => void;
}

const categories = [
  { id: 'all', label: 'All Articles', color: 'bg-slate-600' },
  { id: 'tax', label: 'Tax Guides', color: 'bg-red-600' },
  { id: 'salary', label: 'Salary Insights', color: 'bg-blue-600' },
  { id: 'province', label: 'Provincial Guides', color: 'bg-green-600' },
  { id: 'tips', label: 'Money Tips', color: 'bg-amber-600' },
];

const BlogList: React.FC<BlogListProps> = ({ onSelectArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(allArticles);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredArticles(allArticles);
    } else {
      setFilteredArticles(allArticles.filter(a => a.category === selectedCategory));
    }
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      <div className="bg-gradient-to-br from-red-600 to-red-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">CanPay Tax Guides</h1>
          </div>
          <p className="text-red-100 max-w-2xl">
            Expert guides on Canadian taxes, salaries, and personal finance. Updated regularly to help you make smarter financial decisions.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => onSelectArticle(article.slug)}
              className="group text-left bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
            >
              {/* Article Image */}
              {article.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-5">
                {/* Category Badge */}
                <span className={`inline-block px-2 py-1 ${getCategoryColor(article.category)} text-white text-xs font-medium rounded mb-2`}>
                  {getCategoryLabel(article.category)}
                </span>

                {/* Title */}
                <h2 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {article.readTime} min read
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-800 text-white py-12 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Want More Precise Calculations?</h2>
          <p className="text-slate-300 mb-6">
            Use the CanPay Insights calculator to get personalized tax analysis and salary projections based on your specific situation.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculate My Salary
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogList;
